import { useState } from 'react';
import { format, addMonths } from 'date-fns';
import { Phone, Mail, MapPin, Calendar, User, Activity, AlertTriangle, CreditCard, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Member, MembershipStatus } from '@/types/member';
import { AssignMembershipDrawer } from '@/components/membership/AssignMembershipDrawer';
import { MemberBillingCard } from '@/components/membership/MemberBillingCard';
import { MembershipFormData } from '@/types/membership';
import { useToast } from '@/hooks/use-toast';
import { useRBAC } from '@/hooks/useRBAC';
import { MeasurementRecorderDrawer } from './MeasurementRecorderDrawer';
import { ProgressCharts } from './ProgressCharts';
import { MeasurementHistory } from '@/types/member-progress';
import { mockMeasurementHistory, mockAttendanceRecords, mockProgressSummary } from '@/utils/mockData';
import { membershipService } from '@/services/membershipService';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface MemberProfileCardProps {
  member: Member;
}

const getMembershipStatusBadge = (status: MembershipStatus) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case 'expired':
      return <Badge variant="destructive">Expired</Badge>;
    case 'not-assigned':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Not Assigned</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

const getBMICategory = (bmi?: number) => {
  if (!bmi) return 'N/A';
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const formatGovernmentId = (type: string, number: string) => {
  switch (type) {
    case 'aadhaar':
      return `Aadhaar: ${number}`;
    case 'pan':
      return `PAN: ${number}`;
    case 'passport':
      return `Passport: ${number}`;
    case 'voter-id':
      return `Voter ID: ${number}`;
    default:
      return `${type}: ${number}`;
  }
};

export const MemberProfileCard = ({ member }: MemberProfileCardProps) => {
  const [assignMembershipOpen, setAssignMembershipOpen] = useState(false);
  const [showFreezeForm, setShowFreezeForm] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeDays, setFreezeDays] = useState<number | ''>('');
  const memberUserId = (member as any).userId ?? null;
  const [measurements, setMeasurements] = useState<MeasurementHistory[]>(
    mockMeasurementHistory.filter(m => m.memberId === member.id)
  );
  const { toast } = useToast();
  const { hasPermission } = useRBAC();
  const queryClient = useQueryClient();

  const progressSummary = mockProgressSummary[member.id];
  const attendanceRecords = mockAttendanceRecords.filter(a => a.memberId === member.id);

  // Rewards transactions for this member (by reference_id)
  const { data: creditTx = [] } = useQuery<any>({
    queryKey: ['member-credits', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('reference_id', member.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const computedPointsBalance = (creditTx as any[]).reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const [latestMembershipLocal, setLatestMembershipLocal] = useState<any | null>(null);
  // Latest membership for this member
  const { data: latestMembershipFetched } = useQuery<any>({
    queryKey: ['member-membership', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_memberships')
        .select('*')
        .eq('user_id', memberUserId)
        .order('start_date', { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data && data[0]) || null;
    },
    enabled: !!memberUserId
  });
  const latestMembership = latestMembershipLocal || latestMembershipFetched;

  // Pending freeze requests for latest membership (place after latestMembership is defined)
  const { data: pendingFreezes = [], refetch: refetchFreezes } = useQuery<any[]>({
    queryKey: ['member-freeze-requests', latestMembership?.id],
    queryFn: async () => {
      if (!latestMembership?.id) return [] as any[];
      const { data, error } = await supabase
        .from('membership_freeze_requests')
        .select('*')
        .eq('membership_id', latestMembership.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!latestMembership?.id,
  });

  // Latest invoice for this member
  const { data: latestInvoice } = useQuery<any>({
    queryKey: ['member-latest-invoice', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', member.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data && data[0]) || null;
    },
  });

  const remainingDays = (() => {
    try {
      const end = latestMembership?.end_date ? new Date(latestMembership.end_date) : null;
      if (!end) return null;
      const now = new Date();
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    } catch {
      return null;
    }
  })();

  const handleAssignMembership = async (data: MembershipFormData) => {
    try {
      // Fetch plan details to get plan name and price
      const plan = await membershipService.getPlanDetails(data.planId);

      // Compute pricing summary with GST (forward or reverse)
      const price = Number((plan as any).price || 0);
      const referralCode = data.promoCode?.trim();
      const referralDisc = referralCode ? Math.round(price * 0.1) : 0; // 10% referral
      const pctDisc = Math.round(price * ((data.discountPercent || 0) / 100));
      const flatDisc = Math.round(data.discountAmount || 0);
      const base = Math.max(0, price - referralDisc - pctDisc - flatDisc);
      const rate = data.gstEnabled ? ((data.gstRate || 0) / 100) : 0;
      let gstAmount = 0;
      let finalAmount = base;
      if (data.gstEnabled) {
        if (data.reverseGst && typeof data.totalInclGst === 'number' && data.totalInclGst > 0) {
          const incl = Math.round(data.totalInclGst);
          const baseFromIncl = Math.round(incl / (1 + rate));
          gstAmount = Math.max(0, incl - baseFromIncl);
          finalAmount = incl;
        } else {
          gstAmount = Math.round(base * rate);
          finalAmount = base + gstAmount;
        }
      }

      // Insert member_memberships record (per your schema)
      const startDateISO = data.startDate.toISOString().slice(0, 10); // date only
      const endDateISO = addMonths(data.startDate, (plan as any).duration_months || 0).toISOString().slice(0, 10);
      try {
        const { data: inserted, error: mmErr } = await supabase
          .from('member_memberships')
          .insert([
            {
              user_id: memberUserId, // may be null per schema
              plan_id: plan.id,
              start_date: startDateISO,
              end_date: endDateISO,
              payment_amount: finalAmount,
            }
          ])
          .select('*')
          .single();
        if (mmErr) throw mmErr;
        setLatestMembershipLocal(inserted);
      } catch (e: any) {
        console.error('member_memberships insert failed:', {
          message: e?.message,
          details: e?.details,
          hint: e?.hint,
          code: e?.code,
        });
      }

      // Update member row to reflect assigned plan and active status + referral code used
      const { error } = await supabase
        .from('members')
        .update({
          membership_status: 'active',
          membership_plan: plan.name,
        })
        .eq('id', member.id);

      if (error) throw error;

      // Create invoice matching your invoices schema (no need to refetch membership)
      try {
        const today = new Date();
        const due = new Date();
        due.setDate(today.getDate() + 7);
        const shortId = Math.random().toString(36).slice(2, 8).toUpperCase();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const invoiceNumber = `INV-${yyyy}${mm}${dd}-${shortId}`;

        const discountTotal = (referralDisc + pctDisc + flatDisc);
        const taxAmount = gstAmount;

        await supabase
          .from('invoices')
          .insert([
            {
              invoice_number: invoiceNumber,
              date: today.toISOString().slice(0, 10),
              due_date: due.toISOString().slice(0, 10),
              customer_id: member.id,
              customer_name: member.fullName,
              customer_email: member.email || null,
              subtotal: base,
              tax: taxAmount,
              discount: discountTotal,
              total: finalAmount,
            }
          ]);
      } catch (invErr: any) {
        console.error('Invoice creation failed:', {
          message: invErr?.message,
          details: invErr?.details,
          hint: invErr?.hint,
          code: invErr?.code,
        });
      }

      // Referral bonuses: use referrals and referral_bonuses
      try {
        const referralCode = data.promoCode?.trim();
        if (referralCode) {
          const { data: referral } = await supabase
            .from('referrals')
            .select('id, referrer_id, referred_id, membership_bonus_amount, status')
            .eq('referral_code', referralCode)
            .maybeSingle();
          const bonusAmount = Number(referral?.membership_bonus_amount ?? 2500);
          // credit referrer
          if (referral?.id && referral.referrer_id) {
            await supabase.from('referral_bonuses').insert([
              {
                referral_id: referral.id,
                user_id: referral.referrer_id,
                bonus_type: 'referral_membership',
                amount: bonusAmount,
                description: `Referral bonus for ${member.fullName} membership`,
              },
            ]);
          }
          // credit referred user if linked
          if (referral?.id && referral.referred_id) {
            await supabase.from('referral_bonuses').insert([
              {
                referral_id: referral.id,
                user_id: referral.referred_id,
                bonus_type: 'referral_membership',
                amount: bonusAmount,
                description: 'Referral bonus (referred member)',
              },
            ]);
          }
          // mark referral completed
          if (referral?.id) {
            await supabase
              .from('referrals')
              .update({ status: 'completed', completed_at: new Date().toISOString() })
              .eq('id', referral.id);
          }
        }
      } catch (refErr: any) {
        console.error('Referral bonus processing failed:', {
          message: refErr?.message,
          details: refErr?.details,
          hint: refErr?.hint,
          code: refErr?.code,
        });
      }

      // Invalidate member queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['members'] });
      await queryClient.invalidateQueries({ queryKey: ['members', member.id] });
      await queryClient.invalidateQueries({ queryKey: ['member-credits', member.id] });

      toast({
        title: 'Membership Assigned',
        description: `${plan.name} has been assigned to ${member.fullName}.`,
      });
      setAssignMembershipOpen(false);
    } catch (err: any) {
      console.error('Failed to assign membership:', err);
      toast({
        title: 'Failed to assign membership',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveMeasurement = (measurement: MeasurementHistory) => {
    setMeasurements(prev => [...prev, measurement]);
    console.log('Saving measurement:', measurement);
  };

  const latestMeasurement = measurements[measurements.length - 1];

  return (
    <div className="space-y-6">
      {/* Membership Warning */}
      {member.membershipStatus === 'not-assigned' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 flex justify-between items-center">
            <span>Membership not assigned. Please activate a membership to track this member's progress.</span>
            {hasPermission('members.edit') && (
              <Button 
                size="sm" 
                onClick={() => setAssignMembershipOpen(true)}
                className="ml-4"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Assign Membership
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Member Information
            {hasPermission('members.edit') && (
              <MeasurementRecorderDrawer
                memberId={member.id}
                memberName={member.fullName}
                onSave={handleSaveMeasurement}
              >
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Measurements
                </Button>
              </MeasurementRecorderDrawer>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.profilePhoto} alt={member.fullName} />
              <AvatarFallback className="text-lg">{getInitials(member.fullName)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{member.fullName}</h3>
                <p className="text-sm text-muted-foreground">Member ID: {member.id}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.phone}</span>
                </div>

                <Separator />

                {/* Pending Freeze Requests */}
                <div>
                  <h4 className="font-medium mb-2">Pending Freeze Requests</h4>
                  {pendingFreezes.length > 0 ? (
                    <div className="space-y-2">
                      {pendingFreezes.map((fr: any) => (
                        <div key={fr.id} className="border rounded-md p-3 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <p className="text-foreground font-medium">{fr.reason}</p>
                            <p>Days: {fr.requested_days} | {fr.freeze_start_date} → {fr.freeze_end_date}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await supabase
                                    .from('membership_freeze_requests')
                                    .update({ status: 'approved', approved_at: new Date().toISOString() })
                                    .eq('id', fr.id);
                                  // Optionally set membership to frozen
                                  if (latestMembership?.id) {
                                    // Read current end_date
                                    const { data: mm } = await supabase
                                      .from('member_memberships')
                                      .select('end_date')
                                      .eq('id', latestMembership.id)
                                      .maybeSingle();
                                    let newEnd = latestMembership.end_date ? new Date(latestMembership.end_date) : (mm?.end_date ? new Date(mm.end_date) : null);
                                    if (newEnd) {
                                      newEnd.setDate(newEnd.getDate() + Number(fr.requested_days || 0));
                                      const newEndStr = newEnd.toISOString().slice(0, 10);
                                      await supabase
                                        .from('member_memberships')
                                        .update({ status: 'frozen', end_date: newEndStr })
                                        .eq('id', latestMembership.id);
                                    } else {
                                      // fallback: just set status frozen if end_date missing
                                      await supabase
                                        .from('member_memberships')
                                        .update({ status: 'frozen' })
                                        .eq('id', latestMembership.id);
                                    }
                                  }
                                  await refetchFreezes();
                                  await queryClient.invalidateQueries({ queryKey: ['member-membership', member.id] });
                                  toast({ title: 'Freeze approved' });
                                } catch (e) {
                                  toast({ title: 'Failed to approve', variant: 'destructive' });
                                }
                              }}
                            >Approve</Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                try {
                                  await supabase
                                    .from('membership_freeze_requests')
                                    .update({ status: 'rejected', approved_at: new Date().toISOString() })
                                    .eq('id', fr.id);
                                  await refetchFreezes();
                                  toast({ title: 'Freeze rejected' });
                                } catch (e) {
                                  toast({ title: 'Failed to reject', variant: 'destructive' });
                                }
                              }}
                            >Reject</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending requests</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    DOB: {format(member.dateOfBirth, 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{member.gender}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact & Address */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{member.address.street}</p>
                    <p>{member.address.city}, {member.address.state} - {member.address.pincode}</p>
                  </div>
                </div>

                <Separator />

                {/* Billing Summary */}
                <div>
                  <h4 className="font-medium mb-2">Billing Summary</h4>
                  {latestInvoice ? (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="flex items-center justify-between">
                        <span>Latest Invoice: <span className="text-foreground font-medium">{latestInvoice.invoice_number}</span></span>
                        <span>
                          {(() => {
                            const status = (latestInvoice.status || 'draft') as string;
                            const today = new Date().toISOString().slice(0,10);
                            const due = latestInvoice.due_date as string;
                            const isOverdue = status !== 'paid' && due && due < today;
                            if (status === 'paid') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
                            if (isOverdue) return <Badge variant="destructive">Overdue</Badge>;
                            return <Badge variant="secondary">Due</Badge>;
                          })()}
                        </span>
                      </p>
                      <p>Total: <span className="text-foreground font-medium">₹{Number(latestInvoice.total || 0).toLocaleString()}</span></p>
                      <p>Due: {latestInvoice.due_date}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No invoices found</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Government ID</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatGovernmentId(member.governmentId.type, member.governmentId.number)}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Emergency Contact</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{member.emergencyContact.name} ({member.emergencyContact.relationship})</p>
                    <p>{member.emergencyContact.phone}</p>
                    {member.emergencyContact.email && <p>{member.emergencyContact.email}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gym Information */}
            <Card>
              <CardHeader>
                <CardTitle>Gym Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Branch</h4>
                  <p className="text-sm">{member.branchName}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 flex items-center justify-between">
                    Membership Status
                    {hasPermission('members.edit') && member.membershipStatus === 'not-assigned' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setAssignMembershipOpen(true)}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </h4>
                  <div className="space-y-2">
                    {getMembershipStatusBadge(member.membershipStatus)}
                    {member.membershipPlan && (
                      <p className="text-sm text-muted-foreground">Plan: {member.membershipPlan}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Rewards Balance</h4>
                  <p className="text-sm">{computedPointsBalance.toLocaleString()} points</p>
                </div>

                {/* Rewards History */}
                <div className="text-sm space-y-2">
                  {(creditTx as any[]).slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex justify-between text-muted-foreground">
                      <span>{tx.description || tx.transaction_type}</span>
                      <span className="text-foreground font-medium">+{tx.amount}</span>
                    </div>
                  ))}
                  {(!creditTx || (creditTx as any[]).length === 0) && (
                    <p className="text-muted-foreground">No rewards yet</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Assigned Trainer</h4>
                  <p className="text-sm">
                    {member.trainerName || <span className="text-muted-foreground">No trainer assigned</span>}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Joined Date</h4>
                  <p className="text-sm">{format(member.joinedDate, 'MMMM dd, yyyy')}</p>
                </div>

                <Separator />

                {/* Membership Timeline */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center justify-between">
                    Membership Timeline
                    <Button size="sm" variant="outline" onClick={() => setShowFreezeForm(!showFreezeForm)}>
                      Freeze
                    </Button>
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Start: {latestMembership?.start_date ? format(new Date(latestMembership.start_date), 'MMM dd, yyyy') : '—'}</p>
                    <p>End: {latestMembership?.end_date ? format(new Date(latestMembership.end_date), 'MMM dd, yyyy') : '—'}</p>
                    <p>Status: <span className="capitalize">{latestMembership?.status || '—'}</span></p>
                    <p>Remaining Days: {remainingDays != null ? Math.max(0, remainingDays) : '—'}</p>
                  </div>

                  {showFreezeForm && (
                    <div className="mt-3 border rounded-md p-3 space-y-3">
                      <div>
                        <label className="text-sm font-medium">Reason</label>
                        <input
                          className="mt-1 w-full border rounded px-3 py-2 text-sm"
                          placeholder="Reason for freeze"
                          value={freezeReason}
                          onChange={(e) => setFreezeReason(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Requested Days</label>
                        <input
                          className="mt-1 w-full border rounded px-3 py-2 text-sm"
                          type="number"
                          placeholder="e.g., 7"
                          value={freezeDays}
                          onChange={(e) => setFreezeDays(e.target.value ? Number(e.target.value) : '')}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!latestMembership?.id) {
                              return toast({ title: 'Freeze failed', description: 'No active membership found', variant: 'destructive' });
                            }
                            if (!freezeReason || !freezeDays || freezeDays <= 0) {
                              return toast({ title: 'Freeze failed', description: 'Enter reason and valid requested days', variant: 'destructive' });
                            }
                            const start = new Date();
                            const end = new Date();
                            end.setDate(start.getDate() + Number(freezeDays));
                            try {
                              await supabase.from('membership_freeze_requests').insert([
                                {
                                  membership_id: latestMembership.id,
                                  // user_id: null // proceed with null as discussed
                                  reason: freezeReason,
                                  requested_days: Number(freezeDays),
                                  freeze_start_date: start.toISOString().slice(0, 10),
                                  freeze_end_date: end.toISOString().slice(0, 10),
                                  // status defaults to 'pending'
                                }
                              ]);
                              toast({ title: 'Freeze requested', description: 'Your freeze request has been submitted for approval.' });
                              setShowFreezeForm(false);
                              setFreezeReason('');
                              setFreezeDays('');
                            } catch (err) {
                              console.warn('Freeze request failed:', err);
                              toast({ title: 'Freeze failed', description: 'Unable to submit freeze request', variant: 'destructive' });
                            }
                          }}
                        >Submit Request</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowFreezeForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Physical Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Current Measurements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {latestMeasurement?.weight || member.measurements.weight} kg
                  </p>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  {progressSummary?.weightChange && (
                    <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {progressSummary.weightChange > 0 ? '+' : ''}{progressSummary.weightChange}kg
                    </p>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-semibold">{member.measurements.height} cm</p>
                  <p className="text-sm text-muted-foreground">Height</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {latestMeasurement?.bmi?.toFixed(1) || member.measurements.bmi?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    BMI ({getBMICategory(latestMeasurement?.bmi || member.measurements.bmi)})
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {latestMeasurement?.bodyFat || member.measurements.fatPercentage || 'N/A'}%
                  </p>
                  <p className="text-sm text-muted-foreground">Body Fat</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {latestMeasurement?.muscleMass || member.measurements.musclePercentage || 'N/A'}%
                  </p>
                  <p className="text-sm text-muted-foreground">Muscle Mass</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <ProgressCharts
            memberId={member.id}
            measurements={measurements}
            attendance={attendanceRecords}
          />
        </TabsContent>

        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <CardTitle>Measurement History</CardTitle>
              <CardDescription>Track changes in body composition over time</CardDescription>
            </CardHeader>
            <CardContent>
              {measurements.length > 0 ? (
                <div className="space-y-4">
                  {measurements
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((measurement) => (
                    <div key={measurement.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{format(measurement.date, 'MMMM dd, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">
                            Recorded by {measurement.recordedByName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="font-semibold">{measurement.weight} kg</p>
                        </div>
                        {measurement.bodyFat && (
                          <div>
                            <p className="text-sm text-muted-foreground">Body Fat</p>
                            <p className="font-semibold">{measurement.bodyFat}%</p>
                          </div>
                        )}
                        {measurement.muscleMass && (
                          <div>
                            <p className="text-sm text-muted-foreground">Muscle Mass</p>
                            <p className="font-semibold">{measurement.muscleMass}%</p>
                          </div>
                        )}
                        {measurement.bmi && (
                          <div>
                            <p className="text-sm text-muted-foreground">BMI</p>
                            <p className="font-semibold">{measurement.bmi}</p>
                          </div>
                        )}
                      </div>
                      
                      {measurement.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{measurement.notes}</p>
                        </div>
                      )}
                      
                      {measurement.images && measurement.images.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Progress Photos</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {measurement.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Progress photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No measurements recorded yet</p>
                  <p className="text-sm">Start tracking progress by recording measurements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <MemberBillingCard memberId={member.id} />
        </TabsContent>
      </Tabs>

      {/* Assign Membership Drawer */}
      <AssignMembershipDrawer
        open={assignMembershipOpen}
        onClose={() => setAssignMembershipOpen(false)}
        memberName={member.fullName}
        onSubmit={handleAssignMembership}
      />
    </div>
  );
};
