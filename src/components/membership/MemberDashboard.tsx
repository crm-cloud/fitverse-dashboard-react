import { useState } from 'react';
import { format, isAfter, differenceInDays } from 'date-fns';
import { 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockMembershipAssignments, mockInvoices } from '@/mock/membership';
import { AssignMembershipDrawer } from '@/components/membership/AssignMembershipDrawer';
import { MembershipFormData } from '@/types/membership';
import { useToast } from '@/hooks/use-toast';

interface MemberDashboardProps {
  memberId: string;
  memberName: string;
  memberAvatar?: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

export const MemberDashboard = ({ memberId, memberName, memberAvatar }: MemberDashboardProps) => {
  const [assignMembershipOpen, setAssignMembershipOpen] = useState(false);
  const { toast } = useToast();

  const activeMembership = mockMembershipAssignments.find(
    assignment => assignment.memberId === memberId && assignment.isActive
  );

  const memberInvoices = mockInvoices.filter(invoice => invoice.memberId === memberId);
  const unpaidInvoices = memberInvoices.filter(invoice => 
    invoice.paymentStatus === 'unpaid' || invoice.paymentStatus === 'overdue'
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleRenewMembership = (data: MembershipFormData) => {
    console.log('Renewing membership:', { member: memberId, data });
    toast({
      title: 'Membership Renewed',
      description: 'Your membership has been successfully renewed.',
    });
    setAssignMembershipOpen(false);
  };

  const getDaysUntilExpiry = (endDate: Date) => {
    return differenceInDays(endDate, new Date());
  };

  const getMembershipStatusInfo = (membership: typeof activeMembership) => {
    if (!membership) return null;
    
    const daysUntilExpiry = getDaysUntilExpiry(membership.endDate);
    const isExpired = isAfter(new Date(), membership.endDate);
    
    if (isExpired) {
      return {
        type: 'expired',
        message: 'Your membership has expired',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
    
    if (daysUntilExpiry <= 7) {
      return {
        type: 'expiring',
        message: `Your membership expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
    
    return {
      type: 'active',
      message: `Your membership is active until ${format(membership.endDate, 'MMM dd, yyyy')}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  };

  const membershipStatusInfo = getMembershipStatusInfo(activeMembership);

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={memberAvatar} alt={memberName} />
                <AvatarFallback className="text-lg">{getInitials(memberName)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {memberName.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Here's your membership overview</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Active Membership Alert */}
        {!activeMembership && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 flex justify-between items-center">
              <span>No active membership. Please renew to continue accessing gym facilities.</span>
              <Button 
                size="sm" 
                onClick={() => setAssignMembershipOpen(true)}
                className="ml-4"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Get Membership
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Active Membership Card */}
        {activeMembership && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Current Membership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Membership Status Alert */}
              {membershipStatusInfo && (
                <Alert className={`${membershipStatusInfo.borderColor} ${membershipStatusInfo.bgColor}`}>
                  {membershipStatusInfo.type === 'expired' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {membershipStatusInfo.type === 'expiring' && <Clock className="h-4 w-4 text-yellow-600" />}
                  {membershipStatusInfo.type === 'active' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  <AlertDescription className={membershipStatusInfo.color}>
                    {membershipStatusInfo.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{activeMembership.planName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Started on {format(activeMembership.startDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Membership ID:</span>
                      <span className="font-mono">{activeMembership.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Branch:</span>
                      <span>{activeMembership.branchName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Valid Until:</span>
                      <span className="font-medium">
                        {format(activeMembership.endDate, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {getDaysUntilExpiry(activeMembership.endDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">days remaining</div>
                  </div>
                  
                  <Button 
                    className="mt-4"
                    onClick={() => setAssignMembershipOpen(true)}
                    variant={membershipStatusInfo?.type === 'expired' ? 'destructive' : 'default'}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {membershipStatusInfo?.type === 'expired' ? 'Renew Now' : 'Extend Membership'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Reminders */}
        {unpaidInvoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Payment Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unpaidInvoices.map((invoice) => {
                  const isOverdue = isAfter(new Date(), invoice.dueDate);
                  return (
                    <div 
                      key={invoice.id}
                      className={`p-4 rounded-lg border ${
                        isOverdue ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                          <p className="text-sm text-muted-foreground">{invoice.planName}</p>
                          <p className={`text-sm font-medium ${
                            isOverdue ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {isOverdue ? 'Overdue' : 'Due'}: {format(invoice.dueDate, 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(invoice.finalAmount)}</p>
                          <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                            {invoice.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Book Classes</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <User className="h-6 w-6 mb-2" />
                <span>Update Profile</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Activity className="h-6 w-6 mb-2" />
                <span>View Progress</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assign/Renew Membership Drawer */}
      <AssignMembershipDrawer
        open={assignMembershipOpen}
        onClose={() => setAssignMembershipOpen(false)}
        memberName={memberName}
        onSubmit={handleRenewMembership}
      />
    </>
  );
};