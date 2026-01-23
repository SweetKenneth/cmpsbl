# promptfluid® Substrate — API Reference

**v4.0.0 — Complete Module & Action Reference**

---

## Endpoint

```
POST https://[your-project].supabase.co/functions/v1/pf-substrate
```

## Request Format

```json
{
  "module": "brain|decode|defense|nexus|vision|dream|system|core|ripple|access|modernizer",
  "action": "<action-name>",
  "payload": { /* action-specific parameters */ }
}
```

## Response Format

```json
{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { /* action-specific response */ },
  "timestamp": "2026-01-23T12:00:00.000Z"
}
```

---

## Module: CORE (Kernel)

*Scheduler, lifecycle, and system orchestration.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Kernel status with uptime | — | Public |
| `pulse` | Lightweight heartbeat | — | Public |
| `boot` | Initialize boot sequence | — | Operator |
| `schedule` | Schedule a job | `module`, `action`, `payload?`, `delay?`, `priority?` | Operator |
| `jobs` | List scheduled jobs | `status?`, `limit?` | Operator |
| `process` | Process next queued job | — | Operator |
| `config` | Get/set configuration | `key?`, `value?` | Operator |
| `shutdown` | Graceful shutdown | — | Governor |

---

## Module: RIPPLE (Message Bus)

*Pub/sub, job queues, and event sourcing.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Message bus status | — | Public |
| `pulse` | Lightweight heartbeat | — | Public |
| `enqueue` | Add job to queue | `queue`, `payload`, `priority?`, `delay?` | Operator |
| `dequeue` | Get next job from queue | `queue` | Operator |
| `publish` | Publish event to topic | `topic`, `event_type`, `payload?`, `correlation_id?` | Operator |
| `subscribe` | Subscribe to topic | `topic`, `subscriber_module`, `subscriber_action`, `filter?` | Operator |
| `topics` | List all topics | — | Observer |
| `events` | Get event log | `topic?`, `limit?`, `unprocessed_only?` | Observer |
| `dead_letter` | View failed jobs | — | Operator |
| `retry` | Retry failed job | `job_id` | Operator |

---

## Module: ACCESS (Identity & Billing)

*API keys, quotas, and usage metering.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Access module status | — | Public |
| `pulse` | Lightweight heartbeat | — | Public |
| `create_key` | Create API key | `developer_id`, `name?`, `scopes?`, `rate_limit_per_minute?`, `rate_limit_per_day?` | Developer |
| `validate_key` | Validate API key | `api_key` | Public |
| `revoke_key` | Revoke API key | `key_id` | Developer |
| `list_keys` | List developer's keys | `developer_id` | Developer |
| `usage` | Get usage statistics | `api_key_id?`, `developer_id?`, `start_date?`, `end_date?` | Developer |
| `quota` | Check quota remaining | `api_key_id` | Developer |
| `record_usage` | Record usage for metering | `api_key_id?`, `developer_id?`, `module`, `action`, `tokens_used?`, `compute_ms?`, `cost_millicents?` | Internal |
| `subscription` | Get subscription info | `developer_id` | Developer |

---

## Module: BRAIN (Memory & Learning)

*Cognitive memory with tiered storage and knowledge graphs.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Brain module stats | — | Public |
| `query` | Search memories | `query_text`, `limit?` | Observer |
| `remember` | Store memory | `content`, `memory_type`, `confidence?`, `metadata?` | Operator |
| `learn` | Ingest knowledge | `content`, `source?` | Operator |
| `recall` | Retrieve specific memory | `query`, `limit?` | Observer |
| `reflect` | Trigger reflection | — | Operator |
| `reinforce` | Boost memory confidence | `memory_id`, `boost?` | Operator |
| `dream` | Run dream cycle | — | Operator |
| `synthesize` | Cross-domain synthesis | — | Operator |
| `forecast` | Probabilistic forecasting | `metric?`, `window?` | Observer |
| `optimize` | Memory optimization | — | Operator |
| `deep_think` | Extended reasoning | `query`, `depth?` | Operator |
| `hypothesis_test` | Test hypothesis | `hypothesis` | Operator |
| `cognitive_cycle` | Full learn-reflect-dream | — | Operator |
| `continuous_learn` | Toggle learning mode | `enabled` | Operator |
| `graph_build` | Build knowledge graph | — | Operator |
| `graph_summary` | Knowledge graph stats | — | Observer |
| `curiosity` | Exploration queries | — | Observer |
| `explore` | Active research | `query` | Operator |
| `patterns` | Learning patterns | — | Observer |
| `session_reflection` | Cross-module summary | `hours?` | Observer |
| `coherence_check` | Memory coherence | `depth?` | Observer |

---

## Module: DECODE (Intent & Chat)

*Conversational AI and intent extraction.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Decode module stats | — | Public |
| `chat` | Process message | `message`, `sessionId?` | Observer |
| `intent` | Extract structured intent | `message` | Observer |
| `dream` | Initiate dream cycle | — | Operator |
| `learn` | Learn from interaction | `content`, `source?` | Operator |
| `propose` | Submit proposal | `idea` | Operator |

---

## Module: NEXUS (AI Routing)

*Multi-provider AI routing with fallbacks.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Nexus module status | — | Public |
| `text` | Text generation | `prompt`, `model?` | Operator |
| `image` | Image generation | `prompt`, `model?` | Operator |
| `route` | Route to best provider | `task` | Operator |
| `providers` | Provider availability | — | Observer |
| `route_stats` | Routing analytics (24h) | — | Observer |

---

## Module: DEFENSE (Security)

*Bot detection, threat analysis, and rate limiting.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Defense module stats | — | Public |
| `analyze` | Analyze request | `fingerprint`, `ip?` | Observer |
| `report` | Report threat | `threatId` | Operator |
| `rules` | Get defense rules | — | Operator |
| `reputation` | IP reputation | `ip_address` | Observer |
| `anomaly` | Anomaly detection | `timeWindow?` | Observer |
| `anomaly_probe` | Z-score detection | `lookbackHours?` | Observer |
| `limits` | Rate limit status | — | Observer |
| `posture` | Security posture | — | Observer |
| `ip_intel` | IP intelligence | `ip_address`, `include_history?` | Observer |

---

## Module: VISION (Observability)

*Health monitoring, metrics, and tracing.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Vision module status | — | Public |
| `metrics` | System metrics | — | Observer |
| `health` | System health | — | Public |
| `health_snapshot` | Quick health check | — | Public |
| `logs` | Recent logs | `module?`, `limit?` | Observer |
| `alert` | Create alert | `severity`, `message`, `metadata?` | Operator |
| `audit` | Audit log query | `entity?`, `action?` | Observer |
| `dashboard` | Dashboard data | — | Observer |
| `trace` | Distributed tracing | `traceId?`, `create?`, `module?`, `action?`, `duration_ms?` | Observer |
| `monitor` | Ecosystem monitoring | — | Observer |
| `resilience` | Resilience probe | — | Observer |
| `analytics` | Threat analytics | — | Observer |
| `introspection` | Deep analysis | — | Operator |
| `pulse` | Lightweight heartbeat | — | Public |
| `quota` | AI usage quota | — | Observer |
| `dependency_map` | Module dependencies | — | Observer |

---

## Module: DREAM (Evolution)

*Autonomous processing and system evolution.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Dream module status | — | Public |
| `mood` | Get/set mood | `mood?` | Observer |
| `cycle` | Execute dream cycle | — | Operator |
| `consume` | Consume dream | `dream_id` | Operator |
| `interpret` | Interpret dream text | `dream_text` | Operator |
| `mutation` | Trigger mutation | — | Operator |
| `reflect` | Dream reflection | — | Operator |
| `feed` | Submit dream | `dream_content`, `dream_type?` | Public |
| `awaken` | Awaken Dream-Eater | `action?` | Operator |

---

## Module: SYSTEM (Administration)

*Backups, restores, diagnostics, and healing.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | System status | — | Public |
| `version` | Get substrate version | — | Public |
| `config` | Get configuration | `key?` | Observer |
| `audit` | System audit | — | Observer |
| `health` | Full health check | — | Observer |
| `diagnostics` | Comprehensive diagnostics | — | Operator |
| `heal` | Heal system | `target?`, `force?` | Operator |
| `restart` | Restart service | `service?` | Operator |
| `backup` | Create backup | `include_data?`, `tables?` | Operator |
| `restore` | Restore from backup | `backup_id`, `validate_only?` | Operator |
| `list_backups` | List backups | — | Observer |

---

## Module: MODERNIZER (Self-Improvement)

*Substrate code analysis and shadow-mode upgrades.*

| Action | Description | Parameters | Auth |
|--------|-------------|------------|------|
| `status` | Modernizer status | — | Public |
| `pulse` | Lightweight heartbeat | — | Public |
| `scan` | Scan for improvements | `module?`, `depth?` | Operator |
| `jobs` | List scan jobs | `limit?` | Observer |
| `job` | Get specific job | `job_id` | Observer |
| `quota` | Check scan quota | — | Observer |
| `analyze` | Quick module analysis | `module?` | Observer |
| `export` | Export proposals | `job_id` | Observer |
| `propose` | Generate upgrade proposal | `scope?`, `notes?`, `max_changes?` | Operator |
| `plans` | List upgrade plans | — | Observer |
| `review` | Review upgrade plan | `plan_id` | Observer |
| `apply` | Apply upgrade plan | `plan_id` | Governor |
| `rollback` | Rollback applied plan | `plan_id` | Governor |
| `delete` | Delete/reject plan | `plan_id`, `reason?` | Operator |
| `archived` | Scan archived functions | — | Observer |
| `implement_archived` | Implement archived code | `archived_function`, `target_action` | Operator |

---

## Authentication Levels

| Level | Description |
|-------|-------------|
| **Public** | No authentication required |
| **Observer** | Read-only access, requires auth |
| **Operator** | Read/write access |
| **Developer** | Developer account required |
| **Governor** | Admin access |
| **Internal** | System-only |

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
| 200 | Success |
| 400 | Invalid request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Unknown module/action |
| 422 | Validation failed |
| 429 | Rate limited |
| 500 | Internal error |

---

## Summary

| Module | Actions | Layer |
|--------|---------|-------|
| CORE | 8 | Kernel |
| RIPPLE | 10 | Kernel |
| ACCESS | 10 | Kernel |
| BRAIN | 22 | Cognitive |
| DECODE | 6 | Cognitive |
| NEXUS | 6 | Cognitive |
| DREAM | 9 | Cognitive |
| DEFENSE | 10 | Operational |
| VISION | 16 | Operational |
| SYSTEM | 11 | Operational |
| MODERNIZER | 16 | Admin |
| **TOTAL** | **124** | — |

---

**promptfluid® — v4.0.0 Cognitive Substrate OS**  
*© 2025-2026 promptfluid. All rights reserved.*
