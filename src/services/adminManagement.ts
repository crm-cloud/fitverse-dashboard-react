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
    // Call edge function with service role to bypass RLS
    const { data, error } = await supabase.functions.invoke('create-admin-account', {
      body: params
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create admin account'
      };
    }

    return data;
  } catch (error: any) {
    console.error('Admin creation error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
};
