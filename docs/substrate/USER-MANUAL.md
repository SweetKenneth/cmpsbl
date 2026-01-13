# promptfluid® Substrate — User Manual

**v2026.01 — Cognitive Orchestration Substrate**

---

## What is the Substrate?

The promptfluid® Substrate is a unified API gateway for cognitive AI operations. It provides:

- **Memory & Learning** — Store, retrieve, and evolve knowledge
- **Conversational AI** — Intent decoding and dream generation
- **Security** — Bot detection and threat analysis
- **AI Routing** — Multi-provider model selection
- **Observability** — Real-time health and metrics
- **Dream Processing** — Autonomous cognition cycles

All capabilities are accessed through a single endpoint.

---

## Quick Start

### API Endpoint

```
POST https://[project-id].supabase.co/functions/v1/pf-substrate
```

### Basic Request Format

```json
{
  "module": "brain",
  "action": "status",
  "payload": {}
}
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-13T..."
}
```

---

## Modules Overview

| Module | Purpose | Key Actions |
|--------|---------|-------------|
| **brain** | Memory, learning, reflection | `query`, `remember`, `reflect`, `reinforce`, `dream` |
| **decode** | Chat, intent, dreams | `chat`, `interpret`, `dream`, `proposal` |
| **defense** | Security, bots | `analyze`, `reputation`, `block`, `threats` |
| **nexus** | AI routing | `route`, `text`, `image`, `embed`, `audio` |
| **vision** | Observability | `health`, `metrics`, `alerts`, `trace` |
| **dream** | Dream-Eater | `consume`, `digest`, `mutate`, `synthesize`, `state` |
| **system** | Administration | `config`, `audit`, `secrets`, `backup`, `sync` |

---

## Module: Brain

The cognitive memory system. Store, query, and evolve knowledge.

### Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | Check module health | — |
| `query` | Search memories | `query_text`, `limit?`, `type?` |
| `remember` | Store new memory | `content`, `type`, `source?`, `confidence?` |
| `reflect` | Generate daily reflection | `date?` |
| `reinforce` | Boost memory confidence | `memory_id`, `reward` |
| `dream` | Run dream cycle | `seed?`, `mode?` |
| `forget` | Archive/decay memory | `memory_id`, `reason?` |
| `connect` | Link memories | `source_id`, `target_id`, `relation` |
| `prune` | Clean old data | `before_date`, `type?` |
| `compress` | Cold storage migration | `threshold?` |
| `curiosity` | Explore knowledge gaps | `domain?` |
| `forecast` | Predict trends | `metric`, `window?` |

### Examples

**Query Memories:**
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

**Store Memory:**
```json
{
  "module": "brain",
  "action": "remember",
  "payload": {
    "content": "Neural networks learn through backpropagation",
    "type": "fact",
    "source": "user_input",
    "confidence": 0.9
  }
}
```

**Run Reflection:**
```json
{
  "module": "brain",
  "action": "reflect",
  "payload": {}
}
```

---

## Module: Decode

Conversational AI with intent decoding. No persona, no emotions — pure epistemic translation.

### Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | Check module health | — |
| `chat` | Process message | `message`, `session_id?`, `context?` |
| `interpret` | Decode intent | `input`, `context?` |
| `describe` | Describe without asserting | `topic` |
| `reflect` | Self-reflection | `interaction_id?` |
| `dream` | Generate dream | `seed?`, `mood?` |
| `proposal` | Generate evolution proposal | `target`, `context` |
| `learn` | Learn from interaction | `interaction_id`, `outcome` |

### Examples

**Chat:**
```json
{
  "module": "decode",
  "action": "chat",
  "payload": {
    "message": "What can you help me with?",
    "session_id": "sess_abc123"
  }
}
```

**Interpret Intent:**
```json
{
  "module": "decode",
  "action": "interpret",
  "payload": {
    "input": "I need to analyze my website performance"
  }
}
```

---

## Module: Defense

Security layer for bot detection and threat analysis.

### Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | Check module health | — |
| `analyze` | Analyze request | `fingerprint`, `ip?`, `user_agent?` |
| `reputation` | Get IP reputation | `ip` |
| `block` | Block entity | `identifier`, `type`, `reason`, `duration?` |
| `unblock` | Remove block | `identifier`, `type` |
| `threats` | List recent threats | `since?`, `severity?` |
| `rules` | Manage detection rules | `action`, `rule?` |
| `fingerprint` | Analyze browser fingerprint | `data` |
| `ratelimit` | Check/set rate limits | `identifier`, `action?` |

### Examples

**Analyze Request:**
```json
{
  "module": "defense",
  "action": "analyze",
  "payload": {
    "fingerprint": { "canvas": "...", "webgl": "..." },
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Check Reputation:**
```json
{
  "module": "defense",
  "action": "reputation",
  "payload": {
    "ip": "192.168.1.1"
  }
}
```

---

## Module: Nexus

Multi-provider AI routing. Automatically selects the best model.

### Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | Check available providers | — |
| `route` | Route to best provider | `prompt`, `type?`, `priority?` |
| `text` | Text generation | `prompt`, `model?`, `max_tokens?` |
| `image` | Image generation | `prompt`, `size?`, `style?` |
| `embed` | Create embeddings | `text`, `model?` |
| `audio` | Text-to-speech | `text`, `voice?` |
| `transcribe` | Speech-to-text | `audio_url` |
| `vision` | Image analysis | `image_url`, `prompt?` |

### Provider Priority
1. Groq (llama-3.3-70b-versatile) — fastest
2. Cerebras (llama-3.3-70b) — fallback
3. Together (Llama-3.1-70B) — tertiary
4. DeepSeek (deepseek-chat) — final fallback

### Examples

**Generate Text:**
```json
{
  "module": "nexus",
  "action": "text",
  "payload": {
    "prompt": "Explain quantum computing in simple terms",
    "max_tokens": 500
  }
}
```

**Generate Image:**
```json
{
  "module": "nexus",
  "action": "image",
  "payload": {
    "prompt": "A surreal dreamscape with floating islands"
  }
}
```

---

## Module: Vision

Observability, metrics, and health monitoring.

### Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | Check module health | — |
| `health` | Overall system health | — |
| `metrics` | System-wide metrics | `period?`, `type?` |
| `alerts` | Active alerts | `severity?`, `since?` |
| `trace` | Request tracing | `trace_id` |
| `dashboard` | Dashboard data | `view?` |
| `logs` | Recent logs | `level?`, `limit?`, `module?` |

### Examples

**Check Health:**
```json
{
  "module": "vision",
  "action": "health",
  "payload": {}
}
```

**Get Metrics:**
```json
{
  "module": "vision",
  "action": "metrics",
  "payload": {
    "period": "24h",
    "type": "performance"
  }
}
```

---

## Module: Dream

Dream-Eater operations for autonomous cognition.

### Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | Check Dream-Eater state | — |
| `consume` | Ingest dream content | `content`, `type?`, `source?` |
| `digest` | Process ingested dreams | — |
| `mutate` | Run mutation cycle | `intensity?` |
| `synthesize` | Generate dream output | `seed?`, `mood?` |
| `state` | Get current state | — |
| `feed` | External dream submission | `dream_text`, `dream_type?` |
| `history` | Dream history | `limit?`, `type?` |

### Examples

**Feed Dream:**
```json
{
  "module": "dream",
  "action": "feed",
  "payload": {
    "dream_text": "I was floating through an endless library...",
    "dream_type": "dream"
  }
}
```

**Get State:**
```json
{
  "module": "dream",
  "action": "state",
  "payload": {}
}
```

---

## Module: System

Administrative operations.

### Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | Check system status | — |
| `config` | Get/set configuration | `key?`, `value?` |
| `audit` | Audit log | `since?`, `action_type?` |
| `secrets` | Manage secrets | `action`, `key?` |
| `backup` | Trigger backup | `type?` |
| `restore` | Restore from backup | `backup_id` |
| `sync` | Sync external systems | `target?` |
| `maintenance` | Maintenance mode | `enabled`, `reason?` |

### Examples

**Get Configuration:**
```json
{
  "module": "system",
  "action": "config",
  "payload": {
    "key": "rate_limits"
  }
}
```

**View Audit Log:**
```json
{
  "module": "system",
  "action": "audit",
  "payload": {
    "since": "2026-01-12",
    "action_type": "security"
  }
}
```

---

## Authentication

### Public Endpoints
Some actions are public:
- All `status` actions
- `vision.health`
- `dream.feed` (rate-limited)

### Authenticated Endpoints
Most actions require authentication via:
```
Authorization: Bearer <supabase-jwt>
```

Or using the Supabase client SDK:
```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke('pf-substrate', {
  body: { module: 'brain', action: 'query', payload: { query_text: 'test' } }
});
```

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| IP (general) | 100 req / 5 min |
| IP (chat) | 20 req / 5 min |
| IP (dream feed) | 15 req / 5 min |
| Authenticated | 500 req / 5 min |
| Daily per account | 5000 req / day |

Exceeding limits returns `429 Too Many Requests`.

---

## Error Responses

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Invalid request (missing module/action) |
| `401` | Unauthorized |
| `403` | Forbidden (blocked) |
| `404` | Unknown module or action |
| `422` | Validation failed |
| `429` | Rate limit exceeded |
| `500` | Internal error |

Error response format:
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "timestamp": "2026-01-13T..."
}
```

---

## TypeScript SDK

### Installation

The SDK is included in promptfluid® projects:

```typescript
import { substrate, brain, decode, defense, nexus, vision, dream, system } from '@/lib/substrate';
```

### Module Helpers

```typescript
// Brain operations
await brain.query('machine learning', 10);
await brain.remember('New fact', 'fact');
await brain.reflect();

// Chat operations
await decode.chat('Hello!', 'session_123');
await decode.interpret('Analyze my data');

// Security checks
await defense.analyze({ fingerprint: {...} });
await defense.reputation('192.168.1.1');

// AI routing
await nexus.text('Generate summary');
await nexus.image('A cosmic dream');

// Health monitoring
await vision.health();
await vision.metrics('24h');

// Dream operations
await dream.feed('I was flying...', 'dream');
await dream.state();

// System admin
await system.config();
await system.audit();
```

### React Hooks

```typescript
import { 
  useBrainStatus, 
  useDecodeChat, 
  useVisionHealth,
  useSubstrateHealth 
} from '@/hooks/useSubstrate';

function Dashboard() {
  const { data: health } = useVisionHealth();
  const { modules, healthScore } = useSubstrateHealth();
  const { messages, sendMessage } = useDecodeChat();
  
  return (
    <div>
      <p>System Health: {healthScore}%</p>
      <p>Brain: {modules.brain?.active ? 'Active' : 'Inactive'}</p>
    </div>
  );
}
```

---

## Best Practices

1. **Always check status first** — Verify module health before heavy operations
2. **Use session IDs** — For chat continuity, always pass `session_id`
3. **Handle rate limits** — Implement exponential backoff on 429
4. **Batch operations** — Use single requests with arrays when possible
5. **Monitor via Vision** — Set up alerts for system degradation
6. **Use typed payloads** — Leverage TypeScript types for validation

---

## Security Notes

- All inputs are sanitized for XSS/injection
- Script tags and HTML are stripped
- Jailbreak patterns are logged but handled gracefully
- All security events are audited
- Rate limiting is enforced per-IP and per-account

---

## Support

- **Documentation**: This manual
- **Architecture**: `docs/substrate/ARCHITECTURE.md`
- **Module Registry**: `docs/substrate/MODULE-ACTIONS-REGISTRY.md`
- **Decode RFC**: `docs/substrate/DecodeRFC.md`

---

*promptfluid® — Cognitive Orchestration Substrate v2026.01*
