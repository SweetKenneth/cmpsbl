/**
 * Evolution Mesh — Replay Sandbox
 * Allows executors to re-attempt previously failed gaps in isolation.
 * Captures snapshots, replays inputs, compares outcomes.
 */

export interface GapSnapshot {
  id: string;
  executorId: string;
  originalInput: Record<string, unknown>;
  originalError: string;
  archetype: string;
  repairStrategiesAttempted: string[];
  capturedAt: number;
  replayCount: number;
  lastReplayAt?: number;
  resolved: boolean;
  resolution?: {
    strategy: string;
    resolvedAt: number;
    attemptsToResolve: number;
  };
}

export interface ReplayResult {
  snapshotId: string;
  success: boolean;
  durationMs: number;
  strategyUsed?: string;
  error?: string;
  improvementOverOriginal: boolean;
}

const gapSnapshots = new Map<string, GapSnapshot>();
let snapshotCounter = 0;

/**
 * Capture a failed execution for later replay.
 */
export function captureGap(
  executorId: string,
  input: Record<string, unknown>,
  error: string,
  archetype: string,
  strategiesAttempted: string[],
): GapSnapshot {
  const id = `gap_${++snapshotCounter}_${Date.now()}`;
  const snapshot: GapSnapshot = {
    id,
    executorId,
    originalInput: structuredClone(input),
    originalError: error,
    archetype,
    repairStrategiesAttempted: [...strategiesAttempted],
    capturedAt: Date.now(),
    replayCount: 0,
    resolved: false,
  };
  gapSnapshots.set(id, snapshot);
  return snapshot;
}

/**
 * Replay a gap snapshot — executor attempts to handle the same input again.
 */
export async function replayGap<T>(
  snapshotId: string,
  handler: (input: Record<string, unknown>) => Promise<T>,
): Promise<ReplayResult> {
  const snapshot = gapSnapshots.get(snapshotId);
  if (!snapshot) {
    return { snapshotId, success: false, durationMs: 0, error: 'snapshot_not_found', improvementOverOriginal: false };
  }

  snapshot.replayCount++;
  snapshot.lastReplayAt = Date.now();

  const start = performance.now();
  try {
    await handler(structuredClone(snapshot.originalInput));
    const duration = performance.now() - start;

    snapshot.resolved = true;
    snapshot.resolution = {
      strategy: 'replay_success',
      resolvedAt: Date.now(),
      attemptsToResolve: snapshot.replayCount,
    };

    return { snapshotId, success: true, durationMs: Math.round(duration), improvementOverOriginal: true };
  } catch (err) {
    const duration = performance.now() - start;
    const error = err instanceof Error ? err.message : 'unknown';
    return {
      snapshotId,
      success: false,
      durationMs: Math.round(duration),
      error,
      improvementOverOriginal: error !== snapshot.originalError,
    };
  }
}

/**
 * Get unresolved gaps for an executor.
 */
export function getUnresolvedGaps(executorId?: string): GapSnapshot[] {
  return Array.from(gapSnapshots.values())
    .filter(g => !g.resolved && (!executorId || g.executorId === executorId))
    .sort((a, b) => b.capturedAt - a.capturedAt);
}

/**
 * Get resolved gaps (for learning what worked).
 */
export function getResolvedGaps(executorId?: string): GapSnapshot[] {
  return Array.from(gapSnapshots.values())
    .filter(g => g.resolved && (!executorId || g.executorId === executorId))
    .sort((a, b) => (b.resolution?.resolvedAt ?? 0) - (a.resolution?.resolvedAt ?? 0));
}

/**
 * Get gap replay statistics.
 */
export function getReplayStats(): {
  totalGaps: number;
  resolved: number;
  unresolved: number;
  avgAttemptsToResolve: number;
  resolutionRate: number;
  replayVelocity: ReplayVelocityReport;
} {
  const all = Array.from(gapSnapshots.values());
  const resolved = all.filter(g => g.resolved);
  const avgAttempts = resolved.length > 0
    ? resolved.reduce((s, g) => s + (g.resolution?.attemptsToResolve ?? 0), 0) / resolved.length
    : 0;

  return {
    totalGaps: all.length,
    resolved: resolved.length,
    unresolved: all.length - resolved.length,
    avgAttemptsToResolve: Math.round(avgAttempts * 100) / 100,
    resolutionRate: all.length > 0 ? resolved.length / all.length : 0,
    replayVelocity: getReplayVelocity(),
  };
}

// ── #4 Replay Velocity ──

export interface ReplayVelocityPoint {
  snapshotId: string;
  replayIndex: number;
  durationMs: number;
  success: boolean;
  timestamp: number;
}

export interface ReplayVelocityReport {
  /** Average time-to-resolve across all resolved gaps (ms) */
  avgTimeToResolveMs: number;
  /** Average replays needed to resolve */
  avgReplaysToResolve: number;
  /** Velocity trend: are resolutions getting faster over time? */
  trend: 'accelerating' | 'stable' | 'decelerating';
  /** Per-gap velocity breakdown (most recent 50) */
  perGap: Array<{
    snapshotId: string;
    replaysNeeded: number;
    totalElapsedMs: number;
    resolved: boolean;
  }>;
  /** Speed percentiles (p50, p90) in replays-to-resolve */
  p50Replays: number;
  p90Replays: number;
}

const velocityLog: ReplayVelocityPoint[] = [];
const MAX_VELOCITY_LOG = 10_000;

/**
 * Record a replay velocity data point (called internally after each replay).
 */
export function recordReplayVelocity(snapshotId: string, replayIndex: number, durationMs: number, success: boolean): void {
  velocityLog.push({ snapshotId, replayIndex, durationMs, success, timestamp: Date.now() });
  if (velocityLog.length > MAX_VELOCITY_LOG) velocityLog.splice(0, velocityLog.length - MAX_VELOCITY_LOG);
}

/**
 * Get replay velocity report — measures how quickly executors resolve gaps.
 */
export function getReplayVelocity(): ReplayVelocityReport {
  const resolved = Array.from(gapSnapshots.values()).filter(g => g.resolved && g.resolution);
  
  const perGap = Array.from(gapSnapshots.values())
    .sort((a, b) => b.capturedAt - a.capturedAt)
    .slice(0, 50)
    .map(g => ({
      snapshotId: g.id,
      replaysNeeded: g.replayCount,
      totalElapsedMs: g.resolution ? g.resolution.resolvedAt - g.capturedAt : Date.now() - g.capturedAt,
      resolved: g.resolved,
    }));

  const resolveTimes = resolved.map(g => g.resolution!.resolvedAt - g.capturedAt);
  const replayCounts = resolved.map(g => g.resolution!.attemptsToResolve);

  const avgTimeToResolveMs = resolveTimes.length > 0
    ? Math.round(resolveTimes.reduce((a, b) => a + b, 0) / resolveTimes.length)
    : 0;

  const avgReplaysToResolve = replayCounts.length > 0
    ? Math.round((replayCounts.reduce((a, b) => a + b, 0) / replayCounts.length) * 100) / 100
    : 0;

  // Percentiles
  const sortedReplays = [...replayCounts].sort((a, b) => a - b);
  const p50Replays = sortedReplays.length > 0 ? sortedReplays[Math.floor(sortedReplays.length * 0.5)] : 0;
  const p90Replays = sortedReplays.length > 0 ? sortedReplays[Math.floor(sortedReplays.length * 0.9)] : 0;

  // Trend: compare first half resolve times vs second half
  let trend: ReplayVelocityReport['trend'] = 'stable';
  if (resolveTimes.length >= 6) {
    const half = Math.floor(resolveTimes.length / 2);
    const firstAvg = resolveTimes.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const secondAvg = resolveTimes.slice(half).reduce((a, b) => a + b, 0) / (resolveTimes.length - half);
    if (secondAvg < firstAvg * 0.85) trend = 'accelerating';
    else if (secondAvg > firstAvg * 1.15) trend = 'decelerating';
  }

  return { avgTimeToResolveMs, avgReplaysToResolve, trend, perGap, p50Replays, p90Replays };
}
