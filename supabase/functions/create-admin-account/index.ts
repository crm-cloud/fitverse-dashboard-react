import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAdminRequest {
  full_name: string;
  email: string;
  phone?: string;
  subscription_plan: string;
  gym_name?: string;
  create_new_gym?: boolean;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const resend = new Resend(resendApiKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { full_name, email, phone, subscription_plan, gym_name, create_new_gym }: CreateAdminRequest = await req.json();
    
    console.log('Creating admin account:', { full_name, email, subscription_plan, create_new_gym });

    // Generate temporary password
    const tempPassword = 'GymFit' + Math.random().toString(36).slice(-8) + '!';

    // Create auth user with service role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log('User created successfully:', authData.user.id);

    let gym_id = null;
    let gymName = gym_name || `${full_name}'s Gym`;

    // Create gym if needed
    if (create_new_gym) {
      const { data: subscriptionPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', subscription_plan)
        .eq('is_active', true)
        .single();

      if (planError) {
        console.error('Subscription plan error:', planError);
        throw new Error('Invalid subscription plan');
      }

      // Create new gym
      const { data: newGym, error: gymError } = await supabase
        .from('gyms')
        .insert([{
          name: gymName,
          billing_email: email,
          subscription_plan: subscription_plan.toLowerCase(),
          max_branches: subscriptionPlan.max_branches || 1,
          max_trainers: subscriptionPlan.max_trainers || 5,
          max_members: subscriptionPlan.max_members || 100,
          status: 'active',
          created_by: authData.user.id
        }])
        .select()
        .single();

      if (gymError) {
        console.error('Gym creation error:', gymError);
        throw gymError;
      }

      gym_id = newGym.id;
      console.log('Gym created:', gym_id);
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email,
        full_name,
        phone: phone || null,
        role: 'admin',
        gym_id,
        is_active: true
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    console.log('Profile created successfully');

    // Send welcome email
    try {
      const emailResponse = await resend.emails.send({
        from: "GymFit <noreply@resend.dev>",
        to: [email],
        subject: "Welcome to GymFit - Your Admin Account is Ready!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to GymFit!</h1>
            <p>Hi ${full_name},</p>
            <p>Your GymFit admin account has been created successfully. Here are your login details:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              ${gym_id ? `<p><strong>Gym:</strong> ${gymName}</p>` : ''}
              <p><strong>Subscription Plan:</strong> ${subscription_plan}</p>
            </div>

            <p><strong>Important:</strong> Please change your password after your first login for security.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${supabaseUrl.replace('https://', '').replace('.supabase.co', '')}.lovable.app/login" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to GymFit
              </a>
            </div>

            <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>The GymFit Team</p>
          </div>
        `,
      });

      console.log('Welcome email sent:', emailResponse);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't throw error - account creation should still succeed
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: authData.user.id,
      gym_id,
      message: 'Admin account created successfully. Login credentials sent via email.'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in create-admin-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create admin account',
        details: error.details || null 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});