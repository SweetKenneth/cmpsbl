
-- ============================================================
-- MPE v1: Mutation Promotion Engine Tables
-- ============================================================

-- 1. Change Artifacts — before/after + diff for every executor change
CREATE TABLE public.change_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_type TEXT NOT NULL DEFAULT 'executor',
  actor_id TEXT,
  category TEXT NOT NULL DEFAULT 'feature',
  intent_summary TEXT,
  before_snapshot JSONB,
  after_snapshot JSONB,
  diff_data JSONB,
  status TEXT NOT NULL DEFAULT 'proposed',
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.change_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage change_artifacts"
  ON public.change_artifacts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view change_artifacts"
  ON public.change_artifacts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_change_artifacts_status ON public.change_artifacts (status);
CREATE INDEX idx_change_artifacts_category ON public.change_artifacts (category);
CREATE INDEX idx_change_artifacts_created ON public.change_artifacts (created_at DESC);

-- 2. Mutation Proposals — promotion candidates wrapping artifacts
CREATE TABLE public.mutation_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artifact_id UUID NOT NULL REFERENCES public.change_artifacts(id) ON DELETE CASCADE,
  proposer_executor_id TEXT,
  hypothesis TEXT,
  expected_delta JSONB DEFAULT '{}'::jsonb,
  risk_score NUMERIC DEFAULT 0.5,
  gate_state TEXT NOT NULL DEFAULT 'pending',
  canary_pct INTEGER DEFAULT 0,
  auto_promote BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  promoted_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.mutation_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mutation_proposals"
  ON public.mutation_proposals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view mutation_proposals"
  ON public.mutation_proposals FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_mutation_proposals_gate ON public.mutation_proposals (gate_state);
CREATE INDEX idx_mutation_proposals_artifact ON public.mutation_proposals (artifact_id);
CREATE INDEX idx_mutation_proposals_created ON public.mutation_proposals (created_at DESC);

CREATE TRIGGER update_mutation_proposals_timestamp
  BEFORE UPDATE ON public.mutation_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

-- 3. Mutation Runs — shadow A/B evaluation results
CREATE TABLE public.mutation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mutation_id UUID NOT NULL REFERENCES public.mutation_proposals(id) ON DELETE CASCADE,
  shadow_run_id TEXT,
  metrics_baseline JSONB DEFAULT '{}'::jsonb,
  metrics_candidate JSONB DEFAULT '{}'::jsonb,
  metrics_delta JSONB DEFAULT '{}'::jsonb,
  regressions JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC DEFAULT 0,
  run_duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mutation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mutation_runs"
  ON public.mutation_runs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view mutation_runs"
  ON public.mutation_runs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_mutation_runs_mutation ON public.mutation_runs (mutation_id);
CREATE INDEX idx_mutation_runs_created ON public.mutation_runs (created_at DESC);

-- 4. Verification Scans — post-promotion integrity checks
CREATE TABLE public.verification_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mutation_id UUID NOT NULL REFERENCES public.mutation_proposals(id) ON DELETE CASCADE,
  gaps_found INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  scan_results JSONB DEFAULT '{}'::jsonb,
  pre_baseline JSONB DEFAULT '{}'::jsonb,
  post_baseline JSONB DEFAULT '{}'::jsonb,
  new_gaps JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.verification_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage verification_scans"
  ON public.verification_scans FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view verification_scans"
  ON public.verification_scans FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_verification_scans_mutation ON public.verification_scans (mutation_id);

-- 5. MPE Config — feature flags
INSERT INTO public.atlas_capabilities (key, description, enabled, metadata) VALUES
  ('mpe_mutation_intake', 'Accept new mutation proposals', true, '{"default": true}'::jsonb),
  ('mpe_auto_shadow', 'Automatically run shadow A/B on new proposals', true, '{"default": true}'::jsonb),
  ('mpe_auto_promotion', 'Auto-promote mutations that pass all gates (OFF by default)', false, '{"default": false, "danger": true}'::jsonb),
  ('mpe_post_verification', 'Run verification scan after every promotion', true, '{"default": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
