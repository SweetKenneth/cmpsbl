/**
 * S-Tier Capability Activator
 * Stages and registers CJPI 93+ S-tier vault entries as functional capabilities
 * in the Capability Router — transitioning them from "vault blueprints" to "active capabilities"
 *
 * Activation follows 3 waves:
 *   Wave 1 (CJPI 95-98): Critical infrastructure — immediate activation
 *   Wave 2 (CJPI 94):    High-value capabilities — activated after Wave 1 stable
 *   Wave 3 (CJPI 93):    Extended coverage — full matrix parity
 *
 * All activations are registered through the governed Capability Router.
 */

import { registerCapability } from '@/lib/substrate/capability-router';

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 1 — CJPI 95-98 (Critical Infrastructure)
// Already approved (ranks 1-10) + newly promoted flagships
// ═══════════════════════════════════════════════════════════════════════════════

const WAVE_1_ACTIVATIONS = [
  // Already implemented (001-010)
  { module: 'core', capability: 'substrate_registry', priority: 98, id: 'S-129' },
  { module: 'nexus', capability: 'fleet_intelligence_orchestrator', priority: 98, id: 'S-95' },
  { module: 'decode', capability: 'multi_modal_interpreter', priority: 97, id: 'S-97' },
  { module: 'medic', capability: 'autonomous_triage', priority: 97, id: 'S-69' },
  { module: 'nerve', capability: 'consensus_heartbeat', priority: 96, id: 'S-70' },
  { module: 'nexus', capability: 'cost_aware_routing', priority: 96, id: 'S-96' },
  { module: 'vision', capability: 'anomaly_correlation', priority: 96, id: 'S-98' },
  { module: 'immunity', capability: 'self_healing_orchestrator', priority: 96, id: 'S-126' },
  { module: 'audit', capability: 'tamper_evident_chain', priority: 95, id: 'S-71' },
  { module: 'memory', capability: 'write_ahead_log', priority: 95, id: 'S-99' },

  // Newly activated CJPI 95+
  { module: 'cortex', capability: 'pipeline_composition', priority: 95, id: 'S-72' },
  { module: 'evolution', capability: 'mutation_proposal', priority: 95, id: 'S-123' },
  { module: 'core', capability: 'substrate_registry_core', priority: 95, id: 'S-129b' },
  { module: 'observability', capability: 'full_stack_observability', priority: 95, id: 'S-OBS01' },
  { module: 'immunity', capability: 'adaptive_threat_antibody', priority: 95, id: 'S-IMM02' },

  // Cross-module synergies CJPI 95+
  { module: 'oracle', capability: 'oracle_ripple_precognition', priority: 96, id: 'S-SYN01' },
  { module: 'conscience', capability: 'ethical_stealth_arbiter', priority: 95, id: 'S-SYN02' },
  { module: 'forge', capability: 'capability_genesis_reactor', priority: 95, id: 'S-SYN03' },
  { module: 'immunity', capability: 'adaptive_defense_breeding', priority: 95, id: 'S-SYN11' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 2 — CJPI 94 (High-Value Capabilities)
// ═══════════════════════════════════════════════════════════════════════════════

const WAVE_2_ACTIVATIONS = [
  { module: 'nexus', capability: 'multi_model_consensus', priority: 94, id: 'S-120' },
  { module: 'dream', capability: 'nocturne_consolidation', priority: 94, id: 'S-73' },
  { module: 'brain', capability: 'semantic_knowledge_graph', priority: 94, id: 'S-74' },
  { module: 'decode', capability: 'context_threading', priority: 94, id: 'S-103' },
  { module: 'memory', capability: 'sm2_spaced_repetition', priority: 94, id: 'S-105' },
  { module: 'governance', capability: 'veto_authority_engine', priority: 94, id: 'S-128' },
  { module: 'ripple', capability: 'causal_event_propagation', priority: 94, id: 'S-RPL01' },
  { module: 'sovereign', capability: 'data_sovereignty_partitioner', priority: 94, id: 'S-SOV02' },
  { module: 'oracle', capability: 'multi_horizon_prediction', priority: 94, id: 'S-ORC02' },
  { module: 'analytics', capability: 'realtime_analytics_fusion', priority: 94, id: 'S-ANL01' },
  { module: 'intent', capability: 'intent_disambiguation', priority: 94, id: 'S-INT02' },
  { module: 'mesh', capability: 'distributed_consensus_mesh', priority: 94, id: 'S-MSH02' },
  { module: 'encode', capability: 'semantic_encoding_pipeline', priority: 94, id: 'S-ENC02' },
  { module: 'intent', capability: 'conversational_intent_compiler', priority: 94, id: 'S-SYN12' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 3 — CJPI 93 (Extended Matrix Parity)
// ═══════════════════════════════════════════════════════════════════════════════

const WAVE_3_ACTIVATIONS = [
  { module: 'dream', capability: 'pattern_extraction', priority: 93, id: 'S-135' },
  { module: 'nerve', capability: 'partition_detection', priority: 93, id: 'S-75' },
  { module: 'medic', capability: 'predictive_failure_forecaster', priority: 93, id: 'S-76' },
  { module: 'nexus', capability: 'provider_health_monitor', priority: 93, id: 'S-106' },
  { module: 'system', capability: 'boot_dependency_resolver', priority: 93, id: 'S-108' },
  { module: 'core', capability: 'circuit_breaker_fabric', priority: 93, id: 'S-117' },
  { module: 'integration', capability: 'connector_orchestration', priority: 93, id: 'S-101' },
  { module: 'economy', capability: 'realtime_cost_attribution', priority: 93, id: 'S-102' },
  { module: 'evolution', capability: 'shadow_run_environment', priority: 93, id: 'S-124' },
  { module: 'intent', capability: 'goal_tracking', priority: 93, id: 'S-127' },
  { module: 'decode', capability: 'intent_classification', priority: 93, id: 'S-131' },
  { module: 'inclusive', capability: 'adaptive_accessibility', priority: 93, id: 'S-INC01' },
  { module: 'observability', capability: 'distributed_tracing', priority: 93, id: 'S-OBS02' },

  // Extended node flagships
  { module: 'sovereign', capability: 'sovereign_authority_kernel', priority: 93, id: 'S-SOV01' },
  { module: 'oracle', capability: 'counterfactual_scenario', priority: 93, id: 'S-ORC03' },
  { module: 'conscience', capability: 'moral_reasoning_graph', priority: 93, id: 'S-CON02' },
  { module: 'phantom', capability: 'attribution_laundering_detector', priority: 93, id: 'S-PHA02' },
  { module: 'forge', capability: 'blueprint_evolution_compiler', priority: 93, id: 'S-FRG02' },
  { module: 'echo', capability: 'temporal_regression_sandbox', priority: 93, id: 'S-ECH02' },
  { module: 'harvest', capability: 'adaptive_source_discovery', priority: 93, id: 'S-HRV02' },
  { module: 'reflex', capability: 'learned_stimulus_response', priority: 93, id: 'S-RFX02' },
  { module: 'immunity', capability: 'immune_memory_persistence', priority: 93, id: 'S-IMM03' },
  { module: 'relay', capability: 'priority_aware_relay', priority: 93, id: 'S-RLY02' },
  { module: 'intent', capability: 'intent_chaining', priority: 93, id: 'S-INT03' },
  { module: 'access', capability: 'adaptive_rate_limiting', priority: 93, id: 'S-ACC02' },
  { module: 'modernizer', capability: 'technical_debt_quantifier', priority: 93, id: 'S-MOD02' },
  { module: 'identity', capability: 'federated_identity_resolver', priority: 93, id: 'S-IDN02' },

  // Cross-module synergies CJPI 93
  { module: 'harvest', capability: 'cross_lingual_intelligence', priority: 93, id: 'S-SYN04' },
  { module: 'echo', capability: 'adversarial_wargame', priority: 93, id: 'S-SYN05' },
  { module: 'mesh', capability: 'resilient_communication_backbone', priority: 93, id: 'S-SYN13' },
  { module: 'access', capability: 'zero_trust_continuous_verification', priority: 93, id: 'S-SYN14' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 4 — CJPI 92 (Enterprise Tier)
// ═══════════════════════════════════════════════════════════════════════════════

const WAVE_4_ACTIVATIONS = [
  { module: 'brain', capability: 'embedding_store', priority: 92, id: 'S-134' },
  { module: 'atlas', capability: 'capability_gate_engine', priority: 92, id: 'S-77' },
  { module: 'governance', capability: 'self_audit_loop', priority: 92, id: 'S-78' },
  { module: 'vision', capability: 'performance_regression_detector', priority: 92, id: 'S-104' },
  { module: 'defense', capability: 'honeypot_intelligence', priority: 92, id: 'S-107' },
  { module: 'nexus', capability: 'fallback_chain_architect', priority: 92, id: 'S-112' },
  { module: 'memory', capability: 'knowledge_compaction', priority: 92, id: 'S-115' },
  { module: 'memory', capability: 'cross_session_persistence', priority: 92, id: 'S-130' },
  { module: 'nexus', capability: 'token_optimization', priority: 92, id: 'S-138' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 5 — CJPI 91 (Operational Excellence)
// ═══════════════════════════════════════════════════════════════════════════════

const WAVE_5_ACTIVATIONS = [
  { module: 'identity', capability: 'zero_trust_session_binder', priority: 91, id: 'S-79' },
  { module: 'nerve', capability: 'quorum_negotiator', priority: 91, id: 'S-80' },
  { module: 'audit', capability: 'compliance_attestation', priority: 91, id: 'S-81' },
  { module: 'vision', capability: 'resource_waste_profiler', priority: 91, id: 'S-109' },
  { module: 'decode', capability: 'personality_adaptation', priority: 91, id: 'S-110' },
  { module: 'economy', capability: 'roi_attribution', priority: 91, id: 'S-111' },
  { module: 'defense', capability: 'behavioral_anomaly_detector', priority: 91, id: 'S-113' },
  { module: 'access', capability: 'quota_intelligence', priority: 91, id: 'S-119' },
  { module: 'defense', capability: 'input_sanitization_gateway', priority: 91, id: 'S-122' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Activation Engine
// ═══════════════════════════════════════════════════════════════════════════════

export type ActivationWave = 1 | 2 | 3 | 4 | 5;

interface ActivationResult {
  wave: ActivationWave;
  totalActivated: number;
  capabilities: string[];
  activatedAt: string;
}

const activationLog: ActivationResult[] = [];

function activateWave(
  wave: ActivationWave,
  entries: ReadonlyArray<{ module: string; capability: string; priority: number; id: string }>
): ActivationResult {
  const capabilities: string[] = [];

  for (const entry of entries) {
    registerCapability(entry.module, entry.capability, entry.priority);
    capabilities.push(`${entry.module}:${entry.capability}`);
  }

  const result: ActivationResult = {
    wave,
    totalActivated: capabilities.length,
    capabilities,
    activatedAt: new Date().toISOString(),
  };

  activationLog.push(result);

  console.log(
    `[S-Tier Activator] Wave ${wave} complete: ${capabilities.length} capabilities registered`
  );

  return result;
}

/**
 * Activate all 5 waves sequentially
 * Call during substrate boot after capability router is initialized
 */
export function activateAllSTierCapabilities(): ActivationResult[] {
  const allWaves = [WAVE_1_ACTIVATIONS, WAVE_2_ACTIVATIONS, WAVE_3_ACTIVATIONS, WAVE_4_ACTIVATIONS, WAVE_5_ACTIVATIONS];
  const total = allWaves.reduce((s, w) => s + w.length, 0);
  console.log(`[S-Tier Activator] ═══ Beginning staged activation ═══`);
  console.log(`[S-Tier Activator] Total: ${total} capabilities across 5 waves`);

  const results = [
    activateWave(1, WAVE_1_ACTIVATIONS),
    activateWave(2, WAVE_2_ACTIVATIONS),
    activateWave(3, WAVE_3_ACTIVATIONS),
    activateWave(4, WAVE_4_ACTIVATIONS),
    activateWave(5, WAVE_5_ACTIVATIONS),
  ];

  const totalActivated = results.reduce((sum, r) => sum + r.totalActivated, 0);
  console.log(`[S-Tier Activator] ═══ All waves complete: ${totalActivated} capabilities active ═══`);

  return results;
}

/**
 * Activate a specific wave only
 */
export function activateWaveOnly(wave: ActivationWave): ActivationResult {
  const waveMap: Record<ActivationWave, ReadonlyArray<{ module: string; capability: string; priority: number; id: string }>> = {
    1: WAVE_1_ACTIVATIONS,
    2: WAVE_2_ACTIVATIONS,
    3: WAVE_3_ACTIVATIONS,
    4: WAVE_4_ACTIVATIONS,
    5: WAVE_5_ACTIVATIONS,
  };
  return activateWave(wave, waveMap[wave]);
}

/**
 * Get activation history
 */
export function getActivationLog(): ActivationResult[] {
  return [...activationLog];
}

/**
 * Get total S-tier capability count across all waves
 */
export function getSTierCapabilityCount(): {
  wave1: number;
  wave2: number;
  wave3: number;
  wave4: number;
  wave5: number;
  total: number;
} {
  return {
    wave1: WAVE_1_ACTIVATIONS.length,
    wave2: WAVE_2_ACTIVATIONS.length,
    wave3: WAVE_3_ACTIVATIONS.length,
    wave4: WAVE_4_ACTIVATIONS.length,
    wave5: WAVE_5_ACTIVATIONS.length,
    total: WAVE_1_ACTIVATIONS.length + WAVE_2_ACTIVATIONS.length + WAVE_3_ACTIVATIONS.length + WAVE_4_ACTIVATIONS.length + WAVE_5_ACTIVATIONS.length,
  };
}

// Export wave definitions for introspection
export const S_TIER_WAVES = {
  WAVE_1: WAVE_1_ACTIVATIONS,
  WAVE_2: WAVE_2_ACTIVATIONS,
  WAVE_3: WAVE_3_ACTIVATIONS,
  WAVE_4: WAVE_4_ACTIVATIONS,
  WAVE_5: WAVE_5_ACTIVATIONS,
} as const;
  WAVE_2: WAVE_2_ACTIVATIONS,
  WAVE_3: WAVE_3_ACTIVATIONS,
} as const;
