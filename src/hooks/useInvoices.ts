import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceItem } from '@/types/finance';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface UseInvoicesOptions {
  limit?: number;
  status?: InvoiceStatus | 'all';
  customerId?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  branch_id?: string;
  gym_id: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  branches?: {
    name: string;
  };
}

export const useInvoices = (options: UseInvoicesOptions = {}) => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const isEnabled = !!authState.user?.gym_id;

  // Build query based on filters
  const buildQuery = (query: any) => {
    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }
    
    if (options.customerId) {
      query = query.eq('customer_id', options.customerId);
    }
    
    if (options.branchId) {
      query = query.eq('branch_id', options.branchId);
    }
    
    if (options.dateFrom) {
      query = query.gte('date', options.dateFrom);
    }
    
    if (options.dateTo) {
      query = query.lte('date', options.dateTo);
    }
    
    if (options.search) {
      query = query.or(
        `invoice_number.ilike.%${options.search}%`,
        `customer_name.ilike.%${options.search}%`,
        `customer_email.ilike.%${options.search}%`
      );
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    return query.order('created_at', { ascending: false });
  };

  // Map database record to Invoice type
  const mapInvoiceRecordToInvoice = (invoice: InvoiceRecord): Invoice => ({
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    date: invoice.date,
    dueDate: invoice.due_date,
    customerId: invoice.customer_id,
    customerName: invoice.customer_name,
    customerEmail: invoice.customer_email,
    items: invoice.items?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total
    })) || [],
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    discount: invoice.discount,
    total: invoice.total,
    status: invoice.status,
    notes: invoice.notes,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
    branchId: invoice.branch_id,
    branchName: invoice.branches?.name
  });

  // Fetch invoices with filters
  const {
    data: invoices = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['invoices', authState.user?.gym_id, options],
    queryFn: async () => {
      if (!isEnabled) return [];
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*),
          branches:branches!branch_id(name)
        `)
        .eq('gym_id', authState.user!.gym_id!);
      
      query = buildQuery(query);
      const { data, error } = await query;
      
      if (error) throw error;
      return (data as InvoiceRecord[]).map(mapInvoiceRecordToInvoice);
    },
    enabled: isEnabled,
    refetchOnWindowFocus: false
  });

  // Create a new invoice
  const createInvoice = useMutation({
    mutationFn: async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'branchName'> & { status?: InvoiceStatus }) => {
      if (!authState.user?.gym_id) {
        throw new Error('No organization selected');
      }
      
      const { data, error } = await supabase.rpc('create_invoice_with_items', {
        p_invoice: {
          invoice_number: invoiceData.invoiceNumber,
          date: invoiceData.date,
          due_date: invoiceData.dueDate,
          customer_id: invoiceData.customerId || null,
          customer_name: invoiceData.customerName,
          customer_email: invoiceData.customerEmail || null,
          branch_id: invoiceData.branchId || null,
          gym_id: authState.user.gym_id,
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax,
          discount: invoiceData.discount,
          total: invoiceData.total,
          status: invoiceData.status || 'draft',
          notes: invoiceData.notes || null
        },
        p_items: invoiceData.items.map(item => ({
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total
        }))
      });
      
      if (error) throw error;
      return mapInvoiceRecordToInvoice(data as InvoiceRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', authState.user?.gym_id] });
      toast({
        title: 'Invoice created',
        description: 'The invoice has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating invoice',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update an existing invoice
  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Invoice>) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...(updates.invoiceNumber && { invoice_number: updates.invoiceNumber }),
          ...(updates.date && { date: updates.date }),
          ...(updates.dueDate && { due_date: updates.dueDate }),
          ...(updates.customerId !== undefined && { customer_id: updates.customerId }),
          ...(updates.customerName && { customer_name: updates.customerName }),
          ...(updates.customerEmail !== undefined && { customer_email: updates.customerEmail }),
          ...(updates.branchId !== undefined && { branch_id: updates.branchId }),
          ...(updates.subtotal !== undefined && { subtotal: updates.subtotal }),
          ...(updates.tax !== undefined && { tax: updates.tax }),
          ...(updates.discount !== undefined && { discount: updates.discount }),
          ...(updates.total !== undefined && { total: updates.total }),
          ...(updates.status && { status: updates.status }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapInvoiceRecordToInvoice(data as InvoiceRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', authState.user?.gym_id] });
      toast({
        title: 'Invoice updated',
        description: 'The invoice has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating invoice',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update invoice status
  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status,
          ...(status === 'paid' && { paid_at: new Date().toISOString() }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapInvoiceRecordToInvoice(data as InvoiceRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', authState.user?.gym_id] });
      toast({
        title: 'Invoice status updated',
        description: 'The invoice status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating invoice status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete an invoice
  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', authState.user?.gym_id] });
      toast({
        title: 'Invoice deleted',
        description: 'The invoice has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting invoice',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Send invoice to customer
  const sendInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // In a real app, you would also send an email to the customer here
      // await sendInvoiceEmail(data as InvoiceRecord);
      
      return mapInvoiceRecordToInvoice(data as InvoiceRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', authState.user?.gym_id] });
      toast({
        title: 'Invoice sent',
        description: 'The invoice has been sent to the customer.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error sending invoice',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get invoice by ID
  const getInvoiceById = (invoiceId: string) => {
    return invoices.find(invoice => invoice.id === invoiceId);
  };

  // Get invoices by status
  const getInvoicesByStatus = (status: InvoiceStatus | 'all') => {
    if (status === 'all') return invoices;
    return invoices.filter(invoice => invoice.status === status);
  };

  // Get total amount by status
  const getTotalByStatus = (status: InvoiceStatus | 'all') => {
    const filteredInvoices = status === 'all' 
      ? invoices 
      : invoices.filter(invoice => invoice.status === status);
    
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  };

  // Get recent invoices (for dashboard)
  const getRecentInvoices = (limit: number = 5) => {
    return [...invoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  return {
    invoices,
    isLoading,
    error,
    refetch,
    getInvoiceById,
    getInvoicesByStatus,
    getTotalByStatus,
    getRecentInvoices,
    createInvoice: createInvoice.mutateAsync,
    updateInvoice: updateInvoice.mutateAsync,
    updateInvoiceStatus: updateInvoiceStatus.mutateAsync,
    deleteInvoice: deleteInvoice.mutateAsync,
    sendInvoice: sendInvoice.mutateAsync,
    isCreating: createInvoice.isLoading,
    isUpdating: updateInvoice.isLoading,
    isDeleting: deleteInvoice.isLoading,
    isSending: sendInvoice.isLoading
  };
};

// Keep the useRecentInvoices hook for backward compatibility
export const useRecentInvoices = (gymId?: string, limit: number = 5) => {
  const { authState } = useAuth();
  const targetGymId = gymId || authState.user?.gym_id;
  
  const { data: invoices, ...rest } = useInvoices({
    limit,
    status: 'all'
  });
  
  const recentInvoices = invoices
    .filter(invoice => !gymId || invoice.branchId === gymId)
    .slice(0, limit)
    .map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      amount: invoice.total,
      status: invoice.status === 'paid' ? 'Paid' : 
              invoice.status === 'overdue' ? 'Overdue' :
              invoice.status === 'sent' ? 'Sent' : 'Draft',
      customerName: invoice.customerName,
      createdAt: invoice.createdAt
    }));
  
  return {
    ...rest,
    data: recentInvoices
  };
};