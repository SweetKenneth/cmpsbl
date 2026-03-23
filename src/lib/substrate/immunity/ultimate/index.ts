/**
 * IMMUNITY Ultimate — v9.0.0 "Pathogen Zero"
 * 
 * 10 Ultimate Capabilities:
 *   1. Adaptive Antibody Generator   — Auto-synthesizes detection rules from resolved threats
 *   2. Immune Memory Bank            — Persistent searchable long-term immune memory
 *   3. T-Cell Sentinel Network       — Distributed Mahalanobis anomaly detection
 *   4. Cytokine Storm Preventer      — Prevents immune overreaction / collateral damage
 *   5. Pathogen Evolution Tracker    — Tracks threat mutation trees and predicts variants
 *   6. Immune Strength Profiler      — Per-node ISI (Immune Strength Index) assessment
 *   7. Vaccination Campaign Engine   — Proactive fleet-wide node hardening
 *   8. Autoimmune Disorder Detector  — Detects false positives targeting healthy behavior
 *   9. Convalescence Manager         — Post-incident recovery orchestration
 *  10. Immune Telemetry Nexus        — Unified TDR, MTTI, efficiency observability
 */

// 1. Adaptive Antibody Generator
export {
  extractSignature,
  scoreConfidence,
  generalize,
  synthesizeAntibody,
  recordTrigger as recordAntibodyTrigger,
  expireStaleAntibodies,
  getAntibodiesForFamily,
  matchPattern,
  getAntibodyGeneratorHealth,
  type ThreatSignature,
  type Antibody,
  type AntibodyGeneratorHealth,
} from './adaptiveAntibodyGenerator';

// 2. Immune Memory Bank
export {
  recordThreat,
  recordVaccination as recordMemoryVaccination,
  recordBreakthrough as recordMemoryBreakthrough,
  searchByCategory,
  searchByFamily,
  getNodeVaccinations,
  getUnvaccinatedNodes,
  getTimeline as getAttackTimeline,
  getImmuneMemoryHealth,
  type ThreatTaxonomy,
  type ThreatMemoryEntry,
  type SeasonalPattern,
  type VaccinationRecord as MemoryVaccinationRecord,
  type ImmuneMemoryHealth,
} from './immuneMemoryBank';

// 3. T-Cell Sentinel Network
export {
  deploySentinel,
  trainBaseline,
  computeMahalanobis,
  observe as sentinelObserve,
  getSentinel,
  getAllSentinels,
  getConsensusAlerts,
  decommission as decommissionSentinel,
  getSentinelNetworkHealth,
  type SentinelAgent,
  type BehavioralBaseline,
  type SentinelObservation,
  type ConsensusAlert,
  type SentinelNetworkHealth,
} from './tCellSentinelNetwork';

// 4. Cytokine Storm Preventer
export {
  assessProportionality,
  startResponse as startImmuneResponse,
  reportCollateral,
  completeResponse as completeImmuneResponse,
  emergencyDampen,
  getActiveResponses,
  getCytokineStormHealth,
  type ImmuneResponse,
  type ProportionalityAssessment,
  type CytokineStormHealth,
} from './cytokineStormPreventer';

// 5. Pathogen Evolution Tracker
export {
  registerVariant,
  predictVariants,
  computeArmsRace,
  getMutationTree,
  getTopEvasionTechniques,
  getEvolutionTrackerHealth,
  type PathogenVariant,
  type MutationEdge,
  type PredictedVariant,
  type ArmsRaceScore,
  type EvolutionTrackerHealth,
} from './pathogenEvolutionTracker';

// 6. Immune Strength Profiler
export {
  recordLatency as recordImmuneLatency,
  recordDetection as recordImmuneDetection,
  assessNode,
  assessSystem,
  getStrengthProfilerHealth,
  type NodeImmuneProfile,
  type SystemImmuneProfile,
  type ISIWeights,
  type StrengthProfilerHealth,
} from './immuneStrengthProfiler';

// 7. Vaccination Campaign Engine
export {
  synthesizeVaccine,
  planCampaign,
  startCampaign,
  vaccinateNode,
  recordBreakthrough as recordCampaignBreakthrough,
  abortCampaign,
  getCampaign,
  getActiveCampaigns,
  isVaccinated,
  getCampaignHealth,
  type VaccineCampaign,
  type VaccineSpec,
  type CampaignHealth,
} from './vaccinationCampaignEngine';

// 8. Autoimmune Disorder Detector
export {
  recordFalsePositive,
  registerHealthyPattern,
  isKnownHealthy,
  approveWhitelist,
  getAutoimmunRules,
  getPendingWhitelists,
  getAutoimmuneDetectorHealth,
  type AutoimmuneIncident,
  type HealthyFingerprint,
  type WhitelistProposal,
  type AutoimmuneDetectorHealth,
} from './autoimmuneDisorderDetector';

// 9. Convalescence Manager
export {
  generatePlan as generateRecoveryPlan,
  startPlan as startRecoveryPlan,
  completeStep as completeRecoveryStep,
  recordIntegrityCheck,
  getPlan as getRecoveryPlan,
  getActivePlans as getActiveRecoveryPlans,
  getConvalescenceHealth,
  type RecoveryPlan,
  type RecoveryStep,
  type IntegrityCheck,
  type ConvalescenceHealth,
} from './convalescenceManager';

// 10. Immune Telemetry Nexus
export {
  emit as emitImmuneTelemetry,
  recordDetection as recordTelemetryDetection,
  recordMTTI,
  recordResponseEfficiency,
  updateVaccinationCoverage,
  updateArmsRaceVelocity,
  getDetectionMetrics,
  getMTTI,
  getResponseEfficiency,
  getRecentEvents as getRecentImmuneEvents,
  getEventsByType as getImmuneEventsByType,
  getImmuneTelemetryHealth,
  resetTelemetry as resetImmuneTelemetry,
  type ImmuneTelemetryEvent,
  type ThreatDetectionMetrics,
  type MeanTimeToImmunity,
  type ResponseEfficiency,
  type ImmuneTelemetryHealth,
} from './immuneTelemetryNexus';

// ═══════════════════════════════════════════════════════════════
// UNIFIED HEALTH
// ═══════════════════════════════════════════════════════════════

import { getAntibodyGeneratorHealth } from './adaptiveAntibodyGenerator';
import { getImmuneMemoryHealth } from './immuneMemoryBank';
import { getSentinelNetworkHealth } from './tCellSentinelNetwork';
import { getCytokineStormHealth } from './cytokineStormPreventer';
import { getEvolutionTrackerHealth } from './pathogenEvolutionTracker';
import { getStrengthProfilerHealth } from './immuneStrengthProfiler';
import { getCampaignHealth } from './vaccinationCampaignEngine';
import { getAutoimmuneDetectorHealth } from './autoimmuneDisorderDetector';
import { getConvalescenceHealth } from './convalescenceManager';
import { getImmuneTelemetryHealth } from './immuneTelemetryNexus';

export interface ImmunityUltimateHealth {
  version: '9.0.0';
  codename: 'Pathogen Zero';
  systems: {
    antibodyGenerator: AntibodyGeneratorHealth;
    immuneMemory: ImmuneMemoryHealth;
    sentinelNetwork: SentinelNetworkHealth;
    cytokineStorm: CytokineStormHealth;
    evolutionTracker: EvolutionTrackerHealth;
    strengthProfiler: StrengthProfilerHealth;
    vaccinationCampaign: CampaignHealth;
    autoimmuneDetector: AutoimmuneDetectorHealth;
    convalescence: ConvalescenceHealth;
    telemetryNexus: ImmuneTelemetryHealth;
  };
  overallHealth: number;
}

export function getImmunityUltimateHealth(): ImmunityUltimateHealth {
  const systems = {
    antibodyGenerator: getAntibodyGeneratorHealth(),
    immuneMemory: getImmuneMemoryHealth(),
    sentinelNetwork: getSentinelNetworkHealth(),
    cytokineStorm: getCytokineStormHealth(),
    evolutionTracker: getEvolutionTrackerHealth(),
    strengthProfiler: getStrengthProfilerHealth(),
    vaccinationCampaign: getCampaignHealth(),
    autoimmuneDetector: getAutoimmuneDetectorHealth(),
    convalescence: getConvalescenceHealth(),
    telemetryNexus: getImmuneTelemetryHealth(),
  };

  // Composite: weighted average of sub-system health indicators
  const telemetryHealth = systems.telemetryNexus.overallImmuneHealth;
  const proportionality = systems.cytokineStorm.proportionalityScore * 100;
  const profilerAvg = systems.strengthProfiler.avgISI;
  const convalRate = systems.convalescence.integrityPassRate * 100;

  const overallHealth = Math.round(
    (telemetryHealth * 0.3 +
     proportionality * 0.2 +
     profilerAvg * 0.3 +
     convalRate * 0.2)
  );

  return {
    version: '9.0.0',
    codename: 'Pathogen Zero',
    systems,
    overallHealth: Math.max(0, Math.min(100, overallHealth)),
  };
}
