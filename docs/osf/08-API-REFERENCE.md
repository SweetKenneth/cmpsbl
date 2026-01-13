# PromptFluid API Reference

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-API-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## API Overview

PromptFluid exposes functionality through Supabase Edge Functions, providing a serverless API layer with automatic scaling and global distribution.

### Base URL

```
https://{PROJECT_ID}.supabase.co/functions/v1/
```

### Authentication

All endpoints support three authentication modes:

| Mode | Header | Use Case |
|------|--------|----------|
| Anonymous | None | Public endpoints |
| JWT | `Authorization: Bearer {token}` | User-authenticated |
| Service | `Authorization: Bearer {service_role_key}` | Server-to-server |

---

## Brain Substrate APIs

### POST /pf-brain

Main orchestration endpoint for Brain interactions.

**Request:**
```json
{
  "action": "query" | "learn" | "reflect" | "dream",
  "payload": {
    "content": "string",
    "context": "object",
    "options": "object"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "string",
    "memories_used": ["uuid"],
    "confidence": 0.85,
    "metadata": {}
  }
}
```

### GET /pf-brain-status

Health and status check for Brain module.

**Response:**
```json
{
  "status": "healthy",
  "metrics": {
    "total_memories": 15420,
    "hot_memories": 2341,
    "cold_memories": 13079,
    "graph_edges": 8934,
    "learning_velocity": 0.73,
    "last_reflection": "2026-01-13T03:00:00Z",
    "last_dream": "2026-01-13T02:30:00Z"
  }
}
```

### POST /pf-brain-learn

Ingest new information into Brain memory.

**Request:**
```json
{
  "content": "string",
  "source": "string",
  "memory_type": "fact" | "insight" | "pattern" | "rule",
  "confidence": 0.8,
  "tags": ["tag1", "tag2"],
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "memory_id": "uuid",
  "edges_created": 3,
  "similar_memories": ["uuid"]
}
```

### POST /pf-brain-reflect

Trigger reflection cycle.

**Request:**
```json
{
  "reflection_type": "daily" | "weekly" | "on-demand",
  "focus_areas": ["domain1", "domain2"]
}
```

**Response:**
```json
{
  "reflection_id": "uuid",
  "summary": "string",
  "insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"],
  "patterns_detected": 5
}
```

### POST /pf-brain-dream

Initiate dream cycle.

**Request:**
```json
{
  "dream_type": "deep" | "twilight" | "light" | "micro",
  "seed_prompt": "string",
  "creativity": 0.9
}
```

**Response:**
```json
{
  "dream_id": "uuid",
  "dream_text": "string",
  "mood": "contemplative",
  "insights": ["insight1"],
  "connections_made": 12
}
```

### POST /pf-brain-reinforce

Reinforce memory edges based on outcomes.

**Request:**
```json
{
  "memory_id": "uuid",
  "outcome": "positive" | "negative" | "neutral",
  "reward_signal": 0.8,
  "context": {}
}
```

---

## Nexus Routing APIs

### POST /pf-nexus-router

Unified AI routing endpoint.

**Request:**
```json
{
  "prompt": "string",
  "task_type": "chat" | "code" | "analysis" | "creative" | "research",
  "model_preference": "string",
  "max_tokens": 2000,
  "temperature": 0.7,
  "stream": false
}
```

**Response:**
```json
{
  "success": true,
  "response": "string",
  "model_used": "groq/llama-3.3-70b",
  "provider": "groq",
  "tokens": {
    "input": 150,
    "output": 500,
    "total": 650
  },
  "latency_ms": 1234,
  "cost_usd": 0.00065
}
```

### POST /pf-nexus-text

Text generation endpoint.

**Request:**
```json
{
  "prompt": "string",
  "system_prompt": "string",
  "model": "auto" | "groq" | "openai" | "anthropic",
  "max_tokens": 2000,
  "temperature": 0.7
}
```

### POST /pf-nexus-image

Image generation endpoint.

**Request:**
```json
{
  "prompt": "string",
  "provider": "fal" | "replicate" | "openai",
  "model": "flux-pro" | "dall-e-3",
  "size": "1024x1024",
  "style": "vivid" | "natural"
}
```

**Response:**
```json
{
  "success": true,
  "image_url": "string",
  "provider": "fal",
  "model": "flux-pro",
  "generation_time_ms": 5432
}
```

### POST /pf-nexus-video

Video generation endpoint.

**Request:**
```json
{
  "prompt": "string",
  "duration": 5,
  "aspect_ratio": "16:9",
  "provider": "runway" | "fal"
}
```

---

## Defense Intelligence APIs

### POST /pf-bot-detection

Analyze request for bot characteristics.

**Request:**
```json
{
  "ip": "string",
  "user_agent": "string",
  "headers": {},
  "fingerprint": "string",
  "endpoint": "string",
  "behavioral_signals": {
    "mouse_movements": [],
    "keystroke_timing": [],
    "scroll_patterns": []
  }
}
```

**Response:**
```json
{
  "is_bot": false,
  "risk_score": 15,
  "action": "allow",
  "signals": {
    "header_score": 10,
    "behavior_score": 5,
    "reputation_score": 20,
    "fingerprint_score": 10
  },
  "recommendation": "allow"
}
```

### POST /pf-defense-event

Log security event.

**Request:**
```json
{
  "ip": "string",
  "endpoint": "string",
  "action": "allow" | "block" | "challenge",
  "risk_score": 75,
  "reason": "string",
  "metadata": {}
}
```

### GET /pf-defense-rules

Retrieve active defense rules.

**Response:**
```json
{
  "rules": [
    {
      "id": "uuid",
      "rule_name": "string",
      "pattern": "string",
      "action": "block",
      "threshold": 80,
      "priority": 10,
      "is_active": true
    }
  ]
}
```

### POST /pf-defense-ip-reputation

Update IP reputation.

**Request:**
```json
{
  "ip": "string",
  "action": "increment_block" | "decrement_score" | "reset",
  "amount": 5
}
```

---

## Cascade Operative APIs

### POST /pf-cascade-operative

Main operative endpoint.

**Request:**
```json
{
  "action": "learn" | "report" | "dream" | "analyze",
  "payload": {}
}
```

**Response:**
```json
{
  "success": true,
  "cycle_id": "uuid",
  "signals_detected": 5,
  "threats_identified": 1,
  "reports_generated": 2,
  "next_cycle": "2026-01-13T12:15:00Z"
}
```

### POST /pf-cascade-chat

Conversational interface.

**Request:**
```json
{
  "message": "string",
  "session_id": "string",
  "context": {}
}
```

**Response:**
```json
{
  "reply": "string",
  "session_id": "string",
  "memories_accessed": 3,
  "confidence": 0.92
}
```

### POST /pf-cascade-dream

Trigger dream generation.

**Request:**
```json
{
  "seed": "string",
  "dream_type": "deep" | "twilight" | "light"
}
```

### POST /pf-cascade-learn

Ingest learning material.

**Request:**
```json
{
  "content": "string",
  "source": "string",
  "domain": "string",
  "priority": 5
}
```

---

## Vision Observability APIs

### GET /pf-vision-metrics

Retrieve system metrics.

**Response:**
```json
{
  "brain": {
    "health_score": 0.95,
    "memories": 15420,
    "learning_velocity": 0.73
  },
  "defense": {
    "events_today": 1234,
    "blocks_today": 89,
    "threat_level": "low"
  },
  "nexus": {
    "calls_today": 5678,
    "success_rate": 0.987,
    "avg_latency_ms": 450
  }
}
```

### GET /pf-vision-health

System health check.

**Response:**
```json
{
  "status": "healthy",
  "modules": {
    "brain": "healthy",
    "defense": "healthy",
    "nexus": "healthy",
    "cascade": "healthy"
  },
  "database": "connected",
  "edge_functions": "operational",
  "last_check": "2026-01-13T12:00:00Z"
}
```

---

## Utility APIs

### POST /pf-email-sender

Send transactional email.

**Request:**
```json
{
  "to": "email@example.com",
  "subject": "string",
  "html": "string",
  "from_name": "PromptFluid"
}
```

### POST /pf-webhook-receiver

Generic webhook receiver.

**Request:**
```json
{
  "source": "string",
  "event_type": "string",
  "payload": {}
}
```

---

## Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Brain APIs | 100 | 1 minute |
| Nexus APIs | 60 | 1 minute |
| Defense APIs | 1000 | 1 minute |
| Vision APIs | 30 | 1 minute |
| Cascade APIs | 50 | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705152000
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| AUTH_INVALID | 401 | Invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Rate limit exceeded |
| VALIDATION_ERROR | 400 | Invalid request payload |
| INTERNAL_ERROR | 500 | Internal server error |
| PROVIDER_ERROR | 502 | Upstream provider error |

---

## Webhooks

### Outbound Webhook Events

| Event | Trigger |
|-------|---------|
| brain.memory.created | New memory stored |
| brain.reflection.completed | Reflection cycle complete |
| brain.dream.generated | Dream cycle complete |
| defense.threat.detected | High-risk event |
| defense.block.issued | Request blocked |
| nexus.quota.warning | Quota 80% consumed |
| cascade.report.sent | Report dispatched |

### Webhook Payload

```json
{
  "event": "brain.memory.created",
  "timestamp": "2026-01-13T12:00:00Z",
  "data": {},
  "signature": "sha256=..."
}
```

---

## SDKs & Client Libraries

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Call Brain API
const { data, error } = await supabase.functions.invoke('pf-brain', {
  body: { action: 'query', payload: { content: 'Hello' } }
});
```

### Python

```python
from supabase import create_client

supabase = create_client(url, key)

response = supabase.functions.invoke(
    'pf-brain',
    {'action': 'query', 'payload': {'content': 'Hello'}}
)
```

---

**See Also:**
- [Edge Function Catalog](./06-EDGE-FUNCTIONS.md)
- [Database Schema](./07-DATABASE-SCHEMA.md)
- [Extension Guide](./09-EXTENSION-GUIDE.md)
