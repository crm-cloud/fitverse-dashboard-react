
import { TrainerProfile, TrainerAssignment, TrainerUtilization } from '@/types/trainer';

// Enhanced trainer profiles with more realistic data
export const enhancedTrainers: TrainerProfile[] = [
  {
    id: 'trainer_001',
    userId: 'user_001',
    employeeId: 'EMP001',
    branchId: 'branch_001',
    branchName: 'Downtown Fitness Center',
    
    fullName: 'Alex Rodriguez',
    email: 'alex.rodriguez@gym.com',
    phone: '+1-555-0123',
    avatar: '/placeholder-avatar.jpg',
    dateOfBirth: new Date('1988-03-15'),
    joinDate: new Date('2020-01-15'),
    
    specialties: ['strength_training', 'bodybuilding', 'sports_performance'],
    certifications: [
      {
        id: 'cert_001',
        name: 'NASM Certified Personal Trainer',
        issuingOrganization: 'NASM',
        level: 'advanced',
        issueDate: new Date('2019-06-01'),
        expiryDate: new Date('2025-06-01'),
        verified: true
      },
      {
        id: 'cert_002',
        name: 'Precision Nutrition Level 1',
        issuingOrganization: 'Precision Nutrition',
        level: 'intermediate',
        issueDate: new Date('2020-03-01'),
        expiryDate: new Date('2025-03-01'),
        verified: true
      }
    ],
    experience: 6,
    bio: 'Passionate strength and conditioning coach with 6+ years of experience helping clients achieve their fitness goals. Specializes in powerlifting, bodybuilding, and athletic performance enhancement.',
    languages: ['English', 'Spanish'],
    
    status: 'active',
    availability: [
      { dayOfWeek: 1, startTime: '06:00', endTime: '14:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '06:00', endTime: '14:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '06:00', endTime: '14:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '06:00', endTime: '14:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '06:00', endTime: '14:00', isAvailable: true }
    ],
    maxClientsPerDay: 8,
    maxClientsPerWeek: 35,
    
    hourlyRate: 85,
    packageRates: [
      { sessions: 5, price: 400, validityDays: 60 },
      { sessions: 10, price: 750, validityDays: 90 },
      { sessions: 20, price: 1400, validityDays: 120 }
    ],
    
    rating: 4.8,
    totalSessions: 1247,
    totalClients: 89,
    completionRate: 96,
    punctualityScore: 98,
    
    isActive: true,
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'trainer_002',
    userId: 'user_002',
    employeeId: 'EMP002',
    branchId: 'branch_001',
    branchName: 'Downtown Fitness Center',
    
    fullName: 'Maya Patel',
    email: 'maya.patel@gym.com',
    phone: '+1-555-0124',
    avatar: '/placeholder-avatar.jpg',
    dateOfBirth: new Date('1990-07-22'),
    joinDate: new Date('2021-03-01'),
    
    specialties: ['yoga', 'pilates', 'rehabilitation', 'senior_fitness'],
    certifications: [
      {
        id: 'cert_003',
        name: '500-Hour Yoga Teacher Training',
        issuingOrganization: 'Yoga Alliance',
        level: 'expert',
        issueDate: new Date('2018-08-01'),
        expiryDate: new Date('2026-08-01'),
        verified: true
      },
      {
        id: 'cert_004',
        name: 'ACSM Physical Therapy Assistant',
        issuingOrganization: 'ACSM',
        level: 'advanced',
        issueDate: new Date('2020-01-01'),
        expiryDate: new Date('2025-01-01'),
        verified: true
      }
    ],
    experience: 8,
    bio: 'Certified yoga instructor and movement specialist focused on holistic wellness and injury prevention. Experienced in working with diverse populations including seniors and rehabilitation clients.',
    languages: ['English', 'Hindi', 'Gujarati'],
    
    status: 'active',
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isAvailable: true }
    ],
    maxClientsPerDay: 6,
    maxClientsPerWeek: 25,
    
    hourlyRate: 75,
    packageRates: [
      { sessions: 4, price: 280, validityDays: 45 },
      { sessions: 8, price: 520, validityDays: 75 },
      { sessions: 12, price: 720, validityDays: 90 }
    ],
    
    rating: 4.9,
    totalSessions: 892,
    totalClients: 67,
    completionRate: 98,
    punctualityScore: 99,
    
    isActive: true,
    createdAt: new Date('2021-03-01'),
    updatedAt: new Date()
  },
  {
    id: 'trainer_003',
    userId: 'user_003',
    employeeId: 'EMP003',
    branchId: 'branch_001',
    branchName: 'Downtown Fitness Center',
    
    fullName: 'Jordan Kim',
    email: 'jordan.kim@gym.com',
    phone: '+1-555-0125',
    avatar: '/placeholder-avatar.jpg',
    dateOfBirth: new Date('1985-11-08'),
    joinDate: new Date('2019-09-01'),
    
    specialties: ['crossfit', 'martial_arts', 'cardio', 'youth_fitness'],
    certifications: [
      {
        id: 'cert_005',
        name: 'CrossFit Level 2 Trainer',
        issuingOrganization: 'CrossFit Inc.',
        level: 'advanced',
        issueDate: new Date('2019-05-01'),
        expiryDate: new Date('2025-05-01'),
        verified: true
      },
      {
        id: 'cert_006',
        name: 'USA Boxing Coach Certification',
        issuingOrganization: 'USA Boxing',
        level: 'intermediate',
        issueDate: new Date('2018-12-01'),
        expiryDate: new Date('2024-12-01'),
        verified: true
      }
    ],
    experience: 9,
    bio: 'High-energy trainer specializing in functional fitness, martial arts, and youth development. Former competitive boxer with extensive experience in CrossFit methodology.',
    languages: ['English', 'Korean'],
    
    status: 'active',
    availability: [
      { dayOfWeek: 1, startTime: '16:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '16:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '16:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '16:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '08:00', endTime: '16:00', isAvailable: true }
    ],
    maxClientsPerDay: 10,
    maxClientsPerWeek: 40,
    
    hourlyRate: 80,
    packageRates: [
      { sessions: 6, price: 450, validityDays: 60 },
      { sessions: 12, price: 840, validityDays: 90 },
      { sessions: 24, price: 1560, validityDays: 120 }
    ],
    
    rating: 4.7,
    totalSessions: 1534,
    totalClients: 102,
    completionRate: 94,
    punctualityScore: 96,
    
    isActive: true,
    createdAt: new Date('2019-09-01'),
    updatedAt: new Date()
  }
];

// Enhanced assignment data with more variety
export const enhancedAssignments: TrainerAssignment[] = [
  {
    id: 'assignment_001',
    trainerId: 'trainer_001',
    memberId: 'member_001',
    sessionType: 'single',
    
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    duration: 60,
    sessionType_detail: 'strength_training',
    notes: 'Focus on compound movements and progressive overload',
    
    status: 'scheduled',
    isPaid: true,
    amount: 85,
    paymentDate: new Date(),
    paymentMethod: 'credit_card',
    
    assignedBy: 'auto',
    assignmentReason: 'Best specialty match and availability',
    alternativeTrainers: ['trainer_003'],
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'assignment_002',
    trainerId: 'trainer_002',
    memberId: 'member_002',
    sessionType: 'package',
    packageId: 'package_001',
    
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: 45,
    sessionType_detail: 'yoga',
    notes: 'Therapeutic yoga for lower back pain relief',
    
    status: 'scheduled',
    isPaid: true,
    amount: 75,
    paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    paymentMethod: 'package_credit',
    
    assignedBy: 'manual',
    assignmentReason: 'Member request for specific trainer',
    
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: 'assignment_003',
    trainerId: 'trainer_003',
    memberId: 'member_003',
    sessionType: 'single',
    
    scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    duration: 50,
    sessionType_detail: 'crossfit',
    notes: 'High-intensity workout with Olympic lifts',
    
    status: 'completed',
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    memberRating: 5,
    memberFeedback: 'Amazing session! Jordan pushed me to my limits while keeping perfect form.',
    trainerNotes: 'Client showed great improvement in snatch technique. Ready for heavier weights.',
    
    isPaid: true,
    amount: 80,
    paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    paymentMethod: 'debit_card',
    
    assignedBy: 'member_request',
    assignmentReason: 'Member specifically requested CrossFit training',
    
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

// Enhanced utilization data
export const enhancedUtilization: TrainerUtilization[] = [
  {
    trainerId: 'trainer_001',
    period: 'weekly',
    date: new Date(),
    
    totalAvailableHours: 40,
    bookedHours: 32,
    utilizationRate: 80,
    
    scheduledSessions: 30,
    completedSessions: 28,
    cancelledSessions: 2,
    noShowSessions: 0,
    
    totalRevenue: 2380,
    averageSessionValue: 85,
    
    averageRating: 4.8,
    punctualityScore: 98,
    
    createdAt: new Date()
  },
  {
    trainerId: 'trainer_002',
    period: 'weekly',
    date: new Date(),
    
    totalAvailableHours: 35,
    bookedHours: 28,
    utilizationRate: 80,
    
    scheduledSessions: 25,
    completedSessions: 24,
    cancelledSessions: 1,
    noShowSessions: 0,
    
    totalRevenue: 1800,
    averageSessionValue: 75,
    
    averageRating: 4.9,
    punctualityScore: 99,
    
    createdAt: new Date()
  },
  {
    trainerId: 'trainer_003',
    period: 'weekly',
    date: new Date(),
    
    totalAvailableHours: 42,
    bookedHours: 38,
    utilizationRate: 90,
    
    scheduledSessions: 35,
    completedSessions: 33,
    cancelledSessions: 1,
    noShowSessions: 1,
    
    totalRevenue: 2640,
    averageSessionValue: 80,
    
    averageRating: 4.7,
    punctualityScore: 96,
    
    createdAt: new Date()
  }
];
