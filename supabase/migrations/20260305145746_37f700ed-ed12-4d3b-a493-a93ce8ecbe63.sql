-- Node Dream Log table for tracking dream cycles per node
CREATE TABLE IF NOT EXISTS public.node_dream_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text NOT NULL,
  dream_tier text NOT NULL DEFAULT 'C',
  dreamt_at timestamptz NOT NULL DEFAULT now(),
  cycle_type text NOT NULL DEFAULT 'consolidation',
  contradictions_found integer NOT NULL DEFAULT 0,
  patterns_merged integer NOT NULL DEFAULT 0,
  heuristics_proposed integer NOT NULL DEFAULT 0,
  memories_decayed integer NOT NULL DEFAULT 0,
  cross_insights jsonb DEFAULT '[]'::jsonb,
  dream_budget_used integer NOT NULL DEFAULT 0,
  dream_budget_max integer NOT NULL DEFAULT 50,
  duration_ms integer DEFAULT 0,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient queries by node and time
CREATE INDEX IF NOT EXISTS idx_node_dream_log_node_id ON public.node_dream_log(node_id);
CREATE INDEX IF NOT EXISTS idx_node_dream_log_dreamt_at ON public.node_dream_log(dreamt_at DESC);

-- Node dream config — per-node dream schedule settings
CREATE TABLE IF NOT EXISTS public.node_dream_config (
  node_id text PRIMARY KEY,
  dream_tier text NOT NULL DEFAULT 'C',
  interval_hours integer NOT NULL DEFAULT 12,
  dream_threshold integer NOT NULL DEFAULT 5,
  budget_per_cycle integer NOT NULL DEFAULT 50,
  enabled boolean NOT NULL DEFAULT true,
  last_dream_at timestamptz,
  total_dreams integer NOT NULL DEFAULT 0,
  total_insights integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.node_dream_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_dream_config ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (these are system tables, not user tables)
CREATE POLICY "Service role full access on dream log"
  ON public.node_dream_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on dream config"
  ON public.node_dream_config FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Authenticated users can read dream logs (for dashboard)
CREATE POLICY "Authenticated read dream log"
  ON public.node_dream_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated read dream config"
  ON public.node_dream_config FOR SELECT
  TO authenticated
  USING (true);

-- Enable realtime for dream log
ALTER PUBLICATION supabase_realtime ADD TABLE public.node_dream_log;