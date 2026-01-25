-- ═══════════════════════════════════════════════════════════════
-- MODERNIZER v2.0 — Extend Upgrade Plans & Add Autonomy Tracking
-- ═══════════════════════════════════════════════════════════════

-- Add missing columns to substrate_upgrade_plans
ALTER TABLE public.substrate_upgrade_plans 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'upgrade_proposal',
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS safety_checks_passed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_shadow BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS applied_by TEXT,
ADD COLUMN IF NOT EXISTS proposed_changes JSONB DEFAULT '{}'::jsonb;

-- Create modernizer autonomy log for tracking auto-applied changes
CREATE TABLE IF NOT EXISTS public.modernizer_autonomy_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.substrate_upgrade_plans(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    mode TEXT DEFAULT 'shadow' CHECK (mode IN ('shadow', 'production')),
    confidence NUMERIC NOT NULL,
    auto_approved BOOLEAN NOT NULL DEFAULT false,
    reason TEXT,
    system_health_before NUMERIC,
    system_health_after NUMERIC,
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_substrate_upgrade_plans_status ON public.substrate_upgrade_plans(status);
CREATE INDEX IF NOT EXISTS idx_substrate_upgrade_plans_created ON public.substrate_upgrade_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_modernizer_autonomy_log_plan ON public.modernizer_autonomy_log(plan_id);
CREATE INDEX IF NOT EXISTS idx_modernizer_autonomy_log_created ON public.modernizer_autonomy_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.modernizer_autonomy_log ENABLE ROW LEVEL SECURITY;

-- Service role access for edge functions
CREATE POLICY "Service role full access to autonomy log"
ON public.modernizer_autonomy_log FOR ALL
USING (true)
WITH CHECK (true);