/**
 * Cognitive Engine System
 * v7.8.0 — ENGINE+ Epoch: 3-Layer Orchestration Architecture
 * 
 * Architecture: Capabilities (76) → Engines (20) → Meta-Engines (8)
 * 
 * The Engine System consolidates individual capabilities into
 * compound execution units that provide:
 * 
 * 1. **Synergy Amplification** — Combined capabilities produce 2-3x value
 * 2. **IP Protection** — Complex orchestration harder to replicate
 * 3. **Simplified API** — Fewer, more powerful abstractions
 * 4. **Optimized Execution** — Shared context, batched operations
 * 
 * Engine Categories (20):
 * - Cognitive (4): Reasoning, Learning, Memory, Foresight
 * - Operational (4): Resilience, Optimization, Orchestration, Scheduling
 * - Intelligence (4): Synthesis, Adaptation, Insight, Prediction
 * - Governance (3): Compliance, Quality, Audit
 * - Security (3): Threat, Defense, Trust
 * - Evolution (2): Evolution, Modernization
 * 
 * Meta-Engine Categories (8):
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
  EngineCategory,
  EngineId,
  EngineDefinition,
  EngineExecutionContext,
  EngineExecutionOptions,
  EngineCapabilityResult,
  EngineExecutionResult,
  EngineState,
  EngineRegistry,
  EngineExecutor,
  EngineSummary,
} from './types';

// Registry
export {
  ENGINE_REGISTRY,
  ENGINE_IDS,
  ENGINES_BY_CATEGORY,
  getEngine,
  listEngines,
  getEnginesByCategory,
  getEnginesByModule,
  getEngineCapabilityCount,
  getTotalCapabilitiesOrchestrated,
  getEngineSummary,
} from './registry';

// Executors
export {
  ENGINE_EXECUTORS,
  runEngine,
  runEnginesBatch,
  
  // Cognitive
  executeReasoningEngine,
  executeLearningEngine,
  executeMemoryEngine,
  executeForesightEngine,
  
  // Operational
  executeResilienceEngine,
  executeOptimizationEngine,
  executeOrchestrationEngine,
  executeSchedulingEngine,
  
  // Intelligence
  executeSynthesisEngine,
  executeAdaptationEngine,
  executeInsightEngine,
  executePredictionEngine,
  
  // Governance
  executeComplianceEngine,
  executeQualityEngine,
  executeAuditEngine,
  
  // Security
  executeThreatEngine,
  executeDefenseEngine,
  executeTrustEngine,
  
  // Evolution
  executeEvolutionEngine,
  executeModernizationEngine,
} from './executors';

// Hook
export { useEngines } from './useEngines';

// ============================================================================
// META-ENGINE LAYER (v7.8.0)
// ============================================================================

// Meta-Engine Types
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
} from './meta';

// Meta-Engine Registry
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
} from './meta';

// Meta-Engine Executors
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
} from './meta';

// Meta-Engine Hook
export { useMetaEngines } from './meta';
