# promptfluid® Substrate — SDK Guide

**v2026.01 — TypeScript SDK Usage Guide**

---

## Overview

The promptfluid® SDK provides ergonomic TypeScript helpers for interacting with the substrate. It wraps the unified API with type-safe module methods.

---

## Installation

The SDK is included in promptfluid® projects:

```typescript
import { substrate, brain, decode, defense, nexus, vision, dream, system } from '@/lib/substrate';
```

For standalone usage, copy `substrate-client.ts` to your project:

```bash
cp public/sdk/substrate-client.ts src/lib/
npm install @supabase/supabase-js
```

---

## Initialization

### Using Built-in Client

```typescript
import { brain, decode, defense, nexus, vision, dream, system } from '@/lib/substrate';

// Ready to use immediately
const health = await vision.health();
```

### Using Custom Client

```typescript
import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
});

// Set auth for authenticated operations
substrate.setAuthToken(userJwtToken);
```

---

## Brain Module

Memory and learning operations.

### Query Memories

```typescript
import { brain } from '@/lib/substrate';

// Search for memories
const result = await brain.query('machine learning', 10);

if (result.success) {
  console.log(result.data.memories);
}
```

### Store Memory

```typescript
await brain.remember(
  'Neural networks learn through backpropagation',
  'fact',
  { source: 'textbook', confidence: 0.95 }
);
```

### Reflect

```typescript
// Trigger daily reflection
const reflection = await brain.reflect();
console.log(reflection.data.insights);
```

### Reinforce Memory

```typescript
await brain.reinforce('memory-uuid', 0.1);
```

### Dream Cycle

```typescript
const dream = await brain.dream({ seed: 'creativity' });
```

### Knowledge Graph Summary

```typescript
const graph = await brain.graphSummary();
console.log(`Nodes: ${graph.data.node_count}`);
console.log(`Edges: ${graph.data.edge_count}`);
```

### Session Reflection

```typescript
// Reflect on last 24 hours of activity
const reflection = await brain.sessionReflection(24);
```

### Coherence Check

```typescript
// Validate memory coherence
const coherence = await brain.coherenceCheck('deep');
console.log(`Coherence score: ${coherence.data.overall_score}`);
```

---

## Decode Module

Human interface and conversation.

### Chat

```typescript
import { decode } from '@/lib/substrate';

const reply = await decode.chat(
  'What can you help me with?',
  'session_123'
);

console.log(reply.data.response);
```

### With Conversation History

```typescript
const reply = await decode.chat(
  'Tell me more',
  'session_123',
  [
    { role: 'user', content: 'What is the substrate?' },
    { role: 'assistant', content: 'The substrate is...' }
  ]
);
```

### Extract Intent

```typescript
const intent = await decode.intent('I need to analyze my website performance');
console.log(intent.data.intent); // "analyze_website"
console.log(intent.data.entities);
```

### Generate Dream

```typescript
const dream = await decode.dream({ mood: 'contemplative' });
```

---

## Defense Module

Security and threat analysis.

### Analyze Request

```typescript
import { defense } from '@/lib/substrate';

const analysis = await defense.analyze(
  {
    fingerprint: { canvas: '...', webgl: '...' },
    userAgent: 'Mozilla/5.0...'
  },
  '192.168.1.1'
);

if (analysis.data.is_bot) {
  console.log('Bot detected!');
}
```

### Check IP Reputation

```typescript
const reputation = await defense.reputation('192.168.1.1');
console.log(`Score: ${reputation.data.score}/100`);
```

### IP Intelligence

```typescript
const intel = await defense.ipIntel('192.168.1.1', true);
console.log(intel.data.threat_indicators);
console.log(intel.data.recommendations);
```

### Security Posture

```typescript
const posture = await defense.posture();
console.log(`Overall risk: ${posture.data.risk_level}`);
```

### Anomaly Detection

```typescript
const anomalies = await defense.anomalyProbe(24);
console.log(anomalies.data.detected_anomalies);
```

### Rate Limit Status

```typescript
const limits = await defense.limits();
console.log(limits.data.current_limits);
```

---

## Nexus Module

AI routing and generation.

### Route to Best Provider

```typescript
import { nexus } from '@/lib/substrate';

const response = await nexus.route(
  'Explain quantum computing in simple terms',
  'You are a helpful teacher'
);

console.log(response.data.response);
console.log(`Provider: ${response.data.provider}`);
```

### Text Generation

```typescript
const text = await nexus.text('Write a haiku about code', 'groq');
```

### Image Generation

```typescript
const image = await nexus.image('A surreal dreamscape with floating islands');
console.log(image.data.url);
```

### Provider Status

```typescript
const providers = await nexus.providers();
for (const [name, status] of Object.entries(providers.data.providers)) {
  console.log(`${name}: ${status.available ? 'online' : 'offline'}`);
}
```

### Route Statistics

```typescript
const stats = await nexus.routeStats();
console.log(`Calls today: ${stats.data.calls_24h}`);
```

---

## Vision Module

Observability and monitoring.

### Health Check

```typescript
import { vision } from '@/lib/substrate';

const health = await vision.health();
console.log(`Status: ${health.data.status}`);
for (const [module, status] of Object.entries(health.data.modules)) {
  console.log(`  ${module}: ${status}`);
}
```

### Quick Pulse

```typescript
// Ultra-lightweight heartbeat
const pulse = await vision.pulse();
console.log(`Alive: ${pulse.data.alive}`);
```

### System Metrics

```typescript
const metrics = await vision.metrics('24h');
console.log(metrics.data);
```

### Health Snapshot

```typescript
const snapshot = await vision.healthSnapshot();
```

### Introspection

```typescript
const intro = await vision.introspection();
console.log(intro.data.analysis);
```

### AI Quota

```typescript
const quota = await vision.quota();
console.log(`Used: ${quota.data.tokens_used}`);
console.log(`Remaining: ${quota.data.tokens_remaining}`);
```

### Dependency Map

```typescript
const deps = await vision.dependencyMap();
console.log(deps.data.modules);
console.log(deps.data.cascade_risks);
```

### Dashboard Data

```typescript
const dashboard = await vision.dashboard();
```

---

## Dream Module

Dream processing and autonomous cognition.

### Feed Dream

```typescript
import { dream } from '@/lib/substrate';

const result = await dream.feed(
  'I was floating through an endless library where every book contained a universe...',
  'dream'
);

console.log(result.data.accepted);
```

### Get State

```typescript
const state = await dream.state();
console.log(`Mood: ${state.data.current_mood}`);
console.log(`Mutation level: ${state.data.mutation_level}`);
```

### Run Cycle

```typescript
const cycle = await dream.cycle({ force: true });
```

### Awaken

```typescript
await dream.awaken('reset');
```

### Interpret Dream

```typescript
const interpretation = await dream.interpret(
  'Flying over a city made of glass'
);
console.log(interpretation.data.meaning);
```

### Mutate

```typescript
const mutation = await dream.mutate();
console.log(`New mutation level: ${mutation.data.level}`);
```

---

## System Module

Administration and configuration.

### System Status

```typescript
import { system } from '@/lib/substrate';

const status = await system.status();
console.log(status.data);
```

### Full Health

```typescript
const health = await system.health();
```

### Version

```typescript
const version = await system.version();
console.log(`Substrate v${version.data.version}`);
```

### Audit Log

```typescript
const audit = await system.audit({
  since: '2026-01-10',
  action_type: 'security'
});
```

### Backup

```typescript
const backup = await system.backup({
  include_data: true,
  tables: ['brain_memories']
});
console.log(`Backup ID: ${backup.data.backup_id}`);
```

### Heal

```typescript
await system.heal({ target: 'brain' });
```

### Restart Service

```typescript
await system.restart('nexus');
```

---

## Error Handling

```typescript
import { brain } from '@/lib/substrate';

const result = await brain.query('test');

if (!result.success) {
  console.error(`Error: ${result.error}`);
  console.error(`Code: ${result.code}`);
  return;
}

// Safe to use result.data
console.log(result.data);
```

### Type-Safe Response

```typescript
interface SubstrateResponse<T> {
  success: boolean;
  module: string;
  action: string;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
  substrate_version?: string;
}
```

---

## React Hooks

The substrate includes React hooks for reactive data:

```typescript
import { 
  useSystemStatus,
  useBrainStatusOS,
  useVisionHealthOS,
  useSubstrateHealthScore
} from '@/hooks/useSubstrateOS';

function Dashboard() {
  const { data: health, isLoading } = useVisionHealthOS();
  const { score, status } = useSubstrateHealthScore();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Health: {status}</p>
      <p>Score: {score}%</p>
    </div>
  );
}
```

### Mutation Hooks

```typescript
import { useBrainReflectOS, useBrainDreamOS } from '@/hooks/useSubstrateOS';

function Controls() {
  const reflectMutation = useBrainReflectOS();
  const dreamMutation = useBrainDreamOS();
  
  return (
    <>
      <button onClick={() => reflectMutation.mutate()}>
        Reflect
      </button>
      <button onClick={() => dreamMutation.mutate()}>
        Dream
      </button>
    </>
  );
}
```

---

## Best Practices

### 1. Use Module Imports

```typescript
// ✅ Good - import specific modules
import { brain, vision } from '@/lib/substrate';

// ❌ Avoid - importing everything
import * as substrate from '@/lib/substrate';
```

### 2. Handle Errors

```typescript
// ✅ Good - check success before using data
const result = await brain.query('test');
if (result.success) {
  doSomething(result.data);
}

// ❌ Avoid - assuming success
const result = await brain.query('test');
doSomething(result.data); // May be undefined!
```

### 3. Use Type Guards

```typescript
function isMemory(data: unknown): data is Memory {
  return data !== null && typeof data === 'object' && 'content' in data;
}
```

### 4. Batch When Possible

```typescript
// ✅ Good - parallel requests
const [health, metrics, status] = await Promise.all([
  vision.health(),
  vision.metrics('24h'),
  system.status()
]);

// ❌ Avoid - sequential requests
const health = await vision.health();
const metrics = await vision.metrics('24h');
const status = await system.status();
```

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
