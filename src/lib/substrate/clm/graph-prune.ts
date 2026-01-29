/**
 * CLM Memory Graph Pruning
 * v6.7.0 — Manages graph growth, pruning, and audit trails
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

    // Find low-confidence stale edges
    const { data: staleEdges } = await supabase
      .from('brain_knowledge_edges' as any)
      .select('id, source_id, target_id, weight, metadata')
      .lt('weight', confidenceThreshold)
      .lt('created_at', cutoffDate)
      .limit(100);

    const edges = ((staleEdges || []) as unknown) as Array<{ id: string; source_id: string; target_id: string; weight: number; metadata: any }>;

    if (!dryRun && edges.length) {
      // Create tombstone records
      for (const edge of edges) {
        await supabase.from('brain_events').insert({
          event_type: 'graph_edge_pruned',
          module: 'brain',
          data: { edge_id: edge.id, reason: 'low_confidence_stale', source_id: edge.source_id, target_id: edge.target_id },
          outcome: 'archived',
        } as any);
        result.tombstonesCreated++;
      }

      // Delete edges
      const ids = edges.map(e => e.id);
      await supabase.from('brain_knowledge_edges' as any).delete().in('id', ids);
      result.nodesDecayed = ids.length;
    }

    // Decay weights on aging edges (simplified)
    if (!dryRun) {
      // Note: weight decay would be done via edge function in production
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
    const { count: edgeCount } = await supabase
      .from('brain_knowledge_edges' as any)
      .select('*', { count: 'exact', head: true });

    const { data: learningEdges } = await supabase
      .from('brain_knowledge_edges' as any)
      .select('weight')
      .eq('relation_type', 'learning');

    const avgWeight = learningEdges?.length
      ? learningEdges.reduce((sum: number, e: any) => sum + (e.weight || 0), 0) / learningEdges.length
      : 0;

    return {
      totalNodes: 0, // Would need separate node table
      totalEdges: edgeCount || 0,
      avgWeight,
      learningEdges: learningEdges?.length || 0,
    };
  } catch {
    return { totalNodes: 0, totalEdges: 0, avgWeight: 0, learningEdges: 0 };
  }
}
