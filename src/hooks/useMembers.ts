import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMembers = (filters?: { branchId?: string; search?: string; membershipStatus?: string }) => {
  const { authState } = useAuth();
  const user = authState.user;
  
  return useQuery({
    queryKey: ['members', user?.gym_id ?? 'all', filters?.branchId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Super admins can see all members
      if (user?.role === 'super-admin') {
        // No filtering needed
      }
      // Admins see all members in their gym
      else if (user?.role === 'admin' && user?.gym_id) {
        // If branchId is provided, filter by branch
        if (filters?.branchId) {
          query = query.eq('branch_id', filters.branchId);
        } else {
          // Fetch all members in all branches of this gym
          const { data: branches } = await supabase
            .from('branches')
            .select('id')
            .eq('gym_id', user.gym_id)
            .eq('status', 'active');
          
          if (branches && branches.length > 0) {
            const branchIds = branches.map((b: any) => b.id);
            query = query.in('branch_id', branchIds);
          }
        }
      }
      // Team members see only their branch members
      else if (user?.branchId) {
        query = query.eq('branch_id', user.branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.gym_id || user?.role === 'super-admin',
  });
};

export const useMemberById = (memberId: string) => {
  return useQuery({
    queryKey: ['members', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!memberId
  });
};

/**
 * Phase 5: Enable login capability for existing members
 * Re-exports the service function for convenience
 */
export { enableMemberLogin } from '@/services/userManagement';