import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { createAdminAccount } from '@/services/adminManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User, CreditCard, MapPin, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const adminFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string()
    .transform(val => val.replace(/\D/g, ''))
    .optional()
    .or(z.literal('')),
  date_of_birth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(), 
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  subscription_plan_id: z.string().min(1, 'Please select a subscription plan'),
  max_branches: z.number().optional(),
  max_members: z.number().optional(),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

interface AdminAccountFormProps {
  onSuccess: () => void;
}

export function AdminAccountForm({ onSuccess }: AdminAccountFormProps) {
  const queryClient = useQueryClient();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const adminForm = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      date_of_birth: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        postal_code: ''
      },
      subscription_plan_id: '',
      max_branches: 1,
      max_members: 100
    }
  });

  // Create admin account mutation using client-side service
  const createAdminMutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      console.log('🔄 [AdminForm] Creating admin account...');
      
      const result = await createAdminAccount({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone || undefined,
        date_of_birth: data.date_of_birth || undefined,
        address: data.address || undefined,
        subscription_plan_id: data.subscription_plan_id,
        max_branches: data.max_branches || undefined,
        max_members: data.max_members || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create admin account');
      }

      return result;
    },
    onSuccess: (result) => {
      console.log('✅ [AdminForm] Admin created successfully');
      toast({
        title: 'Admin Account Created Successfully',
        description: `${adminForm.getValues('full_name')} can now log in and set up their gym. Max branches: ${result.max_branches}, Max members: ${result.max_members}`,
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      adminForm.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('❌ [AdminForm] Failed to create admin:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Create Admin Account',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    },
  });

  // Fetch subscription plans
  const { data: subscriptionPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Watch subscription plan selection
  const selectedPlanId = adminForm.watch('subscription_plan_id');
  const selectedPlan = subscriptionPlans?.find(plan => plan.id === selectedPlanId);

  // Auto-fetch location
  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();

      if (data.address) {
        adminForm.setValue('address.street', data.address.road || '');
        adminForm.setValue('address.city', data.address.city || data.address.town || '');
        adminForm.setValue('address.state', data.address.state || '');
        adminForm.setValue('address.postal_code', data.address.postcode || '');
        adminForm.setValue('address.country', data.address.country || 'India');

        toast({
          title: "Location fetched",
          description: "Address fields have been populated.",
        });
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      toast({
        title: "Error",
        description: "Could not fetch location. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const onSubmit = (data: AdminFormData) => {
    createAdminMutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Form {...adminForm}>
        <form onSubmit={adminForm.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Admin Details */}
            <div className="space-y-6">
              {/* Admin Details Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Admin Details</CardTitle>
                  </div>
                  <CardDescription>
                    Basic information about the new admin user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={adminForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter admin's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@gym.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={adminForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Minimum 8 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={adminForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                +91
                              </div>
                              <Input 
                                placeholder="Enter 10-digit mobile number"
                                className="pl-10"
                                {...field}
                                value={field.value?.replace(/^\+91\s*/, '') || ''}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '');
                                  const formatted = digits.length <= 10 ? digits : e.target.value;
                                  field.onChange(formatted ? `+91 ${formatted}` : '');
                                }}
                                maxLength={12}
                              />
                            </div>
                          </FormControl>
                          <CardDescription>
                            Enter 10-digit Indian mobile number
                          </CardDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminForm.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address & Location Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Address & Location</CardTitle>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-2" />
                      )}
                      Auto-fetch
                    </Button>
                  </div>
                  <CardDescription>
                    Location details for the admin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={adminForm.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={adminForm.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminForm.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={adminForm.control}
                      name="address.postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminForm.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Subscription & Limits */}
            <div className="space-y-6">
              {/* Subscription Plan Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Subscription Plan</CardTitle>
                  </div>
                  <CardDescription>
                    Select subscription plan and resource limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={adminForm.control}
                    name="subscription_plan_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Plan *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subscriptionPlans?.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} - ₹{plan.price}/{plan.billing_cycle}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedPlan && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <p className="text-sm font-medium">Plan Details:</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Max Branches: {selectedPlan.max_branches || 'Unlimited'}</p>
                        <p>• Max Members: {selectedPlan.max_members || 'Unlimited'}</p>
                        <p>• Max Trainers: {selectedPlan.max_trainers || 'Unlimited'}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={adminForm.control}
                      name="max_branches"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Branches</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <CardDescription>
                            Override plan limit
                          </CardDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminForm.control}
                      name="max_members"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Members</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <CardDescription>
                            Override plan limit
                          </CardDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSuccess}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createAdminMutation.isPending}
            >
              {createAdminMutation.isPending ? 'Creating Admin...' : 'Create Admin Account'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
