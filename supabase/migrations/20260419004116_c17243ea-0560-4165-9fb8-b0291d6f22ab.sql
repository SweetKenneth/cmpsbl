-- Atomic counter increment for pipeline run stats
CREATE OR REPLACE FUNCTION public.conductor_increment_run(
  p_id uuid,
  p_work_units integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conductor_pipelines
  SET total_runs = total_runs + 1,
      total_work_units = total_work_units + COALESCE(p_work_units, 0)
  WHERE id = p_id;
END;
$$;

-- Pre-registered signal evaluator. Only allows reads from a fixed allowlist
-- of signal sources via a key, never raw SQL from clients.
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
    ELSE
      result := 0;
  END CASE;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.conductor_eval_signal(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.conductor_increment_run(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.conductor_eval_signal(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.conductor_increment_run(uuid, integer) TO service_role;