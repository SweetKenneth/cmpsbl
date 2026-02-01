/**
 * Capability System Types
 * v7.0.0 — Auto-Adapt Edge Function Ingestion
 */

export type CapabilityRisk = 'low' | 'medium' | 'high';
export type CapabilityStatus = 'active' | 'deprecated' | 'pending' | 'blocked';
export type OverlapClassification = 'FULL' | 'PARTIAL' | 'NONE';

export interface CapabilityMetadata {
  name: string;
  modules: string[];
  risk: CapabilityRisk;
  reversible: boolean;
  description: string;
  version?: string;
}

export interface RegisteredCapability {
  id: string;
  name: string;
  source: 'edge-adapted' | 'native' | 'legacy';
  edgeFunctionPath?: string;
  modules: string[];
  risk: CapabilityRisk;
  reversible: boolean;
  description: string;
  status: CapabilityStatus;
  registeredAt: string;
  lastInvokedAt?: string;
  invokeCount: number;
  confidence: number;
}

export interface EdgeFunctionAudit {
  name: string;
  path: string;
  mergedLocations: string[];
  overlap: OverlapClassification;
  deletionRecommended: boolean;
  reason: string;
  hasMetadata: boolean;
  metadata?: CapabilityMetadata;
}

export interface ScanAdaptResult {
  timestamp: string;
  mode: 'dry-run' | 'confirm' | 'prune-unused';
  findings: EdgeFunctionAudit[];
  adaptedCount: number;
  deletedCount: number;
  blockedCount: number;
  errors: string[];
}

export interface CapabilityInvocation {
  capabilityId: string;
  input: Record<string, unknown>;
  callerModule: string;
  timestamp: string;
}

export interface CapabilityResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  confidence: number;
  executionMs: number;
}

export interface CapabilityGuardContext {
  capability: RegisteredCapability;
  caller: string;
  input: Record<string, unknown>;
}

export interface GuardResult {
  allowed: boolean;
  reason?: string;
  riskLevel: CapabilityRisk;
}
