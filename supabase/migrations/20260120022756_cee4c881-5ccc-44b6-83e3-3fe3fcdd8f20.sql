-- ═══════════════════════════════════════════════════════════════
-- Substrate Self-Upgrade Engine - Tables and Policies
-- ═══════════════════════════════════════════════════════════════

-- Create enum for upgrade modes
DO $$ BEGIN
  CREATE TYPE public.upgrade_mode AS ENUM ('shadow', 'auto_safe', 'auto_full');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for upgrade status
DO $$ BEGIN
  CREATE TYPE public.upgrade_status AS ENUM ('proposed', 'approved', 'applied', 'rolled_back', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create substrate_upgrade_plans table
CREATE TABLE IF NOT EXISTS public.substrate_upgrade_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mode TEXT NOT NULL DEFAULT 'shadow',
  scope TEXT NOT NULL DEFAULT 'all',
  backup_id TEXT,
  diff_summary JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT DEFAULT 'low',
  estimated_blast_radius TEXT,
  suggested_patches JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'proposed',
  operator_notes TEXT,
  operator_id UUID,
  before_health_snapshot JSONB,
  after_health_snapshot JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create substrate_upgrade_runs table
CREATE TABLE IF NOT EXISTS public.substrate_upgrade_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.substrate_upgrade_plans(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  result TEXT,
  error TEXT,
  post_health_snapshot JSONB,
  rollback_attempted BOOLEAN DEFAULT false,
  rollback_success BOOLEAN
);

-- Create substrate_upgrade_config table for safety thresholds
CREATE TABLE IF NOT EXISTS public.substrate_upgrade_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default configuration values
INSERT INTO public.substrate_upgrade_config (key, value, description) VALUES
  ('max_upgrades_per_day', '3', 'Maximum number of upgrade proposals per day'),
  ('min_hours_between_upgrades', '6', 'Minimum hours between upgrade applications'),
  ('health_threshold_for_upgrade', '95', 'Minimum system health to allow upgrades'),
  ('shadow_mode_enforced', 'true', 'Force shadow mode for all upgrades')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.substrate_upgrade_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_upgrade_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_upgrade_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only service role and authenticated admin users can access
CREATE POLICY "Admin users can view upgrade plans"
  ON public.substrate_upgrade_plans FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can insert upgrade plans"
  ON public.substrate_upgrade_plans FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can update upgrade plans"
  ON public.substrate_upgrade_plans FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can view upgrade runs"
  ON public.substrate_upgrade_runs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can insert upgrade runs"
  ON public.substrate_upgrade_runs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can update upgrade runs"
  ON public.substrate_upgrade_runs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can view upgrade config"
  ON public.substrate_upgrade_config FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can update upgrade config"
  ON public.substrate_upgrade_config FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_upgrade_plans_status ON public.substrate_upgrade_plans(status);
CREATE INDEX IF NOT EXISTS idx_upgrade_plans_created_at ON public.substrate_upgrade_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upgrade_runs_plan_id ON public.substrate_upgrade_runs(plan_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_runs_started_at ON public.substrate_upgrade_runs(started_at DESC);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_upgrade_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_upgrade_plans_timestamp ON public.substrate_upgrade_plans;
CREATE TRIGGER update_upgrade_plans_timestamp
  BEFORE UPDATE ON public.substrate_upgrade_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_upgrade_plan_timestamp();