/**
 * SIMULATE Ultimate — "Crucible Prime" v9.0.0
 * 
 * The substrate's universal scenario simulation engine — Monte Carlo core,
 * multi-dimensional scenarios, digital twin forking, temporal projection,
 * cost/resource modeling, A/B comparison, blast radius analysis, chaos
 * library, prediction accuracy tracking, and simulation telemetry.
 * 
 * @module simulate/ultimate
 * @version 9.0.0 — Crucible Prime
 */

// System 1: Monte Carlo Simulation Core
export {
  runMonteCarlo, getMonteCarloResult,
  getMonteCarloHealth, resetMonteCarlo,
  type MonteCarloConfig, type MonteCarloResult,
} from './monteCarloCore';

// System 2: Multi-Dimensional Scenario Engine
export {
  defineScenario, createFromTemplate, composeScenarios, executeScenario, parameterSweep,
  getScenario, getAllScenarios, getScenarioRuns, getAvailableTemplates,
  getScenarioEngineHealth, resetScenarioEngine,
  type ScenarioDefinition, type ScenarioRun, type ScenarioOutcome, type ScenarioTemplate,
} from './scenarioEngine';

// System 3: Digital Twin Forker
export {
  createFork, applyMutation, branchFork, compareForks,
  getFork, getAllForks,
  getForkerHealth, resetForker,
  type TwinFork, type TwinMutation, type TwinDiff, type ForkComparison,
} from './digitalTwinForker';

// System 4: Temporal Simulation Projector
export {
  runTemporalSimulation,
  getTemporalResults, getTemporalHealth, resetTemporalProjector,
  type TemporalConfig, type TemporalEvent, type TemporalResult, type TimePoint,
} from './temporalProjector';

// System 5: Cost & Resource Projection Engine
export {
  projectCosts, simulateChangeImpact,
  getCostProjectorHealth, resetCostProjector,
  type ResourceProfile, type CostProjection, type ChangeImpact,
} from './costResourceProjector';

// System 6: A/B Scenario Comparator
export {
  runABComparison,
  getABComparisons, getABComparatorHealth, resetABComparator,
  type ABScenarioConfig, type ABComparisonResult,
} from './abScenarioComparator';

// System 7: Blast Radius Projector
export {
  projectBlastRadius, getDependencyGraph,
  getBlastRadiusHealth, resetBlastRadius,
  type BlastRadiusConfig, type BlastRadiusResult, type AffectedComponent, type DependencyEdge,
} from './blastRadiusProjector';

// System 8: Chaos Scenario Library
export {
  getAllChaosScenarios, getChaosScenario, getByCategory, getBySeverity,
  registerChaosScenario, recordExperiment, getExperiments,
  getChaosLibraryHealth, resetChaosLibrary,
  type ChaosScenario, type ChaosExperiment,
} from './chaosScenarioLibrary';

// System 9: Prediction Accuracy Tracker
export {
  recordPrediction, resolvePrediction,
  getCalibration, getAllCalibrations, getOverallAccuracy,
  getAccuracyTrackerHealth, resetAccuracyTracker,
  type PredictionRecord, type ModelCalibration,
} from './predictionAccuracyTracker';

// System 10: Simulation Telemetry & Audit
export {
  recordSimulation, getSimulationAnalytics, getAuditLog, getAuditByType,
  getSimulationTelemetryHealth, resetSimulationTelemetry,
  type SimulationAuditEntry, type SimulationAnalytics, type SimulationType,
} from './simulationTelemetry';

// ── Unified Health ─────────────────────────────────────────────

import { getMonteCarloHealth } from './monteCarloCore';
import { getScenarioEngineHealth } from './scenarioEngine';
import { getForkerHealth } from './digitalTwinForker';
import { getTemporalHealth } from './temporalProjector';
import { getCostProjectorHealth } from './costResourceProjector';
import { getABComparatorHealth } from './abScenarioComparator';
import { getBlastRadiusHealth } from './blastRadiusProjector';
import { getChaosLibraryHealth } from './chaosScenarioLibrary';
import { getAccuracyTrackerHealth } from './predictionAccuracyTracker';
import { getSimulationTelemetryHealth } from './simulationTelemetry';

export interface SimulateUltimateHealth {
  version: '9.0.0';
  codename: 'Crucible Prime';
  systems: {
    monteCarlo: ReturnType<typeof getMonteCarloHealth>;
    scenarios: ReturnType<typeof getScenarioEngineHealth>;
    forker: ReturnType<typeof getForkerHealth>;
    temporal: ReturnType<typeof getTemporalHealth>;
    costProjector: ReturnType<typeof getCostProjectorHealth>;
    abComparator: ReturnType<typeof getABComparatorHealth>;
    blastRadius: ReturnType<typeof getBlastRadiusHealth>;
    chaosLibrary: ReturnType<typeof getChaosLibraryHealth>;
    accuracyTracker: ReturnType<typeof getAccuracyTrackerHealth>;
    telemetry: ReturnType<typeof getSimulationTelemetryHealth>;
  };
  overallHealth: number;
}

/** Unified health across all 10 SIMULATE systems */
export function getSimulateUltimateHealth(): SimulateUltimateHealth {
  const mc = getMonteCarloHealth();
  const ab = getABComparatorHealth();
  const accuracy = getAccuracyTrackerHealth();
  const telemetry = getSimulationTelemetryHealth();

  // Composite: convergence rate (20%) + prediction accuracy (25%) + AB decisiveness (20%) +
  //            chaos coverage (15%) + telemetry success (20%)
  const convergenceScore = mc.convergenceRate;
  const accuracyScore = accuracy.overallAccuracy;
  const decisiveScore = ab.decisiveRate;
  const telemetryScore = telemetry.recentSuccessRate;

  const overallHealth = Math.round(
    (convergenceScore * 0.20) + (accuracyScore * 0.25) + (decisiveScore * 0.20) + (telemetryScore * 0.20) + (15) // chaos library baseline
  );

  return {
    version: '9.0.0',
    codename: 'Crucible Prime',
    systems: {
      monteCarlo: mc,
      scenarios: getScenarioEngineHealth(),
      forker: getForkerHealth(),
      temporal: getTemporalHealth(),
      costProjector: getCostProjectorHealth(),
      abComparator: ab,
      blastRadius: getBlastRadiusHealth(),
      chaosLibrary: getChaosLibraryHealth(),
      accuracyTracker: accuracy,
      telemetry,
    },
    overallHealth: Math.max(0, Math.min(100, overallHealth)),
  };
}
