import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Building2, MapPin, Phone, Users } from 'lucide-react';

const branchFormSchema = z.object({
  name: z.string().min(2, 'Branch name must be at least 2 characters'),
  branchCode: z.string().optional(),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  phone: z.string().min(1, 'Contact number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1')
});

type BranchFormData = z.infer<typeof branchFormSchema>;

interface BranchCreationFormProps {
  onSuccess: () => void;
}

export function BranchCreationForm({ onSuccess }: BranchCreationFormProps) {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  
  // Get gym details and limits
  const { data: gym } = useQuery({
    queryKey: ['gym-details', authState.user?.gym_id],
    queryFn: async () => {
      if (!authState.user?.gym_id) return null;
      
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', authState.user.gym_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.gym_id,
  });

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      branchCode: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      capacity: 100
    }
  });

  // Auto-generate branch code when name changes
  const handleNameChange = (value: string) => {
    if (!form.getValues('branchCode')) {
      const code = value
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 4);
      form.setValue('branchCode', code);
    }
  };

  const createBranch = useMutation({
    mutationFn: async (data: BranchFormData) => {
      // Validate subscription limits
      if (authState.user?.gym_id) {
        const { data: existingBranches, error: branchError } = await supabase
          .from('branches')
          .select('id')
          .eq('gym_id', authState.user.gym_id)
          .eq('status', 'active');

        if (branchError) throw branchError;

        if (existingBranches.length >= (gym?.max_branches || 1)) {
          throw new Error(`Cannot create more branches. Your subscription allows a maximum of ${gym?.max_branches || 1} branches. Please upgrade your subscription to add more branches.`);
        }
      }

      // Validate member capacity against gym limits
      if (data.capacity > (gym?.max_members || 100)) {
        throw new Error(`Branch capacity cannot exceed your subscription limit of ${gym?.max_members || 100} members.`);
      }

      const branchData = {
        name: data.name,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.pincode,
          country: 'US'
        },
        contact: {
          phone: data.phone,
          email: `${data.branchCode?.toLowerCase() || 'branch'}@${authState.user?.email?.split('@')[1] || 'gym.com'}`
        },
        capacity: data.capacity,
        current_members: 0,
        gym_id: authState.user?.gym_id,
        hours: {
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '08:00', close: '20:00' },
          sunday: { open: '08:00', close: '18:00' }
        },
        amenities: ['Parking', 'Lockers', 'WiFi'],
        status: 'active',
        images: []
      };

      const { data: newBranch, error } = await supabase
        .from('branches')
        .insert([branchData])
        .select()
        .single();
      
      if (error) throw error;
      return newBranch;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Branch created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
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

  const onSubmit = (data: BranchFormData) => {
    createBranch.mutate(data);
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Branch Name *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Downtown Fitness Center" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <FormField
                control={form.control}
                name="branchCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="DFC" {...field} maxLength={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address Information
            </h3>
            
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
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
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode *</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Number *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Maximum Members *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      max={gym?.max_members || 100}
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  {gym?.max_members && (
                    <p className="text-xs text-muted-foreground">
                      Maximum allowed by your subscription: {gym.max_members}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex gap-4 pt-4"
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSuccess}
              disabled={createBranch.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createBranch.isPending}
              className="min-w-32"
            >
              {createBranch.isPending ? 'Creating...' : 'Create Branch'}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}