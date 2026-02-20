/**
 * Immune Metrics Recorder
 * Persists shadow probe results to immune_metrics table
 * Phase 2: includes repair telemetry fields
 */

import { supabase } from '@/integrations/supabase/client';

interface MetricsInput {
  executor: string;
  total: number;
  repaired: number;
  escalated: number;
  safeFail: number;
  /** Phase 2 repair telemetry */
  repair_attempted?: boolean;
  repair_success?: boolean;
  repair_type?: string | null;
  retry_attempted?: boolean;
}

export async function recordImmuneMetrics({
  executor, total, repaired, escalated, safeFail,
  repair_attempted = false,
  repair_success = false,
  repair_type = null,
  retry_attempted = false,
}: MetricsInput) {
  const { error } = await supabase
    .from('immune_metrics')
    .insert({
      executor,
      total_runs: total,
      repair_successes: repaired,
      escalations: escalated,
      safe_failures: safeFail,
      repair_attempted,
      repair_success,
      repair_type,
      retry_attempted,
    } as any);

  if (error) {
    console.warn('[immune-metrics] Failed to record:', error.message);
  }
}
