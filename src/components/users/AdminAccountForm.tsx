import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { User, CreditCard, Settings, MapPin, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const adminFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string()
    .transform(val => val.replace(/\D/g, '')) // Remove all non-digits
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

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
      },
      subscription_plan_id: '',
      max_branches: undefined,
      max_members: undefined,
    }
  });

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

  // Watch selected plan to show its limits
  const selectedPlanId = form.watch('subscription_plan_id');
  const selectedPlan = subscriptionPlans?.find(p => p.id === selectedPlanId);

  // Auto-fetch location
  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation not supported",
          description: "Please enter address manually",
          variant: "destructive"
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Using a free geocoding service
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&language=en&pretty=1`
            );
            const data = await response.json();
            
            if (data.results && data.results[0]) {
              const result = data.results[0].components;
              form.setValue('address', {
                street: result.road || '',
                city: result.city || result.town || result.village || '',
                state: result.state || '',
                postal_code: result.postcode || '',
                country: result.country || 'India'
              });
              
              toast({
                title: "Location fetched",
                description: "Address has been auto-filled from your location"
              });
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            toast({
              title: "Location fetch failed",
              description: "Please enter address manually",
              variant: "destructive"
            });
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location access denied",
            description: "Please enter address manually",
            variant: "destructive"
          });
          setIsLoadingLocation(false);
        }
      );
    } catch (error) {
      console.error('Location fetch error:', error);
      setIsLoadingLocation(false);
    }
  };

  const createAdminAccount = useMutation({
    mutationFn: async (data: AdminFormData) => {
      try {
        // Generate temporary password
        const { generateTempPassword } = await import('@/services/userManagement');
        const tempPassword = generateTempPassword();
        
        // Call the new atomic RPC function directly
        const { data: result, error } = await supabase.rpc('create_admin_account_atomic', {
          p_email: data.email,
          p_password: tempPassword,
          p_full_name: data.full_name,
          p_phone: data.phone || null,
          p_date_of_birth: data.date_of_birth || null,
          p_address: data.address || null,
          p_subscription_plan_id: data.subscription_plan_id,
          p_max_branches: data.max_branches || null,
          p_max_members: data.max_members || null,
        }) as { data: any; error: any };
        
        if (error) {
          console.error('RPC error:', error);
          throw new Error(error.message || 'Failed to create admin');
        }
        
        const adminResult = result as { success: boolean; user_id?: string; error?: string };
        
        if (!adminResult?.success) {
          console.error('Admin creation failed:', adminResult?.error);
          throw new Error(adminResult?.error || 'Failed to create admin');
        }
        
        return {
          success: true,
          user_id: adminResult.user_id,
          tempPassword: tempPassword,
          message: 'Admin account created successfully'
        };
        
      } catch (error: any) {
        console.error('Admin creation error:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      toast({
        title: "Admin Account Created",
        description: "Admin account created successfully. They can now login with their email and will need to reset their password on first login.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['gyms-active'] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Admin creation error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (error?.message?.includes('duplicate key') || 
          error?.message?.includes('email_exists') || 
          error?.message?.includes('already registered') ||
          error?.message?.includes('users_email')) {
        errorMessage = 'This email is already registered. Please use a different email address.';
      } else if (error?.message?.includes('foreign key constraint')) {
        errorMessage = 'There was a database timing issue. Please try again in a few seconds.';
      } else if (error?.message?.includes('subscription plan')) {
        errorMessage = 'Invalid subscription plan selected. Please choose a valid plan.';
      }

      toast({
        title: "Failed to Create Admin",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AdminFormData) => {
    createAdminAccount.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
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
                      control={form.control}
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
                      control={form.control}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                                  // Only allow 10 digits for Indian numbers
                                  const formatted = digits.length <= 10 ? digits : e.target.value;
                                  field.onChange(formatted ? `+91 ${formatted}` : '');
                                }}
                                maxLength={12} // 10 digits + 2 spaces
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
                      control={form.control}
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
                    control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                    Choose the subscription tier and resource limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subscription_plan_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Plan *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subscription plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subscriptionPlans?.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{plan.name}</span>
                                  <span className="ml-2 text-muted-foreground">
                                    ₹{plan.price?.toLocaleString('en-IN')}/{plan.billing_cycle}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <CardDescription>
                          Select the subscription plan that defines the admin's resource limits
                        </CardDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Subscription Plan Limits */}
              {selectedPlan && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Plan Limits</CardTitle>
                    </div>
                    <CardDescription>
                      Resource limits for {selectedPlan.name} plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Max Branches</div>
                        <div className="text-2xl font-bold">{selectedPlan.max_branches}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Max Members</div>
                        <div className="text-2xl font-bold">{selectedPlan.max_members.toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Max Trainers</div>
                        <div className="text-2xl font-bold">{selectedPlan.max_trainers}</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="max_branches"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Branch Limit (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder={`Default: ${selectedPlan.max_branches}`}
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <CardDescription>
                              Override the default branch limit for this admin
                            </CardDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_members"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Member Limit (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder={`Default: ${selectedPlan.max_members}`}
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <CardDescription>
                              Override the default member limit for this admin
                            </CardDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {selectedPlan.features && Array.isArray(selectedPlan.features) && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-sm font-medium mb-2">Plan Features</div>
                          <ul className="space-y-1">
                            {selectedPlan.features.map((feature: string, index: number) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              disabled={createAdminAccount.isPending}
            >
              Reset Form
            </Button>
            <Button 
              type="submit" 
              disabled={createAdminAccount.isPending}
              className="min-w-[140px]"
            >
              {createAdminAccount.isPending ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
