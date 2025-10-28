-- Harden create_admin_account_atomic: wrap gym_usage insert in safe block with logging
CREATE OR REPLACE FUNCTION public.create_admin_account_atomic(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text DEFAULT NULL::text,
  p_date_of_birth date DEFAULT NULL::date,
  p_address jsonb DEFAULT NULL::jsonb,
  p_subscription_plan_id uuid DEFAULT NULL::uuid,
  p_max_branches integer DEFAULT NULL::integer,
  p_max_members integer DEFAULT NULL::integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_organization_id UUID;
  v_encrypted_password TEXT;
  v_max_branches INTEGER;
  v_max_members INTEGER;
  v_org_name TEXT;
BEGIN
  IF get_user_role(auth.uid()) != 'super-admin' THEN
    RAISE EXCEPTION 'Only super admins can create admin accounts';
  END IF;

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

  v_org_name := p_full_name || '''s Organization';
  v_encrypted_password := crypt(p_password, gen_salt('bf'));
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
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
    now(), now(), '', '', '', ''
  ) RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Failed to create auth user';
  END IF;

  INSERT INTO public.gyms (
    name, subscription_plan, status, created_by, created_at, updated_at
  ) VALUES (
    v_org_name,
    COALESCE((SELECT name FROM subscription_plans WHERE id = p_subscription_plan_id), 'basic'),
    'active',
    v_user_id,
    now(), now()
  ) RETURNING id INTO v_organization_id;

  IF v_organization_id IS NULL THEN
    SELECT id INTO v_organization_id 
    FROM public.gyms 
    WHERE created_by = v_user_id 
    ORDER BY created_at DESC 
    LIMIT 1;
    IF v_organization_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create organization (gyms insert returned null). User ID: %', v_user_id;
    END IF;
  END IF;

  -- Log org id for debugging
  RAISE NOTICE 'create_admin_account_atomic: v_organization_id=%', v_organization_id;

  INSERT INTO public.profiles (
    user_id, email, full_name, phone, role, date_of_birth, address, gym_id, status, onboarding_completed
  ) VALUES (
    v_user_id, p_email, p_full_name, p_phone, 'admin', p_date_of_birth, p_address, v_organization_id, 'active', false
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin');

  INSERT INTO public.admin_plan_assignments (
    user_id, subscription_plan_id, max_branches, max_members, created_at
  ) VALUES (
    v_user_id, p_subscription_plan_id, v_max_branches, v_max_members, now()
  );

  -- Safely attempt to initialize gym_usage; never fail the whole function
  IF v_organization_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.gym_usage (
        gym_id, month_year, branch_count, member_count, trainer_count, storage_used, api_calls, created_at
      ) VALUES (
        v_organization_id,
        date_trunc('month', CURRENT_DATE),
        0, 0, 0, 0, 0, now()
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping gym_usage init due to error: %', SQLERRM;
      -- Continue without failing
    END;
  ELSE
    RAISE NOTICE 'Skipping gym_usage init: v_organization_id is NULL';
  END IF;

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
      IF v_organization_id IS NOT NULL THEN
        DELETE FROM public.gyms WHERE id = v_organization_id;
      END IF;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;
    RAISE EXCEPTION 'Admin creation failed: %', SQLERRM;
END;
$function$;