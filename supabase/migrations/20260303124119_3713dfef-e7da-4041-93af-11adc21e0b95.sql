
-- Add quality pipeline columns to auto_blog_posts
ALTER TABLE public.auto_blog_posts
  ADD COLUMN IF NOT EXISTS confidence_score numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confidence_factors jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS split_brain_reader_score numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS split_brain_skeptic_score numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS split_brain_decision text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contradiction_outcome text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contradiction_score numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS assumptions_extracted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS epistemic_status text DEFAULT NULL;

-- Autoblog assumptions tracking
CREATE TABLE public.autoblog_assumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  assumption_text text NOT NULL,
  assumption_type text NOT NULL DEFAULT 'implicit',
  confidence_level numeric DEFAULT 0.5,
  is_broken boolean DEFAULT false,
  broken_at timestamptz DEFAULT NULL,
  broken_by_post_id uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_autoblog_assumptions_post ON public.autoblog_assumptions(post_id);
CREATE INDEX idx_autoblog_assumptions_broken ON public.autoblog_assumptions(is_broken) WHERE is_broken = false;

ALTER TABLE public.autoblog_assumptions ENABLE ROW LEVEL SECURITY;

-- Service-role only access
CREATE POLICY "Service role manages assumptions"
  ON public.autoblog_assumptions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Autoblog memory reports (monthly self-reflection)
CREATE TABLE public.autoblog_memory_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  lessons_learned text[] DEFAULT '{}',
  assumptions_wrong text[] DEFAULT '{}',
  patterns_abandoned text[] DEFAULT '{}',
  confidence_adjustments jsonb DEFAULT '{}',
  post_count integer DEFAULT 0,
  silence_count integer DEFAULT 0,
  contradiction_count integer DEFAULT 0,
  quality_trend text DEFAULT NULL,
  is_published boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autoblog_memory_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages memory reports"
  ON public.autoblog_memory_reports FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Autoblog split brain audit trail
CREATE TABLE public.autoblog_split_brain_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid DEFAULT NULL,
  queue_id text DEFAULT NULL,
  reader_brain_score numeric NOT NULL DEFAULT 0,
  skeptic_brain_score numeric NOT NULL DEFAULT 0,
  caveats_injected text[] DEFAULT '{}',
  caveat_count integer DEFAULT 0,
  final_decision text NOT NULL DEFAULT 'publish',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autoblog_split_brain_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages split brain audits"
  ON public.autoblog_split_brain_audits FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
