/**
 * Synergy System Exports
 * v8.0.0 SYNERGY+ — Cross-Module Pipeline Infrastructure (147 Pipelines, 125 Executors, 32 S-tier)
 */

// Types
export type {
  SynergyCategory,
  SynergyStatus,
  SynergyModule,
  SynergyDefinition,
  SynergyExecutionContext,
  SynergyStepResult,
  SynergyResult,
  SynergyRegistry,
  SynergyExecutor,
} from './types';

// Registry
export {
  SYNERGY_DEFINITIONS,
  initSynergyRegistry,
  registerSynergyExecutor,
  getSynergy,
  getSynergyExecutor,
  listSynergies,
  getSynergiesByModule,
  getSynergyCategories,
} from './registry';

// Engine
export {
  executeSynergy,
  dryRunSynergy,
  getRecommendedSynergies,
} from './engine';

// Executors
export {
  registerAllExecutors,
  // Original 8 executors
  executeSmartRecall,
  executeAdaptiveRouting,
  executeGracefulDegradation,
  executeLearningAcceleration,
  executeCascadePrevention,
  executeAnomalyCorrelation,
  executeCognitiveFusion,
  executeIntentAmplification,
  // v7.0 executors
  executeExternalApiIntelligence,
  executeEntitlementAwareRouting,
  executeAutonomousEvolution,
  executeEndToEndReasoning,
  executeBoundedAutonomyGuard,
  // v7.1 executors
  executeContextualPreload,
  executeSemanticDeduplication,
  executeBehavioralFingerprinting,
  executeZeroTrustValidation,
  executeWorkflowSynthesis,
  executeMultiAgentCoordination,
  executeCognitiveLoadOptimization,
  executeHypothesisTesting,
  executeKnowledgeDistillation,
  // v7.2 executors
  executeCapacityForecasting,
  executeCostOptimizationEngine,
  executeCausalInference,
  executeEmergentPatternDetection,
  executeThreatPrediction,
  executeComplianceAutomation,
  executePredictiveHealing,
  executeChaosResilience,
  executeSLAGuardian,
  executeResourceContentionResolver,
  // v7.3 executors
  executeRecursiveSelfImprovement,
  executeTemporalReasoning,
  executeCounterfactualAnalysis,
  executeSemanticBridge,
  executeGoalDecomposition,
  executeAutonomousRepair,
  executeProactiveScaling,
  executeCrossModalSynthesis,
  executeConsensusReasoning,
  executeAttackSurfaceMapping,
  executePrivilegeEscalationDetection,
  executeDataExfiltrationGuard,
  executeTokenBudgetOptimizer,
  executeResponseQualityCalibration,
  executeCacheCoherence,
  executeBlastRadiusContainment,
  executeStateCheckpointRecovery,
  executeDependencyHealthCascade,
  executeCrossTeamCoordination,
  executePipelineOrchestration,
  executeUniversalDesignSynthesis,
  executeAdaptivePersonalization,
  // v7.4 executors (22)
  executeHolisticSystemInsight,
  executeMetaCognitiveReflection,
  executeNeuralSymbolicFusion,
  executeCognitiveLoadBalancer,
  executeIntentEvolutionChain,
  executeZeroDayDefense,
  executeComprehensiveAuditTrail,
  executeAdaptiveThreatResponse,
  executeDistributedRecoveryOrchestration,
  executeIntelligentFailoverChain,
  executeCognitiveStatePreservation,
  executeFullStackEvolution,
  executeMultiModalTaskRouting,
  executeAdaptiveWorkflowEngine,
  executePredictiveResourceAllocation,
  executeIntelligentBatchProcessing,
  executeCostAwareRouting,
  executeComprehensiveAccessibilityAudit,
  executeAdaptiveContentTransformation,
  executeSelfDocumentingEvolution,
  executeIntelligentDeprecationManager,
  executeAutonomousOptimizationLoop,
  // Discovery executors (27 additional pipelines)
  executeMetaLearningOrchestrator,
  executeIntentAccessibilitySynthesis,
  executeThreatIntelligenceMesh,
  executeResourceGovernanceEngine,
  executeReasoningQualityAmplifier,
  executeSecureEvolutionPipeline,
  executeExternalApiGuardian,
  executeCreativeProblemSolver,
  executeUsagePatternIntelligence,
  executePersonalizedAccessibilityEngine,
  executeAdaptiveConfigurationIntelligence,
  executeEventDrivenOrchestration,
} from './executors';

// S-tier exports
export * from './stier';

// Operations integration
export * from './operations';

// Auto-register executors
import { registerSynergyExecutor } from './registry';
import { registerAllExecutors } from './executors';
import { registerSTierExecutors } from './stier';
registerAllExecutors(registerSynergyExecutor);
registerSTierExecutors(registerSynergyExecutor);
