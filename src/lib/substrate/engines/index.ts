/**
 * Cognitive Engine System
 * v9.1.0 — ARCHITECT Epoch: World-First Enhancement Integration
 * 
 * Architecture: Capabilities (400+) → Engines (76) → Meta-Engines (24)
 * 
 * The Engine System consolidates individual capabilities into
 * compound execution units that provide:
 * 
 * 1. **Synergy Amplification** — Combined capabilities produce 2-8x value
 * 2. **IP Protection** — Complex orchestration harder to replicate
 * 3. **Simplified API** — Fewer, more powerful abstractions
 * 4. **Optimized Execution** — Shared context, batched operations
 * 
 * Engine Categories (18):
 * - Cognitive (4): Reasoning, Learning, Memory, Foresight
 * - Operational (4): Resilience, Optimization, Orchestration, Scheduling
 * - Intelligence (4): Synthesis, Adaptation, Insight, Prediction
 * - Governance (3): Compliance, Quality, Audit
 * - Security (3): Threat, Defense, Trust
 * - Evolution (2): Evolution, Modernization
 * - Communication (2): Broadcast, Event
 * - Integration (2): Routing, Transformation
 * - Analytics (2): Monitoring, Capacity
 * - Experience (2): Accessibility, Personalization
 * - Knowledge (2): Graph, Context
 * - Autonomy (2): Self-Healing, Self-Documentation
 * - Creativity (3): Imagination, Innovation, Dream
 * - Perception (3): Intent, Emotion, Multimodal
 * - Resource (3): Budget, Quota, Entitlement
 * - Workflow (3): Pipeline, Coordination, Delegation
 * - Enhancement (14): World-First Enhancement Engines (v8.1.0)
 * - Orchestration (0): Reserved for future high-level orchestration
 * 
 * Meta-Engine Categories (20):
 * - Cognitive (2): cognitive_mesh, world_first_cognitive
 * - Protection (2): system_guardian, security_fortress
 * - Autonomous (2): autonomous_operator, world_first_operational
 * - Governance (2): quality_fabric, world_first_governance
 * - Intelligence (2): intelligence_pipeline, world_first_intelligence
 * - Experience (1): adaptation_suite
 * - Performance (1): performance_optimizer
 * - Communication (1): event_fabric
 * - Integration (1): data_highway
 * - Knowledge (1): knowledge_nexus
 * - Self-Management (1): self_governance
 * - Creativity (1): creative_forge
 * - Perception (1): perception_matrix
 * - Resource (1): resource_governor
 * - Workflow (1): workflow_orchestrator
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
  
  // Communication (v7.9.0)
  executeBroadcastEngine,
  executeEventEngine,
  
  // Integration (v7.9.0)
  executeRoutingEngine,
  executeTransformationEngine,
  
  // Analytics (v7.9.0)
  executeMonitoringEngine,
  executeCapacityEngine,
  
  // Experience (v7.9.0)
  executeAccessibilityEngine,
  executePersonalizationEngine,
  
  // Knowledge (v7.9.0)
  executeGraphEngine,
  executeContextEngine,
  
  // Autonomy (v7.9.0)
  executeSelfHealingEngine,
  executeSelfDocumentationEngine,
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
  // v7.9.0 additions
  executeEventFabric,
  executeDataHighway,
  executeKnowledgeNexus,
  executeSelfGovernance,
  // v8.1.0 additions
  executeWorldFirstCognitive,
  executeWorldFirstOperational,
  executeWorldFirstIntelligence,
  executeWorldFirstGovernance,
} from './meta';

// Meta-Engine Hook
export { useMetaEngines } from './meta';
