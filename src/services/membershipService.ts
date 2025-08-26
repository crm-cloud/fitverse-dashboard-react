import { api } from '@/lib/axios';

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'month' | 'year';
  features: string[];
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutSessionParams {
  planId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export const membershipService = {
  async getAvailablePlans(): Promise<MembershipPlan[]> {
    try {
      const { data } = await api.get<MembershipPlan[]>('/membership/plans');
      return data;
    } catch (error) {
      console.error('Failed to fetch membership plans:', error);
      throw error;
    }
  },

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ sessionId: string; url: string }> {
    try {
      const { data } = await api.post<{ sessionId: string; url: string }>('/membership/checkout/session', params);
      return data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  },

  async getPlanDetails(planId: string): Promise<MembershipPlan> {
    try {
      const { data } = await api.get<MembershipPlan>(`/membership/plans/${planId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch plan ${planId}:`, error);
      throw error;
    }
  },

  async getActiveMembership(): Promise<{
    plan: MembershipPlan;
    status: 'active' | 'cancelled' | 'paused' | 'expired';
    nextBillingDate: string;
  } | null> {
    try {
      const { data } = await api.get('/membership/active');
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No active membership
      }
      console.error('Failed to fetch active membership:', error);
      throw error;
    }
  },

  async cancelMembership(membershipId: string): Promise<void> {
    try {
      await api.post(`/membership/${membershipId}/cancel`);
    } catch (error) {
      console.error('Failed to cancel membership:', error);
      throw error;
    }
  },

  async updatePaymentMethod(membershipId: string, paymentMethodId: string): Promise<void> {
    try {
      await api.post(`/membership/${membershipId}/payment-method`, { paymentMethodId });
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw error;
    }
  },
};

export default membershipService;
