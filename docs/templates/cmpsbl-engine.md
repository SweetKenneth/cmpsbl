# CMPSBL Engine — Autonomous Intelligent Operations Platform

> The substrate's highest-value single artifact. One import. Complete intelligent operations.

## What It Is

The CMPSBL Engine composes **8 meta-engines** into a single drop-in TypeScript module that handles the entire lifecycle of any workload: **Parse → Route → Execute → Heal → Defend → Learn → Observe → Audit**.

## Engines Composed

| Meta-Engine | Role in CMPSBL Engine |
|---|---|
| Task Processor | Universal input parsing → structured intent |
| AI Ops Platform | Multi-provider routing with cost controls |
| Workflow Engine | Durable saga execution with compensation |
| Self-Healing Mesh | Auto-detect, diagnose, reroute on failure |
| Threat Defense | Rate limiting, circuit breaking, client blocking |
| Knowledge Engine | Self-improving provider selection from outcomes |
| Observability | Incident correlation, health grading, metrics |
| Compliance Core | Tamper-evident hash-chained audit trail |

## Why These 8

The 6 excluded meta-engines (API Gateway, Progressive Delivery, Integration Hub, Data Pipeline, AI Tribunal, Agent Runtime) are **domain-specific specializations**. The 8 selected engines form a **closed operational loop** — every output feeds back into the system:

```
Input → Parse (intent) → Route (learned best provider) → Execute (saga + WAL)
                                                              ↓
                                                         [Success] → Learn → Knowledge
                                                         [Failure] → Heal → Reroute → Retry
                                                              ↓
                                                         Observe (correlate incidents)
                                                         Defend (rate limit + circuit break)
                                                         Audit (immutable chain)
```

## Quick Start

```typescript
import { createCMPSBLEngine } from './cmpsbl-engine';

const engine = createCMPSBLEngine({
  name: 'my-platform',
  budgetCentsPerHour: 500,
  rateLimitPerMinute: 120,
  providers: [
    {
      id: 'fast-model',
      name: 'Fast Model',
      costPerCall: 0.5,
      capabilities: ['query', 'generation'],
      execute: async (input) => {
        const res = await callMyAI(input);
        return { content: res.text, success: true, tokensUsed: res.tokens };
      },
    },
    {
      id: 'smart-model',
      name: 'Smart Model',
      costPerCall: 3.0,
      capabilities: ['analysis', 'comparison', 'generation'],
      execute: async (input) => {
        const res = await callPremiumAI(input);
        return { content: res.text, success: true, confidence: res.score };
      },
    },
  ],
});

// One call does everything
const job = await engine.submit('Analyze quarterly revenue trends');
console.log(job.result?.content);

// Check system health
console.log(engine.status());
// → { healthGrade: 'A', completedJobs: 1, threatLevel: 'none', ... }

// See what the engine has learned
console.log(engine.getInsights());
// → ['Best provider for "analysis": smart-model (80% confidence, 3 samples)']
```

## API Reference

### `createCMPSBLEngine(config) → CMPSBLEngine`

| Config Field | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Engine instance name |
| `maxConcurrency` | `number` | `10` | Max parallel jobs |
| `budgetCentsPerHour` | `number` | `500` | Hourly cost ceiling |
| `rateLimitPerMinute` | `number` | `120` | Global RPM limit |
| `healingEnabled` | `boolean` | `true` | Auto-reroute on failure |
| `learningEnabled` | `boolean` | `true` | Learn from outcomes |
| `auditEnabled` | `boolean` | `true` | Hash-chained audit trail |
| `providers` | `ProviderConfig[]` | `[]` | AI/service providers |
| `threatThresholds` | `object` | `{}` | Defense tuning |

### Core Pipeline

| Method | Description |
|---|---|
| `submit(input, options?)` | Full pipeline: parse → route → execute → heal → learn |
| `parse(input)` | Extract intent, entities, complexity from raw input |
| `route(job)` | Assign best provider using knowledge + health scores |
| `execute(job)` | Run with WAL durability, saga steps, and compensation |

### Provider Management

| Method | Description |
|---|---|
| `addProvider(config)` | Register a new provider at runtime |
| `removeProvider(id)` | Remove and clean up provider state |
| `getProviderStatus(id)` | Get current status: healthy/degraded/down |

### Observability

| Method | Description |
|---|---|
| `status()` | Full metrics: grade, latency, cost, threats, providers |
| `getIncidents({unresolved?})` | Correlated incident list |
| `getAuditTrail(limit?)` | Tamper-evident audit records |
| `getKnowledge()` | Learned provider-intent patterns |
| `getInsights()` | Human-readable intelligence summary |

### Controls

| Method | Description |
|---|---|
| `pause()` | Stop accepting new jobs |
| `resume()` | Resume accepting jobs |
| `drain()` | Pause + wait for active jobs to finish (30s deadline) |
| `reset()` | Clear all state |

## Internal Architecture

### Layers (inside the single file)

```
┌─────────────────────────────────────────────────┐
│                  Rate Limiter                    │  ← DEFENSE
│         RPM/RPH sliding window + client blocks   │
├─────────────────────────────────────────────────┤
│                 Intent Parser                    │  ← DECODE
│        Type · Entities · Complexity · Keywords   │
├─────────────────────────────────────────────────┤
│              Intelligent Router                  │  ← NEXUS + KNOWLEDGE
│   Learned affinity → Health score → Cost score   │
├─────────────────────────────────────────────────┤
│              Saga Executor + WAL                 │  ← MEMORY + BRAIK
│     Steps · Compensation · Crash recovery        │
├─────────────────────────────────────────────────┤
│           Circuit Breaker (per provider)          │  ← IMMUNITY
│      Closed → Open → Half-Open + exp backoff     │
├─────────────────────────────────────────────────┤
│              Self-Healing Engine                  │  ← IMMUNITY
│       Reroute · Degrade · Isolate · Escalate     │
├─────────────────────────────────────────────────┤
│            Knowledge + Learning                   │  ← VISION
│   EMA confidence · Intent-provider affinity map   │
├─────────────────────────────────────────────────┤
│           Incident Correlator                     │  ← VISION
│      Source · Severity · Temporal correlation     │
├─────────────────────────────────────────────────┤
│            Tamper-Evident Audit                   │  ← AUDIT
│        Hash chain · Actor · Resource · Details    │
├─────────────────────────────────────────────────┤
│              Budget Guardian                      │  ← NEXUS
│       Hourly ceiling · Burn rate tracking         │
└─────────────────────────────────────────────────┘
```

### Feedback Loops

The engine has **4 autonomous feedback loops** that make it self-improving:

1. **Learning Loop**: Every completed job updates provider-intent confidence scores (EMA). Future routing uses these scores.
2. **Healing Loop**: Failed executions trigger automatic reroute to the next-best healthy provider, up to `maxAttempts`.
3. **Circuit Loop**: Repeated provider failures open the circuit breaker, preventing cascading failures. Half-open probes test recovery.
4. **Incident Loop**: Correlated incidents surface systemic issues. The health grade degrades, biasing the router away from troubled providers.

## Design Principles

- **Zero dependencies** — No npm packages, no framework lock-in
- **Pure TypeScript** — Works in Node, Deno, Bun, browsers
- **Factory pattern** — `createCMPSBLEngine()` returns a self-contained instance
- **No global state** — Multiple instances run independently
- **Self-improving** — Gets smarter with every job processed
- **Tamper-evident** — Every action hash-chained for compliance
- **Graceful degradation** — Never crashes; degrades providers, reroutes, escalates
