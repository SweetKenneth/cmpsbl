/**
 * NEXUS — Provider Health Ranker
 * Real-time scoring of AI providers based on rolling latency, error rate, throughput.
 * Dynamically reorders the fallback chain.
 */

export interface ProviderHealthMetrics {
  providerId: string;
  displayName: string;
  rollingLatencyMs: number;
  errorRate: number;           // 0-1
  throughput: number;          // requests/min
  successCount: number;
  failureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  circuitState: 'closed' | 'open' | 'half-open';
  healthScore: number;         // 0-100
}

interface LatencySample {
  timestamp: number;
  latencyMs: number;
  success: boolean;
}

const providerSamples = new Map<string, LatencySample[]>();
const MAX_SAMPLES = 200;
const WINDOW_MS = 300_000; // 5 minutes

const HEALTH_WEIGHTS = {
  latency: 0.30,
  errorRate: 0.35,
  throughput: 0.15,
  recency: 0.20,
};

export function recordProviderCall(
  providerId: string,
  latencyMs: number,
  success: boolean
): void {
  const samples = providerSamples.get(providerId) ?? [];
  samples.push({ timestamp: Date.now(), latencyMs, success });
  if (samples.length > MAX_SAMPLES) samples.shift();
  providerSamples.set(providerId, samples);
}

export function getProviderHealth(providerId: string, displayName?: string): ProviderHealthMetrics {
  const samples = providerSamples.get(providerId) ?? [];
  const cutoff = Date.now() - WINDOW_MS;
  const recent = samples.filter(s => s.timestamp >= cutoff);

  if (recent.length === 0) {
    return {
      providerId,
      displayName: displayName ?? providerId,
      rollingLatencyMs: 0,
      errorRate: 0,
      throughput: 0,
      successCount: 0,
      failureCount: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      circuitState: 'closed',
      healthScore: 50, // neutral when no data
    };
  }

  const successes = recent.filter(s => s.success);
  const failures = recent.filter(s => !s.success);
  const avgLatency = successes.length > 0
    ? successes.reduce((s, r) => s + r.latencyMs, 0) / successes.length
    : 10000;
  const errorRate = failures.length / recent.length;
  const throughput = recent.length / (WINDOW_MS / 60000);

  const lastSuccess = successes.length > 0
    ? new Date(Math.max(...successes.map(s => s.timestamp))).toISOString()
    : null;
  const lastFailure = failures.length > 0
    ? new Date(Math.max(...failures.map(s => s.timestamp))).toISOString()
    : null;

  // Circuit state inference
  let circuitState: 'closed' | 'open' | 'half-open' = 'closed';
  if (errorRate > 0.8 && recent.length >= 5) circuitState = 'open';
  else if (errorRate > 0.4) circuitState = 'half-open';

  // Health score calculation
  const latencyScore = Math.max(0, 100 - (avgLatency / 100)); // 0ms=100, 10000ms=0
  const errorScore = (1 - errorRate) * 100;
  const throughputScore = Math.min(100, throughput * 5);
  const recencyScore = lastSuccess
    ? Math.max(0, 100 - (Date.now() - new Date(lastSuccess).getTime()) / 3000)
    : 0;

  const healthScore = Math.round(
    latencyScore * HEALTH_WEIGHTS.latency +
    errorScore * HEALTH_WEIGHTS.errorRate +
    throughputScore * HEALTH_WEIGHTS.throughput +
    recencyScore * HEALTH_WEIGHTS.recency
  );

  return {
    providerId,
    displayName: displayName ?? providerId,
    rollingLatencyMs: Math.round(avgLatency),
    errorRate,
    throughput: Math.round(throughput * 10) / 10,
    successCount: successes.length,
    failureCount: failures.length,
    lastSuccessAt: lastSuccess,
    lastFailureAt: lastFailure,
    circuitState,
    healthScore: Math.min(100, Math.max(0, healthScore)),
  };
}

export function rankProviders(providerIds: string[]): string[] {
  return [...providerIds].sort((a, b) => {
    const ha = getProviderHealth(a);
    const hb = getProviderHealth(b);
    return hb.healthScore - ha.healthScore;
  });
}

export function getFleetHealth(providerIds: string[]): ProviderHealthMetrics[] {
  return providerIds.map(id => getProviderHealth(id));
}

export function resetProviderMetrics(providerId: string): void {
  providerSamples.delete(providerId);
}
