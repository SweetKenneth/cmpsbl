# 03 — Real Architecture: Boot to Export

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## Overview

This document describes the CMPSBL substrate as it actually operates — no cover story, no omissions. This is the ground truth.

---

## 1. The 40-Primitive Matrix

The substrate is built on exactly **40 primitives** organized into 4 categories:

| Category | Count | Primitives | Role |
|----------|-------|-----------|------|
| **Organs** | 12 | CORE, SYSTEM, BRAIN, MEMORY, AUDIT, IDENTITY, ACCESS, RELAY, NERVE, RIPPLE, NEXUS, ECONOMY | Internal infrastructure — observable but not directly interactive |
| **Layers** | 12 | DEFENSE, IMMUNITY, INTENT, GOVERNANCE, CONSCIENCE, TREATY, SOVEREIGN, ORACLE, COMPASS, ECHO, REFLEX, ATLAS | Ambient overlays — cross-cutting concerns that permeate all operations |
| **Engines** | 8 | DREAM, CORTEX, FORGE, LINGUA, HARVEST, EVOLUTION, SHADOW, PHANTOM | Processing powerhouses — handle specific computational workloads |
| **Agents** | 8 | DECODE, ENCODE, VISION, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION, ENGINEER | Autonomous actors — perform work and produce artifacts |

**Weighted health**: Each primitive has a weight. System health = Σ(weight × node_health). Healthy threshold: ≥ 80.

---

## 2. Boot Sequence (Real)

```
Phase 1: Kernel
  CORE initializes → validates matrix integrity via FNV-1a hash
  SYSTEM loads → environment, configuration, lifecycle hooks

Phase 2: CCR (Cognition)
  BRAIN boots → reasoning engine, context management
  MEMORY boots → 4-tier state (Hot/Warm/Cold/Glacier)
  DREAM boots → synthesis engine (algorithmic, NO AI)

Phase 3: OCG (Compliance Grid)
  RIPPLE → event propagation
  ACCESS → authentication, authorization
  IDENTITY → entity resolution
  RELAY → message routing
  AUDIT → tamper-evident logging
  NERVE → signaling, alerting

Phase 4: Execution Layer
  DECODE → ENCODE → VISION → CORTEX → NEXUS → ECONOMY →
  SANDBOX → INCLUSIVE → MEDIC → INTEGRATION

Phase 5: Expansion
  ESZ (SOVEREIGN, ORACLE, CONSCIENCE, TREATY)
  EPZ (COMPASS, ECHO, REFLEX)
  EMZ (FORGE, LINGUA, HARVEST)
  CSZ (EVOLUTION, SHADOW, PHANTOM)

Phase 6: Ambient
  IMMUNITY + INTENT permeate all layers
  ATLAS + ENGINEER observe and maintain
  GOVERNANCE supervises all mutations
  DEFENSE encloses the entire system
```

**CORE failure = full halt.** Everything else degrades gracefully via circuit breakers.

---

## 3. Request Flow (Real 12-Stage Pipeline)

This is the actual execution path. The "5-layer parallel processing" described in the Convex Core™ docs is a simplified public model.

```
Stage 1:  DEFENSE threat assessment (input sanitization, rate limiting)
Stage 2:  INTENT routing (determine which primitives are needed)
Stage 3:  GOVERNANCE legitimacy check (is this action permitted?)
Stage 4:  IDENTITY resolution (who is making this request?)
Stage 5:  ACCESS authorization (do they have permission?)
Stage 6:  NEXUS provider selection (which AI provider, if needed)
Stage 7:  Execution dispatch (DECODE, ENCODE, CORTEX, etc.)
Stage 8:  BRAIN reasoning context (if cognitive processing needed)
Stage 9:  MEMORY state read/write (persistent state management)
Stage 10: AUDIT logging (tamper-evident receipt generation)
Stage 11: RIPPLE event propagation (notify dependent systems)
Stage 12: DEFENSE response filtering (output sanitization)
```

**Why 12 stages matters for IP**: The order and interaction between stages is the trade secret. Knowing the primitive names is not enough — you must know the sequencing, the data handoffs between stages, and the conditional branching logic.

---

## 4. Memory Architecture (4-Tier)

| Tier | Purpose | Retention | Storage |
|------|---------|-----------|---------|
| **Hot** | Active session state, current context | Session lifetime | In-memory |
| **Warm** | Recent discoveries, active chains | 30 days | Database (fast query) |
| **Cold** | Historical patterns, archived chains | 1 year | Database (compressed) |
| **Glacier** | Full audit trail, compliance records | Indefinite | Cold storage |

MEMORY is the **sole owner of state**. No other primitive may maintain persistent storage independently.

---

## 5. Health Monitoring

Every primitive reports health via a weighted formula:

```
primitive_health = (
  query_latency_score × 0.25 +
  data_presence_score × 0.15 +
  recent_activity_score × 0.20 +
  module_diagnostic_score × 0.40
)

system_health = Σ(primitive_weight × primitive_health)
```

Health is deterministic, not estimated. Circuit breakers open at health < 40 for any individual primitive.

---

## 6. Circuit Breaker Architecture

Every primitive has an independent circuit breaker with three states:

| State | Meaning | Behavior |
|-------|---------|----------|
| **Closed** | Healthy | Normal operation |
| **Open** | Failed | All requests to this primitive return fallback |
| **Half-Open** | Testing | Limited traffic to test recovery |

Breaker state persists across system restarts. Zone-level isolation means an entire expansion category (ESZ, EPZ, EMZ, CSZ) can fail without affecting core operations.

---

## 7. Governance

Every mutation requires GOVERNANCE approval:

```
Request → GOVERNANCE.check(action, actor, target)
  → Mode check (ACTIVE / OBSERVE / LOCKDOWN / EVOLVE)
  → Capability check (does actor have this capability?)
  → Rate check (within rate limits?)
  → Consent check (user consent required?)
  → Audit check (generate tamper-evident receipt)
  → Signal check (notify mesh communications)
```

**Modes:**
- **ACTIVE** — Normal operation, all mutations permitted within rules
- **OBSERVE** — Read-only, mutations logged but not executed
- **LOCKDOWN** — Emergency mode, only governor can mutate
- **EVOLVE** — SEBA pipeline active, system self-modifying under guard

---

## 8. SEBA Evolution Pipeline

The 7-gate promotion pipeline for system self-improvement:

```
Gate 1: Lint     → Syntax and style validation
Gate 2: Test     → Automated test suite passes
Gate 3: Security → No new vulnerabilities introduced
Gate 4: Blast    → Change scope within acceptable radius
Gate 5: Evidence → Statistical evidence of improvement
Gate 6: Govern   → GOVERNANCE approval
Gate 7: Prod     → Production deployment with shadow verification
```

Hard-locked to GPT-4o-mini ($0.05/run). ENCODE writes patches. Human audit required for semantic review.

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
