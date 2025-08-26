import { GymClass, ClassEnrollment, ClassTag } from '@/types/class';

export const classTagLabels: Record<ClassTag, string> = {
  'strength': 'Strength Training',
  'cardio': 'Cardio',
  'flexibility': 'Flexibility',
  'dance': 'Dance',
  'martial-arts': 'Martial Arts',
  'water': 'Water Sports',
  'mind-body': 'Mind & Body'
};

export const mockClasses: GymClass[] = [
  {
    id: 'class_001',
    name: 'Morning HIIT',
    description: 'High-intensity interval training to kickstart your day',
    startTime: new Date(Date.now() + 86400000 * 1), // Tomorrow at 6 AM
    endTime: new Date(Date.now() + 86400000 * 1 + 3600000), // +1 hour
    recurrence: 'daily',
    trainerId: 'trainer_001',
    trainerName: 'Mike Rodriguez',
    branchId: 'branch_001',
    branchName: 'Mumbai Central',
    capacity: 20,
    enrolledCount: 15,
    tags: ['cardio', 'strength'],
    status: 'scheduled',
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'class_002',
    name: 'Zumba Fitness',
    description: 'Fun dance workout that combines Latin rhythms with cardio',
    startTime: new Date(Date.now() + 86400000 * 2 + 18 * 3600000), // Day after tomorrow at 6 PM
    endTime: new Date(Date.now() + 86400000 * 2 + 19 * 3600000), // +1 hour
    recurrence: 'weekly',
    trainerId: 'trainer_002',
    trainerName: 'Sarah Wilson',
    branchId: 'branch_002',
    branchName: 'Delhi CP',
    capacity: 25,
    enrolledCount: 22,
    tags: ['dance', 'cardio'],
    status: 'scheduled',
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'class_003',
    name: 'Yoga Flow',
    description: 'Gentle yoga session focusing on breath and movement',
    startTime: new Date(Date.now() + 86400000 * 1 + 7.5 * 3600000), // Tomorrow at 7:30 AM
    endTime: new Date(Date.now() + 86400000 * 1 + 8.5 * 3600000), // +1 hour
    recurrence: 'daily',
    trainerId: 'trainer_003',
    trainerName: 'David Chen',
    branchId: 'branch_003',
    branchName: 'Bangalore Koramangala',
    capacity: 15,
    enrolledCount: 12,
    tags: ['mind-body', 'flexibility'],
    status: 'scheduled',
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'class_004',
    name: 'CrossFit Challenge',
    description: 'Intense functional fitness workout',
    startTime: new Date(Date.now() + 86400000 * 2 + 19 * 3600000), // Day after tomorrow at 7 PM
    endTime: new Date(Date.now() + 86400000 * 2 + 20 * 3600000), // +1 hour
    recurrence: 'weekly',
    trainerId: 'trainer_004',
    trainerName: 'Lisa Thompson',
    branchId: 'branch_004',
    branchName: 'Hyderabad Jubilee Hills',
    capacity: 12,
    enrolledCount: 12,
    tags: ['strength', 'cardio'],
    status: 'scheduled',
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'class_005',
    name: 'Swimming Basics',
    description: 'Learn basic swimming techniques and water safety',
    startTime: new Date(Date.now() + 86400000 * 3 + 16 * 3600000), // 3 days from now at 4 PM
    endTime: new Date(Date.now() + 86400000 * 3 + 17 * 3600000), // +1 hour
    recurrence: 'weekly',
    trainerId: 'trainer_001',
    trainerName: 'Mike Rodriguez',
    branchId: 'branch_001',
    branchName: 'Mumbai Central',
    capacity: 8,
    enrolledCount: 5,
    tags: ['water', 'cardio'],
    status: 'scheduled',
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockClassEnrollments: ClassEnrollment[] = [
  {
    id: 'enroll_001',
    classId: 'class_001',
    memberId: 'mem_001',
    memberName: 'Rahul Sharma',
    enrolledAt: new Date('2024-01-15'),
    status: 'enrolled'
  },
  {
    id: 'enroll_002',
    classId: 'class_001',
    memberId: 'mem_004',
    memberName: 'Sneha Reddy',
    enrolledAt: new Date('2024-01-16'),
    status: 'enrolled'
  },
  {
    id: 'enroll_003',
    classId: 'class_002',
    memberId: 'mem_002',
    memberName: 'Priya Patel',
    enrolledAt: new Date('2024-01-14'),
    status: 'enrolled'
  },
  {
    id: 'enroll_004',
    classId: 'class_003',
    memberId: 'mem_003',
    memberName: 'Arjun Kumar',
    enrolledAt: new Date('2024-01-17'),
    status: 'enrolled'
  }
];