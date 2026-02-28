
-- ============================================================
-- Scanner Feature Tables (Items 11, 13, 15, 18, 21)
-- ============================================================

-- 11. Scan Result Persistence
CREATE TABLE IF NOT EXISTS public.scan_results_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  scan_mode TEXT NOT NULL DEFAULT 'quick',
  score NUMERIC,
  findings_count INTEGER DEFAULT 0,
  result_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  user_id UUID
);

CREATE INDEX idx_scan_results_domain ON public.scan_results_cache (domain, scan_mode);
CREATE INDEX idx_scan_results_expires ON public.scan_results_cache (expires_at);

ALTER TABLE public.scan_results_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scan results" ON public.scan_results_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert scan results" ON public.scan_results_cache
  FOR INSERT WITH CHECK (true);

-- 13. Scheduled Recurring Scans
CREATE TABLE IF NOT EXISTS public.scan_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  scan_mode TEXT NOT NULL DEFAULT 'quick',
  frequency TEXT NOT NULL DEFAULT 'weekly',
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  last_score NUMERIC,
  score_delta NUMERIC,
  notify_email TEXT,
  notify_on_change BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scan_schedules_next ON public.scan_schedules (next_run_at) WHERE is_active = true;

ALTER TABLE public.scan_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own schedules" ON public.scan_schedules
  FOR ALL USING (auth.uid() = user_id);

-- 15. Finding Trend Tracking
CREATE TABLE IF NOT EXISTS public.scan_finding_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_findings INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  score NUMERIC,
  category_breakdown JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_finding_trends_domain_date ON public.scan_finding_trends (domain, scan_date);

ALTER TABLE public.scan_finding_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trends" ON public.scan_finding_trends
  FOR SELECT USING (true);

CREATE POLICY "System can insert trends" ON public.scan_finding_trends
  FOR INSERT WITH CHECK (true);

-- 18. Webhook Notifications
CREATE TABLE IF NOT EXISTS public.scan_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT '{scan.completed}',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own webhooks" ON public.scan_webhooks
  FOR ALL USING (auth.uid() = user_id);

-- 21. Error Boundary Telemetry
CREATE TABLE IF NOT EXISTS public.client_error_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_name TEXT NOT NULL,
  error_message TEXT,
  component_stack TEXT,
  url TEXT,
  user_agent TEXT,
  user_id UUID,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_errors_time ON public.client_error_log (created_at DESC);

ALTER TABLE public.client_error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert errors" ON public.client_error_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read errors" ON public.client_error_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
