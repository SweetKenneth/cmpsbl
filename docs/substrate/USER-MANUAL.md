# CMPSBL Substrate — User Manual

**v10.5.4 — ARCHITECT Epoch (21-Module Cognitive Orchestration Substrate)**

*Last Updated: 2026-02-19*

---

## What is the Substrate?

The CMPSBL Substrate is a unified API gateway for cognitive AI operations. It provides:

- **Memory & Learning** — 3-tier persistent memory (Hot/Warm/Cold), knowledge graphs, learning cycles
- **Conversational AI** — Intent decoding, epistemic translation, dream generation
- **Security** — Bot detection, threat analysis, behavioral firewalls
- **AI Routing** — Multi-provider model selection with intelligent failover
- **Observability** — Real-time health, distributed tracing, audit logs
- **Dream Processing** — Autonomous cognition cycles for pattern extraction
- **Kernel Operations** — Job scheduling, lifecycle management, state machine
- **Message Bus** — Async queues, pub/sub, event sourcing
- **Identity & Billing** — API keys, quotas, usage metering
- **Enterprise Integration** — 35+ adapters for external systems with LLM governance
- **Self-Evolution** — SEBA (Self-Evolving Bounded Agent) for autonomous improvement
- **120 Synergy Pipelines** — Cross-module orchestration with 98 custom executors
- **156 Deployed Actions** — Comprehensive module coverage with v7.5.0 enhancements

All capabilities are accessed through a single endpoint.

---

## v7.5.0 New Capabilities

This version adds **42 new production-grade functions** across modules:

### BRAIN — Query Optimization & Consolidation
```json
{
  "module": "brain",
  "action": "query_optimize",
  "payload": { "query": "user preferences", "use_cache": true }
}
```

### NEXUS — Load Balancing
```json
{
  "module": "nexus",
  "action": "load_balance",
  "payload": { "task_type": "text", "strategy": "weighted" }
}
```

### DEFENSE — Behavioral Analysis
```json
{
  "module": "defense",
  "action": "behavioral_score",
  "payload": { "entity_id": "user_123", "entity_type": "user" }
}
```

### CORTEX — Workflow Engine
```json
{
  "module": "cortex",
  "action": "workflow_execute",
  "payload": {
    "workflow_id": "data-enrichment",
    "context": { "userId": "123" }
  }
}
```

### SYSTEM — Dependency Graph
```json
{
  "module": "system",
  "action": "dependency_graph",
  "payload": { "target": "brain" }
}
```

### VISION — Alert Management
```json
{
  "module": "vision",
  "action": "alert_create",
  "payload": {
    "severity": "warning",
    "message": "High memory usage",
    "source": "brain"
  }
}
```

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
| **core** | Kernel (scheduler, lifecycle, routing) | `boot`, `schedule`, `config`, `shutdown`, `status` |
| **ripple** | Message Bus (async, pub/sub) | `enqueue`, `publish`, `subscribe`, `status` |
| **access** | Identity (API keys, billing) | `create_key`, `validate_key`, `get_usage`, `check_quota` |
| **brain** | Memory, learning, reflection | `query`, `remember`, `reflect`, `reinforce`, `dream`, `status` |
| **decode** | Chat, intent, dreams | `chat`, `intent`, `dream`, `learn`, `status` |
| **defense** | Security, bots | `analyze`, `reputation`, `anomaly`, `posture`, `limits`, `status` |
| **nexus** | AI routing | `route`, `providers`, `routeStats`, `status` |
| **vision** | Observability | `health`, `healthSnapshot`, `dashboard`, `pulse`, `introspection` |
| **dream** | Dream-Eater | `cycle`, `awaken`, `feed` |
| **system** | Administration | `status`, `health`, `heal`, `backup`, `restore`, `diagnostics` |
| **modernizer** | Self-upgrade | `scan`, `propose`, `apply`, `status` |
| **integration** | Enterprise adapters | `adapters`, `connect`, `discover`, `execute`, `governance` |
| **inclusive** | Accessibility | `scan`, `repair`, `validate`, `profile` |
| **cortex** | Orchestration | `workflow_execute`, `propose`, `evaluate` |
| **encode** | Code execution | `generate`, `validate`, `execute`, `mastery` |
| **memory** | Vector store / RAG | `store`, `search`, `staleness`, `reembed` |
| **relay** | Webhooks | `send`, `verify`, `retry_config` |
| **audit** | Compliance logging | `log`, `query`, `compliance_report`, `compress` |
| **identity** | Actor attribution | `attribute`, `reputation`, `portable_token`, `verify_token` |
| **economy** | Cost tracking | `track`, `forecast`, `attribution`, `budget` |
| **sandbox** | Safe execution | `create`, `execute`, `snapshot`, `restore`, `destroy` |

---

## Module: Core (Kernel)

The kernel that manages all other modules. Handles scheduling, routing, and lifecycle.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `boot` | Initialize all modules | — | ✅ Deployed |
| `schedule` | Queue jobs with priority | `module`, `action`, `delay?`, `payload?` | ✅ Deployed |
| `authorize` | Check permissions | `api_key`, `action` | ✅ Deployed |
| `route` | Forward to module | `module`, `action`, `payload` | ✅ Deployed |
| `config` | Get/set configuration | `key?`, `value?` | ✅ Deployed |
| `shutdown` | Graceful shutdown | `confirm` | ✅ Deployed |
| `status` | Get kernel status | — | ✅ Deployed |
| `pulse` | Heartbeat | — | ✅ Deployed |

### Examples

**Schedule a Job:**
```json
{
  "module": "core",
  "action": "schedule",
  "target_module": "brain",
  "target_action": "reflect",
  "delay": "5m"
}
```

---

## Module: Ripple (Message Bus)

Async job processing, pub/sub messaging, event sourcing.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `enqueue` | Add job to queue | `queue`, `job_type`, `payload` | ✅ Deployed |
| `dequeue` | Get next job | `queue` | ✅ Deployed |
| `publish` | Publish event | `topic`, `event_type`, `payload` | ✅ Deployed |
| `subscribe` | Subscribe to topic | `topic`, `subscriber_module`, `subscriber_action` | ✅ Deployed |
| `status` | Queue stats | — | ✅ Deployed |
| `pulse` | Heartbeat | — | ✅ Deployed |

### Examples

**Publish Event:**
```json
{
  "module": "ripple",
  "action": "publish",
  "topic": "memory.stored",
  "event_type": "new_insight",
  "payload": { "memory_id": "abc123" }
}
```

---

## Module: Access (Identity & Billing)

API key management, usage metering, quotas.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `create_key` | Generate new API key | `name`, `scopes?`, `expires_in_days?` | ✅ Deployed |
| `validate_key` | Validate API key | `api_key` | ✅ Deployed |
| `revoke_key` | Revoke API key | `key_id` | ✅ Deployed |
| `list_keys` | List developer's keys | `developer_id?` | ✅ Deployed |
| `get_usage` | Get usage stats | `start_date?`, `end_date?` | ✅ Deployed |
| `check_quota` | Check remaining quota | `api_key_id` | ✅ Deployed |
| `pulse` | Heartbeat | — | ✅ Deployed |

### Examples

**Create API Key:**
```json
{
  "module": "access",
  "action": "create_key",
  "name": "Production API",
  "scopes": ["brain:read", "nexus:write"]
}
```

---

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

## Module: Encode

Governed code execution engine with DECODE→ENCODE pipeline and graduated autonomy.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `generate` | Generate code from NL | `prompt`, `language?`, `context?` | ✅ Deployed |
| `validate` | Validate generated code | `code`, `rules?` | ✅ Deployed |
| `execute` | Execute in sandbox | `code`, `timeout_ms?` | ✅ Deployed |
| `mastery` | Get autonomy mastery scores | — | ✅ Deployed |
| `patterns` | Expert patterns library | `category?` | ✅ Deployed |
| `status` | Module health | — | ✅ Deployed |

---

## Module: Memory (Infrastructure)

Vector store, RAG, embedding staleness detection, relevance feedback.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `store` | Store vector embedding | `content`, `metadata?` | ✅ Deployed |
| `search` | Semantic vector search | `query`, `limit?`, `threshold?` | ✅ Deployed |
| `staleness` | Check embedding staleness | `threshold?` | ✅ Deployed |
| `reembed` | Re-embed stale vectors | `batch_size?` | ✅ Deployed |
| `status` | Module health | — | ✅ Deployed |

---

## Module: Relay (Infrastructure)

HMAC-signed webhooks with adaptive retry and jitter.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `send` | Send HMAC-signed webhook | `url`, `payload`, `secret?` | ✅ Deployed |
| `verify` | Verify inbound signature | `signature`, `payload`, `secret` | ✅ Deployed |
| `retry_config` | Configure retry policy | `endpoint`, `max_retries?`, `backoff?` | ✅ Deployed |
| `status` | Module health | — | ✅ Deployed |

---

## Module: Audit (Infrastructure)

Immutable compliance logging with framework-specific report generation.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `log` | Write immutable audit entry | `action`, `entity_type`, `entity_id?`, `details?` | ✅ Deployed |
| `query` | Query audit log | `entity_type?`, `action?`, `start?`, `end?` | ✅ Deployed |
| `compliance_report` | Generate compliance report | `framework` (soc2/gdpr/hipaa/iso27001) | ✅ Deployed |
| `compress` | Compress old entries | `older_than_days?` | ✅ Deployed |
| `status` | Module health | — | ✅ Deployed |

---

## Module: Identity (Infrastructure)

Actor attribution, reputation scoring, cross-agency identity portability.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `attribute` | Attribute action to actor | `actor_id`, `action`, `context?` | ✅ Deployed |
| `reputation` | Get/update reputation | `actor_id`, `signal?` | ✅ Deployed |
| `portable_token` | Generate portable identity JWT | `actor_id`, `target_agency?` | ✅ Deployed |
| `verify_token` | Verify portable JWT | `token` | ✅ Deployed |
| `status` | Module health | — | ✅ Deployed |

---

## Module: Economy (Infrastructure)

Cost tracking, predictive forecasting, per-capability cost attribution.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `track` | Track cost event | `capability`, `tokens?`, `cost_millicents?` | ✅ Deployed |
| `forecast` | Predictive cost forecast | `period?`, `confidence_level?` | ✅ Deployed |
| `attribution` | Per-capability cost breakdown | `period?`, `group_by?` | ✅ Deployed |
| `budget` | Get/set budget limits | `limit_cents?`, `alert_threshold?` | ✅ Deployed |
| `status` | Module health | — | ✅ Deployed |

---

## Module: Sandbox (Infrastructure)

Safe code execution with hard resource limits and snapshot/restore.

### Deployed Actions

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `create` | Create sandbox instance | `config?` | ✅ Deployed |
| `execute` | Execute code in sandbox | `sandbox_id`, `code`, `timeout_ms?` | ✅ Deployed |
| `snapshot` | Save sandbox state | `sandbox_id`, `label?` | ✅ Deployed |
| `restore` | Restore from snapshot | `snapshot_id` | ✅ Deployed |
| `destroy` | Destroy sandbox | `sandbox_id` | ✅ Deployed |
| `status` | Module health | — | ✅ Deployed |

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
// Brain operations - ✅ DEPLOYED
await brain.query('machine learning', 10);
await brain.remember('New fact', 'fact');
await brain.reflect();
await brain.graphSummary();
await brain.sessionReflection(24);

// Chat operations - ✅ DEPLOYED
await decode.chat('Hello!', 'session_123');
await decode.intent('Analyze my data');
await decode.learn('content', 'source');

// Security checks - ✅ DEPLOYED
await defense.analyze({ fingerprint: {...} });
await defense.reputation('192.168.1.1');
await defense.anomaly('1h');
await defense.posture();

// AI routing - ✅ DEPLOYED
await nexus.route('Complex task description');
await nexus.providers();
await nexus.routeStats();
// Note: text/image/video via standalone pf-nexus-* functions

// Health monitoring - ✅ DEPLOYED
await vision.health();
await vision.healthSnapshot();
await vision.dashboard();
await vision.pulse();

// Dream operations - ✅ DEPLOYED
await dream.feed('I was flying...', 'dream');
await dream.cycle(true);
await dream.awaken();

// System admin - ✅ DEPLOYED
await system.status();
await system.health();
await system.diagnostics();
await system.heal('brain', true);
```

---

## External Integrations (BYOK)

The substrate supports connecting external services with your own API keys.

### Supported Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| **Stripe** | Payments, subscriptions, billing | ✅ Available |
| **Twilio** | SMS, voice, messaging | ✅ Available |
| **Shopify** | E-commerce, products, orders | ✅ Available |
| **n8n** | Workflow automation | ✅ Available |
| **Webhooks** | Custom API connections | ✅ Available |

### Integration Examples

**Connect Stripe:**
```typescript
await substrate.integrations.connect({
  name: 'My Stripe',
  integration_type: 'stripe',
  config: { mode: 'live' },
  credentials: { api_key: 'sk_live_...' }
});

// Call Stripe API
await substrate.integrations.call('stripe-id', 'customers.create', {
  email: 'user@example.com'
});
```

**Connect Twilio:**
```typescript
await substrate.integrations.connect({
  name: 'SMS Service',
  integration_type: 'twilio',
  config: { from_number: '+1234567890' },
  credentials: { 
    account_sid: 'AC...',
    auth_token: '...'
  }
});

// Send SMS
await substrate.integrations.call('twilio-id', 'messages.create', {
  to: '+1987654321',
  body: 'Hello from substrate!'
});
```

**Connect Custom Webhook:**
```typescript
await substrate.integrations.connect({
  name: 'My API',
  integration_type: 'webhook',
  config: { 
    endpoint_url: 'https://api.example.com/webhook',
    method: 'POST'
  },
  credentials: { api_key: 'your-api-key' }
});
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
- **Architecture**: `docs/ARCHITECTURE.md`
- **Module Registry**: `docs/substrate/MODULE-ACTIONS-REGISTRY.md`
- **Quick Start**: `docs/QUICK-START.md`
- **Explained**: `docs/SUBSTRATE-EXPLAINED.md`

---

*promptfluid® — Cognitive Orchestration Substrate v10.5.4 ARCHITECT Epoch*
