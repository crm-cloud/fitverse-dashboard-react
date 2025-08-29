import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSupabaseQuery = (
  key: string[],
  queryFn: () => Promise<any>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: key,
    queryFn,
    ...options
  });
};

export const useSupabaseMutation = (
  mutationFn: (variables: any) => Promise<any>,
  options?: {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: any, variables: any) => void;
    invalidateQueries?: string[][];
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error: any, variables) => {
      toast({
        title: "Operation failed",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
      options?.onError?.(error, variables);
    }
  });
};

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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  );
};

export const useMembershipPlans = () => {
  return useSupabaseQuery(
    ['membership_plans'],
    async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data;
    }
  );
};

export const useBranches = () => {
  return useSupabaseQuery(
    ['branches'],
    async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    }
  );
};

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
      return data;
    }
  );
};

export const useGymClasses = () => {
  return useSupabaseQuery(
    ['gym_classes'],
    async () => {
      const { data, error } = await supabase
        .from('gym_classes')
        .select(`
          *,
          branches!branch_id (
            name
          ),
          trainer_profiles!trainer_id (
            name
          )
        `)
        .eq('status', 'scheduled')
        .gte('start_time', new Date().toISOString())
        .order('start_time');

      if (error) throw error;
      return data;
    }
  );
};

export const useCreateMember = () => {
  return useSupabaseMutation(
    async (memberData: any) => {
      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['members']],
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Member created successfully",
        });
      }
    }
  );
};

export const useCreateMembershipPlan = () => {
  return useSupabaseMutation(
    async (planData: any) => {
      const { data, error } = await supabase
        .from('membership_plans')
        .insert([planData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['membership_plans']],
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Membership plan created successfully",
        });
      }
    }
  );
};