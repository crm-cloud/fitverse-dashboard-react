
import { Transaction, TransactionCategory, PaymentMethod, FinancialSummary, MonthlyData } from '@/types/finance';

export const mockTransactionCategories: TransactionCategory[] = [
  // Income Categories
  { id: '1', name: 'Membership Fees', type: 'income', color: '#10B981', icon: 'Users', description: 'Monthly and yearly membership fees', isActive: true },
  { id: '2', name: 'Personal Training', type: 'income', color: '#8B5CF6', icon: 'Dumbbell', description: 'Personal training sessions', isActive: true },
  { id: '3', name: 'Classes', type: 'income', color: '#F59E0B', icon: 'Calendar', description: 'Group fitness classes', isActive: true },
  { id: '4', name: 'Product Sales', type: 'income', color: '#EF4444', icon: 'Package', description: 'Supplements and merchandise', isActive: true },
  { id: '5', name: 'Registration Fees', type: 'income', color: '#06B6D4', icon: 'UserPlus', description: 'New member registration fees', isActive: true },
  
  // Expense Categories
  { id: '6', name: 'Equipment', type: 'expense', color: '#DC2626', icon: 'Dumbbell', description: 'Gym equipment purchases and maintenance', isActive: true },
  { id: '7', name: 'Rent', type: 'expense', color: '#7C2D12', icon: 'Building', description: 'Monthly rent payments', isActive: true },
  { id: '8', name: 'Utilities', type: 'expense', color: '#1F2937', icon: 'Zap', description: 'Electricity, water, internet', isActive: true },
  { id: '9', name: 'Staff Salaries', type: 'expense', color: '#374151', icon: 'Users', description: 'Employee salaries and benefits', isActive: true },
  { id: '10', name: 'Marketing', type: 'expense', color: '#9333EA', icon: 'Megaphone', description: 'Advertising and promotional expenses', isActive: true },
  { id: '11', name: 'Supplies', type: 'expense', color: '#059669', icon: 'Package', description: 'Cleaning supplies, towels, etc.', isActive: true },
  { id: '12', name: 'Insurance', type: 'expense', color: '#0369A1', icon: 'Shield', description: 'Business insurance premiums', isActive: true },
];

export const mockPaymentMethods: PaymentMethod[] = [
  { id: '1', name: 'Cash', type: 'cash', isActive: true },
  { id: '2', name: 'Credit Card', type: 'card', isActive: true },
  { id: '3', name: 'Debit Card', type: 'card', isActive: true },
  { id: '4', name: 'Bank Transfer', type: 'bank_transfer', isActive: true },
  { id: '5', name: 'PayPal', type: 'digital_wallet', isActive: true },
  { id: '6', name: 'Stripe', type: 'digital_wallet', isActive: true },
  { id: '7', name: 'Check', type: 'other', isActive: true },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'income',
    category: mockTransactionCategories[0], // Membership Fees
    amount: 1200,
    description: 'Monthly membership fees - January batch',
    paymentMethod: mockPaymentMethods[1], // Credit Card
    reference: 'MEM-2024-001',
    memberId: 'member-1',
    memberName: 'John Doe',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    date: '2024-01-16',
    type: 'expense',
    category: mockTransactionCategories[6], // Rent
    amount: 5000,
    description: 'Monthly gym rent payment',
    paymentMethod: mockPaymentMethods[3], // Bank Transfer
    reference: 'RENT-2024-001',
    status: 'completed',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  {
    id: '3',
    date: '2024-01-17',
    type: 'income',
    category: mockTransactionCategories[1], // Personal Training
    amount: 800,
    description: 'Personal training sessions - Week 3',
    paymentMethod: mockPaymentMethods[0], // Cash
    reference: 'PT-2024-003',
    memberId: 'member-2',
    memberName: 'Jane Smith',
    status: 'completed',
    createdAt: '2024-01-17T14:45:00Z',
    updatedAt: '2024-01-17T14:45:00Z',
  },
  {
    id: '4',
    date: '2024-01-18',
    type: 'expense',
    category: mockTransactionCategories[7], // Utilities
    amount: 450,
    description: 'Electricity bill - January 2024',
    paymentMethod: mockPaymentMethods[3], // Bank Transfer
    reference: 'UTIL-2024-001',
    status: 'pending',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '5',
    date: '2024-01-19',
    type: 'income',
    category: mockTransactionCategories[3], // Product Sales
    amount: 320,
    description: 'Protein supplements and accessories',
    paymentMethod: mockPaymentMethods[1], // Credit Card
    reference: 'PROD-2024-012',
    status: 'completed',
    createdAt: '2024-01-19T16:10:00Z',
    updatedAt: '2024-01-19T16:10:00Z',
  },
];

export const mockFinancialSummary: FinancialSummary = {
  totalIncome: 45600,
  totalExpenses: 32400,
  netProfit: 13200,
  monthlyIncome: 8200,
  monthlyExpenses: 5800,
  monthlyProfit: 2400,
  topIncomeCategory: 'Membership Fees',
  topExpenseCategory: 'Staff Salaries',
};

export const mockMonthlyData: MonthlyData[] = [
  { month: 'Jan', income: 8200, expenses: 5800, profit: 2400 },
  { month: 'Feb', income: 7800, expenses: 5600, profit: 2200 },
  { month: 'Mar', income: 9100, expenses: 6200, profit: 2900 },
  { month: 'Apr', income: 8600, expenses: 5900, profit: 2700 },
  { month: 'May', income: 9500, expenses: 6100, profit: 3400 },
  { month: 'Jun', income: 8900, expenses: 5700, profit: 3200 },
];
