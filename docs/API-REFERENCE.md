# promptfluid® Substrate — API Reference

**v2026.10 | Complete Cognitive OS API**

---

## Quick Start

```typescript
import { supabase } from '@/integrations/supabase/client';

// All operations route through the unified substrate endpoint
const response = await supabase.functions.invoke('pf-substrate', {
  body: {
    module: 'brain',
    action: 'query',
    query_text: 'recent learnings',
    limit: 5
  }
});
```

---

## 11 Modules — Complete Reference

### CORE (The Kernel)

The central orchestrator managing scheduling, lifecycle, and system state.

| Action | Description | Parameters |
|--------|-------------|------------|
| `boot` | Initialize all modules | `{ validate?: boolean }` |
| `shutdown` | Graceful system shutdown | `{ reason?: string }` |
| `schedule` | Queue a job | `{ module, action, payload, priority?, scheduled_at? }` |
| `cancel` | Cancel a scheduled job | `{ job_id }` |
| `status` | Get kernel state | `{}` |
| `config` | Get/set configuration | `{ key?, value? }` |
| `pulse` | Heartbeat check | `{}` |

**Example:**
```typescript
await substrate.call({ 
  module: 'core', 
  action: 'schedule',
  module: 'brain',
  action: 'reflect',
  scheduled_at: '2026-01-24T00:00:00Z'
});
```

---

### BRAIN (Memory & Learning)

Cognitive memory management, learning cycles, and knowledge synthesis.

| Action | Description | Parameters |
|--------|-------------|------------|
| `query` | Search memories | `{ query_text, limit? }` |
| `remember` | Store new memory | `{ content, memory_type, confidence? }` |
| `reflect` | Generate reflection | `{ depth? }` |
| `reinforce` | Boost memory confidence | `{ memory_id, boost? }` |
| `dream` | Autonomous processing | `{}` |
| `train` | Train on data | `{ data, source? }` |
| `cognitive_cycle` | Full learning cycle | `{}` |
| `deep_think` | Deep reasoning | `{ question, context? }` |
| `hypothesis_test` | Test hypothesis | `{ claim, strategy }` |
| `pulse` | Heartbeat check | `{}` |

**Example:**
```typescript
await substrate.call({ 
  module: 'brain', 
  action: 'remember',
  content: 'Users prefer dark mode interfaces',
  memory_type: 'insight',
  confidence: 0.85
});
```

---

### DECODE (Intent Interpreter)

Human-compatible intent extraction and conversation management.

| Action | Description | Parameters |
|--------|-------------|------------|
| `interpret` | Extract intent from text | `{ text, context? }` |
| `chat` | Conversational interface | `{ message, session_id? }` |
| `apply` | Apply proposal | `{ proposal_id }` |
| `learn` | Learn from interaction | `{ interaction_data }` |
| `pulse` | Heartbeat check | `{}` |

---

### DEFENSE (Security & Protection)

Bot detection, threat analysis, and security enforcement.

| Action | Description | Parameters |
|--------|-------------|------------|
| `analyze` | Analyze request | `{ ip, user_agent, fingerprint? }` |
| `detect` | Bot detection | `{ request_data }` |
| `block` | Block threat | `{ ip, reason? }` |
| `stats` | Security statistics | `{ timeframe? }` |
| `reputation` | IP reputation check | `{ ip }` |
| `pulse` | Heartbeat check | `{}` |

---

### NEXUS (AI Router)

Multi-provider AI routing with automatic failover.

| Action | Description | Parameters |
|--------|-------------|------------|
| `text` | Generate text | `{ prompt, provider?, model?, max_tokens? }` |
| `image` | Generate image | `{ prompt, size?, style? }` |
| `video` | Generate video | `{ prompt, duration? }` |
| `embed` | Generate embeddings | `{ text }` |
| `pulse` | Heartbeat check | `{}` |

**Providers:** groq, cerebras, together, deepseek, openai, anthropic

---

### VISION (Observability)

System health, metrics, dashboards, and distributed tracing.

| Action | Description | Parameters |
|--------|-------------|------------|
| `dashboard` | Full dashboard data | `{}` |
| `health_snapshot` | Health overview | `{}` |
| `trace` | Distributed trace | `{ trace_id?, operation? }` |
| `analytics` | Analytics data | `{ timeframe? }` |
| `monitor` | Monitor status | `{}` |
| `resilience` | Resilience metrics | `{}` |
| `pulse` | Heartbeat check | `{}` |

---

### DREAM (Autonomous Processing)

Dream cycles, mutations, and autonomous evolution.

| Action | Description | Parameters |
|--------|-------------|------------|
| `cycle` | Dream cycle | `{}` |
| `reflect` | Dream reflection | `{}` |
| `mutation` | Trigger mutation | `{ mutation_type? }` |
| `interpret` | Interpret dream | `{ dream_id }` |
| `feed` | Feed dream content | `{ content }` |
| `pulse` | Heartbeat check | `{}` |

---

### RIPPLE (Message Bus)

Async job processing, pub/sub messaging, event sourcing.

| Action | Description | Parameters |
|--------|-------------|------------|
| `enqueue` | Add job to queue | `{ queue_name, payload, priority? }` |
| `dequeue` | Get next job | `{ queue_name }` |
| `publish` | Publish event | `{ topic, event_type, payload }` |
| `subscribe` | Subscribe to topic | `{ topic, module, action }` |
| `status` | Queue statistics | `{}` |
| `pulse` | Heartbeat check | `{}` |

**Example:**
```typescript
// Publish event
await substrate.call({
  module: 'ripple',
  action: 'publish',
  topic: 'memory.stored',
  event_type: 'new_memory',
  payload: { memory_id: '...' }
});

// Subscribe to events
await substrate.call({
  module: 'ripple',
  action: 'subscribe',
  topic: 'memory.stored',
  module: 'dream',
  action: 'process'
});
```

---

### ACCESS (Identity & Billing)

API key management, quotas, usage metering.

| Action | Description | Parameters |
|--------|-------------|------------|
| `create_key` | Generate API key | `{ name, scopes?, rate_limit? }` |
| `validate_key` | Validate API key | `{ api_key }` |
| `revoke_key` | Revoke API key | `{ key_id }` |
| `list_keys` | List all keys | `{}` |
| `get_usage` | Get usage stats | `{ start_date?, end_date? }` |
| `check_quota` | Check remaining quota | `{ api_key_id }` |
| `pulse` | Heartbeat check | `{}` |

---

### SYSTEM (Administration)

Diagnostics, backup/restore, and system management.

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | System status | `{}` |
| `diagnostics` | Full diagnostics | `{}` |
| `backup` | Create backup | `{ include_data? }` |
| `restore` | Restore from backup | `{ backup_id }` |
| `heal` | Trigger healing | `{ target? }` |
| `shutdown` | Emergency shutdown | `{ reason }` |
| `pulse` | Heartbeat check | `{}` |

---

### MODERNIZER (Self-Evolution)

Codebase analysis, evolution proposals, self-improvement.

| Action | Description | Parameters |
|--------|-------------|------------|
| `scan` | Scan codebase | `{ depth? }` |
| `propose` | Generate proposals | `{ focus? }` |
| `implement` | Implement proposal | `{ proposal_id }` |
| `apply` | Apply changes | `{ changes }` |
| `rollback` | Rollback changes | `{ checkpoint_id }` |
| `pulse` | Heartbeat check | `{}` |

---

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "module": "brain",
  "action": "query",
  "latency_ms": 45,
  "timestamp": "2026-01-23T12:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "graceful_fallback": false,
  "health": {
    "brain": { "score": 95, "status": "healthy" }
  }
}
```

---

## Rate Limits

| Tier | Requests/min | Requests/day | Tokens/day |
|------|--------------|--------------|------------|
| Free | 60 | 1,000 | 100,000 |
| Starter | 200 | 10,000 | 1,000,000 |
| Pro | 1,000 | 100,000 | 10,000,000 |
| Enterprise | Custom | Custom | Custom |

---

## SDK Usage

```typescript
import { SubstrateClient } from '@/lib/substrate';

const substrate = new SubstrateClient();

// Core (kernel)
await substrate.core.boot();
await substrate.core.schedule({ module: 'brain', action: 'reflect', delay: '5m' });

// Brain (memory)
await substrate.brain.query('recent insights');
await substrate.brain.remember('New learning', 'insight');

// Ripple (messaging)
await substrate.ripple.publish('memory.stored', { id: '...' });
await substrate.ripple.enqueue('process_queue', { data: '...' });

// Access (identity)
const key = await substrate.access.createKey({ name: 'Production' });
const usage = await substrate.access.getUsage();
```

---

*promptfluid® — The Cognitive Substrate OS*  
*© 2025-2026 promptfluid. All rights reserved.*
