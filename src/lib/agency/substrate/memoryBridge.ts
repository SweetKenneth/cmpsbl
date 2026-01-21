/**
 * Substrate Memory Bridge
 * Routes successful tasks to global substrate brain
 */

import { supabase } from '@/integrations/supabase/client';

export type MemoryType = 'template' | 'heuristic' | 'insight' | 'error' | 'improvement';
export type MemoryTier = 'hot' | 'cold';

export interface SubstrateMemory {
  type: MemoryType;
  tier: MemoryTier;
  title: string;
  content: string;
  source_agency_id?: string;
  source_task_id?: string;
  confidence: number;
  tags: string[];
}

/**
 * Store a template (how a task was completed)
 */
export async function storeTemplate(
  presetId: string,
  actionSequence: unknown[],
  success: boolean,
  agencyId: string,
  _taskId: string
): Promise<boolean> {
  const { error } = await supabase.from('substrate_templates').insert({
    preset_id: presetId,
    name: `Template from ${presetId}`,
    description: `Auto-generated from successful execution`,
    action_sequence: actionSequence,
    source_agency_id: agencyId,
    success_rate: success ? 1 : 0,
    usage_count: 1,
    is_global: false,
    is_active: true,
  });

  if (error) {
    console.error('Failed to store template:', error);
    return false;
  }

  return true;
}

/**
 * Store a heuristic (strategy that worked)
 */
export async function storeHeuristic(
  heuristic: {
    type: string;
    category: string;
    title: string;
    description?: string;
    payload: unknown;
  },
  agencyId: string,
  taskId: string,
  successRate: number = 0.8
): Promise<boolean> {
  const { error } = await supabase.from('substrate_heuristics').insert({
    heuristic_type: heuristic.type,
    category: heuristic.category,
    title: heuristic.title,
    description: heuristic.description,
    payload: heuristic.payload as Record<string, unknown>,
    source_agency_id: agencyId,
    source_task_id: taskId,
    success_rate: successRate,
    confidence: 0.7,
    is_global: false,
    is_active: true,
  });

  if (error) {
    console.error('Failed to store heuristic:', error);
    return false;
  }

  return true;
}

/**
 * Store an insight (summary from successful task)
 */
export async function storeInsight(
  content: string,
  context: string,
  agencyId: string,
  taskId: string,
  tier: MemoryTier = 'hot'
): Promise<boolean> {
  const table = tier === 'hot' ? 'brain_memory_hot' : 'brain_memory_cold';

  const { error } = await supabase.from(table).insert({
    content: content,
    context: context,
    priority: 7,
    tags: ['insight', 'agency', 'task-derived'],
    metadata: {
      source_agency_id: agencyId,
      source_task_id: taskId,
      tier: tier,
    },
  });

  if (error) {
    console.error('Failed to store insight:', error);
    return false;
  }

  return true;
}

/**
 * Store an error pattern (for learning from failures)
 */
export async function storeErrorPattern(
  errorType: string,
  description: string,
  recoveryStrategy: string | null,
  agencyId: string,
  taskId: string
): Promise<boolean> {
  const { error } = await supabase.from('substrate_heuristics').insert({
    heuristic_type: 'error_pattern',
    category: 'recovery',
    title: `Error: ${errorType}`,
    description: description,
    payload: { recovery_strategy: recoveryStrategy },
    source_agency_id: agencyId,
    source_task_id: taskId,
    success_rate: 0,
    confidence: 0.5,
    is_global: false,
    is_active: true,
  });

  if (error) {
    console.error('Failed to store error pattern:', error);
    return false;
  }

  return true;
}

/**
 * Bridge task completion to substrate memory
 */
export async function bridgeTaskToSubstrate(
  task: {
    id: string;
    agency_id: string;
    preset_id?: string;
    status: string;
    output_data?: unknown;
    error_message?: string;
  },
  verification: {
    success: boolean;
    matchScore: number;
    heuristics?: string[];
  },
  actionSequence?: unknown[]
): Promise<{ templates: number; heuristics: number; insights: number; errors: number }> {
  const results = { templates: 0, heuristics: 0, insights: 0, errors: 0 };

  // Store template if preset-based and successful
  if (task.preset_id && verification.success && actionSequence) {
    const stored = await storeTemplate(
      task.preset_id,
      actionSequence,
      verification.success,
      task.agency_id,
      task.id
    );
    if (stored) results.templates++;
  }

  // Store heuristics learned
  if (verification.heuristics && verification.heuristics.length > 0) {
    for (const h of verification.heuristics) {
      const stored = await storeHeuristic(
        { type: 'learned', category: 'execution', title: h, payload: {} },
        task.agency_id,
        task.id,
        verification.matchScore
      );
      if (stored) results.heuristics++;
    }
  }

  // Store insight from successful task output
  if (verification.success && task.output_data) {
    const outputStr = typeof task.output_data === 'string'
      ? task.output_data
      : JSON.stringify(task.output_data).slice(0, 1000);
    const stored = await storeInsight(
      outputStr,
      `task_output_${task.preset_id || 'general'}`,
      task.agency_id,
      task.id
    );
    if (stored) results.insights++;
  }

  // Store error pattern from failures
  if (!verification.success && task.error_message) {
    const stored = await storeErrorPattern(
      'task_failure',
      task.error_message,
      null,
      task.agency_id,
      task.id
    );
    if (stored) results.errors++;
  }

  return results;
}

/**
 * Get heuristics relevant to a task
 */
export async function getRelevantHeuristics(
  category: string,
  limit: number = 5
): Promise<Array<{ title: string; payload: unknown; success_rate: number }>> {
  const { data, error } = await supabase
    .from('substrate_heuristics')
    .select('title, payload, success_rate')
    .eq('category', category)
    .eq('is_active', true)
    .order('success_rate', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch heuristics:', error);
    return [];
  }

  return data || [];
}

/**
 * Get templates for a preset
 */
export async function getPresetTemplates(
  presetId: string,
  limit: number = 3
): Promise<Array<{ action_sequence: unknown[]; success_rate: number }>> {
  const { data, error } = await supabase
    .from('substrate_templates')
    .select('action_sequence, success_rate')
    .eq('preset_id', presetId)
    .eq('is_active', true)
    .order('success_rate', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch templates:', error);
    return [];
  }

  return (data || []).map(t => ({
    action_sequence: (t.action_sequence as unknown[]) || [],
    success_rate: t.success_rate || 0,
  }));
}
