
import { TrainerProfile, TrainerAssignment, TrainerChangeRequest, TrainerUtilization, AutoAssignmentConfig } from '@/types/trainer';

export const mockTrainers: TrainerProfile[] = [
  {
    id: 'trainer_1',
    userId: '4',
    employeeId: 'EMP_TR_001',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    
    fullName: 'Mike Rodriguez',
    email: 'trainer@gymfit.com',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    joinDate: new Date('2023-03-20'),
    
    specialties: ['strength_training', 'bodybuilding', 'sports_performance'],
    certifications: [
      {
        id: 'cert_1',
        name: 'Certified Personal Trainer',
        issuingOrganization: 'NASM',
        level: 'advanced',
        issueDate: new Date('2022-01-15'),
        expiryDate: new Date('2025-01-15'),
        verified: true
      },
      {
        id: 'cert_2',
        name: 'Sports Performance Specialist',
        issuingOrganization: 'NSCA',
        level: 'expert',
        issueDate: new Date('2022-06-10'),
        expiryDate: new Date('2025-06-10'),
        verified: true
      }
    ],
    experience: 6,
    bio: 'Specialized in strength training and sports performance with over 6 years of experience helping athletes and fitness enthusiasts reach their goals.',
    languages: ['English', 'Spanish'],
    
    status: 'active',
    availability: [
      { dayOfWeek: 1, startTime: '06:00', endTime: '14:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '06:00', endTime: '14:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '06:00', endTime: '14:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '06:00', endTime: '14:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '06:00', endTime: '12:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 0, startTime: '09:00', endTime: '15:00', isAvailable: false }
    ],
    maxClientsPerDay: 8,
    maxClientsPerWeek: 40,
    
    hourlyRate: 75,
    packageRates: [
      { sessions: 4, price: 280, validityDays: 30 },
      { sessions: 8, price: 520, validityDays: 60 },
      { sessions: 12, price: 720, validityDays: 90 }
    ],
    
    rating: 4.8,
    totalSessions: 1247,
    totalClients: 156,
    completionRate: 94.5,
    punctualityScore: 97.2,
    
    isActive: true,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'trainer_2',
    userId: 'trainer_2_user',
    employeeId: 'EMP_TR_002',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    
    fullName: 'Sarah Martinez',
    email: 'sarah.martinez@gymfit.com',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150&h=150&fit=crop&crop=face',
    joinDate: new Date('2023-01-15'),
    
    specialties: ['yoga', 'pilates', 'rehabilitation', 'senior_fitness'],
    certifications: [
      {
        id: 'cert_3',
        name: 'Registered Yoga Teacher',
        issuingOrganization: 'Yoga Alliance',
        level: 'advanced',
        issueDate: new Date('2021-08-20'),
        expiryDate: new Date('2025-08-20'),
        verified: true
      },
      {
        id: 'cert_4',
        name: 'Pilates Instructor',
        issuingOrganization: 'Pilates Method Alliance',
        level: 'intermediate',
        issueDate: new Date('2022-03-10'),
        verified: true
      }
    ],
    experience: 8,
    bio: 'Yoga and Pilates specialist focused on mind-body wellness, rehabilitation, and helping seniors maintain mobility and strength.',
    languages: ['English'],
    
    status: 'active',
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '10:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: true },
      { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isAvailable: true }
    ],
    maxClientsPerDay: 6,
    maxClientsPerWeek: 30,
    
    hourlyRate: 65,
    packageRates: [
      { sessions: 4, price: 240, validityDays: 30 },
      { sessions: 8, price: 450, validityDays: 60 },
      { sessions: 12, price: 630, validityDays: 90 }
    ],
    
    rating: 4.9,
    totalSessions: 892,
    totalClients: 134,
    completionRate: 96.8,
    punctualityScore: 98.5,
    
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'trainer_3',
    userId: 'trainer_3_user',
    employeeId: 'EMP_TR_003',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    
    fullName: 'Alex Thompson',
    email: 'alex.thompson@gymfit.com',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinDate: new Date('2023-05-10'),
    
    specialties: ['cardio', 'weight_loss', 'crossfit', 'martial_arts'],
    certifications: [
      {
        id: 'cert_5',
        name: 'CrossFit Level 2 Trainer',
        issuingOrganization: 'CrossFit Inc.',
        level: 'intermediate',
        issueDate: new Date('2022-11-15'),
        expiryDate: new Date('2025-11-15'),
        verified: true
      }
    ],
    experience: 4,
    bio: 'High-intensity training specialist focusing on CrossFit, martial arts, and weight loss programs.',
    languages: ['English', 'French'],
    
    status: 'active',
    availability: [
      { dayOfWeek: 1, startTime: '14:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '14:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '14:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '14:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '16:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isAvailable: true }
    ],
    maxClientsPerDay: 10,
    maxClientsPerWeek: 45,
    
    hourlyRate: 70,
    packageRates: [
      { sessions: 4, price: 260, validityDays: 30 },
      { sessions: 8, price: 480, validityDays: 60 },
      { sessions: 12, price: 660, validityDays: 90 }
    ],
    
    rating: 4.6,
    totalSessions: 567,
    totalClients: 89,
    completionRate: 91.2,
    punctualityScore: 94.8,
    
    isActive: true,
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2024-01-05')
  }
];

export const mockTrainerAssignments: TrainerAssignment[] = [
  {
    id: 'assignment_1',
    trainerId: 'trainer_1',
    memberId: 'member_001',
    sessionType: 'single',
    
    scheduledDate: new Date('2024-01-25T10:00:00'),
    duration: 60,
    sessionType_detail: 'strength_training',
    notes: 'Focus on upper body strength',
    
    status: 'scheduled',
    
    isPaid: true,
    amount: 75,
    paymentDate: new Date('2024-01-20'),
    paymentMethod: 'credit_card',
    
    assignedBy: 'auto',
    assignmentReason: 'Best specialty match and availability',
    alternativeTrainers: ['trainer_3'],
    
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'assignment_2',
    trainerId: 'trainer_2',
    memberId: 'member_002',
    sessionType: 'package',
    packageId: 'package_yoga_8',
    
    scheduledDate: new Date('2024-01-26T14:00:00'),
    duration: 60,
    sessionType_detail: 'yoga',
    notes: 'Beginner level yoga session',
    
    status: 'completed',
    completedAt: new Date('2024-01-26T15:00:00'),
    memberRating: 5,
    memberFeedback: 'Excellent session, very calming and helpful',
    trainerNotes: 'Great progress, ready for intermediate poses',
    
    isPaid: true,
    amount: 450,
    paymentDate: new Date('2024-01-15'),
    paymentMethod: 'package_prepaid',
    
    assignedBy: 'manual',
    assignmentReason: 'Member specifically requested yoga instructor',
    
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-26')
  }
];

export const mockTrainerChangeRequests: TrainerChangeRequest[] = [
  {
    id: 'change_req_1',
    memberId: 'member_003',
    currentTrainerId: 'trainer_3',
    requestedTrainerId: 'trainer_1',
    
    reason: 'specialty_change',
    description: 'Would like to switch from cardio focus to strength training',
    urgency: 'medium',
    
    status: 'pending',
    
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  }
];

export const mockTrainerUtilization: TrainerUtilization[] = [
  {
    trainerId: 'trainer_1',
    period: 'weekly',
    date: new Date('2024-01-15'),
    
    totalAvailableHours: 48,
    bookedHours: 42,
    utilizationRate: 87.5,
    
    scheduledSessions: 42,
    completedSessions: 40,
    cancelledSessions: 1,
    noShowSessions: 1,
    
    totalRevenue: 3150,
    averageSessionValue: 75,
    
    averageRating: 4.8,
    punctualityScore: 97.2,
    
    createdAt: new Date('2024-01-22')
  },
  {
    trainerId: 'trainer_2',
    period: 'weekly',
    date: new Date('2024-01-15'),
    
    totalAvailableHours: 36,
    bookedHours: 28,
    utilizationRate: 77.8,
    
    scheduledSessions: 28,
    completedSessions: 27,
    cancelledSessions: 1,
    noShowSessions: 0,
    
    totalRevenue: 1820,
    averageSessionValue: 65,
    
    averageRating: 4.9,
    punctualityScore: 98.5,
    
    createdAt: new Date('2024-01-22')
  },
  {
    trainerId: 'trainer_3',
    period: 'weekly',
    date: new Date('2024-01-15'),
    
    totalAvailableHours: 50,
    bookedHours: 35,
    utilizationRate: 70.0,
    
    scheduledSessions: 35,
    completedSessions: 32,
    cancelledSessions: 2,
    noShowSessions: 1,
    
    totalRevenue: 2450,
    averageSessionValue: 70,
    
    averageRating: 4.6,
    punctualityScore: 94.8,
    
    createdAt: new Date('2024-01-22')
  }
];

export const mockAutoAssignmentConfig: AutoAssignmentConfig = {
  id: 'config_branch_1',
  branchId: 'branch_1',
  
  prioritizeBy: ['specialty_match', 'availability', 'rating', 'experience'],
  requireSpecialtyMatch: true,
  requireAvailability: true,
  maxPriceThreshold: 100,
  minRatingThreshold: 4.0,
  minExperienceThreshold: 2,
  
  enableLoadBalancing: true,
  maxUtilizationThreshold: 85,
  
  allowManualAssignment: true,
  notifyOnNoMatch: true,
  waitlistOnNoMatch: false,
  
  assignmentWindowHours: 24,
  
  isActive: true,
  createdAt: new Date('2023-06-01'),
  updatedAt: new Date('2024-01-10')
};
