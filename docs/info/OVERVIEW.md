# promptfluid® Substrate — Overview

**v2026.01 — Cognitive Orchestration Substrate for AI Systems**

---

## What is the Substrate?

The promptfluid® substrate is a **cognitive orchestration layer** for AI systems. It provides the execution infrastructure for building applications that reason, remember, and adapt.

Unlike chatbots, assistants, or AI wrappers, the substrate exposes **primitives for cognition**:
- Memory storage and retrieval
- Learning cycles and reinforcement
- Multi-provider AI routing
- Security and defense
- Observability and introspection
- Dream processing and synthesis

---

## Core Philosophy

### Cognition as Software

The substrate treats cognitive operations as composable software primitives. Developers don't prompt AI—they orchestrate cognitive systems.

### Substrate, Not Platform

A platform locks you in. A substrate is infrastructure you build on. The substrate is:
- **Model-agnostic**: Works with any AI provider
- **Cloud-agnostic**: Runs on commodity infrastructure
- **Code-first**: Everything is deterministic and inspectable

### No Black Boxes

Every operation is traceable, every decision is auditable, every module is replaceable.

---

## The Module System

The substrate exposes seven core modules:

| Module | Purpose | Key Capabilities |
|--------|---------|------------------|
| **Brain** | Memory & Learning | Store, query, reflect, reinforce, dream |
| **Decode** | Human Interface | Intent parsing, conversation, interpretation |
| **Defense** | Security | Bot detection, threat analysis, rate limiting |
| **Nexus** | AI Routing | Multi-provider selection, text/image/audio |
| **Vision** | Observability | Health, metrics, tracing, alerting |
| **Dream** | Autonomous Cognition | Dream cycles, mutation, synthesis |
| **System** | Administration | Config, backup, restore, audit |

---

## Who Uses the Substrate?

### Developers
Building agents, orchestration layers, scientific cognition, and operational intelligence.

### Researchers
Exploring memory architectures, learning dynamics, and autonomous systems.

### Enterprises
Deploying governed AI systems with audit trails, security layers, and compliance controls.

---

## Key Differentiators

| Traditional AI | promptfluid® Substrate |
|----------------|------------------------|
| Single model | Multi-provider routing |
| Stateless | Persistent memory |
| Black box | Full observability |
| Prompt engineering | Cognitive composition |
| No governance | Policy enforcement |
| API wrapper | Execution substrate |

---

## Technical Summary

- **API**: Single unified endpoint (`POST /pf-substrate`)
- **Authentication**: JWT-based, per-action authorization
- **Persistence**: PostgreSQL with tiered memory (hot/cold)
- **Execution**: Edge functions (Deno runtime)
- **Deployment**: Supabase-compatible infrastructure

---

## Quick Example

```typescript
import { substrate } from '@/lib/substrate';

// Store a memory
await substrate.brain.remember(
  'The substrate handles memory, not the application.',
  'architectural_principle',
  { confidence: 0.95 }
);

// Query memories
const memories = await substrate.brain.query('architecture', 10);

// Route to best AI provider
const response = await substrate.nexus.route('Explain this architecture');

// Check system health
const health = await substrate.vision.health();
```

---

## Historical Context

The substrate follows foundational open-source infrastructure:

- **Linux (1991)**: OS kernel enabling collaborative development
- **Bitcoin (2009)**: Distributed ledger establishing trustless consensus
- **promptfluid (2025-2026)**: Cognitive substrate enabling persistent memory and governed AI

---

## Next Steps

- [**Architecture**](./ARCHITECTURE.md) — Understand module design
- [**Deployment**](./DEPLOYMENT.md) — Set up your substrate
- [**API Reference**](./API-REFERENCE.md) — Explore capabilities
- [**SDK Guide**](./SDK-GUIDE.md) — Start building

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
