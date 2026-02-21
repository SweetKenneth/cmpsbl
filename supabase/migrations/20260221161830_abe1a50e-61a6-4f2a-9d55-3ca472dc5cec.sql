
-- Owner Reports table for storing full DECODE Mode B reports
CREATE TABLE public.owner_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'sent',
  subject TEXT NOT NULL,
  full_html TEXT NOT NULL,
  full_plaintext TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  report_window_start TIMESTAMPTZ NOT NULL,
  report_window_end TIMESTAMPTZ NOT NULL,
  generation_time_ms INTEGER,
  system_status TEXT NOT NULL DEFAULT 'ONLINE',
  version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.owner_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write reports
CREATE POLICY "Admins can read owner reports"
  ON public.owner_reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert owner reports"
  ON public.owner_reports FOR INSERT
  WITH CHECK (true);

-- Index for recent reports listing
CREATE INDEX idx_owner_reports_created ON public.owner_reports (created_at DESC);

-- Disable cascade cron functions by marking them archived
-- (The edge functions themselves are already disabled with early returns)
