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

| Module | Purpose | Deployed Actions |
|--------|---------|------------------|
| **brain** | Memory, learning, reflection | `query`, `remember`, `reflect`, `reinforce`, `dream`, `status`, `graphSummary`, `sessionReflection` |
| **decode** | Chat, intent, dreams | `chat`, `intent`, `dream`, `learn`, `status` |
| **defense** | Security, bots | `analyze`, `reputation`, `anomaly`, `anomalyProbe`, `limits`, `posture`, `status` |
| **nexus** | AI routing | `route`, `providers`, `routeStats`, `status` |
| **vision** | Observability | `health`, `healthSnapshot`, `dashboard`, `trace`, `introspection`, `pulse`, `quota`, `metrics`, `logs`, `alert`, `audit`, `monitor`, `resilience`, `analytics` |
| **dream** | Dream-Eater | `cycle`, `awaken`, `feed` |
| **system** | Administration | `status`, `health`, `heal`, `backup`, `restore`, `audit`, `version`, `diagnostics`, `restart` |

---

## Module: Brain

The cognitive memory system. Store, query, and evolve knowledge.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Check module health | — | ✅ Deployed |
| `query` | Search memories | `query_text`, `limit?` | ✅ Deployed |
| `remember` | Store new memory | `content`, `memory_type`, `confidence?`, `metadata?` | ✅ Deployed |
| `reflect` | Generate daily reflection | — | ✅ Deployed |
| `reinforce` | Boost memory confidence | `memory_id`, `boost?` | ✅ Deployed |
| `dream` | Run dream cycle | — | ✅ Deployed |
| `learn` | Ingest knowledge (via decode) | `content`, `source?` | ✅ Deployed |
| `graphSummary` | Knowledge graph structure | — | ✅ Deployed |
| `sessionReflection` | Cross-module activity reflection | `hours?` | ✅ Deployed |
| `coldMigrate` | Move memories to cold storage | — | ✅ Deployed (standalone) |

**Note:** Actions like `recall`, `synthesize`, `train`, `optimize`, `deepThink`, `hypothesisTest`, `cognitiveCycle`, `continuousLearn`, `forecast`, `graphBuild` are planned but not yet deployed via substrate.

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

Conversational AI with intent decoding. Epistemic translation layer for the substrate.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Check module health | — | ✅ Deployed |
| `chat` | Process message | `message`, `sessionId?`, `conversationHistory?` | ✅ Deployed |
| `intent` | Extract structured intent | `message` | ✅ Deployed |
| `dream` | Initiate dream cycle | — | ✅ Deployed |
| `learn` | Learn from interaction | `content`, `source?` | ✅ Deployed |

**Note:** Actions like `propose`, `reflect`, `summary` are planned but not yet deployed via substrate.

### Examples

**Chat:**
```json
{
  "module": "decode",
  "action": "chat",
  "payload": {
    "message": "What can you help me with?",
    "sessionId": "sess_abc123"
  }
}
```

**Extract Intent:**
```json
{
  "module": "decode",
  "action": "intent",
  "payload": {
    "message": "I need to analyze my website performance"
  }
}
```

---

## Module: Defense

Security layer for bot detection and threat analysis.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Check module health | — | ✅ Deployed |
| `analyze` | Analyze request for threats | `ip_address`, `user_agent?`, `page_url?` | ✅ Deployed |
| `reputation` | Get IP reputation score | `ip_address` | ✅ Deployed |
| `anomaly` | Detect anomalies | `timeWindow?` | ✅ Deployed |
| `anomalyProbe` | Statistical z-score detection | `lookbackHours?` | ✅ Deployed |
| `limits` | Unified rate limit status | — | ✅ Deployed |
| `posture` | Consolidated security posture | — | ✅ Deployed |

**Note:** Actions like `report`, `rules`, `block`, `unblock`, `threatFeed`, `rateLimit` are planned but not yet deployed via substrate.

### Examples

**Analyze Request:**
```json
{
  "module": "defense",
  "action": "analyze",
  "payload": {
    "ip_address": "192.168.1.1",
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

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Check available providers | — | ✅ Deployed |
| `route` | Route to best provider | `prompt`, `systemPrompt?`, `temperature?` | ✅ Deployed |
| `providers` | Provider availability matrix | — | ✅ Deployed |
| `routeStats` | AI routing analytics (24h) | — | ✅ Deployed |

**Note:** Actions like `text`, `image`, `video`, `embed`, `transcribe` are available via standalone edge functions but not yet in the substrate.

### Provider Priority
1. Groq (llama-3.3-70b-versatile) — fastest
2. Cerebras (llama-3.3-70b) — fallback
3. Together (Llama-3.1-70B) — tertiary
4. DeepSeek (deepseek-chat) — final fallback

### Examples

**Route to Best Provider:**
```json
{
  "module": "nexus",
  "action": "route",
  "payload": {
    "prompt": "Explain quantum computing in simple terms"
  }
}
```

**Check Providers:**
```json
{
  "module": "nexus",
  "action": "providers",
  "payload": {}
}
```

---

## Module: Vision

Observability, metrics, and health monitoring.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Check module health | — | ✅ Deployed |
| `health` | Overall system health | — | ✅ Deployed |
| `healthSnapshot` | Quick consolidated health | — | ✅ Deployed |
| `metrics` | System-wide metrics | — | ✅ Deployed |
| `logs` | Recent logs | `module?`, `limit?` | ✅ Deployed |
| `alert` | Create alert | `severity`, `message` | ✅ Deployed |
| `dashboard` | Dashboard data | — | ✅ Deployed |
| `trace` | Distributed tracing | `traceId?`, `create?`, `module?`, `action?`, `duration_ms?` | ✅ Deployed |
| `audit` | Audit log query | `entity?`, `action?` | ✅ Deployed |
| `monitor` | Ecosystem health monitoring | — | ✅ Deployed |
| `resilience` | Resilience framework probe | — | ✅ Deployed |
| `analytics` | Threat analytics (24h) | — | ✅ Deployed |
| `introspection` | Deep substrate self-analysis | — | ✅ Deployed |
| `pulse` | Ultra-lightweight heartbeat | — | ✅ Deployed |
| `quota` | AI usage quota observability | — | ✅ Deployed |

### Examples

**Check Health:**
```json
{
  "module": "vision",
  "action": "health",
  "payload": {}
}
```

**Get Dashboard:**
```json
{
  "module": "vision",
  "action": "dashboard",
  "payload": {}
}
```

---

## Module: Dream

Dream-Eater operations for autonomous cognition.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `cycle` | Execute dream cycle | `force?`, `send_email?` | ✅ Deployed |
| `awaken` | Awaken Dream-Eater | `action?` | ✅ Deployed |
| `feed` | Submit dream for consumption | `dream_content`, `dream_type?` | ✅ Deployed |

**Note:** Actions like `status`, `interpret`, `mutation`, `consume`, `reflect`, `mood` are planned but not yet deployed via substrate.

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

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Check system status | — | ✅ Deployed |
| `health` | Full system health | — | ✅ Deployed |
| `diagnostics` | Comprehensive diagnostics | — | ✅ Deployed |
| `heal` | Full heal system | `target?`, `force?` | ✅ Deployed |
| `backup` | Create validated backup | `include_data?`, `tables?` | ✅ Deployed |
| `restore` | Restore from backup | `backup_id`, `validate_only?` | ✅ Deployed |
| `audit` | System audit | — | ✅ Deployed |
| `version` | Get substrate version | — | ✅ Deployed |
| `restart` | Restart services | `service?` | ✅ Deployed |

**Note:** Actions like `config`, `shutdown` are planned but not yet deployed via substrate.

### Examples

**Check System Status:**
```json
{
  "module": "system",
  "action": "status",
  "payload": {}
}
```

**Trigger Heal:**
```json
{
  "module": "system",
  "action": "heal",
  "payload": {
    "target": "brain",
    "force": true
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
