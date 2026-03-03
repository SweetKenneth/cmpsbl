# Master Architecture Specification

## 1. Purpose

This document defines the complete architectural specification for the CMPSBL substrate. It serves as the canonical reference for all structural decisions, component responsibilities, and execution boundaries.

## 2. System Thesis

The CMPSBL substrate is a field-based cognitive kernel that operates as a self-governing AI orchestration layer. It organizes **37 modules** across an **11-sector** Spine / Grid / Zone / Field / Plane / Shell topology, providing weighted health monitoring, circuit-breaker isolation, and deterministic governance. The system is designed for autonomous operation under human oversight, with every action subject to legitimacy checks, audit logging, and rollback capability.

The substrate is not an application — it is infrastructure. It provides the execution surface on which cognitive agents, memory systems, and compliance grids operate.

## 3. Architectural Principles

- **Dependency-ordered boot**: Modules initialize in strict topological order.
- **Weighted integrity**: System health is a deterministic weighted sum across all 37 nodes (Σ = 1.000).
- **Circuit-breaker isolation**: Every module has independent failure tracking; open breakers force health to 0.
- **Field permeation**: Fields (EVOLUTION, IMMUNITY, INTENT) cross-cut all layers rather than stacking.
- **GOVERNANCE supervision**: Every mutating action requires legitimacy approval.
- **DEFENSE terminal enforcement**: The outermost boundary is non-negotiable.
- **NEXUS routing authority**: All external requests route through NEXUS.
- **Immutable audit trail**: AUDIT provides tamper-evident logging for all security-relevant events.
- **BYOK sovereignty**: Operators own their keys, data, and infrastructure.
- **Zone shielding**: Expansion modules are grouped into shielded zones (ESZ, EPZ, EMZ) with independent circuit breakers.

## 4. High-Level Topology Diagram

```mermaid
graph TD
    subgraph Spine
        CORE[CORE - Kernel Boot Authority]
        SYSTEM_NODE[SYSTEM - Lifecycle Management]
        subgraph CCR[CCR - Cognitive Core Reality]
            BRAIN[BRAIN]
            MEMORY_NODE[MEMORY]
            DREAM[DREAM]
        end
    end

    subgraph OCG[OCG - Operational Compliance Grid]
        RIPPLE[RIPPLE]
        ACCESS[ACCESS]
        IDENTITY[IDENTITY]
        RELAY[RELAY]
        AUDIT_NODE[AUDIT]
    end

    subgraph EXL[Execution Layer - 11 Nodes]
        DECODE[DECODE]
        ENCODE[ENCODE]
        VISION[VISION]
        CORTEX[CORTEX]
        NEXUS_NODE[NEXUS]
        ECONOMY[ECONOMY]
        SANDBOX[SANDBOX]
        INCLUSIVE[INCLUSIVE]
        MEDIC[MEDIC]
        NERVE_NODE[NERVE]
        INTEGRATION[INTEGRATION]
    end

    subgraph ESZ[ESZ - Expansion Sovereignty Zone]
        SOVEREIGN[SOVEREIGN]
        ORACLE[ORACLE]
        CONSCIENCE[CONSCIENCE]
        TREATY[TREATY]
    end

    subgraph EPZ[EPZ - Expansion Perception Zone]
        COMPASS[COMPASS]
        ECHO[ECHO]
        REFLEX[REFLEX]
    end

    subgraph EMZ[EMZ - Expansion Manufacturing Zone]
        FORGE[FORGE]
        LINGUA[LINGUA]
        PHANTOM[PHANTOM]
        HARVEST[HARVEST]
    end

    subgraph Fields
        EVOLUTION[EVOLUTION]
        IMMUNITY[IMMUNITY]
        INTENT[INTENT]
    end

    GOVERNANCE[GOVERNANCE - Supervisory Plane]
    DEFENSE[DEFENSE - Shell]

    CORE --> SYSTEM_NODE
    SYSTEM_NODE --> CCR
    CCR --> OCG
    OCG --> EXL
    EXL --> ESZ
    EXL --> EPZ
    EXL --> EMZ
    EXL --> INTEGRATION
    Fields -.- Spine
    Fields -.- OCG
    Fields -.- EXL
    Fields -.- ESZ
    Fields -.- EPZ
    Fields -.- EMZ
    GOVERNANCE -.- Spine
    GOVERNANCE -.- OCG
    GOVERNANCE -.- EXL
    DEFENSE --- GOVERNANCE
```

## 5. Sector Definitions

| Sector | Nodes | Weight | Responsibility Boundary |
|--------|-------|--------|------------------------|
| Spine: CORE | CORE | 0.120 | Kernel boot, matrix ownership, integrity calculation |
| Spine: SYSTEM | SYSTEM | 0.040 | Lifecycle, configuration, environment management |
| Spine: CCR | BRAIN, MEMORY, DREAM | 0.120 | Reasoning, persistent state, synthesis |
| Grid: OCG | RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT | 0.150 | Boundary enforcement, compliance, event routing |
| Execution | 11 modules | 0.250 | Public-facing cognitive capabilities |
| ESZ | SOVEREIGN, ORACLE, CONSCIENCE, TREATY | 0.080 | Governance expansion, compliance, ethics |
| EPZ | COMPASS, ECHO, REFLEX | 0.060 | Perception, simulation, edge computing |
| EMZ | FORGE, LINGUA, PHANTOM, HARVEST | 0.060 | Manufacturing, translation, privacy, data |
| Fields | EVOLUTION, IMMUNITY, INTENT | 0.060 | Cross-cutting transformation fabric |
| Plane | GOVERNANCE | 0.030 | Supervisory legitimacy checks |
| Shell | DEFENSE | 0.030 | Terminal containment boundary |

**Total: 37 Matrix Nodes across 11 Sectors, Σ(weight) = 1.000**

## 6. Component Registry

| Component | Sector | Responsibility | Dependencies |
|-----------|--------|---------------|-------------|
| CORE | Spine | Boot sequencing, integrity scoring | None (root) |
| SYSTEM | Spine | Configuration, lifecycle hooks | CORE |
| BRAIN | CCR | Reasoning, pattern recognition | SYSTEM |
| MEMORY | CCR | State persistence, retrieval | SYSTEM |
| DREAM | CCR | Heuristic generation, synthesis | BRAIN, MEMORY |
| RIPPLE | OCG | Event propagation, cascade detection | CORE |
| ACCESS | OCG | Auth, billing, API key management | CORE |
| IDENTITY | OCG | Entity resolution, session management | CORE |
| RELAY | OCG | Cross-module messaging, webhooks | CORE |
| AUDIT | OCG | Immutable logging, tamper detection | CORE |
| DECODE | Execution | Natural language understanding, intent parsing | CORE |
| ENCODE | Execution | Code generation, surgical patching | CORE, DECODE |
| VISION | Execution | Telemetry, observability, anomaly detection | CORE |
| CORTEX | Execution | Pipeline composition, cognitive orchestration | CORE |
| NEXUS | Execution | AI provider routing, fleet intelligence | CORE |
| ECONOMY | Execution | Cost tracking, budget governance | CORE |
| SANDBOX | Execution | Isolated execution, speculative runs | CORE |
| INCLUSIVE | Execution | WCAG compliance, accessibility scanning | CORE |
| MEDIC | Execution | Autonomous diagnostics, predictive failure | CORE, VISION |
| NERVE | Execution | Inter-node signaling, consensus repair | CORE, RIPPLE |
| INTEGRATION | Execution | External connectivity, adapters (boots last) | CORE |
| SOVEREIGN | ESZ | Data sovereignty, jurisdictional compliance | CORE, DEFENSE, ACCESS |
| ORACLE | ESZ | Predictive modeling, Bayesian inference | CORE, BRAIN, VISION |
| CONSCIENCE | ESZ | Ethical assessment, bias detection | CORE, DEFENSE |
| TREATY | ESZ | Contract negotiation, SLA enforcement | CORE, ACCESS |
| COMPASS | EPZ | Geospatial analysis, navigation intelligence | CORE, VISION, BRAIN |
| ECHO | EPZ | Digital twin simulation, scenario replay | CORE, MEMORY |
| REFLEX | EPZ | Edge computing orchestration, low-latency loops | CORE, NEXUS, VISION |
| FORGE | EMZ | Artifact synthesis, template generation | CORE, ENCODE |
| LINGUA | EMZ | Translation, localization, multi-language | CORE, DECODE, NEXUS |
| PHANTOM | EMZ | Privacy protection, PII masking, anonymization | CORE, DEFENSE, IDENTITY |
| HARVEST | EMZ | Data acquisition, ETL pipelines | CORE, MEMORY, ECONOMY |
| EVOLUTION | Field | Version management, shadow runs, canary deployment | Permeates all |
| IMMUNITY | Field | Threat adaptation, cascade breaking, anomaly signatures | Permeates all |
| INTENT | Field | Purpose alignment, goal decomposition | Permeates all |
| GOVERNANCE | Plane | Legitimacy supervision, veto authority | Supervises all |
| DEFENSE | Shell | Boundary enforcement, threat response | Encloses all |

## 7. Zone Shielding Architecture

Expansion modules are organized into **shielded zones** — each zone has its own circuit breaker boundary and can be independently degraded or isolated without affecting core substrate operations.

### ESZ — Expansion Sovereignty Zone
Governs compliance, ethics, and contractual obligations. Contains modules that enforce regulatory and ethical boundaries. If ESZ degrades, core substrate continues operating under baseline governance rules.

### EPZ — Expansion Perception Zone
Handles predictive analysis, simulation, and edge-tier computation. These modules extend the substrate's awareness of future states and external environments. EPZ degradation reduces foresight but preserves core operations.

### EMZ — Expansion Manufacturing Zone
Manages artifact production, translation, privacy, and data ingestion. These modules extend the substrate's ability to manufacture outputs and process inputs. EMZ degradation limits production capacity but preserves cognitive function.

## 8. Execution Lifecycle

### Boot Sequence
```
CORE → SYSTEM → CCR (BRAIN, MEMORY, DREAM) → OCG (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT)
  → Execution (DECODE..NERVE) → INTEGRATION (boots last)
  → ESZ (SOVEREIGN, ORACLE, CONSCIENCE, TREATY)
  → EPZ (COMPASS, ECHO, REFLEX)
  → EMZ (FORGE, LINGUA, PHANTOM, HARVEST)
  → Fields (EVOLUTION, IMMUNITY, INTENT) permeate
  → Plane (GOVERNANCE) supervises
  → Shell (DEFENSE) encloses
```

### Request Flow
1. External request arrives at DEFENSE (Shell).
2. DEFENSE performs threat assessment (IP reputation, behavioral analysis, payload inspection).
3. Approved requests route to NEXUS for provider/model selection.
4. NEXUS delegates to appropriate Execution module (DECODE, ENCODE, CORTEX, etc.).
5. Execution module processes request, consulting CCR (BRAIN, MEMORY, DREAM) as needed.
6. OCG modules enforce compliance boundaries throughout execution.
7. Expansion zones (ESZ, EPZ, EMZ) provide specialized capabilities when invoked.
8. Response returns through NEXUS → DEFENSE → Client.

### State Transitions
- **Boot** → CORE initializes → layers cascade → all 37 nodes online.
- **Steady State** → Request processing, health monitoring, periodic persistence.
- **Degraded** → Circuit breaker open on one or more nodes; system continues with reduced capability.
- **Zone Isolated** → Entire expansion zone (ESZ/EPZ/EMZ) degraded; core operations continue.
- **Recovery** → Breaker reset, state reconciliation, audit verification.

## 9. Isolation Boundaries

- Each of the 37 nodes operates within its own circuit-breaker boundary.
- Expansion zones (ESZ, EPZ, EMZ) provide zone-level isolation — an entire zone can degrade gracefully.
- Module failure does not propagate unless RIPPLE detects a cascade chain.
- SANDBOX provides execution isolation for untrusted code.
- DEFENSE enforces the outermost trust boundary.
- Row-Level Security enforces per-user data isolation at the database layer.

## 10. Failure Domains

| Domain | Scope | Impact | Recovery |
|--------|-------|--------|----------|
| Module Failure | Single node | Degraded capability | Circuit breaker reset |
| Zone Failure | ESZ/EPZ/EMZ (3-4 nodes) | Zone capabilities offline | Zone-level recovery |
| Cascade Chain | Multiple nodes | Significant degradation | Origin arrest, staged recovery |
| Persistence Failure | Storage layer | Runtime continues, durability lost | WAL replay, snapshot restore |
| Governance Conflict | Decision layer | Action blocked | Evaluation, manual override |
| CORE Failure | System-critical | Full system halt | Restart from boot sequence |

## 11. Control Planes

| Control Plane | Owner | Scope |
|--------------|-------|-------|
| Boot Control | CORE | Initialization sequence |
| Lifecycle Control | SYSTEM | Configuration, environment |
| Routing Control | NEXUS | API dispatch, provider selection |
| Compliance Control | OCG | Boundary enforcement |
| Governance Control | GOVERNANCE | Action legitimacy |
| Security Control | DEFENSE | Threat response |
| Evolution Control | EVOLUTION | Version management |
| Sovereignty Control | ESZ | Jurisdictional compliance |
| Perception Control | EPZ | Predictive awareness |
| Manufacturing Control | EMZ | Artifact production |

## 12. Dependency Graph

```
CORE (root)
├── SYSTEM
│   ├── BRAIN (CCR)
│   ├── MEMORY (CCR)
│   └── DREAM (CCR)
├── RIPPLE (OCG)
├── ACCESS (OCG)
├── IDENTITY (OCG)
├── RELAY (OCG)
├── AUDIT (OCG)
├── DECODE (Execution)
├── ENCODE (Execution) → DECODE
├── VISION (Execution)
├── CORTEX (Execution)
├── NEXUS (Execution)
├── ECONOMY (Execution)
├── SANDBOX (Execution)
├── INCLUSIVE (Execution)
├── MEDIC (Execution) → VISION
├── NERVE (Execution) → RIPPLE
├── INTEGRATION (Execution, boots last)
├── SOVEREIGN (ESZ) → DEFENSE, ACCESS
├── ORACLE (ESZ) → BRAIN, VISION
├── CONSCIENCE (ESZ) → DEFENSE
├── TREATY (ESZ) → ACCESS
├── COMPASS (EPZ) → VISION, BRAIN
├── ECHO (EPZ) → MEMORY
├── REFLEX (EPZ) → NEXUS, VISION
├── FORGE (EMZ) → ENCODE
├── LINGUA (EMZ) → DECODE, NEXUS
├── PHANTOM (EMZ) → DEFENSE, IDENTITY
└── HARVEST (EMZ) → MEMORY, ECONOMY
Fields (EVOLUTION, IMMUNITY, INTENT) — permeate all sectors
GOVERNANCE — supervises all sectors
DEFENSE — encloses all sectors
```

## 13. Versioning Compatibility Model

- Major versions (epochs) may introduce breaking changes.
- Minor versions maintain backward compatibility within the epoch.
- Patch versions contain fixes only — no behavioral changes.
- All version transitions require EVOLUTION shadow runs before promotion.
- Deprecated capabilities remain functional for one full minor version after deprecation notice.

## 14. Non-Goals

- The substrate is not an application framework.
- The substrate does not provide a general-purpose database.
- The substrate does not manage end-user authentication directly (delegated to ACCESS).
- The substrate does not include AI model weights or training data.
- The substrate does not guarantee real-time latency below infrastructure limits.

## 15. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial canonical specification (24 nodes) |
| 2026-03-03 | System | Expanded to 37-node architecture with ESZ/EPZ/EMZ zone shielding |

## 16. Related Documents

- [Governance & Autonomy Doctrine](../02-governance/governance-autonomy-doctrine.md)
- [Security Architecture](../03-security/security-architecture.md)
- [Data & Memory Model](../04-data-memory/data-and-memory-model.md)
- [Evolution & Versioning Framework](../05-evolution-versioning/evolution-and-versioning-framework.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
