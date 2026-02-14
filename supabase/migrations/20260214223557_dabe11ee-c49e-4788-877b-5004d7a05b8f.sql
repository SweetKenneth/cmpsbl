
-- Mesh Capability Discovery Engine — Tables
-- Stores gap analysis results, discovered capabilities, and expansion recommendations

-- 1. Gap analysis results — what intents failed or partially resolved
CREATE TABLE public.mesh_discovery_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_module TEXT NOT NULL,
  intent_type TEXT NOT NULL,
  domains TEXT[] NOT NULL DEFAULT '{}',
  needed_outputs TEXT[] NOT NULL DEFAULT '{}',
  available_resolvers INTEGER NOT NULL DEFAULT 0,
  responding_resolvers INTEGER NOT NULL DEFAULT 0,
  missing_modules TEXT[] NOT NULL DEFAULT '{}',
  gap_severity TEXT NOT NULL DEFAULT 'medium',
  frequency INTEGER NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open',
  resolved_by_capability TEXT
);

ALTER TABLE public.mesh_discovery_gaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for mesh gaps" ON public.mesh_discovery_gaps FOR SELECT USING (true);
CREATE POLICY "Service insert mesh gaps" ON public.mesh_discovery_gaps FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update mesh gaps" ON public.mesh_discovery_gaps FOR UPDATE USING (true);

CREATE INDEX idx_mesh_gaps_status ON public.mesh_discovery_gaps(status);
CREATE INDEX idx_mesh_gaps_severity ON public.mesh_discovery_gaps(gap_severity);

-- 2. Capability recommendations — AI-generated suggestions for new resolvers
CREATE TABLE public.mesh_capability_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gap_id UUID REFERENCES public.mesh_discovery_gaps(id),
  target_module TEXT NOT NULL,
  proposed_resolver_id TEXT NOT NULL,
  proposed_description TEXT NOT NULL,
  proposed_domains TEXT[] NOT NULL DEFAULT '{}',
  proposed_accepts TEXT[] NOT NULL DEFAULT '{}',
  proposed_produces TEXT[] NOT NULL DEFAULT '{}',
  confidence_score NUMERIC NOT NULL DEFAULT 0.5,
  reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'proposed',
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mesh_capability_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for mesh recommendations" ON public.mesh_capability_recommendations FOR SELECT USING (true);
CREATE POLICY "Service insert mesh recommendations" ON public.mesh_capability_recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update mesh recommendations" ON public.mesh_capability_recommendations FOR UPDATE USING (true);

CREATE INDEX idx_mesh_recs_status ON public.mesh_capability_recommendations(status);
CREATE INDEX idx_mesh_recs_module ON public.mesh_capability_recommendations(target_module);

-- 3. Discovery runs — audit trail of discovery cycles
CREATE TABLE public.mesh_discovery_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type TEXT NOT NULL DEFAULT 'full',
  gaps_found INTEGER NOT NULL DEFAULT 0,
  recommendations_generated INTEGER NOT NULL DEFAULT 0,
  capabilities_expanded INTEGER NOT NULL DEFAULT 0,
  modules_analyzed INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mesh_discovery_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for mesh discovery runs" ON public.mesh_discovery_runs FOR SELECT USING (true);
CREATE POLICY "Service insert mesh discovery runs" ON public.mesh_discovery_runs FOR INSERT WITH CHECK (true);
