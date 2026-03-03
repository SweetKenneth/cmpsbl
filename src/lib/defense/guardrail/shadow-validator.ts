/**
 * DEFENSE Guardrail — Shadow Mode Validation (Phase 4)
 * 
 * Before promoting any proposed rule change to live:
 *   1. Run in shadow mode — simulate impact without enforcement
 *   2. Compare simulated block/challenge/FP rates against baseline
 *   3. Gate promotion on safe deltas
 *   4. Auto-rollback if live metrics degrade beyond tolerance
 * 
 * No live config is mutated during shadow evaluation.
 */

import { guardrailLog } from './logger';
import type { ProposedAdjustment, ShadowMetrics } from './types';
import { getProposal, transitionProposal } from './proposal-store';

// ── Configuration ──────────────────────────────────────────────

export interface ShadowConfig {
  /** Minimum shadow samples before comparison is valid */
  minShadowSamples: number;
  /** Max allowed increase in false-positive rate (absolute, e.g. 0.02 = 2%) */
  maxFalsePositiveDelta: number;
  /** Max allowed increase in block rate vs baseline (absolute) */
  maxBlockRateDelta: number;
  /** Max allowed increase in challenge rate vs baseline (absolute) */
  maxChallengeRateDelta: number;
  /** How long shadow testing runs before auto-expiring (ms) */
  shadowWindowMs: number;
  /** Live metric degradation tolerance before auto-rollback (absolute FP increase) */
  rollbackFpThreshold: number;
}

const DEFAULT_CONFIG: ShadowConfig = {
  minShadowSamples: 50,
  maxFalsePositiveDelta: 0.02,    // 2% absolute increase allowed
  maxBlockRateDelta: 0.10,        // 10% absolute increase allowed
  maxChallengeRateDelta: 0.15,    // 15% absolute increase allowed
  shadowWindowMs: 15 * 60 * 1000, // 15 minutes
  rollbackFpThreshold: 0.05,      // 5% FP increase triggers rollback
};

let config: ShadowConfig = { ...DEFAULT_CONFIG };

// ── Stable Config Snapshots ────────────────────────────────────

interface ConfigSnapshot {
  id: string;
  timestamp: string;
  config: Record<string, unknown>;
  metrics: BaselineMetrics;
}

interface BaselineMetrics {
  blockRate: number;
  challengeRate: number;
  falsePositiveRate: number;
  sampleCount: number;
}

const MAX_SNAPSHOTS = 20;
const snapshots: ConfigSnapshot[] = [];
let currentBaseline: BaselineMetrics = {
  blockRate: 0,
  challengeRate: 0,
  falsePositiveRate: 0,
  sampleCount: 0,
};

// ── Shadow Sessions ────────────────────────────────────────────

interface ShadowSession {
  proposalId: string;
  startedAt: number;
  expiresAt: number;
  simulated: {
    totalEvaluated: number;
    wouldBlock: number;
    wouldChallenge: number;
    estimatedFalsePositives: number;
  };
}

const MAX_CONCURRENT_SHADOWS = 10;
const activeShadows = new Map<string, ShadowSession>();

// ── Public API ─────────────────────────────────────────────────

/**
 * Start shadow testing for a proposal.
 * The proposal must be in 'proposed' status.
 */
export function startShadowTest(proposalId: string): {
  started: boolean;
  reason: string;
} {
  // Bound concurrent sessions
  if (activeShadows.size >= MAX_CONCURRENT_SHADOWS) {
    expireOldSessions();
    if (activeShadows.size >= MAX_CONCURRENT_SHADOWS) {
      return { started: false, reason: `Max concurrent shadow sessions (${MAX_CONCURRENT_SHADOWS}) reached` };
    }
  }

  // Already running?
  if (activeShadows.has(proposalId)) {
    return { started: false, reason: 'Shadow session already active for this proposal' };
  }

  // Transition proposal to shadow_testing
  const transitioned = transitionProposal(proposalId, 'shadow_testing', 'shadow_validator');
  if (!transitioned) {
    return { started: false, reason: 'Cannot transition proposal to shadow_testing (invalid state)' };
  }

  const now = Date.now();
  activeShadows.set(proposalId, {
    proposalId,
    startedAt: now,
    expiresAt: now + config.shadowWindowMs,
    simulated: {
      totalEvaluated: 0,
      wouldBlock: 0,
      wouldChallenge: 0,
      estimatedFalsePositives: 0,
    },
  });

  guardrailLog('shadow_started', {
    proposal_id: proposalId,
    reason: 'Shadow testing initiated',
    metadata: { windowMs: config.shadowWindowMs, baseline: { ...currentBaseline } },
  });

  return { started: true, reason: 'Shadow session started' };
}

/**
 * Feed a simulated evaluation result into a shadow session.
 * Call this for each request that would have been affected by the proposed change.
 */
export function recordShadowResult(
  proposalId: string,
  result: { wouldBlock: boolean; wouldChallenge: boolean; isFalsePositive: boolean }
): void {
  const session = activeShadows.get(proposalId);
  if (!session) return;

  // Check expiry
  if (Date.now() > session.expiresAt) {
    finalizeShadowSession(proposalId, 'expired');
    return;
  }

  session.simulated.totalEvaluated++;
  if (result.wouldBlock) session.simulated.wouldBlock++;
  if (result.wouldChallenge) session.simulated.wouldChallenge++;
  if (result.isFalsePositive) session.simulated.estimatedFalsePositives++;
}

/**
 * Evaluate a shadow session and determine if the proposal is safe to promote.
 * Returns the shadow metrics and whether promotion is safe.
 */
export function evaluateShadowSession(proposalId: string): {
  safe: boolean;
  metrics: ShadowMetrics | null;
  reasons: string[];
} {
  const session = activeShadows.get(proposalId);
  if (!session) {
    return { safe: false, metrics: null, reasons: ['No active shadow session'] };
  }

  const reasons: string[] = [];
  const { simulated } = session;

  // Minimum sample check
  if (simulated.totalEvaluated < config.minShadowSamples) {
    reasons.push(`Insufficient shadow samples: ${simulated.totalEvaluated}/${config.minShadowSamples}`);
    return { safe: false, metrics: null, reasons };
  }

  // Calculate simulated rates (guard against division by zero)
  const total = Math.max(1, simulated.totalEvaluated);
  const simBlockRate = simulated.wouldBlock / total;
  const simChallengeRate = simulated.wouldChallenge / total;
  const simFpRate = simulated.estimatedFalsePositives / total;

  const metrics: ShadowMetrics = {
    simulated_block_rate: simBlockRate,
    simulated_challenge_rate: simChallengeRate,
    estimated_false_positive_rate: simFpRate,
    baseline_block_rate: currentBaseline.blockRate,
    baseline_challenge_rate: currentBaseline.challengeRate,
    baseline_false_positive_rate: currentBaseline.falsePositiveRate,
    sample_count: simulated.totalEvaluated,
  };

  // Compare against baseline
  const blockDelta = simBlockRate - currentBaseline.blockRate;
  const challengeDelta = simChallengeRate - currentBaseline.challengeRate;
  const fpDelta = simFpRate - currentBaseline.falsePositiveRate;

  if (fpDelta > config.maxFalsePositiveDelta) {
    reasons.push(
      `False positive rate increase ${(fpDelta * 100).toFixed(1)}% exceeds max ${(config.maxFalsePositiveDelta * 100).toFixed(1)}%`
    );
  }

  if (blockDelta > config.maxBlockRateDelta) {
    reasons.push(
      `Block rate increase ${(blockDelta * 100).toFixed(1)}% exceeds max ${(config.maxBlockRateDelta * 100).toFixed(1)}%`
    );
  }

  if (challengeDelta > config.maxChallengeRateDelta) {
    reasons.push(
      `Challenge rate increase ${(challengeDelta * 100).toFixed(1)}% exceeds max ${(config.maxChallengeRateDelta * 100).toFixed(1)}%`
    );
  }

  const safe = reasons.length === 0;

  guardrailLog(safe ? 'shadow_passed' : 'shadow_failed', {
    proposal_id: proposalId,
    reason: safe ? 'Shadow validation passed' : reasons.join('; '),
    metadata: { metrics, blockDelta, challengeDelta, fpDelta },
  });

  return { safe, metrics, reasons };
}

/**
 * Finalize a shadow session — either approve or reject the proposal.
 */
export function finalizeShadowSession(
  proposalId: string,
  outcome: 'approve' | 'reject' | 'expired'
): void {
  const session = activeShadows.get(proposalId);
  if (!session) return;

  activeShadows.delete(proposalId);

  if (outcome === 'approve') {
    transitionProposal(proposalId, 'approved', 'shadow_validator');
  } else if (outcome === 'reject') {
    transitionProposal(proposalId, 'rejected', 'shadow_validator');
  } else {
    transitionProposal(proposalId, 'expired', 'shadow_validator');
  }

  guardrailLog('shadow_finalized', {
    proposal_id: proposalId,
    reason: `Shadow session finalized: ${outcome}`,
    final_value: outcome,
    metadata: { ...session.simulated },
  });
}

// ── Baseline & Snapshots ───────────────────────────────────────

/**
 * Update the current baseline metrics (call periodically with real production data).
 */
export function updateBaseline(metrics: BaselineMetrics): void {
  // Validate
  const sanitized: BaselineMetrics = {
    blockRate: Math.max(0, Math.min(1, metrics.blockRate)),
    challengeRate: Math.max(0, Math.min(1, metrics.challengeRate)),
    falsePositiveRate: Math.max(0, Math.min(1, metrics.falsePositiveRate)),
    sampleCount: Math.max(0, metrics.sampleCount),
  };

  currentBaseline = sanitized;

  guardrailLog('baseline_updated', {
    reason: 'Production baseline metrics updated',
    final_value: sanitized,
    metadata: { sampleCount: sanitized.sampleCount },
  });
}

/**
 * Save a point-in-time config snapshot for rollback.
 */
export function saveConfigSnapshot(
  id: string,
  currentConfig: Record<string, unknown>
): void {
  // Evict oldest if at capacity
  if (snapshots.length >= MAX_SNAPSHOTS) {
    snapshots.shift();
  }

  snapshots.push({
    id,
    timestamp: new Date().toISOString(),
    config: structuredClone(currentConfig),
    metrics: { ...currentBaseline },
  });

  guardrailLog('snapshot_saved', {
    reason: `Config snapshot "${id}" saved`,
    metadata: { totalSnapshots: snapshots.length },
  });
}

/**
 * Get the most recent stable config snapshot for rollback.
 */
export function getLastStableSnapshot(): ConfigSnapshot | null {
  return snapshots.length > 0 ? { ...snapshots[snapshots.length - 1] } : null;
}

/**
 * Check if live metrics have degraded beyond tolerance and trigger rollback.
 * Call this periodically with real-time production metrics.
 */
export function checkRollbackCondition(liveMetrics: BaselineMetrics): {
  shouldRollback: boolean;
  snapshot: ConfigSnapshot | null;
  reason: string;
} {
  const fpDelta = liveMetrics.falsePositiveRate - currentBaseline.falsePositiveRate;

  if (fpDelta > config.rollbackFpThreshold) {
    const snapshot = getLastStableSnapshot();

    guardrailLog('rollback_triggered', {
      reason: `Live FP rate degraded by ${(fpDelta * 100).toFixed(1)}% (threshold: ${(config.rollbackFpThreshold * 100).toFixed(1)}%)`,
      previous_value: currentBaseline.falsePositiveRate,
      proposed_value: liveMetrics.falsePositiveRate,
      metadata: {
        snapshotId: snapshot?.id ?? 'none',
        liveMetrics,
      },
    });

    return {
      shouldRollback: true,
      snapshot,
      reason: `FP rate increase ${(fpDelta * 100).toFixed(1)}% exceeds rollback threshold`,
    };
  }

  return { shouldRollback: false, snapshot: null, reason: 'Metrics within tolerance' };
}

// ── Maintenance ────────────────────────────────────────────────

/**
 * Expire stale shadow sessions.
 */
function expireOldSessions(): void {
  const now = Date.now();
  for (const [id, session] of activeShadows) {
    if (now > session.expiresAt) {
      finalizeShadowSession(id, 'expired');
    }
  }
}

/**
 * Configure shadow validation settings.
 */
export function configureShadowMode(partial: Partial<ShadowConfig>): void {
  config = {
    ...config,
    ...partial,
    minShadowSamples: Math.max(5, Math.min(10000, partial.minShadowSamples ?? config.minShadowSamples)),
    maxFalsePositiveDelta: Math.max(0.001, Math.min(0.5, partial.maxFalsePositiveDelta ?? config.maxFalsePositiveDelta)),
    maxBlockRateDelta: Math.max(0.01, Math.min(0.5, partial.maxBlockRateDelta ?? config.maxBlockRateDelta)),
    maxChallengeRateDelta: Math.max(0.01, Math.min(0.5, partial.maxChallengeRateDelta ?? config.maxChallengeRateDelta)),
    shadowWindowMs: Math.max(60_000, Math.min(60 * 60 * 1000, partial.shadowWindowMs ?? config.shadowWindowMs)),
    rollbackFpThreshold: Math.max(0.005, Math.min(0.5, partial.rollbackFpThreshold ?? config.rollbackFpThreshold)),
  };
}

/**
 * Get active shadow session count and IDs.
 */
export function getActiveShadowSessions(): Array<{ proposalId: string; samplesCollected: number; expiresIn: number }> {
  const now = Date.now();
  expireOldSessions();
  return [...activeShadows.values()].map(s => ({
    proposalId: s.proposalId,
    samplesCollected: s.simulated.totalEvaluated,
    expiresIn: Math.max(0, s.expiresAt - now),
  }));
}

/**
 * Clear all shadow state (testing only).
 */
export function clearShadowState(): void {
  activeShadows.clear();
  snapshots.length = 0;
  currentBaseline = { blockRate: 0, challengeRate: 0, falsePositiveRate: 0, sampleCount: 0 };
  config = { ...DEFAULT_CONFIG };
}
