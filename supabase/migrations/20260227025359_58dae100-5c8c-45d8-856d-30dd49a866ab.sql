
-- NEXUS Dynamic Budget Discovery & Optimization Tables

-- Provider real limits discovered through exhaustion testing
CREATE TABLE IF NOT EXISTS public.nexus_provider_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  stated_rpd INTEGER NOT NULL DEFAULT 0,
  discovered_rpd INTEGER,
  discovered_rpm INTEGER,
  last_exhaustion_at TIMESTAMPTZ,
  exhaustion_count INTEGER DEFAULT 0,
  avg_failure_threshold INTEGER,
  confidence NUMERIC(4,3) DEFAULT 0,
  discovery_phase TEXT DEFAULT 'pending', -- pending, testing, confirmed
  last_updated TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Hourly NEXUS optimization snapshots
CREATE TABLE IF NOT EXISTS public.nexus_hourly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_hour TIMESTAMPTZ NOT NULL,
  total_capacity INTEGER NOT NULL DEFAULT 0,
  used_today INTEGER NOT NULL DEFAULT 0,
  reserved_for_substrate INTEGER NOT NULL DEFAULT 0,
  reserved_for_active_devs INTEGER NOT NULL DEFAULT 0,
  reserved_for_chatbots INTEGER NOT NULL DEFAULT 0,
  available_for_clm INTEGER NOT NULL DEFAULT 0,
  clm_calls_dispatched INTEGER DEFAULT 0,
  active_developer_count INTEGER DEFAULT 0,
  optimization_strategy TEXT DEFAULT 'balanced',
  provider_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint on hour to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_nexus_hourly_snapshot_hour ON nexus_hourly_snapshots(snapshot_hour);

-- User onboarding state
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  step TEXT NOT NULL DEFAULT 'welcome',
  completed_steps TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own onboarding" ON public.user_onboarding
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding" ON public.user_onboarding
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding" ON public.user_onboarding
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS for nexus tables (admin/service only writes, authenticated reads)
ALTER TABLE public.nexus_provider_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_hourly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read provider limits" ON public.nexus_provider_limits
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read hourly snapshots" ON public.nexus_hourly_snapshots
  FOR SELECT TO authenticated USING (true);
