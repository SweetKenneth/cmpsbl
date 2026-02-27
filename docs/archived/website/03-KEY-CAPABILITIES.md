# Key Capabilities

**What CMPSBL® Does — v10.5.0 ARCHITECT Epoch**

---

## Quick Start: Persistent Memory

The fastest way to experience CMPSBL capabilities is through **Persistent Memory** — add memory to any existing agent in under an hour:

```typescript
import { withPersistentMemory } from '@cmpsbl/memory';

const agent = withPersistentMemory({
  agentId: 'my-agent',
  scope: 'project'
});

const context = await agent.getContext(userMessage);
```

[Persistent Memory Quickstart →](/docs/persistent-memory)

---

## Capability Matrix

| Capability | What It Does |
|------------|-------------|
| **Persistent Memory** | Multi-tier storage that remembers across sessions and auto-manages lifecycle |
| **Self-Learning** | Autonomous learning cycles that make the system smarter over time |
| **AI Routing** | Intelligent multi-provider routing with fallback, cost, and quality optimization |
| **Security** | Enterprise-grade protection with adaptive threat response |
| **Observability** | Real-time dashboards, health monitoring, and full telemetry |
| **Self-Evolution** | Governed code improvements with confidence gating and rollback |
| **Intent Parsing** | Natural language understanding with command routing |
| **Orchestration** | Policy-driven autonomous decision-making |
| **Accessibility** | WCAG scanning, auto-repair, and compliance reporting |
| **Intent Mesh** | Distributed resolution engine for cross-module collaboration |
| **Cross-Module Synergies** | **300+ pipelines, 525+ capabilities across 24 execution surfaces** |

---

## Cross-Module Synergy Engine

### The Problem
Traditional AI systems operate as isolated modules. No coordination, no emergent intelligence.

### Our Solution
**200+ synergy pipelines** that orchestrate multiple modules together for emergent capabilities:

| Category | Pipelines | What It Achieves |
|----------|-----------|-----------------|
| **Intelligence** | 27+ | Cognitive fusion, causal inference, hypothesis testing |
| **Security** | 21+ | Attack surface mapping, adaptive defense, threat modeling |
| **Resilience** | 21+ | Predictive healing, blast radius containment, proactive maintenance |
| **Optimization** | 20+ | Cost routing, token budgeting, resource management |
| **Accessibility** | 17+ | Universal design, adaptive AI, cognitive profiling |
| **Automation** | 16+ | Autonomous repair, predictive evolution |
| **Orchestration** | 13+ | Multi-agent coordination, distributed sync |

All synergies are FREE to explore via [Synergy Pipelines](/synergies).

---

## 1. Persistent Memory (BRAIN)

### The Problem
Traditional AI has no memory. Every conversation starts fresh.

### What It Does
Multi-tier memory that automatically manages the full lifecycle of stored knowledge. Memories are scored, compressed, and promoted based on usage — the system never forgets what matters.

### Highlights
- **Semantic Search** — Find memories by meaning, not keywords
- **Automatic Lifecycle** — Old memories are compressed, not lost
- **Value Scoring** — Important memories are prioritized automatically
- **Protected Memory** — Core identity and principles are immutable
- **Cross-Session Persistence** — Memories survive restarts

---

## 2. Self-Learning (DREAM)

### The Problem
AI doesn't improve from experience. Same mistakes forever.

### What It Does
Autonomous learning cycles that synthesize patterns from interactions and apply high-confidence improvements. The system literally gets smarter while you sleep.

### Highlights
- **Scheduled Cycles** — Runs during low-traffic periods
- **Pattern Synthesis** — Identifies what works and what doesn't
- **Confidence Gating** — Only validated learnings are applied
- **Full Audit Trail** — Every learning decision is logged

---

## 3. Multi-Provider AI Routing (NEXUS)

### The Problem
Locked into one AI provider. No fallback. No optimization.

### What It Does
Intelligent routing across multiple AI providers with automatic failover and optimization:

- **Automatic Fallback** — If one fails, routes to another instantly
- **Cost Optimization** — Routes to the most cost-effective provider for each task
- **Quality Routing** — Complex tasks go to the best models
- **Response Caching** — Reduces redundant API calls

Supports OpenAI, Anthropic, Google AI, Mistral, and open-source models.

---

## 4. Security (DEFENSE)

### The Problem
AI applications are vulnerable to attacks, abuse, and manipulation.

### What It Does
Enterprise-grade, adaptive security built into the core:

- **Adaptive Rules** — Security learns from attack patterns
- **Threat Intelligence** — Shared threat patterns across the network
- **Zero-Trust Architecture** — Every request is verified
- **Compliance Ready** — SOC 2, GDPR patterns built in

---

## 5. Observability (VISION)

### The Problem
AI is a black box. No visibility into decisions.

### What It Does
Complete observability across the entire system with real-time dashboards for health, performance, learning progress, and security status.

- **Real-Time Metrics** — Live system status
- **Historical Trends** — Performance over time
- **Smart Alerting** — Notify on anomalies
- **Drill-Down** — Trace individual requests end to end

---

## 6. Self-Evolution (EVOLUTION Mesh)

### The Problem
Code rots. Systems need constant maintenance.

### What It Does
The system proposes, evaluates, and applies improvements to its own code with human oversight for significant changes.

- **Confidence Gating** — Only safe changes auto-apply
- **Shadow Testing** — Changes are tested before deployment
- **Automatic Rollback** — Reverts on failure
- **Complete Audit Trail** — Full history of all changes

---

## 7. Accessibility (INCLUSIVE)

### The Problem
Most AI applications are not accessible to users with disabilities.

### What It Does
Built-in accessibility compliance with automated scanning, intelligent fix generation, and regression detection.

- **WCAG Scanning** — A, AA, AAA compliance checks
- **Auto-Repair** — Intelligent fixes for common issues
- **Coverage Tracking** — Monitor accessibility over time
- **Self-Scan** — The substrate scans its own UI

---

## Integration Patterns

### SDK (TypeScript)
```typescript
import { substrate } from '@cmpsbl/sdk';

await substrate.brain.remember('User prefers dark mode');
const response = await substrate.nexus.route('Hello');
```

### REST API
```bash
POST /api/substrate
{
  "module": "brain",
  "action": "remember",
  "payload": { "content": "User prefers dark mode" }
}
```

---

## Next Steps

- [Use Cases](./04-USE-CASES.md) — See it in action
- [Architecture](./05-ARCHITECTURE.md) — System overview
- [Getting Started](./06-GETTING-STARTED.md) — Start building
- [Synergy Capabilities](./09-SYNERGY-CAPABILITIES.md) — Full synergy reference

---

*CMPSBL® v10.5.0 ARCHITECT Epoch — Cognitive Infrastructure for Production AI*
