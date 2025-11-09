import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { 
      email, 
      password, 
      full_name, 
      phone, 
      date_of_birth, 
      address, 
      subscription_plan_id, 
      max_branches, 
      max_members 
    } = body;

    console.log('Creating admin account for:', email);
    
    // Validate required fields
    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: email, password, and full_name are required' 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subscription plan limits
    let finalMaxBranches = max_branches || 1;
    let finalMaxMembers = max_members || 100;

    if (subscription_plan_id) {
      const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('max_branches, max_members')
        .eq('id', subscription_plan_id)
        .single();

      if (plan) {
        finalMaxBranches = max_branches || plan.max_branches || 1;
        finalMaxMembers = max_members || plan.max_members || 100;
      }
    }

    // 1. Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    const existingUser = existingUsers?.users.find(u => u.email === email);
    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      console.log('User already exists:', existingUser.id);
      userId = existingUser.id;

      // Check if user is already an admin
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        console.log('User already has admin role');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `An admin account with email "${email}" already exists. Please use a different email address or manage the existing admin account.` 
          }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // User exists but is not an admin - we'll upgrade them
      console.log('Upgrading existing user to admin');
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          phone,
          role: 'admin'
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        return new Response(
          JSON.stringify({ success: false, error: authError.message }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!authData.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create auth user' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = authData.user.id;
      isNewUser = true;
      console.log('Auth user created:', userId);

      // Wait for trigger to create profile
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 2. Update profile with admin details (service role bypasses RLS)
    const profileUpdate: any = {
      role: 'admin',
      gym_id: null, // Admin will create gym on first login
      is_active: true,
    };

    // Only update these fields for new users or if provided
    if (isNewUser || full_name) profileUpdate.full_name = full_name;
    if (isNewUser || phone) profileUpdate.phone = phone;
    if (date_of_birth) profileUpdate.date_of_birth = date_of_birth;
    if (address) profileUpdate.address = address;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('user_id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail completely - profile exists from trigger
    }

    // 3. Insert or update admin role (service role bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, {
        onConflict: 'user_id,role'
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      // Only cleanup if it was a new user
      if (isNewUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      return new Response(
        JSON.stringify({ success: false, error: `Role assignment failed: ${roleError.message}` }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin role assigned');

    // 4. Create or update admin plan assignment
    const { error: planError } = await supabaseAdmin
      .from('admin_plan_assignments')
      .upsert({
        user_id: userId,
        subscription_plan_id: subscription_plan_id || null,
        max_branches: finalMaxBranches,
        max_members: finalMaxMembers,
      }, {
        onConflict: 'user_id'
      });

    if (planError) {
      console.error('Plan assignment error:', planError);
      return new Response(
        JSON.stringify({ success: false, error: `Plan assignment failed: ${planError.message}` }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin plan assigned');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userId,
        max_branches: finalMaxBranches,
        max_members: finalMaxMembers,
        message: isNewUser ? 'Admin account created successfully' : 'User upgraded to admin successfully'
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Admin creation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error occurred' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
