-- Migration: Add hierarchical settings table and update admin creation flow

-- Create hierarchical settings table for global, gym, and branch-level settings
CREATE TABLE IF NOT EXISTS public.hierarchical_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'gym', 'branch')),
  scope_id UUID, -- NULL for global, gym_id or branch_id for scoped settings
  category TEXT NOT NULL, -- 'email', 'sms', 'general', 'payment', etc.
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create unique constraint for settings
CREATE UNIQUE INDEX idx_hierarchical_settings_unique 
ON public.hierarchical_settings(scope, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000'::uuid), category, key);

-- Enable RLS
ALTER TABLE public.hierarchical_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hierarchical_settings
CREATE POLICY "Super admins can manage all settings"
ON public.hierarchical_settings
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'super-admin')
WITH CHECK (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Admins can manage gym and branch settings"
ON public.hierarchical_settings
FOR ALL
TO authenticated
USING (
  scope IN ('gym', 'branch') 
  AND scope_id IN (
    SELECT gym_id FROM profiles WHERE user_id = auth.uid()
    UNION
    SELECT branch_id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  scope IN ('gym', 'branch') 
  AND scope_id IN (
    SELECT gym_id FROM profiles WHERE user_id = auth.uid()
    UNION
    SELECT branch_id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view settings in their scope"
ON public.hierarchical_settings
FOR SELECT
TO authenticated
USING (
  scope = 'global'
  OR (scope = 'gym' AND scope_id IN (SELECT gym_id FROM profiles WHERE user_id = auth.uid()))
  OR (scope = 'branch' AND scope_id IN (SELECT branch_id FROM profiles WHERE user_id = auth.uid()))
);

-- Create index for faster settings lookup
CREATE INDEX idx_hierarchical_settings_scope ON public.hierarchical_settings(scope, scope_id, category, key);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_hierarchical_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hierarchical_settings_updated_at
BEFORE UPDATE ON public.hierarchical_settings
FOR EACH ROW
EXECUTE FUNCTION update_hierarchical_settings_updated_at();

-- Insert default global settings
INSERT INTO public.hierarchical_settings (scope, scope_id, category, key, value) VALUES
('global', NULL, 'email', 'enabled', '"false"'::jsonb),
('global', NULL, 'sms', 'enabled', '"false"'::jsonb),
('global', NULL, 'general', 'platform_name', '"FitGenius"'::jsonb),
('global', NULL, 'general', 'support_email', '"support@fitgenius.com"'::jsonb)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.hierarchical_settings IS 'Hierarchical settings system supporting global, gym, and branch-level configurations';
COMMENT ON COLUMN public.hierarchical_settings.scope IS 'Setting scope: global (platform-wide), gym (per gym), or branch (per branch)';
COMMENT ON COLUMN public.hierarchical_settings.scope_id IS 'Reference ID for scoped settings (gym_id or branch_id). NULL for global settings';