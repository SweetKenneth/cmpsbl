
-- Immune Escalations table for Executor Immune Pilot
CREATE TABLE public.immune_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  module TEXT NOT NULL,
  executor TEXT NOT NULL,
  scope TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'resolved')),
  claimed_by TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT
);

-- Index for queue queries
CREATE INDEX idx_immune_escalations_status_created ON public.immune_escalations (status, created_at DESC);

-- Enable RLS
ALTER TABLE public.immune_escalations ENABLE ROW LEVEL SECURITY;

-- Admin-only access (infrastructure table)
CREATE POLICY "Admin read immune_escalations"
  ON public.immune_escalations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update immune_escalations"
  ON public.immune_escalations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- System insert (for the immune layer itself)
CREATE POLICY "System insert immune_escalations"
  ON public.immune_escalations FOR INSERT
  WITH CHECK (true);
