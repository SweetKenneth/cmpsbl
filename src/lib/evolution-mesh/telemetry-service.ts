/**
 * Telemetry Service — Records metrics after shadow/promote/rollback
 * NO side effects on import. No auto intervals. No background jobs.
 */

import { supabase } from '@/integrations/supabase/client';

async function recordMetric(eventType: string, metadata: Record<string, unknown> = {}) {
  try {
    const { error } = await supabase
      .from('system_metrics_history')
      .insert({
        event_type: eventType,
        metadata,
      } as never);

    if (error) {
      console.warn('[EvolutionMesh:Telemetry] Failed to record:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function getMetrics(limit = 50) {
  try {
    const { data } = await supabase
      .from('system_metrics_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export const telemetryService = { recordMetric, getMetrics };
