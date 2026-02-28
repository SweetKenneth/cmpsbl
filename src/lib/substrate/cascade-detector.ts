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

const recentFailures: FailureEvent[] = [];
const CASCADE_WINDOW_MS = 10_000; // 10s correlation window
const MAX_FAILURES = 200;
const cascadeHistory: CascadeChain[] = [];
const listeners = new Set<(chain: CascadeChain) => void>();

export function reportFailure(module: string, error: string): CascadeChain | null {
  const now = Date.now();
  recentFailures.push({ module, timestamp: now, error });
  if (recentFailures.length > MAX_FAILURES) recentFailures.splice(0, 50);

  // Check for cascade pattern
  const windowStart = now - CASCADE_WINDOW_MS;
  const recent = recentFailures.filter(f => f.timestamp >= windowStart);

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
  for (const f of recentFailures) {
    if (f.timestamp >= cutoff) {
      counts[f.module] = (counts[f.module] || 0) + 1;
    }
  }
  return counts;
}

export function clearFailureHistory(): void {
  recentFailures.length = 0;
}

export type { CascadeChain, FailureEvent };
