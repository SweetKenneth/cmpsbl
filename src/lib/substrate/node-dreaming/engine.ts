/**
 * Node-Level Dream Engine
 * Executes dream cycles for individual substrate nodes.
 * Read-heavy, write-light: proposes changes, doesn't auto-apply
 * unless confidence > 0.85 AND passes Immunity shadow gate.
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  NodeDreamConfig,
  DreamReport,
  DreamCycleType,
  CrossInsight,
  DreamScheduleEntry,
} from './types';
import { DEFAULT_DREAM_BUDGET, HEURISTIC_AUTO_APPLY_THRESHOLD } from './types';

/**
 * Fetch all node dream configs from DB
 */
export async function fetchDreamConfigs(): Promise<NodeDreamConfig[]> {
  const { data, error } = await supabase
    .from('node_dream_config')
    .select('*')
    .eq('enabled', true)
    .order('dream_tier', { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    nodeId: row.node_id,
    dreamTier: row.dream_tier,
    intervalHours: row.interval_hours,
    dreamThreshold: row.dream_threshold,
    budgetPerCycle: row.budget_per_cycle,
    enabled: row.enabled,
    lastDreamAt: row.last_dream_at,
    totalDreams: row.total_dreams,
    totalInsights: row.total_insights,
  }));
}

/**
 * Determine which nodes are eligible to dream right now
 */
export function getEligibleDreamers(
  configs: NodeDreamConfig[],
  now: Date = new Date()
): DreamScheduleEntry[] {
  return configs.map((config) => {
    const lastDream = config.lastDreamAt ? new Date(config.lastDreamAt) : null;
    const intervalMs = config.intervalHours * 60 * 60 * 1000;
    const nextDreamAt = lastDream
      ? new Date(lastDream.getTime() + intervalMs)
      : new Date(0); // Never dreamed — eligible immediately

    const eligible = now >= nextDreamAt;

    return {
      nodeId: config.nodeId,
      dreamTier: config.dreamTier,
      nextDreamAt,
      eligible,
      memoriesSinceLastDream: 0, // Populated by caller from memory tables
    };
  });
}

/**
 * Select dream cycle type based on node state
 */
export function selectCycleType(nodeId: string, cycleIndex: number): DreamCycleType {
  // Rotate through cycle types to ensure variety
  const types: DreamCycleType[] = [
    'consolidation',
    'contradiction',
    'cross_pollination',
    'heuristic_gen',
    'decay',
  ];
  return types[cycleIndex % types.length];
}

/**
 * Execute a single dream cycle for a node (client-side simulation).
 * The real heavy lifting happens in the edge function.
 */
export async function triggerNodeDream(
  nodeId: string,
  cycleType: DreamCycleType = 'consolidation'
): Promise<DreamReport | null> {
  try {
    const { data, error } = await supabase.functions.invoke('node-dream-cycle', {
      body: {
        node_id: nodeId,
        cycle_type: cycleType,
      },
    });

    if (error) {
      console.error(`[DREAM] Failed to trigger dream for ${nodeId}:`, error.message);
      return null;
    }

    return data as DreamReport;
  } catch (err) {
    console.error(`[DREAM] Dream cycle error for ${nodeId}:`, err);
    return null;
  }
}

/**
 * Fetch recent dream logs for a node
 */
export async function fetchDreamLogs(
  nodeId?: string,
  limit: number = 20
): Promise<DreamReport[]> {
  let query = supabase
    .from('node_dream_log')
    .select('*')
    .order('dreamt_at', { ascending: false })
    .limit(limit);

  if (nodeId) {
    query = query.eq('node_id', nodeId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row: any) => ({
    nodeId: row.node_id,
    dreamTier: row.dream_tier,
    cycleType: row.cycle_type,
    dreamtAt: row.dreamt_at,
    contradictionsFound: row.contradictions_found,
    patternsMerged: row.patterns_merged,
    heuristicsProposed: row.heuristics_proposed,
    memoriesDecayed: row.memories_decayed,
    crossInsights: row.cross_insights || [],
    budgetUsed: row.dream_budget_used,
    budgetMax: row.dream_budget_max,
    durationMs: row.duration_ms,
    success: row.success,
    errorMessage: row.error_message,
  }));
}

/**
 * Get dream analytics summary across all nodes
 */
export async function getDreamAnalyticsSummary(): Promise<{
  totalDreams: number;
  totalInsights: number;
  avgContradictions: number;
  avgPatternsMerged: number;
  successRate: number;
  nodeBreakdown: Record<string, { dreams: number; insights: number }>;
}> {
  const { data, error } = await supabase
    .from('node_dream_config')
    .select('node_id, total_dreams, total_insights');

  if (error || !data) {
    return {
      totalDreams: 0,
      totalInsights: 0,
      avgContradictions: 0,
      avgPatternsMerged: 0,
      successRate: 1,
      nodeBreakdown: {},
    };
  }

  const nodeBreakdown: Record<string, { dreams: number; insights: number }> = {};
  let totalDreams = 0;
  let totalInsights = 0;

  for (const row of data) {
    const d = (row as any).total_dreams ?? 0;
    const i = (row as any).total_insights ?? 0;
    totalDreams += d;
    totalInsights += i;
    nodeBreakdown[(row as any).node_id] = { dreams: d, insights: i };
  }

  // Fetch recent logs in parallel with config processing
  const { data: recentLogs } = await supabase
    .from('node_dream_log')
    .select('contradictions_found, patterns_merged, success')
    .order('dreamt_at', { ascending: false })
    .limit(100);

  const logs = recentLogs || [];
  const avgContradictions = logs.length > 0
    ? logs.reduce((s, l: any) => s + (l.contradictions_found || 0), 0) / logs.length
    : 0;
  const avgPatternsMerged = logs.length > 0
    ? logs.reduce((s, l: any) => s + (l.patterns_merged || 0), 0) / logs.length
    : 0;
  const successRate = logs.length > 0
    ? logs.filter((l: any) => l.success).length / logs.length
    : 1;

  return {
    totalDreams,
    totalInsights,
    avgContradictions,
    avgPatternsMerged,
    successRate,
    nodeBreakdown,
  };
}
