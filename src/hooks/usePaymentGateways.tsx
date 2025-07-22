import { useState, useEffect } from 'react';
import type { PaymentGateway, Payment, PaymentInitiationData, PaymentAnalytics } from '@/types/payment';

// Mock payment gateways data
const mockGateways: PaymentGateway[] = [
  {
    id: 'razorpay_sandbox',
    name: 'Razorpay Sandbox',
    type: 'razorpay',
    isActive: true,
    environment: 'sandbox',
    apiKey: 'rzp_test_1234567890',
    apiSecret: '',
    webhookSecret: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'razorpay_live',
    name: 'Razorpay Live',
    type: 'razorpay',
    isActive: false,
    environment: 'live',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'payu_sandbox',
    name: 'PayU Sandbox',
    type: 'payu',
    isActive: true,
    environment: 'sandbox',
    merchantId: 'MERCHANT123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'payu_live',
    name: 'PayU Live',
    type: 'payu',
    isActive: false,
    environment: 'live',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'phonepe_sandbox',
    name: 'PhonePe Sandbox',
    type: 'phonepe',
    isActive: true,
    environment: 'sandbox',
    merchantId: 'PHONEPE_TEST',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'phonepe_live',
    name: 'PhonePe Live',
    type: 'phonepe',
    isActive: false,
    environment: 'live',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'ccavenue_sandbox',
    name: 'CCAvenue Sandbox',
    type: 'ccavenue',
    isActive: true,
    environment: 'sandbox',
    merchantId: 'CCAVENUE_TEST',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'ccavenue_live',
    name: 'CCAvenue Live',
    type: 'ccavenue',
    isActive: false,
    environment: 'live',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export function usePaymentGateways() {
  const [gateways, setGateways] = useState<PaymentGateway[]>(mockGateways);
  const [loading, setLoading] = useState(false);

  const updateGateway = async (updatedGateway: PaymentGateway) => {
    setGateways(prev => 
      prev.map(gateway => 
        gateway.id === updatedGateway.id ? updatedGateway : gateway
      )
    );
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const testConnection = async (gatewayId: string): Promise<boolean> => {
    // Simulate API call to test gateway connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const gateway = gateways.find(g => g.id === gatewayId);
    if (!gateway || !gateway.apiKey || !gateway.apiSecret) {
      return false;
    }
    
    // Mock success for properly configured gateways
    return true;
  };

  const getActiveGateways = () => {
    return gateways.filter(gateway => gateway.isActive);
  };

  const getGatewaysByEnvironment = (environment: 'sandbox' | 'live') => {
    return gateways.filter(gateway => gateway.environment === environment);
  };

  return {
    gateways,
    loading,
    updateGateway,
    testConnection,
    getActiveGateways,
    getGatewaysByEnvironment
  };
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock payments data
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: 'pay_1',
        txnId: 'TXN_2024_001',
        orderId: 'ORDER_001',
        memberId: 'member_1',
        memberName: 'John Doe',
        amount: 2500,
        currency: 'INR',
        paymentType: 'membership',
        gatewayType: 'razorpay',
        paymentMethod: 'card',
        status: 'success',
        membershipId: 'membership_1',
        initiatedBy: 'admin_1',
        completedAt: new Date('2024-01-15T10:30:00'),
        createdAt: new Date('2024-01-15T10:25:00'),
        updatedAt: new Date('2024-01-15T10:30:00')
      },
      {
        id: 'pay_2',
        txnId: 'TXN_2024_002',
        memberId: 'member_2',
        memberName: 'Jane Smith',
        amount: 850,
        currency: 'INR',
        paymentType: 'pos',
        gatewayType: 'payu',
        paymentMethod: 'upi',
        status: 'pending',
        posOrderId: 'pos_order_1',
        initiatedBy: 'staff_1',
        createdAt: new Date('2024-01-16T14:20:00'),
        updatedAt: new Date('2024-01-16T14:20:00')
      },
      {
        id: 'pay_3',
        txnId: 'TXN_2024_003',
        memberId: 'member_3',
        memberName: 'Mike Johnson',
        amount: 3000,
        currency: 'INR',
        paymentType: 'training_fee',
        gatewayType: 'phonepe',
        paymentMethod: 'upi',
        status: 'failed',
        trainingPackageId: 'training_1',
        initiatedBy: 'trainer_1',
        failureReason: 'Insufficient funds',
        createdAt: new Date('2024-01-14T09:15:00'),
        updatedAt: new Date('2024-01-14T09:18:00')
      },
      {
        id: 'pay_4',
        txnId: 'TXN_2024_004',
        memberId: 'member_4',
        memberName: 'Sarah Wilson',
        amount: 1200,
        currency: 'INR',
        paymentType: 'invoice',
        gatewayType: 'ccavenue',
        paymentMethod: 'netbanking',
        status: 'processing',
        invoiceId: 'inv_001',
        initiatedBy: 'admin_1',
        createdAt: new Date('2024-01-17T11:45:00'),
        updatedAt: new Date('2024-01-17T11:45:00')
      }
    ];
    
    setPayments(mockPayments);
  }, []);

  const initiatePayment = async (data: PaymentInitiationData) => {
    setLoading(true);
    try {
      // Simulate API call to initiate payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPayment: Payment = {
        id: `pay_${Date.now()}`,
        txnId: `TXN_${Date.now()}`,
        orderId: `ORDER_${Date.now()}`,
        memberId: data.memberId,
        memberName: `Member ${data.memberId}`, // Would be fetched from member data
        amount: data.amount,
        currency: 'INR',
        paymentType: data.paymentType,
        gatewayType: data.gatewayType,
        paymentMethod: data.paymentMethod,
        status: 'pending',
        initiatedBy: 'current_user', // Would be from auth context
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setPayments(prev => [newPayment, ...prev]);
      
      // Simulate redirect to payment gateway
      console.log('Redirecting to payment gateway:', data);
      
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentLink = async (data: PaymentInitiationData): Promise<string> => {
    // Simulate API call to generate payment link
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const linkToken = `link_${Date.now()}`;
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment/${linkToken}`;
  };

  const refreshPaymentStatus = async (paymentId: string) => {
    // Simulate API call to check payment status
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: Math.random() > 0.5 ? 'success' : 'failed', updatedAt: new Date() }
          : payment
      )
    );
  };

  const downloadReceipt = async (paymentId: string) => {
    // Simulate receipt download
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Downloading receipt for payment: ${paymentId}`);
  };

  const getPaymentAnalytics = (): PaymentAnalytics[] => {
    // Mock analytics data
    return [
      {
        date: '2024-01-15',
        gatewayType: 'razorpay',
        paymentType: 'membership',
        totalTransactions: 15,
        successfulTransactions: 14,
        failedTransactions: 1,
        totalAmount: 37500,
        successfulAmount: 35000,
        averageTransactionValue: 2500,
        successRate: 93.33
      },
      {
        date: '2024-01-15',
        gatewayType: 'payu',
        paymentType: 'pos',
        totalTransactions: 25,
        successfulTransactions: 23,
        failedTransactions: 2,
        totalAmount: 21250,
        successfulAmount: 19550,
        averageTransactionValue: 850,
        successRate: 92.00
      }
    ];
  };

  return {
    payments,
    loading,
    initiatePayment,
    generatePaymentLink,
    refreshPaymentStatus,
    downloadReceipt,
    getPaymentAnalytics
  };
}