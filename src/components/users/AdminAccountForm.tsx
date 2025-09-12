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
  gym_id: z.string().min(1, 'Please select a gym'),
  branch_ids: z.array(z.string()).optional(),
  role: z.literal('admin'),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

interface AdminAccountFormProps {
  onSuccess: () => void;
}

export function AdminAccountForm({ onSuccess }: AdminAccountFormProps) {
  const queryClient = useQueryClient();

  // Get available gyms
  const { data: gyms } = useQuery({
    queryKey: ['gyms-for-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, status')
        .eq('status', 'active')
        .order('name');
      
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
      gym_id: '',
      branch_ids: [],
      role: 'admin',
    }
  });

  // Get branches for selected gym
  const { data: branches } = useQuery({
    queryKey: ['branches-for-gym', form.watch('gym_id')],
    queryFn: async () => {
      const gymId = form.getValues('gym_id');
      if (!gymId) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('gym_id', gymId)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!form.watch('gym_id')
  });

  const createAdminAccount = useMutation({
    mutationFn: async (data: AdminFormData) => {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: 'TempPassword123!', // Temporary password - admin will reset on first login
        email_confirm: true,
        user_metadata: {
          full_name: data.full_name,
          role: 'admin'
        }
      });

      if (authError) throw authError;

      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          role: 'admin',
          gym_id: data.gym_id,
          is_active: true
        });

      if (profileError) throw profileError;

      // Call welcome email edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-admin-welcome-email', {
          body: {
            adminId: authData.user.id,
            adminEmail: data.email,
            adminName: data.full_name,
            gymName: gyms?.find(g => g.id === data.gym_id)?.name || 'Unknown Gym',
            temporaryPassword: 'TempPassword123!'
          }
        });

        if (emailError) {
          console.warn('Failed to send welcome email:', emailError);
          // Don't throw error - account creation should still succeed
        }
      } catch (emailError) {
        console.warn('Welcome email service error:', emailError);
      }

      return { user: authData.user, profile: data };
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
          name="gym_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign to Gym</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                form.setValue('branch_ids', []); // Reset branch selection when gym changes
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a gym" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {gyms?.map((gym) => (
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

        {branches && branches.length > 0 && (
          <FormField
            control={form.control}
            name="branch_ids"
            render={() => (
              <FormItem>
                <FormLabel>Assign to Branches (Optional)</FormLabel>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {branches.map((branch) => (
                    <FormField
                      key={branch.id}
                      control={form.control}
                      name="branch_ids"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value?.includes(branch.id)}
                              onChange={(e) => {
                                const updatedValue = e.target.checked
                                  ? [...(field.value || []), branch.id]
                                  : (field.value || []).filter((id: string) => id !== branch.id);
                                field.onChange(updatedValue);
                              }}
                              className="rounded border-input"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {branch.name}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to allow access to all branches in the gym
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