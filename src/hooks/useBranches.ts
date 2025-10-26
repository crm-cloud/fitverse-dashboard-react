import { useState, useEffect, useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
  gym_id: string;
  created_at: string;
  updated_at: string;
  timezone?: string;
  settings?: Record<string, any>;
};

const SELECTED_BRANCH_KEY = 'selected_branch_id';

export const useBranches = () => {
  const { authState } = useAuth();
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const queryClient = useQueryClient();
  
  // Initialize selected branch from localStorage on mount
  useEffect(() => {
    const savedBranchId = localStorage.getItem(SELECTED_BRANCH_KEY);
    if (savedBranchId) {
      const cachedBranches = queryClient.getQueryData<Branch[]>(['branches', authState.user?.gym_id]);
      if (cachedBranches?.length) {
        const branch = cachedBranches.find(b => b.id === savedBranchId);
        if (branch) {
          setSelectedBranchState(branch);
        } else {
          localStorage.removeItem(SELECTED_BRANCH_KEY);
        }
      }
    }
  }, [authState.user?.gym_id, queryClient]);
  
  const setSelectedBranch = useCallback((branch: Branch | null) => {
    if (branch) {
      localStorage.setItem(SELECTED_BRANCH_KEY, branch.id);
      setSelectedBranchState(branch);
    } else {
      localStorage.removeItem(SELECTED_BRANCH_KEY);
      setSelectedBranchState(null);
    }
  }, []);

  // Fetch branches for the current organization
  const {
    data: branches = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery(
    ['branches', authState.user?.gym_id],
    async () => {
      if (!authState.user?.gym_id) return [];

      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('gym_id', authState.user.gym_id)
        .order('name');

      if (error) throw error;
      
      // If no branch is selected and we have branches, select the first one
      if (data?.length > 0 && !selectedBranch) {
        const savedBranchId = localStorage.getItem(SELECTED_BRANCH_KEY);
        const branchToSelect = savedBranchId 
          ? data.find(b => b.id === savedBranchId) || data[0]
          : data[0];
        
        if (branchToSelect) {
          setSelectedBranch(branchToSelect);
        }
      }
      
      return data || [];
    },
    { enabled: !!authState.user?.gym_id }
  );

  // Create a new branch
  const createBranch = useSupabaseMutation(
    async (branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at' | 'gym_id'>) => {
      if (!authState.user?.gym_id) {
        throw new Error('No organization selected');
      }

      const { data, error } = await supabase
        .from('branches')
        .insert([{
          ...branchData,
          gym_id: authState.user.gym_id,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['branches', authState.user?.gym_id] });
        toast({
          title: 'Branch created',
          description: 'The branch has been created successfully.',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error creating branch',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Update an existing branch
  const updateBranch = useSupabaseMutation(
    async ({ id, ...updates }: Partial<Branch> & { id: string }) => {
      const { data, error } = await supabase
        .from('branches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['branches', authState.user?.gym_id] });
        toast({
          title: 'Branch updated',
          description: 'The branch has been updated successfully.',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error updating branch',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Delete a branch
  const deleteBranch = useSupabaseMutation(
    async (branchId: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId);

      if (error) throw error;
      return branchId;
    },
    {
      onSuccess: (deletedBranchId) => {
        // If the deleted branch was selected, clear the selection
        if (selectedBranch?.id === deletedBranchId) {
          setSelectedBranch(null);
        }
        
        queryClient.invalidateQueries({ queryKey: ['branches', authState.user?.gym_id] });
        toast({
          title: 'Branch deleted',
          description: 'The branch has been deleted successfully.',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error deleting branch',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  return {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading,
    error,
    refetch,
    createBranch: createBranch.mutateAsync,
    updateBranch: updateBranch.mutateAsync,
    deleteBranch: deleteBranch.mutateAsync,
    isCreating: createBranch.isLoading,
    isUpdating: updateBranch.isLoading,
    isDeleting: deleteBranch.isLoading,
  };
};