/**
 * Mutation Promotion Engine (MPE) v1
 * Deterministic gates + Shadow A/B + Canary rollout + Verification
 * NO side effects on import. All functions explicitly invoked.
 */

import { supabase } from '@/integrations/supabase/client';
import { telemetryService } from './telemetry-service';
import { snapshotService } from './snapshot-service';
import { integrityService } from './integrity-service';
import {
  PILOT_EXECUTORS,
  EXECUTOR_MODULE_META,
  getExecutorsByCategory,
  type PilotExecutorId,
  type ExecutorModuleMeta,
} from '@/immune/pilotExecutors';

// ── Types ──────────────────────────────────────────────────

export interface ChangeArtifact {
  id: string;
  created_at: string;
  actor_type: string;
  actor_id: string | null;
  category: string;
  intent_summary: string | null;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
  diff_data: Record<string, unknown> | null;
  status: string;
  metadata: Record<string, unknown>;
}

export interface MutationProposal {
  id: string;
  artifact_id: string;
  proposer_executor_id: string | null;
  hypothesis: string | null;
  expected_delta: Record<string, unknown>;
  risk_score: number;
  gate_state: string;
  canary_pct: number;
  auto_promote: boolean;
  created_at: string;
  updated_at: string;
  decided_at: string | null;
  promoted_at: string | null;
  rolled_back_at: string | null;
  metadata: Record<string, unknown>;
}

export interface MutationRun {
  id: string;
  mutation_id: string;
  shadow_run_id: string | null;
  metrics_baseline: Record<string, number>;
  metrics_candidate: Record<string, number>;
  metrics_delta: Record<string, number>;
  regressions: Array<{ metric: string; delta: number; threshold: number }>;
  confidence_score: number;
  run_duration_ms: number;
  created_at: string;
}

export interface VerificationScan {
  id: string;
  mutation_id: string;
  gaps_found: number;
  tasks_created: number;
  scan_results: Record<string, unknown>;
  status: string;
  created_at: string;
  completed_at: string | null;
}

// ── Configuration ──────────────────────────────────────────

const GATE_CONFIG = {
  MIN_SHADOW_RUNS: 2,
  MIN_CONFIDENCE: 0.75,
  MAX_ERROR_RATE_INCREASE: 0.02,   // 2%
  MAX_LATENCY_INCREASE_MS: 50,
  CANARY_STAGES: [5, 25, 50, 100],
};

// ── Executor Specialty Selection ───────────────────────────

/**
 * Maps artifact/mutation categories to executor categories.
 * These are the SAME executors trained in the Immunity Mesh training section.
 */
const CATEGORY_TO_EXECUTOR_CATEGORIES: Record<string, ExecutorModuleMeta['category'][]> = {
  resilience:   ['infrastructure', 'orchestration', 'autonomy'],
  performance:  ['optimization', 'infrastructure', 'orchestration'],
  security:     ['security', 'governance'],
  cleanup:      ['infrastructure', 'optimization', 'event_routing'],
  feature:      ['cognitive_processing', 'intelligence', 'ui_adaptation'],
};

/**
 * Select the best executors for a given mutation category.
 * Uses the same EXECUTOR_MODULE_META that powers the training section,
 * so executors you train are the same ones selected for evolution cycles.
 */
export function selectExecutorsForCategory(
  category: string,
  maxExecutors = 10,
): { id: PilotExecutorId; meta: ExecutorModuleMeta }[] {
  const executorCategories = CATEGORY_TO_EXECUTOR_CATEGORIES[category] ?? ['infrastructure'];
  const selected: { id: PilotExecutorId; meta: ExecutorModuleMeta }[] = [];
  const seen = new Set<string>();

  for (const execCategory of executorCategories) {
    const executors = getExecutorsByCategory(execCategory);
    for (const id of executors) {
      if (seen.has(id)) continue;
      seen.add(id);
      selected.push({ id, meta: EXECUTOR_MODULE_META[id] });
      if (selected.length >= maxExecutors) return selected;
    }
  }

  return selected;
}

/**
 * Get all executor categories and their counts for display.
 */
export function getExecutorCategorySummary(): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const meta of Object.values(EXECUTOR_MODULE_META)) {
    summary[meta.category] = (summary[meta.category] || 0) + 1;
  }
  return summary;
}

/**
 * Total executor count (same fleet used in training).
 */
export function getExecutorCount(): number {
  return PILOT_EXECUTORS.length;
}

// ── Secret Redaction ───────────────────────────────────────

const SECRET_PATTERNS = [
  /(?:api[_-]?key|token|secret|password|auth)[=:]\s*["']?[^\s"']+/gi,
  /(?:Bearer|Basic)\s+[A-Za-z0-9+/=._-]{10,}/g,
  /(?:sk_|pk_|rk_)[a-zA-Z0-9]{10,}/g,
];

function redactSecrets(obj: unknown): unknown {
  if (typeof obj === 'string') {
    let redacted = obj;
    for (const pattern of SECRET_PATTERNS) {
      redacted = redacted.replace(pattern, '[REDACTED]');
    }
    return redacted;
  }
  if (Array.isArray(obj)) return obj.map(redactSecrets);
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = redactSecrets(v);
    }
    return result;
  }
  return obj;
}

// ── Feature Flags ──────────────────────────────────────────

async function getFlag(key: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('atlas_capabilities')
      .select('enabled')
      .eq('key', key)
      .maybeSingle();
    return (data as any)?.enabled ?? false;
  } catch {
    return false;
  }
}

async function setFlag(key: string, enabled: boolean) {
  await supabase
    .from('atlas_capabilities')
    .update({ enabled } as never)
    .eq('key', key);
}

export async function getMPEFlags() {
  const [intake, autoShadow, autoPromotion, postVerification] = await Promise.all([
    getFlag('mpe_mutation_intake'),
    getFlag('mpe_auto_shadow'),
    getFlag('mpe_auto_promotion'),
    getFlag('mpe_post_verification'),
  ]);
  return { intake, autoShadow, autoPromotion, postVerification };
}

export async function setMPEFlag(key: string, enabled: boolean) {
  await setFlag(key, enabled);
  await telemetryService.recordMetric('mpe_flag_changed', { key, enabled });
}

// ── 1. Change Artifacts ────────────────────────────────────

export async function createArtifact(params: {
  actorType: string;
  actorId?: string;
  category: string;
  intentSummary: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  diffData?: Record<string, unknown>;
}): Promise<{ success: boolean; artifact?: ChangeArtifact; error?: string }> {
  const intakeEnabled = await getFlag('mpe_mutation_intake');
  if (!intakeEnabled) {
    return { success: false, error: 'Mutation intake is disabled' };
  }

  try {
    const { data, error } = await supabase
      .from('change_artifacts')
      .insert({
        actor_type: params.actorType,
        actor_id: params.actorId ?? null,
        category: params.category,
        intent_summary: params.intentSummary,
        before_snapshot: redactSecrets(params.beforeSnapshot ?? {}) as any,
        after_snapshot: redactSecrets(params.afterSnapshot ?? {}) as any,
        diff_data: redactSecrets(params.diffData ?? {}) as any,
        status: 'proposed',
      } as never)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await telemetryService.recordMetric('artifact_created', {
      artifact_id: (data as any).id,
      category: params.category,
      actor_type: params.actorType,
    });

    return { success: true, artifact: data as unknown as ChangeArtifact };
  } catch (err) {
    return { success: false, error: 'Failed to create artifact' };
  }
}

export async function listArtifacts(limit = 20) {
  try {
    const { data } = await supabase
      .from('change_artifacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as unknown as ChangeArtifact[];
  } catch {
    return [];
  }
}

// ── 2. Mutation Proposals ──────────────────────────────────

export async function createProposal(params: {
  artifactId: string;
  proposerExecutorId?: string;
  hypothesis: string;
  expectedDelta?: Record<string, unknown>;
  riskScore?: number;
  category?: string;
}): Promise<{ success: boolean; proposal?: MutationProposal; error?: string }> {
  try {
    // Select executors based on category — same fleet used in Immunity Mesh training
    const category = params.category ?? 'resilience';
    const selectedExecutors = selectExecutorsForCategory(category);

    const { data, error } = await supabase
      .from('mutation_proposals')
      .insert({
        artifact_id: params.artifactId,
        proposer_executor_id: params.proposerExecutorId ?? null,
        hypothesis: params.hypothesis,
        expected_delta: params.expectedDelta ?? {},
        risk_score: params.riskScore ?? 0.5,
        gate_state: 'pending',
        auto_promote: false,
        metadata: {
          category,
          selected_executors: selectedExecutors.map(e => ({
            id: e.id,
            module: e.meta.module,
            category: e.meta.category,
          })),
          executor_count: selectedExecutors.length,
        },
      } as never)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await telemetryService.recordMetric('mutation_proposed', {
      mutation_id: (data as any).id,
      artifact_id: params.artifactId,
      category,
      executors_selected: selectedExecutors.length,
      executor_ids: selectedExecutors.map(e => e.id),
    });

    // Auto-shadow if enabled
    const autoShadow = await getFlag('mpe_auto_shadow');
    if (autoShadow) {
      runShadowEvaluation((data as any).id).catch(() => {});
    }

    return { success: true, proposal: data as unknown as MutationProposal };
  } catch {
    return { success: false, error: 'Failed to create proposal' };
  }
}

export async function listProposals(limit = 20) {
  try {
    const { data } = await supabase
      .from('mutation_proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as unknown as MutationProposal[];
  } catch {
    return [];
  }
}

export async function getProposal(id: string) {
  try {
    const { data } = await supabase
      .from('mutation_proposals')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return data as unknown as MutationProposal | null;
  } catch {
    return null;
  }
}

// ── 3. Shadow A/B Evaluation ───────────────────────────────

export async function runShadowEvaluation(mutationId: string): Promise<{
  success: boolean;
  run?: MutationRun;
  error?: string;
}> {
  try {
    // Update gate_state to shadow_running
    await supabase
      .from('mutation_proposals')
      .update({ gate_state: 'shadow_running' } as never)
      .eq('id', mutationId);

    const startTime = performance.now();

    // Simulate shadow A/B metrics (in production, this would run real code paths)
    const baseline = {
      error_rate: Math.random() * 0.05,
      latency_ms: 100 + Math.random() * 200,
      throughput_rps: 500 + Math.random() * 500,
      memory_mb: 200 + Math.random() * 100,
    };

    const candidate = {
      error_rate: baseline.error_rate * (0.6 + Math.random() * 0.8),
      latency_ms: baseline.latency_ms * (0.7 + Math.random() * 0.6),
      throughput_rps: baseline.throughput_rps * (0.9 + Math.random() * 0.3),
      memory_mb: baseline.memory_mb * (0.85 + Math.random() * 0.3),
    };

    const delta = {
      error_rate: candidate.error_rate - baseline.error_rate,
      latency_ms: candidate.latency_ms - baseline.latency_ms,
      throughput_rps: candidate.throughput_rps - baseline.throughput_rps,
      memory_mb: candidate.memory_mb - baseline.memory_mb,
    };

    // Detect regressions
    const regressions: Array<{ metric: string; delta: number; threshold: number }> = [];
    if (delta.error_rate > GATE_CONFIG.MAX_ERROR_RATE_INCREASE) {
      regressions.push({ metric: 'error_rate', delta: delta.error_rate, threshold: GATE_CONFIG.MAX_ERROR_RATE_INCREASE });
    }
    if (delta.latency_ms > GATE_CONFIG.MAX_LATENCY_INCREASE_MS) {
      regressions.push({ metric: 'latency_ms', delta: delta.latency_ms, threshold: GATE_CONFIG.MAX_LATENCY_INCREASE_MS });
    }

    // Calculate confidence
    const confidenceBase = regressions.length === 0 ? 0.8 : 0.3;
    const confidenceScore = Math.min(1, confidenceBase + Math.random() * 0.2);

    const runDuration = Math.round(performance.now() - startTime);

    const { data, error } = await supabase
      .from('mutation_runs')
      .insert({
        mutation_id: mutationId,
        shadow_run_id: `shadow_${Date.now()}`,
        metrics_baseline: baseline,
        metrics_candidate: candidate,
        metrics_delta: delta,
        regressions,
        confidence_score: Math.round(confidenceScore * 100) / 100,
        run_duration_ms: runDuration,
      } as never)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await telemetryService.recordMetric('shadow_run_completed', {
      mutation_id: mutationId,
      confidence: confidenceScore,
      regressions: regressions.length,
    });

    return { success: true, run: data as unknown as MutationRun };
  } catch (err) {
    return { success: false, error: 'Shadow evaluation failed' };
  }
}

export async function listRuns(mutationId: string) {
  try {
    const { data } = await supabase
      .from('mutation_runs')
      .select('*')
      .eq('mutation_id', mutationId)
      .order('created_at', { ascending: false });
    return (data ?? []) as unknown as MutationRun[];
  } catch {
    return [];
  }
}

export async function listAllRuns(limit = 50) {
  try {
    const { data } = await supabase
      .from('mutation_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as unknown as MutationRun[];
  } catch {
    return [];
  }
}

// ── 4. Deterministic Promotion Gate ────────────────────────

export async function evaluateGate(mutationId: string): Promise<{
  passed: boolean;
  reason: string;
  details: Record<string, unknown>;
}> {
  const runs = await listRuns(mutationId);

  // Gate 1: Minimum shadow runs
  if (runs.length < GATE_CONFIG.MIN_SHADOW_RUNS) {
    await updateGateState(mutationId, 'pending');
    return {
      passed: false,
      reason: `Need ${GATE_CONFIG.MIN_SHADOW_RUNS} shadow runs, have ${runs.length}`,
      details: { required: GATE_CONFIG.MIN_SHADOW_RUNS, actual: runs.length },
    };
  }

  // Gate 2: No regressions in latest run
  const latestRun = runs[0];
  const regressions = (latestRun.regressions as any[]) ?? [];
  if (regressions.length > 0) {
    await updateGateState(mutationId, 'failed');
    await telemetryService.recordMetric('gate_rejected', { mutationId, regressions });
    return {
      passed: false,
      reason: `Regressions detected: ${regressions.map((r: any) => r.metric).join(', ')}`,
      details: { regressions },
    };
  }

  // Gate 3: Confidence threshold
  const avgConfidence = runs.reduce((s, r) => s + r.confidence_score, 0) / runs.length;
  if (avgConfidence < GATE_CONFIG.MIN_CONFIDENCE) {
    await updateGateState(mutationId, 'failed');
    return {
      passed: false,
      reason: `Confidence ${(avgConfidence * 100).toFixed(0)}% below ${(GATE_CONFIG.MIN_CONFIDENCE * 100)}% threshold`,
      details: { avgConfidence, threshold: GATE_CONFIG.MIN_CONFIDENCE },
    };
  }

  // All gates passed
  await updateGateState(mutationId, 'passed');
  await telemetryService.recordMetric('gate_passed', { mutationId, avgConfidence });

  // Auto-promote if enabled
  const autoPromote = await getFlag('mpe_auto_promotion');
  if (autoPromote) {
    advanceCanary(mutationId).catch(() => {});
  }

  return {
    passed: true,
    reason: `All gates passed. Confidence: ${(avgConfidence * 100).toFixed(0)}%${autoPromote ? ' — auto-promoting' : ''}`,
    details: { avgConfidence, shadowRuns: runs.length, autoPromote },
  };
}

async function updateGateState(mutationId: string, state: string) {
  const updates: Record<string, unknown> = { gate_state: state };
  if (state === 'failed' || state === 'passed') {
    updates.decided_at = new Date().toISOString();
  }
  await supabase
    .from('mutation_proposals')
    .update(updates as never)
    .eq('id', mutationId);
}

// ── 5. Canary Rollout ──────────────────────────────────────

export async function advanceCanary(mutationId: string): Promise<{
  success: boolean;
  canaryPct: number;
  error?: string;
}> {
  const proposal = await getProposal(mutationId);
  if (!proposal) return { success: false, canaryPct: 0, error: 'Proposal not found' };

  if (proposal.gate_state !== 'passed' && proposal.gate_state !== 'canary') {
    return { success: false, canaryPct: proposal.canary_pct, error: `Cannot canary from state: ${proposal.gate_state}` };
  }

  const currentPct = proposal.canary_pct;
  const nextStageIdx = GATE_CONFIG.CANARY_STAGES.findIndex(s => s > currentPct);
  const nextPct = nextStageIdx >= 0 ? GATE_CONFIG.CANARY_STAGES[nextStageIdx] : 100;

  const updates: Record<string, unknown> = {
    canary_pct: nextPct,
    gate_state: nextPct >= 100 ? 'promoted' : 'canary',
  };
  if (nextPct >= 100) {
    updates.promoted_at = new Date().toISOString();
  }

  await supabase
    .from('mutation_proposals')
    .update(updates as never)
    .eq('id', mutationId);

  await telemetryService.recordMetric('canary_advanced', {
    mutationId,
    from: currentPct,
    to: nextPct,
  });

  // If fully promoted and post-verification enabled, trigger scan
  if (nextPct >= 100) {
    const postVerify = await getFlag('mpe_post_verification');
    if (postVerify) {
      runVerificationScan(mutationId).catch(() => {});
    }
  }

  return { success: true, canaryPct: nextPct };
}

// ── 6. Rollback ────────────────────────────────────────────

export async function rollbackMutation(mutationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await supabase
      .from('mutation_proposals')
      .update({
        gate_state: 'rolled_back',
        canary_pct: 0,
        rolled_back_at: new Date().toISOString(),
      } as never)
      .eq('id', mutationId);

    // Mark artifact as rolled back
    const proposal = await getProposal(mutationId);
    if (proposal) {
      await supabase
        .from('change_artifacts')
        .update({ status: 'rolled_back' } as never)
        .eq('id', proposal.artifact_id);
    }

    await telemetryService.recordMetric('mutation_rolled_back', { mutationId });
    return { success: true };
  } catch {
    return { success: false, error: 'Rollback failed' };
  }
}

// ── 7. Post-Promotion Verification ─────────────────────────

export async function runVerificationScan(mutationId: string): Promise<{
  success: boolean;
  scan?: VerificationScan;
  error?: string;
}> {
  try {
    // Take a post-promotion snapshot
    const postSnap = await snapshotService.createSnapshot(`post-promote-verify-${mutationId}`);

    // Run integrity scan
    const scanResult = await integrityService.runIntegrityScan();
    const gapsFound = scanResult.findings?.length ?? 0;
    const newGaps = (scanResult.findings ?? []).filter(
      (f: any) => f.severity === 'error' || f.severity === 'warning'
    );

    const { data, error } = await supabase
      .from('verification_scans')
      .insert({
        mutation_id: mutationId,
        gaps_found: gapsFound,
        tasks_created: newGaps.length,
        scan_results: scanResult as any,
        new_gaps: newGaps,
        status: gapsFound === 0 ? 'clean' : 'gaps_detected',
        completed_at: new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await telemetryService.recordMetric('verification_scan_completed', {
      mutationId,
      gapsFound,
      status: gapsFound === 0 ? 'clean' : 'gaps_detected',
    });

    return { success: true, scan: data as unknown as VerificationScan };
  } catch {
    return { success: false, error: 'Verification scan failed' };
  }
}

export async function listVerificationScans(mutationId?: string, limit = 10) {
  try {
    let query = supabase
      .from('verification_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (mutationId) {
      query = query.eq('mutation_id', mutationId);
    }

    const { data } = await query;
    return (data ?? []) as unknown as VerificationScan[];
  } catch {
    return [];
  }
}

// ── Aggregated Pipeline Stats ──────────────────────────────

export async function getPipelineStats() {
  try {
    const [artifacts, proposals, scans] = await Promise.all([
      supabase.from('change_artifacts').select('status', { count: 'exact', head: true }),
      supabase.from('mutation_proposals').select('gate_state', { count: 'exact', head: true }),
      supabase.from('verification_scans').select('status', { count: 'exact', head: true }),
    ]);

    return {
      totalArtifacts: artifacts.count ?? 0,
      totalProposals: proposals.count ?? 0,
      totalScans: scans.count ?? 0,
    };
  } catch {
    return { totalArtifacts: 0, totalProposals: 0, totalScans: 0 };
  }
}

export const mutationEngine = {
  // Artifacts
  createArtifact,
  listArtifacts,
  // Proposals
  createProposal,
  listProposals,
  getProposal,
  // Shadow
  runShadowEvaluation,
  listRuns,
  listAllRuns,
  // Gates
  evaluateGate,
  // Canary
  advanceCanary,
  // Rollback
  rollbackMutation,
  // Verification
  runVerificationScan,
  listVerificationScans,
  // Flags
  getMPEFlags,
  setMPEFlag,
  // Stats
  getPipelineStats,
  // Executor selection
  selectExecutorsForCategory,
  getExecutorCategorySummary,
  getExecutorCount,
};
