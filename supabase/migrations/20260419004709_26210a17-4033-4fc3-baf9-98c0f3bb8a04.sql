-- Extend the signal evaluator with batch-2 sources
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

-- Conductor health snapshots — fed by conductor-health-publisher each tick
CREATE TABLE IF NOT EXISTS public.conductor_health_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  active_pipelines integer NOT NULL DEFAULT 0,
  failed_runs_1h integer NOT NULL DEFAULT 0,
  empty_runs_1h integer NOT NULL DEFAULT 0,
  successful_runs_1h integer NOT NULL DEFAULT 0,
  avg_duration_ms integer NOT NULL DEFAULT 0,
  throttled_pipelines text[] DEFAULT '{}',
  health_score integer NOT NULL DEFAULT 100,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_conductor_health_recorded ON public.conductor_health_snapshots (recorded_at DESC);

ALTER TABLE public.conductor_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_conductor_health" ON public.conductor_health_snapshots
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "service_write_conductor_health" ON public.conductor_health_snapshots
  TO service_role USING (true) WITH CHECK (true);