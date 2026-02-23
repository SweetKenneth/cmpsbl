/**
 * TSAC Engine — Client-Side Interface
 * Task-Specific Acceptance Criteria verification system
 * 
 * Based on:
 * - Sol-Ver (Self-Play Solver-Verifier) — Meta/UCSD 2025
 * - SWE-bench FAIL_TO_PASS methodology — Princeton/OpenAI
 * - VeriGuard dual-stage verification — Google Cloud AI 2025
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────────

export interface AcceptanceCriterion {
  id: string;
  description: string;
  type: 'behavioral' | 'structural' | 'semantic' | 'regression';
  assertion: string;
  priority: 'critical' | 'important' | 'nice_to_have';
}

export interface CriterionResult {
  criterion_id: string;
  passed: boolean;
  explanation: string;
}

export interface TSACVerification {
  task_id: string;
  verdict: 'pass' | 'fail' | 'partial';
  intent_score: number;
  quality_score: number;
  reasoning: string;
  criteria: AcceptanceCriterion[];
  criteria_results: CriterionResult[];
  quality_checks: Array<{ name: string; passed: boolean; message: string }>;
}

export interface TSACExecutorStats {
  executor_id: string;
  source: string;
  total_verifications: number;
  pass_count: number;
  fail_count: number;
  partial_count: number;
  avg_intent_score: number | null;
  avg_quality_score: number | null;
  pass_rate: number | null;
  last_verified: string | null;
}

export interface TSACHistoryRecord {
  id: string;
  task_id: string;
  executor_id: string;
  task_description: string;
  acceptance_criteria: AcceptanceCriterion[];
  criteria_results: CriterionResult[];
  intent_match_score: number | null;
  intent_match_reasoning: string | null;
  code_quality_score: number | null;
  overall_verdict: string;
  source: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ── API Calls ──────────────────────────────────────────────

async function callTSAC(body: Record<string, unknown>): Promise<any> {
  const { data, error } = await supabase.functions.invoke('pf-tsac-verify', { body });
  if (error) throw new Error(`TSAC function error: ${error.message}`);
  return data;
}

/**
 * Generate acceptance criteria for a task BEFORE execution.
 * This is the "test-first" approach from Sol-Ver.
 */
export async function generateCriteria(
  taskDescription: string,
  context?: string,
): Promise<AcceptanceCriterion[]> {
  const data = await callTSAC({
    action: 'generate_criteria',
    task_description: taskDescription,
    context,
  });
  return data.criteria;
}

/**
 * Judge whether a code diff matches the task intent.
 * LLM-as-Judge pattern from SWE-bench methodology.
 */
export async function judgeIntent(
  taskDescription: string,
  codeDiff: string,
  criteria: AcceptanceCriterion[],
): Promise<{
  score: number;
  verdict: 'pass' | 'fail' | 'partial';
  reasoning: string;
  criteria_results: CriterionResult[];
}> {
  const data = await callTSAC({
    action: 'judge_intent',
    task_description: taskDescription,
    code_diff: codeDiff,
    criteria,
  });
  return data.judgment;
}

/**
 * Full verification pipeline — generate criteria + static check + intent judge.
 * This is the production entry point for verifying executor/ENCODE output.
 */
export async function fullVerify(params: {
  taskDescription: string;
  codeDiff: string;
  code?: string;
  taskId?: string;
  executorId?: string;
  source?: 'executor' | 'encode' | 'shadow' | 'manual';
  context?: string;
  evolutionRunId?: string;
}): Promise<TSACVerification> {
  const data = await callTSAC({
    action: 'full_verify',
    task_description: params.taskDescription,
    code_diff: params.codeDiff,
    code: params.code,
    task_id: params.taskId,
    executor_id: params.executorId,
    source: params.source ?? 'executor',
    context: params.context,
    evolution_run_id: params.evolutionRunId,
  });
  return data.verification;
}

// ── Evolution Pipeline TSAC Actions ───────────────────────

/**
 * Layer 1: Generate acceptance criteria BEFORE code execution.
 * Called when an evolution proposal is created.
 */
export async function evolutionPreVerify(
  taskDescription: string,
  evolutionRunId: string,
  context?: string,
): Promise<{ criteria: AcceptanceCriterion[]; criteriaCount: number }> {
  const data = await callTSAC({
    action: 'evolution_pre_verify',
    task_description: taskDescription,
    evolution_run_id: evolutionRunId,
    context,
  });
  return { criteria: data.criteria, criteriaCount: data.criteria_count };
}

/**
 * Layer 2: Verify shadow-applied code against pre-generated criteria.
 * Called after shadow-apply, gates production promotion.
 */
export async function evolutionShadowVerify(params: {
  taskDescription: string;
  codeDiff: string;
  evolutionRunId: string;
  executorId?: string;
}): Promise<{
  verdict: string;
  intentScore: number;
  qualityScore: number;
  reasoning: string;
  blocked: boolean;
  criteriaResults: CriterionResult[];
}> {
  const data = await callTSAC({
    action: 'evolution_shadow_verify',
    task_description: params.taskDescription,
    code_diff: params.codeDiff,
    evolution_run_id: params.evolutionRunId,
    executor_id: params.executorId,
  });
  return {
    verdict: data.verdict,
    intentScore: data.intent_score,
    qualityScore: data.quality_score,
    reasoning: data.reasoning,
    blocked: data.blocked,
    criteriaResults: data.criteria_results,
  };
}

/**
 * Layer 3: Re-verify in production with drift detection.
 * Called after production-apply, triggers rollback if critical drift detected.
 */
export async function evolutionProductionVerify(params: {
  taskDescription: string;
  codeDiff: string;
  evolutionRunId: string;
  executorId?: string;
  productionContext?: string;
}): Promise<{
  verdict: string;
  intentScore: number;
  drift: { detected: boolean; severity: string; details: string; recommendedAction: string };
  shouldRollback: boolean;
  shadowComparison: { shadowScore: number; productionScore: number; scoreDelta: number };
}> {
  const data = await callTSAC({
    action: 'evolution_production_verify',
    task_description: params.taskDescription,
    code_diff: params.codeDiff,
    evolution_run_id: params.evolutionRunId,
    executor_id: params.executorId,
    production_context: params.productionContext,
  });
  return {
    verdict: data.verdict,
    intentScore: data.intent_score,
    drift: data.drift,
    shouldRollback: data.should_rollback,
    shadowComparison: data.shadow_comparison,
  };
}

/**
 * Get TSAC training feedback for executor learning pipeline.
 */
export async function getTSACTrainingFeedback(executorId?: string): Promise<any[]> {
  const data = await callTSAC({
    action: 'get_training_feedback',
    executor_id: executorId,
  });
  return data.feedback ?? [];
}

/**
 * Get aggregated TSAC stats per executor.
 */
export async function getTSACStats(): Promise<TSACExecutorStats[]> {
  const data = await callTSAC({ action: 'get_stats' });
  return data.stats ?? [];
}

/**
 * Get verification history (optionally filtered by executor or evolution run).
 */
export async function getTSACHistory(executorId?: string, evolutionRunId?: string): Promise<TSACHistoryRecord[]> {
  const data = await callTSAC({
    action: 'get_history',
    executor_id: executorId,
    evolution_run_id: evolutionRunId,
  });
  return data.verifications ?? [];
}

// ── Verdict Helpers ────────────────────────────────────────

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'pass': return 'text-emerald-400';
    case 'fail': return 'text-red-400';
    case 'partial': return 'text-amber-400';
    default: return 'text-muted-foreground';
  }
}

export function getVerdictEmoji(verdict: string): string {
  switch (verdict) {
    case 'pass': return '✅';
    case 'fail': return '❌';
    case 'partial': return '⚠️';
    default: return '⏳';
  }
}

export function getScoreGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A', color: 'text-emerald-400' };
  if (score >= 75) return { grade: 'B', color: 'text-blue-400' };
  if (score >= 60) return { grade: 'C', color: 'text-amber-400' };
  if (score >= 40) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}
