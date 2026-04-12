/**
 * CMPSBL® Mana → Capability Lifecycle Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Converts Mana attachment data into capability lifecycle
 * records so the activation guide can be auto-generated
 * during export.
 *
 * Unified — every ManaCapability maps to its Ascension primitive.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ManaManifest, AttachmentPoint } from '@/lib/mana/types';
import type { DetectionRecord, GenerationRecord, BindingRecord } from './ledger-builder';
import { buildLedger } from './ledger-builder';
import { generateActivationGuide, renderActivationGuideHtml } from './activation-guide';
import type { CapabilityActivationLedger, CapabilityActivationGuide } from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — UNIFIED CAPABILITY → PRIMITIVE MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/** Map every Mana capability slug to its canonical Ascension primitive */
const CAPABILITY_TO_PRIMITIVE: Record<string, string> = {
  // DEFENSE
  defense_gate: 'DEFENSE',
  input_sanitizer: 'DEFENSE',
  threat_scorer: 'DEFENSE',
  rate_limiter: 'DEFENSE',
  payload_validator: 'DEFENSE',
  injection_guard: 'DEFENSE',
  // BEACON
  beacon_telemetry: 'BEACON',
  latency_profiler: 'BEACON',
  error_tracker: 'BEACON',
  throughput_meter: 'BEACON',
  dependency_mapper: 'BEACON',
  // GOVERNANCE
  governance_hook: 'GOVERNANCE',
  mutation_guard: 'GOVERNANCE',
  policy_enforcer: 'GOVERNANCE',
  consent_gate: 'GOVERNANCE',
  compliance_check: 'GOVERNANCE',
  access_controller: 'GOVERNANCE',
  // FAILSAFE
  circuit_breaker: 'FAILSAFE',
  retry_handler: 'FAILSAFE',
  timeout_guard: 'FAILSAFE',
  bulkhead_isolator: 'FAILSAFE',
  fallback_provider: 'FAILSAFE',
  // AUDIT
  audit_trail: 'AUDIT',
  call_logger: 'AUDIT',
  state_snapshot: 'AUDIT',
  forensic_recorder: 'AUDIT',
  // SHADOW
  shadow_rule: 'SHADOW',
  output_filter: 'SHADOW',
  data_masker: 'SHADOW',
  // DREAM
  dream_synthesis: 'DREAM',
  anomaly_detector: 'DREAM',
  drift_monitor: 'DREAM',
  // MEMORY
  memory_cache: 'MEMORY',
  memory_ttl: 'MEMORY',
  memory_state_track: 'MEMORY',
  // NEXUS
  nexus_router: 'NEXUS',
  nexus_cost_gate: 'NEXUS',
  nexus_fallback: 'NEXUS',
  // BRAIN
  brain_reasoning_trace: 'BRAIN',
  brain_context_guard: 'BRAIN',
  brain_confidence_gate: 'BRAIN',
  // ORACLE
  oracle_predictor: 'ORACLE',
  oracle_anomaly_alert: 'ORACLE',
  oracle_causal_trace: 'ORACLE',
  // CORTEX
  cortex_orchestrator: 'CORTEX',
  cortex_resource_gate: 'CORTEX',
  cortex_planning_trace: 'CORTEX',
  // ECHO
  echo_amplifier: 'ECHO',
  echo_resonance: 'ECHO',
  // HARVEST
  harvest_quality_gate: 'HARVEST',
  harvest_dedup: 'HARVEST',
  // PHANTOM
  phantom_stealth: 'PHANTOM',
  phantom_fingerprint_mask: 'PHANTOM',
  // LINGUA
  lingua_normalizer: 'LINGUA',
  lingua_encoding_guard: 'LINGUA',
  // NERVE
  nerve_priority_router: 'NERVE',
  nerve_backpressure: 'NERVE',
  // COMPASS
  compass_intent_resolver: 'COMPASS',
  compass_goal_validator: 'COMPASS',
  // SANDBOX
  sandbox_isolator: 'SANDBOX',
  sandbox_resource_limit: 'SANDBOX',
  // RIPPLE
  ripple_impact_tracer: 'RIPPLE',
  ripple_dependency_check: 'RIPPLE',
  // IDENTITY
  identity_session_bind: 'IDENTITY',
  identity_auth_gate: 'IDENTITY',
  // VISION
  vision_perf_monitor: 'VISION',
  vision_accessibility_check: 'VISION',
  // INCLUSIVE
  inclusive_i18n_guard: 'INCLUSIVE',
  inclusive_contrast_check: 'INCLUSIVE',
  // RELAY
  relay_sync: 'RELAY',
  relay_offline_cache: 'RELAY',
  // INTEGRATION
  integration_bridge: 'INTEGRATION',
  integration_webhook: 'INTEGRATION',
  // ATLAS
  atlas_complexity_check: 'ATLAS',
  atlas_dependency_map: 'ATLAS',
  // MEDIC
  medic_health_check: 'MEDIC',
  medic_memory_guard: 'MEDIC',
  // SYSTEM
  system_telemetry: 'SYSTEM',
  system_feature_flag: 'SYSTEM',
  // IMMUNITY
  immunity_self_heal: 'IMMUNITY',
  immunity_quarantine: 'IMMUNITY',
  immunity_vaccination: 'IMMUNITY',
  // REFLEX
  reflex_circuit_breaker: 'REFLEX',
  reflex_fallback_chain: 'REFLEX',
  // EVOLUTION
  evolution_patch: 'EVOLUTION',
  evolution_rollback: 'EVOLUTION',
  // TREATY
  treaty_contract_check: 'TREATY',
  treaty_sla_monitor: 'TREATY',
  // SOVEREIGN
  sovereign_encrypt: 'SOVEREIGN',
  sovereign_tenant_isolate: 'SOVEREIGN',
  // CORE
  core_lifecycle_guard: 'CORE',
  core_state_validator: 'CORE',
  // ACCESS
  access_rbac_gate: 'ACCESS',
  access_api_key_check: 'ACCESS',
  // CONSCIENCE
  conscience_ethics_gate: 'CONSCIENCE',
  conscience_bias_check: 'CONSCIENCE',
  // FORGE
  forge_package_seal: 'FORGE',
  forge_integrity_check: 'FORGE',
} as const;

function toPrimitiveName(capability: string): string {
  return CAPABILITY_TO_PRIMITIVE[capability] ?? capability.toUpperCase().replace(/_/g, ' ');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — RECORD BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════

function groupByPrimitive(points: ReadonlyArray<AttachmentPoint>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const point of points) {
    const name = toPrimitiveName(point.capability);
    const existing = map.get(name) ?? [];
    if (!existing.includes(point.functionName)) {
      existing.push(point.functionName);
    }
    map.set(name, existing);
  }
  return map;
}

function buildDetections(grouped: Map<string, string[]>): DetectionRecord[] {
  return Array.from(grouped.entries()).map(([name, targets]) => ({
    primitiveName: name,
    targets,
    confidence: 1.0,
  }));
}

function buildGenerations(grouped: Map<string, string[]>): GenerationRecord[] {
  return Array.from(grouped.keys()).map(name => ({
    primitiveName: name,
    wrapperEmitted: true,
    outputFile: `layer2/${name.toLowerCase()}-wrapper`,
  }));
}

function buildBindings(grouped: Map<string, string[]>): BindingRecord[] {
  return Array.from(grouped.entries()).map(([name, targets]) => ({
    primitiveName: name,
    boundTargets: targets,
    structurallyLinked: true,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

export interface ManaActivationArtifacts {
  readonly ledger: CapabilityActivationLedger;
  readonly guide: CapabilityActivationGuide;
  readonly guideHtml: string;
  readonly ledgerJson: string;
}

export function generateManaActivationArtifacts(
  manifest: ManaManifest,
  fingerprintId: string,
  sourceLanguage: string,
): ManaActivationArtifacts {
  const grouped = groupByPrimitive(manifest.attachmentPoints);

  const detections = buildDetections(grouped);
  const generations = buildGenerations(grouped);
  const bindings = buildBindings(grouped);

  const activations: never[] = [];
  const probes: never[] = [];

  const ledger = buildLedger(fingerprintId, detections, generations, bindings, activations, probes);
  const guide = generateActivationGuide(ledger, sourceLanguage);
  const guideHtml = renderActivationGuideHtml(guide);
  const ledgerJson = JSON.stringify(ledger, null, 2);

  return { ledger, guide, guideHtml, ledgerJson };
}
