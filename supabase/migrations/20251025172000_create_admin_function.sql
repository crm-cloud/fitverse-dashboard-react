-- Create a function to handle admin and gym creation
CREATE OR REPLACE FUNCTION create_admin_with_gym(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_subscription_plan TEXT,
  p_create_new_gym BOOLEAN,
  p_gym_name TEXT DEFAULT NULL,
  p_existing_gym_id UUID DEFAULT NULL,
  p_existing_branch_id UUID DEFAULT NULL,
  p_address JSONB DEFAULT NULL
) 
RETURNS TABLE (gym_id UUID, user_id UUID) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_gym_id UUID;
  v_branch_id UUID;
  v_profile_id UUID;
  v_subscription_id UUID;
  v_address_id UUID;
  v_default_branch_id UUID;
BEGIN
  -- Start a transaction
  BEGIN
    -- Insert address if provided
    IF p_address IS NOT NULL THEN
      INSERT INTO addresses (
        street, city, state, postal_code, country, 
        created_at, updated_at, is_active
      ) VALUES (
        p_address->>'street', 
        p_address->>'city',
        p_address->>'state',
        p_address->>'postal_code',
        p_address->>'country' OR 'India',
        NOW(),
        NOW(),
        TRUE
      )
      RETURNING id INTO v_address_id;
    END IF;

    -- Handle gym creation or selection
    IF p_create_new_gym THEN
      -- Create new gym
      INSERT INTO gyms (
        name,
        owner_id,
        subscription_plan,
        address_id,
        status,
        created_at,
        updated_at,
        is_active
      ) VALUES (
        p_gym_name,
        p_user_id,
        p_subscription_plan,
        v_address_id,
        'active',
        NOW(),
        NOW(),
        TRUE
      )
      RETURNING id INTO v_gym_id;

      -- Create default branch for the gym
      INSERT INTO branches (
        gym_id,
        name,
        address_id,
        phone,
        email,
        is_primary,
        status,
        created_at,
        updated_at,
        is_active
      ) VALUES (
        v_gym_id,
        'Main Branch',
        v_address_id,
        p_phone,
        p_email,
        TRUE,
        'active',
        NOW(),
        NOW(),
        TRUE
      )
      RETURNING id INTO v_default_branch_id;
    ELSE
      -- Use existing gym
      v_gym_id := p_existing_gym_id;
      v_branch_id := p_existing_branch_id;
      
      -- If no branch specified, use the first active branch
      IF v_branch_id IS NULL THEN
        SELECT id INTO v_branch_id 
        FROM branches 
        WHERE gym_id = v_gym_id AND is_active = TRUE 
        LIMIT 1;
      END IF;
    END IF;

    -- Create user profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      phone,
      role,
      created_at,
      updated_at,
      is_active
    ) VALUES (
      p_user_id,
      p_email,
      p_full_name,
      p_phone,
      'admin',
      NOW(),
      NOW(),
      TRUE
    )
    RETURNING id INTO v_profile_id;

    -- Create gym staff record
    INSERT INTO gym_staff (
      user_id,
      gym_id,
      branch_id,
      role,
      status,
      created_at,
      updated_at,
      is_active
    ) VALUES (
      p_user_id,
      v_gym_id,
      COALESCE(v_branch_id, v_default_branch_id),
      'admin',
      'active',
      NOW(),
      NOW(),
      TRUE
    );

    -- Create subscription record if needed
    IF p_subscription_plan IS NOT NULL AND p_create_new_gym THEN
      INSERT INTO subscriptions (
        gym_id,
        plan_name,
        status,
        start_date,
        end_date,
        created_at,
        updated_at,
        is_active
      ) VALUES (
        v_gym_id,
        p_subscription_plan,
        'active',
        NOW(),
        NOW() + INTERVAL '30 days', -- Default 30-day subscription
        NOW(),
        NOW(),
        TRUE
      )
      RETURNING id INTO v_subscription_id;
    END IF;

    -- Return the created gym and user IDs
    RETURN QUERY SELECT v_gym_id, p_user_id;

    -- If we get here, commit the transaction
    COMMIT;
  EXCEPTION WHEN OTHERS THEN
    -- If anything goes wrong, rollback the transaction
    ROLLBACK;
    -- Re-raise the exception
    RAISE EXCEPTION 'Error creating admin and gym: %', SQLERRM;
  END;
END;
$$;
