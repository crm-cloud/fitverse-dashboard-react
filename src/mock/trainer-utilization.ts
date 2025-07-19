// Mock trainer utilization data
export interface MockTrainerUtilization {
  id: string;
  trainerId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
  totalAvailableHours: number;
  bookedHours: number;
  utilizationRate: number;
  scheduledSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  totalRevenue: number;
  averageSessionValue: number;
  averageRating: number;
  punctualityScore: number;
}

export const mockTrainerUtilization: MockTrainerUtilization[] = [
  // Daily data for trainer_001
  {
    id: 'util_001',
    trainerId: 'trainer_001',
    period: 'daily',
    date: new Date('2024-01-15'),
    totalAvailableHours: 8,
    bookedHours: 6.5,
    utilizationRate: 81.25,
    scheduledSessions: 6,
    completedSessions: 5,
    cancelledSessions: 1,
    noShowSessions: 0,
    totalRevenue: 450,
    averageSessionValue: 90,
    averageRating: 4.6,
    punctualityScore: 95
  },
  {
    id: 'util_002',
    trainerId: 'trainer_002',
    period: 'daily',
    date: new Date('2024-01-15'),
    totalAvailableHours: 8,
    bookedHours: 7.0,
    utilizationRate: 87.5,
    scheduledSessions: 7,
    completedSessions: 7,
    cancelledSessions: 0,
    noShowSessions: 0,
    totalRevenue: 525,
    averageSessionValue: 75,
    averageRating: 4.8,
    punctualityScore: 98
  },
  // Weekly data
  {
    id: 'util_003',
    trainerId: 'trainer_001',
    period: 'weekly',
    date: new Date('2024-01-08'),
    totalAvailableHours: 40,
    bookedHours: 32.5,
    utilizationRate: 81.25,
    scheduledSessions: 30,
    completedSessions: 28,
    cancelledSessions: 2,
    noShowSessions: 0,
    totalRevenue: 2250,
    averageSessionValue: 80,
    averageRating: 4.7,
    punctualityScore: 96
  },
  {
    id: 'util_004',
    trainerId: 'trainer_002',
    period: 'weekly',
    date: new Date('2024-01-08'),
    totalAvailableHours: 40,
    bookedHours: 35.0,
    utilizationRate: 87.5,
    scheduledSessions: 35,
    completedSessions: 33,
    cancelledSessions: 1,
    noShowSessions: 1,
    totalRevenue: 2625,
    averageSessionValue: 75,
    averageRating: 4.8,
    punctualityScore: 97
  },
  // Monthly data
  {
    id: 'util_005',
    trainerId: 'trainer_001',
    period: 'monthly',
    date: new Date('2024-01-01'),
    totalAvailableHours: 160,
    bookedHours: 130,
    utilizationRate: 81.25,
    scheduledSessions: 120,
    completedSessions: 115,
    cancelledSessions: 3,
    noShowSessions: 2,
    totalRevenue: 9200,
    averageSessionValue: 80,
    averageRating: 4.7,
    punctualityScore: 94
  },
  {
    id: 'util_006',
    trainerId: 'trainer_002',
    period: 'monthly',
    date: new Date('2024-01-01'),
    totalAvailableHours: 160,
    bookedHours: 140,
    utilizationRate: 87.5,
    scheduledSessions: 140,
    completedSessions: 135,
    cancelledSessions: 3,
    noShowSessions: 2,
    totalRevenue: 10500,
    averageSessionValue: 75,
    averageRating: 4.8,
    punctualityScore: 96
  }
];