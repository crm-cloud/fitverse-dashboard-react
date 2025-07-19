import { MembershipPlan, MembershipAssignment, Invoice, Payment } from '@/types/membership';

export const mockMembershipPlans: MembershipPlan[] = [
  {
    id: 'plan1',
    name: 'Basic Monthly',
    price: 2000,
    duration: 30,
    accessTypes: ['gym'],
    classesAllowed: 0,
    description: 'Basic gym access with all equipment',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'plan2',
    name: 'Standard Monthly',
    price: 3000,
    duration: 30,
    accessTypes: ['gym', 'classes'],
    classesAllowed: 8,
    description: 'Gym access plus 8 group classes per month',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'plan3',
    name: 'Premium Monthly',
    price: 4000,
    duration: 30,
    accessTypes: ['gym', 'classes', 'pool'],
    classesAllowed: -1,
    description: 'Full access with unlimited classes and pool',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'plan4',
    name: 'VIP Monthly',
    price: 6000,
    duration: 30,
    accessTypes: ['gym', 'classes', 'pool', 'sauna', 'personal-training'],
    classesAllowed: -1,
    description: 'Premium access with personal training sessions',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'plan5',
    name: 'Basic Quarterly',
    price: 5500,
    duration: 90,
    accessTypes: ['gym'],
    classesAllowed: 0,
    description: '3-month basic gym access',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'plan6',
    name: 'Premium Quarterly',
    price: 11000,
    duration: 90,
    accessTypes: ['gym', 'classes', 'pool'],
    classesAllowed: -1,
    description: '3-month premium access',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'plan7',
    name: 'Basic Annual',
    price: 20000,
    duration: 365,
    accessTypes: ['gym'],
    classesAllowed: 0,
    description: '1-year basic gym access with best value',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'plan8',
    name: 'Premium Annual',
    price: 40000,
    duration: 365,
    accessTypes: ['gym', 'classes', 'pool', 'sauna'],
    classesAllowed: -1,
    description: '1-year premium access with maximum savings',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock data for MembershipAssignments
export const mockMembershipAssignments: MembershipAssignment[] = [];

// Mock data for Invoices
export const mockInvoices: Invoice[] = [];

// Mock data for Payments
export const mockPayments: Payment[] = [];
