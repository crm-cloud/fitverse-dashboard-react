import { Member } from '@/types/member';

export const mockMembers: Member[] = [
  {
    id: 'mem_001',
    fullName: 'Emily Chen',
    phone: '+1 (555) 345-6789',
    email: 'member@gymfit.com',
    dateOfBirth: new Date('1995-03-15'),
    gender: 'female',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'New York',
      pincode: '10001'
    },
    governmentId: {
      type: 'aadhaar',
      number: '1234-5678-9012'
    },
    measurements: {
      height: 175,
      weight: 70,
      fatPercentage: 15,
      musclePercentage: 40,
      bmi: 22.9
    },
    emergencyContact: {
      name: 'David Chen',
      relationship: 'Spouse',
      phone: '+1 (555) 345-6788',
      email: 'david.chen@email.com'
    },
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    membershipStatus: 'active',
    membershipPlan: 'Premium Annual',
    trainerId: '4',
    trainerName: 'Mike Rodriguez',
    joinedDate: new Date('2023-01-15'),
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: 'mem_002',
    fullName: 'Priya Patel',
    phone: '+91 9876543212',
    email: 'priya.patel@email.com',
    dateOfBirth: new Date('1992-07-22'),
    gender: 'female',
    address: {
      street: '456 Park Street',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    governmentId: {
      type: 'pan',
      number: 'ABCDE1234F'
    },
    measurements: {
      height: 165,
      weight: 60,
      fatPercentage: 18,
      musclePercentage: 35,
      bmi: 22.0
    },
    emergencyContact: {
      name: 'Raj Patel',
      relationship: 'Father',
      phone: '+91 9876543213'
    },
    profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150&h=150&fit=crop&crop=face',
    branchId: 'branch_002',
    branchName: 'Delhi CP',
    membershipStatus: 'expired',
    membershipPlan: 'Basic Monthly',
    joinedDate: new Date('2023-03-10'),
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10')
  },
  {
    id: 'mem_003',
    fullName: 'Arjun Kumar',
    phone: '+91 9876543214',
    email: 'arjun.kumar@email.com',
    dateOfBirth: new Date('1988-11-05'),
    gender: 'male',
    address: {
      street: '789 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    governmentId: {
      type: 'passport',
      number: 'A1234567'
    },
    measurements: {
      height: 180,
      weight: 85,
      fatPercentage: 12,
      musclePercentage: 45,
      bmi: 26.2
    },
    emergencyContact: {
      name: 'Sunita Kumar',
      relationship: 'Mother',
      phone: '+91 9876543215',
      email: 'sunita.kumar@email.com'
    },
    branchId: 'branch_003',
    branchName: 'Bangalore Koramangala',
    membershipStatus: 'not-assigned',
    joinedDate: new Date('2023-06-20'),
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-06-20')
  },
  {
    id: 'mem_004',
    fullName: 'Sneha Reddy',
    phone: '+91 9876543216',
    email: 'sneha.reddy@email.com',
    dateOfBirth: new Date('1996-09-12'),
    gender: 'female',
    address: {
      street: '321 Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034'
    },
    governmentId: {
      type: 'voter-id',
      number: 'ABC1234567'
    },
    measurements: {
      height: 160,
      weight: 55,
      fatPercentage: 20,
      musclePercentage: 32,
      bmi: 21.5
    },
    emergencyContact: {
      name: 'Vikram Reddy',
      relationship: 'Brother',
      phone: '+91 9876543217'
    },
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    branchId: 'branch_004',
    branchName: 'Hyderabad Jubilee Hills',
    membershipStatus: 'active',
    membershipPlan: 'Standard Quarterly',
    trainerId: 'trainer_002',
    trainerName: 'Sarah Wilson',
    joinedDate: new Date('2023-04-18'),
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2023-04-18'),
    updatedAt: new Date('2023-04-18')
  },
  {
    id: 'mem_005',
    fullName: 'Amit Singh',
    phone: '+91 9876543218',
    email: 'amit.singh@email.com',
    dateOfBirth: new Date('1990-12-03'),
    gender: 'male',
    address: {
      street: '654 Connaught Place',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    governmentId: {
      type: 'aadhaar',
      number: '9876-5432-1098'
    },
    measurements: {
      height: 178,
      weight: 75,
      fatPercentage: 14,
      musclePercentage: 42,
      bmi: 23.7
    },
    emergencyContact: {
      name: 'Kavita Singh',
      relationship: 'Spouse',
      phone: '+91 9876543219',
      email: 'kavita.singh@email.com'
    },
    branchId: 'branch_002',
    branchName: 'Delhi CP',
    membershipStatus: 'not-assigned',
    joinedDate: new Date('2023-07-05'),
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2023-07-05'),
    updatedAt: new Date('2023-07-05')
  }
];

export const mockTrainers = [
  { id: 'trainer_001', name: 'Mike Rodriguez' },
  { id: 'trainer_002', name: 'Sarah Wilson' },
  { id: 'trainer_003', name: 'David Chen' },
  { id: 'trainer_004', name: 'Lisa Thompson' }
];

export const mockBranches = [
  { id: 'branch_001', name: 'Mumbai Central' },
  { id: 'branch_002', name: 'Delhi CP' },
  { id: 'branch_003', name: 'Bangalore Koramangala' },
  { id: 'branch_004', name: 'Hyderabad Jubilee Hills' }
];