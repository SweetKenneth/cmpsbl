
-- GATE Engine: Persist release gate run results
CREATE TABLE public.gate_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'passed', 'failed')),
  total_passes INTEGER NOT NULL DEFAULT 0,
  passed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  pass_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  git_sha TEXT,
  git_branch TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.gate_runs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage gate runs"
  ON public.gate_runs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can view
CREATE POLICY "Authenticated users can view gate runs"
  ON public.gate_runs FOR SELECT
  TO authenticated
  USING (true);

-- Index for recent runs
CREATE INDEX idx_gate_runs_created ON public.gate_runs (created_at DESC);
CREATE INDEX idx_gate_runs_status ON public.gate_runs (status);
