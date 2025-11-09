import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { createAdminAccount } from '@/services/adminManagement';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User, Phone, CreditCard, CheckCircle, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';

const adminFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  subscription_plan_id: z.string().optional(),
  max_branches: z.coerce.number().min(1).optional(),
  max_members: z.coerce.number().min(1).optional(),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

interface AdminAccountWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const steps = [
  { id: 1, name: 'Basic Info', icon: User },
  { id: 2, name: 'Contact', icon: Phone },
  { id: 3, name: 'Subscription', icon: CreditCard },
  { id: 4, name: 'Review', icon: CheckCircle }
];

export const AdminAccountWizard = ({ open, onClose, onSuccess }: AdminAccountWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone: '',
      date_of_birth: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      subscription_plan_id: '',
      max_branches: 1,
      max_members: 100,
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔄 [AdminWizard] Submitting admin creation...');
      const result = await createAdminAccount(data);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result) => {
      console.log('✅ [AdminWizard] Admin created successfully');
      toast({
        title: 'Admin Account Created Successfully',
        description: `${form.getValues('full_name')} can now log in and set up their gym. Max branches: ${result.max_branches}, Max members: ${result.max_members}`,
      });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      form.reset();
      setCurrentStep(1);
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ [AdminWizard] Failed to create admin:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Create Admin Account',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    },
  });

  const { data: plans } = useQuery({
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

  const nextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (step: number): (keyof AdminFormData)[] => {
    switch (step) {
      case 1:
        return ['email', 'password', 'full_name'];
      case 2:
        return ['phone', 'date_of_birth'];
      case 3:
        return ['subscription_plan_id'];
      default:
        return [];
    }
  };

  const onSubmit = (data: AdminFormData) => {
    const address = data.street || data.city ? {
      street: data.street || '',
      city: data.city || '',
      state: data.state || '',
      postal_code: data.postal_code || '',
      country: data.country || '',
    } : undefined;

    createAdminMutation.mutate({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      address,
      subscription_plan_id: data.subscription_plan_id || '',
      max_branches: data.max_branches,
      max_members: data.max_members,
    });
  };

  const selectedPlanId = form.watch('subscription_plan_id');
  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

  const progress = (currentStep / steps.length) * 100;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Admin Account</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    currentStep === step.id ? 'text-primary font-medium' : ''
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.name}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Contact */}
              {currentStep === 2 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
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
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4" />
                        <h3 className="font-medium">Address</h3>
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
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
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="NY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="postal_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="10001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="USA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Subscription */}
              {currentStep === 3 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="subscription_plan_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subscription Plan</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {plans?.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} - ${plan.price}/month
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedPlan && (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Branches:</span>
                            <span className="font-medium">{selectedPlan.max_branches}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Members:</span>
                            <span className="font-medium">{selectedPlan.max_members}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <FormField
                        control={form.control}
                        name="max_branches"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Override Max Branches</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_members"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Override Max Members</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Review & Confirm</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Full Name:</span>
                        <span className="font-medium">{form.getValues('full_name')}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{form.getValues('email')}</span>
                      </div>
                      {form.getValues('phone') && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{form.getValues('phone')}</span>
                        </div>
                      )}
                      {selectedPlan && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Plan:</span>
                          <span className="font-medium">{selectedPlan.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Max Branches:</span>
                        <span className="font-medium">{form.getValues('max_branches')}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Max Members:</span>
                        <span className="font-medium">{form.getValues('max_members')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={createAdminMutation.isPending}>
                    {createAdminMutation.isPending ? 'Creating...' : 'Create Admin Account'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
