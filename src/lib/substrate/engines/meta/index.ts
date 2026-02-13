/**
 * Meta-Engine System
 * v9.1.0 ARCHITECT — High-Value Expansion
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
} from './executors';

// Hook
export { useMetaEngines } from './useMetaEngines';
