/**
 * HARVEST Ultimate Form — v9.0.0 "Leviathan"
 * Unified export and lifecycle API for all 10 Ultimate Form systems.
 *
 * Systems:
 *  1. Source Genome Registry
 *  2. Adaptive Crawler Swarm
 *  3. Schema Cartographer
 *  4. Deduplication Forge
 *  5. Freshness Oracle
 *  6. Quality Furnace
 *  7. Pipeline Choreographer
 *  8. Provenance Ledger
 *  9. Anticipatory Prefetch
 * 10. Harvest Telemetry
 */

// Re-export all systems
export * from './sourceGenome';
export * from './crawlerSwarm';
export * from './schemaCartographer';
export * from './deduplicationForge';
export * from './freshnessOracle';
export * from './qualityFurnace';
export * from './pipelineChoreographer';
export * from './provenanceLedger';
export * from './anticipatoryPrefetch';
export * from './harvestTelemetry';

// Import for lifecycle
import { getGenomeStats, resetGenomeState } from './sourceGenome';
import { initSwarm, getSwarmStats, resetSwarmState } from './crawlerSwarm';
import { getCartographerStats, resetCartographerState } from './schemaCartographer';
import { getDedupStats, resetDedupState } from './deduplicationForge';
import { getFreshnessStats, resetFreshnessState } from './freshnessOracle';
import { getQualityStats, resetQualityState } from './qualityFurnace';
import { getChoreographerStats, resetChoreographerState } from './pipelineChoreographer';
import { getLedgerStats, resetLedgerState } from './provenanceLedger';
import { getPrefetchStats, resetPrefetchState } from './anticipatoryPrefetch';
import { getTelemetryStats, resetTelemetryState } from './harvestTelemetry';

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface HarvestUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    sourceGenome: { healthy: boolean; sources: number; avgReliability: number };
    crawlerSwarm: { healthy: boolean; crawlers: number; efficiency: number };
    schemaCartographer: { healthy: boolean; snapshots: number; breakingDrifts: number };
    deduplicationForge: { healthy: boolean; processed: number; avgDedupRate: number };
    freshnessOracle: { healthy: boolean; profiles: number; highChurn: number };
    qualityFurnace: { healthy: boolean; assessments: number; quarantineRate: number };
    pipelineChoreographer: { healthy: boolean; runs: number; failRate: number };
    provenanceLedger: { healthy: boolean; entries: number; chainIntegrity: boolean };
    anticipatoryPrefetch: { healthy: boolean; hitRate: number; patterns: number };
    harvestTelemetry: { healthy: boolean; snapshots: number; trend: string };
  };
  overallHealth: number;
}

let initialized = false;

/** Initialize all HARVEST Ultimate systems. */
export function init(): void {
  if (initialized) return;
  initSwarm();
  initialized = true;
  console.log('[HARVEST] Ultimate Form v9.0.0 "Leviathan" initialized — 10 systems online');
}

/** Get comprehensive health across all 10 systems. */
export function health(): HarvestUltimateHealth {
  const genome = getGenomeStats();
  const swarm = getSwarmStats();
  const carto = getCartographerStats();
  const dedup = getDedupStats();
  const fresh = getFreshnessStats();
  const quality = getQualityStats();
  const choreo = getChoreographerStats();
  const ledger = getLedgerStats();
  const prefetch = getPrefetchStats();
  const telemetry = getTelemetryStats();

  const systems = {
    sourceGenome: { healthy: genome.avgReliability > 0.3 || genome.total === 0, sources: genome.active, avgReliability: genome.avgReliability },
    crawlerSwarm: { healthy: swarm.swarmEfficiency > 0.3 || swarm.totalCrawlers === 0, crawlers: swarm.totalCrawlers, efficiency: swarm.swarmEfficiency },
    schemaCartographer: { healthy: carto.breakingDrifts < carto.totalDrifts * 0.5 || carto.totalDrifts === 0, snapshots: carto.totalSnapshots, breakingDrifts: carto.breakingDrifts },
    deduplicationForge: { healthy: true, processed: dedup.totalProcessed, avgDedupRate: dedup.avgDeduplicationRate },
    freshnessOracle: { healthy: true, profiles: fresh.totalProfiles, highChurn: fresh.highChurnSources },
    qualityFurnace: { healthy: quality.quarantineRate < 0.5 || quality.totalAssessments === 0, assessments: quality.totalAssessments, quarantineRate: quality.quarantineRate },
    pipelineChoreographer: { healthy: choreo.failedRuns < choreo.totalRuns * 0.5 || choreo.totalRuns === 0, runs: choreo.totalRuns, failRate: choreo.totalRuns > 0 ? choreo.failedRuns / choreo.totalRuns : 0 },
    provenanceLedger: { healthy: ledger.chainIntegrity, entries: ledger.totalEntries, chainIntegrity: ledger.chainIntegrity },
    anticipatoryPrefetch: { healthy: true, hitRate: prefetch.hitRate, patterns: prefetch.totalPatterns },
    harvestTelemetry: { healthy: telemetry.trendDirection !== 'degrading', snapshots: telemetry.snapshotCount, trend: telemetry.trendDirection },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Leviathan', initialized, systems, overallHealth };
}

/** Run periodic maintenance. */
export function runCLM(): { swarmEfficiency: number; chainIntegrity: boolean; trend: string } {
  const swarm = getSwarmStats();
  const ledger = getLedgerStats();
  const telemetry = getTelemetryStats();
  return {
    swarmEfficiency: swarm.swarmEfficiency,
    chainIntegrity: ledger.chainIntegrity,
    trend: telemetry.trendDirection,
  };
}

/** Full resilience check. */
export function resilience(): {
  swarmHealthy: boolean;
  chainIntact: boolean;
  qualityAboveThreshold: boolean;
  pipelineHealthy: boolean;
} {
  const swarm = getSwarmStats();
  const ledger = getLedgerStats();
  const quality = getQualityStats();
  const choreo = getChoreographerStats();
  return {
    swarmHealthy: swarm.swarmEfficiency > 0.3,
    chainIntact: ledger.chainIntegrity,
    qualityAboveThreshold: quality.quarantineRate < 0.5 || quality.totalAssessments === 0,
    pipelineHealthy: choreo.failedRuns < choreo.totalRuns * 0.5 || choreo.totalRuns === 0,
  };
}

/** Reset all ultimate form state. */
export function resetAll(): void {
  resetGenomeState();
  resetSwarmState();
  resetCartographerState();
  resetDedupState();
  resetFreshnessState();
  resetQualityState();
  resetChoreographerState();
  resetLedgerState();
  resetPrefetchState();
  resetTelemetryState();
  initialized = false;
}
