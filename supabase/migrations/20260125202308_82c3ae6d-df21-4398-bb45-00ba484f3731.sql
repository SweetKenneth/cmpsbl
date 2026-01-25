-- ═══════════════════════════════════════════════════════════════
-- CORTEX v2.0 + EVOLUTION SEQUENCING SCHEMA
-- Full lifecycle integration with circuit breakers, panic mode, and sequences
-- ═══════════════════════════════════════════════════════════════

-- 1. Cortex Circuit Breakers - Track circuit state per subsystem
CREATE TABLE IF NOT EXISTS public.cortex_circuit_breakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subsystem text NOT NULL UNIQUE, -- dispatch, observability, modernizer, panic
  state text NOT NULL DEFAULT 'closed', -- closed, half-open, open
  failure_count integer DEFAULT 0,
  last_failure_at timestamptz,
  last_success_at timestamptz,
  opened_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Cortex Mode Configuration
CREATE TABLE IF NOT EXISTS public.cortex_modes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL DEFAULT 'manual', -- manual, shadow, auto
  panic_frozen boolean DEFAULT false,
  panic_reason text,
  panic_frozen_at timestamptz,
  ready boolean DEFAULT true,
  degraded boolean DEFAULT false,
  degraded_reason text,
  last_restart_at timestamptz,
  restart_count integer DEFAULT 0,
  dispatch_enabled boolean DEFAULT true,
  auto_apply_enabled boolean DEFAULT false,
  auto_apply_max_risk text DEFAULT 'low', -- low, medium, high
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default mode row
INSERT INTO public.cortex_modes (mode) 
VALUES ('manual')
ON CONFLICT DO NOTHING;

-- 3. Evolution Sequences - Track procedural/strategic/evolutionary sequences
CREATE TABLE IF NOT EXISTS public.substrate_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  strategy_type text NOT NULL DEFAULT 'procedural', -- procedural, strategic, evolutionary, mixed
  status text NOT NULL DEFAULT 'draft', -- draft, approved, running, completed, failed, abandoned
  mode text DEFAULT 'shadow', -- shadow, production
  risk_level text DEFAULT 'low', -- low, medium, high, critical
  priority_score numeric DEFAULT 0,
  plan_id uuid, -- Link to substrate_upgrade_plans if applicable
  total_steps integer DEFAULT 0,
  completed_steps integer DEFAULT 0,
  failed_steps integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  created_by text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

-- 4. Sequence Steps - Individual steps in a sequence
CREATE TABLE IF NOT EXISTS public.substrate_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES public.substrate_sequences(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  module text NOT NULL,
  action text NOT NULL,
  payload_template jsonb DEFAULT '{}',
  depends_on uuid[], -- Array of step IDs this depends on
  estimated_cost integer DEFAULT 0,
  estimated_value integer DEFAULT 0,
  risk_level text DEFAULT 'low',
  status text DEFAULT 'pending', -- pending, running, completed, failed, skipped, rolled_back
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  execution_time_ms integer,
  metadata jsonb DEFAULT '{}'
);

-- 5. Sequence Outcomes - Track results of sequence runs
CREATE TABLE IF NOT EXISTS public.substrate_sequence_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES public.substrate_sequences(id) ON DELETE SET NULL,
  step_id uuid REFERENCES public.substrate_sequence_steps(id) ON DELETE SET NULL,
  outcome text NOT NULL, -- success, partial, failure, rollback
  health_before jsonb,
  health_after jsonb,
  metrics jsonb DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 6. Cortex Audit Log - Track mode changes, panic events, dispatch
CREATE TABLE IF NOT EXISTS public.cortex_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- mode_change, panic_freeze, panic_resume, dispatch, restart, circuit_change
  actor text DEFAULT 'system', -- system, operator, autopilot
  target_module text,
  target_action text,
  old_value jsonb,
  new_value jsonb,
  reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 7. Proposal Meta-Layer - Extend proposals with rich metadata
CREATE TABLE IF NOT EXISTS public.proposal_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id text NOT NULL, -- Links to cortex proposal ID
  impact_estimate text DEFAULT 'low', -- low, medium, high
  risk_level text DEFAULT 'low', -- low, medium, high, critical
  confidence numeric DEFAULT 0.5, -- 0.0 to 1.0
  evidentiary_basis jsonb DEFAULT '{}', -- { sources: [], observations: [] }
  dependencies text[] DEFAULT '{}', -- Module/action dependencies
  reverse_dependencies text[] DEFAULT '{}', -- What depends on this
  authority_required text DEFAULT 'operator', -- human, operator, system
  rollback_strategy text,
  test_coverage numeric DEFAULT 0, -- 0.0 to 1.0
  module_target text,
  proposal_scope text DEFAULT 'substrate', -- substrate, module, action
  proposal_type text DEFAULT 'feature', -- feature, fix, optimization, refactor, removal, research
  proposal_origin text DEFAULT 'cortex', -- decode, modernizer, cortex, operator
  approved_by text,
  approved_at timestamptz,
  rejected_by text,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.cortex_circuit_breakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cortex_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_sequence_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cortex_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_meta ENABLE ROW LEVEL SECURITY;

-- Service role full access (for edge functions)
CREATE POLICY "Service role full access cortex_circuit_breakers" ON public.cortex_circuit_breakers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cortex_modes" ON public.cortex_modes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access substrate_sequences" ON public.substrate_sequences FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access substrate_sequence_steps" ON public.substrate_sequence_steps FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access substrate_sequence_outcomes" ON public.substrate_sequence_outcomes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cortex_audit_log" ON public.cortex_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access proposal_meta" ON public.proposal_meta FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read
CREATE POLICY "Authenticated read cortex_circuit_breakers" ON public.cortex_circuit_breakers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read cortex_modes" ON public.cortex_modes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read substrate_sequences" ON public.substrate_sequences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read substrate_sequence_steps" ON public.substrate_sequence_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read substrate_sequence_outcomes" ON public.substrate_sequence_outcomes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read cortex_audit_log" ON public.cortex_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read proposal_meta" ON public.proposal_meta FOR SELECT TO authenticated USING (true);

-- Admin write for manual operations
CREATE POLICY "Admin write cortex_modes" ON public.cortex_modes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin write cortex_circuit_breakers" ON public.cortex_circuit_breakers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sequences_status ON public.substrate_sequences(status);
CREATE INDEX IF NOT EXISTS idx_sequences_strategy ON public.substrate_sequences(strategy_type);
CREATE INDEX IF NOT EXISTS idx_sequence_steps_sequence ON public.substrate_sequence_steps(sequence_id);
CREATE INDEX IF NOT EXISTS idx_sequence_outcomes_sequence ON public.substrate_sequence_outcomes(sequence_id);
CREATE INDEX IF NOT EXISTS idx_cortex_audit_type ON public.cortex_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_cortex_audit_created ON public.cortex_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_meta_proposal ON public.proposal_meta(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_meta_origin ON public.proposal_meta(proposal_origin);

-- Initialize default circuit breakers
INSERT INTO public.cortex_circuit_breakers (subsystem, state) VALUES
  ('dispatch', 'closed'),
  ('observability', 'closed'),
  ('modernizer', 'closed'),
  ('panic', 'closed')
ON CONFLICT (subsystem) DO NOTHING;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_cortex_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_cortex_modes_timestamp
  BEFORE UPDATE ON public.cortex_modes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cortex_timestamp();

CREATE TRIGGER update_cortex_circuit_breakers_timestamp
  BEFORE UPDATE ON public.cortex_circuit_breakers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cortex_timestamp();