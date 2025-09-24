import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { assignMembership } from '@/services/memberships';
import { Phone, Mail, MapPin, Calendar, User, Activity, AlertTriangle, CreditCard, Plus, TrendingUp } from 'lucide-react';
import { useTrainers } from '@/hooks/useTrainers';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Member, MembershipStatus } from '@/types/member';
import { MemberBillingCard } from '@/components/membership/MemberBillingCard';
import { AssignMembershipDrawer } from '@/components/membership/AssignMembershipDrawer';
import { MembershipFormData } from '@/types/membership';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { MeasurementRecorderDrawer } from './MeasurementRecorderDrawer';
import { ProgressCharts } from './ProgressCharts';
import { MeasurementHistory } from '@/types/member-progress';
import { mockMeasurementHistory, mockAttendanceRecords, mockProgressSummary } from '@/utils/mockData';
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
  const [showTrainerAssignment, setShowTrainerAssignment] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeDays, setFreezeDays] = useState<number | ''>('');
  
  const memberUserId = (member as any).userId ?? null;
  const { data: trainers } = useTrainers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authState } = useAuth();
  const { hasPermission } = useRBAC();
  const [measurements, setMeasurements] = useState<MeasurementHistory[]>(
    mockMeasurementHistory.filter(m => m.memberId === member.id)
  );

  const { data: trainers } = useTrainers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authState } = useAuth();
  const { hasPermission } = useRBAC();

  // Get available trainers sorted by utilization
  const availableTrainers = trainers?.map(trainer => ({
    ...trainer,
    utilization_score: Math.round(Math.random() * 100), // Mock utilization for now
    specialties: trainer.specialties || []
  })).sort((a, b) => a.utilization_score - b.utilization_score);

  const handleAutoAssignTrainer = useCallback(async () => {
    if (!availableTrainers || availableTrainers.length === 0) {
      toast({
        title: 'No Trainers Available',
        description: 'No trainers are currently available for assignment.',
        variant: 'destructive'
      });
      return;
    }

    // Get trainer with lowest utilization
    const bestTrainer = availableTrainers[0];
    
    try {
      const { error } = await supabase
        .from('members')
        .update({ trainer_id: bestTrainer.id })
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: 'Trainer Assigned',
        description: `${bestTrainer.full_name} has been auto-assigned based on lowest utilization.`,
      });

      queryClient.invalidateQueries({ queryKey: ['members'] });
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: 'Failed to auto-assign trainer. Please try again.',
        variant: 'destructive'
      });
    }
  }, [availableTrainers, member.id, toast, queryClient]);

  const handleAssignTrainer = useCallback(async () => {
    if (!selectedTrainerId) return;

    try {
      const { error } = await supabase
        .from('members')
        .update({ trainer_id: selectedTrainerId })
        .eq('id', member.id);

      if (error) throw error;

      const trainer = availableTrainers?.find(t => t.id === selectedTrainerId);
      toast({
        title: 'Trainer Assigned',
        description: `${trainer?.full_name} has been assigned successfully.`,
      });

      setShowTrainerAssignment(false);
      setSelectedTrainerId('');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: 'Failed to assign trainer. Please try again.',
        variant: 'destructive'
      });
    }
  }, [selectedTrainerId, member.id, availableTrainers, toast, queryClient]);

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
      await assignMembership({
        member: {
          id: member.id,
          fullName: member.fullName,
          email: member.email,
          userId: (member as any).userId ?? null,
        },
        data,
        assignedBy: authState.user?.id || '',
        branchId: (member as any).branchId
      });

      await queryClient.invalidateQueries({ queryKey: ['members'] });
      await queryClient.invalidateQueries({ queryKey: ['members', member.id] });
      await queryClient.invalidateQueries({ queryKey: ['member-credits', member.id] });
      await queryClient.invalidateQueries({ queryKey: ['member-membership', member.id] });
      await queryClient.invalidateQueries({ queryKey: ['member-latest-invoice', member.id] });

      toast({
        title: 'Membership Assigned',
        description: `Membership has been assigned to ${member.fullName}.`,
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
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Rewards Balance</h4>
                  <p className="text-sm">{computedPointsBalance.toLocaleString()} points</p>
                  
                  {/* Rewards History */}
                  <div className="text-sm space-y-2 mt-2">
                    {(creditTx as any[]).slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex justify-between text-muted-foreground">
                        <span className="truncate max-w-[120px]">{tx.description || tx.transaction_type}</span>
                        <span className="text-foreground font-medium">+{tx.amount}</span>
                      </div>
                    ))}
                    {(!creditTx || (creditTx as any[]).length === 0) && (
                      <p className="text-muted-foreground text-xs">No rewards yet</p>
                    )}
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
                    {latestMembership?.status === 'frozen' ? (
                      <Button size="sm" variant="outline">
                        Unfreeze
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setShowFreezeForm(!showFreezeForm)}>
                        Freeze
                      </Button>
                    )}
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
