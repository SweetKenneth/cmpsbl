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
 *   - Fallback semantics
 *   - Result normalization
 *
 * All language generators produce code that mirrors this adapter's
 * public contract — they do NOT reimplement runtime internals.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { SynthesisContext } from './logic-synthesizer';
import type { BridgeType, RuntimeMode, RuntimeType, ExecutionIntegrityPayload } from './canonical-runtime-contract';
import { CANONICAL_RUNTIME_VERSION, CANONICAL_ENDPOINT, computeCapabilityHash } from './canonical-runtime-contract';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — MODULE VERB MAPPING (shared across all bridge generators)
// ═══════════════════════════════════════════════════════════════════════════════

/** Map a module name to its canonical operation verb and description */
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
    `${opts.comment} Module Chain: ${opts.moduleChain.join(' → ')}`,
    `${opts.comment}`,
    `${opts.comment} This is a BRIDGE ADAPTER, not a standalone runtime.`,
    `${opts.comment} Runtime logic lives in the canonical TypeScript Mini-Runtime™.`,
    `${opts.comment} This adapter delegates execution via:`,
    `${opts.comment}   1. Remote canonical runtime (when endpoint configured)`,
    `${opts.comment}   2. Deterministic local fallback (offline mode)`,
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
    entryCapability: ctx.entryCapability,
    exitCapability: ctx.exitCapability,
    errorStrategy: ctx.errorStrategy,
    maxExecutionMs: ctx.maxExecutionMs,
    generatedAt: new Date().toISOString(),
    integrityContract: {
      canonicalVersion: CANONICAL_RUNTIME_VERSION,
      bridgeType,
      capabilityHash,
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

/** Build the stage dispatch table for a module chain */
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
    'validated: boolean',
    'validationErrors: string[]',
    'degraded: boolean | undefined',
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
): ExecutionIntegrityPayload {
  return {
    canonicalVersion: CANONICAL_RUNTIME_VERSION,
    bridgeType,
    capabilityHash: computeCapabilityHash(ctx.name, ctx.moduleChain, ctx.category),
    expectedCJPI: ctx.cjpi,
    executionMode,
  };
}

/**
 * Generate language-agnostic integrity payload snippet for embedding in bridges.
 * Returns a JSON-serializable object shape as a string for code generation.
 */
export function generateIntegritySnippet(ctx: SynthesisContext, bridgeType: BridgeType): string {
  const hash = computeCapabilityHash(ctx.name, ctx.moduleChain, ctx.category);
  return JSON.stringify({
    canonicalVersion: CANONICAL_RUNTIME_VERSION,
    bridgeType,
    capabilityHash: hash,
    expectedCJPI: ctx.cjpi,
    executionMode: bridgeType === 'offline-fallback' ? 'offline' : 'hybrid',
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
    'reason: string (integrity validation failure description)',
    'integrityErrors: string[] (specific validation errors)',
    'trace: StageTrace[] (preserved for debugging)',
    'validated: false',
    'validationErrors: string[]',
  ];
}
