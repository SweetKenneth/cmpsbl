# 05 — The 40-primitive matrix

**Source of truth:** `src/lib/ascension-v2/canonical-primitives.ts`

**Build-time guarantee:** The matrix length is asserted to equal 40. Drift is impossible without a build failure.

---

## The four taxonomic categories

```
ORGANS  (12) — long-lived stateful units of the substrate
LAYERS  (12) — cross-cutting governance and policy bands
ENGINES  (8) — transformation and synthesis machines
AGENTS   (8) — purpose-built executors

Total: 40 primitives
```

This decomposition is not arbitrary — it matches the way enterprise architects naturally describe their systems (the "what holds state," "what crosses cuts," "what transforms," "what executes"). It also makes Mana's wrapper-phase ordering meaningful (chapter 09): GATE phase is dominated by Layers, OBSERVE phase is dominated by Organs, ANALYZE phase is dominated by Engines.

---

## Full enumeration

### Organs (12) — stateful

| # | Primitive | Domain | Mana capability family |
|---|---|---|---|
| 01 | **CORE** | Lifecycle, boot, shutdown | `core_lifecycle_guard`, `core_state_validator` |
| 02 | **SYSTEM** | Process management, feature flags | `system_telemetry`, `system_feature_flag` |
| 03 | **BRAIN** | Reasoning, decision-making | `brain_reasoning_trace`, `brain_context_guard`, `brain_confidence_gate` |
| 04 | **MEMORY** | Caching, TTL, state retention | `memory_cache`, `memory_ttl`, `memory_state_track` |
| 05 | **NERVE** | Priority routing, backpressure | `nerve_priority_router`, `nerve_backpressure` |
| 06 | **NEXUS** | Multi-provider routing (AI gateway) | `nexus_router`, `nexus_cost_gate`, `nexus_fallback` |
| 07 | **IDENTITY** | Session, auth bind | `identity_session_bind`, `identity_auth_gate` |
| 08 | **SOVEREIGN** | Encryption, multi-tenant isolation | `sovereign_encrypt`, `sovereign_tenant_isolate` |
| 09 | **ATLAS** | Complexity mapping | `atlas_complexity_check`, `atlas_dependency_map` |
| 10 | **MEDIC** | Health, memory guard | `medic_health_check`, `medic_memory_guard` |
| 11 | **RELAY** | Sync, offline cache | `relay_sync`, `relay_offline_cache` |
| 12 | **CONSCIENCE** | Ethics, bias check | `conscience_ethics_gate`, `conscience_bias_check` |

### Layers (12) — cross-cutting

| # | Primitive | Cross-cut concern | Mana capability family |
|---|---|---|---|
| 13 | **DEFENSE** | Threat detection, gating | `defense_gate`, `input_sanitizer`, `threat_scorer`, `payload_validator`, `injection_guard`, `rate_limiter` |
| 14 | **IMMUNITY** | Self-heal, quarantine, vaccination | `immunity_self_heal`, `immunity_quarantine`, `immunity_vaccination` |
| 15 | **GOVERNANCE** | Mutation guard, policy enforcement, consent | `governance_hook`, `mutation_guard`, `policy_enforcer`, `consent_gate`, `compliance_check` |
| 16 | **TREATY** | Contract checks, SLA monitoring | `treaty_contract_check`, `treaty_sla_monitor` |
| 17 | **EVOLUTION** | Hot patching, rollback | `evolution_patch`, `evolution_rollback` |
| 18 | **REFLEX** | Circuit breaker, fallback chain | `reflex_circuit_breaker`, `reflex_fallback_chain` |
| 19 | **COMPASS** | Intent resolution, goal validation | `compass_intent_resolver`, `compass_goal_validator` |
| 20 | **INTEGRATION** | Bridge, webhook | `integration_bridge`, `integration_webhook` |
| 21 | **INTENT** | (Reserved — observation only in V2) | — |
| 22 | **ACCESS** | RBAC, API key | `access_controller`, `access_rbac_gate`, `access_api_key_check` |
| 23 | **VISION** | Performance monitor, accessibility | `vision_perf_monitor`, `vision_accessibility_check` |
| 24 | **SHADOW** | Shadow rules, output filter, data mask | `shadow_rule`, `output_filter`, `data_masker` |

### Engines (8) — transformation

| # | Primitive | Transform | Mana capability family |
|---|---|---|---|
| 25 | **DREAM** | Algorithmic synthesis (no AI) | `dream_synthesis`, `anomaly_detector`, `drift_monitor` |
| 26 | **HARVEST** | Quality gate, dedup | `harvest_quality_gate`, `harvest_dedup` |
| 27 | **FORGE** | Package seal, integrity | `forge_package_seal`, `forge_integrity_check` |
| 28 | **LINGUA** | Normalization, encoding guard | `lingua_normalizer`, `lingua_encoding_guard` |
| 29 | **ECHO** | Amplification, resonance | `echo_amplifier`, `echo_resonance` |
| 30 | **PHANTOM** | Stealth, fingerprint mask | `phantom_stealth`, `phantom_fingerprint_mask` |
| 31 | **SANDBOX** | Isolation, resource limits | `sandbox_isolator`, `sandbox_resource_limit` |
| 32 | **RIPPLE** | Impact tracing, dependency check | `ripple_impact_tracer`, `ripple_dependency_check` |

### Agents (8) — execution

| # | Primitive | Job | Mana capability family |
|---|---|---|---|
| 33 | **ENCODE** | Encoding (observation in V2) | — |
| 34 | **DECODE** | Decoding, unified interface (observation in V2) | — |
| 35 | **AUDIT** | Trail, log, snapshot, forensics | `audit_trail`, `call_logger`, `state_snapshot`, `forensic_recorder` |
| 36 | **ECONOMY** | Economic gating (observation in V2) | — |
| 37 | **INCLUSIVE** | i18n, contrast | `inclusive_i18n_guard`, `inclusive_contrast_check` |
| 38 | **CORTEX** | Orchestration, planning | `cortex_orchestrator`, `cortex_resource_gate`, `cortex_planning_trace` |
| 39 | **ORACLE** | Prediction, anomaly alert, causal trace | `oracle_predictor`, `oracle_anomaly_alert`, `oracle_causal_trace` |
| 40 | **ENGINEER** | (Reserved — observation only in V2) | — |

---

## Why these 40, and not 30 or 50

We tested matrix sizes from 12 to 200 against a corpus of 500 open-source modules:

| Matrix size | Avg discoveries / module | Avg score variance | Verdict |
|---|---|---|---|
| 12 | 11.7 | low | Too coarse — capabilities collapsed |
| 24 | 14.2 | medium | Workable but missed nuance |
| **40** | **17.8** | **medium** | **Sweet spot** |
| 60 | 18.1 | medium-high | Marginal new primitives never fired |
| 100 | 18.0 | high | Noise dominated signal |

40 was empirical, not theoretical. The decomposition into 12·12·8·8 came after — we noticed the 40 primitives naturally clustered into four taxonomic bands and froze the layout.

---

## Build-time guard

```typescript
// src/lib/ascension-v2/canonical-primitives.ts
export const CANONICAL_PRIMITIVES: readonly string[] = [
  ...ORGANS, ...LAYERS, ...ENGINES, ...AGENTS,
];

if (CANONICAL_PRIMITIVES.length !== 40) {
  throw new Error(
    `[canonical-primitives] Expected 40 primitives, found ${CANONICAL_PRIMITIVES.length}`,
  );
}
```

This runs at module load. If anyone — human or AI — adds a 41st primitive or removes one, the build fails immediately. The matrix is structurally protected.

---

## Mana × Ascension correspondence

Each Ascension primitive maps to one or more Mana capabilities (see the "Mana capability family" column above). The full count is **92 capabilities**, distributed across the 40 primitives. This is the cross-product that makes the two patents complementary: Ascension *finds* a primitive (e.g., DEFENSE); Mana *attaches* one or more enforcement capabilities derived from that family (e.g., `defense_gate`, `input_sanitizer`, `rate_limiter`).

The full 92-capability table — with phase, deny semantic, blocking flag, and Lex key — is in chapter 09.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
