# Capability System Manifest
## v7.6.0 — SYNERGY+ Epoch (76 Capabilities)

Generated: 2026-02-06

---

## System Overview

The Capability System provides a governed, modular approach to edge function management with a focus on **archived edge function digestion**:

1. **Registry** (`src/lib/capabilities/registry.ts`) — Single source of truth for all capabilities
2. **Adapter** (`src/lib/capabilities/adapter.ts`) — Universal invocation wrapper with governance
3. **Guards** (`src/lib/capabilities/guards.ts`) — Safety + governance enforcement layer
4. **Auto-Loader** (`src/lib/capabilities/auto-loader.ts`) — Filesystem scanner for drop-in capabilities
5. **Archived-Loader** (`src/lib/capabilities/archived-loader.ts`) — Scans ONLY archived edge functions
6. **State** (`src/lib/capabilities/state.ts`) — Enable/disable toggle management (persisted)
7. **Confidence** (`src/lib/capabilities/confidence.ts`) — Feedback + scoring system
8. **Normalize** (`src/lib/capabilities/normalize.ts`) — Output shaping for consistent responses

---

## Capability Summary (76 Total)

| Category | Count |
|----------|-------|
| Original Core Synergies | 10 |
| Archived Edge Function Integrations | 10 |
| NEW High-Value Module Capabilities (v7.6.0) | 56 |
| **TOTAL** | **76** |

---

## 10 Original Core Synergies

| Capability | Modules | Risk | Value |
|------------|---------|------|-------|
| `predictive_issue_prevention` | VISION, BRAIN, MODERNIZER | Low | 95 |
| `adaptive_learning_personalization` | BRAIN, DECODE, INCLUSIVE | Low | 92 |
| `intelligent_task_delegation` | CORTEX, NEXUS, DECODE | Low | 94 |
| `realtime_security_hardening` | DEFENSE, VISION, SYSTEM | Medium | 96 |
| `context_aware_memory_recall` | BRAIN, DREAM, DECODE | Low | 90 |
| `autonomous_documentation` | MODERNIZER, DECODE, SYSTEM | Low | 88 |
| `cross_domain_insight_synthesis` | DREAM, NEXUS, BRAIN | Low | 91 |
| `graceful_degradation_chain` | CORE, DEFENSE, VISION | Low | 95 |
| `intent_amplification` | DECODE, RIPPLE, INCLUSIVE | Low | 89 |
| `evolution_confidence_scoring` | MODERNIZER, BRAIN, CORTEX | Low | 93 |

---

## 10 Archived Edge Function Integrations

| Capability | Edge Function | Modules | Risk | Value |
|------------|---------------|---------|------|-------|
| `hypothesis_validation` | `pf-brain-hypothesis-test` | BRAIN, MODERNIZER | Low | 95 |
| `systems_causal_analysis` | `pf-brain-systems-reasoning` | BRAIN, CORTEX | Low | 92 |
| `autonomous_quality_review` | `pf-brain-self-critique` | MODERNIZER, CORTEX | Low | 90 |
| `pattern_fusion_synthesis` | `pf-brain-pattern-fusion` | DREAM, BRAIN | Low | 88 |
| `behavioral_drift_detection` | `pf-defense-anomaly-detection` | DEFENSE, VISION | Medium | 93 |
| `resilience_orchestration` | `pf-resilience-monitor` | CORE, SYSTEM | Medium | 96 |
| `temporal_memory_scoring` | `pf-brain-temporal-score` | BRAIN, DECODE | Low | 85 |
| `ethical_guardrails` | `pf-brain-ethical-boundary` | CORTEX, DECODE | Low | 97 |
| `continuous_improvement_engine` | `pf-cascade-improvement-engine` | MODERNIZER, DREAM | Medium | 91 |
| `active_learning_triggers` | `pf-brain-curiosity-reflect` | BRAIN, DREAM | Low | 84 |

---

## 56 NEW High-Value Capabilities (v7.6.0)

### By Module

| Module | Capabilities Added |
|--------|-------------------|
| CORE | `priority_queue_optimizer`, `lifecycle_state_predictor`, `distributed_lock_coordinator`, `fault_boundary_orchestrator` |
| RIPPLE | `event_correlation_engine`, `message_deduplication_guard`, `broadcast_throttle_manager`, `subscription_health_monitor` |
| ACCESS | `quota_burst_predictor`, `api_key_rotation_scheduler`, `usage_anomaly_detector`, `developer_onboarding_optimizer` |
| BRAIN | `knowledge_graph_navigator`, `memory_consolidation_engine`, `semantic_similarity_ranker`, `cognitive_load_balancer` |
| DECODE | `multi_intent_resolver`, `context_window_optimizer`, `personality_adaptation_engine`, `ambiguity_resolution_chain` |
| NEXUS | `provider_health_router`, `cost_quality_optimizer`, `fallback_chain_orchestrator`, `latency_prediction_engine` |
| DEFENSE | `threat_pattern_correlator`, `attack_surface_mapper`, `incident_response_automator`, `compliance_drift_detector` |
| VISION | `metric_anomaly_forecaster`, `dashboard_insight_generator`, `health_trend_analyzer`, `capacity_planning_advisor` |
| DREAM | `latent_pattern_extractor`, `creative_synthesis_engine`, `nocturnal_optimization_runner`, `idea_incubation_scheduler` |
| INTEGRATION | `adapter_compatibility_checker`, `data_transformation_pipeline`, `connection_pool_optimizer`, `sync_conflict_resolver` |
| SYSTEM | `backup_integrity_validator`, `resource_cleanup_scheduler`, `config_drift_detector`, `audit_compliance_reporter` |
| MODERNIZER | `proposal_impact_analyzer`, `migration_risk_scorer`, `deprecation_path_finder`, `feature_flag_governor` |
| INCLUSIVE | `accessibility_regression_guard`, `adaptive_interface_optimizer`, `wcag_auto_remediation_engine`, `inclusive_testing_orchestrator` |
| CORTEX | `multi_agent_coordinator`, `task_decomposition_engine`, `goal_alignment_validator`, `execution_priority_balancer` |

---

## Terminal Commands

| Command | Description | Flags |
|---------|-------------|-------|
| `system.scan_archived` | Scan archived edge functions only | `--dry-run` (default), `--confirm`, `--prune-merged`, `--verbose` |
| `system.scan_adapt` | Scan edge functions for overlap and auto-adapt | `--dry-run`, `--confirm`, `--prune-unused`, `--verbose` |
| `system.capabilities` | List all registered capabilities | `--active`, `--deprecated`, `--all` |
| `system.capability <id>` | Get capability details | — |

---

## Dashboard: Capabilities Tab

Navigate to `/os` → **Evolve** → **Capabilities** to access the toggle panel.

### Features:
- **Stats Overview**: Total (76), enabled, disabled, average value score
- **Search & Filter**: By name, description, modules, risk level
- **Toggle Controls**: Enable/disable individual capabilities
- **Bulk Actions**: Enable All, Disable All, Scan
- **Persistence**: State stored in localStorage (key: `capability-state-v7`)

---

## Usage

### React Hook

```typescript
import { useCapabilities } from '@/hooks/useCapabilities';

function MyComponent() {
  const { capabilities, scanAndAdapt, invoke } = useCapabilities();
  
  // Scan archived functions
  await scanAndAdapt({ dryRun: true });
  
  // Invoke a capability
  const result = await invoke('knowledge_graph_navigator', { query: 'connections' }, 'DECODE');
}
```

### Direct Import

```typescript
import { capabilityEngine } from '@/lib/substrate/capabilities';

// List all capabilities
const all = capabilityEngine.list();

// Execute capability
const result = await capabilityEngine.execute('multi_agent_coordinator', {
  agents: ['research', 'writer'],
  task: 'Generate report'
});
```

---

promptfluid® v7.6.0 — SYNERGY+ Epoch Capability System
