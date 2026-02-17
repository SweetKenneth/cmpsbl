<div align="center">

# Capability System

### 480+ Composable Capabilities

<table>
<tr><td><strong>Document</strong></td><td>04 — Capability System</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>

</div>

---

## What Is a Capability?

A **capability** is a registered, composable unit of functionality within the substrate. Unlike traditional API endpoints (which are static), capabilities are:

- **Registered** — each has a unique ID, description, risk level, and module assignment
- **Composable** — capabilities can be combined into synergy pipelines
- **Evolvable** — the system can propose new capabilities through the evolution engine
- **Tiered** — access is controlled by subscription tier (Free, Pro, Enterprise, CMPSBL-only)
- **Observable** — usage, performance, and value are tracked per-capability

---

## Capability Anatomy

Every capability has the following metadata:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (e.g., `cap-brain-memory-query`) |
| `name` | Human-readable name |
| `description` | What the capability does |
| `modules` | Which module(s) implement it |
| `risk` | Low, Medium, or High |
| `reversible` | Whether the operation can be undone |
| `tier` | Which subscription tiers have access |
| `category` | Functional category (memory, routing, security, etc.) |

---

## Capability Categories

| Category | Count | Examples |
|----------|-------|---------|
| **Memory & Learning** | ~52 | Memory query, reinforcement, knowledge graph topology, session reflection, memory playground |
| **AI Routing** | ~30 | Provider selection, failover, cost optimization, load balancing |
| **Security & Defense** | ~40 | Threat detection, bot filtering, behavioral analysis, incident response |
| **Evolution** | ~27 | Propose improvement, validate, apply, rollback, stamp, evolution receipts |
| **Orchestration** | ~36 | Pipeline execution, agency management, task assignment, agent mesh |
| **Observability** | ~30 | Health monitoring, SLA tracking, anomaly detection, alerting |
| **NLP & Communication** | ~25 | Intent classification, response generation, personality |
| **Infrastructure** | ~45 | Vector search, webhook delivery, audit logging, cost tracking |
| **Accessibility** | ~20 | WCAG scanning, automated remediation, compliance reporting |
| **Integration** | ~30 | API adapters, data sync, transform pipelines |
| **Governance** | ~35 | Autonomy tiers, circuit breakers, bounded authority |
| **Autonomous Learning** | ~22 | Dream cycles, creative synthesis, pattern discovery, dream feeder API |
| **Cognitive** | ~27 | Self-reflection, meta-learning, cognitive bootstrapping, brain orchestrator |

---

## Composition Model

Capabilities compose through **synergy pipelines** — ordered sequences of capabilities that span multiple modules. A synergy pipeline defines:

1. **Entry capability** — where the pipeline starts
2. **Intermediate capabilities** — processing steps
3. **Exit capability** — where results are produced
4. **Error handling** — what happens if any step fails
5. **Rollback** — how to undo partial execution

Example pipeline: *Memory-Enhanced Response*

```
BRAIN.query → NEXUS.route → DECODE.generate → BRAIN.remember
```

This pipeline queries memory for context, routes to an AI provider, generates a response enriched with memory, and stores the interaction as a new memory.

---

## Capability Lifecycle

```
PROPOSED → VALIDATED → REGISTERED → ACTIVE → [DEPRECATED] → [REMOVED]
```

1. **Proposed** — a new capability is suggested (by human or evolution engine)
2. **Validated** — tested against regression criteria
3. **Registered** — added to the capability registry with full metadata
4. **Active** — available for use
5. **Deprecated** — marked for removal (still functional)
6. **Removed** — deregistered and unavailable

---

## Tiering

Capabilities are assigned to tiers based on complexity, cost, and strategic value:

| Tier | Access | Approximate Count |
|------|--------|-------------------|
| **Free** | Public | ~80 |
| **Creator** | Paid subscription ($49/mo) | ~170 |
| **Architect** | Paid subscription ($149/mo) | ~170 |
| **Enterprise** | Enterprise contract | ~60 |
| **CMPSBL-Only** | Internal only | ~125+ (Crown Jewels) |

Crown Jewels are capabilities classified as architecturally sensitive. There are **125+ Crown Jewel capabilities** distributed across all 21 modules in three waves, with weighted allocation based on module importance. They span CMPSBL-only (40+ architecture), Architect (43 experience), Creator (27 experience), and Enterprise (35+ experience) tiers — plus engines, meta-engines, and pipelines totaling 155+ crown jewel artifacts.

---

## What's Next

Continue to [`05-SYNERGY-PIPELINES.md`](./05-SYNERGY-PIPELINES.md) for the cross-module orchestration model.

---

<div align="center">

*CMPSBL OS Substrate v10.6.0 — ARCHITECT Epoch*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
