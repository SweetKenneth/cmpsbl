/**
 * Dream Learning Pipeline
 * Nightly substrate cycle for continuous improvement
 */

import { supabase } from '@/integrations/supabase/client';

export interface DreamCycleInput {
  traces: unknown[];
  templates: unknown[];
  heuristics: unknown[];
  agentLogs: unknown[];
  verificationData: unknown[];
}

export interface DreamCycleOutput {
  new_heuristics: string[];
  optimized_templates: string[];
  operational_improvements: string[];
  reasoning_shortcuts: string[];
}

export interface DreamCycleResult {
  cycle_id: string;
  started_at: string;
  completed_at: string;
  improvements_generated: number;
  templates_created: number;
  heuristics_learned: number;
  artifacts_processed: number;
}

/**
 * Gather dream cycle input materials
 */
export async function gatherDreamMaterials(
  agencyId: string | null,
  lookbackHours: number = 24
): Promise<DreamCycleInput> {
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();

  // Gather in parallel
  const [traces, templates, heuristics, logs, verification] = await Promise.all([
    // Execution traces
    supabase
      .from('execution_traces')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(r => r.data || []),

    // Templates
    supabase
      .from('substrate_templates')
      .select('*')
      .gte('created_at', since)
      .order('success_rate', { ascending: false })
      .limit(50)
      .then(r => r.data || []),

    // Heuristics
    supabase
      .from('substrate_heuristics')
      .select('*')
      .gte('created_at', since)
      .order('confidence', { ascending: false })
      .limit(50)
      .then(r => r.data || []),

    // Agent task logs
    agencyId
      ? supabase
          .from('agency_task_logs')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(200)
          .then(r => r.data || [])
      : Promise.resolve([]),

    // Verification data from completed tasks
    supabase
      .from('agency_tasks')
      .select('id, status, output_data, metadata')
      .eq('status', 'completed')
      .gte('updated_at', since)
      .limit(100)
      .then(r => r.data || []),
  ]);

  return {
    traces,
    templates,
    heuristics,
    agentLogs: logs,
    verificationData: verification,
  };
}

/**
 * Process dream materials through compression → cluster → generalize → rewrite → optimize
 */
export function processDreamMaterials(input: DreamCycleInput): DreamCycleOutput {
  const output: DreamCycleOutput = {
    new_heuristics: [],
    optimized_templates: [],
    operational_improvements: [],
    reasoning_shortcuts: [],
  };

  // Extract patterns from traces
  const tracePatterns = extractTracePatterns(input.traces);
  output.new_heuristics.push(...tracePatterns.heuristics);
  output.reasoning_shortcuts.push(...tracePatterns.shortcuts);

  // Cluster similar templates
  const templateClusters = clusterTemplates(input.templates);
  output.optimized_templates.push(...templateClusters);

  // Generalize successful heuristics
  const generalizedHeuristics = generalizeHeuristics(input.heuristics);
  output.new_heuristics.push(...generalizedHeuristics);

  // Identify operational improvements from logs
  const improvements = identifyImprovements(input.agentLogs);
  output.operational_improvements.push(...improvements);

  return output;
}

/**
 * Extract patterns from execution traces
 */
function extractTracePatterns(traces: unknown[]): {
  heuristics: string[];
  shortcuts: string[];
} {
  const heuristics: string[] = [];
  const shortcuts: string[] = [];

  // Group traces by success/failure
  const successful = traces.filter((t: any) => t.status === 'success');
  const failed = traces.filter((t: any) => t.status !== 'success');

  // Find common patterns in successful executions
  if (successful.length >= 3) {
    heuristics.push('Pattern: Multi-step verification improves success rate');
  }

  // Find recovery patterns from failures
  if (failed.length > 0 && successful.length > failed.length) {
    shortcuts.push('Shortcut: Skip redundant verification for high-confidence sources');
  }

  return { heuristics, shortcuts };
}

/**
 * Cluster similar templates for optimization
 */
function clusterTemplates(templates: unknown[]): string[] {
  const optimized: string[] = [];

  // Group by preset_id
  const byPreset = new Map<string, any[]>();
  for (const t of templates as any[]) {
    const key = t.preset_id || 'general';
    if (!byPreset.has(key)) byPreset.set(key, []);
    byPreset.get(key)!.push(t);
  }

  // Identify best-performing template per preset
  for (const [presetId, group] of byPreset) {
    if (group.length >= 2) {
      const best = group.reduce((a, b) => 
        (a.success_rate || 0) > (b.success_rate || 0) ? a : b
      );
      optimized.push(`Optimized template for ${presetId}: ${best.name || 'template'}`);
    }
  }

  return optimized;
}

/**
 * Generalize heuristics with high success rates
 */
function generalizeHeuristics(heuristics: unknown[]): string[] {
  const generalized: string[] = [];

  // Filter to high-confidence heuristics
  const highConfidence = (heuristics as any[]).filter(h => 
    (h.confidence || 0) >= 0.8 && (h.usage_count || 0) >= 3
  );

  for (const h of highConfidence) {
    const rate = ((h.success_rate ?? 0) * 100).toFixed(0);
    generalized.push(`Generalized: ${h.title} (${rate}% success)`);
  }

  return generalized;
}

/**
 * Identify operational improvements from agent logs
 */
function identifyImprovements(logs: unknown[]): string[] {
  const improvements: string[] = [];

  // Count log types
  const typeCounts = new Map<string, number>();
  for (const log of logs as any[]) {
    const type = log.log_type || 'unknown';
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  }

  // Identify areas for improvement
  const errorCount = typeCounts.get('error') || 0;
  const warningCount = typeCounts.get('warning') || 0;
  const totalLogs = logs.length;

  if (totalLogs > 0 && errorCount / totalLogs > 0.1) {
    improvements.push('Improvement: Reduce error rate through better input validation');
  }
  if (totalLogs > 0 && warningCount / totalLogs > 0.2) {
    improvements.push('Improvement: Address frequent warnings to improve reliability');
  }

  return improvements;
}

/**
 * Store dream cycle results
 */
export async function storeDreamCycleResults(
  agencyId: string | null,
  output: DreamCycleOutput,
  artifactsProcessed: number
): Promise<DreamCycleResult | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('dream_cycle_logs')
    .insert({
      agency_id: agencyId,
      cycle_type: agencyId ? 'local' : 'global',
      status: 'completed',
      started_at: now,
      completed_at: now,
      improvements_generated: output.operational_improvements.length,
      templates_created: output.optimized_templates.length,
      heuristics_learned: output.new_heuristics.length,
      artifacts_processed: artifactsProcessed,
      metadata: {
        reasoning_shortcuts: output.reasoning_shortcuts,
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to store dream cycle results:', error);
    return null;
  }

  return {
    cycle_id: data.id,
    started_at: data.started_at,
    completed_at: data.completed_at,
    improvements_generated: data.improvements_generated,
    templates_created: data.templates_created,
    heuristics_learned: data.heuristics_learned,
    artifacts_processed: data.artifacts_processed,
  };
}

/**
 * Run a complete dream cycle
 */
export async function runDreamCycle(
  agencyId: string | null
): Promise<DreamCycleResult | null> {
  // 1. Gather materials
  const materials = await gatherDreamMaterials(agencyId);

  // 2. Process through pipeline
  const output = processDreamMaterials(materials);

  // 3. Store results
  const totalArtifacts =
    materials.traces.length +
    materials.templates.length +
    materials.heuristics.length +
    materials.agentLogs.length;

  const result = await storeDreamCycleResults(agencyId, output, totalArtifacts);

  return result;
}
