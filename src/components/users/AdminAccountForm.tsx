import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const adminFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  avatar_url: z.string().url('Please enter a valid URL').optional(),
  subscription_plan: z.string().min(1, 'Please select a subscription plan'),
  gym_name: z.string().optional(),
  create_new_gym: z.boolean().default(true),
  existing_gym_id: z.string().optional(),
  branch_id: z.string().optional(),
  role: z.literal('admin'),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

interface AdminAccountFormProps {
  onSuccess: () => void;
}

export function AdminAccountForm({ onSuccess }: AdminAccountFormProps) {
  const queryClient = useQueryClient();

  // Get available subscription plans
  const { data: subscriptionPlans } = useQuery({
    queryKey: ['subscription-plans-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      avatar_url: '',
      subscription_plan: '',
      gym_name: '',
      create_new_gym: true,
      existing_gym_id: '',
      branch_id: '',
      role: 'admin',
    }
  });

  // Gyms (for assigning existing gym when not creating a new one)
  const { data: gyms } = useQuery({
    queryKey: ['gyms-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, status')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Branches for selected gym
  const selectedGymId = form.watch('existing_gym_id');
  const { data: branches } = useQuery({
    queryKey: ['branches-by-gym', selectedGymId],
    queryFn: async () => {
      if (!selectedGymId) return [] as any[];
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, status')
        .eq('gym_id', selectedGymId)
        .eq('status', 'active')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedGymId && !form.watch('create_new_gym')
  });

  const createAdminAccount = useMutation({
    mutationFn: async (data: AdminFormData) => {
      const { data: result, error } = await supabase.functions.invoke('create-admin-account', {
        body: {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.date_of_birth || undefined,
          avatar_url: data.avatar_url || undefined,
          subscription_plan: data.subscription_plan,
          gym_name: data.gym_name || `${data.full_name}'s Gym`,
          create_new_gym: data.create_new_gym,
          existing_gym_id: data.create_new_gym ? undefined : (data.existing_gym_id || undefined),
          branch_id: data.create_new_gym ? undefined : (data.branch_id || undefined),
        }
      });

      if (error) throw error as any;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin account created successfully. Login credentials will be sent via email."
      });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onSuccess();
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create admin account';
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AdminFormData) => {
    createAdminAccount.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter admin's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="admin@gym.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subscription_plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Plan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subscription plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subscriptionPlans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.name}>
                      {plan.name} - ${plan.price}/{plan.billing_cycle}
                      <div className="text-xs text-muted-foreground">
                        {plan.max_branches} branches, {plan.max_trainers} trainers, {plan.max_members} members
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="create_new_gym"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="rounded border-input mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Create New Gym</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Check this to create a new gym for this admin
                </p>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {form.watch('create_new_gym') ? (
          <FormField
            control={form.control}
            name="gym_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gym Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Leave empty to auto-generate" {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  If left empty, will be generated from admin's name
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <>
            <FormField
              control={form.control}
              name="existing_gym_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Existing Gym</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a gym" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gyms?.map((gym: any) => (
                        <SelectItem key={gym.id} value={gym.id}>
                          {gym.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Branch (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!branches?.length}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={branches?.length ? "Choose a branch" : "Select a gym first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches?.map((branch: any) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createAdminAccount.isPending}>
            {createAdminAccount.isPending ? 'Creating...' : 'Create Admin Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}