
-- Intelligence events table for Immunity Mesh observability
CREATE TABLE public.immune_intelligence_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executor_id TEXT NOT NULL,
  is_shadow_mesh BOOLEAN NOT NULL DEFAULT false,
  mode TEXT NOT NULL DEFAULT 'normal',
  outcome TEXT NOT NULL,
  repair_type TEXT,
  rule_id TEXT,
  failure_signature_hash TEXT,
  escalation_severity TEXT,
  duration_ms NUMERIC,
  meta JSONB DEFAULT '{}'::jsonb
);

-- Performance indexes
CREATE INDEX idx_iie_created_at ON public.immune_intelligence_events (created_at DESC);
CREATE INDEX idx_iie_executor_created ON public.immune_intelligence_events (executor_id, created_at DESC);
CREATE INDEX idx_iie_shadow_created ON public.immune_intelligence_events (is_shadow_mesh, created_at DESC);
CREATE INDEX idx_iie_outcome ON public.immune_intelligence_events (outcome, created_at DESC);
CREATE INDEX idx_iie_sig_hash ON public.immune_intelligence_events (failure_signature_hash) WHERE failure_signature_hash IS NOT NULL;

-- RLS
ALTER TABLE public.immune_intelligence_events ENABLE ROW LEVEL SECURITY;

-- Public read for dashboard (telemetry is non-sensitive)
CREATE POLICY "Anyone can read intelligence events"
  ON public.immune_intelligence_events FOR SELECT USING (true);

-- Insert from anon/service for telemetry emission
CREATE POLICY "Anyone can insert intelligence events"
  ON public.immune_intelligence_events FOR INSERT WITH CHECK (true);

-- Only admins can delete (for reset telemetry)
CREATE POLICY "Admins can delete intelligence events"
  ON public.immune_intelligence_events FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
