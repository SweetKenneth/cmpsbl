/**
 * CMPSBL® Canonical Runtime Contract
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single source of truth for the Mini-Runtime™ execution contract.
 * 
 * ARCHITECTURE RULE: There is exactly ONE canonical Mini Runtime (TypeScript).
 * All other language exports are thin bridge adapters that:
 *   1. Attempt remote execution via the canonical runtime (network mode)
 *   2. Fall back to deterministic local execution (offline mode)
 *   3. Never duplicate CJPI weights, tier thresholds, saga logic, or graph internals
 *
 * This file defines the universal contract that all bridges implement.
 * 
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — EXECUTION CONTRACT (language-agnostic)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The universal execution contract that all bridges must implement.
 * Conceptually identical across substrate, portable, and sealed modes.
 */
export interface RuntimeContract {
  /** Execute a discovered module chain through the runtime */
  executeChain(manifest: ChainManifestContract, input: Record<string, unknown>, options?: ExecutionOptions): Promise<ChainResult>;
  /** Execute a single primitive through the resolution hierarchy */
  executePrimitive(name: string, data: Record<string, unknown>, confidence: number, options?: PrimitiveOptions): Promise<PrimitiveResult>;
  /** Validate capability metadata without execution */
  validateCapability(meta: CapabilityMeta): ValidationResult;
  /** Get current runtime connectivity mode */
  getRuntimeMode(): RuntimeMode;
  /** Configure the canonical runtime endpoint (null = offline only) */
  configureEndpoint(url: string | null): void;
  /** Get execution telemetry snapshot */
  getExecutionTelemetry(): ReadonlyArray<ExecutionTelemetryEntry>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SHARED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Runtime connectivity mode — same across all bridges */
export type RuntimeMode = 'offline' | 'hybrid' | 'network';

/** Bridge classification — what kind of adapter is this? */
export type BridgeType = 'network' | 'hybrid' | 'offline-fallback';

/** Runtime deployment context */
export type RuntimeType = 'substrate' | 'portable' | 'sealed';

/** Chain manifest — minimal contract for chain execution */
export interface ChainManifestContract {
  id: string;
  name: string;
  description: string;
  modules: string[];
  cjpiScore: number;
  tier: string;
  category: string;
  sourceLanguage?: string;
  discoveredAt: string;
}

/** Execution options shared across all modes */
export interface ExecutionOptions {
  stageTimeoutMs?: number;
  continueOnFailure?: boolean;
  telemetry?: boolean;
}

/** Primitive execution options */
export interface PrimitiveOptions {
  confidence?: number;
  timeout?: number;
}

/** Chain execution result — normalized across all bridges */
export interface ChainResult {
  success: boolean;
  output: Record<string, unknown>;
  confidence: number;
  totalDurationMs: number;
  stagesCompleted: number;
  totalStages: number;
  trace: StageTraceEntry[];
  runtimeMode: RuntimeMode;
  bridgeType: BridgeType;
  fingerprint: string;
  executedAt: string;
  /** Integrity validation echoed from canonical runtime */
  validated: boolean;
  /** Validation errors (empty = clean) */
  validationErrors: string[];
  /** Whether result is degraded due to integrity failure */
  degraded?: boolean;
}

/** Stage trace entry — per-module execution record */
export interface StageTraceEntry {
  module: string;
  verb: string;
  status: 'success' | 'recovered' | 'fallback' | 'failed';
  durationMs: number;
  depth: 'remote' | 'local' | 'fallback';
}

/** Primitive execution result */
export interface PrimitiveResult {
  data: Record<string, unknown>;
  confidence_delta: number;
  signal: string;
  wasRemote: boolean;
  mode: RuntimeMode;
}

/** Capability metadata for validation */
export interface CapabilityMeta {
  id: string;
  name: string;
  modules: string[];
  cjpiScore: number;
  tier: string;
  category: string;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Telemetry entry — standardized across all bridges */
export interface ExecutionTelemetryEntry {
  primitive: string;
  wasRemote: boolean;
  success: boolean;
  usedFallback: boolean;
  mode: RuntimeMode;
  timestamp: number;
  durationMs: number;
  bridgeType: BridgeType;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — BRIDGE METADATA (embedded in every generated bridge)
// ═══════════════════════════════════════════════════════════════════════════════

/** Metadata embedded in every generated bridge adapter */
export interface BridgeMetadata {
  /** Bridge language (e.g., 'php', 'java', 'rust') */
  language: string;
  /** Bridge classification */
  bridgeType: BridgeType;
  /** Runtime type context */
  runtimeType: RuntimeType;
  /** Canonical runtime version this bridge targets */
  canonicalVersion: string;
  /** Whether this bridge can operate offline */
  offlineCapable: boolean;
  /** Capabilities this bridge wraps (from manifest) */
  capabilities: string[];
  /** Generated timestamp */
  generatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — CANONICAL CONSTANTS (single source of truth)
// ═══════════════════════════════════════════════════════════════════════════════

/** Current canonical runtime version */
export const CANONICAL_RUNTIME_VERSION = '14.3.0';

/** Default canonical execution endpoint */
export const CANONICAL_ENDPOINT = 'https://api.cmpsbl.com/v1/substrate/primitive';

/** Network mode threshold (consecutive remote successes) */
export const NETWORK_MODE_THRESHOLD = 5;

/** Offline mode threshold (consecutive remote failures) */
export const OFFLINE_MODE_THRESHOLD = 3;

/** Maximum telemetry buffer size */
export const MAX_TELEMETRY_BUFFER = 500;

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — ANTI-DRIFT RULES (enforced by architecture tests)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ANTI-DRIFT RULE: These items MUST ONLY exist in the canonical TS runtime.
 * No language bridge/generator may duplicate them.
 * Architecture tests validate this constraint.
 */
export const CANONICAL_ONLY_CONCERNS = [
  'CJPI weight allocations',
  'Tier threshold values', 
  'Synergy multiplier formula',
  'Saga orchestration logic',
  'Dependency graph traversal',
  'Pipeline composition/validation',
  'Module effect resolution',
  'Finite state machine internals',
  'Discovery reactor templates',
] as const;

/**
 * BRIDGE-ALLOWED CONCERNS: These may exist in language bridges.
 */
export const BRIDGE_ALLOWED_CONCERNS = [
  'Capability metadata embedding',
  'Context shape (data, signals, errors)',
  'Trace shape (stage, module, status, duration)',
  'Validation shape (valid, errors, warnings)',
  'Deterministic fallback output',
  'Remote endpoint configuration',
  'Runtime mode reporting',
  'Telemetry recording',
] as const;
