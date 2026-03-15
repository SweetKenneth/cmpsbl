-- Prune brain_events (188K rows → keep last 3 days)
DELETE FROM public.brain_events WHERE created_at < now() - interval '3 days';

-- Prune ai_usage_log (13K rows → keep last 7 days)
DELETE FROM public.ai_usage_log WHERE created_at < now() - interval '7 days';

-- Truncate brain_memory_pruned
TRUNCATE public.brain_memory_pruned;

-- Prune defense_events (keep last 7 days)
DELETE FROM public.defense_events WHERE detected_at < now() - interval '7 days';

-- Prune brain_reflection_log (keep last 7 days)
DELETE FROM public.brain_reflection_log WHERE created_at < now() - interval '7 days';

-- Prune pf_brain_anomalies (keep last 7 days)
DELETE FROM public.pf_brain_anomalies WHERE created_at < now() - interval '7 days';

-- Prune brain_metrics (keep last 3 days)
DELETE FROM public.brain_metrics WHERE created_at < now() - interval '3 days';

-- Prune site_page_views (keep last 14 days)
DELETE FROM public.site_page_views WHERE created_at < now() - interval '14 days';

-- Prune learning_queries (keep last 7 days)
DELETE FROM public.learning_queries WHERE created_at < now() - interval '7 days';

-- Prune nexus_hourly_snapshots (keep last 3 days)
DELETE FROM public.nexus_hourly_snapshots WHERE created_at < now() - interval '3 days';

-- Prune nexus_traces (keep last 3 days)
DELETE FROM public.nexus_traces WHERE created_at < now() - interval '3 days';

-- Prune client_error_log (keep last 7 days)
DELETE FROM public.client_error_log WHERE created_at < now() - interval '7 days';

-- Prune brain_memory_cold (keep top 2000)
DELETE FROM public.brain_memory_cold WHERE id NOT IN (SELECT id FROM public.brain_memory_cold ORDER BY created_at DESC LIMIT 2000);

-- Prune brain_memory_warm (keep top 2000)
DELETE FROM public.brain_memory_warm WHERE id NOT IN (SELECT id FROM public.brain_memory_warm ORDER BY created_at DESC LIMIT 2000);

-- Prune site_sessions (keep last 14 days, uses started_at)
DELETE FROM public.site_sessions WHERE started_at < now() - interval '14 days';

-- Prune ai_daily_quota (keep last 14 days, uses date)
DELETE FROM public.ai_daily_quota WHERE date < (now() - interval '14 days')::date;