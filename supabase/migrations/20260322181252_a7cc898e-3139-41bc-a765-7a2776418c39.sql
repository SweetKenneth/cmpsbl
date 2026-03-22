
CREATE OR REPLACE FUNCTION public.cleanup_retention()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_count bigint;
BEGIN
  -- brain_events: keep 14 days
  DELETE FROM public.brain_events WHERE created_at < now() - INTERVAL '14 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('brain_events_deleted', v_count);

  -- brain_metrics: keep 30 days
  DELETE FROM public.brain_metrics WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('brain_metrics_deleted', v_count);

  -- brain_reflections: keep 90 days
  DELETE FROM public.brain_reflections WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('brain_reflections_deleted', v_count);

  -- brain_memory_pruned: keep 7 days
  DELETE FROM public.brain_memory_pruned WHERE pruned_at < now() - INTERVAL '7 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('brain_memory_pruned_deleted', v_count);

  -- brain_memory_contradictions: keep 60 days
  DELETE FROM public.brain_memory_contradictions WHERE created_at < now() - INTERVAL '60 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('brain_contradictions_deleted', v_count);

  -- ai_usage_log: keep 30 days
  DELETE FROM public.ai_usage_log WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('ai_usage_log_deleted', v_count);

  -- access_usage: keep 90 days
  DELETE FROM public.access_usage WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('access_usage_deleted', v_count);

  -- nexus_traces: keep 14 days
  DELETE FROM public.nexus_traces WHERE created_at < now() - INTERVAL '14 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('nexus_traces_deleted', v_count);

  -- nexus_cost_ledger: keep 180 days (uses date column)
  DELETE FROM public.nexus_cost_ledger WHERE date < (now() - INTERVAL '180 days')::date;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('nexus_cost_ledger_deleted', v_count);

  -- agency_task_logs: keep 60 days
  DELETE FROM public.agency_task_logs WHERE created_at < now() - INTERVAL '60 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('agency_task_logs_deleted', v_count);

  -- agency_api_calls: keep 60 days
  DELETE FROM public.agency_api_calls WHERE created_at < now() - INTERVAL '60 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('agency_api_calls_deleted', v_count);

  -- audit_logs: keep 365 days
  DELETE FROM public.audit_logs WHERE created_at < now() - INTERVAL '365 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('audit_logs_deleted', v_count);

  -- agency_agent_telemetry: keep 60 days
  DELETE FROM public.agency_agent_telemetry WHERE created_at < now() - INTERVAL '60 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('agency_telemetry_deleted', v_count);

  -- ip_reputation: clean stale IPs not seen in 30 days
  DELETE FROM public.ip_reputation WHERE last_seen < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('ip_reputation_deleted', v_count);

  -- defense_events: keep 30 days (uses detected_at column)
  DELETE FROM public.defense_events WHERE detected_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('defense_events_deleted', v_count);

  -- pf_brain_anomalies: keep 30 days
  DELETE FROM public.pf_brain_anomalies WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('brain_anomalies_deleted', v_count);

  RETURN v_result;
END;
$function$;
