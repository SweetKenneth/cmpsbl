
-- ═══════════════════════════════════════════════════════════
-- TSAC + Evolution Integration Schema
-- Adds TSAC verification stages to evolution_runs and 
-- creates feedback loop table for executor training
-- ═══════════════════════════════════════════════════════════

-- 1. Add TSAC verification columns to evolution_runs
ALTER TABLE public.evolution_runs
  ADD COLUMN IF NOT EXISTS tsac_pre_criteria JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tsac_pre_verdict TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tsac_pre_score INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tsac_shadow_verdict TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tsac_shadow_score INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tsac_production_verdict TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tsac_production_score INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tsac_drift_detected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tsac_verification_ids UUID[] DEFAULT '{}';

-- 2. Add source column to tsac_verifications for evolution tracking
ALTER TABLE public.tsac_verifications
  ADD COLUMN IF NOT EXISTS evolution_run_id UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS verification_stage TEXT DEFAULT NULL;

-- 3. Create TSAC training feedback table (feeds executor learning)
CREATE TABLE IF NOT EXISTS public.tsac_training_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  executor_id TEXT NOT NULL,
  evolution_run_id UUID DEFAULT NULL,
  task_description TEXT NOT NULL,
  criteria_snapshot JSONB NOT NULL DEFAULT '[]',
  pre_verdict TEXT,
  pre_score INTEGER,
  shadow_verdict TEXT,
  shadow_score INTEGER,
  production_verdict TEXT,
  production_score INTEGER,
  drift_detected BOOLEAN DEFAULT FALSE,
  drift_details TEXT,
  failure_patterns JSONB DEFAULT '[]',
  learning_rule_generated BOOLEAN DEFAULT FALSE,
  learning_rule_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tsac_training_feedback ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role full access on tsac_training_feedback"
  ON public.tsac_training_feedback FOR ALL
  USING (true) WITH CHECK (true);

-- Index for executor performance queries
CREATE INDEX IF NOT EXISTS idx_tsac_training_executor ON public.tsac_training_feedback(executor_id);
CREATE INDEX IF NOT EXISTS idx_tsac_training_evolution ON public.tsac_training_feedback(evolution_run_id);
CREATE INDEX IF NOT EXISTS idx_tsac_training_created ON public.tsac_training_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tsac_verifications_evolution ON public.tsac_verifications(evolution_run_id);
CREATE INDEX IF NOT EXISTS idx_tsac_verifications_stage ON public.tsac_verifications(verification_stage);
