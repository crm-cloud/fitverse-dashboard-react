-- Update create_admin_account_atomic function to work with organizations
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
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_organization_id UUID;
  v_encrypted_password TEXT;
  v_max_branches INTEGER;
  v_max_members INTEGER;
  v_org_name TEXT;
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
    
    v_max_branches := COALESCE(p_max_branches, v_max_branches, 1);
    v_max_members := COALESCE(p_max_members, v_max_members, 100);
  ELSE
    v_max_branches := COALESCE(p_max_branches, 1);
    v_max_members := COALESCE(p_max_members, 100);
  END IF;

  -- Generate organization name from admin name
  v_org_name := p_full_name || '''s Organization';

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
  
  -- Create organization
  INSERT INTO public.organizations (
    name,
    owner_user_id,
    subscription_plan_id,
    status,
    billing_email,
    billing_address,
    created_at,
    updated_at
  ) VALUES (
    v_org_name,
    v_user_id,
    p_subscription_plan_id,
    'trial',
    p_email,
    p_address,
    now(),
    now()
  ) RETURNING id INTO v_organization_id;
  
  -- Create profile
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    phone,
    role,
    date_of_birth,
    address,
    organization_id,
    status,
    onboarding_completed
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_phone,
    'admin',
    p_date_of_birth,
    p_address,
    v_organization_id,
    'active',
    false
  );
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin');
  
  -- Create admin plan assignment
  INSERT INTO public.admin_plan_assignments (
    user_id,
    subscription_plan_id,
    organization_id,
    max_branches,
    max_members,
    created_at
  ) VALUES (
    v_user_id,
    p_subscription_plan_id,
    v_organization_id,
    v_max_branches,
    v_max_members,
    now()
  );
  
  -- Initialize organization usage
  INSERT INTO public.organization_usage (
    organization_id,
    month_year,
    branch_count,
    member_count,
    trainer_count,
    storage_used,
    api_calls
  ) VALUES (
    v_organization_id,
    date_trunc('month', CURRENT_DATE),
    0,
    0,
    0,
    0,
    0
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'organization_id', v_organization_id,
    'temp_password', p_password,
    'max_branches', v_max_branches,
    'max_members', v_max_members,
    'requires_onboarding', true,
    'message', 'Admin account created successfully. They can now create their gym branches.'
  );
  
EXCEPTION
  WHEN unique_violation THEN
    IF v_user_id IS NOT NULL THEN
      DELETE FROM public.profiles WHERE user_id = v_user_id;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;
    RAISE EXCEPTION 'Admin creation failed: This email is already registered';
  WHEN OTHERS THEN
    IF v_user_id IS NOT NULL THEN
      DELETE FROM public.profiles WHERE user_id = v_user_id;
      DELETE FROM public.organizations WHERE id = v_organization_id;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;
    RAISE EXCEPTION 'Admin creation failed: %', SQLERRM;
END;
$$;