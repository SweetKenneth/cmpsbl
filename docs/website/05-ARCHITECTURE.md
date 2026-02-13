# Architecture Overview

**Technical Foundation of CMPSBL®**

---

## Design Philosophy

CMPSBL® is built on three core principles:

1. **Composability** — Discrete modules that can be assembled in any configuration
2. **Observability** — Complete visibility into every layer of execution  
3. **Autonomy** — Systems that learn, adapt, and self-optimize

---

## The 21-Module Architecture (v9.1.0)

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR LAYER                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  CORTEX (Policy)  │  ENCODE (Code Generation)           ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE LAYER (v9.1.0)               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  MEMORY  │  RELAY  │  AUDIT  │  IDENTITY  │  ECONOMY   ││
│  │          │         │         │            │  SANDBOX    ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                      ADMIN LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  SYSTEM (Health)  │  MODERNIZER  │  INCLUSIVE (A11y)    ││
│  │                   │  INTEGRATION                        ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   OPERATIONS LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  DREAM  │  DEFENSE  │  NEXUS  │  VISION                ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   COGNITIVE LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  BRAIN (Memory)  │  DECODE (NLP)                        ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    KERNEL LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  CORE (Config)  │  RIPPLE (Events)  │  ACCESS (Auth)    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Overview

### Kernel Layer (3 Modules)
Foundation services that all other modules depend on.

| Module | Purpose |
|--------|---------|
| **CORE** | Configuration, constants, feature flags |
| **RIPPLE** | Event bus, pub/sub, cross-module messaging |
| **ACCESS** | API keys, rate limits, entitlements |

### Cognitive Layer (2 Modules)
Intelligence and memory capabilities.

| Module | Purpose |
|--------|---------|
| **BRAIN** | Memory storage, recall, consolidation |
| **DECODE** | Natural language interpretation |

### Operations Layer (4 Modules)
Runtime services for learning, security, AI, and visibility.

| Module | Purpose |
|--------|---------|
| **DREAM** | Autonomous learning cycles |
| **DEFENSE** | Security, threat detection, rate limiting |
| **NEXUS** | Multi-provider AI routing |
| **VISION** | Observability, metrics, tracing |

### Admin Layer (4 Modules)
System management and self-improvement.

| Module | Purpose |
|--------|---------|
| **SYSTEM** | Health, diagnostics, backup/restore |
| **MODERNIZER** | Evolution engine, self-improvement |
| **INCLUSIVE** | Accessibility scanning, WCAG enforcement |
| **INTEGRATION** | Enterprise adapter framework, plugin SDK |

### Infrastructure Layer (6 Modules — v9.1.0)
Foundational services for autonomous, high-trust operations.

| Module | Purpose |
|--------|---------|
| **MEMORY** | Vector/RAG orchestration, semantic recall |
| **RELAY** | Centralized outbound webhooks, side-effect delivery |
| **AUDIT** | Immutable, cryptographically-chained compliance logging |
| **IDENTITY** | Universal human/agent actor attribution |
| **ECONOMY** | Real-time cost attribution, budgeting |
| **SANDBOX** | Isolated environments for safe code execution |

### Orchestrator Layer (2 Modules)
High-level coordination and code generation.

| Module | Purpose |
|--------|---------|
| **CORTEX** | Policy intent, autonomous decision-making |
| **ENCODE** | Code generation, transformation, preview scoring |

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

*CMPSBL® v9.1.0 ARCHITECT Epoch — Architecture for the Cognitive Era*
