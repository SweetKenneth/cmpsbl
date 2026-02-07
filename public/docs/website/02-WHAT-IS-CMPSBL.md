# What is CMPSBL?

**The Cognitive Infrastructure Layer for AI Applications**

---

## In Plain English

CMPSBL® (Composable) is the **operating system for AI applications**. Just like your computer needs an operating system to manage memory, security, and applications, AI applications need a cognitive infrastructure layer to manage memory, learning, and intelligence.

---

## Philosophy

> **"Everything is free to explore. Engines are canon."**

- **Explore freely:** Capability Depot, Template Alley, and Synergy Pipelines are FREE and non-durable
- **Canonize when ready:** Engines are saved, governed, and authoritative
- **Start with memory:** Add persistent memory to any existing agent in under an hour

---

## The Problem We Solve

### Without CMPSBL

Every AI application today faces the same challenges:

| Challenge | Impact |
|-----------|--------|
| **AI has no memory** | Forgets everything after each conversation |
| **AI doesn't learn** | Same mistakes, forever |
| **Vendor lock-in** | Stuck with one AI provider |
| **Security gaps** | Vulnerable to attacks |
| **Black box** | No visibility into what's happening |

### With CMPSBL

| Capability | Result |
|------------|--------|
| **Persistent Memory** | AI remembers users, preferences, context |
| **Self-Learning** | Gets smarter from every interaction |
| **Provider Freedom** | Use any AI model, switch anytime |
| **Built-in Security** | Enterprise-grade protection |
| **Full Observability** | See every decision, every action |

---

## Quick Start: Persistent Memory

The fastest way to start with CMPSBL is **Persistent Memory**. Add memory to any existing agent or React app in under an hour:

```typescript
import { withPersistentMemory } from '@cmpsbl/memory';

const agent = withPersistentMemory({
  agentId: 'my-support-agent',
  scope: 'project'
});

// Your agent now remembers
const context = await agent.getContext(userMessage);
```

**No rewrites. No new framework. Your agent just stops forgetting.**

[Full Persistent Memory Quickstart →](/docs/persistent-memory)

---

## The Tiered Architecture

### Free Exploration Layers

| Layer | Purpose | Persistence |
|-------|---------|-------------|
| **Capability Depot** | Atomic, stateless building blocks | None |
| **Template Alley** | Starting points for learning & remixing | None |
| **Synergy Pipelines** | Exploratory orchestration patterns | None |
| **Persistent Memory** | Drop-in memory for any agent | Bounded, safe defaults |

### Canonized Layers

| Layer | Purpose | Persistence |
|-------|---------|-------------|
| **Engine Marketplace (OEM)** | First-party hardened orchestrations | Full governance |
| **Enterprise Substrate** | Self-hosted full control | Enterprise-grade |

---

## How It Works

### The 3-Layer Architecture

```
┌─────────────────────────────────────────┐
│           YOUR APPLICATION              │
│    (React, Vue, Mobile, API, etc.)      │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│           CMPSBL® SUBSTRATE             │
│  Memory • Learning • Routing • Security │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│           AI PROVIDERS                  │
│   OpenAI • Anthropic • Google • etc.    │
└─────────────────────────────────────────┘
```

Your application talks to CMPSBL. CMPSBL handles everything else.

---

## Key Concepts

### The Brain
Persistent memory that remembers across sessions. Stores preferences, context, learned patterns. Automatically compresses old memories to stay efficient.

### Dream Cycles
Overnight learning that synthesizes patterns from the day's interactions. The system literally gets smarter while you sleep.

### Multi-Provider Routing
Send requests to the best AI for the job. If one provider fails, automatically routes to another. Optimizes for cost, speed, or quality.

### Self-Evolution
The system proposes improvements to its own code. Human-approved changes are automatically deployed. The infrastructure improves itself.

---

## Who Is It For?

| Audience | Use Case | Start Here |
|----------|----------|------------|
| **Agent Developers** | Add memory to existing agents | [Persistent Memory](/docs/persistent-memory) |
| **Startups** | Ship AI features 10x faster | [Capability Depot](/capabilities) |
| **Enterprises** | Compliance-ready AI infrastructure | [Engine Marketplace](/engines) |
| **Researchers** | Experiment with memory and learning | [Synergy Pipelines](/synergies) |

---

## What You Can Build

- **Customer Support AI** that remembers every customer
- **Personal Assistants** that learn your preferences
- **Research Agents** that accumulate knowledge
- **Content Systems** that improve their own output
- **Any AI Application** that needs to be smarter

---

## Definitions

| Term | Definition |
|------|------------|
| **Capability** | Atomic, free, stateless building block |
| **Template** | Free starting point for learning and remixing |
| **Synergy Pipeline** | Exploratory, free, non-durable orchestration |
| **Engine** | Saved, governed, authoritative orchestration |

---

## Next Steps

- [Persistent Memory Quickstart](/docs/persistent-memory) — Add memory in under an hour
- [Key Capabilities](./03-KEY-CAPABILITIES.md) — Deep dive into features
- [Use Cases](./04-USE-CASES.md) — Real-world applications
- [Getting Started](./06-GETTING-STARTED.md) — Full SDK setup

---

*CMPSBL® — Where Machines Learn To Think*
