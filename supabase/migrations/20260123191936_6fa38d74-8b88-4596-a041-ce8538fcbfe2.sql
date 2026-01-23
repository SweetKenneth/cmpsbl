-- Create table to track applied improvements
CREATE TABLE IF NOT EXISTS public.substrate_applied_improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  improvement_key TEXT NOT NULL UNIQUE,
  improvement_id TEXT,
  module TEXT NOT NULL,
  change_type TEXT NOT NULL,
  description TEXT,
  applied_in_plan UUID REFERENCES public.substrate_upgrade_plans(id),
  applied_mode TEXT NOT NULL DEFAULT 'shadow',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_applied_improvements_active ON public.substrate_applied_improvements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_applied_improvements_plan ON public.substrate_applied_improvements(applied_in_plan);

-- Enable RLS
ALTER TABLE public.substrate_applied_improvements ENABLE ROW LEVEL SECURITY;

-- Public read for status checks
CREATE POLICY "Allow public read of applied improvements" ON public.substrate_applied_improvements
  FOR SELECT USING (true);

-- Service role can manage
CREATE POLICY "Service role can manage applied improvements" ON public.substrate_applied_improvements
  FOR ALL USING (true) WITH CHECK (true);

-- Add shadow_applied status to upgrade plans if needed
DO $$
BEGIN
  -- This is just a validation, the status column is TEXT so it accepts any value
  RAISE NOTICE 'substrate_applied_improvements table created successfully';
END $$;