/**
 * CMPSBL® Capability Lifecycle Model (v1.0.0)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Defines the 5-state capability lifecycle that replaces
 * the overloaded Declared/Bound/Verified model.
 *
 * States: Detected → Generated → Bound → Activated → BehaviorallyVerified
 *
 * This module is the SINGLE SOURCE OF TRUTH for capability
 * state definitions across the entire substrate.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CAPABILITY LIFECYCLE STATES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The 5-state lifecycle for every primitive capability.
 *
 * Each state is strictly ordered — a later state implies all prior states.
 * No state may be claimed without evidence for all preceding states.
 */
export type CapabilityState =
  | 'detected'              // Primitive identified during scan (signal match)
  | 'generated'             // L2 orchestration code created (wrapper exists in output)
  | 'bound'                 // Wrapper attached at function boundaries (structural linkage confirmed)
  | 'activated'             // Runtime attachment executed (hooks firing in execution path)
  | 'behaviorally_verified'; // Observable runtime effect confirmed (state change, interception, etc.)

/** Numeric ordering for state comparison */
export const CAPABILITY_STATE_ORDINAL: Record<CapabilityState, number> = {
  detected: 0,
  generated: 1,
  bound: 2,
  activated: 3,
  behaviorally_verified: 4,
} as const;

/**
 * Returns true if `actual` meets or exceeds `required`.
 * Use this for all claim-gating logic.
 */
export function meetsStateRequirement(actual: CapabilityState, required: CapabilityState): boolean {
  return CAPABILITY_STATE_ORDINAL[actual] >= CAPABILITY_STATE_ORDINAL[required];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — CAPABILITY ACTIVATION LEDGER ENTRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Per-primitive ledger entry — the machine-readable truth record.
 *
 * ALL reports, manifests, and CJPI scoring MUST read from this structure.
 * No claim may exceed what the ledger records.
 */
export interface CapabilityLedgerEntry {
  /** Primitive name (e.g., 'DEFENSE', 'GOVERNANCE', 'MEMORY') */
  readonly name: string;

  /** State flags — each implies all prior states are also true */
  readonly detected: boolean;
  readonly generated: boolean;
  readonly bound: boolean;
  readonly activated: boolean;
  readonly behaviorallyVerified: boolean;

  /** Highest confirmed lifecycle state */
  readonly state: CapabilityState;

  /** Function/symbol targets this primitive wraps */
  readonly targets: readonly string[];

  /**
   * Evidence strings — machine-readable descriptions of proof.
   * Examples:
   *   - "L2 wrapper emitted for processPayment at line 42"
   *   - "defense_gate intercepted 3 calls during probe run"
   *   - "memory_write observed: key 'session_state' persisted"
   */
  readonly evidence: readonly string[];

  /**
   * Gaps — what is NOT yet proven for this primitive.
   * Examples:
   *   - "No runtime activation detected — wrapper is structural only"
   *   - "No behavioral evidence — cannot confirm interception"
   */
  readonly gaps: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — CAPABILITY ACTIVATION LEDGER (ARTIFACT-LEVEL)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The full activation ledger for a single artifact.
 * Serialized as JSON in the export package.
 */
export interface CapabilityActivationLedger {
  /** Ledger schema version */
  readonly version: '1.0.0';

  /** Artifact fingerprint this ledger describes */
  readonly fingerprintId: string;

  /** ISO-8601 timestamp of ledger generation */
  readonly generatedAt: string;

  /** Per-primitive entries — one per detected primitive */
  readonly entries: readonly CapabilityLedgerEntry[];

  /** Aggregate counts for quick reference */
  readonly summary: LedgerSummary;
}

export interface LedgerSummary {
  readonly totalDetected: number;
  readonly totalGenerated: number;
  readonly totalBound: number;
  readonly totalActivated: number;
  readonly totalBehaviorallyVerified: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — DECOMPOSED CJPI SCORING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CJPI must be decomposed into lifecycle-aware components.
 * The headline score MUST NOT imply runtime capability unless
 * activation and behavioral scores are non-zero.
 */
export interface DecomposedCJPI {
  /** Structural Score: weight of detected + generated primitives */
  readonly structuralScore: number;

  /** Binding Score: weight of bound primitives */
  readonly bindingScore: number;

  /** Activation Score: weight of activated primitives (0 if none activated) */
  readonly activationScore: number;

  /** Behavioral Score: weight of behaviorally verified primitives (0 if none verified) */
  readonly behavioralScore: number;

  /** Security Score: only non-zero if behavioral interception is proven */
  readonly securityScore: number;

  /**
   * Composite CJPI — weighted sum of all components.
   * Range: 0–100.
   *
   * CONSTRAINT: If activationScore === 0 && behavioralScore === 0,
   * the headline label MUST include "structural only" qualifier.
   */
  readonly composite: number;

  /** Whether the headline score implies runtime capability */
  readonly impliesRuntimeCapability: boolean;
}

/** CJPI component weights — trade secret, values are internal */
export const CJPI_COMPONENT_WEIGHTS = {
  structural: 0.25,
  binding: 0.25,
  activation: 0.25,
  behavioral: 0.20,
  security: 0.05,
} as const;

/**
 * Compute decomposed CJPI from a ledger.
 */
export function computeDecomposedCJPI(ledger: CapabilityActivationLedger): DecomposedCJPI {
  const { summary } = ledger;
  const total = Math.max(summary.totalDetected, 1);

  const structuralScore = Math.round(((summary.totalGenerated / total) * 100));
  const bindingScore = Math.round(((summary.totalBound / total) * 100));
  const activationScore = Math.round(((summary.totalActivated / total) * 100));
  const behavioralScore = Math.round(((summary.totalBehaviorallyVerified / total) * 100));

  // Security score requires behavioral proof of interception
  const securityPrimitives = ledger.entries.filter(
    e => e.behaviorallyVerified &&
      (e.name === 'DEFENSE' || e.name === 'GOVERNANCE' || e.name === 'IMMUNITY' ||
       e.name === 'CONSCIENCE' || e.name === 'SENTINEL' || e.name === 'ARBITER'),
  );
  const securityScore = Math.round((securityPrimitives.length / Math.max(total, 1)) * 100);

  const w = CJPI_COMPONENT_WEIGHTS;
  const composite = Math.round(
    structuralScore * w.structural +
    bindingScore * w.binding +
    activationScore * w.activation +
    behavioralScore * w.behavioral +
    securityScore * w.security,
  );

  return {
    structuralScore,
    bindingScore,
    activationScore,
    behavioralScore,
    securityScore,
    composite,
    impliesRuntimeCapability: activationScore > 0 && behavioralScore > 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — VERIFICATION SPLIT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Provenance Verification — confirms artifact origin and integrity.
 * This is the EXISTING verification system (SHA-256, deterministic generation).
 */
export interface ProvenanceVerification {
  readonly type: 'provenance';
  /** SHA-256 of Layer 1 source (must match original) */
  readonly l1Hash: string;
  /** SHA-256 of Layer 2 generated code */
  readonly l2Hash: string;
  /** Whether L1 hash matches the original upload */
  readonly l1Intact: boolean;
  /** Deterministic generation confirmed (same input → same L2) */
  readonly deterministicConfirmed: boolean;
  /** Primitive presence confirmed in chain */
  readonly primitivesPresent: readonly string[];
  /** Chain position map */
  readonly chainPositions: Readonly<Record<string, number>>;
  readonly timestamp: string;
}

/**
 * Behavioral Verification — confirms runtime effects actually occurred.
 * This is a NEW verification system.
 */
export interface BehavioralVerification {
  readonly type: 'behavioral';
  /** Probe results per primitive */
  readonly probes: readonly BehavioralProbe[];
  /** Overall behavioral confidence (0–1) */
  readonly confidence: number;
  readonly timestamp: string;
}

/**
 * A single behavioral probe result for one primitive.
 */
export interface BehavioralProbe {
  /** Primitive name */
  readonly primitiveName: string;
  /** Target function/symbol probed */
  readonly target: string;
  /** Whether the L2 wrapper intercepted the call */
  readonly intercepted: boolean;
  /** Observable effects detected */
  readonly effects: readonly BehavioralEffect[];
  /** Whether this constitutes behavioral proof */
  readonly verified: boolean;
  /** Human-readable evidence description */
  readonly evidence: string;
}

export type BehavioralEffectKind =
  | 'state_write'        // Memory/state mutation observed
  | 'telemetry_emit'     // Beacon/telemetry event emitted
  | 'call_interception'  // Function call routed through L2
  | 'validation_reject'  // Defense gate rejected input
  | 'governance_gate'    // Governance rule evaluated
  | 'circuit_trip'       // Circuit breaker triggered
  | 'audit_record';      // Audit trail entry created

export interface BehavioralEffect {
  readonly kind: BehavioralEffectKind;
  readonly description: string;
  /** Deterministic — same probe input produces same effect */
  readonly deterministic: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — REPORT CLAIM RULES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Claim level governs what language reports may use.
 * This is a hard constraint — violation is a system defect.
 */
export type ClaimLevel = 'structural' | 'runtime' | 'behavioral';

/**
 * Maps capability state to maximum permissible claim level.
 */
export const STATE_TO_MAX_CLAIM: Record<CapabilityState, ClaimLevel> = {
  detected: 'structural',
  generated: 'structural',
  bound: 'structural',
  activated: 'runtime',
  behaviorally_verified: 'behavioral',
} as const;

/**
 * Allowed claim phrases per claim level.
 * Reports MUST use only phrases from the appropriate level.
 */
export const ALLOWED_CLAIM_PHRASES: Record<ClaimLevel, readonly string[]> = {
  structural: [
    'Primitive detected in source',
    'L2 wrapper generated',
    'Wrapper structurally bound to target',
    'Orchestration code present',
    'Structural coverage achieved',
  ],
  runtime: [
    'Runtime attachment confirmed',
    'Wrapper executing in call path',
    'Hook active in execution context',
    'Activation confirmed',
  ],
  behavioral: [
    'Behavior verified',
    'Observable effect confirmed',
    'Interception proven',
    'State mutation observed',
    'Enforcement active and verified',
  ],
} as const;

/**
 * Forbidden claim phrases per claim level — hard block.
 */
export const FORBIDDEN_CLAIM_PATTERNS: Record<ClaimLevel, readonly string[]> = {
  structural: [
    'enabled',
    'active',
    'enforcing',
    'protecting',
    'intercepting',
    'stateful',
    'runtime',
    'mitigating',
  ],
  runtime: [
    'verified behavior',
    'proven interception',
    'confirmed enforcement',
    'behavioral proof',
  ],
  behavioral: [],
} as const;

/**
 * Validate a claim string against the ledger entry's state.
 * Returns null if valid, or an error string if the claim exceeds evidence.
 */
export function validateClaim(
  claim: string,
  entry: CapabilityLedgerEntry,
): string | null {
  const maxClaim = STATE_TO_MAX_CLAIM[entry.state];
  const forbidden = FORBIDDEN_CLAIM_PATTERNS[maxClaim];

  const lowerClaim = claim.toLowerCase();
  for (const pattern of forbidden) {
    if (lowerClaim.includes(pattern.toLowerCase())) {
      return `Claim "${claim}" uses forbidden phrase "${pattern}" for state "${entry.state}" (max claim level: ${maxClaim})`;
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — PIPELINE STAGES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The corrected 8-stage pipeline.
 *
 * Previous: scan → classify → generate → report
 * Corrected: scan → classify → generate → bind → activate → verify → ledger → report
 *
 * Activation is an EXPLICIT phase, never assumed.
 */
export type PipelineStage =
  | 'scan'       // Detect primitives in source
  | 'classify'   // Categorize and score detections
  | 'generate'   // Emit L2 orchestration code
  | 'bind'       // Attach wrappers at function boundaries
  | 'activate'   // Execute runtime attachment (hooks fire)
  | 'verify'     // Run behavioral probes
  | 'ledger'     // Compile activation ledger
  | 'report';    // Generate constrained report from ledger

export const PIPELINE_STAGE_ORDER: readonly PipelineStage[] = [
  'scan', 'classify', 'generate', 'bind', 'activate', 'verify', 'ledger', 'report',
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — SYSTEM LIMITATIONS DECLARATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Canonical limitations that MUST appear in all outputs and documentation.
 * These are structural facts, not disclaimers.
 */
export const SYSTEM_LIMITATIONS = [
  'L2 wrappers are structural by default — runtime behavior requires explicit activation and integration.',
  'CMPSBL does not guarantee behavioral outcomes without activation.',
  'Runtime behavior requires explicit activation/integration by the consuming application.',
  'Provenance verification confirms origin and integrity, NOT runtime behavior.',
  'CJPI scores with zero activation reflect structural coverage only.',
] as const;
