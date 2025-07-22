export type PaymentGatewayType = 'razorpay' | 'payu' | 'phonepe' | 'ccavenue';
export type PaymentMethodType = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
export type PaymentType = 'membership' | 'pos' | 'invoice' | 'training_fee';

export interface PaymentGateway {
  id: string;
  name: string;
  type: PaymentGatewayType;
  isActive: boolean;
  environment: 'sandbox' | 'live';
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  webhookSecret?: string;
  additionalConfig?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  txnId: string;
  orderId?: string;
  paymentReference?: string;
  memberId?: string;
  memberName?: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  gatewayType: PaymentGatewayType;
  paymentMethod: PaymentMethodType;
  status: PaymentStatus;
  invoiceId?: string;
  membershipId?: string;
  posOrderId?: string;
  trainingPackageId?: string;
  gatewayResponse?: Record<string, any>;
  failureReason?: string;
  initiatedBy: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentLink {
  id: string;
  paymentId: string;
  linkToken: string;
  memberId: string;
  memberName: string;
  amount: number;
  paymentType: PaymentType;
  description?: string;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface PaymentLog {
  id: string;
  paymentId?: string;
  gatewayType: PaymentGatewayType;
  logType: 'webhook' | 'api_call' | 'callback' | 'error';
  requestPayload?: Record<string, any>;
  responsePayload?: Record<string, any>;
  headers?: Record<string, any>;
  statusCode?: number;
  processingStatus: 'received' | 'processed' | 'failed';
  errorMessage?: string;
  receivedAt: Date;
  processedAt?: Date;
}

export interface PaymentReceipt {
  id: string;
  paymentId: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  invoiceData: Record<string, any>;
  pdfPath?: string;
  generatedAt: Date;
  generatedBy: string;
}

export interface PaymentAnalytics {
  date: string;
  gatewayType: PaymentGatewayType;
  paymentType: PaymentType;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  successfulAmount: number;
  averageTransactionValue: number;
  successRate: number;
}

export interface PaymentNotification {
  id: string;
  paymentId?: string;
  memberId: string;
  notificationType: 'payment_success' | 'payment_failed' | 'payment_reminder' | 'receipt_ready';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface PaymentInitiationData {
  memberId: string;
  amount: number;
  paymentType: PaymentType;
  description?: string;
  gatewayType: PaymentGatewayType;
  paymentMethod: PaymentMethodType;
  referenceId?: string; // invoice_id, membership_id, etc.
}

export interface PaymentLinkRequest {
  paymentData: PaymentInitiationData;
  expiresInHours: number;
  sendVia: ('email' | 'sms' | 'whatsapp')[];
  recipientEmail?: string;
  recipientPhone?: string;
}

export interface PaymentGatewaySettings {
  razorpay: {
    sandbox: {
      keyId: string;
      keySecret: string;
      webhookSecret: string;
    };
    live: {
      keyId: string;
      keySecret: string;
      webhookSecret: string;
    };
  };
  payu: {
    sandbox: {
      merchantKey: string;
      merchantSalt: string;
      merchantId: string;
    };
    live: {
      merchantKey: string;
      merchantSalt: string;
      merchantId: string;
    };
  };
  phonepe: {
    sandbox: {
      merchantId: string;
      saltKey: string;
      saltIndex: string;
    };
    live: {
      merchantId: string;
      saltKey: string;
      saltIndex: string;
    };
  };
  ccavenue: {
    sandbox: {
      merchantId: string;
      accessCode: string;
      workingKey: string;
    };
    live: {
      merchantId: string;
      accessCode: string;
      workingKey: string;
    };
  };
}