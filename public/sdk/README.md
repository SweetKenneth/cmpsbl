# CMPSBL® Substrate SDK

## v4.1.1 — Cognitive Orchestration Substrate (Brain v2.0)

A TypeScript client SDK for the CMPSBL® Substrate — a unified API for cognitive AI operations with **11 modules** across 4 layers.

---

## Overview

The CMPSBL® Substrate provides:

- **Kernel Layer**: CORE (scheduler), RIPPLE (message bus), ACCESS (identity)
- **Cognitive Layer**: BRAIN (memory), DECODE (intent), NEXUS (AI routing), DREAM (evolution)
- **Operational Layer**: DEFENSE (security), VISION (observability), SYSTEM (admin)
- **Admin Layer**: EVOLUTION (self-improvement)

All 11 modules accessed through a single endpoint.

---

## Installation

```bash
# Copy the SDK file to your project
cp public/sdk/substrate-client.ts src/lib/

# Install dependencies
npm install @supabase/supabase-js
```

---

## Quick Start

```typescript
import { SubstrateClient } from './substrate-client';

// Initialize client
const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY',
  developerId: 'your-developer-uuid',
  appId: 'your-app-uuid'
});

// Query memories
const memories = await substrate.brain.query('machine learning', 10);

// Route AI request
const response = await substrate.nexus.route('Explain quantum computing');

// Check system health
const health = await substrate.vision.healthSnapshot();

// Schedule a job
await substrate.core.schedule({
  module: 'brain',
  action: 'reflect',
  delay: '1h'
});
```

---

## Kernel Layer

### CORE — Kernel & Scheduler

```typescript
await substrate.core.status();           // Kernel status
await substrate.core.pulse();            // Heartbeat
await substrate.core.boot();             // Initialize boot sequence
await substrate.core.schedule({          // Schedule job
  module: 'brain',
  action: 'reflect',
  delay: '30m',
  priority: 5
});
await substrate.core.jobs('queued', 20); // List jobs
await substrate.core.process();          // Process next job
await substrate.core.config('key');      // Get/set config
await substrate.core.shutdown();         // Graceful shutdown
```

### RIPPLE — Message Bus

```typescript
await substrate.ripple.status();         // Bus status
await substrate.ripple.pulse();          // Heartbeat
await substrate.ripple.enqueue('research', { topic: 'AI' }, { priority: 10 });
await substrate.ripple.dequeue('research');
await substrate.ripple.publish('brain.learned', 'memory_created', { id: '...' });
await substrate.ripple.subscribe('brain.learned', 'vision', 'log');
await substrate.ripple.topics();
await substrate.ripple.events({ topic: 'brain.learned', limit: 50 });
await substrate.ripple.deadLetter();
await substrate.ripple.retry('job-id');
```

### ACCESS — Identity & Billing

```typescript
await substrate.access.status();         // Module status
await substrate.access.pulse();          // Heartbeat
await substrate.access.createKey({
  developer_id: 'dev-123',
  name: 'Production Key',
  scopes: ['brain.read', 'nexus.*'],
  rate_limit_per_minute: 100
});
await substrate.access.validateKey('pk_live_...');
await substrate.access.listKeys('dev-123');
await substrate.access.checkQuota('key-id');
await substrate.access.getUsage({ developer_id: 'dev-123' });
await substrate.access.subscription('dev-123');
```

---

## Cognitive Layer

### BRAIN — Memory & Learning

```typescript
await substrate.brain.status();                    // Module status
await substrate.brain.query('machine learning', 10); // Search memories
await substrate.brain.remember('content', 'fact', 0.95); // Store memory
await substrate.brain.learn('content', 'source');  // Ingest knowledge
await substrate.brain.recall('query', 5);          // Retrieve memory
await substrate.brain.reflect();                   // Trigger reflection
await substrate.brain.reinforce('memory-id', 0.1); // Boost confidence
await substrate.brain.dream();                     // Dream cycle
await substrate.brain.synthesize();                // Cross-domain synthesis
await substrate.brain.graphSummary();              // Knowledge graph stats
await substrate.brain.sessionReflection(24);       // Session summary
await substrate.brain.coherenceCheck('deep');      // Memory coherence
await substrate.brain.deepThink('query', 3);       // Extended reasoning
await substrate.brain.patterns();                  // Learning patterns
```

### DECODE — Intent & Chat

```typescript
await substrate.decode.status();                   // Module status
await substrate.decode.chat('Hello!', 'session-123'); // Process message
await substrate.decode.intent('Schedule meeting tomorrow'); // Extract intent
await substrate.decode.dream();                    // Initiate dream
await substrate.decode.learn('content', 'source'); // Learn from interaction
await substrate.decode.propose('Add feature X');   // Submit proposal
```

### NEXUS — AI Routing

```typescript
await substrate.nexus.status();                    // Module status
await substrate.nexus.route('Complex task');       // Route to best provider
await substrate.nexus.providers();                 // Provider availability
await substrate.nexus.routeStats();                // Routing analytics
await substrate.nexus.text('Write a haiku');       // Text generation
await substrate.nexus.image('A sunset');           // Image generation
```

### DREAM — Evolution

```typescript
await substrate.dream.status();                    // Module status
await substrate.dream.mood('curious');             // Get/set mood
await substrate.dream.cycle();                     // Execute dream cycle
await substrate.dream.consume('dream-id');         // Consume dream
await substrate.dream.interpret('dream text');     // Interpret dream
await substrate.dream.mutate();                    // Trigger mutation
await substrate.dream.reflect();                   // Dream reflection
```

---

## Operational Layer

### DEFENSE — Security

```typescript
await substrate.defense.status();                  // Module status
await substrate.defense.analyze({ fingerprint }, '192.168.1.1'); // Analyze
await substrate.defense.reputation('192.168.1.1'); // IP reputation
await substrate.defense.anomaly('1h');             // Anomaly detection
await substrate.defense.anomalyProbe(24);          // Z-score analysis
await substrate.defense.limits();                  // Rate limit status
await substrate.defense.posture();                 // Security posture
await substrate.defense.ipIntel('192.168.1.1', true); // IP intelligence
```

### VISION — Observability

```typescript
await substrate.vision.status();                   // Module status
await substrate.vision.health();                   // System health
await substrate.vision.healthSnapshot();           // Quick health check
await substrate.vision.pulse();                    // Heartbeat
await substrate.vision.dashboard();                // Dashboard data
await substrate.vision.metrics();                  // System metrics
await substrate.vision.logs('brain', 50);          // Recent logs
await substrate.vision.trace('trace-id');          // Distributed tracing
await substrate.vision.quota();                    // AI usage quota
await substrate.vision.introspection();            // Deep analysis
await substrate.vision.dependencyMap();            // Module dependencies
```

### SYSTEM — Administration

```typescript
await substrate.system.status();                   // System status
await substrate.system.version();                  // Substrate version
await substrate.system.health();                   // Full health check
await substrate.system.diagnostics();              // Comprehensive diagnostics
await substrate.system.heal('brain', true);        // Heal system
await substrate.system.backup({ include_data: true }); // Create backup
await substrate.system.listBackups();              // List backups
await substrate.system.restore('backup-id');       // Restore
await substrate.system.restart('brain');           // Restart service
```

---

## Admin Layer

### EVOLUTION — Self-Improvement

```typescript
await substrate.evolution.status();               // Module status
await substrate.evolution.pulse();                // Heartbeat
await substrate.evolution.scan({ depth: 'deep' }); // Scan for improvements
await substrate.evolution.jobs(10);               // List jobs
await substrate.evolution.job('job-id');          // Get specific job
await substrate.evolution.quota();                // Check quota
await substrate.evolution.propose({ scope: 'brain' }); // Propose upgrade
await substrate.evolution.plans();                // List plans
await substrate.evolution.review('plan-id');      // Review plan
await substrate.evolution.apply('plan-id');       // Apply plan
await substrate.evolution.rollback('plan-id');    // Rollback
await substrate.evolution.archived();             // Scan archived
await substrate.evolution.implement('cascade-dream', 'dream.cycle');
```

---

## Response Format

All methods return a consistent response:

```typescript
interface SubstrateResponse<T> {
  success: boolean;
  module: string;
  action: string;
  data?: T;
  error?: string;
  timestamp: string;
}
```

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| IP (general) | 100 req / 5 min |
| IP (chat) | 20 req / 5 min |
| IP (dream) | 15 req / 5 min |
| Authenticated | 500 req / 5 min |
| Daily | 5000 req / day |

---

## Documentation

- [Developer Guide](./DEVELOPER-GUIDE.md) — Getting started
- [API Reference](./API-REFERENCE.md) — Complete action list
- [Examples](./examples/) — Code snippets

---

**CMPSBL® — Cognitive Substrate OS**  
*v4.0.0 — © 2025-2026 CMPSBL. All rights reserved.*
