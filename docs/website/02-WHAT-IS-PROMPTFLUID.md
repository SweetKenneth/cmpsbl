# What is promptfluid®?

**The Cognitive Infrastructure Layer for AI Applications**

---

## In Plain English

promptfluid® is the **operating system for AI applications**. Just like your computer needs an operating system to manage memory, security, and applications, AI applications need a cognitive infrastructure layer to manage memory, learning, and intelligence.

---

## The Problem We Solve

### Without promptfluid

Every AI application today faces the same challenges:

| Challenge | Impact |
|-----------|--------|
| **AI has no memory** | Forgets everything after each conversation |
| **AI doesn't learn** | Same mistakes, forever |
| **Vendor lock-in** | Stuck with one AI provider |
| **Security gaps** | Vulnerable to attacks |
| **Black box** | No visibility into what's happening |

### With promptfluid

| Capability | Result |
|------------|--------|
| **Persistent Memory** | AI remembers users, preferences, context |
| **Self-Learning** | Gets smarter from every interaction |
| **Provider Freedom** | Use any AI model, switch anytime |
| **Built-in Security** | Enterprise-grade protection |
| **Full Observability** | See every decision, every action |

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
│         promptfluid® SUBSTRATE          │
│  Memory • Learning • Routing • Security │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│           AI PROVIDERS                  │
│   OpenAI • Anthropic • Google • etc.    │
└─────────────────────────────────────────┘
```

Your application talks to promptfluid. promptfluid handles everything else.

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

| Audience | Use Case |
|----------|----------|
| **Startups** | Ship AI features 10x faster |
| **Enterprises** | Compliance-ready AI infrastructure |
| **Agencies** | Build AI products for clients |
| **Researchers** | Experiment with memory and learning |

---

## What You Can Build

- **Customer Support AI** that remembers every customer
- **Personal Assistants** that learn your preferences
- **Research Agents** that accumulate knowledge
- **Content Systems** that improve their own output
- **Any AI Application** that needs to be smarter

---

## Quick Start

```typescript
import { substrate } from '@promptfluid/sdk';

// Store a memory
await substrate.brain.remember('User prefers dark mode', 'preference');

// Route to best AI provider
const response = await substrate.nexus.route('Summarize this document');

// Check system health
const health = await substrate.vision.health();
```

---

## Next Steps

- [Key Capabilities](./03-KEY-CAPABILITIES.md) — Deep dive into features
- [Use Cases](./04-USE-CASES.md) — Real-world applications
- [Getting Started](./06-GETTING-STARTED.md) — Start building

---

*promptfluid® — Where Machines Learn To Think*
