/**
 * Synergy System Types
 * v7.0.0 — Cross-Module Pipeline Definitions
 */

export type SynergyCategory = 
  | 'optimization'      // Speed/cost improvements
  | 'intelligence'      // Enhanced reasoning/learning
  | 'resilience'        // Fault tolerance/recovery
  | 'security'          // Hardening/protection
  | 'accessibility'     // Inclusive design
  | 'automation';       // Autonomous workflows

export type SynergyStatus = 'ready' | 'running' | 'completed' | 'failed' | 'disabled';

export interface SynergyModule {
  name: string;
  role: 'primary' | 'enhancer' | 'validator' | 'fallback';
  required: boolean;
}

export interface SynergyDefinition {
  id: string;
  name: string;
  description: string;
  category: SynergyCategory;
  modules: SynergyModule[];
  risk: 'low' | 'medium' | 'high';
  reversible: boolean;
  estimatedMs: number;
  minModulesRequired: number;
}

export interface SynergyExecutionContext {
  synergyId: string;
  input: Record<string, unknown>;
  caller: string;
  traceId: string;
  dryRun: boolean;
}

export interface SynergyStepResult {
  module: string;
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

export interface SynergyResult<T = unknown> {
  success: boolean;
  synergyId: string;
  data?: T;
  error?: string;
  steps: SynergyStepResult[];
  totalDurationMs: number;
  confidence: number;
  enhancement: {
    speedMultiplier: number;
    qualityGain: number;
    costSavings: number;
  };
}

export interface SynergyRegistry {
  synergies: Map<string, SynergyDefinition>;
  executors: Map<string, SynergyExecutor>;
}

export type SynergyExecutor<T = unknown> = (
  context: SynergyExecutionContext
) => Promise<SynergyResult<T>>;
