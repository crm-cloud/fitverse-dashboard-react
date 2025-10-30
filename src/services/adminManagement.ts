import { supabase } from '@/integrations/supabase/client';

export interface CreateAdminParams {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: object;
  subscription_plan_id: string;
  max_branches?: number;
  max_members?: number;
}

export interface CreateAdminResult {
  success: boolean;
  user_id?: string;
  error?: string;
  max_branches?: number;
  max_members?: number;
}

/**
 * Create admin account using client-side auth (no gym creation)
 * Super-admin only operation
 */
export const createAdminAccount = async (
  params: CreateAdminParams
): Promise<CreateAdminResult> => {
  try {
    // Get subscription plan limits
    let maxBranches = params.max_branches || 1;
    let maxMembers = params.max_members || 100;

    if (params.subscription_plan_id) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('max_branches, max_members')
        .eq('id', params.subscription_plan_id)
        .single();

      if (plan) {
        maxBranches = params.max_branches || plan.max_branches || 1;
        maxMembers = params.max_members || plan.max_members || 100;
      }
    }

    // 1. Create auth user using admin API
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.full_name,
          phone: params.phone,
          role: 'admin',
        },
      },
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create auth user',
      };
    }

    const userId = authData.user.id;

    // Wait for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Update profile with admin details (gym_id stays null)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: params.full_name,
        phone: params.phone,
        date_of_birth: params.date_of_birth || null,
        address: params.address ? JSON.parse(JSON.stringify(params.address)) : null,
        role: 'admin',
        gym_id: null, // No gym yet - admin will create it on first login
        is_active: true,
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail completely - profile exists from trigger
    }

    // 3. Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin',
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      return {
        success: false,
        error: `Role assignment failed: ${roleError.message}`,
      };
    }

    // 4. Create admin plan assignment (resource limits)
    const { error: planError } = await supabase
      .from('admin_plan_assignments')
      .insert({
        user_id: userId,
        subscription_plan_id: params.subscription_plan_id || null,
        max_branches: maxBranches,
        max_members: maxMembers,
      });

    if (planError) {
      console.error('Plan assignment error:', planError);
      return {
        success: false,
        error: `Plan assignment failed: ${planError.message}`,
      };
    }

    return {
      success: true,
      user_id: userId,
      max_branches: maxBranches,
      max_members: maxMembers,
    };
  } catch (error: any) {
    console.error('Admin creation error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
};
