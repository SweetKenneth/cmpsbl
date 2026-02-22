CREATE OR REPLACE FUNCTION public.get_public_live_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_brain_events BIGINT;
  v_hot BIGINT;
  v_warm BIGINT;
  v_cold BIGINT;
  v_api_calls BIGINT;
  v_total_probes BIGINT;
BEGIN
  SELECT count(*) INTO v_brain_events FROM brain_events;
  SELECT count(*) INTO v_hot FROM brain_memory_hot;
  SELECT count(*) INTO v_warm FROM brain_memory_warm;
  SELECT count(*) INTO v_cold FROM brain_memory_cold;
  
  SELECT count(*) INTO v_api_calls FROM ai_usage_log
    WHERE created_at >= CURRENT_DATE::timestamptz;
  
  SELECT COALESCE(SUM(total_runs), 0) INTO v_total_probes FROM immune_metrics;
  
  RETURN jsonb_build_object(
    'brain_events', v_brain_events,
    'memories', v_hot + v_warm + v_cold,
    'api_calls', v_api_calls,
    'total_probes', v_total_probes
  );
END;
$$;