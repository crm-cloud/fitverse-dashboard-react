import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, password, full_name, phone, role, gym_id, branch_id, date_of_birth, address } = await req.json();

    // Step 1: Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);

    if (userExists) {
      return new Response(
        JSON.stringify({ error: 'A user with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Create auth user using admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        phone,
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    const userId = authData.user.id;

    // Step 3: Verify user exists in auth.users with retry logic
    const maxRetries = 5;
    let userVerified = false;
    
    for (let i = 0; i < maxRetries; i++) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData?.user) {
        userVerified = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between retries
    }

    if (!userVerified) {
      throw new Error('User creation verification failed - user not found in auth.users');
    }

    // Step 4: Wait for profile creation trigger
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 5: Update profile with additional info
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        gym_id: gym_id || null,
        branch_id: branch_id || null,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        address: address || null,
        role: role,
        is_active: true,
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail completely, continue with role assignment
    }

    // Step 6: Assign role in user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        branch_id: branch_id || null,
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      throw new Error(`Failed to assign role: ${roleError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        message: 'Admin account created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating admin user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
