import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMembers = (filters?: { branchId?: string; search?: string; membershipStatus?: string }) => {
  const { authState } = useAuth();
  const user = authState.user;
  
  return useSupabaseQuery(
    ['members', user?.organization_id ?? 'all', filters?.branchId ?? user?.branchId ?? 'all'],
    async () => {
      let query = supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      // Super admins can see all members
      if (user?.role === 'super-admin') {
        // No filtering needed
      }
      // Admins see all members in their organization
      else if (user?.role === 'admin' && user?.organization_id) {
        query = query.filter('organization_id', 'eq', user.organization_id);
      }
      // Team members see only their branch members
      else if (user?.branchId) {
        query = query.eq('branch_id', user.branchId);
      }

      // Apply additional filters
      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  );
};

export const useMemberById = (memberId: string) => {
  return useSupabaseQuery(
    ['members', memberId],
    async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!memberId
    }
  );
};

/**
 * Phase 5: Enable login capability for existing members
 * Re-exports the service function for convenience
 */
export { enableMemberLogin } from '@/services/userManagement';