# API & Integration Specification

## 1. Purpose

This document defines the API contracts, authentication model, rate limits, error taxonomy, and integration patterns for the CMPSBL substrate.

## 2. Endpoint Contracts

All API requests route through the NEXUS gateway. Endpoints follow a consistent pattern:

```
POST /api/v1/{module}/{action}
```

| Module | Actions | Description |
|--------|---------|-------------|
| DECODE | `process`, `stream` | Natural language understanding |
| ENCODE | `generate`, `format` | Content generation |
| VISION | `analyze`, `render` | Visual processing |
| CORTEX | `pipeline`, `compose` | Multi-step orchestration |
| NEXUS | `route`, `health`, `consensus` | Routing, health, multi-model consensus |
| MEMORY | `store`, `retrieve`, `search` | Persistent memory operations |
| BRAIN | `reason`, `learn` | Reasoning and pattern recognition |
| ECONOMY | `usage`, `quota`, `cost` | Usage tracking and billing |
| FORGE | `generate`, `template` | Artifact manufacturing |
| LINGUA | `translate`, `detect` | Translation and language detection |
| HARVEST | `ingest`, `normalize` | Data collection and ETL |
| ORACLE | `predict`, `simulate` | Forecasting and scenario modeling |
| COMPASS | `trends`, `navigate` | Strategic trend analysis |
| SOVEREIGN | `classify`, `comply` | Jurisdiction and compliance |
| MEDIC | `diagnose`, `repair` | Health diagnostics and self-repair |

### Request Format

```json
{
  "action": "string",
  "payload": {},
  "options": {
    "provider": "string (optional)",
    "model": "string (optional)",
    "timeout_ms": "number (optional)"
  }
}
```

### Response Format

```json
{
  "success": true,
  "data": {},
  "metadata": {
    "request_id": "uuid",
    "module": "string",
    "latency_ms": "number",
    "tokens_used": "number (if applicable)"
  }
}
```

## 3. Auth Model

All API requests require authentication via API key:

```
Authorization: Bearer pf_xxxxxxxxxxxxx
```

| Key Prefix | Scope |
|-----------|-------|
| `pf_live_` | Production access |
| `pf_test_` | Staging/development access |

Keys are scoped to specific modules and actions. Attempting to access an unauthorized module returns HTTP 403.

## 4. Rate Limits

| Tier | Requests/Minute | Requests/Day | Tokens/Day |
|------|-----------------|-------------|-----------|
| Free | 10 | 100 | 10,000 |
| Pro | 60 | 5,000 | 500,000 |
| Enterprise | 300 | 50,000 | 5,000,000 |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1709312400
```

## 5. Error Taxonomy

| HTTP Status | Error Code | Description |
|------------|-----------|-------------|
| 400 | `INVALID_REQUEST` | Malformed request body |
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 403 | `FORBIDDEN` | Key lacks required scope |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Resource state conflict |
| 422 | `VALIDATION_ERROR` | Request failed validation |
| 429 | `RATE_LIMITED` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | System error |
| 502 | `PROVIDER_ERROR` | AI provider returned error |
| 503 | `SERVICE_UNAVAILABLE` | Module circuit breaker open |
| 504 | `TIMEOUT` | Request exceeded timeout |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Retry after 30 seconds.",
    "details": {},
    "request_id": "uuid"
  }
}
```

## 6. Webhooks

Webhook subscriptions are available for asynchronous events:

| Event | Trigger |
|-------|---------|
| `task.completed` | Agency task finished |
| `task.failed` | Agency task failed |
| `quota.warning` | Quota at 80% utilization |
| `quota.exceeded` | Quota exhausted |
| `security.incident` | DEFENSE detected threat |

### Webhook Payload

```json
{
  "event": "task.completed",
  "timestamp": "ISO-8601",
  "data": {},
  "signature": "hmac-sha256"
}
```

Webhooks are signed with HMAC-SHA256. Consumers must verify signatures before processing.

## 7. Versioning Policy

- API versions are included in the URL path: `/api/v1/`, `/api/v2/`.
- Minor API changes within a version are backward compatible.
- Breaking changes require a new version.
- Deprecated versions are supported for 6 months after successor release.
- Version sunset notices are delivered via webhook and API response headers.

## 8. Backward Compatibility Guarantees

| Change Type | Compatibility |
|------------|--------------|
| New optional field in response | Backward compatible |
| New optional parameter in request | Backward compatible |
| New endpoint | Backward compatible |
| Removed field from response | Breaking (new version required) |
| Changed field type | Breaking (new version required) |
| Removed endpoint | Breaking (new version required) |

## 9. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | v14.1.0 MINDGAMES — Updated to 40-node topology, added developer portal self-service, per-key usage metering |
| 2026-03-03 | System | v13.1.0 — Added expansion zone endpoints (FORGE, LINGUA, HARVEST, ORACLE, COMPASS, SOVEREIGN, MEDIC), consensus routing |
| 2026-03-03 | System | Verified API contracts for v13.1.0 |
| 2026-03-01 | System | Initial canonical API specification |

---

© 2025–2026 PromptFluid®. All rights reserved.
