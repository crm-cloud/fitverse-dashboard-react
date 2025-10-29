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
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

const gymFormSchema = z.object({
  gym_name: z.string().min(2, 'Gym name must be at least 2 characters'),
  subscription_plan_id: z.string().min(1, 'Please select a subscription plan'),
  max_branches: z.number().min(1, 'At least 1 branch is required'),
  max_members: z.number().min(1, 'At least 1 member is required'),
});

type AdminFormData = z.infer<typeof adminFormSchema>;
type GymFormData = z.infer<typeof gymFormSchema>;

interface AdminAccountFormProps {
  onSuccess: () => void;
}

export function AdminAccountForm({ onSuccess }: AdminAccountFormProps) {
  // Initialize all hooks at the top level
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [step, setStep] = useState<'admin' | 'gym'>('admin');
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize forms at the top level
  const adminForm = useForm<AdminFormData>({
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
        country: '',
        postal_code: ''
      },
      subscription_plan_id: '',
      max_branches: 1,
      max_members: 100
    }
  });

  const gymForm = useForm<GymFormData>({
    resolver: zodResolver(gymFormSchema),
    defaultValues: {
      gym_name: '',
      subscription_plan_id: adminForm.watch('subscription_plan_id'),
      max_branches: adminForm.watch('max_branches') || 1,
      max_members: adminForm.watch('max_members') || 100,
    },
  });
  
  // Initialize mutations at the top level
  const createAdminMutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      // ... existing mutation logic
    },
    onSuccess: (result) => {
      setAdminUserId(result.user_id);
      
      if (isSuperAdmin) {
        toast({
          title: "Super Admin Account Created",
          description: "The admin account has been created successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
        onSuccess();
      } else {
        setStep('gym');
        toast({
          title: "Admin Account Created",
          description: "Now let's set up your gym.",
        });
        queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      }
    },
    onError: (error: any) => {
      console.error('Admin creation error:', error);
      toast({
        title: "Error creating admin",
        description: error.message || 'Failed to create admin account',
        variant: "destructive",
      });
    }
  });
  
  const createGymMutation = useMutation({
    mutationFn: async (data: GymFormData) => {
      // ... existing gym creation logic
    },
    onSuccess: () => {
      toast({
        title: "Gym setup complete!",
        description: "The gym has been successfully set up.",
      });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Gym creation error:', error);
      toast({
        title: "Error setting up gym",
        description: error.message || 'Failed to set up gym',
        variant: "destructive",
      });
    }
  });
  
  // Check if current user is super admin and set initial step
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error getting user:', userError);
          setIsLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setIsLoading(false);
          return;
        }

        const isSuperAdmin = profile?.role === 'super-admin';
        setIsSuperAdmin(isSuperAdmin);
        
        // If user is not a super admin, ensure we're on the admin step
        if (!isSuperAdmin) {
          setStep('admin');
        }
      } catch (error) {
        console.error('Error in role check:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserRole();
  }, []);

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
        
        // Call the updated RPC function (without gym creation)
        const { data: result, error } = await supabase.rpc('create_admin_account_atomic', {
          p_email: data.email,
          p_password: tempPassword,
          p_full_name: data.full_name,
          p_phone: data.phone || null,
          p_date_of_birth: data.date_of_birth || null,
          p_address: data.address || null,
          p_subscription_plan_id: data.subscription_plan_id,
          p_max_branches: data.max_branches || 1,
          p_max_members: data.max_members || 100,
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
          message: 'Admin account created successfully. Please set up your gym.'
        };
        
      } catch (error: any) {
        console.error('Admin creation error:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      setAdminUserId(result.user_id);
      
      // Skip gym setup for super admins
      if (isSuperAdmin) {
        toast({
          title: "Super Admin Account Created",
          description: "The admin account has been created successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
        onSuccess();
        return;
      }
      
      // For regular admins, proceed to gym setup
      setStep('gym');
      toast({
        title: "Admin Account Created",
        description: "Now let's set up your gym.",
      });
      
      // Invalidate queries but don't reset form yet
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
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

  // Gym creation mutation
  const createGym = useMutation({
    mutationFn: async (data: GymFormData) => {
      if (!adminUserId) {
        throw new Error('Admin user ID is missing');
      }
      
      const { data: result, error } = await supabase.rpc('create_gym_for_admin', {
        p_admin_id: adminUserId,
        p_gym_name: data.gym_name,
        p_subscription_plan_id: data.subscription_plan_id,
        p_max_branches: data.max_branches,
        p_max_members: data.max_members,
      });
      
      if (error) {
        console.error('Gym creation error:', error);
        throw new Error(error.message || 'Failed to create gym');
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Gym Setup Complete",
        description: "Admin account and gym setup completed successfully!",
      });
      
      // Invalidate queries and reset
      queryClient.invalidateQueries({ queryKey: ['gyms-active'] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Gym Setup Failed",
        description: error.message || 'Failed to set up gym. Please try again.',
        variant: "destructive"
      });
    }
  });

  // Form handlers
  const onSubmitAdmin = (data: AdminFormData) => {
    createAdminAccount.mutate(data);
  };

  const onSubmitGym = (data: GymFormData) => {
    createGym.mutate(data);
  };

  const gymForm = useForm<GymFormData>({
    resolver: zodResolver(gymFormSchema),
    defaultValues: {
      gym_name: '',
      subscription_plan_id: form.watch('subscription_plan_id'),
      max_branches: form.watch('max_branches') || 1,
      max_members: form.watch('max_members') || 100,
    },
  });

  // Don't show gym setup for super admins
  if (isSuperAdmin) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Super Admin Account Created</h2>
          <p className="text-muted-foreground mt-2">
            The admin account has been created successfully.
          </p>
        </div>
        <Button onClick={onSuccess}>
          Back to Admin List
        </Button>
      </div>
    );
  }

  // Render the appropriate form based on the current step
  if (step === 'gym') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Set Up Your Gym</h2>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep('admin')}
          >
            Back to Admin Details
          </Button>
        </div>
        
        <Form {...gymForm}>
          <form onSubmit={gymForm.handleSubmit(onSubmitGym)} className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Gym Information</CardTitle>
                </div>
                <CardDescription>
                  Enter details about your gym
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={gymForm.control}
                  name="gym_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gym Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter gym name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={gymForm.control}
                  name="max_branches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Branches *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={gymForm.control}
                  name="max_members"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Members *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Skip gym creation for now
                  form.reset();
                  onSuccess();
                }}
              >
                Skip for Now
              </Button>
              <Button 
                type="submit" 
                disabled={createGym.isPending}
              >
                {createGym.isPending ? 'Creating Gym...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // Admin form (default view)
  return (
    <div className="max-w-7xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitAdmin)} className="space-y-6">
          
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
