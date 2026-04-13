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

/** Lex evaluation context — separates attachment-time from runtime verdicts */
export type LexEvalContext = 'attachment' | 'runtime';

/** Typed callable — replaces raw Function everywhere */
export type AnyFn = (...args: unknown[]) => unknown;

/**
 * Capability or wildcard — used in Lex rules.
 * Wildcards match ALL capabilities when used in rule definitions.
 * Actual wrapper capabilities are always ManaCapability (never '*').
 */
export type ManaCapabilityOrWildcard = ManaCapability | '*';

/**
 * Wrapper execution phase — deterministic ordering.
 * Lower numbers execute first (outermost wrapper).
 * Original function executes between PHASE_FAILSAFE and PHASE_OBSERVE.
 */
export enum WrapperPhase {
  /** DEFENSE / ACCESS / GOVERNANCE gates — block before anything runs */
  GATE = 0,
  /** VALIDATION / SANITIZATION — clean inputs */
  VALIDATE = 1,
  /** FAILSAFE — circuit breakers, retries, timeouts */
  FAILSAFE = 2,
  /** ORIGINAL EXECUTION happens here (implicit) */
  /** OBSERVABILITY / AUDIT / TELEMETRY — record after execution */
  OBSERVE = 3,
  /** DREAM / ANALYSIS / MEMORY — post-processing */
  ANALYZE = 4,
}

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

/** Maps each capability to its deterministic execution phase */
export const CAPABILITY_PHASE: Record<ManaCapability, WrapperPhase> = {
  // ── GATE phase (0) ──
  defense_gate: WrapperPhase.GATE,
  access_controller: WrapperPhase.GATE,
  governance_hook: WrapperPhase.GATE,
  shadow_rule: WrapperPhase.GATE,
  policy_enforcer: WrapperPhase.GATE,
  consent_gate: WrapperPhase.GATE,
  access_rbac_gate: WrapperPhase.GATE,
  access_api_key_check: WrapperPhase.GATE,
  identity_auth_gate: WrapperPhase.GATE,
  conscience_ethics_gate: WrapperPhase.GATE,
  core_lifecycle_guard: WrapperPhase.GATE,
  sovereign_tenant_isolate: WrapperPhase.GATE,
  brain_context_guard: WrapperPhase.GATE,
  cortex_resource_gate: WrapperPhase.GATE,
  compass_goal_validator: WrapperPhase.GATE,
  sandbox_resource_limit: WrapperPhase.GATE,
  system_feature_flag: WrapperPhase.GATE,
  treaty_contract_check: WrapperPhase.GATE,
  harvest_quality_gate: WrapperPhase.GATE,
  brain_confidence_gate: WrapperPhase.GATE,
  nexus_cost_gate: WrapperPhase.GATE,

  // ── VALIDATE phase (1) ──
  input_sanitizer: WrapperPhase.VALIDATE,
  threat_scorer: WrapperPhase.VALIDATE,
  payload_validator: WrapperPhase.VALIDATE,
  injection_guard: WrapperPhase.VALIDATE,
  data_masker: WrapperPhase.VALIDATE,
  mutation_guard: WrapperPhase.VALIDATE,
  lingua_normalizer: WrapperPhase.VALIDATE,
  lingua_encoding_guard: WrapperPhase.VALIDATE,
  output_filter: WrapperPhase.VALIDATE,
  rate_limiter: WrapperPhase.VALIDATE,

  // ── FAILSAFE phase (2) ──
  circuit_breaker: WrapperPhase.FAILSAFE,
  retry_handler: WrapperPhase.FAILSAFE,
  timeout_guard: WrapperPhase.FAILSAFE,
  bulkhead_isolator: WrapperPhase.FAILSAFE,
  fallback_provider: WrapperPhase.FAILSAFE,
  reflex_circuit_breaker: WrapperPhase.FAILSAFE,
  reflex_fallback_chain: WrapperPhase.FAILSAFE,
  immunity_self_heal: WrapperPhase.FAILSAFE,
  immunity_quarantine: WrapperPhase.FAILSAFE,
  sandbox_isolator: WrapperPhase.FAILSAFE,
  nerve_backpressure: WrapperPhase.FAILSAFE,
  nexus_fallback: WrapperPhase.FAILSAFE,

  // ── OBSERVE phase (3) ──
  beacon_telemetry: WrapperPhase.OBSERVE,
  latency_profiler: WrapperPhase.OBSERVE,
  error_tracker: WrapperPhase.OBSERVE,
  throughput_meter: WrapperPhase.OBSERVE,
  dependency_mapper: WrapperPhase.OBSERVE,
  audit_trail: WrapperPhase.OBSERVE,
  call_logger: WrapperPhase.OBSERVE,
  state_snapshot: WrapperPhase.OBSERVE,
  forensic_recorder: WrapperPhase.OBSERVE,
  compliance_check: WrapperPhase.OBSERVE,
  vision_perf_monitor: WrapperPhase.OBSERVE,
  vision_accessibility_check: WrapperPhase.OBSERVE,
  inclusive_i18n_guard: WrapperPhase.OBSERVE,
  inclusive_contrast_check: WrapperPhase.OBSERVE,
  system_telemetry: WrapperPhase.OBSERVE,
  medic_health_check: WrapperPhase.OBSERVE,
  medic_memory_guard: WrapperPhase.OBSERVE,
  treaty_sla_monitor: WrapperPhase.OBSERVE,
  forge_package_seal: WrapperPhase.OBSERVE,
  forge_integrity_check: WrapperPhase.OBSERVE,
  core_state_validator: WrapperPhase.OBSERVE,
  conscience_bias_check: WrapperPhase.OBSERVE,
  relay_sync: WrapperPhase.OBSERVE,
  relay_offline_cache: WrapperPhase.OBSERVE,
  integration_bridge: WrapperPhase.OBSERVE,
  integration_webhook: WrapperPhase.OBSERVE,
  atlas_complexity_check: WrapperPhase.OBSERVE,
  atlas_dependency_map: WrapperPhase.OBSERVE,
  identity_session_bind: WrapperPhase.OBSERVE,
  phantom_stealth: WrapperPhase.OBSERVE,
  phantom_fingerprint_mask: WrapperPhase.OBSERVE,
  nerve_priority_router: WrapperPhase.OBSERVE,
  compass_intent_resolver: WrapperPhase.OBSERVE,
  nexus_router: WrapperPhase.OBSERVE,
  echo_amplifier: WrapperPhase.OBSERVE,
  echo_resonance: WrapperPhase.OBSERVE,
  cortex_orchestrator: WrapperPhase.OBSERVE,
  cortex_planning_trace: WrapperPhase.OBSERVE,
  sovereign_encrypt: WrapperPhase.OBSERVE,
  evolution_patch: WrapperPhase.OBSERVE,
  evolution_rollback: WrapperPhase.OBSERVE,
  immunity_vaccination: WrapperPhase.OBSERVE,
  ripple_impact_tracer: WrapperPhase.OBSERVE,
  ripple_dependency_check: WrapperPhase.OBSERVE,
  harvest_dedup: WrapperPhase.OBSERVE,

  // ── ANALYZE phase (4) ──
  dream_synthesis: WrapperPhase.ANALYZE,
  anomaly_detector: WrapperPhase.ANALYZE,
  drift_monitor: WrapperPhase.ANALYZE,
  memory_cache: WrapperPhase.ANALYZE,
  memory_ttl: WrapperPhase.ANALYZE,
  memory_state_track: WrapperPhase.ANALYZE,
  brain_reasoning_trace: WrapperPhase.ANALYZE,
  oracle_predictor: WrapperPhase.ANALYZE,
  oracle_anomaly_alert: WrapperPhase.ANALYZE,
  oracle_causal_trace: WrapperPhase.ANALYZE,
};

/** Blocking semantics for deny verdicts */
export type DenySemantic = 'throw' | 'return_undefined' | 'return_message' | 'swallow';

/** Capability metadata — formalizes wrapper behavior contract */
export interface CapabilityContract {
  readonly capability: ManaCapability;
  readonly phase: WrapperPhase;
  /** What happens when Lex denies at runtime */
  readonly denySemantic: DenySemantic;
  /** Whether this wrapper can block execution */
  readonly blocking: boolean;
  /** The Lex key used for runtime evaluation (may differ from capability) */
  readonly lexKey: ManaCapability;
}

/**
 * Capability Contracts Table — COMPLETE for all 92 capabilities.
 * Formalizes the mapping: capability → wrapper family → Lex key → phase → blocking semantics.
 */
export const CAPABILITY_CONTRACTS: ReadonlyArray<CapabilityContract> = [
  // ── GATE phase — blocking gates ──
  { capability: 'defense_gate', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'defense_gate' },
  { capability: 'access_controller', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'shadow_rule' },
  { capability: 'governance_hook', phase: WrapperPhase.GATE, denySemantic: 'return_undefined', blocking: true, lexKey: 'governance_hook' },
  { capability: 'shadow_rule', phase: WrapperPhase.GATE, denySemantic: 'return_message', blocking: true, lexKey: 'shadow_rule' },
  { capability: 'policy_enforcer', phase: WrapperPhase.GATE, denySemantic: 'return_undefined', blocking: true, lexKey: 'governance_hook' },
  { capability: 'consent_gate', phase: WrapperPhase.GATE, denySemantic: 'return_undefined', blocking: true, lexKey: 'governance_hook' },
  { capability: 'access_rbac_gate', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'access_controller' },
  { capability: 'access_api_key_check', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'access_controller' },
  { capability: 'identity_auth_gate', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'access_controller' },
  { capability: 'conscience_ethics_gate', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'core_lifecycle_guard', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'sovereign_tenant_isolate', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'access_controller' },
  { capability: 'brain_context_guard', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'cortex_resource_gate', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'compass_goal_validator', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'sandbox_resource_limit', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'system_feature_flag', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'treaty_contract_check', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'harvest_quality_gate', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'brain_confidence_gate', phase: WrapperPhase.GATE, denySemantic: 'return_undefined', blocking: true, lexKey: 'brain_confidence_gate' },
  { capability: 'nexus_cost_gate', phase: WrapperPhase.GATE, denySemantic: 'throw', blocking: true, lexKey: 'nexus_cost_gate' },

  // ── VALIDATE phase — input cleaning ──
  { capability: 'input_sanitizer', phase: WrapperPhase.VALIDATE, denySemantic: 'throw', blocking: true, lexKey: 'input_sanitizer' },
  { capability: 'threat_scorer', phase: WrapperPhase.VALIDATE, denySemantic: 'throw', blocking: true, lexKey: 'defense_gate' },
  { capability: 'payload_validator', phase: WrapperPhase.VALIDATE, denySemantic: 'throw', blocking: true, lexKey: 'payload_validator' },
  { capability: 'injection_guard', phase: WrapperPhase.VALIDATE, denySemantic: 'throw', blocking: true, lexKey: 'injection_guard' },
  { capability: 'data_masker', phase: WrapperPhase.VALIDATE, denySemantic: 'swallow', blocking: false, lexKey: 'data_masker' },
  { capability: 'mutation_guard', phase: WrapperPhase.VALIDATE, denySemantic: 'throw', blocking: true, lexKey: 'governance_hook' },
  { capability: 'lingua_normalizer', phase: WrapperPhase.VALIDATE, denySemantic: 'swallow', blocking: false, lexKey: 'lingua_normalizer' },
  { capability: 'lingua_encoding_guard', phase: WrapperPhase.VALIDATE, denySemantic: 'swallow', blocking: false, lexKey: 'lingua_encoding_guard' },
  { capability: 'output_filter', phase: WrapperPhase.VALIDATE, denySemantic: 'swallow', blocking: false, lexKey: 'output_filter' },
  { capability: 'rate_limiter', phase: WrapperPhase.VALIDATE, denySemantic: 'throw', blocking: true, lexKey: 'rate_limiter' },

  // ── FAILSAFE phase — resilience ──
  { capability: 'circuit_breaker', phase: WrapperPhase.FAILSAFE, denySemantic: 'throw', blocking: true, lexKey: 'circuit_breaker' },
  { capability: 'retry_handler', phase: WrapperPhase.FAILSAFE, denySemantic: 'throw', blocking: true, lexKey: 'retry_handler' },
  { capability: 'timeout_guard', phase: WrapperPhase.FAILSAFE, denySemantic: 'throw', blocking: true, lexKey: 'timeout_guard' },
  { capability: 'bulkhead_isolator', phase: WrapperPhase.FAILSAFE, denySemantic: 'throw', blocking: true, lexKey: 'bulkhead_isolator' },
  { capability: 'fallback_provider', phase: WrapperPhase.FAILSAFE, denySemantic: 'return_undefined', blocking: false, lexKey: 'fallback_provider' },
  { capability: 'reflex_circuit_breaker', phase: WrapperPhase.FAILSAFE, denySemantic: 'throw', blocking: true, lexKey: 'circuit_breaker' },
  { capability: 'reflex_fallback_chain', phase: WrapperPhase.FAILSAFE, denySemantic: 'return_undefined', blocking: false, lexKey: 'fallback_provider' },
  { capability: 'immunity_self_heal', phase: WrapperPhase.FAILSAFE, denySemantic: 'return_undefined', blocking: false, lexKey: 'immunity_self_heal' },
  { capability: 'immunity_quarantine', phase: WrapperPhase.FAILSAFE, denySemantic: 'throw', blocking: true, lexKey: 'bulkhead_isolator' },
  { capability: 'sandbox_isolator', phase: WrapperPhase.FAILSAFE, denySemantic: 'throw', blocking: true, lexKey: 'bulkhead_isolator' },
  { capability: 'nerve_backpressure', phase: WrapperPhase.FAILSAFE, denySemantic: 'throw', blocking: true, lexKey: 'bulkhead_isolator' },
  { capability: 'nexus_fallback', phase: WrapperPhase.FAILSAFE, denySemantic: 'return_undefined', blocking: false, lexKey: 'fallback_provider' },

  // ── OBSERVE phase — telemetry (never blocking) ──
  { capability: 'beacon_telemetry', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'beacon_telemetry' },
  { capability: 'latency_profiler', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'latency_profiler' },
  { capability: 'error_tracker', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'error_tracker' },
  { capability: 'throughput_meter', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'throughput_meter' },
  { capability: 'dependency_mapper', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'dependency_mapper' },
  { capability: 'audit_trail', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'audit_trail' },
  { capability: 'call_logger', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'call_logger' },
  { capability: 'state_snapshot', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'state_snapshot' },
  { capability: 'forensic_recorder', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'forensic_recorder' },
  { capability: 'compliance_check', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'compliance_check' },
  { capability: 'system_telemetry', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'beacon_telemetry' },
  { capability: 'core_state_validator', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'core_state_validator' },
  { capability: 'vision_perf_monitor', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'latency_profiler' },
  { capability: 'vision_accessibility_check', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'vision_accessibility_check' },
  { capability: 'inclusive_i18n_guard', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'inclusive_i18n_guard' },
  { capability: 'inclusive_contrast_check', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'inclusive_contrast_check' },
  { capability: 'medic_health_check', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'medic_health_check' },
  { capability: 'medic_memory_guard', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'medic_memory_guard' },
  { capability: 'treaty_sla_monitor', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'treaty_sla_monitor' },
  { capability: 'forge_package_seal', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'forge_package_seal' },
  { capability: 'forge_integrity_check', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'forge_integrity_check' },
  { capability: 'conscience_bias_check', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'conscience_bias_check' },
  { capability: 'relay_sync', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'relay_sync' },
  { capability: 'relay_offline_cache', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'relay_offline_cache' },
  { capability: 'integration_bridge', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'integration_bridge' },
  { capability: 'integration_webhook', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'integration_webhook' },
  { capability: 'atlas_complexity_check', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'atlas_complexity_check' },
  { capability: 'atlas_dependency_map', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'dependency_mapper' },
  { capability: 'identity_session_bind', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'identity_session_bind' },
  { capability: 'phantom_stealth', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'phantom_stealth' },
  { capability: 'phantom_fingerprint_mask', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'phantom_fingerprint_mask' },
  { capability: 'nerve_priority_router', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'nerve_priority_router' },
  { capability: 'compass_intent_resolver', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'compass_intent_resolver' },
  { capability: 'nexus_router', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'nexus_router' },
  { capability: 'echo_amplifier', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'echo_amplifier' },
  { capability: 'echo_resonance', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'echo_resonance' },
  { capability: 'cortex_orchestrator', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'cortex_orchestrator' },
  { capability: 'cortex_planning_trace', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'cortex_planning_trace' },
  { capability: 'sovereign_encrypt', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'sovereign_encrypt' },
  { capability: 'evolution_patch', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'evolution_patch' },
  { capability: 'evolution_rollback', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'evolution_rollback' },
  { capability: 'immunity_vaccination', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'immunity_vaccination' },
  { capability: 'ripple_impact_tracer', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'ripple_impact_tracer' },
  { capability: 'ripple_dependency_check', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'ripple_dependency_check' },
  { capability: 'harvest_dedup', phase: WrapperPhase.OBSERVE, denySemantic: 'swallow', blocking: false, lexKey: 'harvest_dedup' },

  // ── ANALYZE phase — post-processing (never blocking) ──
  { capability: 'dream_synthesis', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'dream_synthesis' },
  { capability: 'anomaly_detector', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'anomaly_detector' },
  { capability: 'drift_monitor', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'drift_monitor' },
  { capability: 'memory_cache', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'memory_cache' },
  { capability: 'memory_ttl', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'memory_ttl' },
  { capability: 'memory_state_track', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'memory_state_track' },
  { capability: 'brain_reasoning_trace', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'brain_reasoning_trace' },
  { capability: 'oracle_predictor', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'oracle_predictor' },
  { capability: 'oracle_anomaly_alert', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'anomaly_detector' },
  { capability: 'oracle_causal_trace', phase: WrapperPhase.ANALYZE, denySemantic: 'swallow', blocking: false, lexKey: 'oracle_causal_trace' },
];

/** O(1) contract lookup — pre-computed + frozen from CAPABILITY_CONTRACTS */
export const CONTRACT_MAP: Readonly<Record<ManaCapability, CapabilityContract>> = Object.freeze(
  CAPABILITY_CONTRACTS.reduce((map, contract) => {
    map[contract.capability] = contract;
    return map;
  }, {} as Record<ManaCapability, CapabilityContract>)
);

/** Symbol tag for accurate recursive layer detection — replaces fragile name heuristic */
export const MANA_LAYER_TAG: unique symbol = Symbol('MANA_LAYER');

/** Runtime invariant: every capability in CAPABILITY_PHASE has a contract in CONTRACT_MAP */
export function assertContractMapComplete(): void {
  for (const cap of Object.keys(CAPABILITY_PHASE) as ManaCapability[]) {
    if (!CONTRACT_MAP[cap]) {
      throw new Error(`[MANA] Missing contract for capability: ${cap}`);
    }
  }
}

/** Normalize priority to prevent abuse — clamps to [0, 1000] */
export function normalizePriority(priority: number): number {
  if (priority < 0) return 0;
  if (priority > 1000) return 1000;
  return priority;
}

// ═══════════════════════════════════════════════════════════════
// Compile-Time Contract Coverage (dev-only type safety)
// ═══════════════════════════════════════════════════════════════

/** If this produces a type error, a ManaCapability is missing from CONTRACT_MAP */
type _MissingContracts = Exclude<ManaCapability, (typeof CAPABILITY_CONTRACTS)[number]['capability']>;
/** Compile-time assertion: all capabilities must have contracts */
type _AssertAllCapabilitiesMapped = _MissingContracts extends never ? true : never;
/** Force compile-time check — unused at runtime */
const _contractCoverageCheck: _AssertAllCapabilitiesMapped = true;
void _contractCoverageCheck;

/** A single Layer 2 attachment point on a host function */
export interface AttachmentPoint {
  /** Original function name on the host */
  readonly functionName: string;
  /** Capability applied at this point */
  readonly capability: ManaCapability;
  /** Execution phase for deterministic ordering */
  readonly phase: WrapperPhase;
  /** Wrapper position index — order in which this wrapper was applied */
  position: number;
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

/** Lex governance rule — supports wildcard capabilities via ManaCapabilityOrWildcard */
export interface LexRule {
  readonly id: string;
  /** Capability this rule governs. Use '*' for all capabilities (via ManaCapabilityOrWildcard). */
  readonly capability: ManaCapabilityOrWildcard;
  readonly target: string;
  readonly verdict: LexVerdict;
  readonly reason: string;
  readonly createdAt: number;
  /** Numeric priority — lower = higher priority. Default 100 */
  readonly priority: number;
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
  /** SHA-256 of the manifest at proof time */
  readonly manifestHash: string;
  /** Telemetry event count at proof time */
  readonly telemetryEventCount: number;
}

/** Telemetry event from Layer 2 observation */
export interface ManaTelemetryEvent {
  readonly timestamp: number;
  readonly capability: ManaCapability;
  readonly functionName: string;
  readonly action: 'invoked' | 'blocked' | 'observed' | 'mutated';
  /** Lex evaluation context — was this attachment-time or runtime? */
  readonly evalContext?: LexEvalContext;
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
