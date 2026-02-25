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
  };
}
