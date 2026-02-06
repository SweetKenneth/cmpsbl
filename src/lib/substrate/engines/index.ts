/**
 * Cognitive Engine System
 * v7.7.0 — ENGINE+ Epoch: 20 Engines Orchestrating 76 Capabilities
 * 
 * The Engine System consolidates individual capabilities into
 * compound execution units that provide:
 * 
 * 1. **Synergy Amplification** — Combined capabilities produce 2-3x value
 * 2. **IP Protection** — Complex orchestration harder to replicate
 * 3. **Simplified API** — Fewer, more powerful abstractions
 * 4. **Optimized Execution** — Shared context, batched operations
 * 
 * Engine Categories:
 * - Cognitive (4): Reasoning, Learning, Memory, Foresight
 * - Operational (4): Resilience, Optimization, Orchestration, Scheduling
 * - Intelligence (4): Synthesis, Adaptation, Insight, Prediction
 * - Governance (3): Compliance, Quality, Audit
 * - Security (3): Threat, Defense, Trust
 * - Evolution (2): Evolution, Modernization
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
