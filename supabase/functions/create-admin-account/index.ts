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

    // 1. Create auth user with service role (bypasses RLS)
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

    const userId = authData.user.id;
    console.log('Auth user created:', userId);

    // Wait for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Update profile with admin details (service role bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        phone,
        date_of_birth: date_of_birth || null,
        address: address || null,
        role: 'admin',
        gym_id: null, // Admin will create gym on first login
        is_active: true,
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail completely - profile exists from trigger
    }

    // 3. Insert admin role (service role bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      // Cleanup on failure
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ success: false, error: `Role assignment failed: ${roleError.message}` }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin role assigned');

    // 4. Create admin plan assignment
    const { error: planError } = await supabaseAdmin
      .from('admin_plan_assignments')
      .insert({
        user_id: userId,
        subscription_plan_id: subscription_plan_id || null,
        max_branches: finalMaxBranches,
        max_members: finalMaxMembers,
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
        max_members: finalMaxMembers
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
