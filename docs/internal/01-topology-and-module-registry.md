# 01 — Topology & Module Registry

**Classification:** 🔒 INTERNAL

---

## 1. Purpose

This document defines the complete 26-node architecture of the CMPSBL Substrate, including every module's layer assignment, boot order, dependencies, and responsibility boundary.

## 2. System Topology

The substrate follows a multi-layered topology organized into six architectural zones:

### 2.1 Spine (Vertical Deterministic Flow)

The spine is the backbone execution path. Modules boot in strict order.

```
CORE → SYSTEM → CCR (BRAIN, MEMORY, DREAM) → Execution Modules → INTEGRATION
```

| Module | Role |
|--------|------|
| CORE | Kernel. Boots first. Substrate constants, registry, error boundaries. |
| SYSTEM | Lifecycle management, heartbeats, shutdown coordination. |
| BRAIN | Cognitive knowledge graph, embeddings, classifier models. |
| MEMORY | Persistent knowledge store with SM-2 tiering and WAL. |
| DREAM | Offline optimization cycles, hallucination guards, pattern caching. |

### 2.2 Operational Compliance Grid (OCG)

Five infrastructure modules that enforce operational boundaries:

| Module | Boot Order | Role |
|--------|-----------|------|
| RIPPLE | 4 | Event bus, pub/sub, dead-letter queue. |
| ACCESS | 5 | API keys, quotas, rate limiting, developer subscriptions. |
| IDENTITY | 6 | User/tenant identity resolution, session binding. |
| RELAY | 7 | Webhook delivery, content-hash deduplication. |
| AUDIT | 8 | Immutable compliance trail, tamper-evident logging. |

### 2.3 Execution Layer

Specialized processing modules:

| Module | Boot Order | Dependencies | Role |
|--------|-----------|--------------|------|
| NEXUS | 9 | CORE | AI provider routing, fleet intelligence, cost tracking. |
| DECODE | 10 | CORE, NEXUS | Conversational interpreter, terminal command parsing. |
| DREAM | 11 | CORE, NEXUS | Nocturne offline optimization. |
| ENCODE | 12 | CORE, NEXUS | Output formatting, response shaping. |
| DEFENSE | 13 | CORE, RIPPLE | Security shell, threat detection, honeypots. |
| VISION | 14 | CORE, RIPPLE | Anomaly detection, performance correlation, alerting. |
| ECONOMY | 15 | CORE, ACCESS | Cost tracking, ROI computation, billing integration. |
| SANDBOX | 16 | CORE | Isolated execution environments, code evaluation. |
| MEDIC | 17 | CORE, SYSTEM, VISION | Autonomous diagnostics, self-repair coordination, health scoring. |
| NERVE | 18 | CORE, RIPPLE, SYSTEM | Inter-node signaling, consensus repair, distributed heartbeat. |
| INTEGRATION | 19 | CORE, RIPPLE, ACCESS | External service connectors, webhook handlers. |
| INCLUSIVE | 22 | CORE, SYSTEM | Accessibility compliance, WCAG enforcement. |

### 2.4 Orchestration

| Module | Boot Order | Dependencies | Role |
|--------|-----------|--------------|------|
| SYSTEM | 20 | CORE, VISION | System-wide lifecycle, health aggregation. |
| MODERNIZER | 21 | CORE, SYSTEM, VISION | Legacy → routes to EVOLUTION field. |
| CORTEX | 23 | CORE, NEXUS, SYSTEM, VISION | Pipeline orchestration, capability composition. |
| ATLAS | 24 | CORE, SYSTEM | Capability gating, feature flag management. |

### 2.5 Fields (System-Wide Transformation Fabric)

Fields are not stacked layers — they **permeate** the entire spine:

| Field | Role |
|-------|------|
| EVOLUTION | Mutation proposals, shadow runs, promotion pipeline, versioning. |
| IMMUNITY | Self-healing, OCG capability gates, threat correlation. |
| INTENT | User intent classification, context routing, goal tracking. |

### 2.6 Overlay Plane & Shell

| Component | Role |
|-----------|------|
| GOVERNANCE (Plane) | Policy enforcement, veto authority, compliance audit, drift detection. Self-referential. |
| DEFENSE (Shell) | Terminal boundary enforcement. Outermost containment. |

## 3. Boot Order (Canonical)

```
Phase 1 — Kernel:        CORE (1)
Phase 2 — CCR:           MEMORY (2), BRAIN (3)
Phase 3 — OCG:           RIPPLE (4), ACCESS (5), IDENTITY (6), RELAY (7), AUDIT (8)
Phase 4 — Execution:     NEXUS (9), DECODE (10), DREAM (11), ENCODE (12),
                         DEFENSE (13), VISION (14), ECONOMY (15), SANDBOX (16),
                         MEDIC (17), NERVE (18), INTEGRATION (19),
                         SYSTEM (20), MODERNIZER (21),
                         INCLUSIVE (22), CORTEX (23), ATLAS (24)
```

Boot is dependency-ordered. A module cannot boot until all its dependencies report healthy. Boot gate checks verify health thresholds before cascading activation.

### Boot Gate Verdicts

| Verdict | Meaning |
|---------|---------|
| `pass` | All checks passed, module may boot. |
| `warn` | Non-critical issues detected, boot proceeds with monitoring. |
| `block` | Critical dependency failure, module blocked from booting. |

## 4. Dependency Graph

```mermaid
graph TD
  CORE --> MEMORY
  CORE --> BRAIN
  CORE --> RIPPLE
  CORE --> ACCESS
  CORE --> NEXUS
  CORE --> AUDIT
  CORE --> SANDBOX
  CORE --> MEDIC
  CORE --> NERVE
  ACCESS --> IDENTITY
  ACCESS --> ECONOMY
  RIPPLE --> RELAY
  RIPPLE --> DEFENSE
  RIPPLE --> VISION
  RIPPLE --> INTEGRATION
  RIPPLE --> NERVE
  ACCESS --> INTEGRATION
  NEXUS --> DECODE
  NEXUS --> DREAM
  NEXUS --> ENCODE
  CORE --> SYSTEM
  VISION --> SYSTEM
  VISION --> MEDIC
  SYSTEM --> MEDIC
  SYSTEM --> NERVE
  SYSTEM --> MODERNIZER
  SYSTEM --> INCLUSIVE
  SYSTEM --> ATLAS
  NEXUS --> CORTEX
  SYSTEM --> CORTEX
  VISION --> CORTEX
```

## 5. Module Layer Classification

| Layer | Modules | Count |
|-------|---------|-------|
| Kernel | CORE | 1 |
| Cognitive (CCR) | BRAIN, MEMORY, DREAM | 3 |
| Infrastructure (OCG) | RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT | 5 |
| Execution | NEXUS, DECODE, ENCODE, VISION, DEFENSE, ECONOMY, SANDBOX, INCLUSIVE, INTEGRATION, MEDIC, NERVE | 11 |
| Orchestration | SYSTEM, MODERNIZER, CORTEX, ATLAS | 4 |
| Fields | EVOLUTION, IMMUNITY, INTENT | 3 |
| Plane | GOVERNANCE | 1 |
| **Total** | | **26 nodes** |

Production module count validation target: **26 nodes**.

## 6. Architecture Invariants

1. Weighted matrix must sum to `1.000`.
2. CORE failure is system-critical — cascades to all dependents.
3. Execution remains isolated by circuit-breaker boundaries.
4. Field modules permeate all sectors rather than acting as stacked layers.
5. GOVERNANCE supervises action legitimacy, including its own operations.
6. DEFENSE is terminal boundary enforcement — the outermost shell.
7. NEXUS is the primary routing authority for all AI provider interactions.

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial internal library creation |

---

© 2025–2026 PromptFluid®. Confidential.
