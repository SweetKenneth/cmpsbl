/**
 * Immune Metrics Recorder
 * Persists shadow probe results to immune_metrics table
 */

import { supabase } from '@/integrations/supabase/client';

interface MetricsInput {
  executor: string;
  total: number;
  repaired: number;
  escalated: number;
  safeFail: number;
}

export async function recordImmuneMetrics({ executor, total, repaired, escalated, safeFail }: MetricsInput) {
  const { error } = await supabase
    .from('immune_metrics')
    .insert({
      executor,
      total_runs: total,
      repair_successes: repaired,
      escalations: escalated,
      safe_failures: safeFail,
    });

  if (error) {
    console.warn('[immune-metrics] Failed to record:', error.message);
  }
}
