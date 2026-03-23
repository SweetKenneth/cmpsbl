/**
 * CORE — Clockless Epoch
 * Monotonic logical clock for ordering events across modules
 * without wall-clock dependency — the "clockless" in CMPSBL.
 * Ultimate Form v1.0.0
 */

export interface LogicalTimestamp {
  epoch: number;      // Monotonically increasing counter
  moduleId: string;   // Origin module
  causalParent: number | null; // Previous epoch this derives from
}

export interface EpochEntry {
  epoch: number;
  moduleId: string;
  operation: string;
  causalParent: number | null;
  wallTime: string;   // For debugging only — NOT used for ordering
}

let currentEpoch = 0;
const epochLog: EpochEntry[] = [];
const MAX_EPOCH_LOG = 5_000;

// Per-module vector clocks for causal ordering
const vectorClocks = new Map<string, number>();

/**
 * Tick the global epoch. Returns a new logical timestamp.
 */
export function tick(moduleId: string, operation: string, causalParent?: number): LogicalTimestamp {
  currentEpoch++;

  // Update vector clock for module
  const moduleEpoch = (vectorClocks.get(moduleId) || 0) + 1;
  vectorClocks.set(moduleId, moduleEpoch);

  const parent = causalParent ?? (currentEpoch > 1 ? currentEpoch - 1 : null);

  const entry: EpochEntry = {
    epoch: currentEpoch,
    moduleId,
    operation,
    causalParent: parent,
    wallTime: new Date().toISOString(),
  };

  epochLog.push(entry);
  if (epochLog.length > MAX_EPOCH_LOG) {
    epochLog.shift();
  }

  return {
    epoch: currentEpoch,
    moduleId,
    causalParent: parent,
  };
}

/**
 * Compare two logical timestamps for ordering.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareEpochs(a: LogicalTimestamp, b: LogicalTimestamp): number {
  return a.epoch - b.epoch;
}

/**
 * Check if event A causally precedes event B.
 */
export function happensBefore(a: number, b: number): boolean {
  // A happens before B if A's epoch < B's epoch and B can trace back to A
  if (a >= b) return false;

  let current = b;
  const visited = new Set<number>();
  while (current > a) {
    if (visited.has(current)) return false;
    visited.add(current);
    const entry = epochLog.find(e => e.epoch === current);
    if (!entry || entry.causalParent === null) return false;
    current = entry.causalParent;
  }
  return current === a;
}

/**
 * Get the current epoch counter.
 */
export function getCurrentEpoch(): number {
  return currentEpoch;
}

/**
 * Get vector clock for a specific module.
 */
export function getModuleVectorClock(moduleId: string): number {
  return vectorClocks.get(moduleId) || 0;
}

/**
 * Get all vector clocks (snapshot of causal state).
 */
export function getVectorClockSnapshot(): Record<string, number> {
  const snapshot: Record<string, number> = {};
  for (const [mod, clock] of vectorClocks) {
    snapshot[mod] = clock;
  }
  return snapshot;
}

/**
 * Get recent epoch entries for observability.
 */
export function getRecentEpochs(limit = 50): EpochEntry[] {
  return epochLog.slice(-limit);
}

/**
 * Get epoch entries for a specific module.
 */
export function getModuleEpochs(moduleId: string, limit = 50): EpochEntry[] {
  return epochLog.filter(e => e.moduleId === moduleId).slice(-limit);
}
