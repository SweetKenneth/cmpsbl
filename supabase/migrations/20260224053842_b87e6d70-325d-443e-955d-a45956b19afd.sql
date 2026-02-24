-- Fix: Recreate tsac_executor_stats view with security_invoker=true
-- This ensures RLS policies of the querying user are enforced, not the view creator
DROP VIEW IF EXISTS public.tsac_executor_stats;

CREATE VIEW public.tsac_executor_stats WITH (security_invoker=true) AS
SELECT
  executor_id,
  source,
  count(*) AS total_verifications,
  count(*) FILTER (WHERE overall_verdict = 'pass') AS pass_count,
  count(*) FILTER (WHERE overall_verdict = 'fail') AS fail_count,
  count(*) FILTER (WHERE overall_verdict = 'partial') AS partial_count,
  round(avg(intent_match_score), 2) AS avg_intent_score,
  round(avg(code_quality_score), 1) AS avg_quality_score,
  round(((count(*) FILTER (WHERE overall_verdict = 'pass'))::numeric / NULLIF(count(*), 0)::numeric) * 100, 1) AS pass_rate,
  max(created_at) AS last_verified
FROM tsac_verifications
GROUP BY executor_id, source;