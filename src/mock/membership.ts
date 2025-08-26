import { MembershipPlan, MembershipAssignment, Invoice, Payment } from '@/types/membership';

export const mockMembershipPlans: MembershipPlan[] = [
  {
    id: 'plan1',
    name: 'Basic Monthly',
    price: 2000,
    duration_months: 1,
    description: 'Basic gym access with all equipment',
    features: ['Gym Access', 'Equipment Usage'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan2',
    name: 'Standard Monthly',
    price: 3000,
    duration_months: 1,
    description: 'Gym access plus group classes',
    features: ['Gym Access', 'Group Classes', 'Equipment Usage'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan3',
    name: 'Premium Monthly',
    price: 4000,
    duration_months: 1,
    description: 'Full access with unlimited classes and pool',
    features: ['Gym Access', 'Unlimited Classes', 'Pool Access', 'Equipment Usage'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan4',
    name: 'VIP Monthly',
    price: 6000,
    duration_months: 1,
    description: 'Premium access with personal training sessions',
    features: ['Gym Access', 'Unlimited Classes', 'Pool Access', 'Sauna Access', 'Personal Training'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan5',
    name: 'Basic Quarterly',
    price: 5500,
    duration_months: 3,
    description: '3-month basic gym access',
    features: ['Gym Access', 'Equipment Usage'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan6',
    name: 'Premium Quarterly',
    price: 11000,
    duration_months: 3,
    description: '3-month premium access',
    features: ['Gym Access', 'Unlimited Classes', 'Pool Access', 'Equipment Usage'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan7',
    name: 'Basic Annual',
    price: 20000,
    duration_months: 12,
    description: '1-year basic gym access with best value',
    features: ['Gym Access', 'Equipment Usage'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan8',
    name: 'Premium Annual',
    price: 40000,
    duration_months: 12,
    description: '1-year premium access with maximum savings',
    features: ['Gym Access', 'Unlimited Classes', 'Pool Access', 'Sauna Access'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock data for MembershipAssignments
export const mockMembershipAssignments: MembershipAssignment[] = [];

// Mock data for Invoices
export const mockInvoices: Invoice[] = [];

// Mock data for Payments
export const mockPayments: Payment[] = [];

// Access type labels for UI display
export const accessTypeLabels = {
  'gym': 'Gym Access',
  'classes': 'Group Classes',
  'pool': 'Swimming Pool',
  'sauna': 'Sauna',
  'personal-training': 'Personal Training'
};
