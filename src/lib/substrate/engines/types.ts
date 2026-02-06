/**
 * Cognitive Engine Types
 * v7.7.0 — Engine-Based Capability Orchestration
 * 
 * Engines consolidate related capabilities into compound execution units.
 * This architecture provides:
 * - Higher-order abstraction over raw capabilities
 * - Optimized cross-capability context sharing
 * - Simplified API surface for consumers
 * - IP protection through orchestration complexity
 */

import type { CapabilityId, ModuleLayer } from '../capabilities';

// ============================================================================
// ENGINE CATEGORIES
// ============================================================================

export type EngineCategory =
  | 'cognitive'      // Reasoning, learning, memory engines
  | 'operational'    // Resilience, optimization, orchestration
  | 'intelligence'   // Synthesis, adaptation, foresight
  | 'governance'     // Compliance, quality, audit
  | 'security'       // Threat, defense, trust
  | 'evolution'      // Self-improvement, modernization
  | 'communication'  // Event, broadcast, subscription
  | 'integration'    // Provider routing, data transformation
  | 'analytics'      // Dashboard, health, capacity
  | 'experience'     // Accessibility, personalization
  | 'knowledge'      // Graph, memory, context
  | 'autonomy';      // Self-documentation, self-healing

// ============================================================================
// ENGINE DEFINITIONS
// ============================================================================

export type EngineId =
  // Cognitive Engines (4)
  | 'reasoning_engine'
  | 'learning_engine'
  | 'memory_engine'
  | 'foresight_engine'
  
  // Operational Engines (4)
  | 'resilience_engine'
  | 'optimization_engine'
  | 'orchestration_engine'
  | 'scheduling_engine'
  
  // Intelligence Engines (4)
  | 'synthesis_engine'
  | 'adaptation_engine'
  | 'insight_engine'
  | 'prediction_engine'
  
  // Governance Engines (3)
  | 'compliance_engine'
  | 'quality_engine'
  | 'audit_engine'
  
  // Security Engines (3)
  | 'threat_engine'
  | 'defense_engine'
  | 'trust_engine'
  
  // Evolution Engines (2)
  | 'evolution_engine'
  | 'modernization_engine'
  
  // Communication Engines (2) — v7.9.0
  | 'broadcast_engine'
  | 'event_engine'
  
  // Integration Engines (2) — v7.9.0
  | 'routing_engine'
  | 'transformation_engine'
  
  // Analytics Engines (2) — v7.9.0
  | 'monitoring_engine'
  | 'capacity_engine'
  
  // Experience Engines (2) — v7.9.0
  | 'accessibility_engine'
  | 'personalization_engine'
  
  // Knowledge Engines (2) — v7.9.0
  | 'graph_engine'
  | 'context_engine'
  
  // Autonomy Engines (2) — v7.9.0
  | 'self_healing_engine'
  | 'self_documentation_engine';

export interface EngineDefinition {
  id: EngineId;
  name: string;
  description: string;
  category: EngineCategory;
  capabilities: CapabilityId[];
  primaryModules: string[];
  layer: ModuleLayer;
  
  // Compound value metrics
  synergyMultiplier: number;      // How much more value vs individual caps
  complexityScore: number;        // IP protection score (1-10)
  autonomyLevel: 'assisted' | 'supervised' | 'autonomous';
  
  // Execution characteristics
  executionMode: 'sequential' | 'parallel' | 'adaptive' | 'streaming';
  averageLatencyMs: number;
  cacheable: boolean;
}

export interface EngineExecutionContext {
  engineId: EngineId;
  input: Record<string, unknown>;
  caller: string;
  traceId: string;
  options?: EngineExecutionOptions;
}

export interface EngineExecutionOptions {
  timeout?: number;
  retries?: number;
  skipCapabilities?: CapabilityId[];
  dryRun?: boolean;
  verbose?: boolean;
}

export interface EngineCapabilityResult {
  capabilityId: CapabilityId;
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

export interface EngineExecutionResult<T = unknown> {
  engineId: EngineId;
  success: boolean;
  data?: T;
  error?: string;
  
  // Execution metrics
  totalDurationMs: number;
  capabilitiesExecuted: number;
  capabilityResults: EngineCapabilityResult[];
  
  // Value metrics
  synergyGain: number;           // Multiplied value from orchestration
  confidenceScore: number;       // 0-1 confidence in result
  
  // Trace
  traceId: string;
  timestamp: string;
}

export interface EngineState {
  enabled: boolean;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  averageLatency: number;
  totalSynergyGain: number;
}

// ============================================================================
// ENGINE REGISTRY TYPE
// ============================================================================

export interface EngineRegistry {
  engines: Map<EngineId, EngineDefinition>;
  states: Map<EngineId, EngineState>;
  executors: Map<EngineId, EngineExecutor>;
}

export type EngineExecutor<T = unknown> = (
  context: EngineExecutionContext
) => Promise<EngineExecutionResult<T>>;

// ============================================================================
// ENGINE SUMMARY
// ============================================================================

export interface EngineSummary {
  totalEngines: number;
  enabledEngines: number;
  byCategory: Record<EngineCategory, number>;
  totalCapabilitiesOrchestrated: number;
  averageSynergyMultiplier: number;
  averageComplexityScore: number;
}
