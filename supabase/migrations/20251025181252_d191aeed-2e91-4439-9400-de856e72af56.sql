-- Fix create_admin_account_atomic to not require gym_usage
DROP FUNCTION IF EXISTS create_admin_account_atomic(text, text, text, text, date, jsonb, uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.create_admin_account_atomic(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text DEFAULT NULL,
  p_date_of_birth date DEFAULT NULL,
  p_address jsonb DEFAULT NULL,
  p_subscription_plan_id uuid DEFAULT NULL,
  p_max_branches integer DEFAULT NULL,
  p_max_members integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_temp_password TEXT;
  v_result JSONB;
  v_max_branches INTEGER;
  v_max_members INTEGER;
BEGIN
  -- Only super-admins can create admin accounts
  IF get_user_role(auth.uid()) != 'super-admin' THEN
    RAISE EXCEPTION 'Only super admins can create admin accounts';
  END IF;

  -- Get subscription plan limits if provided
  IF p_subscription_plan_id IS NOT NULL THEN
    SELECT max_branches, max_members 
    INTO v_max_branches, v_max_members
    FROM subscription_plans 
    WHERE id = p_subscription_plan_id;
    
    -- Use custom limits if provided, otherwise use plan defaults
    v_max_branches := COALESCE(p_max_branches, v_max_branches, 1);
    v_max_members := COALESCE(p_max_members, v_max_members, 100);
  ELSE
    -- Use provided limits or defaults if no subscription plan
    v_max_branches := COALESCE(p_max_branches, 1);
    v_max_members := COALESCE(p_max_members, 100);
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

  -- Create profile (without gym_id initially)
  INSERT INTO public.profiles (
    user_id,
    full_name,
    email,
    phone,
    date_of_birth,
    address,
    role,
    status
  ) VALUES (
    v_user_id,
    p_full_name,
    p_email,
    p_phone,
    p_date_of_birth,
    p_address,
    'admin',
    'active'
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
    v_max_branches,
    v_max_members
  );

  -- Return success with user details
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'temp_password', v_temp_password,
    'max_branches', v_max_branches,
    'max_members', v_max_members,
    'message', 'Admin account created successfully'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Admin creation failed: %', SQLERRM;
END;
$$;