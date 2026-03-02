
-- Discovery Runs table
CREATE TABLE public.discovery_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  total_candidates INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  top_find_name TEXT,
  top_find_cjpi NUMERIC,
  input_snapshot_hash TEXT,
  scoring_version TEXT NOT NULL DEFAULT '1.0',
  registry_checksum_before TEXT,
  registry_checksum_after TEXT,
  dry_run BOOLEAN NOT NULL DEFAULT false,
  exploratory_mode BOOLEAN NOT NULL DEFAULT false,
  logs JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discoveries table
CREATE TABLE public.discoveries (
  id TEXT PRIMARY KEY, -- stable hash of components + name
  run_id UUID NOT NULL REFERENCES public.discovery_runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tier TEXT,
  cjpi NUMERIC NOT NULL,
  synergy_multiplier NUMERIC DEFAULT 1.0,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  module_chain TEXT[] NOT NULL DEFAULT '{}',
  rationale TEXT,
  provenance TEXT,
  error_strategy TEXT,
  max_execution_ms INTEGER,
  cjpi_breakdown JSONB,
  discovered_by TEXT,
  engine_candidate BOOLEAN DEFAULT false,
  written_to_registry BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discovery lock (concurrency control)
CREATE TABLE public.discovery_lock (
  id TEXT PRIMARY KEY DEFAULT 'global',
  locked_by UUID REFERENCES auth.users(id),
  locked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

INSERT INTO public.discovery_lock (id) VALUES ('global');

-- Enable RLS
ALTER TABLE public.discovery_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_lock ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can manage discovery_runs" ON public.discovery_runs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage discoveries" ON public.discoveries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage discovery_lock" ON public.discovery_lock
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_discoveries_run_id ON public.discoveries(run_id);
CREATE INDEX idx_discoveries_cjpi ON public.discoveries(cjpi DESC);
CREATE INDEX idx_discoveries_category ON public.discoveries(category);
CREATE INDEX idx_discovery_runs_status ON public.discovery_runs(status);
