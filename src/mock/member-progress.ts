
import { MeasurementHistory, AttendanceRecord, MemberGoal, ProgressSummary } from '@/types/member-progress';

export const mockMeasurementHistory: MeasurementHistory[] = [
  {
    id: 'measurement_001',
    memberId: 'mem_001',
    date: new Date('2024-01-15'),
    weight: 75.5,
    bodyFat: 18,
    muscleMass: 42,
    bmi: 24.6,
    notes: 'Starting measurements',
    recordedBy: 'trainer@gymfit.com',
    recordedByName: 'Mike Rodriguez'
  },
  {
    id: 'measurement_002',
    memberId: 'mem_001',
    date: new Date('2024-02-15'),
    weight: 73.8,
    bodyFat: 16.5,
    muscleMass: 43.5,
    bmi: 24.1,
    notes: 'Good progress on diet plan',
    recordedBy: 'trainer@gymfit.com',
    recordedByName: 'Mike Rodriguez'
  },
  {
    id: 'measurement_003',
    memberId: 'mem_001',
    date: new Date('2024-03-15'),
    weight: 72.2,
    bodyFat: 15.2,
    muscleMass: 44.8,
    bmi: 23.6,
    notes: 'Excellent muscle gain while losing fat',
    recordedBy: 'trainer@gymfit.com',
    recordedByName: 'Mike Rodriguez',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop'
    ]
  }
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  // January records
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `attendance_jan_${i + 1}`,
    memberId: 'mem_001',
    date: new Date(2024, 0, i * 2 + 1), // Every other day in January
    checkInTime: new Date(2024, 0, i * 2 + 1, 7 + (i % 3), 0),
    checkOutTime: new Date(2024, 0, i * 2 + 1, 8 + (i % 3), 30),
    activityType: 'gym' as const,
    branchId: 'branch_001',
    branchName: 'Mumbai Central'
  })),
  // February records
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `attendance_feb_${i + 1}`,
    memberId: 'mem_001',
    date: new Date(2024, 1, i + 1),
    checkInTime: new Date(2024, 1, i + 1, 6 + (i % 4), 0),
    checkOutTime: new Date(2024, 1, i + 1, 7 + (i % 4), 45),
    activityType: i % 3 === 0 ? 'class' : 'gym' as const,
    activityId: i % 3 === 0 ? `class_${i}` : undefined,
    activityName: i % 3 === 0 ? 'HIIT Training' : undefined,
    branchId: 'branch_001',
    branchName: 'Mumbai Central'
  })),
  // March records (more frequent)
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `attendance_mar_${i + 1}`,
    memberId: 'mem_001',
    date: new Date(2024, 2, i + 1),
    checkInTime: new Date(2024, 2, i + 1, 6 + (i % 3), 0),
    checkOutTime: new Date(2024, 2, i + 1, 8 + (i % 3), 0),
    activityType: i % 4 === 0 ? 'personal-training' : i % 4 === 1 ? 'class' : 'gym' as const,
    activityId: i % 4 === 0 ? `pt_${i}` : i % 4 === 1 ? `class_${i}` : undefined,
    activityName: i % 4 === 0 ? 'Personal Training' : i % 4 === 1 ? 'Yoga Flow' : undefined,
    branchId: 'branch_001',
    branchName: 'Mumbai Central'
  }))
];

export const mockMemberGoals: MemberGoal[] = [
  {
    id: 'goal_001',
    memberId: 'mem_001',
    type: 'weight-loss',
    title: 'Reach Target Weight',
    description: 'Lose 5kg by the end of March',
    targetValue: 70,
    currentValue: 72.2,
    unit: 'kg',
    targetDate: new Date('2024-03-31'),
    status: 'active',
    createdBy: 'mem_001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 'goal_002',
    memberId: 'mem_001',
    type: 'muscle-gain',
    title: 'Increase Muscle Mass',
    description: 'Gain muscle mass to 45%',
    targetValue: 45,
    currentValue: 44.8,
    unit: '%',
    targetDate: new Date('2024-06-30'),
    status: 'active',
    createdBy: 'trainer@gymfit.com',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15')
  }
];

export const mockProgressSummary: Record<string, ProgressSummary> = {
  'mem_001': {
    memberId: 'mem_001',
    currentWeight: 72.2,
    weightChange: -3.3,
    weightChangePercentage: -4.4,
    bmiChange: -1.0,
    bodyFatChange: -2.8,
    muscleMassChange: 2.8,
    totalVisits: 58,
    visitsThisMonth: 25,
    lastVisit: new Date('2024-03-31'),
    consecutiveDays: 5,
    averageVisitsPerWeek: 5.2
  }
};
