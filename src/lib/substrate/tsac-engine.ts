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
  });
  return data.verification;
}

/**
 * Get aggregated TSAC stats per executor.
 */
export async function getTSACStats(): Promise<TSACExecutorStats[]> {
  const data = await callTSAC({ action: 'get_stats' });
  return data.stats ?? [];
}

/**
 * Get verification history (optionally filtered by executor).
 */
export async function getTSACHistory(executorId?: string): Promise<TSACHistoryRecord[]> {
  const data = await callTSAC({
    action: 'get_history',
    executor_id: executorId,
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
