import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useBranchContext } from './useBranchContext';
import { Locker, LockerAssignment, LockerFilters, LockerSize, LockerStatus } from '@/types/locker';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface LockerRecord {
  id: string;
  name: string;
  number: string;
  branch_id: string;
  size_id: string;
  status: LockerStatus;
  assigned_member_id?: string;
  assigned_date?: string;
  expiration_date?: string;
  release_date?: string;
  monthly_fee: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  branches?: {
    name: string;
  };
  locker_sizes?: {
    name: string;
    dimensions: string;
    monthly_fee: number;
  };
  members?: {
    full_name: string;
  };
}

export const useLockers = (filters: LockerFilters = {}) => {
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();
  const queryClient = useQueryClient();
  
  const targetBranchId = filters.branchId || currentBranchId;
  const isEnabled = !!targetBranchId && !!authState.user?.gym_id;
  
  // Build query based on filters
  const buildQuery = (query: any) => {
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    if (filters.size) {
      query = query.eq('size_id', filters.size);
    }
    
    if (filters.search) {
      query = query.or(`number.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
    }
    
    return query.order('number');
  };
  
  // Fetch lockers with filters
  const {
    data: lockers = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery(
    ['lockers', authState.user?.gym_id, targetBranchId, filters],
    async () => {
      if (!isEnabled) return [];
      
      let query = supabase
        .from('lockers')
        .select(`
          *,
          branches!branch_id (
            name,
            gym_id
          ),
          locker_sizes!size_id (
            name,
            dimensions,
            monthly_fee
          ),
          members!assigned_member_id (
            full_name
          )
        `)
        .eq('branches.gym_id', authState.user!.gym_id!);
      
      if (targetBranchId) {
        query = query.eq('branch_id', targetBranchId);
      }
      
      query = buildQuery(query);
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data as LockerRecord[]).map(mapLockerRecordToLocker);
    },
    { enabled: isEnabled }
  );
  
  // Helper function to map database record to Locker type
  const mapLockerRecordToLocker = (locker: LockerRecord): Locker => ({
    id: locker.id,
    name: locker.name,
    number: locker.number,
    branchId: locker.branch_id,
    branchName: locker.branches?.name || '',
    size: {
      id: locker.size_id,
      name: locker.locker_sizes?.name || 'Unknown',
      dimensions: locker.locker_sizes?.dimensions || '',
      monthlyFee: locker.locker_sizes?.monthly_fee || 0
    },
    status: locker.status,
    assignedMemberId: locker.assigned_member_id,
    assignedMemberName: locker.members?.full_name,
    assignedDate: locker.assigned_date,
    expirationDate: locker.expiration_date,
    releaseDate: locker.release_date,
    monthlyFee: locker.monthly_fee,
    notes: locker.notes,
    createdAt: locker.created_at,
    updatedAt: locker.updated_at
  });
  
  // Get locker by ID
  const getLockerById = (lockerId: string) => {
    return lockers.find(locker => locker.id === lockerId);
  };
  
  // Get lockers by status
  const getLockersByStatus = (status: LockerStatus | 'all') => {
    if (status === 'all') return lockers;
    return lockers.filter(locker => locker.status === status);
  };
  
  // Create a new locker
  const createLocker = useSupabaseMutation(
    async (lockerData: Omit<Locker, 'id' | 'createdAt' | 'updatedAt' | 'branchName' | 'size'> & { sizeId: string }) => {
      if (!authState.user?.gym_id) {
        throw new Error('No organization selected');
      }
      
      const { data, error } = await supabase
        .from('lockers')
        .insert([{
          name: lockerData.name,
          number: lockerData.number,
          branch_id: lockerData.branchId,
          size_id: lockerData.sizeId,
          status: 'available',
          monthly_fee: lockerData.monthlyFee,
          notes: lockerData.notes
        }])
        .select()
        .single();
      
      if (error) throw error;
      return mapLockerRecordToLocker(data as LockerRecord);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lockers', authState.user?.gym_id] });
        toast({
          title: 'Locker created',
          description: 'The locker has been added successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error creating locker',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
  
  // Update an existing locker
  const updateLocker = useSupabaseMutation(
    async ({ id, ...updates }: { id: string } & Partial<Locker>) => {
      const { data, error } = await supabase
        .from('lockers')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.number && { number: updates.number }),
          ...(updates.branchId && { branch_id: updates.branchId }),
          ...(updates.status && { status: updates.status }),
          ...(updates.monthlyFee !== undefined && { monthly_fee: updates.monthlyFee }),
          ...(updates.notes !== undefined && { notes: updates.notes })
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapLockerRecordToLocker(data as LockerRecord);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lockers', authState.user?.gym_id] });
        toast({
          title: 'Locker updated',
          description: 'The locker has been updated successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating locker',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
  
  // Delete a locker
  const deleteLocker = useSupabaseMutation(
    async (lockerId: string) => {
      const { error } = await supabase
        .from('lockers')
        .delete()
        .eq('id', lockerId);
      
      if (error) throw error;
      return lockerId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lockers', authState.user?.gym_id] });
        toast({
          title: 'Locker deleted',
          description: 'The locker has been deleted successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error deleting locker',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
  
  // Assign locker to member
  const assignLocker = useSupabaseMutation(
    async ({
      lockerId,
      memberId,
      expirationDate,
      monthlyFee,
      notes
    }: {
      lockerId: string;
      memberId: string;
      expirationDate?: string;
      monthlyFee: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('lockers')
        .update({
          status: 'occupied',
          assigned_member_id: memberId,
          assigned_date: new Date().toISOString(),
          expiration_date: expirationDate,
          monthly_fee: monthlyFee,
          notes: notes,
          release_date: null
        })
        .eq('id', lockerId)
        .select()
        .single();
      
      if (error) throw error;
      return mapLockerRecordToLocker(data as LockerRecord);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lockers', authState.user?.gym_id] });
        toast({
          title: 'Locker assigned',
          description: 'The locker has been assigned successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error assigning locker',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
  
  // Release locker from member
  const releaseLocker = useSupabaseMutation(
    async (lockerId: string) => {
      const { data, error } = await supabase
        .from('lockers')
        .update({
          status: 'available',
          release_date: new Date().toISOString(),
          assigned_member_id: null,
          expiration_date: null
        })
        .eq('id', lockerId)
        .select()
        .single();
      
      if (error) throw error;
      return mapLockerRecordToLocker(data as LockerRecord);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lockers', authState.user?.gym_id] });
        toast({
          title: 'Locker released',
          description: 'The locker has been released successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error releasing locker',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
  
  // Bulk create lockers
  const bulkCreateLockers = useSupabaseMutation(
    async ({
      count,
      branchId,
      sizeId,
      startNumber = 1,
      prefix = '',
      monthlyFee = 0
    }: {
      count: number;
      branchId: string;
      sizeId: string;
      startNumber?: number;
      prefix?: string;
      monthlyFee?: number;
    }) => {
      const lockers = Array.from({ length: count }, (_, index) => ({
        name: `${prefix}${startNumber + index}`,
        number: `${prefix}${startNumber + index}`,
        branch_id: branchId,
        size_id: sizeId,
        status: 'available' as const,
        monthly_fee: monthlyFee
      }));
      
      const { data, error } = await supabase
        .from('lockers')
        .insert(lockers)
        .select();
      
      if (error) throw error;
      return (data as LockerRecord[]).map(mapLockerRecordToLocker);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lockers', authState.user?.gym_id] });
        toast({
          title: 'Lockers created',
          description: 'The lockers have been created successfully.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error creating lockers',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
  
  return {
    lockers,
    isLoading,
    error,
    refetch,
    getLockerById,
    getLockersByStatus,
    createLocker: createLocker.mutateAsync,
    updateLocker: updateLocker.mutateAsync,
    deleteLocker: deleteLocker.mutateAsync,
    assignLocker: assignLocker.mutateAsync,
    releaseLocker: releaseLocker.mutateAsync,
    bulkCreateLockers: bulkCreateLockers.mutateAsync,
    isCreating: createLocker.isLoading,
    isUpdating: updateLocker.isLoading,
    isDeleting: deleteLocker.isLoading,
    isAssigning: assignLocker.isLoading,
    isReleasing: releaseLocker.isLoading,
    isBulkCreating: bulkCreateLockers.isLoading
  };
};

export const useLockerSummary = (branchId?: string) => {
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();
  const targetBranchId = branchId || currentBranchId;
  const isEnabled = !!targetBranchId && !!authState.user?.gym_id;
  
  return useSupabaseQuery(
    ['locker-summary', authState.user?.gym_id, targetBranchId],
    async () => {
      let query = supabase
        .from('lockers')
        .select('status, monthly_fee, branches!inner(gym_id)');
      
      query = query.eq('branches.gym_id', authState.user!.gym_id!);
      
      if (targetBranchId) {
        query = query.eq('branch_id', targetBranchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const lockers = data || [];
      const totalLockers = lockers.length;
      const availableLockers = lockers.filter(l => l.status === 'available').length;
      const occupiedLockers = lockers.filter(l => l.status === 'occupied').length;
      const maintenanceLockers = lockers.filter(l => l.status === 'maintenance').length;
      const reservedLockers = lockers.filter(l => l.status === 'reserved').length;
      const occupancyRate = totalLockers > 0 ? (occupiedLockers / totalLockers) * 100 : 0;
      const monthlyRevenue = lockers
        .filter(l => l.status === 'occupied')
        .reduce((sum, l) => sum + (l.monthly_fee || 0), 0);

      return {
        totalLockers,
        availableLockers,
        occupiedLockers,
        maintenanceLockers,
        reservedLockers,
        occupancyRate,
        monthlyRevenue
      } as LockerSummary;
    },
    {
      enabled: isEnabled,
      refetchOnWindowFocus: false
    }
  );
};

export const useCreateLocker = () => {
  return useSupabaseMutation(
    async (lockerData: any) => {
      const { data, error } = await supabase
        .from('lockers')
        .insert(lockerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useBulkCreateLockers = () => {
  return useSupabaseMutation(
    async ({ count, branchId, sizeId, startNumber = 1, prefix = '' }: {
      count: number;
      branchId: string;
      sizeId: string;
      startNumber?: number;
      prefix?: string;
    }) => {
      const lockers = Array.from({ length: count }, (_, index) => ({
        name: `${prefix}${startNumber + index}`,
        number: `${prefix}${startNumber + index}`,
        branch_id: branchId,
        size_id: sizeId,
        status: 'available' as const,
        monthly_fee: 0
      }));

      const { data, error } = await supabase
        .from('lockers')
        .insert(lockers)
        .select();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useUpdateLocker = () => {
  return useSupabaseMutation(
    async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('lockers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useDeleteLocker = () => {
  return useSupabaseMutation(
    async (id: string) => {
      const { error } = await supabase
        .from('lockers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useAssignLocker = () => {
  return useSupabaseMutation(
    async ({ 
      lockerId, 
      memberId, 
      monthlyFee, 
      expirationDate, 
      notes,
      createInvoice = false 
    }: {
      lockerId: string;
      memberId: string;
      monthlyFee: number;
      expirationDate?: string;
      notes?: string;
      createInvoice?: boolean;
    }) => {
      const updateData = {
        status: 'occupied' as const,
        assigned_member_id: memberId,
        assigned_date: new Date().toISOString().split('T')[0],
        expiration_date: expirationDate,
        notes,
        monthly_fee: monthlyFee
      };

      const { data: lockerData, error: lockerError } = await supabase
        .from('lockers')
        .update(updateData)
        .eq('id', lockerId)
        .select()
        .single();

      if (lockerError) throw lockerError;

      // Create invoice if locker has charges
      if (createInvoice && monthlyFee > 0) {
        const { data: memberData } = await supabase
          .from('members')
          .select('full_name, email')
          .eq('id', memberId)
          .single();

        const invoiceNumber = `INV-${Date.now()}`;
        
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            invoice_number: invoiceNumber,
            customer_id: memberId,
            customer_name: memberData?.full_name || 'Unknown',
            customer_email: memberData?.email || '',
            date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal: monthlyFee,
            total: monthlyFee,
            status: 'draft',
            notes: `Locker ${lockerData.number} - Monthly Fee`
          });

        if (invoiceError) throw invoiceError;
      }

      return lockerData;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};

export const useReleaseLocker = () => {
  return useSupabaseMutation(
    async (lockerId: string) => {
      const { data, error } = await supabase
        .from('lockers')
        .update({
          status: 'available' as const,
          assigned_member_id: null,
          assigned_date: null,
          expiration_date: null,
          release_date: new Date().toISOString().split('T')[0],
          notes: null
        })
        .eq('id', lockerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['lockers'], ['locker-summary']]
    }
  );
};