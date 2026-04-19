-- 1. Extend the signal evaluator with batch-3 sources
CREATE OR REPLACE FUNCTION public.conductor_eval_signal(q text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result integer := 0;
BEGIN
  CASE q
    WHEN 'unprocessed_decode_gaps' THEN
      SELECT COUNT(*) INTO result FROM public.decode_gap_log
      WHERE created_at > now() - interval '1 hour';
    WHEN 'unprocessed_defense_events' THEN
      SELECT COUNT(*) INTO result FROM public.defense_events
      WHERE created_at > now() - interval '30 minutes' AND blocked = true;
    WHEN 'unprocessed_regret_candidates' THEN
      SELECT COUNT(*) INTO result FROM public.brain_regret_log
      WHERE created_at > now() - interval '1 hour' AND processed_by_dream = false;
    WHEN 'governor_intent_pending' THEN
      SELECT COUNT(*) INTO result FROM public.governor_intent_stream
      WHERE created_at > now() - interval '2 hours';
    WHEN 'telemetry_pressure' THEN
      SELECT COUNT(*) INTO result FROM public.ai_usage_log
      WHERE created_at > now() - interval '15 minutes';
    WHEN 'immunity_threat_pressure' THEN
      SELECT COUNT(*) INTO result FROM public.immune_intelligence_events
      WHERE created_at > now() - interval '30 minutes';
    WHEN 'harvest_backlog' THEN
      SELECT COUNT(*) INTO result FROM public.pf_global_threat_feed
      WHERE created_at > now() - interval '1 hour';
    WHEN 'evolution_pending' THEN
      SELECT COUNT(*) INTO result FROM public.evolution_proposals
      WHERE created_at > now() - interval '1 hour';
    -- batch 3 signals
    WHEN 'memory_growth_pressure' THEN
      -- new hot memories accumulated in last hour → prefilter ascension scans
      SELECT COUNT(*) INTO result FROM public.brain_memory_hot
      WHERE created_at > now() - interval '1 hour';
    WHEN 'vision_anomaly_pressure' THEN
      -- unresolved vision anomalies → prioritize ascension targets
      SELECT COUNT(*) INTO result FROM public.vision_anomalies
      WHERE detected_at > now() - interval '2 hours' AND resolved = false;
    WHEN 'nexus_cost_pressure' THEN
      -- recent nexus traces → rebalance provider affinity
      SELECT COUNT(*) INTO result FROM public.nexus_traces
      WHERE created_at > now() - interval '30 minutes';
    WHEN 'forge_distill_backlog' THEN
      -- forge agents that have produced output not yet distilled
      SELECT COUNT(*) INTO result FROM public.forge_agents
      WHERE updated_at > now() - interval '2 hours';
    WHEN 'cross_vertical_novelty' THEN
      -- new vertical memory stream entries → candidates for cross-domain transfer
      SELECT COUNT(*) INTO result FROM public.vertical_memory_stream
      WHERE created_at > now() - interval '2 hours' AND contributed_to_global = false;
    ELSE
      result := 0;
  END CASE;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.conductor_eval_signal(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.conductor_eval_signal(text) TO service_role;

-- 2. Cross-vertical bridges — the patentable record of cross-domain pattern transfer
CREATE TABLE IF NOT EXISTS public.cross_vertical_bridges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source_vertical text NOT NULL,
  target_vertical text NOT NULL,
  source_memory_id uuid,
  pattern_type text NOT NULL,
  pattern_summary text,
  similarity_score numeric,
  transferred boolean NOT NULL DEFAULT false,
  transferred_at timestamptz,
  outcome text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cvb_created ON public.cross_vertical_bridges (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cvb_pair ON public.cross_vertical_bridges (source_vertical, target_vertical);

ALTER TABLE public.cross_vertical_bridges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_cvb" ON public.cross_vertical_bridges
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "service_write_cvb" ON public.cross_vertical_bridges
  TO service_role USING (true) WITH CHECK (true);

-- 3. Register batch-3 pipelines
INSERT INTO public.conductor_pipelines
  (name, target_function, target_payload, signal_query, signal_threshold,
   min_interval_seconds, max_interval_seconds, cost_estimate_cents, enabled, metadata)
VALUES
  ('memory-ascension-prefilter', 'memory-ascension-prefilter', '{}'::jsonb,
   'memory_growth_pressure', 5, 1800, 14400, 1, true,
   '{"bridge":"MEMORY→ASCENSION","purpose":"Skip redundant scans by checking known patterns"}'::jsonb),
  ('vision-ascension-prioritizer', 'vision-ascension-prioritizer', '{}'::jsonb,
   'vision_anomaly_pressure', 2, 1800, 21600, 1, true,
   '{"bridge":"VISION→ASCENSION","purpose":"Anomalies prioritize next scan target"}'::jsonb),
  ('nexus-economy-rebalancer', 'nexus-economy-rebalancer', '{}'::jsonb,
   'nexus_cost_pressure', 10, 900, 7200, 1, true,
   '{"bridge":"NEXUS↔ECONOMY","purpose":"Cost ledger drives provider affinity"}'::jsonb),
  ('forge-memory-distiller', 'forge-memory-distiller', '{}'::jsonb,
   'forge_distill_backlog', 3, 3600, 21600, 2, true,
   '{"bridge":"FORGE→MEMORY","purpose":"Auto-distill agent outputs into memory"}'::jsonb),
  ('cross-vertical-memory-bridge', 'cross-vertical-memory-bridge', '{}'::jsonb,
   'cross_vertical_novelty', 3, 3600, 43200, 2, true,
   '{"bridge":"VERTICAL↔VERTICAL","purpose":"Cross-domain pattern transfer (patentable)"}'::jsonb)
ON CONFLICT (name) DO NOTHING;