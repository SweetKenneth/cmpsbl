/**
 * Substrate Diagnostics Aggregator
 * Single-call aggregation of all substrate health signals.
 */

import { getSnapshotStats } from '@/core/metrics/snapshotEngine';
import { getCircuitBreakerSummary } from '@/lib/substrate/circuit-breaker';
import { getDLQStats } from '@/lib/substrate/dead-letter-queue';
import { getSamplerStats } from '@/lib/substrate/telemetry-sampler';
import { getUptimeReport } from '@/lib/system/uptimeTracker';
import { detectMemoryPressure } from '@/lib/system/memoryPressure';
import { getCacheStats } from '@/core/metrics/metricsCache';

export interface SubstrateDiagnostics {
  timestamp: string;
  uptime: ReturnType<typeof getUptimeReport>;
  memory: ReturnType<typeof detectMemoryPressure>;
  snapshots: ReturnType<typeof getSnapshotStats>;
  circuitBreakers: ReturnType<typeof getCircuitBreakerSummary>;
  deadLetterQueue: ReturnType<typeof getDLQStats>;
  telemetrySampler: ReturnType<typeof getSamplerStats>;
  metricsCache: ReturnType<typeof getCacheStats>;
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

/**
 * Collect all substrate diagnostics in a single call.
 */
export function collectDiagnostics(): SubstrateDiagnostics {
  const uptime = getUptimeReport();
  const memory = detectMemoryPressure();
  const snapshots = getSnapshotStats();
  const circuitBreakers = getCircuitBreakerSummary();
  const dlq = getDLQStats();
  const sampler = getSamplerStats();
  const cache = getCacheStats();

  // Derive overall health
  let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (memory.level === 'critical' || circuitBreakers.open > 2) {
    overallHealth = 'critical';
  } else if (memory.level === 'high' || circuitBreakers.open > 0 || dlq.total > 100) {
    overallHealth = 'degraded';
  }

  return {
    timestamp: new Date().toISOString(),
    uptime,
    memory,
    snapshots,
    circuitBreakers,
    deadLetterQueue: dlq,
    telemetrySampler: sampler,
    metricsCache: cache,
    overallHealth,
  };
}
