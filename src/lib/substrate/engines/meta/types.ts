/**
 * Meta-Engine Types
 * v7.8.0 — Meta-Engine Orchestration Layer
 * 
 * Meta-Engines orchestrate multiple engines into unified execution pipelines.
 * This creates a 3-layer architecture: Capabilities → Engines → Meta-Engines
 */

import type { EngineId, EngineExecutionResult } from '../types';

// ============================================================================
// META-ENGINE CATEGORIES
// ============================================================================

export type MetaEngineCategory =
  | 'cognitive'      // Full cognitive stack orchestration
  | 'protection'     // System security and resilience
  | 'autonomous'     // Self-driving operations
  | 'governance'     // End-to-end compliance
  | 'intelligence'   // Full intelligence workflows
  | 'experience'     // User experience evolution
  | 'performance';   // Resource optimization

// ============================================================================
// META-ENGINE DEFINITIONS
// ============================================================================

export type MetaEngineId =
  | 'cognitive_mesh'
  | 'system_guardian'
  | 'autonomous_operator'
  | 'quality_fabric'
  | 'intelligence_pipeline'
  | 'adaptation_suite'
  | 'security_fortress'
  | 'performance_optimizer';

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
