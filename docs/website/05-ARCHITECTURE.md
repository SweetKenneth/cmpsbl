# Architecture Overview

**Technical Foundation of CMPSBL® v7.5.0**

---

## Design Philosophy

CMPSBL® is built on three core principles:

1. **Composability** — Discrete modules that can be assembled in any configuration
2. **Observability** — Complete visibility into every layer of execution  
3. **Autonomy** — Systems that learn, adapt, and self-optimize

---

## The 14-Module Architecture (v7.5.0)

**156 deployed actions** across all modules:

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR LAYER                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  CORTEX (Workflow Engine)  │  INTEGRATION (Transform)   ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                      ADMIN LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  SYSTEM (Deps/Audit) │ MODERNIZER (Impact) │ INCLUSIVE  ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   OPERATIONS LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  DEFENSE (Behavioral) │ NEXUS (LB) │ VISION (Alerts)    ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   COGNITIVE LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  BRAIN (Query Opt) │ DECODE (Context) │ DREAM (Synth)   ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    KERNEL LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  CORE (Health Agg) │ RIPPLE (Analytics) │ ACCESS (RBAC) ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## v7.5.0 Architecture Enhancements

### New Subsystems (42 Functions)

| Module | New Subsystem | Purpose |
|--------|---------------|---------|
| BRAIN | Query Optimizer | LRU caching, query planning |
| BRAIN | Consolidation Engine | Similarity grouping, merge detection |
| NEXUS | Load Balancer | Weighted routing, slot management |
| DEFENSE | Behavioral Analysis | Trust scoring, pattern detection |
| DEFENSE | Incident Response | Workflow automation, escalation |
| SYSTEM | Dependency Graph | Runtime dependency tracking |
| SYSTEM | Resource Monitor | Memory, CPU, network metrics |
| VISION | Alert Manager | Deduplication, escalation chains |
| CORTEX | Workflow Engine | Multi-step cross-module pipelines |
| ACCESS | Permission Graph | Hierarchical RBAC with inheritance |
| DECODE | Context Engine | Multi-turn memory, session state |
| DREAM | Creative Synthesis | Pattern mutation, insight generation |
| RIPPLE | Event Analytics | Stream analysis, correlations |
| INTEGRATION | Transform Pipeline | Data mapping, schema conversion |
| INCLUSIVE | Adaptive Interface | Dynamic UI adaptation |
| MODERNIZER | Impact Analysis | Change prediction, breaking changes |

---

## Layer Overview

### Kernel Layer (Boot Order 1-3)
Foundation services that all other modules depend on.

| Module | Purpose |
|--------|---------|
| **CORE** | Configuration, constants, feature flags |
| **RIPPLE** | Event bus, pub/sub, cross-module messaging |
| **ACCESS** | API keys, rate limits, entitlements |

### Cognitive Layer (Boot Order 4-6)
Intelligence and memory capabilities.

| Module | Purpose |
|--------|---------|
| **BRAIN** | Memory storage, recall, consolidation |
| **DECODE** | Natural language interpretation |
| **DREAM** | Autonomous learning cycles |

### Operations Layer (Boot Order 7-9)
Runtime services for security, AI, and visibility.

| Module | Purpose |
|--------|---------|
| **DEFENSE** | Security, threat detection, rate limiting |
| **NEXUS** | Multi-provider AI routing |
| **VISION** | Observability, metrics, tracing |

### Admin Layer (Boot Order 10-12)
System management and self-improvement.

| Module | Purpose |
|--------|---------|
| **SYSTEM** | Health, diagnostics, backup/restore |
| **MODERNIZER** | Evolution engine, self-improvement |
| **INCLUSIVE** | Accessibility scanning, WCAG enforcement |

### Orchestrator Layer (Boot Order 13-14)
High-level coordination and external integration.

| Module | Purpose |
|--------|---------|
| **CORTEX** | Policy intent, autonomous decision-making |
| **INTEGRATION** | External APIs, webhooks, adapters |

---

## Memory Architecture

### Four-Tier Storage

```
┌───────────────────────────────────────┐
│            HOT MEMORY                  │
│   Fast access, recent context          │
│   Capacity: 127 records                │
│   Retention: 7 days                    │
└─────────────────┬─────────────────────┘
                  │ Demotion
                  ▼
┌───────────────────────────────────────┐
│           WARM MEMORY                  │
│   Frequently accessed, intermediate    │
│   Capacity: 2,000 records              │
│   Retention: 30 days                   │
└─────────────────┬─────────────────────┘
                  │ Compression
                  ▼
┌───────────────────────────────────────┐
│           COLD MEMORY                  │
│   Compressed patterns, long-term       │
│   Capacity: 200 records                │
│   Retention: Forever                   │
└─────────────────┬─────────────────────┘
                  │ Archive
                  ▼
┌───────────────────────────────────────┐
│          LEGACY MEMORY                 │
│   Archived, rarely accessed            │
│   Capacity: Unlimited                  │
│   Retention: Forever                   │
└───────────────────────────────────────┘
```

### Memory Value Scoring
Each memory is scored based on:
- **Recency** — When was it last accessed?
- **Frequency** — How often is it accessed?
- **Confidence** — How reliable is the information?

### Protected Memory Types
Foundational knowledge is protected with special handling:
- **Core Identity** — Locked at 1.0 value, zero decay
- **Principles** — Never demoted or pruned
- **Safety Laws** — Immutable system constraints

---

## Event-Driven Architecture

### RIPPLE Event Bus

All modules communicate via the RIPPLE event bus:

```typescript
// Module emits event
ripple.emit('brain.memory.created', { id, content });

// Other modules subscribe
ripple.on('brain.memory.created', (event) => {
  // VISION logs it
  // DREAM considers it for learning
  // DEFENSE checks for threats
});
```

### Benefits
- **Loose Coupling** — Modules don't depend on each other directly
- **Extensibility** — Add new modules without changing existing ones
- **Observability** — Every event is traceable

---

## Self-Evolution Engine

### The 5-Phase Lifecycle

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐    ┌─────────┐
│ COGNIZE │ -> │ PROPOSE  │ -> │ EVALUATE │ -> │  GATE  │ -> │  APPLY  │
│ Observe │    │ Generate │    │  Score   │    │ Review │    │ Deploy  │
└─────────┘    └──────────┘    └──────────┘    └────────┘    └─────────┘
```

| Phase | Description |
|-------|-------------|
| **Cognize** | Scan system for improvement opportunities |
| **Propose** | Generate code change proposals |
| **Evaluate** | Score proposals by impact and risk |
| **Gate** | Human approval for high-impact changes |
| **Apply** | Deploy approved changes |

### Safety Controls
- **Confidence Threshold** — Only 80%+ confidence proposals auto-apply
- **Shadow Testing** — Test changes before production
- **Automatic Rollback** — Revert on errors
- **Audit Trail** — Every change is logged

---

## Security Model

### Defense in Depth

```
┌─────────────────────────────────────────┐
│           Rate Limiting                  │ Layer 1
├─────────────────────────────────────────┤
│           Bot Detection                  │ Layer 2
├─────────────────────────────────────────┤
│           Input Validation               │ Layer 3
├─────────────────────────────────────────┤
│           Access Control                 │ Layer 4
├─────────────────────────────────────────┤
│           Audit Logging                  │ Layer 5
└─────────────────────────────────────────┘
```

### Key Principles
- **Zero Trust** — Verify every request
- **Least Privilege** — Minimal access by default
- **Defense in Depth** — Multiple layers of protection
- **Audit Everything** — Complete trail of all actions

---

## Infrastructure

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + TypeScript + Vite |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **AI** | Model-agnostic, provider-agnostic |
| **Infrastructure** | Commodity cloud (any provider) |

### Deployment Options

| Option | Description |
|--------|-------------|
| **Cloud** | Fully managed, instant setup |
| **Self-Hosted** | Your infrastructure, your control |
| **Hybrid** | Mix of cloud and on-premise |

---

## Next Steps

- [Getting Started](./06-GETTING-STARTED.md) — Start building
- [Licensing](./07-LICENSING.md) — Choose your plan

---

*CMPSBL® v7.5.0 — Architecture for the Cognitive Era*
