/**
 * Meta-Engine System
 * v10.5.4 ARCHITECT — High-Value Expansion
 * 
 * Architecture: Capabilities (400+) → Engines (76) → Meta-Engines (24)
 * 
 * Meta-Engines consolidate multiple engines into unified execution
 * pipelines with compound synergy multipliers (4.6x - 8.2x).
 */

// Types
export type {
  MetaEngineCategory,
  MetaEngineId,
  MetaEngineDefinition,
  MetaEngineExecutionContext,
  MetaEngineExecutionOptions,
  MetaEngineStageResult,
  MetaEngineExecutionResult,
  MetaEngineSummary,
  MetaEngineExecutor,
} from './types';

// Registry
export {
  META_ENGINE_REGISTRY,
  META_ENGINE_IDS,
  META_ENGINES_BY_CATEGORY,
  getMetaEngine,
  listMetaEngines,
  getMetaEnginesByCategory,
  getMetaEnginesByEngine,
  getTotalCapabilitiesReached,
  getMetaEngineSummary,
} from './registry';

// Executors
export {
  META_ENGINE_EXECUTORS,
  runMetaEngine,
  runMetaEnginesBatch,
  executeCognitiveMesh,
  executeSystemGuardian,
  executeAutonomousOperator,
  executeQualityFabric,
  executeIntelligencePipeline,
  executeAdaptationSuite,
  executeSecurityFortress,
  executePerformanceOptimizer,
  // v7.9.0 additions
  executeEventFabric,
  executeDataHighway,
  executeKnowledgeNexus,
  executeSelfGovernance,
  // Expansion additions
  executeCreativeForge,
  executePerceptionMatrix,
  executeResourceGovernor,
  executeWorkflowOrchestrator,
  // v8.1.0 additions — World-First Enhancement Meta-Engines
  executeWorldFirstCognitive,
  executeWorldFirstOperational,
  executeWorldFirstIntelligence,
  executeWorldFirstGovernance,
  // High-Value Expansion Meta-Engines
  executeResilienceShield,
  executeDeepCognitionNexus,
  // v9.0.0 additions — Infrastructure Cross-Module Meta-Engines
  executeEnterpriseTrustFabric,
  executePlatformEconomicsEngine,
  // v10.9.0 additions — Discovered High-Value Meta-Engines
  executeMemoryIntelligenceFabric,
  executeImmuneAutonomyMesh,
} from './executors';

// Hook
export { useMetaEngines } from './useMetaEngines';
