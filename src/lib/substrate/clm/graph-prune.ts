/**
 * CLM Memory Graph Pruning
 * Manages graph growth, pruning, and audit trails
 */

import { supabase } from '@/integrations/supabase/client';

export interface PruneResult {
  duplicatesRemoved: number;
  nodesDecayed: number;
  edgesMerged: number;
  tombstonesCreated: number;
}

/**
 * Run daily pruning job on learning edges
 */
export async function runGraphPruning(options?: {
  confidenceThreshold?: number;
  maxAgeDays?: number;
  dryRun?: boolean;
}): Promise<PruneResult> {
  const { confidenceThreshold = 0.3, maxAgeDays = 90, dryRun = false } = options || {};
  const result: PruneResult = { duplicatesRemoved: 0, nodesDecayed: 0, edgesMerged: 0, tombstonesCreated: 0 };

  try {
    const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 3600000).toISOString();

    const { data: staleEdges } = await supabase
      .from('brain_graph_edges')
      .select('id, source_id, target_id, weight')
      .lt('weight', confidenceThreshold)
      .lt('created_at', cutoffDate)
      .limit(100);

    const edges = ((staleEdges || []) as unknown) as Array<{ id: string; source_id: string; target_id: string; weight: number }>;

    if (!dryRun && edges.length) {
      // Batch insert all tombstone records in one call
      const tombstones = edges.map(edge => ({
        event_type: 'graph_edge_pruned',
        module: 'brain',
        data: { edge_id: edge.id, reason: 'low_confidence_stale', source_id: edge.source_id, target_id: edge.target_id },
        outcome: 'archived',
      }));

      const [tombstoneResult] = await Promise.all([
        supabase.from('brain_events').insert(tombstones as any),
        supabase.from('brain_graph_edges').delete().in('id', edges.map(e => e.id)),
      ]);

      result.tombstonesCreated = edges.length;
      result.nodesDecayed = edges.length;
    }
  } catch (error) {
    console.error('[CLM] Graph pruning failed:', error);
  }

  return result;
}

export async function getGraphMetrics(): Promise<{
  totalNodes: number;
  totalEdges: number;
  avgWeight: number;
  learningEdges: number;
}> {
  try {
    // Parallelize both queries
    const [edgeCountResult, learningEdgesResult] = await Promise.all([
      supabase.from('brain_graph_edges').select('*', { count: 'exact', head: true }),
      supabase.from('brain_graph_edges').select('weight').eq('relation', 'learning'),
    ]);

    const learningEdges = learningEdgesResult.data || [];
    const avgWeight = learningEdges.length
      ? learningEdges.reduce((sum: number, e: any) => sum + (e.weight || 0), 0) / learningEdges.length
      : 0;

    return {
      totalNodes: 0,
      totalEdges: edgeCountResult.count || 0,
      avgWeight,
      learningEdges: learningEdges.length,
    };
  } catch {
    return { totalNodes: 0, totalEdges: 0, avgWeight: 0, learningEdges: 0 };
  }
}