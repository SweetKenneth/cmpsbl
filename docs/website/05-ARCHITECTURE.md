# Architecture Overview

**CMPSBL® Cognitive Infrastructure — CORE Epoch**

---

## Design Philosophy

CMPSBL® is built on three core principles:

1. **Composability** — Discrete modules that assemble in any configuration
2. **Observability** — Complete visibility into system behavior
3. **Autonomy** — Systems that learn, adapt, and self-optimize

---

## The 15-Entity Architecture

CMPSBL organizes intelligence across **15 public entities** and **2 hidden convergence layers** (CCR + CCL). Together they produce **200+ synergy pipelines** and **400+ capabilities**.

### Boot Order

```
CORE → CCR (Layer 0) → CCL (Layer 1) → Modules → Meshes → INTEGRATION
```

### Entity Map

| Entity | Type | Purpose |
|--------|------|---------|
| **CORE** | Kernel | Standalone kernel — boot, circuit breakers, config, job scheduling |
| **DECODE** | Module | Intent router — parses human ambiguity into structured task packets |
| **ENCODE** | Module | Code generation and transformation engine |
| **VISION** | Module | Unified analytics, telemetry, observability |
| **CORTEX** | Module | Pipeline orchestrator, multi-stage cognitive workflows |
| **NEXUS** | Module | Multi-provider AI gateway |
| **ECONOMY** | Module | Cost attribution, budgeting, marketplace signaling |
| **SANDBOX** | Module | Isolated execution environments |
| **INCLUSIVE** | Module | Accessibility scanning, WCAG compliance |
| **DEFENSE** | Mesh | AI-powered security, bot detection, threat analysis |
| **IMMUNITY** | Mesh | Adaptive resilience, executor shadow training, self-healing |
| **EVOLUTION** | Mesh | Self-improvement — mutation proposals, shadow A/B, canary deployment |
| **INTENT** | Mesh | Cross-module intent routing, goal decomposition |
| **GOVERNANCE** | Mesh | Ethical constraints, veto authority, coherence enforcement |
| **INTEGRATION** | Standalone | External service connections, OAuth, third-party APIs |

### Hidden Layers

| Layer | Type | Absorbs |
|-------|------|---------|
| **CCR** (Layer 0) | Hidden Meta-Engine | SYSTEM + BRAIN + MEMORY + DREAM |
| **CCL** (Layer 1) | Hidden Infrastructure | RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT |

MODERNIZER is absorbed by the **EVOLUTION** mesh.

---

## What Each Layer Does

### CORE — Standalone Kernel
The first thing that boots. Owns boot sequencing, circuit breakers, configuration, job scheduling, and the module registry. Everything depends on CORE.

### CCR — Clockless Cognitive Reality (Layer 0, Hidden)
The invisible cognitive foundation. Owns reasoning, memory persistence, dream synthesis, and system administration. Legacy commands (brain.*, system.*, memory.*, dream.*) route through CCR.

### CCL — Clockless Cognitive Lucidity (Layer 1, Hidden)
Infrastructure convergence. Owns event bus (signal), identity/auth, API key management, rate limiting, entitlements, webhook delivery, outbound routing, and compliance logging (AUDIT). Legacy commands route through CCL.

### Modules (8)
The public capability surface:
- **Cognitive**: DECODE (intent parsing)
- **Orchestration**: ENCODE (code gen), CORTEX (pipelines), NEXUS (AI routing)
- **Operational**: VISION (observability), INCLUSIVE (accessibility)
- **Infrastructure**: ECONOMY (cost), SANDBOX (isolation)

### Meshes (5)
Cross-cutting concerns that operate across all modules:
- **DEFENSE** — Security perimeter
- **IMMUNITY** — Adaptive resilience and self-healing
- **EVOLUTION** — Self-improvement lifecycle (absorbs MODERNIZER)
- **INTENT** — Goal decomposition and intent routing
- **GOVERNANCE** — Ethical constraints and coherence

### INTEGRATION (Standalone)
External service connections, OAuth flows, and third-party API management.

---

## Memory System

CMPSBL features a **multi-tier memory architecture** that automatically manages the lifecycle of stored knowledge:

- **Active memories** are instantly accessible for real-time context
- **Intermediate memories** are retained for recurring access patterns
- **Archived memories** are compressed but never lost
- **Protected memories** (identity, principles, safety) are immutable

---

## Event-Driven Communication

All modules communicate through a unified event system that provides:

- **Loose Coupling** — Modules operate independently
- **Extensibility** — Add capabilities without changing existing ones
- **Full Traceability** — Every interaction is observable

---

## Self-Evolution

The substrate continuously improves itself through the EVOLUTION mesh:

1. **Observe** — Identify improvement opportunities
2. **Propose** — Generate change candidates
3. **Evaluate** — Score by impact and risk
4. **Gate** — Human approval for significant changes
5. **Deploy** — Apply with automatic rollback on failure

---

## Security

Defense-in-depth security built into the DEFENSE + IMMUNITY meshes:

- **Zero Trust** — Every request is verified
- **Adaptive Protection** — Security learns from attack patterns
- **Compliance Ready** — SOC 2, GDPR patterns built in
- **Complete Audit Trail** — Every action is logged immutably (via CCL)

---

## Deployment Options

| Option | Description |
|--------|-------------|
| **Master Substrate** | Build on our managed infrastructure with full features |
| **Licensed Substrate** | Deploy on your own infrastructure via [LNCHBL.com](https://lnchbl.com) |
| **Hybrid** | Mix of managed and self-hosted components |

---

*CMPSBL® CORE Epoch — Cognitive Infrastructure for Production AI*
