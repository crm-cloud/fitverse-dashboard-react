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
    ['trainers', authState.user?.organization_id],
    async () => {
      if (!authState.user?.organization_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .filter('organization_id', 'eq', authState.user.organization_id)
        .eq('role', 'trainer')
        .order('full_name');

      if (error) throw error;
      return data as Trainer[];
    },
    { enabled: !!authState.user?.organization_id }
  );

  // Get a single trainer by ID
  const getTrainerById = (trainerId: string) => {
    return trainers.find(trainer => trainer.user_id === trainerId);
  };

  // Create a new trainer
  const createTrainer = useSupabaseMutation(
    async (trainerData: CreateTrainerData) => {
      if (!authState.user?.organization_id) {
        throw new Error('No organization selected');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trainerData.email,
        password: trainerData.password,
        options: {
          data: {
            full_name: trainerData.full_name,
            phone: trainerData.phone,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: authData.user.id,
          email: trainerData.email,
          full_name: trainerData.full_name,
          phone: trainerData.phone,
          role: 'trainer',
          branch_id: trainerData.branch_id,
          organization_id: authState.user.organization_id,
          specialties: trainerData.specialties || [],
          bio: trainerData.bio,
          profile_photo: trainerData.profile_photo,
          is_active: true
        }]);

      if (profileError) throw profileError;

      return authData.user.id;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['trainers', authState.user?.organization_id] });
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
        queryClient.invalidateQueries({ queryKey: ['trainers', authState.user?.organization_id] });
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
        queryClient.invalidateQueries({ queryKey: ['trainers', authState.user?.organization_id] });
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
        queryClient.invalidateQueries({ queryKey: ['trainers', authState.user?.organization_id] });
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

export const useCreateTrainer = () => {
  return useSupabaseMutation(
    async (data: CreateTrainerData & { is_active?: boolean }) => {
      // Call the secure edge function to create trainer account
      const { data: result, error } = await supabase.functions.invoke('create-trainer-account', {
        body: {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          branch_id: data.branch_id,
          specialties: data.specialties,
          is_active: data.is_active ?? true,
          profile_photo: data.profile_photo
        }
      });

      if (error) throw error;
      if (!result.success) throw new Error(result.error || 'Failed to create trainer');

      return result.userId;
    },
    {
      onSuccess: () => {
        // Invalidate trainer queries to refetch
      },
      invalidateQueries: [['trainers']]
    }
  );
};