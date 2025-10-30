-- Drop old RPC functions for admin creation (replaced with client-side auth)

DROP FUNCTION IF EXISTS public.create_admin_account_atomic(text, text, text, text, date, jsonb, uuid, integer, integer);
DROP FUNCTION IF EXISTS public.create_admin_with_gym(uuid, text, text, text, text, boolean, text, uuid, uuid, jsonb);
DROP FUNCTION IF EXISTS public.create_gym_admin_atomic(text, text, text, text, text, text, jsonb, date, uuid, uuid);

-- Keep create_gym_with_branch for admin gym setup (used after login)
COMMENT ON FUNCTION public.create_gym_with_branch IS 'Admin uses this to create their gym after first login (client-side auth)';
