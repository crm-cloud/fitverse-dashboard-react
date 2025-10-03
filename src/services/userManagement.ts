import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

export interface CreateUserParams {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  gym_id?: string;
  branch_id?: string;
  date_of_birth?: Date;
  address?: Record<string, any>;
}

export interface CreateUserResult {
  user: any;
  profile: any;
  error?: any;
}

/**
 * Unified user creation service - Phase 2
 * Replaces Edge Function and auth.admin calls for security
 * 
 * Flow:
 * 1. Create auth user via signUp (standard auth)
 * 2. Profile auto-created by database trigger
 * 3. Assign role in user_roles table
 * 4. Update profile with gym/branch info
 */
export const createUserWithRole = async (params: CreateUserParams): Promise<CreateUserResult> => {
  const { 
    email, 
    password, 
    full_name, 
    phone, 
    role, 
    gym_id, 
    branch_id,
    date_of_birth,
    address 
  } = params;

  try {
    // Step 1: Create auth user with standard signUp (no admin privileges needed)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name,
          phone,
          // Don't pass role in metadata for security
        }
      }
    });

    if (authError) {
      return { user: null, profile: null, error: authError };
    }

    if (!authData.user) {
      return { 
        user: null, 
        profile: null, 
        error: new Error('User creation failed - no user returned') 
      };
    }

    // Step 2: Profile is auto-created by handle_new_user() trigger
    // Wait a moment for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Update profile with additional information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        gym_id: gym_id || null,
        branch_id: branch_id || null,
        phone: phone || null,
        date_of_birth: date_of_birth ? date_of_birth.toISOString().split('T')[0] : null,
        address: address || null,
        is_active: true,
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail completely, user is created
    }

    // Step 4: Assign role in user_roles table (critical for RBAC)
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: role,
        branch_id: branch_id || null,
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      return { 
        user: authData.user, 
        profile: null, 
        error: roleError 
      };
    }

    // Step 5: Fetch the updated profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (fetchError) {
      console.error('Profile fetch error:', fetchError);
    }

    return {
      user: authData.user,
      profile: profile,
      error: null
    };

  } catch (error) {
    console.error('User creation error:', error);
    return {
      user: null,
      profile: null,
      error
    };
  }
};

/**
 * Generate a temporary password for new users
 */
export const generateTempPassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Enable login capability for existing members - Phase 5
 * Creates auth user and links to member record
 */
export const enableMemberLogin = async (
  memberId: string, 
  email: string, 
  full_name: string,
  branch_id?: string
): Promise<CreateUserResult> => {
  try {
    const tempPassword = generateTempPassword();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/member/dashboard`,
        data: {
          full_name,
        }
      }
    });

    if (authError) {
      return { user: null, profile: null, error: authError };
    }

    if (!authData.user) {
      return { 
        user: null, 
        profile: null, 
        error: new Error('User creation failed') 
      };
    }

    // Wait for profile creation trigger
    await new Promise(resolve => setTimeout(resolve, 500));

    // Link auth user to member record
    const { error: memberError } = await supabase
      .from('members')
      .update({ user_id: authData.user.id })
      .eq('id', memberId);

    if (memberError) {
      console.error('Member link error:', memberError);
      return { user: authData.user, profile: null, error: memberError };
    }

    // Assign member role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'member',
        branch_id: branch_id || null,
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      return { user: authData.user, profile: null, error: roleError };
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        branch_id: branch_id || null,
        is_active: true,
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    return {
      user: authData.user,
      profile: null,
      error: null
    };

  } catch (error) {
    console.error('Member login enable error:', error);
    return {
      user: null,
      profile: null,
      error
    };
  }
};
