-- Replace create_admin_account_atomic with minimal admin-only implementation
-- This function ONLY creates the admin user, profile, role, and plan assignment
-- It does NOT create gym or gym_usage records

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
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid;
  v_encrypted_password text;
  v_max_branches integer;
  v_max_members integer;
BEGIN
  -- Only super-admins can create admin accounts
  IF get_user_role(auth.uid()) != 'super-admin' THEN
    RAISE EXCEPTION 'Only super admins can create admin accounts';
  END IF;

  -- Get subscription plan limits if provided
  IF p_subscription_plan_id IS NOT NULL THEN
    SELECT 
      COALESCE(p_max_branches, max_branches, 1),
      COALESCE(p_max_members, max_members, 100)
    INTO v_max_branches, v_max_members
    FROM subscription_plans 
    WHERE id = p_subscription_plan_id;
  ELSE
    v_max_branches := COALESCE(p_max_branches, 1);
    v_max_members := COALESCE(p_max_members, 100);
  END IF;

  -- Generate encrypted password
  v_encrypted_password := crypt(p_password, gen_salt('bf'));
  
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
    v_encrypted_password,
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_full_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;
  
  -- Validate user creation
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Failed to create auth user';
  END IF;
  
  -- Create profile (gym_id stays null - will be set when gym is created)
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    phone,
    role,
    date_of_birth,
    address,
    gym_id,
    status,
    is_active,
    onboarding_completed
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_phone,
    'admin',
    p_date_of_birth,
    p_address,
    NULL, -- No gym yet
    'active',
    true,
    false -- Onboarding not completed until gym is created
  );
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin');
  
  -- Create admin plan assignment
  INSERT INTO public.admin_plan_assignments (
    user_id,
    subscription_plan_id,
    max_branches,
    max_members,
    created_at
  ) VALUES (
    v_user_id,
    p_subscription_plan_id,
    v_max_branches,
    v_max_members,
    now()
  );
  
  -- Return success (NO gym_id or organization_id)
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'temp_password', p_password,
    'max_branches', v_max_branches,
    'max_members', v_max_members,
    'requires_gym_setup', true,
    'message', 'Admin account created successfully. Gym setup can be done separately.'
  );
  
EXCEPTION
  WHEN unique_violation THEN
    -- Cleanup on unique violation
    IF v_user_id IS NOT NULL THEN
      DELETE FROM public.user_roles WHERE user_id = v_user_id;
      DELETE FROM public.profiles WHERE user_id = v_user_id;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;
    RAISE EXCEPTION 'Admin creation failed: This email is already registered';
  WHEN OTHERS THEN
    -- Cleanup on any other error
    IF v_user_id IS NOT NULL THEN
      DELETE FROM public.user_roles WHERE user_id = v_user_id;
      DELETE FROM public.profiles WHERE user_id = v_user_id;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;
    RAISE EXCEPTION 'Admin creation failed: %', SQLERRM;
END;
$function$;