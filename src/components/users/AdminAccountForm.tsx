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
  subscription_plan: z.string().min(1, 'Please select a subscription plan'),
  gym_name: z.string().optional(),
  create_new_gym: z.boolean().default(true),
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
      subscription_plan: '',
      gym_name: '',
      create_new_gym: true,
      role: 'admin',
    }
  });

  const createAdminAccount = useMutation({
    mutationFn: async (data: AdminFormData) => {
      const { data: result, error } = await supabase.functions.invoke('create-admin-account', {
        body: {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          subscription_plan: data.subscription_plan,
          gym_name: data.gym_name || `${data.full_name}'s Gym`,
          create_new_gym: data.create_new_gym
        }
      });

      if (error) throw error;
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
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
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

        {form.watch('create_new_gym') && (
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