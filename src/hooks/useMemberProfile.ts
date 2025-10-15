import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMemberProfile = () => {
  const { authState } = useAuth();
  
  return useSupabaseQuery(
    ['member-profile', authState.user?.id],
    async () => {
      if (!authState.user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          branches!branch_id(name)
        `)
        .eq('user_id', authState.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      enabled: !!authState.user?.id && authState.user?.role === 'member'
    }
  );
};
