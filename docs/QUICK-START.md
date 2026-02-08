# promptfluid® Substrate — Quick Start

**Get started with the Cognitive OS in 5 minutes**

*Version 8.0.0 SYNERGY+ — Updated 2026-02-08*

---

## 1. Basic Usage

```typescript
import { supabase } from '@/integrations/supabase/client';

// Call any module through the unified endpoint
const response = await supabase.functions.invoke('pf-substrate', {
  body: {
    module: 'brain',   // Which module to call
    action: 'query',   // What action to perform
    query_text: 'recent insights',  // Action parameters
    limit: 5
  }
});

console.log(response.data);
```

---

## 2. Using the SDK (Recommended)

```typescript
import { SubstrateClient } from '@/lib/substrate';

const substrate = new SubstrateClient();

// Type-safe module access
const memories = await substrate.brain.query('recent learnings');
const key = await substrate.access.createKey({ name: 'Production' });
await substrate.ripple.publish('memory.stored', { id: '123' });
```

---

## 3. Common Operations

### Store a Memory
```typescript
await substrate.call({
  module: 'brain',
  action: 'remember',
  content: 'Users prefer dark mode',
  memory_type: 'insight',
  confidence: 0.9
});
```

### Generate Text with AI
```typescript
await substrate.call({
  module: 'nexus',
  action: 'text',
  prompt: 'Explain quantum computing',
  max_tokens: 500
});
```

### Check System Health
```typescript
await substrate.call({
  module: 'vision',
  action: 'health_snapshot'
});
```

### Schedule a Job
```typescript
await substrate.call({
  module: 'core',
  action: 'schedule',
  target_module: 'brain',
  target_action: 'reflect',
  scheduled_at: '2026-01-24T00:00:00Z'
});
```

### Create an API Key
```typescript
await substrate.call({
  module: 'access',
  action: 'create_key',
  name: 'My Production Key',
  scopes: ['brain:read', 'nexus:write']
});
```

---

## 4. Module Cheat Sheet (14 Modules, 5 Layers)

### Kernel Layer

| Module | Purpose | Top Actions |
|--------|---------|-------------|
| **core** | Kernel | boot, schedule, config, shutdown, status |
| **ripple** | Message Bus | enqueue, publish, subscribe, status |
| **access** | Identity | create_key, validate_key, get_usage |

### Cognitive Layer

| Module | Purpose | Top Actions |
|--------|---------|-------------|
| **brain** | Memory | query, remember, reflect, dream |
| **decode** | Intent | chat, intent, learn |
| **nexus** | AI Router | route, providers, routeStats |

### Operational Layer

| Module | Purpose | Top Actions |
|--------|---------|-------------|
| **dream** | Evolution | cycle, feed, awaken |
| **defense** | Security | analyze, reputation, posture |
| **vision** | Observability | dashboard, health_snapshot, pulse |
| **integration** | Adapters | connect, discover, execute |

### Administrative Layer

| Module | Purpose | Top Actions |
|--------|---------|-------------|
| **system** | Admin | backup, restore, heal, diagnostics |
| **modernizer** | Self-Upgrade | scan, propose, apply |
| **inclusive** | Accessibility | scan_issues, fix_auto, coverage |

### Orchestrator Layer

| Module | Purpose | Top Actions |
|--------|---------|-------------|
| **cortex** | Agencies | create, deploy, cognitives |

---

## 5. Health Monitoring

Every module supports a `pulse` action for heartbeat checks:

```typescript
// Check all modules (14 total)
const modules = [
  // Kernel
  'core', 'ripple', 'access',
  // Cognitive
  'brain', 'decode', 'nexus',
  // Operational
  'dream', 'defense', 'vision', 'integration',
  // Administrative
  'system', 'modernizer', 'inclusive',
  // Orchestrator
  'cortex'
];

const health = await Promise.all(
  modules.map(module => 
    substrate.call({ module, action: 'pulse' })
  )
);
```

---

## 6. Error Handling

```typescript
try {
  const result = await substrate.call({
    module: 'brain',
    action: 'query',
    query_text: 'test'
  });
  
  if (result.graceful_fallback) {
    console.log('Module temporarily degraded');
  }
} catch (error) {
  console.error('Substrate error:', error);
}
```

---

## Next Steps

- [API Reference](./API-REFERENCE.md) — Complete action documentation
- [Architecture](./ARCHITECTURE.md) — System design deep-dive
- [Migration Guide](./MIGRATION-GUIDE.md) — Migrate from legacy functions

---

*promptfluid® — The Cognitive Substrate OS*
