import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Settings, 
  BarChart3, 
  Plus, 
  Link as LinkIcon,
  Shield,
  TrendingUp
} from 'lucide-react';
import { PaymentGatewaySettings } from '@/components/payments/PaymentGatewaySettings';
import { PaymentStatusTracker } from '@/components/payments/PaymentStatusTracker';
import { PaymentDashboard } from '@/components/payments/PaymentDashboard';
import { PaymentInitiationModal } from '@/components/payments/PaymentInitiationModal';
import { usePaymentGateways, usePayments } from '@/hooks/usePaymentGateways';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';
import type { Payment, PaymentType } from '@/types/payment';

export default function PaymentManagement() {
  const { hasPermission } = useRBAC();
  const { toast } = useToast();
  const { gateways, updateGateway, testConnection } = usePaymentGateways();
  const { 
    payments, 
    loading, 
    initiatePayment, 
    generatePaymentLink, 
    refreshPaymentStatus, 
    downloadReceipt,
    getPaymentAnalytics 
  } = usePayments();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('membership');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const canManageGateways = hasPermission('system:admin');
  const canInitiatePayments = hasPermission('payments:create');
  const canViewAnalytics = hasPermission('analytics:read');

  const handleInitiatePayment = async (paymentType: PaymentType) => {
    if (!canInitiatePayments) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to initiate payments.",
        variant: "destructive"
      });
      return;
    }

    setSelectedPaymentType(paymentType);
    setShowPaymentModal(true);
  };

  const handleViewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  const quickActions = [
    {
      title: 'Membership Payment',
      description: 'Process membership fee payment',
      icon: CreditCard,
      action: () => handleInitiatePayment('membership'),
      color: 'bg-blue-100 text-blue-600',
      enabled: canInitiatePayments
    },
    {
      title: 'POS Payment',
      description: 'Process store purchase payment',
      icon: CreditCard,
      action: () => handleInitiatePayment('pos'),
      color: 'bg-green-100 text-green-600',
      enabled: canInitiatePayments
    },
    {
      title: 'Invoice Payment',
      description: 'Process invoice payment',
      icon: CreditCard,
      action: () => handleInitiatePayment('invoice'),
      color: 'bg-orange-100 text-orange-600',
      enabled: canInitiatePayments
    },
    {
      title: 'Training Fee',
      description: 'Process training fee payment',
      icon: CreditCard,
      action: () => handleInitiatePayment('training_fee'),
      color: 'bg-purple-100 text-purple-600',
      enabled: canInitiatePayments
    }
  ];

  const systemStats = {
    activeGateways: gateways.filter(g => g.isActive).length,
    totalGateways: gateways.length,
    recentPayments: payments.filter(p => {
      const today = new Date();
      const paymentDate = new Date(p.createdAt);
      return paymentDate.toDateString() === today.toDateString();
    }).length,
    pendingPayments: payments.filter(p => p.status === 'pending' || p.status === 'processing').length
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">
            Manage payment gateways, transactions, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {systemStats.activeGateways}/{systemStats.totalGateways} Gateways Active
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Gateways</p>
                <p className="text-2xl font-bold">{systemStats.activeGateways}</p>
              </div>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Payments</p>
                <p className="text-2xl font-bold">{systemStats.recentPayments}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{systemStats.pendingPayments}</p>
              </div>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {canInitiatePayments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Initiate payments for different services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Card
                  key={action.title}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    !action.enabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={action.enabled ? action.action : undefined}
                >
                  <CardContent className="pt-6 text-center">
                    <div className={`p-3 rounded-lg ${action.color} w-fit mx-auto mb-3`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="gateways" disabled={!canManageGateways}>
            Gateway Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled={!canViewAnalytics}>
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <PaymentDashboard 
            payments={payments} 
            analytics={getPaymentAnalytics()} 
          />
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-6">
          <PaymentStatusTracker
            payments={payments}
            loading={loading}
            onRefreshPayment={refreshPaymentStatus}
            onDownloadReceipt={downloadReceipt}
            onViewDetails={handleViewPaymentDetails}
          />
        </TabsContent>
        
        <TabsContent value="gateways" className="space-y-6">
          {canManageGateways ? (
            <PaymentGatewaySettings
              gateways={gateways}
              onUpdateGateway={updateGateway}
              onTestConnection={testConnection}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">
                  You don't have permission to manage payment gateway settings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          {canViewAnalytics ? (
            <PaymentDashboard 
              payments={payments} 
              analytics={getPaymentAnalytics()} 
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">
                  You don't have permission to view payment analytics.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Initiation Modal */}
      <PaymentInitiationModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentType={selectedPaymentType}
        amount={1000} // This would be dynamic based on the payment type
        memberId="member_123" // This would be selected from a member picker
        memberName="John Doe" // This would be fetched from member data
        onInitiatePayment={initiatePayment}
        onGeneratePaymentLink={generatePaymentLink}
      />
    </div>
  );
}