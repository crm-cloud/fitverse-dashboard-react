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
 * @deprecated Use member-specific or team-specific creation methods instead
 */
export const createUserWithRole = async (params: CreateUserParams): Promise<CreateUserResult> => {
  throw new Error('createUserWithRole is deprecated. Use appropriate role-specific creation methods.');
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
  password: string,
  branch_id?: string
): Promise<CreateUserResult> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/member/dashboard`,
        data: {
          full_name,
        },
      },
    });

    if (authError) {
      return { user: null, profile: null, error: authError };
    }

    if (!authData.user) {
      return {
        user: null,
        profile: null,
        error: new Error('User creation failed'),
      };
    }

    // Wait for profile creation trigger
    await new Promise((resolve) => setTimeout(resolve, 500));

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
    const { error: roleError } = await supabase.from('user_roles').insert({
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
      error: null,
    };
  } catch (error) {
    console.error('Member login enable error:', error);
    return {
      user: null,
      profile: null,
      error,
    };
  }
};
