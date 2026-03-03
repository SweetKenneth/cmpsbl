
-- =============================================
-- AutoBlog v5.0.0 Tables
-- =============================================

-- 1. Adaptive Confidence Weights
CREATE TABLE public.autoblog_confidence_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weights jsonb NOT NULL DEFAULT '{"sourceStability":0.20,"recentSuccessRate":0.20,"topicFamiliarity":0.10,"contentDensity":0.25,"uniqueness":0.25}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autoblog_confidence_weights ENABLE ROW LEVEL SECURITY;

-- Service-role only
CREATE POLICY "Service role manages confidence weights"
  ON public.autoblog_confidence_weights
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2. Topic Seeds (site scanner)
CREATE TABLE public.autoblog_topic_seeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  weight numeric NOT NULL DEFAULT 0.1,
  last_scanned timestamptz,
  scan_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autoblog_topic_seeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages topic seeds"
  ON public.autoblog_topic_seeds
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 3. Publish Cycle (length cadence)
CREATE TABLE public.autoblog_publish_cycle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publish_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autoblog_publish_cycle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages publish cycle"
  ON public.autoblog_publish_cycle
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Seed initial row
INSERT INTO public.autoblog_publish_cycle (publish_count) VALUES (0);

-- 4. Publish Governor State
CREATE TABLE public.autoblog_publish_governor_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_decision_at timestamptz,
  last_publish_at timestamptz,
  publish_streak integer NOT NULL DEFAULT 0,
  cooldown_until timestamptz,
  tokens numeric NOT NULL DEFAULT 1.0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autoblog_publish_governor_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages governor state"
  ON public.autoblog_publish_governor_state
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Seed initial row
INSERT INTO public.autoblog_publish_governor_state (tokens) VALUES (1.0);

-- 5. Publish Governor Logs
CREATE TABLE public.autoblog_publish_governor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decided_at timestamptz NOT NULL DEFAULT now(),
  decision text NOT NULL,
  reason jsonb,
  signals jsonb,
  tokens_before numeric,
  tokens_after numeric,
  cooldown_until timestamptz,
  queue_id uuid,
  post_id uuid
);

ALTER TABLE public.autoblog_publish_governor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages governor logs"
  ON public.autoblog_publish_governor_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 6. Add epistemic_status column to auto_blog_posts if not present
ALTER TABLE public.auto_blog_posts
  ADD COLUMN IF NOT EXISTS semantic_drift_score numeric,
  ADD COLUMN IF NOT EXISTS drift_direction text,
  ADD COLUMN IF NOT EXISTS word_count integer,
  ADD COLUMN IF NOT EXISTS internal_links_count integer,
  ADD COLUMN IF NOT EXISTS image_count integer;
