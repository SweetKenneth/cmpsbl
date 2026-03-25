/**
 * SLA Monitor — Track and alert on service level agreement violations
 * Monitors latency, availability, and error rate targets
 */

interface SLATarget {
  id: string;
  module: string;
  metric: 'latency_p99' | 'availability' | 'error_rate';
  threshold: number;
  window: number; // ms
  breached: boolean;
  breachCount: number;
}

interface SLASample {
  module: string;
  latencyMs: number;
  success: boolean;
  timestamp: number;
}

const targets = new Map<string, SLATarget>();

// Ring-buffer for samples — O(1) insertion, bounded memory
const SAMPLE_CAP = 5000;
const samples: SLASample[] = [];
let sampleHead = 0;
let sampleCount = 0;

const MAX_VIOLATIONS = 200;
const violations: Array<{ target: string; value: number; threshold: number; at: number }> = [];
const listeners = new Set<(targetId: string, value: number) => void>();

export function defineSLA(id: string, module: string, metric: SLATarget['metric'], threshold: number, windowMs = 60_000): void {
  targets.set(id, { id, module, metric, threshold, window: windowMs, breached: false, breachCount: 0 });
}

export function recordSample(module: string, latencyMs: number, success: boolean): void {
  const entry: SLASample = { module, latencyMs, success, timestamp: Date.now() };
  if (sampleCount < SAMPLE_CAP) {
    samples.push(entry);
    sampleCount++;
  } else {
    samples[sampleHead] = entry;
  }
  sampleHead = (sampleHead + 1) % SAMPLE_CAP;
  checkViolations(module);
}

function checkViolations(module: string): void {
  const now = Date.now();
  for (const target of targets.values()) {
    if (target.module !== module && target.module !== '*') continue;

    // Single-pass window collection with inline aggregation
    const windowSamples: number[] = [];
    let successCount = 0;
    let totalInWindow = 0;

    for (let i = 0; i < sampleCount; i++) {
      const s = samples[i];
      if (s.module !== module || s.timestamp < now - target.window) continue;
      totalInWindow++;
      if (s.success) successCount++;
      if (target.metric === 'latency_p99') windowSamples.push(s.latencyMs);
    }

    if (totalInWindow < 3) continue;

    let value: number;
    switch (target.metric) {
      case 'latency_p99': {
        windowSamples.sort((a, b) => a - b);
        value = windowSamples[Math.floor(windowSamples.length * 0.99)] || 0;
        break;
      }
      case 'availability': {
        value = (successCount / totalInWindow) * 100;
        break;
      }
      case 'error_rate': {
        value = ((totalInWindow - successCount) / totalInWindow) * 100;
        break;
      }
    }

    const breached = target.metric === 'availability'
      ? value < target.threshold
      : value > target.threshold;

    if (breached && !target.breached) {
      target.breached = true;
      target.breachCount++;
      violations.push({ target: target.id, value, threshold: target.threshold, at: now });
      if (violations.length > MAX_VIOLATIONS) violations.splice(0, 50);
      for (const fn of listeners) fn(target.id, value);
    } else if (!breached) {
      target.breached = false;
    }
  }
}

export function onSLABreach(cb: (targetId: string, value: number) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSLAStatus(): Array<SLATarget & { current?: number }> {
  return Array.from(targets.values());
}

export function getViolations(since?: number) {
  if (!since) return violations.slice();
  // Reverse scan for recency bias
  const result: typeof violations = [];
  for (let i = violations.length - 1; i >= 0; i--) {
    if (violations[i].at >= since) result.push(violations[i]);
    else break; // violations are chronological
  }
  return result.reverse();
}

// Pre-define core SLAs
defineSLA('core-latency', 'core', 'latency_p99', 500);
defineSLA('core-availability', 'core', 'availability', 99.5);
defineSLA('nexus-latency', 'nexus', 'latency_p99', 2000);
defineSLA('global-errors', '*', 'error_rate', 5);
