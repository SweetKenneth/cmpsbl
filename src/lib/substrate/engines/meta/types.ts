/**
 * Meta-Engine Types
 * 24 Meta-Engines orchestrating 76 base engines
 * 
 * Meta-Engines orchestrate multiple engines into unified execution pipelines.
 * 3-layer architecture: 379 Capabilities → 76 Engines → 24 Meta-Engines
 */

import type { EngineId, EngineExecutionResult } from '../types';

// ============================================================================
// META-ENGINE CATEGORIES — 15 Total
// ============================================================================

export type MetaEngineCategory =
  | 'cognitive'       // Full cognitive stack orchestration
  | 'protection'      // System security and resilience
  | 'autonomous'      // Self-driving operations
  | 'governance'      // End-to-end compliance
  | 'intelligence'    // Full intelligence workflows
  | 'experience'      // User experience evolution
  | 'performance'     // Resource optimization
  | 'communication'   // Event-driven orchestration
  | 'integration'     // Cross-system coordination
  | 'knowledge'       // Knowledge management
  | 'self_management' // Autonomous self-management
  | 'creativity'      // Creative and innovation workflows
  | 'perception'      // Understanding and intent
  | 'resource'        // Budget and quota management
  | 'workflow';       // Complex workflow orchestration

// ============================================================================
// META-ENGINE DEFINITIONS — 16 Total
// ============================================================================

export type MetaEngineId =
  // Original 8
  | 'cognitive_mesh'
  | 'system_guardian'
  | 'autonomous_operator'
  | 'quality_fabric'
  | 'intelligence_pipeline'
  | 'adaptation_suite'
  | 'security_fortress'
  | 'performance_optimizer'
  // v7.9.0 additions (4)
  | 'event_fabric'
  | 'data_highway'
  | 'knowledge_nexus'
  | 'self_governance'
  // Expansion additions (4)
  | 'creative_forge'         // Imagination + Innovation + Dream
  | 'perception_matrix'      // Intent + Emotion + Multimodal
  | 'resource_governor'      // Budget + Quota + Entitlement
  | 'workflow_orchestrator'  // Pipeline + Coordination + Delegation
  // World-First Enhancement Meta-Engines (4)
  | 'world_first_cognitive'     // BRAIN + DECODE + DREAM world-first enhancements
  | 'world_first_operational'   // NEXUS + SYSTEM + CORE + INTEGRATION world-first enhancements
  | 'world_first_intelligence'  // VISION + CORTEX + EVOLUTION world-first enhancements
  | 'world_first_governance'    // DEFENSE + ACCESS + RIPPLE + INCLUSIVE world-first enhancements
  // High-Value Expansion Meta-Engines (2)
  | 'resilience_shield'         // Sandbox + Prompt Safety + Saga + Policy Access
  | 'deep_cognition_nexus'      // Deep Cognition + Dialogue + Observability + Tech Debt
  // v9.0.0 additions (2) — Infrastructure Cross-Module Meta-Engines
  | 'enterprise_trust_fabric'   // Zero Trust + Compliance Audit + Relay Encryption
  | 'platform_economics_engine' // FinOps + Knowledge Retrieval + Revenue Attribution
  // Discovered High-Value Meta-Engines
  | 'memory_intelligence_fabric'  // Memory + Deep Cognition + Knowledge Retrieval + Attention Memory + Salience
  | 'immune_autonomy_mesh';       // Immune + Self-Healing + System Resilience + Resilience Engine

export interface MetaEngineDefinition {
  id: MetaEngineId;
  name: string;
  description: string;
  category: MetaEngineCategory;
  engines: EngineId[];
  
  // Compound metrics
  totalCapabilities: number;
  compoundSynergyMultiplier: number;
  complexityScore: number;
  
  // Execution
  orchestrationMode: 'cascade' | 'parallel' | 'adaptive' | 'staged';
  estimatedLatencyMs: number;
  
  // Value
  enterpriseValue: 'standard' | 'premium' | 'enterprise';
  useCases: string[];
}

export interface MetaEngineExecutionContext {
  metaEngineId: MetaEngineId;
  input: Record<string, unknown>;
  caller: string;
  traceId: string;
  options?: MetaEngineExecutionOptions;
}

export interface MetaEngineExecutionOptions {
  timeout?: number;
  skipEngines?: EngineId[];
  dryRun?: boolean;
  verbose?: boolean;
  stopOnFailure?: boolean;
}

export interface MetaEngineStageResult {
  engineId: EngineId;
  result: EngineExecutionResult;
  stageIndex: number;
}

export interface MetaEngineExecutionResult<T = unknown> {
  metaEngineId: MetaEngineId;
  success: boolean;
  data?: T;
  error?: string;
  
  // Execution metrics
  totalDurationMs: number;
  enginesExecuted: number;
  capabilitiesOrchestrated: number;
  stageResults: MetaEngineStageResult[];
  
  // Compound value
  compoundSynergyGain: number;
  confidenceScore: number;
  
  // Trace
  traceId: string;
  timestamp: string;
}

export interface MetaEngineSummary {
  totalMetaEngines: number;
  totalEnginesOrchestrated: number;
  totalCapabilitiesReached: number;
  averageCompoundSynergy: number;
  byCategory: Record<MetaEngineCategory, number>;
}

export type MetaEngineExecutor<T = unknown> = (
  context: MetaEngineExecutionContext
) => Promise<MetaEngineExecutionResult<T>>;
