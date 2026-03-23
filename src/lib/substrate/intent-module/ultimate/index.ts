/**
 * INTENT Ultimate — "Compass Prime" v9.0.0
 * 
 * The substrate's Executive Function — intelligent intent resolution,
 * goal decomposition, and predictive orchestration engine.
 * 
 * @module intent/ultimate
 * @version 9.0.0 — Compass Prime
 */

// System 1: Polyvalent Intent Classifier
export {
  classifyIntent, getClassificationHistory, getClassifierHealth, resetClassifier,
  type IntentClassification, type ClassificationVote, type ClassificationStrategy,
} from './polyvalentClassifier';

// System 2: Goal Decomposition Engine (DAG)
export {
  decomposeGoal, getReadyActions, completeAction,
  getActionPlan, getAllPlans, getDecompositionHealth, resetDecomposition,
  type ActionPlan, type ActionNode, type GoalType,
} from './goalDecompositionEngine';

// System 3: Ambiguity Resolution Protocol
export {
  detectAmbiguity, resolveAmbiguity, autoResolve,
  getUnresolvedReports, getLearnedPatterns,
  getAmbiguityHealth, resetAmbiguityResolver,
  type AmbiguityReport, type DisambiguationOption, type AmbiguityPattern,
} from './ambiguityResolver';

// System 4: Intent Memory & Pattern Recognition
export {
  recordResolution, predictChain, getMemories, getAssociativeGraph,
  getIntentMemoryHealth, resetIntentMemory,
  type IntentMemoryEntry, type IntentEdge, type IntentPrediction,
} from './intentMemory';

// System 5: Priority Arbitration Matrix
export {
  enqueueIntent, arbitrate, markExecuted, getQueue,
  getArbitratorHealth, resetArbitrator,
  type QueuedIntent, type ArbitrationResult, type UrgencyLevel,
} from './priorityArbitrator';

// System 6: Rollback Planning Engine
export {
  createRollbackPlan, createCheckpoint, getCheckpoint, executeRollback,
  getRollbackPlan, getRollbackHealth, resetRollbackPlanner,
  type RollbackPlan, type RollbackStep, type RollbackStrategy,
} from './rollbackPlanner';

// System 7: Contextual Amplification Layer
export {
  amplifyIntent, setSessionContext, clearSessionContext,
  getAmplifierHealth, resetAmplifier,
  type AmplifiedIntent, type ContextSignal, type ContextSource,
} from './contextAmplifier';

// System 8: Execution Telemetry & Feedback Loop
export {
  beginTracking, recordPhase, getLifecycle, getActiveLifecycles,
  generateSnapshot, getTelemetryHealth, resetTelemetry,
  type IntentLifecycle, type IntentLifecycleEvent, type IntentPhase, type TelemetrySnapshot,
} from './executionTelemetry';

// System 9: Cross-Node Orchestration Protocol
export {
  updateNodeCapacity, routeIntent, createOrchestrationPlan,
  getRouteHistory, getOrchestratorHealth, resetOrchestrator,
  type NodeCapacity, type RouteDecision, type OrchestrationPlan,
} from './crossNodeOrchestrator';

// System 10: Speculative Pre-Resolution
export {
  recordAndPredict, getPredictionStats, getLearnedSequences,
  getPreResolverHealth, resetPreResolver,
  type PreResolution, type IntentSequence, type PredictionStats,
} from './speculativePreResolver';

// ── Unified Health ─────────────────────────────────────────────

import { getClassifierHealth } from './polyvalentClassifier';
import { getDecompositionHealth } from './goalDecompositionEngine';
import { getAmbiguityHealth } from './ambiguityResolver';
import { getIntentMemoryHealth } from './intentMemory';
import { getArbitratorHealth } from './priorityArbitrator';
import { getRollbackHealth } from './rollbackPlanner';
import { getAmplifierHealth } from './contextAmplifier';
import { getTelemetryHealth } from './executionTelemetry';
import { getOrchestratorHealth } from './crossNodeOrchestrator';
import { getPreResolverHealth } from './speculativePreResolver';

export interface IntentUltimateHealth {
  version: '9.0.0';
  codename: 'Compass Prime';
  systems: {
    classifier: ReturnType<typeof getClassifierHealth>;
    decomposition: ReturnType<typeof getDecompositionHealth>;
    ambiguity: ReturnType<typeof getAmbiguityHealth>;
    memory: ReturnType<typeof getIntentMemoryHealth>;
    arbitrator: ReturnType<typeof getArbitratorHealth>;
    rollback: ReturnType<typeof getRollbackHealth>;
    amplifier: ReturnType<typeof getAmplifierHealth>;
    telemetry: ReturnType<typeof getTelemetryHealth>;
    orchestrator: ReturnType<typeof getOrchestratorHealth>;
    preResolver: ReturnType<typeof getPreResolverHealth>;
  };
  overallHealth: number;
}

/** Unified health assessment across all 10 INTENT systems */
export function getIntentUltimateHealth(): IntentUltimateHealth {
  const classifier = getClassifierHealth();
  const decomposition = getDecompositionHealth();
  const memory = getIntentMemoryHealth();
  const orchestrator = getOrchestratorHealth();
  const preResolver = getPreResolverHealth();
  const telemetry = getTelemetryHealth();

  // Composite: classification accuracy (25%), success rate (25%), orchestration (25%), prediction (25%)
  const classifierScore = classifier.averageConfidence * 100;
  const successScore = telemetry.successRate;
  const orchScore = orchestrator.networkHealth;
  const predictionScore = Math.min(100, preResolver.hitRate + 50); // Base 50 + hit rate bonus

  const overallHealth = Math.round(
    (classifierScore * 0.25) + (successScore * 0.25) + (orchScore * 0.25) + (predictionScore * 0.25)
  );

  return {
    version: '9.0.0',
    codename: 'Compass Prime',
    systems: {
      classifier,
      decomposition,
      ambiguity: getAmbiguityHealth(),
      memory,
      arbitrator: getArbitratorHealth(),
      rollback: getRollbackHealth(),
      amplifier: getAmplifierHealth(),
      telemetry,
      orchestrator,
      preResolver,
    },
    overallHealth: Math.max(0, Math.min(100, overallHealth)),
  };
}
