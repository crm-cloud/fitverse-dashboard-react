import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface Trainer {
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'trainer';
  branch_id: string | null;
  branches: {
    name: string;
  } | null;
  specialties?: string[];
  bio?: string;
  is_active: boolean;
  profile_photo?: string;
  created_at: string;
  updated_at: string;
}

interface CreateTrainerData {
  full_name: string;
  email: string;
  phone: string;
  branch_id: string;
  role: 'trainer';
  specialties?: string[];
  bio?: string;
  profile_photo?: string;
  password: string;
}

interface UpdateTrainerData extends Partial<Omit<CreateTrainerData, 'email' | 'password'>> {
  user_id: string;
  is_active?: boolean;
}

export const useTrainers = () => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all trainers for the current organization
  const {
    data: trainers = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery(
    ['trainers', authState.user?.gym_id],
    async () => {
      if (!authState.user?.gym_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('gym_id', authState.user.gym_id)
        .eq('role', 'trainer')
        .order('full_name');

      if (error) throw error;
      return data as Trainer[];
    },
    { enabled: !!authState.user?.gym_id }
  );

  // Get a single trainer by ID
  const getTrainerById = (trainerId: string) => {
    return trainers.find(trainer => trainer.user_id === trainerId);
  };

  // Create a new trainer (client-side)
  const createTrainer = useSupabaseMutation(
    async (trainerData: CreateTrainerData) => {
      if (!authState.user?.gym_id) {
        throw new Error('Gym ID not found');
      }

      // Generate temporary password if not provided
      const { generateTempPassword } = await import('@/services/userManagement');
      const password = trainerData.password || generateTempPassword();

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trainerData.email,
        password: password,
        options: {
          data: {
            full_name: trainerData.full_name,
            phone: trainerData.phone,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Wait for profile trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      // Assign trainer role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'trainer',
          branch_id: trainerData.branch_id,
        });

      if (roleError) throw roleError;

      // Update profile with gym and trainer-specific data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          gym_id: authState.user.gym_id,
          branch_id: trainerData.branch_id,
          phone: trainerData.phone,
          specialties: trainerData.specialties || [],
          bio: trainerData.bio,
          profile_photo: trainerData.profile_photo,
          is_active: true
        })
        .eq('user_id', authData.user.id);

      if (profileError) throw profileError;

      return { userId: authData.user.id, tempPassword: password };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['trainers', authState.user?.gym_id] });
        toast({
          title: 'Trainer created',
          description: 'The trainer has been added successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error creating trainer',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Update an existing trainer
  const updateTrainer = useSupabaseMutation(
    async ({ user_id, ...updates }: UpdateTrainerData) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user_id);

      if (error) throw error;
      return user_id;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['trainers', authState.user?.gym_id] });
        toast({
          title: 'Trainer updated',
          description: 'The trainer has been updated successfully.',
        });
      },
onError: (error: Error) => {
        toast({
          title: 'Error updating trainer',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Delete a trainer (soft delete by setting is_active to false)
  const deleteTrainer = useSupabaseMutation(
    async (trainerId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', trainerId);

      if (error) throw error;
      return trainerId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['trainers', authState.user?.gym_id] });
        toast({
          title: 'Trainer deactivated',
          description: 'The trainer has been deactivated successfully.',
        });
      },
onError: (error: Error) => {
        toast({
          title: 'Error deactivating trainer',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Reactivate a trainer
  const reactivateTrainer = useSupabaseMutation(
    async (trainerId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('user_id', trainerId);

      if (error) throw error;
      return trainerId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['trainers', authState.user?.gym_id] });
        toast({
          title: 'Trainer reactivated',
          description: 'The trainer has been reactivated successfully.',
        });
      },
onError: (error: Error) => {
        toast({
          title: 'Error reactivating trainer',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  return {
    trainers,
    getTrainerById,
    isLoading,
    error,
    refetch,
    createTrainer: createTrainer.mutateAsync,
    updateTrainer: updateTrainer.mutateAsync,
    deleteTrainer: deleteTrainer.mutateAsync,
    reactivateTrainer: reactivateTrainer.mutateAsync,
    isCreating: createTrainer.isPending,
    isUpdating: updateTrainer.isPending,
    isDeleting: deleteTrainer.isPending,
    isReactivating: reactivateTrainer.isPending,
  };
};

// Keep the existing useTrainerById hook for backward compatibility
export const useTrainerById = (trainerId: string) => {
  const { trainers, isLoading, error, refetch } = useTrainers();
  const trainer = trainers.find(t => t.user_id === trainerId);
  
  return {
    data: trainer,
    isLoading,
    error,
    refetch
  };
};

/**
 * @deprecated Use the main useTrainers().createTrainer instead
 * This hook is kept for backward compatibility only
 */
export const useCreateTrainer = () => {
  const { createTrainer } = useTrainers();
  
  return {
    mutateAsync: createTrainer,
    mutate: createTrainer,
    isPending: false
  };
};