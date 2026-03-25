/**
 * Substrate — Module Heartbeat Monitor
 * Lightweight heartbeat tracking for all registered modules.
 * Detects modules that go silent (no metric updates).
 */

export interface Heartbeat {
  moduleId: string;
  lastBeat: number;
  beatCount: number;
  avgIntervalMs: number;
  status: 'alive' | 'slow' | 'silent';
}

interface HeartbeatEntry {
  lastBeat: number;
  beatCount: number;
  /** Running total of intervals for EMA calculation */
  avgInterval: number;
}

const heartbeats = new Map<string, HeartbeatEntry>();
const SLOW_THRESHOLD_MS = 5 * 60 * 1000;   // 5 minutes
const SILENT_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Record a heartbeat from a module.
 * O(1) — no arrays, uses exponential moving average for interval tracking.
 */
export function recordHeartbeat(moduleId: string): void {
  const now = Date.now();
  const entry = heartbeats.get(moduleId);
  if (entry) {
    const interval = now - entry.lastBeat;
    // EMA with alpha=0.1 for smooth interval tracking
    entry.avgInterval = entry.beatCount > 0
      ? entry.avgInterval * 0.9 + interval * 0.1
      : interval;
    entry.lastBeat = now;
    entry.beatCount++;
  } else {
    heartbeats.set(moduleId, { lastBeat: now, beatCount: 1, avgInterval: 0 });
  }
}

/**
 * Get heartbeat status for a module.
 */
export function getHeartbeat(moduleId: string): Heartbeat {
  const entry = heartbeats.get(moduleId);
  const now = Date.now();

  if (!entry) {
    return { moduleId, lastBeat: 0, beatCount: 0, avgIntervalMs: 0, status: 'silent' };
  }

  const elapsed = now - entry.lastBeat;
  const status: 'alive' | 'slow' | 'silent' =
    elapsed > SILENT_THRESHOLD_MS ? 'silent' :
    elapsed > SLOW_THRESHOLD_MS ? 'slow' : 'alive';

  return {
    moduleId,
    lastBeat: entry.lastBeat,
    beatCount: entry.beatCount,
    avgIntervalMs: Math.round(entry.avgInterval),
    status,
  };
}

/**
 * Get all heartbeats.
 */
export function getAllHeartbeats(): Heartbeat[] {
  return Array.from(heartbeats.keys()).map(getHeartbeat);
}

/**
 * Get modules that are silent or slow.
 */
export function getUnhealthyModules(): Heartbeat[] {
  return getAllHeartbeats().filter(h => h.status !== 'alive');
}
