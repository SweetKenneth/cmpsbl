# 02 — Architecture & Primitives

**Classification:** INTERNAL — Team Members Only

---

## 1. The 40-Primitive Topology

CMPSBL is built from exactly **40 primitives** organized into a symmetric **12·12·8·8** matrix across 4 categories. This topology is an **architectural invariant** — primitives may evolve internally but are never renamed, merged, or deleted.

### Organs (12) — The Body
The core identity, memory, routing, and health systems.

| Primitive | Role |
|-----------|------|
| CORE | Central coordination and boot sequence |
| SYSTEM | OS-level lifecycle and health monitoring |
| BRAIN | Reasoning, context management, cognitive processing |
| MEMORY | 4-tier persistent memory (working/episodic/semantic/archival) |
| NERVE | Signal routing and inter-primitive communication |
| NEXUS | Multi-provider AI routing and failover |
| IDENTITY | User/entity identity management |
| SOVEREIGN | Self-governance and autonomy boundaries |
| ATLAS | Dashboard hub, observability, and system map |
| MEDIC | Self-healing, diagnostics, and recovery |
| RELAY | External system communication and webhooks |
| CONSCIENCE | Ethical evaluation and alignment checking |

### Layers (12) — The Rules
Security, governance, evolution, and integration boundaries.

| Primitive | Role |
|-----------|------|
| DEFENSE | Outer security boundary, threat detection |
| IMMUNITY | Behavioral fingerprinting, anomaly detection |
| GOVERNANCE | Policy enforcement, approval workflows |
| TREATY | Inter-system agreements and compliance |
| EVOLUTION | Self-improvement through SEBA pipeline |
| REFLEX | Automatic responses to known patterns |
| COMPASS | Strategic direction and priority management |
| INTEGRATION | External service adapters and connectors |
| INTENT | Intent routing and execution coordination |
| ACCESS | Authentication, authorization, API key management |
| VISION | Future-state modeling and prediction |
| SHADOW | Observability, shadow testing, and monitoring |

### Engines (8) — The Workers
Discovery, synthesis, translation, and creative processes.

| Primitive | Role |
|-----------|------|
| DREAM | Pattern synthesis, memory consolidation, insight generation |
| HARVEST | Data collection, web research, information gathering |
| FORGE | Code generation, artifact construction |
| LINGUA | Natural language processing, translation |
| ECHO | Replay, simulation, scenario modeling |
| PHANTOM | Stealth operations, background processing |
| SANDBOX | Isolated execution environments |
| RIPPLE | Cascade effect analysis, impact prediction |

### Agents (8) — The Specialists
Encoding, decoding, auditing, and economic operations.

| Primitive | Role |
|-----------|------|
| ENCODE | Structured data encoding, code analysis |
| DECODE | Data extraction, parsing, interpretation |
| AUDIT | Immutable logging, chain-of-custody, forensics |
| ECONOMY | Cost tracking, resource economics, billing |
| INCLUSIVE | Accessibility, i18n, universal design |
| CORTEX | Multi-agent orchestration and task coordination |
| ORACLE | Prediction, forecasting, advisory |
| ENGINEER | Infrastructure management, DevOps automation |

---

## 2. Execution Model

Every action in CMPSBL follows this flow:

```
User Action / System Trigger
        ↓
  broadcastIntent()          ← All execution starts here
        ↓
  INTENT Router              ← Determines which resolvers to invoke
        ↓
  Resolver Execution          ← node.resolver_name format
        ↓
  Response Aggregation        ← Results collected
        ↓
  Mesh Communication Events   ← Telemetry emitted (non-blocking)
        ↓
  Dashboards / Memory         ← Observable in ATLAS
```

### Key Rules
- **All execution routes through `broadcastIntent()`** — no exceptions
- **Primitives never call each other directly** — only through resolvers via the intent mesh
- **Resolver naming**: always `primitive.resolver_name` (e.g., `brain.reasoning_context`, `defense.threat_score`)
- **Telemetry is always non-blocking** — `logReceipt(...).catch(() => {})` pattern
- **Personality dialogue is presentation-only** — never affects logic

---

## 3. Memory Architecture

4-tier persistent memory system:

| Tier | Purpose | Retention |
|------|---------|-----------|
| **Working** | Current session context | Session-scoped |
| **Episodic** | Specific interaction memories | Days–weeks |
| **Semantic** | Extracted knowledge and patterns | Months–years |
| **Archival** | Compressed long-term storage | Permanent |

The **Continuous Learning Machine (CLM)** promotes insights up through tiers as confidence increases. The **DREAM Engine** synthesizes patterns during consolidation cycles.

---

## 4. Governance Model

Three governance modes:

| Mode | Description |
|------|-------------|
| **Autonomous** | System decides within scoped boundaries |
| **Supervised** | System proposes, governor approves |
| **Manual** | Governor directs all actions |

Every mutating action passes through GOVERNANCE regardless of mode. The mode determines who has final authority, not whether governance runs.

---

## 5. Evolution Pipeline (SEBA)

Self-improvement follows a 7-gate validation pipeline:

```
Candidate → Shadow Run → Behavioral Diff → TSAC Truth Check →
Confidence Gate → Governance Approval → Staged Promotion → Production
```

**TSAC** (Truth & Semantic Alignment Check) is the arbitration layer that ensures new behavior doesn't contradict established knowledge. No evolution candidate reaches production without passing all 7 gates.

---

## 6. Terminology — Use These Exact Terms

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| Primitive | Node, Module, Component |
| Category | Sector, Group, Class |
| Memory Chain | Pipeline, Workflow |
| Organ / Layer / Engine / Agent | Type, Kind |
| DREAM Engine | DREAM Node, DREAM Module |

Always suffix bare names with their category in user-facing content: "DREAM Engine", "DEFENSE Layer", "AUDIT Agent", "MEMORY Organ".

---

© 2025–2026 CMPSBL®. Internal Use Only.
