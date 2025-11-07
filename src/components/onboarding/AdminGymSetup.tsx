import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2 } from 'lucide-react';

const gymSetupSchema = z.object({
  gym_name: z.string().min(2, 'Gym name must be at least 2 characters'),
  branch_name: z.string().min(2, 'Branch name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().default('India'),
  }).optional(),
});

type GymSetupFormData = z.infer<typeof gymSetupSchema>;

interface AdminGymSetupProps {
  adminId: string;
  onComplete: () => void;
}

export function AdminGymSetup({ adminId, onComplete }: AdminGymSetupProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GymSetupFormData>({
    resolver: zodResolver(gymSetupSchema),
    defaultValues: {
      gym_name: '',
      branch_name: 'Main Branch',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
      },
    },
  });

  const onSubmit = async (data: GymSetupFormData) => {
    console.log('🏢 [Gym Setup] Starting gym creation...', {
      adminId,
      gymName: data.gym_name,
      branchName: data.branch_name
    });
    setIsLoading(true);

    try {
      // Call create_gym_with_branch function
      console.log('📞 [Gym Setup] Calling RPC function...');
      const { data: result, error } = await supabase.rpc('create_gym_with_branch', {
        p_admin_id: adminId,
        p_gym_name: data.gym_name,
        p_gym_details: data.address ? { address: data.address, phone: data.phone } : null,
        p_branch_name: data.branch_name,
        p_branch_details: data.address ? { address: data.address, phone: data.phone } : null,
      });

      console.log('📊 [Gym Setup] RPC Response:', { result, error });

      if (error) {
        console.error('❌ [Gym Setup] RPC Error:', error);
        throw error;
      }

      if (!result || !(result as any).success) {
        console.error('❌ [Gym Setup] Creation failed:', result);
        throw new Error((result as any)?.message || 'Failed to create gym. Please try again.');
      }

      console.log('✅ [Gym Setup] Gym created successfully:', {
        gymId: (result as any).gym_id,
        branchId: (result as any).branch_id
      });

      toast({
        title: 'Gym Created Successfully! 🎉',
        description: 'Your gym and branch have been set up. Welcome to the platform!',
      });

      // Refresh auth to get updated profile
      console.log('🔄 [Gym Setup] Refreshing session...');
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('⚠️ [Gym Setup] Session refresh error:', refreshError);
      }

      // Small delay to ensure session is updated
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ [Gym Setup] Setup complete, redirecting...');
      onComplete();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ [Gym Setup] Fatal error:', error);
      toast({
        title: 'Setup Error',
        description: error.message || 'Failed to create gym. Please contact support if the issue persists.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Your Gym Management Platform</CardTitle>
          <CardDescription>
            Let's set up your gym and main branch to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Gym Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Gym Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="gym_name">Gym Name *</Label>
                <Input
                  id="gym_name"
                  {...form.register('gym_name')}
                  placeholder="e.g., FitLife Gym"
                />
                {form.formState.errors.gym_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.gym_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_name">Main Branch Name *</Label>
                <Input
                  id="branch_name"
                  {...form.register('branch_name')}
                  placeholder="e.g., Main Branch"
                />
                {form.formState.errors.branch_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.branch_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Address (Optional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    {...form.register('address.street')}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register('address.city')}
                    placeholder="Mumbai"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...form.register('address.state')}
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    {...form.register('address.postal_code')}
                    placeholder="400001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...form.register('address.country')}
                    placeholder="India"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Gym & Get Started
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
