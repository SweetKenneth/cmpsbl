# promptfluid® Substrate — API Reference

**v2026.01 — Usage Documentation**

---

## Endpoint

```
POST https://[your-project].supabase.co/functions/v1/pf-substrate
```

---

## Request Format

```json
{
  "module": "brain|decode|defense|nexus|vision|dream|system",
  "action": "<action-name>",
  "payload": { /* action parameters */ }
}
```

---

## Response Format

```json
{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { /* action-specific response */ },
  "timestamp": "2026-01-16T..."
}
```

---

## Module: Brain

Memory, learning, and knowledge operations.

| Action | Description | Parameters |
|--------|-------------|------------|
| `query` | Search memories | `query_text: string`, `limit?: number` |
| `remember` | Store memory | `content: string`, `type: string`, `confidence?: number` |
| `learn` | Ingest knowledge | `content: string`, `source?: string` |
| `reflect` | Trigger reflection | — |
| `reinforce` | Boost memory | `memory_id: string`, `boost?: number` |
| `graphSummary` | Knowledge graph stats | — |
| `synthesize` | Cross-domain insights | — |

---

## Module: Decode

Conversational AI and intent decoding.

| Action | Description | Parameters |
|--------|-------------|------------|
| `chat` | Process message | `message: string`, `session_id?: string` |
| `intent` | Extract intent | `message: string` |
| `dream` | Generate dream | — |
| `learn` | Learn from interaction | `content: string`, `source?: string` |

---

## Module: Defense

Security and threat detection.

| Action | Description | Parameters |
|--------|-------------|------------|
| `analyze` | Analyze request | `fingerprint: object`, `ip?: string` |
| `reputation` | IP reputation | `ip: string` |
| `posture` | Security posture | — |
| `anomalyProbe` | Anomaly detection | `lookbackHours?: number` |
| `limits` | Rate limit status | — |

---

## Module: Nexus

Multi-provider AI routing.

| Action | Description | Parameters |
|--------|-------------|------------|
| `route` | Route to best provider | `prompt: string` |
| `text` | Text generation | `prompt: string`, `model?: string` |
| `image` | Image generation | `prompt: string` |
| `providers` | Available providers | — |
| `routeStats` | Routing analytics | — |

---

## Module: Vision

Observability and monitoring.

| Action | Description | Parameters |
|--------|-------------|------------|
| `health` | System health | — |
| `healthSnapshot` | Quick health check | — |
| `dashboard` | Dashboard data | — |
| `trace` | Distributed tracing | `traceId?: string`, `create?: boolean` |
| `quota` | AI usage quota | — |
| `introspection` | Deep analysis | — |
| `alert` | Create alert | `severity: string`, `message: string` |

---

## Module: Dream

Dream processing operations.

| Action | Description | Parameters |
|--------|-------------|------------|
| `feed` | Submit dream | `dream_content: string`, `dream_type?: string` |
| `interpret` | Interpret dream | `dream_text: string` |
| `cycle` | Execute dream cycle | `force?: boolean` |
| `mutate` | Mutation cycle | — |
| `status` | Dream-Eater state | — |

---

## Module: System

Administration operations.

| Action | Description | Parameters |
|--------|-------------|------------|
| `status` | System status | — |
| `health` | Full health check | — |
| `heal` | Heal system | `target?: string` |
| `backup` | Create backup | `include_data?: boolean` |
| `version` | Get version | — |

---

## Authentication

### Public Endpoints (no auth required)
- All `status` actions
- `vision.health`
- `dream.feed` (rate-limited)

### Authenticated Endpoints
```
Authorization: Bearer <supabase-jwt>
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

## Error Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Invalid request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Unknown module/action |
| `422` | Validation failed |
| `429` | Rate limited |
| `500` | Internal error |

---

**promptfluid® — Build on the substrate. Bring your own keys.**
