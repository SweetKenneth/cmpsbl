/**
 * Meta-Engine System
 * v7.8.0 — 8 Meta-Engines Orchestrating 20 Engines → 76 Capabilities
 * 
 * The Meta-Engine layer provides the highest level of abstraction:
 * 
 * Architecture: Capabilities (76) → Engines (20) → Meta-Engines (8)
 * 
 * Meta-Engines consolidate multiple engines into unified execution
 * pipelines with compound synergy multipliers (4.6x - 7.4x).
 * 
 * Categories:
 * - Cognitive (1): cognitive_mesh
 * - Protection (2): system_guardian, security_fortress
 * - Autonomous (1): autonomous_operator
 * - Governance (1): quality_fabric
 * - Intelligence (1): intelligence_pipeline
 * - Experience (1): adaptation_suite
 * - Performance (1): performance_optimizer
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
} from './executors';

// Hook
export { useMetaEngines } from './useMetaEngines';
