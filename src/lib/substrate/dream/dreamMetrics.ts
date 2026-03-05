/**
 * Dream Metrics for ATLAS Dashboard
 * Surfaces dream activity, generation depth, and drift alerts per node.
 */

import { supabase } from '@/integrations/supabase/client';
import type { DreamMetrics } from './types';

/**
 * Fetch dream metrics for ATLAS visualization.
 * Aggregates last 24h of dream activity per node.
 */
export async function fetchDreamMetrics(): Promise<DreamMetrics[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('node_dream_log')
    .select('node_id, contradictions_found, heuristics_proposed, patterns_merged')
    .gte('dreamt_at', since);

  if (error || !data) return [];

  // Aggregate per node
  const byNode: Record<string, DreamMetrics> = {};

  for (const row of data as any[]) {
    const nodeId = row.node_id;
    if (!byNode[nodeId]) {
      byNode[nodeId] = {
        node_id: nodeId,
        dreams_last_24h: 0,
        heuristics_generated: 0,
        contradictions_resolved: 0,
        avg_generation_depth: 0,
        drift_alerts: 0,
      };
    }
    byNode[nodeId].dreams_last_24h += 1;
    byNode[nodeId].heuristics_generated += row.heuristics_proposed ?? 0;
    byNode[nodeId].contradictions_resolved += row.contradictions_found ?? 0;
  }

  return Object.values(byNode);
}
