/**
 * S-Tier 045 — Provider Health Monitor
 * CJPI: 93 | Node: NEXUS | ID: S-106
 *
 * Tracks AI provider latency, error rates, and availability.
 * Used by NEXUS routing decisions to avoid degraded providers.
 */

export interface ProviderSample {
  provider: string;
  latencyMs: number;
  success: boolean;
  timestamp: number;
}

export interface ProviderHealth {
  provider: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  sampleCount: number;
  status: 'healthy' | 'degraded' | 'down';
  lastSeen: number;
}

const WINDOW_MS = 300_000; // 5 minutes
const ERROR_RATE_DEGRADED = 0.1;
const ERROR_RATE_DOWN = 0.5;

const samples: ProviderSample[] = [];

export function recordSample(sample: ProviderSample): void {
  samples.push(sample);
  // Evict old
  const cutoff = Date.now() - WINDOW_MS;
  while (samples.length > 0 && samples[0].timestamp < cutoff) samples.shift();
}

export function getProviderHealth(provider: string): ProviderHealth {
  const cutoff = Date.now() - WINDOW_MS;
  const recent = samples.filter(s => s.provider === provider && s.timestamp >= cutoff);

  if (recent.length === 0) {
    return { provider, avgLatencyMs: 0, p95LatencyMs: 0, errorRate: 0, sampleCount: 0, status: 'down', lastSeen: 0 };
  }

  const latencies = recent.filter(s => s.success).map(s => s.latencyMs).sort((a, b) => a - b);
  const errors = recent.filter(s => !s.success).length;
  const errorRate = errors / recent.length;

  const avgLatency = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
  const p95 = latencies.length ? latencies[Math.ceil(latencies.length * 0.95) - 1] : 0;

  let status: ProviderHealth['status'] = 'healthy';
  if (errorRate >= ERROR_RATE_DOWN) status = 'down';
  else if (errorRate >= ERROR_RATE_DEGRADED) status = 'degraded';

  return {
    provider,
    avgLatencyMs: Math.round(avgLatency),
    p95LatencyMs: Math.round(p95),
    errorRate: Math.round(errorRate * 100) / 100,
    sampleCount: recent.length,
    status,
    lastSeen: Math.max(...recent.map(s => s.timestamp)),
  };
}

export function getAllProviderHealth(): ProviderHealth[] {
  const providers = [...new Set(samples.map(s => s.provider))];
  return providers.map(getProviderHealth);
}

export function getBestProvider(): string | null {
  const all = getAllProviderHealth().filter(p => p.status !== 'down');
  if (all.length === 0) return null;
  all.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
  return all[0].provider;
}
