/**
 * Immunity Mesh — Rule Engine DB Operations
 * All database reads/writes for the governed rule engine.
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  ImmunityRule, RulePropagation, RuleLineage,
  RuleConflict, MeshRun, MeshRunMode, InvocationOutcome,
  ConflictType, ConflictResolution, LineageRelation, RuleStatus,
} from './types';

// ═══ RULES ═══

export async function fetchRules(statusFilter?: RuleStatus[]): Promise<ImmunityRule[]> {
  let q = supabase.from('immunity_rules').select('*').order('invocations_24h', { ascending: false });
  if (statusFilter?.length) q = q.in('status', statusFilter);
  const { data } = await q.limit(200) as any;
  return data ?? [];
}

export async function upsertRule(rule: Partial<ImmunityRule> & { rule_key: string; source_executor: string }): Promise<ImmunityRule | null> {
  const { data } = await supabase.from('immunity_rules').upsert(rule as any, { onConflict: 'rule_key' }).select().single() as any;
  return data;
}

export async function updateRuleStatus(ruleId: string, status: RuleStatus, extra: Record<string, unknown> = {}): Promise<void> {
  await supabase.from('immunity_rules').update({ status, ...extra } as any).eq('id', ruleId);
}

export async function updateRuleMetrics(ruleId: string, metrics: Partial<ImmunityRule>): Promise<void> {
  await supabase.from('immunity_rules').update(metrics as any).eq('id', ruleId);
}

// ═══ INVOCATIONS ═══

export async function recordInvocation(ruleId: string, executor: string, outcome: InvocationOutcome, durationMs: number, costUnits: number): Promise<void> {
  await supabase.from('immunity_rule_invocations').insert({
    rule_id: ruleId, executor, outcome, duration_ms: durationMs, cost_units: costUnits,
  } as any);
}

export async function fetchInvocations(ruleId: string, since: string): Promise<Array<{ executor: string; outcome: string; duration_ms: number; cost_units: number; created_at: string }>> {
  const { data } = await supabase.from('immunity_rule_invocations').select('executor, outcome, duration_ms, cost_units, created_at').eq('rule_id', ruleId).gte('created_at', since).order('created_at', { ascending: false }).limit(1000) as any;
  return data ?? [];
}

export async function fetchAllInvocationsSince(since: string): Promise<Array<{ rule_id: string; executor: string; outcome: string; duration_ms: number; cost_units: number; created_at: string }>> {
  const { data } = await supabase.from('immunity_rule_invocations').select('rule_id, executor, outcome, duration_ms, cost_units, created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(1000) as any;
  return data ?? [];
}

// ═══ PROPAGATION ═══

export async function recordPropagation(ruleId: string, fromExec: string, toExec: string, confidence: number): Promise<void> {
  await supabase.from('immunity_rule_propagation').insert({ rule_id: ruleId, from_executor: fromExec, to_executor: toExec, adoption_confidence: confidence } as any);
}

export async function fetchPropagation(ruleId?: string): Promise<RulePropagation[]> {
  let q = supabase.from('immunity_rule_propagation').select('*').order('adopted_at', { ascending: false });
  if (ruleId) q = q.eq('rule_id', ruleId);
  const { data } = await q.limit(500) as any;
  return data ?? [];
}

// ═══ LINEAGE ═══

export async function recordLineage(parentId: string, childId: string, relation: LineageRelation): Promise<void> {
  await supabase.from('immunity_rule_lineage').insert({ parent_rule_id: parentId, child_rule_id: childId, relation } as any);
}

export async function fetchLineage(ruleId: string): Promise<RuleLineage[]> {
  const { data } = await supabase.from('immunity_rule_lineage').select('*').or(`parent_rule_id.eq.${ruleId},child_rule_id.eq.${ruleId}`) as any;
  return data ?? [];
}

// ═══ CONFLICTS ═══

export async function recordConflict(ruleAId: string, ruleBId: string, conflictType: ConflictType, resolution: ConflictResolution = 'unresolved', notes?: string): Promise<void> {
  await supabase.from('immunity_rule_conflicts').insert({ rule_a_id: ruleAId, rule_b_id: ruleBId, conflict_type: conflictType, resolution, notes } as any);
}

export async function fetchConflicts(limit = 10): Promise<RuleConflict[]> {
  const { data } = await supabase.from('immunity_rule_conflicts').select('*').order('detected_at', { ascending: false }).limit(limit) as any;
  return data ?? [];
}

export async function resolveConflict(conflictId: string, resolution: ConflictResolution, notes?: string): Promise<void> {
  await supabase.from('immunity_rule_conflicts').update({ resolution, notes } as any).eq('id', conflictId);
}

// ═══ MESH RUNS ═══

export async function createMeshRun(mode: MeshRunMode, runWindow: string = '6h', notes?: string): Promise<string> {
  const { data } = await supabase.from('immunity_mesh_runs').insert({ mode, run_window: runWindow, notes } as any).select('id').single() as any;
  return data?.id ?? '';
}

export async function completeMeshRun(runId: string, metrics: { total_events: number; safe_fails: number; repaired: number; repair_failures: number; escalations: number }): Promise<void> {
  await supabase.from('immunity_mesh_runs').update({ ...metrics, ended_at: new Date().toISOString() } as any).eq('id', runId);
}

export async function fetchMeshRuns(limit = 20): Promise<MeshRun[]> {
  const { data } = await supabase.from('immunity_mesh_runs').select('*').order('started_at', { ascending: false }).limit(limit) as any;
  return data ?? [];
}
