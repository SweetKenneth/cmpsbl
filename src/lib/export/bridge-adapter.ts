/**
 * CMPSBL® Canonical Bridge Adapter
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The centralized bridge adapter layer that all language exporters use.
 * 
 * Owns:
 *   - Remote endpoint configuration
 *   - Runtime type management
 *   - Telemetry buffering
 *   - Primitive execution resolution (remote → local → fallback)
 *   - Fallback semantics (normal / degraded / offline)
 *   - Result normalization
 *   - Runtime health scoring & automatic mode switching
 *   - Execution integrity payload construction
 *
 * All language generators produce code that mirrors this adapter's
 * public contract — they do NOT reimplement runtime internals.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { SynthesisContext } from './logic-synthesizer';
import type {
  BridgeType, RuntimeMode, RuntimeType, FallbackReason,
  ExecutionIntegrityPayload, RuntimeHealthSnapshot,
  ModeTransitionRecord, ExecutionTelemetryEntry,
  ExecutionEnvelopeMetadata,
} from './canonical-runtime-contract';
import {
  CANONICAL_RUNTIME_VERSION, CANONICAL_ENDPOINT,
  NETWORK_MODE_THRESHOLD, HYBRID_MODE_THRESHOLD, OFFLINE_MODE_THRESHOLD,
  VALIDATION_FAILURE_WEIGHT, MAX_TELEMETRY_BUFFER, MAX_MODE_TRANSITIONS,
  LATENCY_TIMEOUT_THRESHOLD,
  computeCapabilityHash, computeModuleChainHash, generateExecutionId,
} from './canonical-runtime-contract';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — MODULE VERB MAPPING (shared across all bridge generators)
// ═══════════════════════════════════════════════════════════════════════════════

/** Map a primitive name to its canonical operation verb and description */
export function moduleOps(mod: string): { verb: string; desc: string } {
  const MAP: Record<string, { verb: string; desc: string }> = {
    BRAIN: { verb: 'analyze', desc: 'cognitive processing' },
    CORTEX: { verb: 'orchestrate', desc: 'pipeline coordination' },
    DEFENSE: { verb: 'validate', desc: 'security validation' },
    ACCESS: { verb: 'authorize', desc: 'access control' },
    ANALYTICS: { verb: 'aggregate', desc: 'data aggregation' },
    VISION: { verb: 'observe', desc: 'observation' },
    MEMORY: { verb: 'persist', desc: 'data persistence' },
    ORACLE: { verb: 'predict', desc: 'prediction' },
    EVOLUTION: { verb: 'evolve', desc: 'optimization' },
    GOVERNANCE: { verb: 'enforce', desc: 'policy enforcement' },
    AUDIT: { verb: 'log', desc: 'audit logging' },
    DECODE: { verb: 'transform', desc: 'data transformation' },
    NEXUS: { verb: 'route', desc: 'routing' },
    NERVE: { verb: 'signal', desc: 'signal propagation' },
    DREAM: { verb: 'synthesize', desc: 'generative processing' },
    IDENTITY: { verb: 'fingerprint', desc: 'identification' },
    SOVEREIGN: { verb: 'classify', desc: 'classification' },
    CONSCIENCE: { verb: 'assess', desc: 'assessment' },
    PHANTOM: { verb: 'anonymize', desc: 'anonymization' },
    FORGE: { verb: 'compose', desc: 'composition' },
    LINGUA: { verb: 'translate', desc: 'translation' },
    COMPASS: { verb: 'geolocate', desc: 'geolocation' },
    ECHO: { verb: 'simulate', desc: 'simulation' },
    TREATY: { verb: 'negotiate', desc: 'negotiation' },
    HARVEST: { verb: 'ingest', desc: 'ingestion' },
    REFLEX: { verb: 'react', desc: 'reactive processing' },
    CORE: { verb: 'bootstrap', desc: 'initialization' },
    SYSTEM: { verb: 'monitor', desc: 'monitoring' },
    OBSERVABILITY: { verb: 'trace', desc: 'tracing' },
    IMMUNITY: { verb: 'quarantine', desc: 'isolation' },
    INTENT: { verb: 'parse', desc: 'intent parsing' },
    MESH: { verb: 'interconnect', desc: 'interconnection' },
    ECONOMY: { verb: 'price', desc: 'cost modeling' },
    RELAY: { verb: 'forward', desc: 'message relay' },
    ATLAS: { verb: 'map', desc: 'capability mapping' },
    ENCODE: { verb: 'serialize', desc: 'serialization' },
    INCLUSIVE: { verb: 'adapt', desc: 'adaptation' },
    INTEGRATION: { verb: 'connect', desc: 'integration' },
    MEDIC: { verb: 'heal', desc: 'recovery' },
    RIPPLE: { verb: 'propagate', desc: 'propagation' },
    SHADOW: { verb: 'simulate', desc: 'shadow simulation' },
    ENGINEER: { verb: 'diagnose', desc: 'diagnostics' },
    OBSERVER: { verb: 'observe', desc: 'observation' },
    PRISM: { verb: 'refract', desc: 'signal decomposition' },
  };
  return MAP[mod] || { verb: 'process', desc: 'data transformation' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — BRIDGE HEADER GENERATOR (common across all languages)
// ═══════════════════════════════════════════════════════════════════════════════

export interface BridgeHeaderOptions {
  name: string;
  description: string;
  language: string;
  comment: string;
  moduleChain: string[];
  category: string;
  cjpi: number;
  bridgeType: BridgeType;
}

/** Generate the standard bridge header comment for any language */
export function generateBridgeHeader(opts: BridgeHeaderOptions): string {
  return [
    `${opts.comment} ════════════════════════════════════════════════════════`,
    `${opts.comment} CMPSBL® Bridge Adapter — ${opts.name}`,
    `${opts.comment} Language: ${opts.language} | Bridge Type: ${opts.bridgeType}`,
    `${opts.comment} CJPI: ${opts.cjpi} | Category: ${opts.category}`,
    `${opts.comment} Primitive Chain: ${labelChain(opts.moduleChain)}`,
    `${opts.comment}`,
    `${opts.comment} This is a BRIDGE ADAPTER, not a standalone runtime.`,
    `${opts.comment} Runtime logic lives in the canonical TypeScript Mini-Runtime™.`,
    `${opts.comment} This adapter delegates execution via:`,
    `${opts.comment}   1. Remote canonical runtime (when endpoint configured)`,
    `${opts.comment}   2. Deterministic local fallback (offline mode)`,
    `${opts.comment}`,
    `${opts.comment} Integrity: capabilityHash + moduleChainHash validated on every request`,
    `${opts.comment} Health: rolling health score governs automatic mode switching`,
    `${opts.comment} Degraded: integrity failures are explicit, never silently masked`,
    `${opts.comment}`,
    `${opts.comment} Canonical Runtime Version: ${CANONICAL_RUNTIME_VERSION}`,
    `${opts.comment} Generated by CMPSBL® Universal Bridge Generator`,
    `${opts.comment} © CMPSBL® — All rights reserved.`,
    `${opts.comment} ════════════════════════════════════════════════════════`,
    '',
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — BRIDGE CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Determine the bridge type for a given export context.
 * - TypeScript exports may include the real runtime → 'network' capable
 * - All other languages are 'hybrid' bridges (remote-first, local fallback)
 */
export function classifyBridge(language: string, runtimeType: RuntimeType): BridgeType {
  if (language === 'typescript') return 'network';
  if (runtimeType === 'sealed') return 'offline-fallback';
  return 'hybrid';
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — MANIFEST METADATA GENERATOR (language-agnostic JSON)
// ═══════════════════════════════════════════════════════════════════════════════

/** Generate the bridge metadata JSON string that gets embedded in exports */
export function generateBridgeManifest(ctx: SynthesisContext, language: string, bridgeType: BridgeType): string {
  const capabilityHash = computeCapabilityHash(ctx.name, ctx.moduleChain, ctx.category);
  const moduleChainHash = computeModuleChainHash(ctx.moduleChain);
  return JSON.stringify({
    name: ctx.name,
    description: ctx.description,
    language,
    bridgeType,
    canonicalVersion: CANONICAL_RUNTIME_VERSION,
    defaultEndpoint: CANONICAL_ENDPOINT,
    offlineCapable: true,
    moduleChain: ctx.moduleChain,
    category: ctx.category,
    cjpi: ctx.cjpi,
    capabilityHash,
    moduleChainHash,
    entryCapability: ctx.entryCapability,
    exitCapability: ctx.exitCapability,
    errorStrategy: ctx.errorStrategy,
    maxExecutionMs: ctx.maxExecutionMs,
    generatedAt: new Date().toISOString(),
    integrityContract: {
      canonicalVersion: CANONICAL_RUNTIME_VERSION,
      bridgeType,
      capabilityHash,
      moduleChainHash,
      expectedCJPI: ctx.cjpi,
      executionMode: bridgeType === 'offline-fallback' ? 'offline' : 'hybrid',
    },
  }, null, 2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — STAGE METADATA (for bridge dispatch tables)
// ═══════════════════════════════════════════════════════════════════════════════

export interface BridgeStage {
  index: number;
  module: string;
  verb: string;
  desc: string;
}

/** Build the stage dispatch table for a primitive chain */
export function buildStageTable(modules: string[]): BridgeStage[] {
  return modules.map((m, i) => ({
    index: i,
    module: m,
    verb: moduleOps(m).verb,
    desc: moduleOps(m).desc,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — RESULT NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate the result normalization shape that all bridges must produce.
 * This ensures old packs remain compatible with new bridge outputs.
 */
export function getResultShape(): string[] {
  return [
    'success: boolean',
    'data: Record<string, unknown>',
    'error: string | null',
    'latencyMs: number',
    'confidence: number',
    'trace: StageTrace[]',
    'stagesCompleted: number',
    'totalStages: number',
    'runtimeMode: "offline" | "hybrid" | "network"',
    'bridgeType: "network" | "hybrid" | "offline-fallback"',
    'fingerprint: string',
    'executedAt: string',
    'executionId: string',
    'validated: boolean',
    'validationErrors: string[]',
    'validationWarnings: string[]',
    'degraded: boolean',
    'degradedReasons: string[]',
    'envelope: ExecutionEnvelopeMetadata',
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — EXECUTION INTEGRITY PAYLOAD BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the execution integrity payload for a bridge outbound request.
 * Must be included in every request body sent to the canonical runtime.
 */
export function buildOutboundIntegrity(
  ctx: SynthesisContext,
  bridgeType: BridgeType,
  executionMode: RuntimeMode,
  runtimeType: RuntimeType = 'portable',
  manifestFingerprint?: string,
): ExecutionIntegrityPayload {
  return {
    canonicalVersion: CANONICAL_RUNTIME_VERSION,
    bridgeType,
    runtimeType,
    executionMode,
    capabilityHash: computeCapabilityHash(ctx.name, ctx.moduleChain, ctx.category),
    moduleChainHash: computeModuleChainHash(ctx.moduleChain),
    expectedCJPI: ctx.cjpi,
    manifestFingerprint,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate language-agnostic integrity payload snippet for embedding in bridges.
 */
export function generateIntegritySnippet(ctx: SynthesisContext, bridgeType: BridgeType): string {
  const capHash = computeCapabilityHash(ctx.name, ctx.moduleChain, ctx.category);
  const chainHash = computeModuleChainHash(ctx.moduleChain);
  return JSON.stringify({
    canonicalVersion: CANONICAL_RUNTIME_VERSION,
    bridgeType,
    runtimeType: bridgeType === 'offline-fallback' ? 'sealed' : 'portable',
    executionMode: bridgeType === 'offline-fallback' ? 'offline' : 'hybrid',
    capabilityHash: capHash,
    moduleChainHash: chainHash,
    expectedCJPI: ctx.cjpi,
  }, null, 2);
}

/**
 * Generate the degraded result shape for when integrity validation fails.
 * Bridges MUST use this instead of silently falling back.
 */
export function generateDegradedResultShape(): string[] {
  return [
    'success: false',
    'degraded: true',
    'degradedReasons: string[]',
    'integrityErrors: string[]',
    'trustLevel: "none" | "low" | "medium"',
    'fallbackReason: "normal" | "degraded" | "offline"',
    'trace: StageTrace[] (preserved for debugging)',
    'validated: false',
    'validationErrors: string[]',
    'validationWarnings: string[]',
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — RUNTIME HEALTH TRACKER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Runtime health tracker — maintains rolling health state and governs
 * automatic mode switching for bridge adapters.
 * 
 * Deterministic, auditable, and inspectable.
 * This class is the ONLY owner of mode transition logic.
 */
export class RuntimeHealthTracker {
  private _consecutiveSuccesses = 0;
  private _consecutiveFailures = 0;
  private _totalRemoteAttempts = 0;
  private _totalRemoteSuccesses = 0;
  private _totalFallbacks = 0;
  private _totalValidationFailures = 0;
  private _remoteLatencies: number[] = [];
  private _fallbackLatencies: number[] = [];
  private _lastRemoteSuccessAt: number | null = null;
  private _lastRemoteFailureAt: number | null = null;
  private _lastValidationFailureAt: number | null = null;
  private _modeTransitions: ModeTransitionRecord[] = [];
  private _currentMode: RuntimeMode = 'hybrid';
  private _forcedMode: RuntimeMode | null = null;
  private _endpoint: string | null = CANONICAL_ENDPOINT;

  /** Maximum rolling latency samples */
  private static readonly LATENCY_WINDOW = 20;

  // ── Public Read APIs ──

  getRuntimeMode(): RuntimeMode {
    return this._forcedMode ?? this._currentMode;
  }

  getHealthScore(): number {
    return this._computeHealthScore();
  }

  getHealthSnapshot(): RuntimeHealthSnapshot {
    return {
      currentMode: this.getRuntimeMode(),
      healthScore: this._computeHealthScore(),
      consecutiveSuccesses: this._consecutiveSuccesses,
      consecutiveFailures: this._consecutiveFailures,
      totalRemoteAttempts: this._totalRemoteAttempts,
      totalRemoteSuccesses: this._totalRemoteSuccesses,
      totalFallbacks: this._totalFallbacks,
      totalValidationFailures: this._totalValidationFailures,
      averageRemoteLatencyMs: this._avg(this._remoteLatencies),
      averageFallbackLatencyMs: this._avg(this._fallbackLatencies),
      lastRemoteSuccessAt: this._lastRemoteSuccessAt,
      lastRemoteFailureAt: this._lastRemoteFailureAt,
      lastValidationFailureAt: this._lastValidationFailureAt,
      modeTransitions: [...this._modeTransitions],
      modeForced: this._forcedMode !== null,
    };
  }

  getExecutionTelemetry(): ReadonlyArray<ModeTransitionRecord> {
    return this._modeTransitions;
  }

  // ── Mutation APIs ──

  configureEndpoint(url: string | null): void {
    this._endpoint = url;
    if (!url) {
      this._transitionMode('offline', 'Endpoint unset', 'manual');
    }
  }

  resetHealthState(): void {
    this._consecutiveSuccesses = 0;
    this._consecutiveFailures = 0;
    this._totalRemoteAttempts = 0;
    this._totalRemoteSuccesses = 0;
    this._totalFallbacks = 0;
    this._totalValidationFailures = 0;
    this._remoteLatencies = [];
    this._fallbackLatencies = [];
    this._lastRemoteSuccessAt = null;
    this._lastRemoteFailureAt = null;
    this._lastValidationFailureAt = null;
    this._modeTransitions = [];
    this._currentMode = 'hybrid';
    this._forcedMode = null;
  }

  forceMode(mode: RuntimeMode | null): void {
    if (mode === null) {
      this._forcedMode = null;
      return;
    }
    this._forcedMode = mode;
    this._modeTransitions.push({
      from: this._currentMode,
      to: mode,
      reason: 'Manually forced',
      healthScoreAtTransition: this._computeHealthScore(),
      timestamp: Date.now(),
      triggerType: 'manual',
    });
  }

  /**
   * Record a successful remote execution.
   */
  recordRemoteSuccess(latencyMs: number): void {
    this._totalRemoteAttempts++;
    this._totalRemoteSuccesses++;
    this._consecutiveSuccesses++;
    this._consecutiveFailures = 0;
    this._lastRemoteSuccessAt = Date.now();
    this._pushLatency(this._remoteLatencies, latencyMs);
    this._evaluateMode('recovery');
  }

  /**
   * Record a remote transport failure (timeout, network error).
   */
  recordRemoteFailure(): void {
    this._totalRemoteAttempts++;
    this._consecutiveFailures++;
    this._consecutiveSuccesses = 0;
    this._lastRemoteFailureAt = Date.now();
    this._evaluateMode('transport');
  }

  /**
   * Record a validation failure — weighted more heavily than transport.
   */
  recordValidationFailure(): void {
    this._totalRemoteAttempts++;
    this._totalValidationFailures++;
    // Validation failures count as VALIDATION_FAILURE_WEIGHT transport failures
    this._consecutiveFailures += VALIDATION_FAILURE_WEIGHT;
    this._consecutiveSuccesses = 0;
    this._lastValidationFailureAt = Date.now();
    this._lastRemoteFailureAt = Date.now();
    this._evaluateMode('validation');
  }

  /**
   * Record a fallback execution.
   */
  recordFallback(latencyMs: number, reason: FallbackReason): void {
    this._totalFallbacks++;
    this._pushLatency(this._fallbackLatencies, latencyMs);
  }

  /**
   * Record a latency timeout breach.
   */
  recordTimeoutBreach(): void {
    this._totalRemoteAttempts++;
    this._consecutiveFailures++;
    this._consecutiveSuccesses = 0;
    this._lastRemoteFailureAt = Date.now();
    this._evaluateMode('timeout');
  }

  /**
   * Build execution envelope metadata for a result.
   */
  buildEnvelopeMetadata(
    bridgeLanguage: string,
    bridgeType: BridgeType,
    wasRemoteAttempted: boolean,
    wasRemoteUsed: boolean,
    usedFallback: boolean,
    fallbackReason: FallbackReason | undefined,
    validationResult: 'passed' | 'warned' | 'failed',
    capabilityHash: string,
    modeBefore: RuntimeMode,
  ): ExecutionEnvelopeMetadata {
    return {
      executionId: generateExecutionId(),
      bridgeLanguage,
      bridgeType,
      runtimeMode: this.getRuntimeMode(),
      wasRemoteAttempted,
      wasRemoteUsed,
      usedFallback,
      fallbackReason,
      validationResult,
      healthScoreAtExecution: this._computeHealthScore(),
      modeBeforeExecution: modeBefore,
      modeAfterExecution: this.getRuntimeMode(),
      canonicalVersion: CANONICAL_RUNTIME_VERSION,
      capabilityHash,
    };
  }

  // ── Internal ──

  private _computeHealthScore(): number {
    if (this._totalRemoteAttempts === 0) return 50; // neutral start

    // Components (each 0–100, weighted)
    const successRate = this._totalRemoteAttempts > 0
      ? (this._totalRemoteSuccesses / this._totalRemoteAttempts) * 100
      : 50;

    const validationPenalty = this._totalRemoteAttempts > 0
      ? (this._totalValidationFailures / this._totalRemoteAttempts) * 100
      : 0;

    const latencyStability = this._computeLatencyStability();

    const fallbackPenalty = this._totalRemoteAttempts > 0
      ? (this._totalFallbacks / Math.max(1, this._totalRemoteAttempts + this._totalFallbacks)) * 50
      : 0;

    // Recency bias: recent failures weigh more
    const recencyPenalty = this._computeRecencyPenalty();

    // Weighted sum
    const raw = (
      successRate * 0.35 +
      (100 - validationPenalty * VALIDATION_FAILURE_WEIGHT) * 0.25 +
      latencyStability * 0.15 +
      (100 - fallbackPenalty) * 0.10 +
      (100 - recencyPenalty) * 0.15
    );

    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  private _computeLatencyStability(): number {
    if (this._remoteLatencies.length < 2) return 75;
    const avg = this._avg(this._remoteLatencies);
    if (avg > LATENCY_TIMEOUT_THRESHOLD) return 0;
    if (avg < 200) return 100;
    // Linear scale 200ms → 10000ms maps to 100 → 0
    return Math.max(0, 100 - ((avg - 200) / (LATENCY_TIMEOUT_THRESHOLD - 200)) * 100);
  }

  private _computeRecencyPenalty(): number {
    const now = Date.now();
    let penalty = 0;
    // Recent failure within 30s → heavy penalty
    if (this._lastRemoteFailureAt && (now - this._lastRemoteFailureAt) < 30_000) {
      penalty += 30;
    }
    // Recent validation failure within 60s → heavier penalty
    if (this._lastValidationFailureAt && (now - this._lastValidationFailureAt) < 60_000) {
      penalty += 40;
    }
    return Math.min(100, penalty);
  }

  private _evaluateMode(triggerType: ModeTransitionRecord['triggerType']): void {
    if (this._forcedMode !== null) return;
    if (!this._endpoint) {
      this._transitionMode('offline', 'No endpoint configured', triggerType);
      return;
    }

    const prev = this._currentMode;

    if (this._consecutiveFailures >= OFFLINE_MODE_THRESHOLD) {
      this._transitionMode('offline', `${this._consecutiveFailures} consecutive failures`, triggerType);
    } else if (this._consecutiveSuccesses >= NETWORK_MODE_THRESHOLD && this._currentMode !== 'network') {
      this._transitionMode('network', `${this._consecutiveSuccesses} consecutive successes`, triggerType);
    } else if (
      this._currentMode === 'offline' &&
      this._consecutiveSuccesses >= HYBRID_MODE_THRESHOLD
    ) {
      this._transitionMode('hybrid', `Recovery: ${this._consecutiveSuccesses} successes`, triggerType);
    } else if (
      this._currentMode === 'network' &&
      this._consecutiveFailures > 0
    ) {
      this._transitionMode('hybrid', 'Intermittent failure detected', triggerType);
    }
  }

  private _transitionMode(
    to: RuntimeMode,
    reason: string,
    triggerType: ModeTransitionRecord['triggerType'],
  ): void {
    if (this._currentMode === to) return;
    const record: ModeTransitionRecord = {
      from: this._currentMode,
      to,
      reason,
      healthScoreAtTransition: this._computeHealthScore(),
      timestamp: Date.now(),
      triggerType,
    };
    this._modeTransitions.push(record);
    if (this._modeTransitions.length > MAX_MODE_TRANSITIONS) {
      this._modeTransitions = this._modeTransitions.slice(-MAX_MODE_TRANSITIONS);
    }
    this._currentMode = to;
  }

  private _pushLatency(arr: number[], val: number): void {
    arr.push(val);
    if (arr.length > RuntimeHealthTracker.LATENCY_WINDOW) {
      arr.shift();
    }
  }

  private _avg(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((s, v) => s + v, 0) / arr.length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — BACKWARD COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalize a legacy bridge result (pre-integrity) into the new envelope shape.
 * Missing integrity fields are treated as warnings, not fatal errors.
 */
export function normalizeLegacyResult(legacyResult: Record<string, unknown>): Record<string, unknown> {
  const warnings: string[] = [];
  if (!('validated' in legacyResult)) {
    warnings.push('Legacy result: missing validated field');
  }
  if (!('executionId' in legacyResult)) {
    warnings.push('Legacy result: missing executionId');
  }
  if (!('degraded' in legacyResult)) {
    warnings.push('Legacy result: missing degraded field');
  }
  return {
    ...legacyResult,
    validated: legacyResult.validated ?? false,
    validationErrors: legacyResult.validationErrors ?? [],
    validationWarnings: [...(legacyResult.validationWarnings as string[] ?? []), ...warnings],
    degraded: legacyResult.degraded ?? false,
    degradedReasons: legacyResult.degradedReasons ?? (warnings.length > 0 ? ['Legacy result without integrity metadata'] : []),
    executionId: legacyResult.executionId ?? generateExecutionId(),
  };
}
