
-- Maintenance Reports table for persisting engine run results
CREATE TABLE public.maintenance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  engine TEXT NOT NULL CHECK (engine IN ('hygiene', 'validator', 'reporter', 'gate', 'orchestrator')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'passed', 'failed', 'partial')),
  trigger_source TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_source IN ('manual', 'clm', 'cron', 'engineer')),
  duration_ms INTEGER,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  pass_results JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for querying recent runs by engine
CREATE INDEX idx_maintenance_reports_engine_created ON public.maintenance_reports (engine, created_at DESC);
CREATE INDEX idx_maintenance_reports_status ON public.maintenance_reports (status);

-- Enable RLS
ALTER TABLE public.maintenance_reports ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write (internal system table)
CREATE POLICY "Service role full access" ON public.maintenance_reports
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Admins can read
CREATE POLICY "Admins can read maintenance reports" ON public.maintenance_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Maintenance notification preferences table
CREATE TABLE public.maintenance_notification_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_recipients TEXT[] NOT NULL DEFAULT '{}',
  webhook_url TEXT,
  webhook_secret TEXT,
  notify_on_failure BOOLEAN NOT NULL DEFAULT true,
  notify_on_success BOOLEAN NOT NULL DEFAULT false,
  notify_on_partial BOOLEAN NOT NULL DEFAULT true,
  atlas_notifications BOOLEAN NOT NULL DEFAULT true,
  cron_schedule TEXT DEFAULT '0 6 * * *',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_notification_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.maintenance_notification_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage notification config" ON public.maintenance_notification_config
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default config
INSERT INTO public.maintenance_notification_config (email_recipients, atlas_notifications, notify_on_failure, notify_on_success)
VALUES ('{}', true, true, false);
