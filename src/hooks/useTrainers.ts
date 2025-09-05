import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const useTrainers = () => {
  return useSupabaseQuery(
    ['trainer_profiles'],
    async () => {
      const { data, error } = await supabase
        .from('trainer_profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    }
  );
};

export const useTrainerById = (trainerId: string) => {
  return useSupabaseQuery(
    ['trainer_profiles', trainerId],
    async () => {
      const { data, error } = await supabase
        .from('trainer_profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('id', trainerId)
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!trainerId
    }
  );
};