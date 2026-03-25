/**
 * Cascade Failure Detector — Identifies failure propagation across modules
 * Tracks error correlation to prevent cascading outages
 */

interface FailureEvent {
  module: string;
  timestamp: number;
  error: string;
}

interface CascadeChain {
  origin: string;
  chain: string[];
  confidence: number;
  detectedAt: number;
}

// Use a ring-buffer style approach: write pointer + fixed array
const MAX_FAILURES = 200;
const recentFailures = new Array<FailureEvent>(MAX_FAILURES);
let failureHead = 0;
let failureCount = 0;
const CASCADE_WINDOW_MS = 10_000;
const cascadeHistory: CascadeChain[] = [];
const listeners = new Set<(chain: CascadeChain) => void>();

function pushFailure(f: FailureEvent): void {
  recentFailures[failureHead] = f;
  failureHead = (failureHead + 1) % MAX_FAILURES;
  if (failureCount < MAX_FAILURES) failureCount++;
}

function getRecentInWindow(windowStart: number): FailureEvent[] {
  const result: FailureEvent[] = [];
  for (let i = 0; i < failureCount; i++) {
    const idx = (failureHead - failureCount + i + MAX_FAILURES) % MAX_FAILURES;
    const f = recentFailures[idx];
    if (f && f.timestamp >= windowStart) result.push(f);
  }
  return result;
}

export function reportFailure(module: string, error: string): CascadeChain | null {
  const now = Date.now();
  pushFailure({ module, timestamp: now, error });

  const windowStart = now - CASCADE_WINDOW_MS;
  const recent = getRecentInWindow(windowStart);

  // Find distinct modules failing in sequence
  const failedModules: string[] = [];
  const seen = new Set<string>();
  for (const f of recent) {
    if (!seen.has(f.module)) {
      seen.add(f.module);
      failedModules.push(f.module);
    }
  }

  if (failedModules.length >= 3) {
    const chain: CascadeChain = {
      origin: failedModules[0],
      chain: failedModules,
      confidence: Math.min(1, failedModules.length / 5),
      detectedAt: now,
    };
    cascadeHistory.push(chain);
    if (cascadeHistory.length > 50) cascadeHistory.shift();
    listeners.forEach(fn => fn(chain));
    return chain;
  }

  return null;
}

export function onCascadeDetected(cb: (chain: CascadeChain) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getCascadeHistory(): CascadeChain[] {
  return [...cascadeHistory];
}

export function getRecentFailureRate(windowMs = 60_000): Record<string, number> {
  const cutoff = Date.now() - windowMs;
  const counts: Record<string, number> = {};
  for (let i = 0; i < failureCount; i++) {
    const idx = (failureHead - failureCount + i + MAX_FAILURES) % MAX_FAILURES;
    const f = recentFailures[idx];
    if (f && f.timestamp >= cutoff) {
      counts[f.module] = (counts[f.module] || 0) + 1;
    }
  }
  return counts;
}

export function clearFailureHistory(): void {
  failureHead = 0;
  failureCount = 0;
}

export type { CascadeChain, FailureEvent };
