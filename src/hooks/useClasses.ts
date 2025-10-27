import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export type ClassStatus = 'scheduled' | 'completed' | 'cancelled' | 'postponed';
export type ClassRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface GymClass {
  id: string;
  name: string;
  description: string;
  branch_id: string;
  trainer_id: string;
  room_id?: string;
  capacity: number;
  current_attendees: number;
  start_time: string;
  end_time: string;
  status: ClassStatus;
  tags: string[];
  recurrence: ClassRecurrence;
  recurrence_end_date?: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  branches?: {
    name: string;
  };
  trainer_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
  rooms?: {
    name: string;
    capacity: number;
  };
}

interface CreateClassData extends Omit<GymClass, 'id' | 'created_at' | 'updated_at' | 'current_attendees' | 'branches' | 'trainer_profiles' | 'rooms'> {
  // Add any additional fields needed for creation
}

interface UpdateClassData extends Partial<Omit<GymClass, 'id' | 'created_at' | 'updated_at' | 'branches' | 'trainer_profiles' | 'rooms'>> {
  id: string;
}

export const useGymClasses = (filters: {
  status?: ClassStatus | ClassStatus[];
  branch_id?: string;
  trainer_id?: string;
  start_date?: string;
  end_date?: string;
  include_past?: boolean;
} = {}) => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  // Build query based on filters
  const buildQuery = (query: any) => {
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }
    
    if (filters.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }
    
    if (filters.trainer_id) {
      query = query.eq('trainer_id', filters.trainer_id);
    }
    
    if (filters.start_date) {
      query = query.gte('start_time', filters.start_date);
    }
    
    if (filters.end_date) {
      query = query.lte('start_time', filters.end_date);
    }
    
    if (!filters.include_past) {
      query = query.gte('start_time', new Date().toISOString());
    }
    
    return query.order('start_time');
  };

  // Fetch classes with filters
  const {
    data: classes = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery(
    ['gym_classes', authState.user?.gym_id, filters],
    async () => {
      if (!authState.user?.gym_id) return [];

      let query = supabase
        .from('gym_classes')
        .select(`
          *,
          branches!branch_id (
            name,
            id
          ),
          trainer_profiles!trainer_id (
            full_name,
            avatar_url
          ),
          rooms!room_id (
            name,
            capacity
          )
        `)
        .eq('branches.gym_id', authState.user.gym_id);

      query = buildQuery(query);
      const { data, error } = await query;

      if (error) throw error;
      return data as GymClass[];
    },
    { 
      enabled: !!authState.user?.gym_id,
      refetchOnWindowFocus: false
    }
  );

  // Create a new class
  const createClass = useSupabaseMutation(
    async (classData: CreateClassData) => {
      if (!authState.user?.gym_id) {
        throw new Error('No organization selected');
      }

      const { data, error } = await supabase
        .from('gym_classes')
        .insert([{
          ...classData,
          current_attendees: 0,
          is_recurring: classData.recurrence !== 'none'
        }])
        .select()
        .single();

      if (error) throw error;
      return data as GymClass;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym_classes', authState.user?.gym_id] });
        toast({
          title: 'Class created',
          description: 'The class has been scheduled successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error creating class',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Update an existing class
  const updateClass = useSupabaseMutation(
    async ({ id, ...updates }: UpdateClassData) => {
      const { data, error } = await supabase
        .from('gym_classes')
        .update({
          ...updates,
          is_recurring: updates.recurrence ? updates.recurrence !== 'none' : undefined
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as GymClass;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym_classes', authState.user?.gym_id] });
        toast({
          title: 'Class updated',
          description: 'The class has been updated successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating class',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Cancel a class
  const cancelClass = useSupabaseMutation(
    async (classId: string) => {
      const { data, error } = await supabase
        .from('gym_classes')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;
      return data as GymClass;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym_classes', authState.user?.gym_id] });
        toast({
          title: 'Class cancelled',
          description: 'The class has been cancelled successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error cancelling class',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Delete a class (permanently)
  const deleteClass = useSupabaseMutation(
    async (classId: string) => {
      const { error } = await supabase
        .from('gym_classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
      return classId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym_classes', authState.user?.gym_id] });
        toast({
          title: 'Class deleted',
          description: 'The class has been deleted successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error deleting class',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Get class by ID
  const getClassById = (classId: string) => {
    return classes.find(cls => cls.id === classId);
  };

  // Get upcoming classes (next 7 days)
  const getUpcomingClasses = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return classes.filter(cls => {
      const classDate = new Date(cls.start_time);
      return classDate >= today && classDate <= nextWeek;
    });
  };

  // Get classes by status
  const getClassesByStatus = (status: ClassStatus | ClassStatus[]) => {
    if (Array.isArray(status)) {
      return classes.filter(cls => status.includes(cls.status as ClassStatus));
    }
    return classes.filter(cls => cls.status === status);
  };

  return {
    classes,
    isLoading,
    error,
    refetch,
    createClass: createClass.mutateAsync,
    updateClass: updateClass.mutateAsync,
    cancelClass: cancelClass.mutateAsync,
    deleteClass: deleteClass.mutateAsync,
    getClassById,
    getUpcomingClasses,
    getClassesByStatus,
    isCreating: createClass.isPending,
    isUpdating: updateClass.isPending,
    isCancelling: cancelClass.isPending,
    isDeleting: deleteClass.isPending,
  };
};

export const classTagLabels = {
  cardio: 'Cardio',
  strength: 'Strength Training',
  yoga: 'Yoga',
  pilates: 'Pilates',
  hiit: 'HIIT',
  boxing: 'Boxing',
  dance: 'Dance',
  aqua: 'Aqua Fitness',
  cycling: 'Cycling',
  crossfit: 'CrossFit',
  zumba: 'Zumba',
  spinning: 'Spinning',
  trx: 'TRX',
  barre: 'Barre',
  kickboxing: 'Kickboxing',
  martial_arts: 'Martial Arts',
  meditation: 'Meditation',
  mobility: 'Mobility',
  piloxing: 'Piloxing',
  step: 'Step',
  stretch: 'Stretching',
  tabata: 'Tabata',
  tai_chi: 'Tai Chi',
  trx: 'TRX',
  weight_loss: 'Weight Loss',
  wellness: 'Wellness',
  wrestling: 'Wrestling'
} as const;

export type ClassTag = keyof typeof classTagLabels;