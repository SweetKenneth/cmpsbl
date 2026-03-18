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
  /** Get current health snapshot */
  getHealthSnapshot(): RuntimeHealthSnapshot;
  /** Get current health score (0–100) */
  getHealthScore(): number;
  /** Reset health state to defaults */
  resetHealthState(): void;
  /** Force a specific runtime mode (test/debug only) */
  forceMode(mode: RuntimeMode | null): void;
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

/** Fallback classification — distinguishes WHY fallback occurred */
export type FallbackReason = 'normal' | 'degraded' | 'offline';

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
  executionId: string;
  /** Integrity validation echoed from canonical runtime */
  validated: boolean;
  /** Validation errors (empty = clean) */
  validationErrors: string[];
  /** Validation warnings (non-fatal) */
  validationWarnings: string[];
  /** Whether result is degraded due to integrity failure */
  degraded: boolean;
  /** Reasons for degradation (empty if not degraded) */
  degradedReasons: string[];
  /** Execution envelope metadata */
  envelope: ExecutionEnvelopeMetadata;
}

/** Stage trace entry — per-module execution record */
export interface StageTraceEntry {
  module: string;
  verb: string;
  status: 'success' | 'recovered' | 'fallback' | 'failed' | 'degraded';
  durationMs: number;
  depth: 'remote' | 'local' | 'fallback' | 'degraded';
  /** Validation status for this stage */
  validation: 'passed' | 'warned' | 'failed' | 'skipped';
  /** Where this stage actually executed */
  stageSource: 'canonical-runtime' | 'bridge-fallback';
  /** Remote latency if stage was attempted remotely */
  remoteLatencyMs?: number;
  /** Local latency if fallback was used */
  localLatencyMs?: number;
}

/** Execution envelope metadata — attached to every result */
export interface ExecutionEnvelopeMetadata {
  executionId: string;
  requestId?: string;
  bridgeLanguage: string;
  bridgeType: BridgeType;
  runtimeMode: RuntimeMode;
  wasRemoteAttempted: boolean;
  wasRemoteUsed: boolean;
  usedFallback: boolean;
  fallbackReason?: FallbackReason;
  validationResult: 'passed' | 'warned' | 'failed';
  healthScoreAtExecution: number;
  modeBeforeExecution: RuntimeMode;
  modeAfterExecution: RuntimeMode;
  canonicalVersion: string;
  capabilityHash: string;
}

/** Primitive execution result */
export interface PrimitiveResult {
  data: Record<string, unknown>;
  confidence_delta: number;
  signal: string;
  wasRemote: boolean;
  mode: RuntimeMode;
  validated: boolean;
  validationErrors: string[];
  degraded: boolean;
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

// ═══════════════════════════════════════════════════════════════════════════════
// §2b — EXECUTION INTEGRITY CONTRACT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Outbound integrity payload — attached to every bridge→canonical request.
 * The canonical runtime validates these fields before execution.
 */
export interface ExecutionIntegrityPayload {
  /** Canonical runtime version this bridge was built against */
  canonicalVersion: string;
  /** Classification of this bridge adapter */
  bridgeType: BridgeType;
  /** Runtime deployment type */
  runtimeType: RuntimeType;
  /** Current execution mode of the bridge */
  executionMode: RuntimeMode;
  /** Stable hash of (name + module_chain + category + tier? + sourceLanguage?) */
  capabilityHash: string;
  /** Separate hash of module chain for independent tamper detection */
  moduleChainHash: string;
  /** Expected CJPI score from bridge metadata */
  expectedCJPI: number;
  /** Manifest fingerprint if available */
  manifestFingerprint?: string;
  /** Generation timestamp if available */
  generatedAt?: string;
}

/**
 * Integrity validation response — echoed by canonical runtime in every response.
 */
export interface IntegrityValidationResult {
  /** Whether all integrity checks passed */
  validated: boolean;
  /** Specific validation errors (empty if clean) */
  validationErrors: string[];
  /** Non-fatal validation warnings */
  validationWarnings: string[];
  /** Recomputed capability hash from canonical side */
  recomputedCapabilityHash: string;
  /** Recomputed module chain hash from canonical side */
  recomputedModuleChainHash: string;
  /** Runtime version that performed validation */
  canonicalVersion: string;
  /** Current runtime mode */
  runtimeMode: RuntimeMode;
  /** Bridge type echoed back */
  bridgeType: BridgeType;
  /** Capability hash echoed back */
  capabilityHash: string;
  /** Unique execution ID for this request */
  executionId: string;
}

/**
 * Degraded execution state — used when integrity validation fails.
 * Bridges MUST NOT silently fall back; they must mark results as degraded.
 */
export interface DegradedExecutionState {
  degraded: true;
  /** Human-readable degradation reasons */
  degradedReasons: string[];
  /** Raw integrity errors that triggered degradation */
  integrityErrors: string[];
  /** Trust band: how much to trust this result */
  trustLevel: 'none' | 'low' | 'medium';
  /** Original trace preserved for debugging */
  trace: StageTraceEntry[];
  /** Fallback classification */
  fallbackReason: FallbackReason;
}

/**
 * Mode transition record — emitted whenever runtime mode changes.
 */
export interface ModeTransitionRecord {
  from: RuntimeMode;
  to: RuntimeMode;
  reason: string;
  healthScoreAtTransition: number;
  timestamp: number;
  /** Whether this was triggered by validation failure vs transport failure */
  triggerType: 'validation' | 'transport' | 'timeout' | 'recovery' | 'manual';
}

/**
 * Normalized execution envelope — wraps every canonical runtime response.
 * Guarantees schema stability across all bridge interactions.
 */
export interface NormalizedExecutionEnvelope<T = unknown> {
  /** Unique execution ID */
  executionId: string;
  /** The actual result data */
  result: T;
  /** Integrity validation outcome */
  validation: IntegrityValidationResult;
  /** Whether execution was degraded */
  degraded: boolean;
  /** Degraded state details (only if degraded) */
  degradedState?: DegradedExecutionState;
  /** Canonical runtime version */
  canonicalVersion: string;
  /** Runtime mode at execution time */
  runtimeMode: RuntimeMode;
  /** Bridge type echoed */
  bridgeType: BridgeType;
  /** Capability hash echoed */
  capabilityHash: string;
  /** Execution timestamp */
  executedAt: string;
  /** Total execution duration */
  totalDurationMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2c — RUNTIME HEALTH SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Runtime health snapshot — lightweight, inspectable state for debugging.
 * Every bridge maintains this rolling state for the canonical endpoint.
 */
export interface RuntimeHealthSnapshot {
  /** Current runtime mode */
  currentMode: RuntimeMode;
  /** Health score 0–100 */
  healthScore: number;
  /** Consecutive remote successes */
  consecutiveSuccesses: number;
  /** Consecutive remote failures */
  consecutiveFailures: number;
  /** Total remote execution attempts */
  totalRemoteAttempts: number;
  /** Total successful remote executions */
  totalRemoteSuccesses: number;
  /** Total fallback executions */
  totalFallbacks: number;
  /** Total validation failures (weighted more heavily) */
  totalValidationFailures: number;
  /** Rolling average remote latency (ms) */
  averageRemoteLatencyMs: number;
  /** Rolling average fallback latency (ms) */
  averageFallbackLatencyMs: number;
  /** Last successful remote execution timestamp */
  lastRemoteSuccessAt: number | null;
  /** Last remote failure timestamp */
  lastRemoteFailureAt: number | null;
  /** Last validation failure timestamp */
  lastValidationFailureAt: number | null;
  /** Mode transition history (last N transitions) */
  modeTransitions: ModeTransitionRecord[];
  /** Whether mode is manually forced */
  modeForced: boolean;
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
  validated: boolean;
  degraded: boolean;
  fallbackReason?: FallbackReason;
  healthScoreAtExecution: number;
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
export const CANONICAL_RUNTIME_VERSION = '14.4.1';

/** Default canonical execution endpoint */
export const CANONICAL_ENDPOINT = 'https://api.cmpsbl.com/v1/substrate/primitive';

/** Network mode threshold (consecutive remote successes) */
export const NETWORK_MODE_THRESHOLD = 5;

/** Hybrid mode threshold (consecutive successes to promote from offline) */
export const HYBRID_MODE_THRESHOLD = 2;

/** Offline mode threshold (consecutive remote failures) */
export const OFFLINE_MODE_THRESHOLD = 3;

/** Validation failure weight multiplier (validation failures count 2x vs transport) */
export const VALIDATION_FAILURE_WEIGHT = 2;

/** Maximum telemetry buffer size */
export const MAX_TELEMETRY_BUFFER = 500;

/** Maximum mode transition history */
export const MAX_MODE_TRANSITIONS = 50;

/** Remote latency timeout threshold (ms) — exceeding this demotes mode */
export const LATENCY_TIMEOUT_THRESHOLD = 10_000;

// ═══════════════════════════════════════════════════════════════════════════════
// §4b — HASHING (canonical, deterministic, zero-dependency)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * djb2 hash — synchronous, deterministic, zero-dependency.
 * All bridges use this identical algorithm. Do NOT vary per language.
 */
function djb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Compute a stable capability hash from the minimum identity surface.
 * Identity = name + module_chain + category + optional tier + optional sourceLanguage.
 * Canonical runtime recomputes this identically for validation.
 */
export function computeCapabilityHash(
  name: string,
  moduleChain: string[],
  category: string,
  tier?: string,
  sourceLanguage?: string,
): string {
  const parts = [name, moduleChain.map(m => m.toUpperCase()).join(','), category];
  if (tier) parts.push(tier);
  if (sourceLanguage) parts.push(sourceLanguage);
  return djb2(parts.join('|'));
}

/**
 * Compute a separate module chain hash for independent tamper detection.
 */
export function computeModuleChainHash(moduleChain: string[]): string {
  return djb2(moduleChain.map(m => m.toUpperCase()).join(','));
}

/**
 * Generate a unique execution ID.
 */
export function generateExecutionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `exec_${ts}_${rand}`;
}

/**
 * Build the full integrity payload for an outbound bridge request.
 */
export function buildIntegrityPayload(
  name: string,
  moduleChain: string[],
  category: string,
  expectedCJPI: number,
  bridgeType: BridgeType,
  executionMode: RuntimeMode,
  runtimeType: RuntimeType = 'portable',
  tier?: string,
  sourceLanguage?: string,
  manifestFingerprint?: string,
  generatedAt?: string,
): ExecutionIntegrityPayload {
  return {
    canonicalVersion: CANONICAL_RUNTIME_VERSION,
    bridgeType,
    runtimeType,
    executionMode,
    capabilityHash: computeCapabilityHash(name, moduleChain, category, tier, sourceLanguage),
    moduleChainHash: computeModuleChainHash(moduleChain),
    expectedCJPI,
    manifestFingerprint,
    generatedAt,
  };
}

/**
 * Validate an inbound integrity payload on the canonical runtime side.
 * Returns structured validation result — never throws.
 */
export function validateIntegrityPayload(
  payload: ExecutionIntegrityPayload,
  name: string,
  moduleChain: string[],
  category: string,
  tier?: string,
  sourceLanguage?: string,
): IntegrityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const executionId = generateExecutionId();

  // 1. Version compatibility
  if (payload.canonicalVersion !== CANONICAL_RUNTIME_VERSION) {
    const [bridgeMajor] = payload.canonicalVersion.split('.');
    const [runtimeMajor] = CANONICAL_RUNTIME_VERSION.split('.');
    if (bridgeMajor !== runtimeMajor) {
      errors.push(
        `Major version mismatch: bridge=${payload.canonicalVersion}, runtime=${CANONICAL_RUNTIME_VERSION}`
      );
    } else {
      warnings.push(
        `Minor version mismatch: bridge=${payload.canonicalVersion}, runtime=${CANONICAL_RUNTIME_VERSION}`
      );
    }
  }

  // 2. Capability hash recomputation & comparison
  const recomputedCapabilityHash = computeCapabilityHash(name, moduleChain, category, tier, sourceLanguage);
  if (payload.capabilityHash !== recomputedCapabilityHash) {
    errors.push(
      `Capability hash mismatch: bridge=${payload.capabilityHash}, recomputed=${recomputedCapabilityHash}`
    );
  }

  // 3. Module chain hash recomputation & comparison
  const recomputedModuleChainHash = computeModuleChainHash(moduleChain);
  if (payload.moduleChainHash !== recomputedModuleChainHash) {
    errors.push(
      `Module chain hash mismatch: bridge=${payload.moduleChainHash}, recomputed=${recomputedModuleChainHash}`
    );
  }

  // 4. CJPI sanity check
  if (payload.expectedCJPI < 0 || payload.expectedCJPI > 100) {
    warnings.push(`CJPI out of range: ${payload.expectedCJPI}`);
  }

  // 5. Required metadata fields
  if (!payload.bridgeType) errors.push('Missing bridgeType');
  if (!payload.executionMode) errors.push('Missing executionMode');

  return {
    validated: errors.length === 0,
    validationErrors: errors,
    validationWarnings: warnings,
    recomputedCapabilityHash,
    recomputedModuleChainHash,
    canonicalVersion: CANONICAL_RUNTIME_VERSION,
    runtimeMode: payload.executionMode,
    bridgeType: payload.bridgeType,
    capabilityHash: payload.capabilityHash,
    executionId,
  };
}

/**
 * Build a normalized execution envelope wrapping any result.
 */
export function buildNormalizedEnvelope<T>(
  result: T,
  validation: IntegrityValidationResult,
  bridgeType: BridgeType,
  totalDurationMs: number,
  degradedState?: DegradedExecutionState,
): NormalizedExecutionEnvelope<T> {
  return {
    executionId: validation.executionId,
    result,
    validation,
    degraded: !validation.validated,
    degradedState,
    canonicalVersion: CANONICAL_RUNTIME_VERSION,
    runtimeMode: validation.runtimeMode,
    bridgeType,
    capabilityHash: validation.capabilityHash,
    executedAt: new Date().toISOString(),
    totalDurationMs,
  };
}

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
  'Integrity payload construction',
  'Health score reporting',
  'Mode state reporting',
  'Degraded result marking',
] as const;
