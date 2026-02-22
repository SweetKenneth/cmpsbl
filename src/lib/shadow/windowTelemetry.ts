/**
 * Shadow Mesh — Phase 1 Rolling Window Telemetry (v1.0)
 * 
 * Aggregates shadow probe metrics per 20-minute windows with:
 * - Per-executor anomaly scores
 * - Failure signature detection + deterministic candidate flagging
 * - Cross-executor cascade detection (within 500ms)
 * - Trend tracking across windows
 * - Auto-rule generation when signature hits ≥50 threshold
 */

import { log } from '@/lib/system/log';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { contributeRule } from '@/immune/shared-rule-registry';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface FailureSignature {
  pattern: string;
  executor: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  deterministicCandidate: boolean;
  ruleGenerated: boolean;
}

export interface CascadeEvent {
  sourceExecutor: string;
  targetExecutor: string;
  sourceTimestamp: number;
  targetTimestamp: number;
  delayMs: number;
  sourceError: string;
  targetError: string;
}

export interface WindowLog {
  windowId: string;
  windowStart: number;
  windowEnd: number;
  executorCount: number;
  totalRuns: number;
  repairAttemptRate: number;
  repairSuccessRate: number;
  retryRate: number;
  escalationRate: number;
  safeFailRate: number;
  topFailureSignatures: FailureSignature[];
  perExecutorAnomaly: Record<string, number>;
  cascadeFrequency: number;
  cascadeEvents: CascadeEvent[];
  deterministicHitCount: number;
  adaptiveHitCount: number;
  trend: {
    repairRateDelta: number;
    escalationRateDelta: number;
    deterministicShift: number; // positive = more deterministic, negative = more adaptive
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════════════════

const WINDOW_DURATION_MS = 20 * 60 * 1000; // 20 minutes
const MAX_WINDOW_HISTORY = 50;
const DETERMINISTIC_CANDIDATE_THRESHOLD = 25;
const AUTO_RULE_THRESHOLD = 50;

/** Rolling window logs */
const windowLogs: WindowLog[] = [];

/** Current window state (accumulates until flush) */
let currentWindow: {
  start: number;
  perExecutor: Map<string, {
    totalRuns: number;
    repairAttempts: number;
    repairSuccesses: number;
    retries: number;
    escalations: number;
    safeFails: number;
    deterministicHits: number;
    adaptiveHits: number;
  }>;
  failureSignatures: Map<string, FailureSignature>;
  cascadeEvents: CascadeEvent[];
  recentFailures: Array<{ executor: string; timestamp: number; error: string }>;
} | null = null;

function ensureCurrentWindow(): NonNullable<typeof currentWindow> {
  const now = Date.now();
  if (!currentWindow || now - currentWindow.start >= WINDOW_DURATION_MS) {
    // Flush old window first
    if (currentWindow) {
      flushWindow();
    }
    currentWindow = {
      start: now,
      perExecutor: new Map(),
      failureSignatures: new Map(),
      cascadeEvents: [],
      recentFailures: [],
    };
  }
  return currentWindow;
}

function getExecutorStats(w: NonNullable<typeof currentWindow>, executor: string) {
  let stats = w.perExecutor.get(executor);
  if (!stats) {
    stats = { totalRuns: 0, repairAttempts: 0, repairSuccesses: 0, retries: 0, escalations: 0, safeFails: 0, deterministicHits: 0, adaptiveHits: 0 };
    w.perExecutor.set(executor, stats);
  }
  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════
// Recording API
// ═══════════════════════════════════════════════════════════════════════════

export function recordWindowProbeResult(
  executor: string,
  outcome: 'success' | 'repaired' | 'escalated' | 'failed_safe',
  repairType?: string | null,
  error?: string,
) {
  const w = ensureCurrentWindow();
  const stats = getExecutorStats(w, executor);
  stats.totalRuns++;

  switch (outcome) {
    case 'repaired':
      stats.repairAttempts++;
      stats.repairSuccesses++;
      stats.retries++;
      break;
    case 'escalated':
      stats.repairAttempts++;
      stats.escalations++;
      break;
    case 'failed_safe':
      stats.safeFails++;
      break;
    // success: nothing extra
  }

  // Track deterministic vs adaptive hits
  if (repairType) {
    if (repairType.startsWith('DETERMINISTIC') || repairType.includes('SEED') || repairType.includes('SR_')) {
      stats.deterministicHits++;
    } else {
      stats.adaptiveHits++;
    }
  }

  // Track failure signatures for deterministic candidate detection
  if (error && (outcome === 'escalated' || outcome === 'failed_safe')) {
    const sigKey = `${executor}::${normalizeErrorSignature(error)}`;
    const existing = w.failureSignatures.get(sigKey);
    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();
      if (existing.count >= DETERMINISTIC_CANDIDATE_THRESHOLD) {
        existing.deterministicCandidate = true;
      }
      // Auto-generate rule at threshold
      if (existing.count >= AUTO_RULE_THRESHOLD && !existing.ruleGenerated) {
        existing.ruleGenerated = true;
        autoGenerateRule(existing);
      }
    } else {
      w.failureSignatures.set(sigKey, {
        pattern: normalizeErrorSignature(error),
        executor,
        count: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        deterministicCandidate: false,
        ruleGenerated: false,
      });
    }

    // Cross-executor cascade detection
    const now = Date.now();
    w.recentFailures.push({ executor, timestamp: now, error });
    // Keep only last 500ms of failures for cascade detection
    const cascadeWindow = w.recentFailures.filter(f => now - f.timestamp < 500 && f.executor !== executor);
    for (const recent of cascadeWindow) {
      w.cascadeEvents.push({
        sourceExecutor: recent.executor,
        targetExecutor: executor,
        sourceTimestamp: recent.timestamp,
        targetTimestamp: now,
        delayMs: now - recent.timestamp,
        sourceError: recent.error,
        targetError: error,
      });
    }
    // Trim old failures
    w.recentFailures = w.recentFailures.filter(f => now - f.timestamp < 2000);
  }
}

/** Normalize an error message into a stable signature for deduplication */
function normalizeErrorSignature(error: string): string {
  return error
    .replace(/\d{13,}/g, '<TS>')      // timestamps
    .replace(/[0-9a-f]{8,}/gi, '<ID>') // UUIDs/hashes
    .replace(/confidence \d+%/g, 'confidence <N>%')
    .replace(/\d+\.\d+/g, '<N>')
    .slice(0, 200);
}

/** Auto-generate a deterministic rule from a repeated failure signature */
function autoGenerateRule(sig: FailureSignature) {
  try {
    contributeRule(
      sig.executor,
      'auto_deterministic_phase1',
      'partial_valid', // target the most common repairable archetype
      0.75,
      `Auto-generated Phase 1 rule from ${sig.count}x repeated failure: ${sig.pattern.slice(0, 100)}`,
    );
    log.info('shadow-window', `Auto-generated deterministic rule for ${sig.executor}: ${sig.pattern.slice(0, 80)} (${sig.count} occurrences)`);
  } catch (err) {
    log.warn('shadow-window', `Failed to auto-generate rule: ${(err as Error).message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Window Flush
// ═══════════════════════════════════════════════════════════════════════════

function flushWindow(): WindowLog | null {
  if (!currentWindow) return null;
  const w = currentWindow;

  let totalRuns = 0, totalRepairAttempts = 0, totalRepairSuccesses = 0;
  let totalRetries = 0, totalEscalations = 0, totalSafeFails = 0;
  let totalDeterministic = 0, totalAdaptive = 0;
  const perExecutorAnomaly: Record<string, number> = {};

  for (const [executor, stats] of w.perExecutor) {
    totalRuns += stats.totalRuns;
    totalRepairAttempts += stats.repairAttempts;
    totalRepairSuccesses += stats.repairSuccesses;
    totalRetries += stats.retries;
    totalEscalations += stats.escalations;
    totalSafeFails += stats.safeFails;
    totalDeterministic += stats.deterministicHits;
    totalAdaptive += stats.adaptiveHits;

    // Anomaly score: escalation rate + repair failure rate (higher = worse)
    const escalationRate = stats.totalRuns > 0 ? stats.escalations / stats.totalRuns : 0;
    const repairFailRate = stats.repairAttempts > 0 ? 1 - (stats.repairSuccesses / stats.repairAttempts) : 0;
    perExecutorAnomaly[executor] = Math.round((escalationRate * 60 + repairFailRate * 40) * 100) / 100;
  }

  // Build top 3 failure signatures
  const topSigs = Array.from(w.failureSignatures.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Calculate trend from previous window
  const prev = windowLogs.length > 0 ? windowLogs[windowLogs.length - 1] : null;
  const repairAttemptRate = totalRuns > 0 ? totalRepairAttempts / totalRuns : 0;
  const repairSuccessRate = totalRepairAttempts > 0 ? totalRepairSuccesses / totalRepairAttempts : 0;
  const escalationRate = totalRuns > 0 ? totalEscalations / totalRuns : 0;

  const windowLog: WindowLog = {
    windowId: `W_${w.start.toString(36)}`,
    windowStart: w.start,
    windowEnd: Date.now(),
    executorCount: w.perExecutor.size,
    totalRuns,
    repairAttemptRate: Math.round(repairAttemptRate * 10000) / 100,
    repairSuccessRate: Math.round(repairSuccessRate * 10000) / 100,
    retryRate: totalRuns > 0 ? Math.round((totalRetries / totalRuns) * 10000) / 100 : 0,
    escalationRate: Math.round(escalationRate * 10000) / 100,
    safeFailRate: totalRuns > 0 ? Math.round((totalSafeFails / totalRuns) * 10000) / 100 : 0,
    topFailureSignatures: topSigs,
    perExecutorAnomaly,
    cascadeFrequency: w.cascadeEvents.length,
    cascadeEvents: w.cascadeEvents.slice(0, 10), // Keep top 10
    deterministicHitCount: totalDeterministic,
    adaptiveHitCount: totalAdaptive,
    trend: {
      repairRateDelta: prev ? repairAttemptRate * 100 - prev.repairAttemptRate : 0,
      escalationRateDelta: prev ? escalationRate * 100 - prev.escalationRate : 0,
      deterministicShift: prev
        ? (totalDeterministic - totalAdaptive) - (prev.deterministicHitCount - prev.adaptiveHitCount)
        : 0,
    },
  };

  windowLogs.push(windowLog);
  if (windowLogs.length > MAX_WINDOW_HISTORY) {
    windowLogs.shift();
  }

  log.info('shadow-window', `Window ${windowLog.windowId}: ${totalRuns} runs, ` +
    `repair_rate=${windowLog.repairAttemptRate}%, success=${windowLog.repairSuccessRate}%, ` +
    `escalation=${windowLog.escalationRate}%, cascades=${windowLog.cascadeFrequency}, ` +
    `det=${totalDeterministic} adapt=${totalAdaptive}, executors=${windowLog.executorCount}`);

  // Rollback safety checks
  checkRollbackConditions(windowLog);

  return windowLog;
}

function checkRollbackConditions(w: WindowLog) {
  if (w.repairAttemptRate > 15) {
    log.warn('shadow-window', `⚠️ ROLLBACK TRIGGER: repair_attempt_rate ${w.repairAttemptRate}% > 15% threshold`);
  }
  if (w.escalationRate > 7) {
    log.warn('shadow-window', `⚠️ ROLLBACK TRIGGER: escalation_rate ${w.escalationRate}% > 7% threshold`);
  }
  if (w.cascadeFrequency > 3) {
    log.warn('shadow-window', `⚠️ CASCADE ALERT: ${w.cascadeFrequency} cascade events in window (threshold: 3)`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Query API
// ═══════════════════════════════════════════════════════════════════════════

/** Get the last N window logs */
export function getWindowLogs(count = 10): WindowLog[] {
  return windowLogs.slice(-count);
}

/** Force flush current window (for testing/debugging) */
export function forceFlushWindow(): WindowLog | null {
  const result = flushWindow();
  currentWindow = null;
  return result;
}

/** Get current window stats without flushing */
export function getCurrentWindowStats(): Partial<WindowLog> | null {
  if (!currentWindow) return null;
  const w = currentWindow;
  let totalRuns = 0;
  for (const stats of w.perExecutor.values()) totalRuns += stats.totalRuns;
  return {
    windowStart: w.start,
    executorCount: w.perExecutor.size,
    totalRuns,
    cascadeFrequency: w.cascadeEvents.length,
  };
}

/** Get failure signatures that are deterministic candidates */
export function getDeterministicCandidates(): FailureSignature[] {
  if (!currentWindow) return [];
  return Array.from(currentWindow.failureSignatures.values())
    .filter(s => s.deterministicCandidate)
    .sort((a, b) => b.count - a.count);
}

/** Check if repair rates validate against Phase 1 targets */
export function validatePhase1Targets(): {
  repairRateOk: boolean;
  repairSuccessOk: boolean;
  escalationOk: boolean;
  cascadeOk: boolean;
  details: string;
} {
  const recent = windowLogs.slice(-3);
  if (recent.length === 0) {
    return { repairRateOk: true, repairSuccessOk: true, escalationOk: true, cascadeOk: true, details: 'No windows yet' };
  }
  const avg = (key: keyof WindowLog) => recent.reduce((s, w) => s + (w[key] as number), 0) / recent.length;
  const repairRate = avg('repairAttemptRate');
  const repairSuccess = avg('repairSuccessRate');
  const escalation = avg('escalationRate');
  const cascades = recent.reduce((s, w) => s + w.cascadeFrequency, 0);

  return {
    repairRateOk: repairRate <= 2,
    repairSuccessOk: repairSuccess >= 85,
    escalationOk: escalation <= 5,
    cascadeOk: cascades <= 9, // 3 per window × 3 windows
    details: `repair_rate=${repairRate.toFixed(1)}%(≤2%), success=${repairSuccess.toFixed(1)}%(≥85%), escalation=${escalation.toFixed(1)}%(≤5%), cascades=${cascades}(≤9)`,
  };
}
