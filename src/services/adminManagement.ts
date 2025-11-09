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
    console.log('🚀 [AdminManagement] Creating admin account:', {
      email: params.email,
      full_name: params.full_name
    });

    // Call edge function with service role to bypass RLS
    const { data, error } = await supabase.functions.invoke('create-admin-account', {
      body: params
    });

    console.log('📊 [AdminManagement] Edge function response:', { data, error });

    if (error) {
      console.error('❌ [AdminManagement] Edge function error:', error);
      
      // Extract error message from response body if available
      let errorMessage = 'Failed to create admin account';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Check if it's a FunctionsHttpError with context
      if ((error as any).context?.body) {
        try {
          const errorBody = (error as any).context.body;
          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch (e) {
          console.error('Failed to parse error body:', e);
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    // Check if data indicates failure
    if (data && !data.success) {
      console.error('❌ [AdminManagement] Operation failed:', data.error);
      return {
        success: false,
        error: data.error || 'Failed to create admin account'
      };
    }

    console.log('✅ [AdminManagement] Admin account created successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [AdminManagement] Unexpected error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
};
