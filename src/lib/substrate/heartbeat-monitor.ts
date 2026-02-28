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

const heartbeats = new Map<string, { beats: number[]; lastBeat: number }>();
const SLOW_THRESHOLD_MS = 5 * 60 * 1000;   // 5 minutes
const SILENT_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Record a heartbeat from a module.
 */
export function recordHeartbeat(moduleId: string): void {
  const now = Date.now();
  const entry = heartbeats.get(moduleId);
  if (entry) {
    entry.beats.push(now);
    if (entry.beats.length > 100) entry.beats = entry.beats.slice(-100);
    entry.lastBeat = now;
  } else {
    heartbeats.set(moduleId, { beats: [now], lastBeat: now });
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
  let status: 'alive' | 'slow' | 'silent' = 'alive';
  if (elapsed > SILENT_THRESHOLD_MS) status = 'silent';
  else if (elapsed > SLOW_THRESHOLD_MS) status = 'slow';

  // Calculate average interval between beats
  let avgInterval = 0;
  if (entry.beats.length > 1) {
    const intervals: number[] = [];
    for (let i = 1; i < entry.beats.length; i++) {
      intervals.push(entry.beats[i] - entry.beats[i - 1]);
    }
    avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  return {
    moduleId,
    lastBeat: entry.lastBeat,
    beatCount: entry.beats.length,
    avgIntervalMs: Math.round(avgInterval),
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
