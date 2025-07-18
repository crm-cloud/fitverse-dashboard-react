
export type ReferralStatus = 'pending' | 'completed' | 'rewarded' | 'expired';
export type RewardType = 'discount' | 'cash' | 'free_month' | 'points' | 'merchandise';

export interface Referral {
  id: string;
  referrerId: string; // Member who made the referral
  referrerName: string;
  refereeEmail: string;
  refereeName: string;
  status: ReferralStatus;
  rewardType: RewardType;
  rewardValue: number;
  rewardDescription: string;
  createdAt: Date;
  completedAt?: Date;
  rewardedAt?: Date;
  expiresAt: Date;
  leadId?: string; // Associated lead ID
  notes?: string;
}

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  rewards: ReferralReward[];
  terms: string;
  minimumMembershipDuration: number; // months
  maxRewardsPerMember: number;
  validUntil?: Date;
}

export interface ReferralReward {
  id: string;
  type: RewardType;
  value: number;
  description: string;
  conditions: string[];
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalRewards: number;
  topReferrers: Array<{
    memberId: string;
    memberName: string;
    referralCount: number;
    totalRewards: number;
  }>;
  conversionRate: number;
  averageRewardValue: number;
}
