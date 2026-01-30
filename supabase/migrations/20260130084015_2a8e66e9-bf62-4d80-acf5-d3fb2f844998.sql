-- AutoBlog primitive (governed, observable, rollback-safe)
-- Tables for settings, queue, drafts, and runs

-- Settings table (singleton pattern)
CREATE TABLE IF NOT EXISTS public.autoblog_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean NOT NULL DEFAULT false,
  mode text NOT NULL DEFAULT 'governed' CHECK (mode IN ('governed', 'shadow', 'off')),
  cadence_minutes int NOT NULL DEFAULT 360,
  max_posts_per_day int NOT NULL DEFAULT 2,
  max_failures_per_hour int NOT NULL DEFAULT 3,
  min_confidence_publish numeric NOT NULL DEFAULT 0.85,
  allowed_risk_levels text[] NOT NULL DEFAULT ARRAY['low','medium'],
  allowed_channels text[] NOT NULL DEFAULT ARRAY['changelog','blog','release_notes'],
  dry_run boolean NOT NULL DEFAULT true,
  circuit_state text NOT NULL DEFAULT 'closed' CHECK (circuit_state IN ('closed', 'open', 'half_open')),
  circuit_opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Queue table for pending posts
CREATE TABLE IF NOT EXISTS public.autoblog_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'drafting', 'ready', 'published', 'aborted', 'failed')),
  channel text NOT NULL CHECK (channel IN ('changelog', 'blog', 'release_notes')),
  topic text,
  planned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  confidence numeric,
  risk text CHECK (risk IS NULL OR risk IN ('low', 'medium', 'high')),
  provider_used text,
  fallback_used boolean NOT NULL DEFAULT false,
  dedupe_key text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Drafts table for generated content
CREATE TABLE IF NOT EXISTS public.autoblog_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES public.autoblog_queue(id) ON DELETE CASCADE,
  title text,
  body text,
  format text NOT NULL DEFAULT 'markdown',
  preview_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Runs table for audit trail
CREATE TABLE IF NOT EXISTS public.autoblog_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES public.autoblog_queue(id) ON DELETE SET NULL,
  phase text NOT NULL CHECK (phase IN ('plan', 'draft', 'verify', 'publish', 'heal')),
  outcome text NOT NULL CHECK (outcome IN ('success', 'blocked', 'failed')),
  reason text,
  circuit_state text NOT NULL DEFAULT 'closed',
  failures int NOT NULL DEFAULT 0,
  heal_attempted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS autoblog_queue_status_idx ON public.autoblog_queue(status);
CREATE INDEX IF NOT EXISTS autoblog_queue_planned_idx ON public.autoblog_queue(planned_at);
CREATE INDEX IF NOT EXISTS autoblog_queue_dedupe_idx ON public.autoblog_queue(dedupe_key);
CREATE INDEX IF NOT EXISTS autoblog_runs_queue_idx ON public.autoblog_runs(queue_id);
CREATE INDEX IF NOT EXISTS autoblog_runs_created_idx ON public.autoblog_runs(created_at DESC);

-- Enable RLS
ALTER TABLE public.autoblog_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autoblog_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autoblog_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autoblog_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Governor can read/write all, Operator can read queue/runs, Observer read-only status
CREATE POLICY "Governors can manage autoblog settings"
  ON public.autoblog_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view autoblog settings"
  ON public.autoblog_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Governors can manage autoblog queue"
  ON public.autoblog_queue FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view autoblog queue"
  ON public.autoblog_queue FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Governors can manage autoblog drafts"
  ON public.autoblog_drafts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Governors can view autoblog drafts"
  ON public.autoblog_drafts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Governors can manage autoblog runs"
  ON public.autoblog_runs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view autoblog runs"
  ON public.autoblog_runs FOR SELECT
  TO authenticated
  USING (true);

-- Insert default settings row (singleton)
INSERT INTO public.autoblog_settings (enabled, mode, dry_run)
VALUES (false, 'governed', true)
ON CONFLICT DO NOTHING;

-- Timestamp update trigger
CREATE OR REPLACE FUNCTION public.update_autoblog_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_autoblog_settings_updated_at
  BEFORE UPDATE ON public.autoblog_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_autoblog_settings_timestamp();