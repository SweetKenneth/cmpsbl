# promptfluid® Substrate — Developer Guide

**v4.0.0 — Cognitive Orchestration Substrate for AI Systems**

---

## Overview

The promptfluid® Substrate is a **cognitive operating system** that provides a unified API for AI memory, learning, security, routing, and observability. It consists of **11 modules** organized into 4 layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPER SDK                            │
│            substrate.brain.query() • substrate.core.schedule()  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   ACCESS LAYER                           │   │
│   │          API Keys • Quotas • Billing • Authentication    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                               │                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    CORE (KERNEL)                         │   │
│   │        Scheduler • Router • Lifecycle • State Machine    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                               │                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                 RIPPLE (MESSAGE BUS)                     │   │
│   │            Pub/Sub • Job Queues • Event Sourcing         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                               │                                  │
│   ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┐     │
│   │ BRAIN │DECODE │DEFENSE│ NEXUS │VISION │ DREAM │SYSTEM │     │
│   │Memory │Intent │Security│AIRoute│Monitor│Evolve │ Admin │     │
│   └───────┴───────┴───────┴───────┴───────┴───────┴───────┘     │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                     MODERNIZER                           │   │
│   │            Self-Improvement • Shadow Testing             │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                   SUPABASE (POSTGRES + EDGE)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Endpoint

All substrate operations go through a single endpoint:

```
POST https://[your-project].supabase.co/functions/v1/pf-substrate
```

### 2. Request Format

```json
{
  "module": "brain",
  "action": "query",
  "payload": {
    "query_text": "machine learning",
    "limit": 10
  }
}
```

### 3. Response Format

```json
{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { ... },
  "timestamp": "2026-01-23T12:00:00.000Z"
}
```

### 4. TypeScript SDK

```typescript
import { substrate, brain, nexus, vision, core, ripple, access } from '@/lib/substrate';

// Query memories
const memories = await brain.query('machine learning', 10);

// Route AI request
const response = await nexus.route('Explain quantum computing');

// Check system health
const health = await vision.healthSnapshot();

// Schedule a job
await core.schedule({
  module: 'brain',
  action: 'reflect',
  delay: '1h'
});
```

---

## The 11 Modules

### Kernel Layer

| Module | Purpose | Key Actions |
|--------|---------|-------------|
| **CORE** | Kernel & Scheduler | `status`, `pulse`, `boot`, `schedule`, `jobs`, `process`, `config`, `shutdown` |
| **RIPPLE** | Message Bus | `status`, `pulse`, `enqueue`, `dequeue`, `publish`, `subscribe`, `topics`, `events`, `deadLetter`, `retry` |
| **ACCESS** | Identity & Billing | `status`, `pulse`, `createKey`, `validateKey`, `revokeKey`, `listKeys`, `getUsage`, `checkQuota`, `recordUsage`, `subscription` |

### Cognitive Layer

| Module | Purpose | Key Actions |
|--------|---------|-------------|
| **BRAIN** | Memory & Learning | `status`, `query`, `remember`, `learn`, `reflect`, `reinforce`, `dream`, `graphSummary`, `sessionReflection`, `coherenceCheck` |
| **DECODE** | Intent & Chat | `status`, `chat`, `intent`, `dream`, `learn`, `propose` |
| **NEXUS** | AI Routing | `status`, `route`, `providers`, `routeStats`, `text`, `image` |
| **DREAM** | Evolution | `status`, `cycle`, `reflect`, `interpret`, `mutate`, `consume`, `mood` |

### Operational Layer

| Module | Purpose | Key Actions |
|--------|---------|-------------|
| **DEFENSE** | Security | `status`, `analyze`, `reputation`, `anomaly`, `anomalyProbe`, `limits`, `posture`, `ipIntel` |
| **VISION** | Observability | `status`, `health`, `healthSnapshot`, `metrics`, `logs`, `dashboard`, `trace`, `pulse`, `quota`, `introspection`, `dependencyMap` |
| **SYSTEM** | Administration | `status`, `health`, `heal`, `diagnostics`, `backup`, `restore`, `listBackups`, `version`, `restart`, `config`, `audit` |

### Admin Layer

| Module | Purpose | Key Actions |
|--------|---------|-------------|
| **MODERNIZER** | Self-Improvement | `status`, `pulse`, `scan`, `jobs`, `job`, `quota`, `analyze`, `propose`, `plans`, `review`, `apply`, `rollback`, `delete`, `archived`, `implement` |

---

## Module: CORE (Kernel)

The kernel orchestrates all substrate operations.

### Actions

```typescript
// Check kernel status
await core.status();

// Lightweight heartbeat
await core.pulse();

// Schedule a delayed job
await core.schedule({
  module: 'brain',
  action: 'reflect',
  delay: '30m',
  priority: 5
});

// List pending jobs
await core.jobs('queued', 20);

// Process next job
await core.process();

// Get/set configuration
await core.config('rate_limits');

// Graceful shutdown
await core.shutdown();
```

---

## Module: RIPPLE (Message Bus)

Async communication between modules.

### Actions

```typescript
// Add job to queue
await ripple.enqueue('research', { topic: 'AI trends' }, { priority: 10 });

// Get next job from queue
await ripple.dequeue('research');

// Publish event
await ripple.publish('brain.learned', 'memory_created', { memoryId: '...' });

// Subscribe to events
await ripple.subscribe('brain.learned', 'vision', 'log');

// List topics
await ripple.topics();

// Get event log
await ripple.events({ topic: 'brain.learned', limit: 50 });

// View failed jobs
await ripple.deadLetter();

// Retry failed job
await ripple.retry('job-id');
```

---

## Module: ACCESS (Identity & Billing)

API key management and usage tracking.

### Actions

```typescript
// Create API key
await access.createKey({
  developer_id: 'dev-123',
  name: 'Production Key',
  scopes: ['brain.read', 'nexus.*'],
  rate_limit_per_minute: 100
});

// Validate API key
await access.validateKey('pk_live_...');

// List developer's keys
await access.listKeys('dev-123');

// Check quota remaining
await access.checkQuota('key-id');

// Get usage stats
await access.getUsage({
  developer_id: 'dev-123',
  start_date: '2026-01-01',
  end_date: '2026-01-31'
});

// Get subscription info
await access.subscription('dev-123');
```

---

## Module: BRAIN (Memory)

Cognitive memory with tiered storage and knowledge graphs.

### Actions

```typescript
// Search memories
const memories = await brain.query('machine learning', 10);

// Store memory with confidence
await brain.remember('Neural networks use backpropagation', 'fact', 0.95, {
  domain: 'ml',
  verified: true
});

// Reinforce a memory
await brain.reinforce('memory-id', 0.1);

// Trigger reflection
await brain.reflect();

// Knowledge graph stats
await brain.graphSummary();

// Cross-module session summary
await brain.sessionReflection(24); // last 24 hours

// Check memory coherence
await brain.coherenceCheck('deep');
```

---

## Module: DECODE (Intent)

Conversational AI and intent extraction.

### Actions

```typescript
// Process chat message
const reply = await decode.chat('What can you help me with?', 'session-123');

// Extract intent
const intent = await decode.intent('Schedule a meeting for tomorrow');
// Returns: { intent: 'schedule', entities: { date: 'tomorrow' }, confidence: 0.92 }

// Submit proposal
await decode.propose('Add a new research feature');

// Learn from interaction
await decode.learn('User prefers detailed explanations', 'conversation');
```

---

## Module: NEXUS (AI Routing)

Multi-provider AI routing with automatic fallbacks.

### Actions

```typescript
// Route to best provider
const response = await nexus.route('Explain quantum computing');

// Get provider availability
await nexus.providers();
// Returns: { groq: { health: 100, latency: 45 }, cerebras: { health: 95 }, ... }

// Routing analytics
await nexus.routeStats();
// Returns: 24h breakdown of calls, tokens, costs per provider

// Direct text generation
await nexus.text('Write a haiku about AI', 'groq');

// Image generation
await nexus.image('A futuristic city at sunset');
```

### Provider Priority
1. **Groq** (llama-3.3-70b) — Fastest, primary
2. **Cerebras** (llama-3.3-70b) — High throughput
3. **SambaNova** — Fallback
4. **DeepSeek** — Final fallback

---

## Module: DEFENSE (Security)

Bot detection, threat analysis, and rate limiting.

### Actions

```typescript
// Analyze request
const result = await defense.analyze({
  fingerprint: { ... },
  ip: '192.168.1.1'
});

// IP reputation
await defense.reputation('192.168.1.1');

// Anomaly detection
await defense.anomaly('1h');

// Z-score analysis
await defense.anomalyProbe(24);

// Rate limit status
await defense.limits();

// Security posture summary
await defense.posture();

// IP intelligence
await defense.ipIntel('192.168.1.1', true);
```

---

## Module: VISION (Observability)

Health monitoring, metrics, and distributed tracing.

### Actions

```typescript
// System health
await vision.health();

// Quick health check
await vision.healthSnapshot();

// Ultra-light heartbeat
await vision.pulse();

// Dashboard data
await vision.dashboard();

// System metrics
await vision.metrics();

// Recent logs
await vision.logs('brain', 50);

// Distributed tracing
await vision.trace('trace-id');

// AI quota usage
await vision.quota();

// Deep introspection
await vision.introspection();

// Module dependency map
await vision.dependencyMap();
```

---

## Module: DREAM (Evolution)

Autonomous processing and system evolution.

### Actions

```typescript
// Execute dream cycle
await dream.cycle();

// Submit dream for processing
await dream.feed('I was floating through an endless library...');

// Interpret dream text
await dream.interpret('Dream content here');

// Trigger mutation/evolution
await dream.mutate();

// Dream reflection
await dream.reflect();

// Get/set mood
await dream.mood('curious');
```

---

## Module: SYSTEM (Administration)

System administration, backups, and healing.

### Actions

```typescript
// System status
await system.status();

// Full health check
await system.health();

// Comprehensive diagnostics
await system.diagnostics();

// Heal system
await system.heal('brain', true);

// Create backup
await system.backup({ include_data: true, tables: ['brain_memories'] });

// List backups
await system.listBackups();

// Restore from backup
await system.restore('backup-id', false);

// Get version
await system.version();

// Restart service
await system.restart('brain');
```

---

## Module: MODERNIZER (Self-Improvement)

Substrate code analysis and shadow-mode upgrades.

### Actions

```typescript
// Check modernizer status
await modernizer.status();

// Scan for improvements
await modernizer.scan({ depth: 'deep' });

// List recent jobs
await modernizer.jobs(10);

// Get specific job
await modernizer.job('job-id');

// Propose upgrade (shadow mode)
await modernizer.propose({ scope: 'brain', notes: 'Memory optimization' });

// Review upgrade plan
await modernizer.review('plan-id');

// Apply approved plan
await modernizer.apply('plan-id');

// Rollback applied plan
await modernizer.rollback('plan-id');

// Scan archived functions
await modernizer.archived();

// Implement archived function
await modernizer.implement('cascade-dream', 'dream.cycle');
```

---

## Authentication

### Public Endpoints (no auth required)
- All `status` actions
- All `pulse` actions
- `vision.health`, `vision.healthSnapshot`

### Authenticated Endpoints
Require JWT or API key:

```typescript
// Using Supabase client (automatic)
const { data } = await supabase.functions.invoke('pf-substrate', {
  body: { module: 'brain', action: 'query', payload: { query_text: 'test' } }
});

// Using fetch with JWT
fetch('/functions/v1/pf-substrate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ module: 'brain', action: 'query' })
});

// Using API key
fetch('/functions/v1/pf-substrate', {
  method: 'POST',
  headers: {
    'x-api-key': 'pk_live_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ... })
});
```

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| IP (general) | 100 req / 5 min |
| IP (chat) | 20 req / 5 min |
| IP (dream) | 15 req / 5 min |
| Authenticated | 500 req / 5 min |
| Daily per API key | 5000 req / day |

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Unknown module/action |
| 422 | Validation failed |
| 429 | Rate limited |
| 500 | Internal error |

---

## Module Summary

| Module | Actions | Layer |
|--------|---------|-------|
| CORE | 8 | Kernel |
| RIPPLE | 10 | Kernel |
| ACCESS | 10 | Kernel |
| BRAIN | 15+ | Cognitive |
| DECODE | 6 | Cognitive |
| NEXUS | 6 | Cognitive |
| DREAM | 7 | Cognitive |
| DEFENSE | 8 | Operational |
| VISION | 15+ | Operational |
| SYSTEM | 12 | Operational |
| MODERNIZER | 15+ | Admin |
| **TOTAL** | **100+** | — |

---

## Next Steps

1. [API Reference](./API-REFERENCE.md) — Every action with parameters
2. [SDK Examples](./examples/) — Ready-to-use code snippets
3. [Architecture Deep Dive](../docs/ARCHITECTURE.md) — Technical internals

---

**promptfluid® — The Cognitive Substrate OS**  
*v4.0.0 — © 2025-2026 promptfluid. All rights reserved.*
