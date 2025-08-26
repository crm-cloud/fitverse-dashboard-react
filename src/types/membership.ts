export type AccessType = 'gym' | 'pool' | 'sauna' | 'classes' | 'personal-training' | 'spa' | 'locker';

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank-transfer';

export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'overdue';

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  description: string;
  features: string[];
  is_active: boolean;
  created_at: string; // Changed to string to match Supabase
  updated_at: string; // Changed to string to match Supabase
}

export interface MembershipAssignment {
  id: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  originalPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  gstEnabled: boolean;
  gstAmount: number;
  finalAmount: number;
  branchId: string;
  branchName: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  membershipId: string;
  memberId: string;
  memberName: string;
  planName: string;
  originalAmount: number;
  discountAmount: number;
  gstAmount: number;
  finalAmount: number;
  issueDate: Date;
  dueDate: Date;
  paymentStatus: PaymentStatus;
  branchId: string;
  branchName: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: Date;
  recordedBy: string;
  notes?: string;
  createdAt: Date;
}

export interface MembershipFormData {
  planId: string;
  startDate: Date;
  discountPercent?: number;
  discountAmount?: number;
  gstEnabled: boolean;
}

export interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}