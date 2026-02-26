
-- Telemetry snapshot persistence for trend analysis
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_type TEXT NOT NULL DEFAULT 'telemetry',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  health_score INTEGER,
  error_rate NUMERIC(5,2),
  total_events INTEGER DEFAULT 0,
  active_modules INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_snapshots_type_created ON public.analytics_snapshots (snapshot_type, created_at DESC);

-- Analytics event log for admin tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  category TEXT NOT NULL,
  label TEXT,
  value NUMERIC,
  page TEXT,
  user_id UUID,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_type_created ON public.analytics_events (event_type, created_at DESC);
CREATE INDEX idx_analytics_events_category ON public.analytics_events (category, created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Snapshots: authenticated users can read, service role can write
CREATE POLICY "Authenticated users can read snapshots"
  ON public.analytics_snapshots FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert snapshots"
  ON public.analytics_snapshots FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Events: authenticated users can read and insert
CREATE POLICY "Authenticated users can read analytics events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Retention: auto-cleanup function for old snapshots (>30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.analytics_snapshots WHERE created_at < now() - INTERVAL '30 days';
  DELETE FROM public.analytics_events WHERE created_at < now() - INTERVAL '90 days';
END;
$$;
