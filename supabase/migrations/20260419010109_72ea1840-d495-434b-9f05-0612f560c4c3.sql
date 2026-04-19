-- 1. Add scheduling-tuning columns
ALTER TABLE public.conductor_pipelines
  ADD COLUMN IF NOT EXISTS is_fallback boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 50;

CREATE INDEX IF NOT EXISTS idx_conductor_pipelines_priority
  ON public.conductor_pipelines (enabled, priority DESC);

-- 2. Extend signal evaluator with cron-migration signals
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
    -- batch 1
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
    -- batch 2
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
    -- batch 3
    WHEN 'memory_growth_pressure' THEN
      SELECT COUNT(*) INTO result FROM public.brain_memory_hot
      WHERE created_at > now() - interval '1 hour';
    WHEN 'vision_anomaly_pressure' THEN
      SELECT COUNT(*) INTO result FROM public.vision_anomalies
      WHERE detected_at > now() - interval '2 hours' AND resolved = false;
    WHEN 'nexus_cost_pressure' THEN
      SELECT COUNT(*) INTO result FROM public.nexus_traces
      WHERE created_at > now() - interval '30 minutes';
    WHEN 'forge_distill_backlog' THEN
      SELECT COUNT(*) INTO result FROM public.forge_agents
      WHERE updated_at > now() - interval '2 hours';
    WHEN 'cross_vertical_novelty' THEN
      SELECT COUNT(*) INTO result FROM public.vertical_memory_stream
      WHERE created_at > now() - interval '2 hours' AND contributed_to_global = false;
    -- cron-migration batch
    WHEN 'brain_orchestrator_pressure' THEN
      -- changes in hot memory or recent embeddings driving orchestrator work
      SELECT COUNT(*) INTO result FROM public.brain_memory_hot
      WHERE updated_at > now() - interval '5 minutes';
    WHEN 'clm_cycle_pressure' THEN
      -- recent vertical clm activity → run engine
      SELECT COUNT(*) INTO result FROM public.vertical_clm_cycles
      WHERE created_at > now() - interval '10 minutes';
    WHEN 'distillation_backlog' THEN
      -- if no recent distillation run, pressure builds with hot memory volume
      SELECT GREATEST(0,
        (SELECT COUNT(*) FROM public.brain_memory_hot WHERE created_at > now() - interval '4 hours')
        - (SELECT COALESCE(SUM(memories_processed), 0)::int FROM public.brain_distillation_runs WHERE created_at > now() - interval '4 hours')
      ) INTO result;
    WHEN 'merchant_scan_backlog' THEN
      -- merchants not scanned in 8h
      SELECT COUNT(*) INTO result FROM public.merchant_scan_log
      WHERE created_at < now() - interval '8 hours' AND created_at > now() - interval '24 hours';
    WHEN 'maintenance_due' THEN
      -- last maintenance report older than 3h
      SELECT CASE
        WHEN MAX(created_at) IS NULL OR MAX(created_at) < now() - interval '3 hours' THEN 1
        ELSE 0
      END INTO result FROM public.maintenance_reports;
    WHEN 'brain_deep_maint_due' THEN
      SELECT CASE
        WHEN MAX(created_at) IS NULL OR MAX(created_at) < now() - interval '6 hours' THEN 1
        ELSE 0
      END INTO result FROM public.brain_maintenance_log;
    WHEN 'decode_owner_report_due' THEN
      -- 3h cadence, signal as binary
      SELECT 1 INTO result; -- always emit; conductor cooldown enforces 3h
    WHEN 'cdm_cycle_due' THEN
      -- 8h cadence, ceiling-driven
      SELECT 1 INTO result;
    WHEN 'dream_intent_pressure' THEN
      SELECT COUNT(*) INTO result FROM public.governor_intent_stream
      WHERE created_at > now() - interval '30 minutes';
    WHEN 'dream_to_primitives_pressure' THEN
      -- dream syntheses produced but not yet promoted
      SELECT COUNT(*) INTO result FROM public.dream_intent_syntheses
      WHERE created_at > now() - interval '1 hour';
    WHEN 'dream_eater_due' THEN
      SELECT CASE
        WHEN MAX(recorded_at) IS NULL OR MAX(recorded_at) < now() - interval '20 hours' THEN 1
        ELSE 0
      END INTO result FROM public.dream_eater_audit;
    WHEN 'vertical_cycle_due' THEN
      SELECT 1 INTO result; -- 4h cadence, ceiling-driven
    WHEN 'backup_fallback_due' THEN
      -- only emit if no successful backup in last 30h (safety net for daily cron)
      SELECT CASE
        WHEN MAX(created_at) IS NULL OR MAX(created_at) < now() - interval '30 hours' THEN 1
        ELSE 0
      END INTO result FROM public.daily_backups;
    WHEN 'auto_heal_fallback_due' THEN
      -- only emit if no maintenance log in last 60min (safety net for 15m cron)
      SELECT CASE
        WHEN MAX(created_at) IS NULL OR MAX(created_at) < now() - interval '1 hour' THEN 1
        ELSE 0
      END INTO result FROM public.brain_maintenance_log;
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

-- 3. Register migrated pipelines (signal-driven where possible, ceiling-driven for fixed cadences)
INSERT INTO public.conductor_pipelines
  (name, target_function, target_payload, signal_query, signal_threshold,
   min_interval_seconds, max_interval_seconds, cost_estimate_cents, enabled, priority, is_fallback, metadata)
VALUES
  -- Brain orchestrator: was every 5min cron. Convert to signal-driven (hot memory churn).
  ('brain-orchestrator', 'pf-brain-orchestrator', '{}'::jsonb,
   'brain_orchestrator_pressure', 5, 300, 900, 1, true, 70, false,
   '{"migrated_from_cron":"brain-orchestrator-cycle","former_schedule":"*/5 * * * *"}'::jsonb),

  -- CLM engine: was every 5min cron. Signal-driven from CLM cycles.
  ('clm-engine', 'pf-clm-engine', '{"action":"cycle","time":"now"}'::jsonb,
   'clm_cycle_pressure', 1, 300, 1800, 1, true, 65, false,
   '{"migrated_from_cron":"clm-engine-cycle","former_schedule":"*/5 * * * *"}'::jsonb),

  -- Module CLM: was hourly. Ceiling-driven.
  ('module-clm', 'pf-module-clm-scheduler', '{}'::jsonb,
   NULL, 0, 1800, 4500, 1, true, 55, false,
   '{"migrated_from_cron":"module-clm-hourly","former_schedule":"0 * * * *"}'::jsonb),

  -- Agent CLM cycle: was every 30min.
  ('agent-clm-cycle', 'agent-clm-cycle', '{}'::jsonb,
   NULL, 0, 1500, 2400, 1, true, 55, false,
   '{"migrated_from_cron":"agent-clm-cycle-every-30m","former_schedule":"*/30 * * * *"}'::jsonb),

  -- NEXUS budget optimizer: hourly. Signal-driven from cost pressure.
  ('nexus-budget-optimizer', 'nexus-budget-optimizer', '{}'::jsonb,
   'nexus_cost_pressure', 5, 1800, 5400, 1, true, 60, false,
   '{"migrated_from_cron":"nexus-budget-optimizer-hourly","former_schedule":"0 * * * *"}'::jsonb),

  -- Distillation engine cycle: every 4h. Signal-driven from backlog.
  ('distillation-engine', 'pf-distillation-engine', '{"mode":"cycle"}'::jsonb,
   'distillation_backlog', 50, 7200, 18000, 2, true, 50, false,
   '{"migrated_from_cron":"pf-distillation-engine-cycle","former_schedule":"0 */4 * * *"}'::jsonb),

  -- Distillation teacher-student: every 4h offset 15.
  ('distillation-teacher-student', 'pf-distillation-engine', '{"mode":"teacher_student"}'::jsonb,
   'distillation_backlog', 50, 7200, 18000, 2, true, 45, false,
   '{"migrated_from_cron":"pf-distillation-teacher-student","former_schedule":"15 */4 * * *"}'::jsonb),

  -- Distillation cross-module: every 4h offset 30.
  ('distillation-cross-module', 'pf-distillation-engine', '{"mode":"cross_module"}'::jsonb,
   'distillation_backlog', 50, 7200, 18000, 2, true, 45, false,
   '{"migrated_from_cron":"pf-distillation-cross-module","former_schedule":"30 */4 * * *"}'::jsonb),

  -- Decode owner report: every 3h. Ceiling-driven binary signal.
  ('decode-owner-report', 'pf-owner-report', '{}'::jsonb,
   'decode_owner_report_due', 1, 9000, 12600, 1, true, 40, false,
   '{"migrated_from_cron":"decode-owner-report-3h","former_schedule":"0 */3 * * *"}'::jsonb),

  -- Maintenance reporter: every 3h. Signal-driven (last report age).
  ('maintenance-reporter', 'maintenance-reporter', '{}'::jsonb,
   'maintenance_due', 1, 9000, 14400, 1, true, 40, false,
   '{"migrated_from_cron":"maintenance-every-3-hours","former_schedule":"0 */3 * * *"}'::jsonb),

  -- Brain deep maintenance: every 6h. Signal-driven.
  ('brain-deep-maintenance', 'pf-brain-deep-maintenance', '{}'::jsonb,
   'brain_deep_maint_due', 1, 18000, 28800, 2, true, 35, false,
   '{"migrated_from_cron":"brain-deep-maintenance-6h","former_schedule":"0 */6 * * *"}'::jsonb),

  -- Merchant scan: every 8h. Signal-driven from merchant backlog.
  ('merchant-scan', 'merchant-scan', '{}'::jsonb,
   'merchant_scan_backlog', 1, 21600, 36000, 2, true, 30, false,
   '{"migrated_from_cron":"merchant-scan-8hr","former_schedule":"0 */8 * * *"}'::jsonb),

  -- CDM scheduled: every 8h.
  ('cdm-scheduled', 'cdm-scheduled', '{"source":"conductor"}'::jsonb,
   'cdm_cycle_due', 1, 21600, 36000, 2, true, 30, false,
   '{"migrated_from_cron":"cdm-discovery-cycle (and cdm-primary-substrate duplicate collapsed)","former_schedule":"0 */8 * * *"}'::jsonb),

  -- Vertical autonomous cycle: every 4h.
  ('vertical-autonomous-cycle', 'vertical-autonomous-cycle', '{}'::jsonb,
   'cross_vertical_novelty', 3, 10800, 21600, 2, true, 40, false,
   '{"migrated_from_cron":"vertical-autonomous-cycle","former_schedule":"30 */4 * * *"}'::jsonb),

  -- Dream from intent: every 30min.
  ('dream-from-intent', 'dream-from-intent', '{}'::jsonb,
   'dream_intent_pressure', 1, 1500, 3600, 2, true, 55, false,
   '{"migrated_from_cron":"dream-from-intent-30m","former_schedule":"*/30 * * * *"}'::jsonb),

  -- Dream to primitives: hourly.
  ('dream-to-primitives', 'dream-to-primitives', '{}'::jsonb,
   'dream_to_primitives_pressure', 3, 2700, 7200, 2, true, 50, false,
   '{"migrated_from_cron":"substrate-dream-to-primitives","former_schedule":"40 * * * *"}'::jsonb),

  -- Dream eater: daily. Ceiling-driven.
  ('dream-eater-cycle', 'pf-dream-eater-cycle', '{}'::jsonb,
   'dream_eater_due', 1, 64800, 90000, 2, true, 35, false,
   '{"migrated_from_cron":"dream-eater-unified-cycle","former_schedule":"0 3 * * *"}'::jsonb),

  -- ── Critical-safety FALLBACK pipelines (cron stays primary; conductor only fires if cron didn't) ──
  ('brain-auto-heal-fallback', 'pf-brain-auto-heal', '{}'::jsonb,
   'auto_heal_fallback_due', 1, 1800, 5400, 1, true, 25, true,
   '{"role":"fallback_for","cron":"brain-auto-heal","note":"Only fires if 15-min cron has missed for >1h"}'::jsonb),

  ('daily-backup-fallback', 'pf-backup-daily', '{}'::jsonb,
   'backup_fallback_due', 1, 86400, 172800, 5, true, 20, true,
   '{"role":"fallback_for","cron":"substrate-daily-backup","note":"Only fires if no backup in 30h"}'::jsonb),

  ('failsafe-nightly-fallback', 'failsafe-nightly', '{}'::jsonb,
   'backup_fallback_due', 1, 86400, 172800, 5, true, 20, true,
   '{"role":"fallback_for","cron":"failsafe-nightly-backup","note":"Only fires if no backup in 30h"}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  signal_query = EXCLUDED.signal_query,
  signal_threshold = EXCLUDED.signal_threshold,
  min_interval_seconds = EXCLUDED.min_interval_seconds,
  max_interval_seconds = EXCLUDED.max_interval_seconds,
  cost_estimate_cents = EXCLUDED.cost_estimate_cents,
  priority = EXCLUDED.priority,
  is_fallback = EXCLUDED.is_fallback,
  metadata = EXCLUDED.metadata;