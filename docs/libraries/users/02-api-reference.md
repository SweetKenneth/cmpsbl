# API Reference

---

## Endpoint Pattern

All requests route through the NEXUS Engine: `POST /api/v1/{primitive}/{action}`

## Request Format

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

## Response Format

```json
{
  "success": true,
  "data": {},
  "metadata": {
    "request_id": "uuid",
    "primitive": "string",
    "latency_ms": "number",
    "tokens_used": "number"
  }
}
```

## Error Response

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

## Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | `INVALID_REQUEST` | Malformed request body |
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 403 | `FORBIDDEN` | Key lacks required scope |
| 404 | `NOT_FOUND` | Resource does not exist |
| 422 | `VALIDATION_ERROR` | Request failed validation |
| 429 | `RATE_LIMITED` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | System error |
| 502 | `PROVIDER_ERROR` | AI provider returned error |
| 503 | `SERVICE_UNAVAILABLE` | Primitive circuit breaker open |
| 504 | `TIMEOUT` | Request exceeded timeout |

## Rate Limit Headers

Every response includes:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1709312400
```

## Primitive Endpoints

### Agents

| Primitive | Actions | Description |
|-----------|---------|-------------|
| DECODE | `process`, `stream` | Natural language understanding |
| ENCODE | `generate`, `format` | Content and code generation |
| VISION | `analyze`, `render` | Telemetry and visual processing |
| HARVEST | `ingest`, `normalize` | Data collection and ETL |
| LINGUA | `translate`, `detect` | Translation and language detection |
| COMPASS | `trends`, `navigate` | Strategic trend analysis |
| SOVEREIGN | `classify`, `comply` | Jurisdiction compliance |
| MEDIC | `diagnose`, `repair` | Diagnostics and self-repair |
| INCLUSIVE | `scan`, `report` | Accessibility scanning |

### Engines

| Primitive | Actions | Description |
|-----------|---------|-------------|
| NEXUS | `route`, `health`, `consensus` | Routing, health, multi-model consensus |
| CORTEX | `pipeline`, `compose` | Multi-step orchestration |
| ORACLE | `predict`, `simulate` | Forecasting and scenarios |
| FORGE | `generate`, `template` | Artifact manufacturing |
| ECONOMY | `usage`, `quota`, `cost` | Usage tracking and billing |

### Organs

| Primitive | Actions | Description |
|-----------|---------|-------------|
| MEMORY | `store`, `retrieve`, `search` | Persistent memory operations |
| BRAIN | `reason`, `learn` | Reasoning and pattern recognition |

## Versioning

- API versions in URL: `/api/v1/`, `/api/v2/`
- Minor changes are backward compatible
- Breaking changes require a new version
- Deprecated versions supported for 6 months

---

© 2025–2026 CMPSBL®. All rights reserved.
