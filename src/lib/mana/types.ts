/**
 * Mana — Silent Software Symbiosis Engine · Type Definitions
 * U.S. Patent App. No. 64/031,637
 * 
 * Unified with Ascension Discovery — every discoverable primitive
 * maps to deployable Mana wrappers. No gap between scan and deploy.
 * 
 * © CMPSBL® — All rights reserved.
 */

/** Attachment state lifecycle */
export type AttachmentState = 'detached' | 'scanning' | 'attaching' | 'symbiotic' | 'detaching';

/** Lex governance verdict */
export type LexVerdict = 'allow' | 'deny' | 'observe';

/**
 * Layer 2 capability type — 92 granular attachment behaviors
 * Unified across ALL Ascension-discoverable primitives.
 * Every capability Ascension can find, Mana can deploy.
 */
export type ManaCapability =
  // ── DEFENSE family (6) ──
  | 'defense_gate'
  | 'input_sanitizer'
  | 'threat_scorer'
  | 'rate_limiter'
  | 'payload_validator'
  | 'injection_guard'
  // ── BEACON family (5) ──
  | 'beacon_telemetry'
  | 'latency_profiler'
  | 'error_tracker'
  | 'throughput_meter'
  | 'dependency_mapper'
  // ── GOVERNANCE family (6) ──
  | 'governance_hook'
  | 'mutation_guard'
  | 'policy_enforcer'
  | 'consent_gate'
  | 'compliance_check'
  | 'access_controller'
  // ── FAILSAFE family (5) ──
  | 'circuit_breaker'
  | 'retry_handler'
  | 'timeout_guard'
  | 'bulkhead_isolator'
  | 'fallback_provider'
  // ── AUDIT family (4) ──
  | 'audit_trail'
  | 'call_logger'
  | 'state_snapshot'
  | 'forensic_recorder'
  // ── SHADOW family (3) ──
  | 'shadow_rule'
  | 'output_filter'
  | 'data_masker'
  // ── DREAM family (3) ──
  | 'dream_synthesis'
  | 'anomaly_detector'
  | 'drift_monitor'
  // ── MEMORY family (3) ──
  | 'memory_cache'
  | 'memory_ttl'
  | 'memory_state_track'
  // ── NEXUS family (3) ──
  | 'nexus_router'
  | 'nexus_cost_gate'
  | 'nexus_fallback'
  // ── BRAIN family (3) ──
  | 'brain_reasoning_trace'
  | 'brain_context_guard'
  | 'brain_confidence_gate'
  // ── ORACLE family (3) ──
  | 'oracle_predictor'
  | 'oracle_anomaly_alert'
  | 'oracle_causal_trace'
  // ── CORTEX family (3) ──
  | 'cortex_orchestrator'
  | 'cortex_resource_gate'
  | 'cortex_planning_trace'
  // ── ECHO family (2) ──
  | 'echo_amplifier'
  | 'echo_resonance'
  // ── HARVEST family (2) ──
  | 'harvest_quality_gate'
  | 'harvest_dedup'
  // ── PHANTOM family (2) ──
  | 'phantom_stealth'
  | 'phantom_fingerprint_mask'
  // ── LINGUA family (2) ──
  | 'lingua_normalizer'
  | 'lingua_encoding_guard'
  // ── NERVE family (2) ──
  | 'nerve_priority_router'
  | 'nerve_backpressure'
  // ── COMPASS family (2) ──
  | 'compass_intent_resolver'
  | 'compass_goal_validator'
  // ── SANDBOX family (2) ──
  | 'sandbox_isolator'
  | 'sandbox_resource_limit'
  // ── RIPPLE family (2) ──
  | 'ripple_impact_tracer'
  | 'ripple_dependency_check'
  // ── IDENTITY family (2) ──
  | 'identity_session_bind'
  | 'identity_auth_gate'
  // ── VISION family (2) ──
  | 'vision_perf_monitor'
  | 'vision_accessibility_check'
  // ── INCLUSIVE family (2) ──
  | 'inclusive_i18n_guard'
  | 'inclusive_contrast_check'
  // ── RELAY family (2) ──
  | 'relay_sync'
  | 'relay_offline_cache'
  // ── INTEGRATION family (2) ──
  | 'integration_bridge'
  | 'integration_webhook'
  // ── ATLAS family (2) ──
  | 'atlas_complexity_check'
  | 'atlas_dependency_map'
  // ── MEDIC family (2) ──
  | 'medic_health_check'
  | 'medic_memory_guard'
  // ── SYSTEM family (2) ──
  | 'system_telemetry'
  | 'system_feature_flag'
  // ── IMMUNITY family (3) ──
  | 'immunity_self_heal'
  | 'immunity_quarantine'
  | 'immunity_vaccination'
  // ── REFLEX family (2) ──
  | 'reflex_circuit_breaker'
  | 'reflex_fallback_chain'
  // ── EVOLUTION family (2) ──
  | 'evolution_patch'
  | 'evolution_rollback'
  // ── TREATY family (2) ──
  | 'treaty_contract_check'
  | 'treaty_sla_monitor'
  // ── SOVEREIGN family (2) ──
  | 'sovereign_encrypt'
  | 'sovereign_tenant_isolate'
  // ── CORE family (2) ──
  | 'core_lifecycle_guard'
  | 'core_state_validator'
  // ── ACCESS family (2) ──
  | 'access_rbac_gate'
  | 'access_api_key_check'
  // ── CONSCIENCE family (2) ──
  | 'conscience_ethics_gate'
  | 'conscience_bias_check'
  // ── FORGE family (2) ──
  | 'forge_package_seal'
  | 'forge_integrity_check';

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
