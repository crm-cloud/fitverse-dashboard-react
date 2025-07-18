
import { Referral, ReferralProgram, ReferralStats, ReferralReward } from '@/types/referral';

export const mockReferralRewards: ReferralReward[] = [
  {
    id: 'reward1',
    type: 'free_month',
    value: 1,
    description: 'One month free membership',
    conditions: ['Referee must sign up for 12-month membership']
  },
  {
    id: 'reward2',
    type: 'discount',
    value: 50,
    description: '$50 off next membership payment',
    conditions: ['Referee must complete first month']
  },
  {
    id: 'reward3',
    type: 'cash',
    value: 100,
    description: '$100 cash reward',
    conditions: ['Referee must maintain membership for 6 months']
  }
];

export const mockReferralPrograms: ReferralProgram[] = [
  {
    id: 'program1',
    name: 'Bring a Friend',
    description: 'Refer friends and family to earn rewards',
    isActive: true,
    rewards: mockReferralRewards,
    terms: 'Referee must be a new member and maintain membership for minimum duration.',
    minimumMembershipDuration: 3,
    maxRewardsPerMember: 12,
    validUntil: new Date('2024-12-31')
  }
];

export const mockReferrals: Referral[] = [
  {
    id: 'ref1',
    referrerId: 'member@gymfit.com',
    referrerName: 'Emily Chen',
    refereeEmail: 'sarah.j@email.com',
    refereeName: 'Sarah Johnson',
    status: 'pending',
    rewardType: 'free_month',
    rewardValue: 1,
    rewardDescription: 'One month free membership',
    createdAt: new Date('2024-01-16T11:00:00Z'),
    expiresAt: new Date('2024-02-16T11:00:00Z'),
    leadId: 'lead2'
  },
  {
    id: 'ref2',
    referrerId: 'member@gymfit.com',
    referrerName: 'Emily Chen',
    refereeEmail: 'jane.doe@email.com',
    refereeName: 'Jane Doe',
    status: 'completed',
    rewardType: 'discount',
    rewardValue: 50,
    rewardDescription: '$50 off next membership payment',
    createdAt: new Date('2024-01-05T14:00:00Z'),
    completedAt: new Date('2024-01-08T16:00:00Z'),
    rewardedAt: new Date('2024-01-09T10:00:00Z'),
    expiresAt: new Date('2024-02-05T14:00:00Z')
  },
  {
    id: 'ref3',
    referrerId: 'admin@gymfit.com',
    referrerName: 'Sarah Johnson (Staff)',
    refereeEmail: 'mark.smith@email.com',
    refereeName: 'Mark Smith',
    status: 'expired',
    rewardType: 'free_month',
    rewardValue: 1,
    rewardDescription: 'One month free membership',
    createdAt: new Date('2023-12-15T09:00:00Z'),
    expiresAt: new Date('2024-01-15T09:00:00Z')
  }
];

export const mockReferralStats: ReferralStats = {
  totalReferrals: 28,
  pendingReferrals: 8,
  completedReferrals: 15,
  totalRewards: 1250,
  topReferrers: [
    {
      memberId: 'member@gymfit.com',
      memberName: 'Emily Chen',
      referralCount: 5,
      totalRewards: 200
    },
    {
      memberId: 'admin@gymfit.com',
      memberName: 'Sarah Johnson',
      referralCount: 3,
      totalRewards: 150
    }
  ],
  conversionRate: 53.6,
  averageRewardValue: 83.33
};
