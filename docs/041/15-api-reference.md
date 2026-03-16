# 15 — API Reference

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

Complete API reference for the CMPSBL cognitive substrate.

---

## 1. Base URLs

| Service | URL |
|---|---|
| Substrate Gateway | `POST https://api.cmpsbl.com/v1/substrate` |
| Engine Gateway | `POST https://api.cmpsbl.com/v1/engine` |

---

## 2. Authentication

### Substrate API

```
Authorization: Bearer <API_KEY>
```

### Engine API

```
X-Engine-Key: <ENGINE_KEY>
```

---

## 3. Request / Response Format

### Request

```json
{
  "module": "string",
  "action": "string",
  "input": { }
}
```

### Success Response

```json
{
  "success": true,
  "data": { },
  "confidence": 0.0,
  "executionMs": 0,
  "receipt": "string"
}
```

### Error Response

```json
{
  "success": false,
  "error": "string",
  "code": "string"
}
```

---

## 4. BRAIN Module

### brain.query

Performs reasoning and analysis.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| prompt | string | Yes | The reasoning prompt |
| context | object | No | Additional context for reasoning |
| systemPrompt | string | No | System-level instruction |
| sessionId | string | No | Session identifier for continuity |

**Response:**

```json
{
  "reply": "string",
  "reasoning": "string",
  "sources": []
}
```

---

## 5. MEMORY Module

### memory.store

Stores a memory entry.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| content | string | Yes | The memory content |
| tags | string[] | No | Classification tags |
| importance | number | No | Importance weight (0–1) |
| metadata | object | No | Additional metadata |

**Response:**

```json
{
  "id": "string",
  "stored": true
}
```

### memory.semantic_search

Searches memories by semantic similarity.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| query | string | Yes | Search query |
| limit | number | No | Maximum results (default: 10) |
| tags | string[] | No | Filter by tags |
| minImportance | number | No | Minimum importance threshold |

**Response:**

```json
{
  "results": [
    {
      "id": "string",
      "content": "string",
      "similarity": 0.95,
      "importance": 0.8,
      "tags": [],
      "created_at": "string"
    }
  ]
}
```

### memory.recall

Retrieves a specific memory by ID.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | Yes | Memory identifier |

### memory.delete

Removes a memory entry.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | Yes | Memory identifier |

---

## 6. DEFENSE Module

### defense.threat_score

Evaluates threat level of content.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| content | string | Yes | Content to evaluate |
| context | object | No | Contextual information |

**Response:**

```json
{
  "score": 0.15,
  "level": "low",
  "findings": []
}
```

---

## 7. EVOLUTION Module

### evolution.upgrade_readiness

Checks system readiness for mutation.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| scope | string | No | Scope of the readiness check |

**Response:**

```json
{
  "ready": true,
  "gates_passed": 7,
  "blockers": []
}
```

---

## 8. HARVEST Module

### harvest.discover

Queries the discovery catalog.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| domain | string | No | Filter by domain |
| minScore | number | No | Minimum CJPI score |
| limit | number | No | Maximum results |

**Response:**

```json
{
  "discoveries": [
    {
      "id": "string",
      "description": "string",
      "cjpi": 92,
      "tier": "Relic",
      "nodes": ["BRAIN", "MEMORY", "DEFENSE"]
    }
  ]
}
```

---

## 9. FORGE Module

### forge.signal_forge

Generates architecture blueprints.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| seed | string | Yes | Blueprint generation seed |
| constraints | object | No | Architectural constraints |

**Response:**

```json
{
  "blueprint": { },
  "cjpi": 88,
  "nodes_involved": [],
  "description": "string"
}
```

---

## 10. System Endpoints

### system.health

Returns system health status.

**Response:**

```json
{
  "status": "healthy",
  "nodes": 40,
  "activeNodes": 40,
  "version": "v14.2.0",
  "epoch": "MINDGAMES"
}
```

### system.metrics

Returns system metrics (authorized users only).

---

## 11. Engine API

### Request Format

```json
{
  "engine": "ENGINE_NAME",
  "action": "invoke",
  "input": { }
}
```

### Available Engine Tiers

| Tier | Examples | Access |
|---|---|---|
| META | GODMIND | X-Engine-Key |
| APEX | PANDORA, AXIOM | X-Engine-Key |
| ELITE | Various | X-Engine-Key |
| CORE | Various | X-Engine-Key |
| STANDALONE | FAILSAFE | Copy-paste, no key needed |

---

## 12. Rate Limits

| Tier | Requests/Minute | Requests/Day |
|---|---|---|
| Builder | 10 | 100 |
| Studio | 60 | 1,000 |
| Creator | 120 | 5,000 |
| Architect | 300 | 25,000 |

### Rate Limit Headers

```
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1710576000
X-RateLimit-Limit: 60
```

---

## 13. Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| AUTH_REQUIRED | 401 | Missing or invalid credentials |
| RATE_LIMITED | 429 | Rate limit exceeded |
| MODULE_NOT_FOUND | 404 | Invalid module name |
| ACTION_NOT_FOUND | 404 | Invalid action for module |
| VALIDATION_ERROR | 400 | Invalid input format |
| GOVERNANCE_BLOCKED | 403 | Action blocked by governance policy |
| CONSENT_REQUIRED | 403 | Mutation requires user approval |
| INTERNAL_ERROR | 500 | Internal system error |

---

## 14. Active Refinement Notice

Certain API interfaces are in active refinement, including:

- Webhook event subscriptions
- Batch operations
- Streaming responses
- Custom resolver registration

These interfaces will be documented as they stabilize.

---

## Related Documents

- [SDK & API](09-sdk-and-api.md)
- [Developer Guide](03-developer-guide.md)
- [Substrate Development](13-substrate-development.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
