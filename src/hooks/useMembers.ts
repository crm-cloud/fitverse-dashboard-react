import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const supabaseClient = supabase as any;

export const useMembers = (filters?: { branchId?: string; search?: string; membershipStatus?: string }) => {
  const { authState } = useAuth();
  const user = authState.user;
  
  return useQuery<any[]>({
    queryKey: ['members', user?.gym_id ?? 'all', filters?.branchId ?? 'all'],
    queryFn: async (): Promise<any[]> => {
      // Super admins can see all members
      if (user?.role === 'super-admin') {
        const result = await supabaseClient
          .from('members')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (result.error) throw result.error;
        return result.data || [];
      }
      
      // Admins see all members in their gym
      if (user?.role === 'admin' && user?.gym_id) {
        // If branchId is provided, filter by branch
        if (filters?.branchId) {
          const result = await supabaseClient
            .from('members')
            .select('*')
            .eq('is_active', true)
            .eq('branch_id', filters.branchId)
            .order('created_at', { ascending: false });
          
          if (result.error) throw result.error;
          return result.data || [];
        } else {
          // Fetch all members in all branches of this gym
          const branchesResult = await supabaseClient
            .from('branches')
            .select('id')
            .eq('gym_id', user.gym_id)
            .eq('status', 'active');
          
          const branches = branchesResult.data;
          
          if (branches && branches.length > 0) {
            const branchIds = branches.map((b: any) => b.id);
            const result = await supabaseClient
              .from('members')
              .select('*')
              .eq('is_active', true)
              .in('branch_id', branchIds)
              .order('created_at', { ascending: false });
            
            if (result.error) throw result.error;
            return result.data || [];
          }
        }
      }
      
      // Team members see only their branch members
      if (user?.branchId) {
        const result = await supabaseClient
          .from('members')
          .select('*')
          .eq('is_active', true)
          .eq('branch_id', user.branchId)
          .order('created_at', { ascending: false });
        
        if (result.error) throw result.error;
        return result.data || [];
      }

      return [];
    },
    enabled: !!user?.gym_id || user?.role === 'super-admin',
  });
};

export const useMemberById = (memberId: string) => {
  return useQuery<any>({
    queryKey: ['members', memberId],
    queryFn: async (): Promise<any> => {
      const result = await supabaseClient
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!memberId
  });
};

/**
 * Phase 5: Enable login capability for existing members
 * Re-exports the service function for convenience
 */
export { enableMemberLogin } from '@/services/userManagement';