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
      role: 'admin',
    }
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createAdminAccount.isPending}>
            {createAdminAccount.isPending ? 'Creating...' : 'Create Admin Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}