/**
 * Substrate Diagnostics Aggregator
 * Single-call aggregation of all substrate health signals.
 * Covers: uptime, memory, snapshots, circuit breakers, DLQ,
 *         telemetry sampler, metrics cache, subsystem health,
 *         matrix integrity, priority queue, and capability router.
 */

import { getSnapshotStats } from '@/core/metrics/snapshotEngine';
import { getCircuitBreakerSummary } from '@/lib/substrate/circuit-breaker';
import { getDLQStats } from '@/lib/substrate/dead-letter-queue';
import { getSamplerStats } from '@/lib/substrate/telemetry-sampler';
import { getUptimeReport } from '@/lib/system/uptimeTracker';
import { detectMemoryPressure } from '@/lib/system/memoryPressure';
import { getCacheStats } from '@/core/metrics/metricsCache';
import { getSubsystemDiagnostics, type SubsystemDiagnostics } from '@/lib/substrate/subsystem-health';
import { getMatrixIntegrity } from '@/lib/substrate/matrix';
import { getQueueState } from '@/lib/substrate/priority-queue';
import { getCapabilityMap, listCapabilities } from '@/lib/substrate/capability-router';

export interface SubstrateDiagnostics {
  timestamp: string;
  uptime: ReturnType<typeof getUptimeReport>;
  memory: ReturnType<typeof detectMemoryPressure>;
  snapshots: ReturnType<typeof getSnapshotStats>;
  circuitBreakers: ReturnType<typeof getCircuitBreakerSummary>;
  deadLetterQueue: ReturnType<typeof getDLQStats>;
  telemetrySampler: ReturnType<typeof getSamplerStats>;
  metricsCache: ReturnType<typeof getCacheStats>;
  subsystems: SubsystemDiagnostics;
  matrix: { integrity: ReturnType<typeof getMatrixIntegrity> };
  priorityQueue: ReturnType<typeof getQueueState>;
  capabilities: { total: number; registered: string[] };
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
  const subsystems = getSubsystemDiagnostics();
  const matrixIntegrity = getMatrixIntegrity();
  const pq = getQueueState();
  const capList = listCapabilities();

  // Derive overall health from all signals
  let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';

  if (
    memory.level === 'critical' ||
    circuitBreakers.open > 2 ||
    subsystems.overallScore < 40 ||
    !matrixIntegrity.healthy
  ) {
    overallHealth = 'critical';
  } else if (
    memory.level === 'high' ||
    circuitBreakers.open > 0 ||
    dlq.total > 100 ||
    subsystems.unhealthy.length > 0 ||
    subsystems.overallScore < 75
  ) {
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
    subsystems,
    matrix: { integrity: matrixIntegrity },
    priorityQueue: pq,
    capabilities: { total: capList.length, registered: capList },
    overallHealth,
  };
}
