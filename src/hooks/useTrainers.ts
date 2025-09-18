import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

interface CreateTrainerData {
  full_name: string;
  email: string;
  phone: string;
  branch_id: string;
  role: 'trainer';
  specialties?: string[];
  is_active?: boolean;
  profile_photo?: string;
}

export const useTrainers = () => {
  return useSupabaseQuery(
    ['trainers'],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('role', 'trainer')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data || [];
    }
  );
};

export const useTrainerById = (trainerId: string) => {
  return useSupabaseQuery(
    ['trainers', trainerId],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('user_id', trainerId)
        .eq('role', 'trainer')
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!trainerId
    }
  );
};

export const useCreateTrainer = () => {
  return useSupabaseMutation(
    async (data: CreateTrainerData) => {
      // First create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: 'TempPass123!', // Temporary password - should be changed on first login
        email_confirm: true,
        user_metadata: {
          full_name: data.full_name,
          phone: data.phone,
          role: 'trainer',
          branch_id: data.branch_id,
        }
      });

      if (authError) throw authError;

      // Create a simple trainer profile - use the standard profiles table instead
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          role: 'trainer',
          branch_id: data.branch_id,
          is_active: data.is_active ?? true,
        })
        .select('user_id')
        .single();

      if (profileError) throw profileError;
      return profileData.user_id;
    },
    {
      onSuccess: () => {
        // Invalidate trainer queries to refetch
      },
      invalidateQueries: [['trainers']]
    }
  );
};