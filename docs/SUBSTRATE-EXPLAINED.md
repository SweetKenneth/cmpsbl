# promptfluid® Substrate — Explained

**The 5-Minute Guide to Understanding the Cognitive Operating System**

---

## What Is This?

promptfluid® is a **cognitive operating system for AI**. Think of it like an operating system for your computer, but instead of managing files and applications, it manages memory, learning, security, and AI operations.

```
Traditional Computer OS          promptfluid® Substrate
─────────────────────           ────────────────────────
Files & Folders      →          Memory & Knowledge
Running Apps         →          AI Operations
User Permissions     →          API Keys & Quotas
System Logs          →          Observability & Vision
Scheduled Tasks      →          Job Queue & Scheduler
Network Security     →          Bot Detection & Defense
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPER SDK                                  │
│              substrate.brain.query() • substrate.nexus.route()          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         ACCESS LAYER                             │   │
│   │              API Keys • Quotas • Billing • Authentication        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         CORE (KERNEL)                            │   │
│   │         Scheduler • Router • Lifecycle • State Machine           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      RIPPLE (MESSAGE BUS)                        │   │
│   │              Pub/Sub • Job Queues • Event Sourcing               │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│   ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────┐   │
│   │  BRAIN  │ DECODE  │ DEFENSE │  NEXUS  │ VISION  │  DREAM  │SYSTEM│   │
│   │ Memory  │ Intent  │Security │AI Route │ Monitor │ Evolve  │Admin │   │
│   └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────┘   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                         SUPABASE (POSTGRES + EDGE)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## The 11 Modules

### 🎛️ Kernel Layer (How the OS Works)

| Module | Purpose | What It Does |
|--------|---------|--------------|
| **CORE** | The Kernel | Schedules jobs, manages lifecycle, routes requests, handles shutdown |
| **RIPPLE** | Message Bus | Async job queues, pub/sub messaging, event sourcing between modules |
| **ACCESS** | Identity | API key management, usage quotas, billing, developer authentication |

### 🧠 Cognitive Layer (What the OS Thinks)

| Module | Purpose | What It Does |
|--------|---------|--------------|
| **BRAIN** | Memory | Stores knowledge, queries memories, learns from interactions, reflects daily |
| **DECODE** | Interpreter | Parses user intent, handles chat, translates requests to actions |
| **NEXUS** | AI Router | Routes prompts to best AI provider (Groq, OpenAI, etc.), handles fallbacks |
| **DREAM** | Evolution | Autonomous processing, dream cycles, system self-improvement |

### 🛡️ Operational Layer (How the OS Runs)

| Module | Purpose | What It Does |
|--------|---------|--------------|
| **DEFENSE** | Security | Bot detection, threat analysis, IP reputation, rate limiting |
| **VISION** | Observability | Health monitoring, metrics, logs, dashboards, alerting |
| **SYSTEM** | Administration | Backups, restores, diagnostics, healing, configuration |
| **MODERNIZER** | Self-Upgrade | Scans for improvements, proposes updates, shadow testing |

---

## Why Each Module Exists

### CORE — "The Brain Stem"
Without a kernel, modules would run chaotically. CORE ensures:
- Jobs run in order with proper retry logic
- Requests route to the correct module
- System boots and shuts down gracefully
- Configuration stays consistent

### RIPPLE — "The Nervous System"
Modules need to communicate asynchronously. RIPPLE provides:
- Queue long-running tasks (image generation, batch processing)
- Publish events other modules can subscribe to
- Event log for debugging and replay

### ACCESS — "The Gatekeeper"
Developers need controlled access. ACCESS manages:
- API key creation with scopes and limits
- Usage tracking per key
- Quota enforcement
- Billing integration (Stripe)

### BRAIN — "Long-Term Memory"
AI without memory forgets everything. BRAIN stores:
- Facts, insights, conversation context
- Knowledge graph relationships
- Hot (fast) and cold (archived) memory tiers

### DECODE — "The Translator"
Natural language needs structure. DECODE:
- Extracts intent from messages
- Maps requests to module actions
- Maintains conversation context

### NEXUS — "The AI Traffic Controller"
AI providers have different strengths. NEXUS:
- Routes to fastest/cheapest provider
- Handles fallbacks when providers fail
- Caches responses for speed
- Tracks costs across providers

### DREAM — "The Subconscious"
Systems need time to consolidate. DREAM:
- Runs nightly processing cycles
- Compresses and optimizes memories
- Generates creative mutations
- Self-improves without intervention

### DEFENSE — "The Immune System"
Bots and attacks are constant. DEFENSE:
- Detects automated traffic
- Scores IP reputation
- Blocks threats automatically
- Monitors for anomalies

### VISION — "The Eyes"
You can't fix what you can't see. VISION:
- Real-time health dashboards
- Module status and metrics
- Distributed tracing
- Alerting and logs

### SYSTEM — "The Maintenance Crew"
Systems need care. SYSTEM:
- Creates validated backups
- Restores from any point
- Heals degraded modules
- Runs diagnostics

### MODERNIZER — "The Mechanic"
Code ages. MODERNIZER:
- Scans for outdated patterns
- Proposes improvements
- Tests changes in shadow mode
- Applies approved updates

---

## How It All Works Together

### Example: User Asks a Question

```
1. User sends: "What did I learn yesterday?"

2. ACCESS validates API key

3. CORE routes request to DECODE

4. DECODE extracts intent: { module: "brain", action: "query" }

5. CORE schedules brain.query job

6. BRAIN searches memories from last 24 hours

7. NEXUS may be called to summarize results

8. VISION logs the trace

9. Response returns to user
```

### Example: Nightly Dream Cycle

```
1. CORE scheduler triggers DREAM.cycle at 3 AM

2. DREAM consolidates day's memories

3. BRAIN compresses old memories to cold storage

4. MODERNIZER scans for improvement opportunities

5. VISION records health snapshot

6. RIPPLE publishes "dream.completed" event

7. System enters optimal state for next day
```

---

## Quick Start

```typescript
import { substrate, brain, nexus, vision } from '@/lib/substrate';

// Store a memory
await brain.remember('User prefers dark mode', 'preference');

// Query memories
const memories = await brain.query('user preferences', 5);

// Route an AI request
const response = await nexus.route('Explain quantum computing');

// Check system health
const health = await vision.healthSnapshot();
```

---

## Key Principles

1. **One Endpoint** — All 11 modules accessible via `pf-substrate`
2. **Module Isolation** — Modules don't directly call each other (use RIPPLE)
3. **Health Always** — Every module has a `pulse` action for monitoring
4. **Fail Gracefully** — Circuit breakers prevent cascade failures
5. **Self-Healing** — Degraded modules auto-recover when possible

---

## Technical Summary

| Aspect | Value |
|--------|-------|
| **Endpoint** | `POST /functions/v1/pf-substrate` |
| **Modules** | 11 (CORE, RIPPLE, ACCESS, BRAIN, DECODE, DEFENSE, NEXUS, VISION, DREAM, SYSTEM, MODERNIZER) |
| **Database** | PostgreSQL via Supabase |
| **Edge Functions** | Deno runtime |
| **Authentication** | JWT (Supabase Auth) or API Key |
| **Version** | v4.1.1 (2026-01) |

---

## Learn More

| Document | What You'll Learn |
|----------|-------------------|
| [QUICK-START.md](./QUICK-START.md) | Get running in 5 minutes |
| [API-REFERENCE.md](./API-REFERENCE.md) | Every module, every action |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Deep technical design |
| [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) | Migrate from legacy functions |

---

*promptfluid® — The Cognitive Substrate OS*  
*© 2025-2026 promptfluid. All rights reserved.*
