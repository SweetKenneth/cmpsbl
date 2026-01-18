# promptfluid® Substrate — API Reference

**v2026.01 — Deployed Substrate Actions**

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

## Module: Brain (10 Actions)

Memory, learning, and knowledge operations.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Get brain module stats | — | ✅ Deployed |
| `query` | Search memories | `query_text: string`, `limit?: number` | ✅ Deployed |
| `remember` | Store memory | `content: string`, `type: string`, `confidence?: number` | ✅ Deployed |
| `learn` | Ingest knowledge | `content: string`, `source?: string` | ✅ Deployed |
| `reflect` | Trigger reflection | — | ✅ Deployed |
| `reinforce` | Boost memory | `memory_id: string`, `boost?: number` | ✅ Deployed |
| `dream` | Run dream cycle | — | ✅ Deployed |
| `graphSummary` | Knowledge graph stats | — | ✅ Deployed |
| `sessionReflection` | Cross-module reflection | `hours?: number` | ✅ Deployed |
| `coldMigrate` | Move to cold storage | — | ✅ Deployed (standalone) |

---

## Module: Decode (5 Actions)

Conversational AI and intent decoding.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Get decode module stats | — | ✅ Deployed |
| `chat` | Process message | `message: string`, `session_id?: string` | ✅ Deployed |
| `intent` | Extract intent | `message: string` | ✅ Deployed |
| `dream` | Generate dream | — | ✅ Deployed |
| `learn` | Learn from interaction | `content: string`, `source?: string` | ✅ Deployed |

---

## Module: Defense (7 Actions)

Security and threat detection.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Get defense module stats | — | ✅ Deployed |
| `analyze` | Analyze request | `fingerprint: object`, `ip?: string` | ✅ Deployed |
| `reputation` | IP reputation | `ip: string` | ✅ Deployed |
| `anomaly` | Anomaly detection | `timeWindow?: string` | ✅ Deployed |
| `anomalyProbe` | Z-score anomaly detection | `lookbackHours?: number` | ✅ Deployed |
| `posture` | Security posture | — | ✅ Deployed |
| `limits` | Rate limit status | — | ✅ Deployed |

---

## Module: Nexus (4 Actions)

Multi-provider AI routing.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Check available providers | — | ✅ Deployed |
| `route` | Route to best provider | `prompt: string` | ✅ Deployed |
| `providers` | Available providers | — | ✅ Deployed |
| `routeStats` | Routing analytics | — | ✅ Deployed |

---

## Module: Vision (14 Actions)

Observability and monitoring.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | Get vision module status | — | ✅ Deployed |
| `health` | System health | — | ✅ Deployed |
| `healthSnapshot` | Quick health check | — | ✅ Deployed |
| `metrics` | System metrics | — | ✅ Deployed |
| `logs` | Recent logs | `module?: string`, `limit?: number` | ✅ Deployed |
| `dashboard` | Dashboard data | — | ✅ Deployed |
| `trace` | Distributed tracing | `traceId?: string`, `create?: boolean` | ✅ Deployed |
| `audit` | Audit log query | `entity?: string`, `action?: string` | ✅ Deployed |
| `alert` | Create alert | `severity: string`, `message: string` | ✅ Deployed |
| `monitor` | Ecosystem monitoring | — | ✅ Deployed |
| `resilience` | Resilience probe | — | ✅ Deployed |
| `analytics` | Threat analytics | — | ✅ Deployed |
| `introspection` | Deep analysis | — | ✅ Deployed |
| `pulse` | Lightweight heartbeat | — | ✅ Deployed |
| `quota` | AI usage quota | — | ✅ Deployed |

---

## Module: Dream (3 Actions)

Dream processing operations.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `feed` | Submit dream | `dream_content: string`, `dream_type?: string` | ✅ Deployed |
| `cycle` | Execute dream cycle | `force?: boolean` | ✅ Deployed |
| `awaken` | Awaken Dream-Eater | `action?: string` | ✅ Deployed |

---

## Module: System (9 Actions)

Administration operations.

| Action | Description | Parameters | Status |
|--------|-------------|------------|--------|
| `status` | System status | — | ✅ Deployed |
| `health` | Full health check | — | ✅ Deployed |
| `diagnostics` | Comprehensive diagnostics | — | ✅ Deployed |
| `heal` | Heal system | `target?: string` | ✅ Deployed |
| `backup` | Create backup | `include_data?: boolean` | ✅ Deployed |
| `restore` | Restore from backup | `backup_id: string` | ✅ Deployed |
| `audit` | System audit | — | ✅ Deployed |
| `version` | Get version | — | ✅ Deployed |
| `restart` | Restart services | `service?: string` | ✅ Deployed |

---

## BYOK Integrations

Connect external services with your own API keys.

| Integration | Description | Status |
|-------------|-------------|--------|
| **Stripe** | Payments, subscriptions, billing | ✅ Available |
| **Twilio** | SMS, voice, messaging | ✅ Available |
| **Shopify** | E-commerce, products, orders | ✅ Available |
| **n8n** | Workflow automation | ✅ Available |
| **Webhooks** | Custom API connections | ✅ Available |

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

## Summary

| Module | Deployed Actions |
|--------|------------------|
| Brain | 10 |
| Decode | 5 |
| Defense | 7 |
| Nexus | 4 |
| Vision | 14 |
| Dream | 3 |
| System | 9 |
| **Total** | **52** |

---

**promptfluid® — Build on the substrate. Bring your own keys.**
