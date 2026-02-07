/**
 * Meta-Engine System
 * v8.1.0 — SYNERGY+ Epoch: World-First Enhancement Integration
 * 
 * Architecture: Capabilities (269) → Engines (62) → Meta-Engines (20)
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
  // v8.0.0 additions
  executeCreativeForge,
  executePerceptionMatrix,
  executeResourceGovernor,
  executeWorkflowOrchestrator,
  // v8.1.0 additions — World-First Enhancement Meta-Engines
  executeWorldFirstCognitive,
  executeWorldFirstOperational,
  executeWorldFirstIntelligence,
  executeWorldFirstGovernance,
} from './executors';

// Hook
export { useMetaEngines } from './useMetaEngines';
