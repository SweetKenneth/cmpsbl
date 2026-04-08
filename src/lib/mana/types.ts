/**
 * Mana — Silent Software Symbiosis Engine · Type Definitions
 * U.S. Patent App. No. 64/031,637
 * 
 * © CMPSBL® — All rights reserved.
 */

/** Attachment state lifecycle */
export type AttachmentState = 'detached' | 'scanning' | 'attaching' | 'symbiotic' | 'detaching';

/** Lex governance verdict */
export type LexVerdict = 'allow' | 'deny' | 'observe';

/** Layer 2 capability type */
export type ManaCapability =
  | 'defense_gate'
  | 'beacon_telemetry'
  | 'governance_hook'
  | 'dream_synthesis'
  | 'circuit_breaker'
  | 'audit_trail'
  | 'shadow_rule';

/** A single Layer 2 attachment point on a host function */
export interface AttachmentPoint {
  /** Original function name on the host */
  readonly functionName: string;
  /** Capability applied at this point */
  readonly capability: ManaCapability;
  /** Whether the gate is currently active */
  active: boolean;
  /** Invocation count since attachment */
  invocations: number;
  /** Blocked invocation count (defense gates) */
  blocked: number;
  /** Observed (but allowed) invocation count */
  observed: number;
  /** Custom rule payload (e.g., shadow rule message) */
  rulePayload?: unknown;
}

/** Lex governance rule */
export interface LexRule {
  readonly id: string;
  readonly capability: ManaCapability;
  readonly target: string;
  readonly verdict: LexVerdict;
  readonly reason: string;
  readonly createdAt: number;
}

/** Proof artifact — cryptographic evidence of non-modification */
export interface ManaProof {
  /** SHA-256 of the original host source before attachment */
  readonly hostHashBefore: string;
  /** SHA-256 of the original host source after attachment (must match before) */
  readonly hostHashAfter: string;
  /** Whether hashes match — proof of non-modification */
  readonly verified: boolean;
  /** Timestamp of proof generation */
  readonly timestamp: number;
  /** Host package identity */
  readonly hostPackage: string;
  /** Host package version */
  readonly hostVersion: string;
  /** Number of active Layer 2 attachment points */
  readonly attachmentPointCount: number;
  /** Capabilities applied */
  readonly capabilities: ManaCapability[];
  /** Mana Fingerprint ID */
  readonly fingerprintId: string;
  /** Recursive layer depth — 0 = raw host, 1 = first Mana layer, etc. */
  readonly layerDepth: number;
  /** SHA-256 of the parent layer (null if wrapping raw source) */
  readonly parentLayerHash: string | null;
}

/** Telemetry event from Layer 2 observation */
export interface ManaTelemetryEvent {
  readonly timestamp: number;
  readonly capability: ManaCapability;
  readonly functionName: string;
  readonly action: 'invoked' | 'blocked' | 'observed' | 'mutated';
  readonly metadata?: Record<string, unknown>;
}

/** Full attachment manifest */
export interface ManaManifest {
  readonly hostPackage: string;
  readonly hostVersion: string;
  readonly attachmentState: AttachmentState;
  readonly attachmentPoints: ReadonlyArray<AttachmentPoint>;
  readonly lexRules: ReadonlyArray<LexRule>;
  readonly proof: ManaProof | null;
  readonly telemetry: ReadonlyArray<ManaTelemetryEvent>;
  readonly attachedAt: number | null;
  readonly detachedAt: number | null;
  /** Recursive layer depth */
  readonly layerDepth: number;
}

/** Mana Engine configuration */
export interface ManaConfig {
  /** Enable telemetry collection */
  telemetry: boolean;
  /** Maximum telemetry events to retain */
  maxTelemetryEvents: number;
  /** Enable DREAM synthesis on telemetry */
  dreamSynthesis: boolean;
  /** Lex strictness: 'permissive' allows all, 'strict' blocks by default */
  lexMode: 'permissive' | 'strict';
}

// ═══════════════════════════════════════════════════════════════
// Ascension ↔ Mana Bridge Types
// ═══════════════════════════════════════════════════════════════

/** A finding from Ascension's scan — identifies a specific function that needs wrapping */
export interface AscensionFinding {
  /** Function name detected in source (e.g. "processPayment") */
  readonly functionName: string;
  /** Mana capability to apply (e.g. "defense_gate") */
  readonly capability: ManaCapability;
  /** Which primitive drove this finding (e.g. "DEFENSE") */
  readonly primitive: string;
  /** Why this function was flagged (e.g. "Handles untrusted input") */
  readonly reason: string;
  /** Confidence from scanner signal strength (0–1) */
  readonly confidence: number;
}

/** Serializable Mana attachment config for export artifacts */
export interface ManaAttachmentEntry {
  readonly functionName: string;
  readonly capability: ManaCapability;
  readonly primitive: string;
  readonly reason: string;
}
