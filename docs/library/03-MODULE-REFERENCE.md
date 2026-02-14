<div align="center">

# Module Reference

### All 21 Modules — Purpose, Capabilities, and Interfaces

<table>
<tr><td><strong>Document</strong></td><td>03 — Module Reference</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>

</div>

---

## Invocation Pattern

All modules are accessed through a single endpoint:

```
POST /functions/v1/pf-substrate

{
  "module": "<module-name>",
  "action": "<action-name>",
  "payload": { ... }
}
```

---

## Kernel Layer

### CORE

> *The foundation. Everything starts here.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | System configuration, constants, lifecycle management |
| **Boot Order** | 1 (first) |
| **Key Actions** | `init`, `health`, `config`, `lifecycle` |
| **Publishes** | `core.boot.complete`, `core.config.updated` |
| **Subscribes** | None (root module) |

CORE is the bootstrap module. It loads system configuration, initializes constants, and manages the lifecycle of all other modules. Every other module depends on CORE being online.

---

### RIPPLE

> *The nervous system. Every signal flows through here.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Event bus with typed payloads and schema validation |
| **Boot Order** | 2 |
| **Key Actions** | `publish`, `subscribe`, `replay`, `analytics` |
| **Publishes** | Meta-events: `ripple.event.rejected`, `ripple.circuit.opened` |
| **Subscribes** | All events (for logging and analytics) |

RIPPLE enforces a strict contract: every event payload must match its registered schema. Malformed events are rejected silently and reported to DEFENSE. This single design decision prevents the most common cause of distributed system failures — cascading bad data.

---

### ACCESS

> *The gatekeeper. Controls who uses the system and how much.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | API key management, rate limiting, billing, metering, quota enforcement |
| **Boot Order** | 3 |
| **Key Actions** | `validate_key`, `check_quota`, `record_usage`, `manage_subscription` |
| **Publishes** | `access.quota.exceeded`, `access.key.revoked` |
| **Subscribes** | `access.usage.recorded` |

ACCESS implements hierarchical RBAC with scoped API keys. Each key has granular permissions (which modules, which actions, what rate limits) and usage is metered per-call with cost tracking.

---

## Cognitive Layer

### BRAIN

> *The memory. The substrate remembers everything.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Persistent memory with confidence scoring, decay curves, reinforcement, knowledge graphs |
| **Boot Order** | 4 |
| **Key Actions** | `query`, `remember`, `reflect`, `reinforce`, `dream`, `learn`, `synthesize`, `session_reflection` |
| **Publishes** | `brain.memory.stored`, `brain.reflection.complete`, `brain.knowledge.synthesized` |
| **Subscribes** | `dream.insight.generated`, `cortex.evaluation.complete` |

BRAIN is the cognitive core. Every memory is stored with a confidence score (0.0–1.0) that increases with reinforcement and decays over time. The system doesn't just remember *what* — it tracks *how confident* it is in each memory and *how recently* it was validated.

**Memory Types:** Episodic (events), Semantic (facts), Procedural (how-to), Meta-cognitive (self-reflection)

---

### VISION

> *The observer. The system's ability to see itself.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Observability, metrics, monitoring, telemetry, SLA tracking |
| **Boot Order** | 5 |
| **Key Actions** | `metrics`, `alerts`, `sla_check`, `trend_analysis`, `resource_monitor` |
| **Publishes** | `vision.alert.triggered`, `vision.sla.breach`, `vision.anomaly.detected` |
| **Subscribes** | All module health events |

VISION provides real-time observability across all 21 modules. It tracks response times, error rates, resource utilization, and SLA compliance. When anomalies are detected, alerts propagate to SYSTEM for potential auto-healing.

---

### CORTEX

> *The orchestrator. Coordinates complex multi-module operations.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Agency management, proposal evaluation, multi-step pipeline execution |
| **Boot Order** | 6 |
| **Key Actions** | `evaluate`, `execute_pipeline`, `manage_agency`, `propose`, `coordinate` |
| **Publishes** | `cortex.pipeline.started`, `cortex.evaluation.complete`, `cortex.agency.task.assigned` |
| **Subscribes** | `evolution.proposed`, `brain.knowledge.synthesized` |

CORTEX is the conductor. When an operation requires multiple modules working in sequence or parallel, CORTEX manages the workflow — including dependency resolution, failure handling, and result aggregation.

---

## Operational Layer

### MODERNIZER

> *The evolution engine. The substrate improves itself.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Self-improvement with cryptographic stamps, validation, and rollback |
| **Boot Order** | 7 |
| **Key Actions** | `propose`, `validate`, `apply`, `rollback`, `stamp`, `export` |
| **Publishes** | `evolution.proposed`, `evolution.applied`, `evolution.rolled_back` |
| **Subscribes** | `cortex.evaluation.complete`, `system.health.critical` |

MODERNIZER is what makes the substrate *alive*. It proposes improvements (to prompts, routing logic, memory strategies, and more), validates them against regression tests, applies them with cryptographic stamps, and can roll back any change. Every evolution has a verifiable, immutable receipt.

---

### DECODE

> *The voice. How the system talks to humans.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Natural language processing, intent detection, multi-turn conversation, personality |
| **Boot Order** | 8 |
| **Key Actions** | `parse`, `generate`, `detect_intent`, `context_manage`, `personality` |
| **Publishes** | `decode.intent.classified`, `decode.response.generated` |
| **Subscribes** | `brain.memory.stored` (for context enrichment) |

DECODE transforms natural language into structured commands and structured results into natural language. It maintains multi-turn conversation state and can adopt different communication personalities.

---

### DEFENSE

> *The shield. Protects the system from threats.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Threat detection, bot filtering, behavioral analysis, IP reputation, incident response |
| **Boot Order** | 9 |
| **Key Actions** | `analyze_threat`, `block`, `report`, `behavioral_scan`, `incident_response` |
| **Publishes** | `defense.threat.detected`, `defense.ip.blocked`, `defense.incident.opened` |
| **Subscribes** | `access.request.received`, `ripple.event.rejected` |

DEFENSE implements defense-in-depth: every request passes through threat analysis, behavioral scoring, and rate limiting before reaching any module. Known bad actors are blocked at the edge.

---

### NEXUS

> *The router. Any model, any provider, one interface.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Multi-provider AI routing with failover, cost optimization, and load balancing |
| **Boot Order** | 10 |
| **Key Actions** | `route`, `balance_load`, `failover`, `select_model`, `estimate_cost` |
| **Publishes** | `nexus.request.routed`, `nexus.provider.failed`, `nexus.fallback.triggered` |
| **Subscribes** | `economy.budget.warning` |

NEXUS abstracts away AI providers entirely. Applications send requests to the substrate; NEXUS selects the optimal provider based on cost, latency, capability, and availability — with automatic failover if a provider fails.

**Supported Providers:** OpenAI, Anthropic, Google, Mistral, and extensible to any provider with an API.

---

### DREAM

> *The dreamer. Learns while idle.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Autonomous background learning, creative synthesis, pattern discovery |
| **Boot Order** | 11 |
| **Key Actions** | `dream_cycle`, `creative_synthesis`, `pattern_mine`, `insight_extract` |
| **Publishes** | `dream.insight.generated`, `dream.pattern.discovered`, `dream.cycle.complete` |
| **Subscribes** | `brain.memory.stored`, `system.idle.detected` |

DREAM runs during idle time. It reviews stored memories, identifies patterns, generates creative combinations, and produces insights that are fed back to BRAIN. It is the substrate's ability to *think while sleeping*.

---

## Administrative Layer

### INTEGRATION

> *The bridge. Connects to the outside world.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | External API adapters, enterprise connectors, webhook management, data sync |
| **Boot Order** | 12 |
| **Key Actions** | `connect`, `sync`, `transform`, `webhook_manage`, `adapter_register` |
| **Publishes** | `integration.sync.complete`, `integration.webhook.received` |
| **Subscribes** | `cortex.pipeline.started` |

---

### INCLUSIVE

> *The equalizer. Makes AI accessible to everyone.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Accessibility scanning (86 WCAG criteria), compliance automation, adaptive interfaces |
| **Boot Order** | 13 |
| **Key Actions** | `scan`, `fix`, `report`, `adaptive_render`, `compliance_check` |
| **Publishes** | `inclusive.scan.complete`, `inclusive.issue.fixed` |
| **Subscribes** | `integration.sync.complete` |

INCLUSIVE scans web content against 86 WCAG criteria and can automatically remediate common accessibility issues. It ensures that anything the substrate touches meets accessibility standards.

---

### SYSTEM

> *The doctor. Monitors health and heals the system.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Health monitoring, diagnostics, auto-healing, resource management |
| **Boot Order** | 14 (last of core systems) |
| **Key Actions** | `health_check`, `diagnose`, `heal`, `resource_report`, `dependency_graph` |
| **Publishes** | `system.health.critical`, `system.heal.triggered`, `system.heal.complete` |
| **Subscribes** | All `circuit.opened` events from any module |

SYSTEM is the last core module to boot because it monitors everything above it. When any module's health drops below critical thresholds, SYSTEM initiates automatic healing — opening circuit breakers, diagnosing failures, applying repairs, and validating recovery.

---

## Infrastructure Layer

### MEMORY

> *Vector storage and semantic recall.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Vector storage, RAG pipelines, semantic recall, embedding management |
| **Key Actions** | `embed`, `search`, `recall`, `index`, `consolidate` |

---

### RELAY

> *Outbound delivery and side effects.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Webhooks, outbound notifications, delivery pipelines |
| **Key Actions** | `deliver`, `webhook_fire`, `retry`, `queue` |

---

### AUDIT

> *Immutable compliance logging.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Chain-of-custody logging, decision ledger, compliance records |
| **Key Actions** | `log`, `query_ledger`, `export`, `chain_verify` |

---

### IDENTITY

> *Actor attribution and trust.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Distinguishes human, agent, and system actions with cryptographic fingerprints |
| **Key Actions** | `attribute`, `fingerprint`, `verify_actor`, `trust_score` |

---

### ECONOMY

> *Cost tracking and budget governance.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | FinOps — cost tracking, budget alerts, marketplace pricing |
| **Key Actions** | `track_cost`, `budget_check`, `price`, `settlement` |

---

### SANDBOX

> *Safe execution for speculative operations.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Isolated execution environments for testing evolutions and untrusted operations |
| **Key Actions** | `execute_safe`, `isolate`, `validate_result`, `teardown` |

---

## Orchestrator Layer

### ENCODE

> *Transform pipelines across all layers.*

| Aspect | Detail |
|--------|--------|
| **Purpose** | Takes structured input, orchestrates multi-module workflows, produces structured output |
| **Key Actions** | `transform`, `pipeline`, `compose`, `orchestrate` |

ENCODE sits above all other layers and coordinates complex multi-step transformations that span the entire substrate.

---

## What's Next

Continue to [`04-CAPABILITY-SYSTEM.md`](./04-CAPABILITY-SYSTEM.md) for the capability registration and composition model.

---

<div align="center">

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
