import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useBranchContext } from './useBranchContext';
import { toast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category?: string;
  assigned_to?: string;
  assigned_by?: string;
  due_date: string;
  completed_at?: string;
  branch_id?: string;
  gym_id?: string;
  tags?: string[];
  estimated_time?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  assigned_to_profile?: {
    full_name: string;
    email: string;
  };
  assigned_by_profile?: {
    full_name: string;
  };
}

export const useTasks = (filters?: { 
  branchId?: string; 
  assignedTo?: string; 
  status?: string;
  priority?: string;
  category?: string;
}) => {
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();

  return useQuery({
    queryKey: ['tasks', filters, currentBranchId, authState.user?.gym_id],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      // Apply branch or gym filter based on user role
      if (authState.user?.role === 'super-admin') {
        // Super admin sees all tasks (no filter)
      } else if (authState.user?.role === 'admin') {
        // Admin sees all tasks in their gym
        if (authState.user.gym_id) {
          query = query.eq('gym_id', authState.user.gym_id);
        }
      } else {
        // Other roles see branch-specific tasks
        const effectiveBranchId = filters?.branchId || currentBranchId;
        if (effectiveBranchId) {
          query = query.eq('branch_id', effectiveBranchId);
        }
      }

      // Apply other filters
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Task[];
    },
    enabled: !!authState.user
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();

  return useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          assigned_by: authState.user?.id,
          branch_id: task.branch_id || currentBranchId,
          gym_id: authState.user?.gym_id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task Created', description: 'Task has been assigned successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create task',
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task Updated', description: 'Task has been updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update task',
        variant: 'destructive'
      });
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task Deleted', description: 'Task has been removed successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete task',
        variant: 'destructive'
      });
    }
  });
};
