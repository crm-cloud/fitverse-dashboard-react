import { useState } from 'react';
import { CreditCard, Receipt, Calendar, Download, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { mockMembershipAssignments, mockInvoices, mockPayments } from '@/utils/mockData';
import { format } from 'date-fns';
import { PaymentStatus } from '@/types/membership';

const getPaymentStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'paid':
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    case 'overdue':
      return <Badge variant="destructive">Overdue</Badge>;
    case 'unpaid':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Unpaid</Badge>;
    case 'partial':
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Partial</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const MemberBilling = () => {
  const { toast } = useToast();
  const { data: member, isLoading } = useMemberProfile();

  const memberInvoices = mockInvoices.filter(invoice => invoice.memberId === member?.id);
  const memberPayments = mockPayments.filter(payment => 
    memberInvoices.some(invoice => invoice.id === payment.invoiceId)
  );
  const activeMembership = mockMembershipAssignments.find(
    assignment => assignment.memberId === member?.id && assignment.isActive
  );

  const unpaidInvoices = memberInvoices.filter(invoice => 
    invoice.paymentStatus === 'unpaid' || invoice.paymentStatus === 'overdue'
  );

  const totalOutstanding = unpaidInvoices.reduce((sum, invoice) => sum + invoice.finalAmount, 0);

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download Started",
      description: "Your invoice is being downloaded.",
    });
    console.log('Downloading invoice:', invoiceId);
  };

  const handlePayNow = (invoiceId: string) => {
    toast({
      title: "Redirecting to Payment",
      description: "You will be redirected to the payment gateway.",
    });
    console.log('Initiating payment for invoice:', invoiceId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Member profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage your membership payments and billing history</p>
      </div>

      {/* Outstanding Balance Alert */}
      {totalOutstanding > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Outstanding Balance</h3>
                <p className="text-sm text-muted-foreground">
                  You have {unpaidInvoices.length} unpaid invoice(s) totaling {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <Button variant="destructive" onClick={() => handlePayNow(unpaidInvoices[0]?.id)}>
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Membership</CardTitle>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {activeMembership ? activeMembership.planName : 'None'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {activeMembership ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Expires: {format(activeMembership.endDate, 'MMM dd, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Amount: {formatCurrency(activeMembership.finalAmount)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No active membership</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{memberInvoices.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {memberInvoices.filter(i => i.paymentStatus === 'paid').length} paid, {unpaidInvoices.length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-success" />
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(memberPayments.reduce((sum, payment) => sum + payment.amount, 0))}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{memberPayments.length} transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>All your membership invoices and billing statements</CardDescription>
            </CardHeader>
            <CardContent>
              {memberInvoices.length > 0 ? (
                <div className="space-y-4">
                  {memberInvoices
                    .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime())
                    .map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">#{invoice.invoiceNumber}</h4>
                          <p className="text-sm text-muted-foreground">{invoice.planName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(invoice.finalAmount)}</p>
                          {getPaymentStatusBadge(invoice.paymentStatus)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Issue Date</p>
                          <p>{format(invoice.issueDate, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p>{format(invoice.dueDate, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Original Amount</p>
                          <p>{formatCurrency(invoice.originalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">GST Amount</p>
                          <p>{formatCurrency(invoice.gstAmount)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        {(invoice.paymentStatus === 'unpaid' || invoice.paymentStatus === 'overdue') && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePayNow(invoice.id)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices found</p>
                  <p className="text-sm">Your billing history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your successful payments and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {memberPayments.length > 0 ? (
                <div className="space-y-4">
                  {memberPayments
                    .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
                    .map((payment) => {
                      const invoice = memberInvoices.find(inv => inv.id === payment.invoiceId);
                      return (
                        <div key={payment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">Payment #{payment.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                Invoice: #{invoice?.invoiceNumber}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                {formatCurrency(payment.amount)}
                              </p>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Success
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Payment Date</p>
                              <p>{format(payment.paymentDate, 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Method</p>
                              <p className="capitalize">{payment.paymentMethod.replace('-', ' ')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Reference</p>
                              <p>{payment.referenceNumber || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Plan</p>
                              <p>{invoice?.planName || 'N/A'}</p>
                            </div>
                          </div>

                          {payment.notes && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground">Notes</p>
                              <p className="text-sm">{payment.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payments found</p>
                  <p className="text-sm">Your payment history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};