-- ============================================
-- Hybrid Dream Learning Schema
-- Local + Global dream memory with privacy guardrails
-- ============================================

-- Agency Dream Memory (local improvements per agency)
CREATE TABLE public.agency_dream_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.agency_members(id) ON DELETE SET NULL,
  layer TEXT NOT NULL CHECK (layer IN ('local', 'global')),
  improvement_type TEXT NOT NULL CHECK (improvement_type IN ('template', 'heuristic', 'scaffold', 'strategy', 'skill', 'workflow')),
  category TEXT,
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  evidence_refs TEXT[] DEFAULT '{}',
  confidence REAL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.agency_dream_memory(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Global Substrate Brain Improvements (anonymized, cross-agency patterns)
CREATE TABLE public.substrate_brain_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  improvement_type TEXT NOT NULL CHECK (improvement_type IN ('template', 'heuristic', 'scaffold', 'strategy', 'skill', 'workflow', 'framework', 'pattern')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  source_count INTEGER DEFAULT 1,
  confidence REAL DEFAULT 0.5,
  adoption_count INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 0,
  version TEXT DEFAULT '1.0.0',
  previous_version_id UUID REFERENCES public.substrate_brain_improvements(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dream Cycle Logs (track local + global dream execution)
CREATE TABLE public.dream_cycle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('local', 'global')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  improvements_generated INTEGER DEFAULT 0,
  templates_created INTEGER DEFAULT 0,
  heuristics_learned INTEGER DEFAULT 0,
  artifacts_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agency Dream Consent Settings
CREATE TABLE public.agency_dream_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE UNIQUE,
  allow_global_pooling BOOLEAN DEFAULT true,
  allow_template_sharing BOOLEAN DEFAULT true,
  allow_heuristic_sharing BOOLEAN DEFAULT true,
  exclude_domains TEXT[] DEFAULT '{}',
  privacy_level TEXT DEFAULT 'standard' CHECK (privacy_level IN ('strict', 'standard', 'open')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dream Learning Metrics (telemetry for proving non-LARP)
CREATE TABLE public.dream_learning_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  skill_improvement_score REAL DEFAULT 0,
  template_diff_score REAL DEFAULT 0,
  artifact_quality_score REAL DEFAULT 0,
  user_feedback_score REAL DEFAULT 0,
  success_rate_delta REAL DEFAULT 0,
  token_efficiency_delta REAL DEFAULT 0,
  tasks_before INTEGER DEFAULT 0,
  tasks_after INTEGER DEFAULT 0,
  success_rate_before REAL DEFAULT 0,
  success_rate_after REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_agency_daily_dream_metrics UNIQUE (agency_id, metric_date)
);

-- Indexes for performance
CREATE INDEX idx_agency_dream_memory_agency ON public.agency_dream_memory(agency_id);
CREATE INDEX idx_agency_dream_memory_layer ON public.agency_dream_memory(layer);
CREATE INDEX idx_agency_dream_memory_type ON public.agency_dream_memory(improvement_type);
CREATE INDEX idx_substrate_brain_improvements_type ON public.substrate_brain_improvements(improvement_type);
CREATE INDEX idx_substrate_brain_improvements_category ON public.substrate_brain_improvements(category);
CREATE INDEX idx_dream_cycle_logs_agency ON public.dream_cycle_logs(agency_id);
CREATE INDEX idx_dream_cycle_logs_type ON public.dream_cycle_logs(cycle_type);

-- RLS Policies
ALTER TABLE public.agency_dream_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_brain_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_dream_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_learning_metrics ENABLE ROW LEVEL SECURITY;

-- Agency dream memory: only agency owners can view their local memories
CREATE POLICY "Users can view their agency dream memories"
  ON public.agency_dream_memory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agencies
      WHERE agencies.id = agency_dream_memory.agency_id
      AND agencies.owner_id = auth.uid()
    )
  );

-- Substrate brain improvements: all authenticated users can view global improvements
CREATE POLICY "Authenticated users can view global improvements"
  ON public.substrate_brain_improvements FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Dream cycle logs: agency owners can view their logs
CREATE POLICY "Users can view their agency dream logs"
  ON public.dream_cycle_logs FOR SELECT
  USING (
    agency_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.agencies
      WHERE agencies.id = dream_cycle_logs.agency_id
      AND agencies.owner_id = auth.uid()
    )
  );

-- Dream consent: agency owners can manage consent
CREATE POLICY "Users can manage their agency dream consent"
  ON public.agency_dream_consent FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.agencies
      WHERE agencies.id = agency_dream_consent.agency_id
      AND agencies.owner_id = auth.uid()
    )
  );

-- Dream learning metrics: agency owners can view their metrics
CREATE POLICY "Users can view their agency dream metrics"
  ON public.dream_learning_metrics FOR SELECT
  USING (
    agency_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.agencies
      WHERE agencies.id = dream_learning_metrics.agency_id
      AND agencies.owner_id = auth.uid()
    )
  );

-- Function to increment dream metrics atomically
CREATE OR REPLACE FUNCTION public.upsert_dream_learning_metrics(
  p_agency_id UUID,
  p_skill_improvement REAL DEFAULT 0,
  p_template_diff REAL DEFAULT 0,
  p_artifact_quality REAL DEFAULT 0,
  p_success_rate_delta REAL DEFAULT 0,
  p_token_efficiency_delta REAL DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO dream_learning_metrics (
    agency_id,
    metric_date,
    skill_improvement_score,
    template_diff_score,
    artifact_quality_score,
    success_rate_delta,
    token_efficiency_delta
  )
  VALUES (
    p_agency_id,
    CURRENT_DATE,
    p_skill_improvement,
    p_template_diff,
    p_artifact_quality,
    p_success_rate_delta,
    p_token_efficiency_delta
  )
  ON CONFLICT (agency_id, metric_date)
  DO UPDATE SET
    skill_improvement_score = dream_learning_metrics.skill_improvement_score + EXCLUDED.skill_improvement_score,
    template_diff_score = dream_learning_metrics.template_diff_score + EXCLUDED.template_diff_score,
    artifact_quality_score = dream_learning_metrics.artifact_quality_score + EXCLUDED.artifact_quality_score,
    success_rate_delta = EXCLUDED.success_rate_delta,
    token_efficiency_delta = EXCLUDED.token_efficiency_delta,
    updated_at = now()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;