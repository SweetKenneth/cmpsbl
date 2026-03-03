
-- Unified retention cleanup function
-- Covers all high-growth tables missing retention policies
CREATE OR REPLACE FUNCTION public.cleanup_retention()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_count bigint;
BEGIN
  -- brain_events: keep 90 days (largest table at 110MB+)
  DELETE FROM public.brain_events WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('brain_events_deleted', v_count);

  -- ai_usage_log: keep 90 days
  DELETE FROM public.ai_usage_log WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('ai_usage_log_deleted', v_count);

  -- access_usage: keep 90 days
  DELETE FROM public.access_usage WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('access_usage_deleted', v_count);

  -- nexus_traces: keep 30 days (high-volume debug data)
  DELETE FROM public.nexus_traces WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('nexus_traces_deleted', v_count);

  -- nexus_cost_ledger: keep 180 days (financial records, longer retention)
  DELETE FROM public.nexus_cost_ledger WHERE created_at < now() - INTERVAL '180 days';
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

  -- audit_logs: keep 365 days (compliance — long retention)
  DELETE FROM public.audit_logs WHERE created_at < now() - INTERVAL '365 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('audit_logs_deleted', v_count);

  -- agency_agent_telemetry: keep 90 days
  DELETE FROM public.agency_agent_telemetry WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('agency_telemetry_deleted', v_count);

  -- ip_reputation: clean stale IPs not seen in 30 days
  DELETE FROM public.ip_reputation WHERE last_seen < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_result := v_result || jsonb_build_object('ip_reputation_deleted', v_count);

  RETURN v_result;
END;
$$;

-- Stale scheduled task detector
CREATE OR REPLACE FUNCTION public.detect_stale_scheduled_tasks()
RETURNS TABLE(id uuid, agency_id uuid, title text, task_type text, next_run_at timestamptz, last_run_at timestamptz, hours_overdue numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, agency_id, title, task_type, next_run_at, last_run_at,
    ROUND(EXTRACT(EPOCH FROM (now() - next_run_at)) / 3600, 1) as hours_overdue
  FROM public.agency_scheduled_tasks
  WHERE is_active = true AND next_run_at < now() - INTERVAL '1 hour'
  ORDER BY next_run_at ASC;
$$;

-- Orphan record detector
CREATE OR REPLACE FUNCTION public.detect_orphan_records()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_count bigint;
BEGIN
  -- Tasks referencing non-existent agencies
  SELECT count(*) INTO v_count FROM agency_tasks t
    LEFT JOIN agencies a ON t.agency_id = a.id WHERE a.id IS NULL;
  v_result := v_result || jsonb_build_object('orphan_tasks', v_count);

  -- Members referencing non-existent agencies
  SELECT count(*) INTO v_count FROM agency_members m
    LEFT JOIN agencies a ON m.agency_id = a.id WHERE a.id IS NULL;
  v_result := v_result || jsonb_build_object('orphan_members', v_count);

  -- Task logs referencing non-existent tasks
  SELECT count(*) INTO v_count FROM agency_task_logs l
    LEFT JOIN agency_tasks t ON l.task_id = t.id WHERE t.id IS NULL;
  v_result := v_result || jsonb_build_object('orphan_task_logs', v_count);

  -- Task artifacts referencing non-existent tasks
  SELECT count(*) INTO v_count FROM agency_task_artifacts a
    LEFT JOIN agency_tasks t ON a.task_id = t.id WHERE t.id IS NULL;
  v_result := v_result || jsonb_build_object('orphan_task_artifacts', v_count);

  -- Scheduled tasks referencing non-existent agencies
  SELECT count(*) INTO v_count FROM agency_scheduled_tasks s
    LEFT JOIN agencies a ON s.agency_id = a.id WHERE a.id IS NULL;
  v_result := v_result || jsonb_build_object('orphan_scheduled_tasks', v_count);

  -- Email queue referencing non-existent agencies
  SELECT count(*) INTO v_count FROM agency_email_queue e
    LEFT JOIN agencies a ON e.agency_id = a.id WHERE a.id IS NULL;
  v_result := v_result || jsonb_build_object('orphan_email_queue', v_count);

  -- Quota records referencing non-existent API keys
  SELECT count(*) INTO v_count FROM access_quotas q
    LEFT JOIN access_api_keys k ON q.api_key_id = k.id WHERE k.id IS NULL AND q.api_key_id IS NOT NULL;
  v_result := v_result || jsonb_build_object('orphan_quotas', v_count);

  RETURN v_result;
END;
$$;
