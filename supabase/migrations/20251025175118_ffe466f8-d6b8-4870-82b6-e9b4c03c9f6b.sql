-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin_plan_assignments table for per-admin quotas
CREATE TABLE IF NOT EXISTS public.admin_plan_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  max_branches INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_plan_assignments
ALTER TABLE public.admin_plan_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can manage all admin plan assignments
CREATE POLICY "Super admins can manage admin plans"
  ON public.admin_plan_assignments
  FOR ALL
  USING (get_user_role(auth.uid()) = 'super-admin')
  WITH CHECK (get_user_role(auth.uid()) = 'super-admin');

-- Policy: Admins can view their own plan assignment
CREATE POLICY "Admins can view own plan"
  ON public.admin_plan_assignments
  FOR SELECT
  USING (user_id = auth.uid());

-- Create the atomic admin creation function
CREATE OR REPLACE FUNCTION public.create_admin_account_atomic(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_address JSONB DEFAULT NULL,
  p_subscription_plan_id UUID DEFAULT NULL,
  p_max_branches INTEGER DEFAULT NULL,
  p_max_members INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_temp_password TEXT;
  v_result JSONB;
BEGIN
  -- Only super-admins can create admin accounts
  IF get_user_role(auth.uid()) != 'super-admin' THEN
    RAISE EXCEPTION 'Only super admins can create admin accounts';
  END IF;

  -- Generate temporary password
  v_temp_password := p_password;

  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(v_temp_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_full_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_user_id;

  -- Create profile
  INSERT INTO public.profiles (
    user_id,
    full_name,
    phone,
    date_of_birth,
    address,
    role
  ) VALUES (
    v_user_id,
    p_full_name,
    p_phone,
    p_date_of_birth,
    p_address,
    'admin'
  );

  -- Assign admin role in user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin');

  -- Create admin plan assignment
  INSERT INTO public.admin_plan_assignments (
    user_id,
    subscription_plan_id,
    max_branches,
    max_members
  ) VALUES (
    v_user_id,
    p_subscription_plan_id,
    COALESCE(p_max_branches, 1),
    COALESCE(p_max_members, 100)
  );

  -- Return success with user details
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'temp_password', v_temp_password,
    'message', 'Admin account created successfully'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Admin creation failed: %', SQLERRM;
END;
$$;

-- Create admin overview view for super-admin reporting
CREATE OR REPLACE VIEW public.admin_gym_branch_overview AS
SELECT 
  p.user_id,
  p.full_name,
  p.email,
  apa.subscription_plan_id,
  sp.name as subscription_plan_name,
  apa.max_branches,
  apa.max_members,
  COUNT(DISTINCT g.id) as gym_count,
  COUNT(DISTINCT b.id) as branch_count,
  COUNT(DISTINCT m.id) as member_count,
  p.created_at
FROM public.profiles p
LEFT JOIN public.admin_plan_assignments apa ON apa.user_id = p.user_id
LEFT JOIN public.subscription_plans sp ON sp.id = apa.subscription_plan_id
LEFT JOIN public.gyms g ON g.created_by = p.user_id
LEFT JOIN public.branches b ON b.gym_id = g.id
LEFT JOIN public.members m ON m.branch_id = b.id
WHERE p.role = 'admin'
GROUP BY p.user_id, p.full_name, p.email, apa.subscription_plan_id, sp.name, apa.max_branches, apa.max_members, p.created_at;