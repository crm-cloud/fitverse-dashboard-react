import { MembershipPlan, Invoice, Payment, MembershipAssignment, AccessType } from '@/types/membership';

export const accessTypeLabels: Record<AccessType, string> = {
  'gym': 'Gym Access',
  'pool': 'Swimming Pool',
  'sauna': 'Sauna',
  'classes': 'Group Classes',
  'personal-training': 'Personal Training',
  'spa': 'Spa Services',
  'locker': 'Locker Access'
};

export const mockMembershipPlans: MembershipPlan[] = [
  {
    id: 'plan_001',
    name: 'Basic Monthly',
    price: 2500,
    duration: 30,
    accessTypes: ['gym', 'locker'],
    classesAllowed: 8,
    description: 'Basic gym access with locker facility and limited group classes',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'plan_002',
    name: 'Standard Quarterly',
    price: 6500,
    duration: 90,
    accessTypes: ['gym', 'pool', 'locker', 'classes'],
    classesAllowed: -1,
    description: 'Complete gym and pool access with unlimited group classes',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'plan_003',
    name: 'Premium Annual',
    price: 18000,
    duration: 365,
    accessTypes: ['gym', 'pool', 'sauna', 'classes', 'personal-training', 'spa', 'locker'],
    classesAllowed: -1,
    description: 'All-access premium membership with personal training sessions and spa services',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'plan_004',
    name: 'Student Special',
    price: 1800,
    duration: 30,
    accessTypes: ['gym', 'locker', 'classes'],
    classesAllowed: 12,
    description: 'Special discounted plan for students with valid ID',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'plan_005',
    name: 'Corporate Package',
    price: 12000,
    duration: 180,
    accessTypes: ['gym', 'pool', 'locker', 'classes'],
    classesAllowed: -1,
    description: 'Corporate package for company employees with flexible timings',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

export const mockMembershipAssignments: MembershipAssignment[] = [
  {
    id: 'assign_001',
    memberId: 'mem_001',
    memberName: 'Emily Chen',
    planId: 'plan_003',
    planName: 'Premium Annual',
    startDate: new Date('2023-06-10'),
    endDate: new Date('2024-06-10'),
    originalPrice: 18000,
    discountPercent: 10,
    discountAmount: 1800,
    gstEnabled: false,
    gstAmount: 0,
    finalAmount: 16200,
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    isActive: true,
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2023-06-10')
  },
  {
    id: 'assign_002',
    memberId: 'mem_002',
    memberName: 'Priya Patel',
    planId: 'plan_001',
    planName: 'Basic Monthly',
    startDate: new Date('2023-03-10'),
    endDate: new Date('2023-04-09'),
    originalPrice: 2500,
    gstEnabled: false,
    gstAmount: 0,
    finalAmount: 2500,
    branchId: 'branch_002',
    branchName: 'Delhi CP',
    isActive: false, // expired
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2023-03-10')
  },
  {
    id: 'assign_003',
    memberId: 'mem_004',
    memberName: 'Sneha Reddy',
    planId: 'plan_002',
    planName: 'Standard Quarterly',
    startDate: new Date('2023-04-18'),
    endDate: new Date('2023-07-17'),
    originalPrice: 6500,
    gstEnabled: true,
    gstAmount: 1170, // 18% GST
    finalAmount: 7670,
    branchId: 'branch_004',
    branchName: 'Hyderabad Jubilee Hills',
    isActive: false, // expired
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2023-04-18')
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'GYM-2023-001',
    membershipId: 'assign_001',
    memberId: 'mem_001',
    memberName: 'Emily Chen',
    planName: 'Premium Annual',
    originalAmount: 18000,
    discountAmount: 1800,
    gstAmount: 0,
    finalAmount: 16200,
    issueDate: new Date('2023-01-15'),
    dueDate: new Date('2023-01-25'),
    paymentStatus: 'paid',
    branchId: 'branch_001',
    branchName: 'Mumbai Central',
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'inv_002',
    invoiceNumber: 'GYM-2023-002',
    membershipId: 'assign_002',
    memberId: 'mem_002',
    memberName: 'Priya Patel',
    planName: 'Basic Monthly',
    originalAmount: 2500,
    discountAmount: 0,
    gstAmount: 0,
    finalAmount: 2500,
    issueDate: new Date('2023-03-10'),
    dueDate: new Date('2023-03-20'),
    paymentStatus: 'paid',
    branchId: 'branch_002',
    branchName: 'Delhi CP',
    createdAt: new Date('2023-03-10')
  },
  {
    id: 'inv_003',
    invoiceNumber: 'GYM-2023-003',
    membershipId: 'assign_003',
    memberId: 'mem_004',
    memberName: 'Sneha Reddy',
    planName: 'Standard Quarterly',
    originalAmount: 6500,
    discountAmount: 0,
    gstAmount: 1170,
    finalAmount: 7670,
    issueDate: new Date('2023-04-18'),
    dueDate: new Date('2023-04-28'),
    paymentStatus: 'paid',
    branchId: 'branch_004',
    branchName: 'Hyderabad Jubilee Hills',
    createdAt: new Date('2023-04-18')
  },
  // Unpaid invoice for member without assignment
  {
    id: 'inv_004',
    invoiceNumber: 'GYM-2024-001',
    membershipId: 'assign_004',
    memberId: 'mem_003',
    memberName: 'Arjun Kumar',
    planName: 'Premium Annual',
    originalAmount: 18000,
    discountAmount: 0,
    gstAmount: 3240, // 18% GST
    finalAmount: 21240,
    issueDate: new Date('2024-01-10'),
    dueDate: new Date('2024-01-20'),
    paymentStatus: 'overdue',
    branchId: 'branch_003',
    branchName: 'Bangalore Koramangala',
    createdAt: new Date('2024-01-10')
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'pay_001',
    invoiceId: 'inv_001',
    amount: 16200,
    paymentMethod: 'upi',
    referenceNumber: 'UPI123456789',
    paymentDate: new Date('2023-01-20'),
    recordedBy: 'admin@gymfit.com',
    notes: 'Payment received via UPI',
    createdAt: new Date('2023-01-20')
  },
  {
    id: 'pay_002',
    invoiceId: 'inv_002',
    amount: 2500,
    paymentMethod: 'cash',
    paymentDate: new Date('2023-03-15'),
    recordedBy: 'admin@gymfit.com',
    notes: 'Cash payment at front desk',
    createdAt: new Date('2023-03-15')
  },
  {
    id: 'pay_003',
    invoiceId: 'inv_003',
    amount: 7670,
    paymentMethod: 'card',
    referenceNumber: 'CARD789012345',
    paymentDate: new Date('2023-04-25'),
    recordedBy: 'admin@gymfit.com',
    createdAt: new Date('2023-04-25')
  }
];