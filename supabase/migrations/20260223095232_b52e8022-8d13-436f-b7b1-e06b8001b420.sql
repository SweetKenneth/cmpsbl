
-- Site analytics: page views with full visitor context
CREATE TABLE public.site_page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  fingerprint_hash TEXT,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  language TEXT,
  timezone TEXT,
  country TEXT,
  city TEXT,
  connection_type TEXT, -- 4g, wifi, etc
  time_on_page_ms INTEGER, -- updated on unload
  scroll_depth_pct INTEGER, -- max scroll %
  is_bounce BOOLEAN DEFAULT true,
  entry_page BOOLEAN DEFAULT false,
  exit_page BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site sessions: one per visitor session
CREATE TABLE public.site_sessions (
  id TEXT PRIMARY KEY, -- session_id
  fingerprint_hash TEXT,
  first_page TEXT,
  last_page TEXT,
  page_count INTEGER DEFAULT 1,
  total_duration_ms INTEGER DEFAULT 0,
  referrer TEXT,
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  language TEXT,
  timezone TEXT,
  country TEXT,
  city TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  is_bounce BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Excluded IPs (owner, known bots, etc)
CREATE TABLE public.site_analytics_exclusions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exclusion_type TEXT NOT NULL, -- 'ip', 'user_agent_pattern', 'fingerprint'
  value TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_analytics_exclusions ENABLE ROW LEVEL SECURITY;

-- Page views: anon can insert (tracker), only admin can read
CREATE POLICY "anon_insert_page_views" ON public.site_page_views
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_insert_page_views_auth" ON public.site_page_views
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "admin_read_page_views" ON public.site_page_views
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Sessions: anon can insert/update, admin reads
CREATE POLICY "anon_insert_sessions" ON public.site_sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_insert_sessions_auth" ON public.site_sessions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "anon_update_sessions" ON public.site_sessions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_update_sessions_auth" ON public.site_sessions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_read_sessions" ON public.site_sessions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Exclusions: admin only
CREATE POLICY "admin_manage_exclusions" ON public.site_analytics_exclusions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_page_views_session ON public.site_page_views(session_id);
CREATE INDEX idx_page_views_created ON public.site_page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON public.site_page_views(page_path);
CREATE INDEX idx_page_views_fingerprint ON public.site_page_views(fingerprint_hash);
CREATE INDEX idx_sessions_started ON public.site_sessions(started_at DESC);
CREATE INDEX idx_sessions_fingerprint ON public.site_sessions(fingerprint_hash);

-- Seed owner IP exclusion
INSERT INTO public.site_analytics_exclusions (exclusion_type, value, reason)
VALUES ('ip', 'owner', 'Owner IP excluded from analytics');
