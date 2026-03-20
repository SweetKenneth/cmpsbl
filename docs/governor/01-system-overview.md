# 01 — System Overview & Architecture

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. What CMPSBL Is

CMPSBL is a **field-based cognitive kernel** — a self-governing AI orchestration layer. It is not an application. It is infrastructure: the execution surface on which cognitive agents, memory systems, and compliance grids operate.

The substrate organizes **40 nodes** across a **12-sector** topology, providing weighted health monitoring, circuit-breaker isolation, and deterministic governance under human oversight.

---

## 2. The 40-Node Matrix

### Sector Map

| Sector | Nodes | Weight | What It Does |
|--------|-------|--------|-------------|
| **Spine: CORE** | CORE | 0.110 | Kernel boot, matrix integrity calculation |
| **Spine: SYSTEM** | SYSTEM | 0.035 | Lifecycle, configuration, environment |
| **Spine: CCR** | BRAIN, MEMORY, DREAM | 0.115 | Reasoning, persistent state, synthesis |
| **Grid: OCG** | RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE | 0.140 | Compliance, auth, event routing, signaling |
| **Execution** | DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION | 0.240 | Public-facing cognitive capabilities |
| **ESZ** | SOVEREIGN, ORACLE, CONSCIENCE, TREATY | 0.075 | Governance expansion, ethics, compliance |
| **EPZ** | COMPASS, ECHO, REFLEX | 0.055 | Perception, simulation, edge computing |
| **EMZ** | FORGE, LINGUA, HARVEST | 0.045 | Artifact production, translation, data |
| **CSZ** | EVOLUTION, SHADOW, PHANTOM | 0.045 | Self-improvement, shadow testing, stealth |
| **Fields** | IMMUNITY, INTENT | 0.040 | Cross-cutting transformation fabric |
| **Meta** | ATLAS, ENGINEER | 0.040 | Governance hub, maintenance intelligence |
| **Plane** | GOVERNANCE | 0.030 | Supervisory legitimacy checks |
| **Shell** | DEFENSE | 0.030 | Terminal containment boundary |

**Total: 40 nodes, 12 sectors, Σ(weight) = 1.000**

System health = weighted sum of all node health scores. Healthy range: **≥ 80**.

---

## 3. Boot Sequence

Modules initialize in strict dependency order:

```
CORE → SYSTEM → CCR (BRAIN, MEMORY, DREAM)
  → OCG (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE)
  → Execution (DECODE → INTEGRATION)
  → ESZ → EPZ → EMZ → CSZ
  → Fields (IMMUNITY, INTENT) permeate
  → Meta (ATLAS, ENGINEER) observe
  → GOVERNANCE supervises
  → DEFENSE encloses
```

**CORE failure = full system halt.** All other modules can degrade gracefully.

---

## 4. Request Flow

```
Client → DEFENSE (threat assessment)
  → NEXUS (provider/model selection)
  → Execution module (DECODE, ENCODE, CORTEX, etc.)
  → CCR (BRAIN, MEMORY, DREAM) as needed
  → OCG enforces compliance throughout
  → Response returns via NEXUS → DEFENSE → Client
```

---

## 5. Zone Shielding

Expansion zones have independent circuit breakers. If an entire zone fails, core operations continue:

| Zone | Impact If Down |
|------|---------------|
| ESZ (Sovereignty) | Baseline governance rules apply instead |
| EPZ (Perception) | Reduced foresight, core operations intact |
| EMZ (Manufacturing) | Limited artifact production, cognition intact |
| CSZ (Covert) | Evolution paused, production stable |

---

## 6. Key Architectural Principles

1. **Weighted integrity** — Health is deterministic, not estimated
2. **Circuit-breaker isolation** — Every module fails independently
3. **GOVERNANCE supervision** — Every mutation requires legitimacy approval
4. **DEFENSE terminal enforcement** — The outer boundary is absolute
5. **BYOK sovereignty** — Operators own their keys, data, and infrastructure
6. **Immutable audit trail** — AUDIT provides tamper-evident logging
7. **Disaster recovery** — One-click full backup captures entire system state

---

## 7. State Transitions

| State | Description |
|-------|-------------|
| **Boot** | CORE initializes → layers cascade → 40 nodes online |
| **Steady State** | Request processing, health monitoring, periodic persistence |
| **Degraded** | Circuit breaker open on one or more nodes; reduced capability |
| **Zone Isolated** | Entire expansion zone offline; core continues |
| **Recovery** | Breaker reset, state reconciliation, audit verification |

---

## 8. Control Planes

| Control Plane | Owner | Scope |
|--------------|-------|-------|
| Boot Control | CORE | Initialization sequence |
| Routing Control | NEXUS | API dispatch, provider selection |
| Compliance Control | OCG | Boundary enforcement |
| Governance Control | GOVERNANCE | Action legitimacy |
| Security Control | DEFENSE | Threat response |
| Evolution Control | EVOLUTION | Version management |
| Topology Control | ATLAS | Capability mapping |
| Maintenance Control | ENGINEER | Engine health, proposals |

---

© 2025–2026 PromptFluid®. Governor Eyes Only.
