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
const samples: SLASample[] = [];
const MAX_SAMPLES = 5000;
const violations: Array<{ target: string; value: number; threshold: number; at: number }> = [];
const listeners = new Set<(targetId: string, value: number) => void>();

export function defineSLA(id: string, module: string, metric: SLATarget['metric'], threshold: number, windowMs = 60_000): void {
  targets.set(id, { id, module, metric, threshold, window: windowMs, breached: false, breachCount: 0 });
}

export function recordSample(module: string, latencyMs: number, success: boolean): void {
  samples.push({ module, latencyMs, success, timestamp: Date.now() });
  if (samples.length > MAX_SAMPLES) samples.splice(0, 1000);
  checkViolations(module);
}

function checkViolations(module: string): void {
  const now = Date.now();
  for (const target of targets.values()) {
    if (target.module !== module && target.module !== '*') continue;
    const window = samples.filter(s => s.module === module && s.timestamp >= now - target.window);
    if (window.length < 3) continue;

    let value: number;
    switch (target.metric) {
      case 'latency_p99': {
        const sorted = window.map(s => s.latencyMs).sort((a, b) => a - b);
        value = sorted[Math.floor(sorted.length * 0.99)] || 0;
        break;
      }
      case 'availability': {
        value = (window.filter(s => s.success).length / window.length) * 100;
        break;
      }
      case 'error_rate': {
        value = (window.filter(s => !s.success).length / window.length) * 100;
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
      if (violations.length > 200) violations.splice(0, 50);
      listeners.forEach(fn => fn(target.id, value));
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
  return since ? violations.filter(v => v.at >= since) : [...violations];
}

// Pre-define core SLAs
defineSLA('core-latency', 'core', 'latency_p99', 500);
defineSLA('core-availability', 'core', 'availability', 99.5);
defineSLA('nexus-latency', 'nexus', 'latency_p99', 2000);
defineSLA('global-errors', '*', 'error_rate', 5);
