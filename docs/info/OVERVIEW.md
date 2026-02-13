# promptfluid® Substrate — Overview

**v9.1.0 — Cognitive Orchestration Substrate for AI Systems**

---

## What is the Substrate?

The promptfluid® substrate is a **cognitive orchestration layer** for AI systems. It provides the execution infrastructure for building applications that reason, remember, and adapt.

---

## The 21-Module Architecture (v9.1.0)

| Layer | Module | Purpose |
|-------|--------|---------|
| **Kernel** | CORE | Scheduling, lifecycle, circuit breakers |
| **Kernel** | RIPPLE | Pub/sub messaging, event queues |
| **Kernel** | ACCESS | API keys, rate limiting, billing |
| **Cognitive** | BRAIN | Memory, learning, knowledge |
| **Cognitive** | DECODE | Human interface, intent parsing |
| **Cognitive** | NEXUS | Multi-provider AI routing |
| **Operational** | DREAM | Autonomous evolution, synthesis |
| **Operational** | DEFENSE | Security, bot detection |
| **Operational** | VISION | Observability, health monitoring |
| **Operational** | INTEGRATION | Enterprise adapters, LLM governance |
| **Administrative** | SYSTEM | Backup, restore, configuration |
| **Administrative** | MODERNIZER | Self-improvement proposals |
| **Administrative** | INCLUSIVE | Accessibility, human compatibility |
| **Orchestrator** | CORTEX | Cross-module orchestration |

---

## Quick Example

```typescript
import { substrate } from '@/lib/substrate';

// Store a memory
await substrate.brain.remember('User prefers dark mode', 'preference');

// Route to best AI provider
const response = await substrate.nexus.route('Summarize this document');

// Connect to enterprise system
const adapters = await substrate.integration.adapters();

// Check system health
const health = await substrate.vision.health();
```

---

## Next Steps

- [**DEPLOYMENT.md**](./DEPLOYMENT.md) — Set up your substrate
- [**API-REFERENCE.md**](./API-REFERENCE.md) — Explore capabilities
- [**SDK-GUIDE.md**](./SDK-GUIDE.md) — Start building

---

**promptfluid® — The Cognitive Substrate OS v9.1.0**
