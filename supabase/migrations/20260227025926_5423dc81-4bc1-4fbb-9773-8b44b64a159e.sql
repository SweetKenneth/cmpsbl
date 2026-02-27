
-- Add value column to system_flags for storing JSON config data (like CLM budget)
ALTER TABLE public.system_flags ADD COLUMN IF NOT EXISTS value text;

-- Ensure nexus_clm_budget flag exists
INSERT INTO public.system_flags (key, enabled, value)
VALUES ('nexus_clm_budget', true, '{}')
ON CONFLICT (key) DO NOTHING;
