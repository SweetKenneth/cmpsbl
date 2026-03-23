/**
 * RIPPLE Ultimate Form — v9.0.0 "Tsunami"
 * Unified export and lifecycle API for all Ultimate Form systems
 * 
 * Systems:
 * 1. Priority Preemption Engine
 * 2. Per-Subscriber Adaptive Backpressure
 * 3. DLQ Forensics Engine
 * 4. Signal Correlation Engine
 * 5. Topic Topology Optimizer
 * 6. Event Schema Registry
 * 7. Cascade Storm Detection
 * 8. Event Enrichment Pipeline
 * 9. Live Telemetry Feed
 */

// Re-export all systems
export * from './priorityPreemption';
export * from './subscriberBackpressure';
export * from './dlqForensics';
export * from './signalCorrelation';
export * from './topicTopology';
export * from './schemaRegistry';
export * from './stormDetection';
export * from './enrichmentPipeline';
export * from './telemetryFeed';

// Import for lifecycle
import { getPreemptionStats, resetPreemptionState } from './priorityPreemption';
import { getBackpressureReport, resetBackpressureState, decayHealthScores } from './subscriberBackpressure';
import { getForensicsReport, resetForensicsState } from './dlqForensics';
import { getCorrelationStats, resetCorrelationState, finalizeStaleChains } from './signalCorrelation';
import { getTopologyReport, resetTopologyState } from './topicTopology';
import { getSchemaRegistryStats, resetSchemaRegistry } from './schemaRegistry';
import { getStormDetectionStats, resetStormDetectionState, tickAll } from './stormDetection';
import { getEnrichmentStats, resetEnrichmentState, registerSystemHooks } from './enrichmentPipeline';
import { getTelemetrySnapshot, resetTelemetryState } from './telemetryFeed';

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface RippleUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    priorityPreemption: { healthy: boolean; totalEnqueued: number; preemptions: number };
    subscriberBackpressure: { healthy: boolean; avgHealthScore: number; throttledCount: number };
    dlqForensics: { healthy: boolean; dlqDepth: number; patterns: number };
    signalCorrelation: { healthy: boolean; activeChains: number; edges: number };
    topicTopology: { healthy: boolean; healthScore: number; deadTopics: number };
    schemaRegistry: { healthy: boolean; activeSchemas: number; failureRate: number };
    stormDetection: { healthy: boolean; activeAlerts: number; velocity: number };
    enrichmentPipeline: { healthy: boolean; totalHooks: number; errors: number };
    telemetryFeed: { healthy: boolean; eps: number; systemHealth: number };
  };
  overallHealth: number;
}

let initialized = false;

/** Initialize all RIPPLE Ultimate systems. */
export function init(): void {
  if (initialized) return;
  
  // Register built-in enrichment hooks
  registerSystemHooks();
  
  initialized = true;
  console.log('[RIPPLE] Ultimate Form v9.0.0 "Tsunami" initialized — 9 systems online');
}

/** Get comprehensive health across all 9 systems. */
export function health(): RippleUltimateHealth {
  const preemption = getPreemptionStats();
  const backpressure = getBackpressureReport();
  const forensics = getForensicsReport();
  const correlation = getCorrelationStats();
  const topology = getTopologyReport();
  const schema = getSchemaRegistryStats();
  const storm = getStormDetectionStats();
  const enrichment = getEnrichmentStats();
  const telemetry = getTelemetrySnapshot(forensics.totalDLQEntries, storm.activeAlerts);

  const systems = {
    priorityPreemption: {
      healthy: true,
      totalEnqueued: preemption.totalEnqueued,
      preemptions: preemption.totalPreemptions,
    },
    subscriberBackpressure: {
      healthy: backpressure.avgHealthScore > 40,
      avgHealthScore: backpressure.avgHealthScore,
      throttledCount: backpressure.throttledCount,
    },
    dlqForensics: {
      healthy: forensics.totalDLQEntries < 500,
      dlqDepth: forensics.totalDLQEntries,
      patterns: forensics.uniquePatterns,
    },
    signalCorrelation: {
      healthy: true,
      activeChains: correlation.activeChainsCount,
      edges: correlation.uniqueEdges,
    },
    topicTopology: {
      healthy: topology.healthScore > 50,
      healthScore: topology.healthScore,
      deadTopics: topology.deadTopics.length,
    },
    schemaRegistry: {
      healthy: schema.failureRate < 10,
      activeSchemas: schema.activeSchemas,
      failureRate: schema.failureRate,
    },
    stormDetection: {
      healthy: storm.activeAlerts === 0,
      activeAlerts: storm.activeAlerts,
      velocity: storm.systemVelocity,
    },
    enrichmentPipeline: {
      healthy: enrichment.totalErrors < enrichment.totalExecutions * 0.1,
      totalHooks: enrichment.totalHooks,
      errors: enrichment.totalErrors,
    },
    telemetryFeed: {
      healthy: telemetry.systemHealth > 50,
      eps: telemetry.throughput.eventsPerSecond,
      systemHealth: telemetry.systemHealth,
    },
  };

  const healthScores = [
    systems.subscriberBackpressure.healthy ? 100 : 50,
    systems.dlqForensics.healthy ? 100 : 40,
    systems.topicTopology.healthy ? 100 : 60,
    systems.schemaRegistry.healthy ? 100 : 50,
    systems.stormDetection.healthy ? 100 : 30,
    systems.enrichmentPipeline.healthy ? 100 : 60,
    systems.telemetryFeed.healthy ? 100 : 50,
  ];
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return {
    version: '9.0.0',
    codename: 'Tsunami',
    initialized,
    systems,
    overallHealth,
  };
}

/** Run periodic maintenance (call every 5-10 seconds). */
export function runCLM(): { staleChains: number; expired: number } {
  // Tick storm detection sliding windows
  tickAll();

  // Finalize stale correlation chains
  const staleChains = finalizeStaleChains();

  // Decay subscriber health scores
  decayHealthScores();

  return { staleChains, expired: 0 };
}

/** Full resilience check. */
export function resilience(): {
  circuitBreakersHealthy: boolean;
  dlqUnderLimit: boolean;
  noActiveStorms: boolean;
  schemaValidationPassing: boolean;
} {
  const forensics = getForensicsReport();
  const storm = getStormDetectionStats();
  const schema = getSchemaRegistryStats();
  const bp = getBackpressureReport();

  return {
    circuitBreakersHealthy: bp.pausedCount === 0,
    dlqUnderLimit: forensics.totalDLQEntries < 1000,
    noActiveStorms: storm.activeAlerts === 0,
    schemaValidationPassing: schema.failureRate < 5,
  };
}

/** Reset all ultimate form state. */
export function resetAll(): void {
  resetPreemptionState();
  resetBackpressureState();
  resetForensicsState();
  resetCorrelationState();
  resetTopologyState();
  resetSchemaRegistry();
  resetStormDetectionState();
  resetEnrichmentState();
  resetTelemetryState();
  initialized = false;
}
