import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        ...corsHeaders, 
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
      }, 
      status: 204 
    })
  }

  try {
    // Create Supabase client with SERVICE ROLE key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validate caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      console.error('Auth validation error:', userError)
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if caller is super-admin
    const { data: roles, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super-admin')
      .maybeSingle()

    if (roleCheckError) {
      console.error('Role check error:', roleCheckError)
    }

    if (!roles) {
      console.error('Unauthorized: User', user.id, 'is not a super-admin')
      return new Response(JSON.stringify({ error: 'Unauthorized: Only super-admins can create admins' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const { email, password, full_name, phone, gym_id, branch_id, date_of_birth, address } = await req.json()

    console.log('Creating admin user:', email)

    // Create user using Admin API (bypasses email confirmation)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { full_name, phone }
    })

    if (createError) {
      console.error('User creation error:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User created:', newUser.user.id)

    // Wait briefly for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Insert into user_roles (service role bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ 
        user_id: newUser.user.id, 
        role: 'admin', 
        branch_id: branch_id || null 
      })

    if (roleError) {
      console.error('Role assignment error:', roleError)
      // Don't fail completely, role can be assigned later
    } else {
      console.log('Role assigned successfully')
    }

    // Update profile with additional metadata
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        gym_id: gym_id || null,
        branch_id: branch_id || null,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        address: address || null,
        is_active: true,
      })
      .eq('user_id', newUser.user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
    } else {
      console.log('Profile updated successfully')
    }

    return new Response(JSON.stringify({
      success: true,
      user_id: newUser.user.id,
      email: newUser.user.email,
      message: 'Admin created successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
