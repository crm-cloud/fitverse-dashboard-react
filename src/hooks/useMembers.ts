import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const useMembers = () => {
  return useSupabaseQuery(
    ['members'],
    async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          branches!branch_id (
            name
          ),
          trainer_profiles!trainer_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

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
        .select(`
          *,
          branches!branch_id (
            name
          ),
          trainer_profiles!trainer_id (
            name
          )
        `)
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