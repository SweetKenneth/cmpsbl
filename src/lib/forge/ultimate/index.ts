/**
 * FORGE Ultimate Form — v9.0.0 "Crucible"
 * Unified export and lifecycle API for all 10 Ultimate Form systems.
 *
 * Systems:
 *  1. Blueprint Genome Engine
 *  2. Multi-Stage Fabrication Pipeline
 *  3. Material Science Engine
 *  4. Pattern Library & Template Vault
 *  5. Artifact Foundry (Multi-Target Compiler)
 *  6. Quality Assurance Furnace
 *  7. Collaborative Forge (Multi-Agent Smithing)
 *  8. Forge Memory (Institutional Knowledge)
 *  9. Thermal Budget Governor
 * 10. Forge Telemetry Hearth
 */

// Re-export all systems
export * from './blueprintGenome';
export * from './fabricationPipeline';
export * from './materialScience';
export * from './patternLibrary';
export * from './artifactFoundry';
export * from './qaFurnace';
export * from './collaborativeForge';
export * from './forgeMemory';
export * from './thermalGovernor';
export * from './forgeTelemetry';

// Import for lifecycle
import { getGenomeStats, resetGenomeState } from './blueprintGenome';
import { getFabricationStats, resetFabricationState } from './fabricationPipeline';
import { getMaterialReport, resetMaterialState } from './materialScience';
import { getPatternStats, initPatternLibrary, resetPatternState } from './patternLibrary';
import { getFoundryStats, resetFoundryState } from './artifactFoundry';
import { getQAStats, resetQAState } from './qaFurnace';
import { getCollaborationStats, resetCollaborationState } from './collaborativeForge';
import { getMemoryStats, resetMemoryState } from './forgeMemory';
import { getThermalStats, getThermalState, resetThermalState } from './thermalGovernor';
import { getHearthSnapshot, resetHearthState } from './forgeTelemetry';

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface ForgeUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    blueprintGenome: { healthy: boolean; genomes: number; crossovers: number };
    fabricationPipeline: { healthy: boolean; activeJobs: number; rejectionRate: number };
    materialScience: { healthy: boolean; materials: number; conflicts: number };
    patternLibrary: { healthy: boolean; patterns: number; avgCJPI: number };
    artifactFoundry: { healthy: boolean; compiles: number; targets: number };
    qaFurnace: { healthy: boolean; runs: number; passRate: number };
    collaborativeForge: { healthy: boolean; activeSessions: number; conflictResRate: number };
    forgeMemory: { healthy: boolean; records: number; antiPatterns: number };
    thermalGovernor: { healthy: boolean; zone: string; temperature: number };
    telemetryHearth: { healthy: boolean; forgesPerHour: number; systemHealth: number };
  };
  overallHealth: number;
}

let initialized = false;

/** Initialize all FORGE Ultimate systems. */
export function init(): void {
  if (initialized) return;
  initPatternLibrary();
  initialized = true;
  console.log('[FORGE] Ultimate Form v9.0.0 "Crucible" initialized — 10 systems online');
}

/** Get comprehensive health across all 10 systems. */
export function health(): ForgeUltimateHealth {
  const genome = getGenomeStats();
  const fab = getFabricationStats();
  const material = getMaterialReport();
  const pattern = getPatternStats();
  const foundry = getFoundryStats();
  const qa = getQAStats();
  const collab = getCollaborationStats();
  const memory = getMemoryStats();
  const thermal = getThermalStats();
  const thermalState = getThermalState();
  const hearth = getHearthSnapshot({
    stageBottleneck: fab.stageBottleneck,
    thermalZone: thermalState.zone,
    activeCollaborations: collab.activeSessions,
    antiPatternsDetected: memory.flaggedAntiPatterns,
  });

  const systems = {
    blueprintGenome: { healthy: true, genomes: genome.total, crossovers: genome.totalCrossovers },
    fabricationPipeline: { healthy: fab.rejectionRate < 0.5, activeJobs: fab.activeJobs, rejectionRate: fab.rejectionRate },
    materialScience: { healthy: material.deprecatedCount < material.totalMaterials * 0.3, materials: material.totalMaterials, conflicts: material.conflictCount },
    patternLibrary: { healthy: true, patterns: pattern.total, avgCJPI: pattern.avgCJPI },
    artifactFoundry: { healthy: true, compiles: foundry.totalCompiles, targets: foundry.uniqueTargets },
    qaFurnace: { healthy: qa.passRate > 0.5 || qa.totalRuns === 0, runs: qa.totalRuns, passRate: qa.passRate },
    collaborativeForge: { healthy: collab.conflictResolutionRate > 0.7 || collab.totalConflicts === 0, activeSessions: collab.activeSessions, conflictResRate: collab.conflictResolutionRate },
    forgeMemory: { healthy: memory.successRate > 0.3 || memory.totalRecords === 0, records: memory.totalRecords, antiPatterns: memory.flaggedAntiPatterns },
    thermalGovernor: { healthy: thermal.currentZone !== 'critical', zone: thermal.currentZone, temperature: thermal.temperature },
    telemetryHearth: { healthy: hearth.systemHealth > 30, forgesPerHour: hearth.forgesPerHour, systemHealth: hearth.systemHealth },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Crucible', initialized, systems, overallHealth };
}

/** Run periodic maintenance. */
export function runCLM(): { thermalZone: string; temperature: number } {
  const t = getThermalState();
  return { thermalZone: t.zone, temperature: Math.round(t.temperature * 10) / 10 };
}

/** Full resilience check. */
export function resilience(): {
  thermalSafe: boolean;
  noFlaggedAntiPatterns: boolean;
  pipelineHealthy: boolean;
  qaPassRateHealthy: boolean;
} {
  const thermal = getThermalStats();
  const memory = getMemoryStats();
  const fab = getFabricationStats();
  const qa = getQAStats();
  return {
    thermalSafe: thermal.currentZone !== 'critical',
    noFlaggedAntiPatterns: memory.flaggedAntiPatterns === 0,
    pipelineHealthy: fab.rejectionRate < 0.5,
    qaPassRateHealthy: qa.passRate > 0.5 || qa.totalRuns === 0,
  };
}

/** Reset all ultimate form state. */
export function resetAll(): void {
  resetGenomeState();
  resetFabricationState();
  resetMaterialState();
  resetPatternState();
  resetFoundryState();
  resetQAState();
  resetCollaborationState();
  resetMemoryState();
  resetThermalState();
  resetHearthState();
  initialized = false;
}
