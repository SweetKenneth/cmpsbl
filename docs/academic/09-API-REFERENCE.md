# CMPSBL OS Substrate — API Reference

**Document ID:** CMPSBL-ACAD-009  
**Version:** v8.0.0 (SYNERGY+ Epoch)

---

## 1. API Overview

The CMPSBL Substrate exposes a comprehensive API for programmatic access to all public functionality. This reference documents the public API surface while omitting proprietary implementation details.

### 1.1 API Design Principles

| Principle | Description |
|-----------|-------------|
| **RESTful** | Resource-oriented endpoints |
| **JSON** | Standard request/response format |
| **Versioned** | API versioning in path |
| **Authenticated** | Bearer token authentication |
| **Rate Limited** | Tier-based quotas |

### 1.2 Base URL

```
https://api.cmpsbl.com/v1
```

---

## 2. Authentication

### 2.1 Authentication Methods

| Method | Use Case | Header |
|--------|----------|--------|
| API Key | Server-to-server | `X-API-Key: <key>` |
| Bearer Token | User sessions | `Authorization: Bearer <token>` |

### 2.2 API Key Format

```
pf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Prefix: `pf_live_` (production) or `pf_test_` (sandbox)
- Length: 32 random characters

### 2.3 Token Refresh

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "string"
}
```

Response:
```json
{
  "access_token": "string",
  "expires_in": 3600,
  "refresh_token": "string"
}
```

---

## 3. Common Response Format

### 3.1 Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-02-09T12:00:00Z"
  }
}
```

### 3.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      { "field": "query", "message": "Required field" }
    ]
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-02-09T12:00:00Z"
  }
}
```

### 3.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Quota exceeded |
| INTERNAL_ERROR | 500 | Server error |

---

## 4. Module Endpoints

### 4.1 BRAIN Module

#### Store Memory

```http
POST /brain/remember
Content-Type: application/json

{
  "content": "string",
  "context": { /* optional metadata */ },
  "ttl": "short" | "long" | "permanent"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "memory_id": "mem_abc123",
    "stored_at": "2026-02-09T12:00:00Z"
  }
}
```

#### Recall Memory

```http
POST /brain/recall
Content-Type: application/json

{
  "query": "string",
  "limit": 10,
  "filters": { /* optional */ }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "memories": [
      {
        "id": "mem_abc123",
        "content": "string",
        "relevance": 0.95,
        "created_at": "2026-02-09T12:00:00Z"
      }
    ]
  }
}
```

### 4.2 DECODE Module

#### Interpret Intent

```http
POST /decode/interpret
Content-Type: application/json

{
  "input": "string",
  "context": { /* optional */ }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "intent": "query",
    "entities": [
      { "type": "metric", "value": "health" }
    ],
    "confidence": 0.92
  }
}
```

#### Execute Contract

```http
POST /decode/execute
Content-Type: application/json

{
  "contract": "string",
  "parameters": { /* contract-specific */ }
}
```

### 4.3 NEXUS Module

#### Route Request

```http
POST /nexus/route
Content-Type: application/json

{
  "prompt": "string",
  "model_preference": "fast" | "quality" | "balanced",
  "max_tokens": 1000
}
```

Response:
```json
{
  "success": true,
  "data": {
    "response": "string",
    "provider": "provider_name",
    "tokens_used": 150,
    "latency_ms": 234
  }
}
```

#### Check Provider Health

```http
GET /nexus/health
```

Response:
```json
{
  "success": true,
  "data": {
    "providers": [
      { "name": "provider_a", "status": "healthy", "latency_ms": 120 },
      { "name": "provider_b", "status": "degraded", "latency_ms": 450 }
    ]
  }
}
```

---

## 5. Capability Endpoints

### 5.1 List Capabilities

```http
GET /capabilities
GET /capabilities?module=BRAIN
GET /capabilities?risk=low
GET /capabilities?status=active
```

Response:
```json
{
  "success": true,
  "data": {
    "capabilities": [
      {
        "id": "brain.remember",
        "name": "Remember Context",
        "modules": ["BRAIN"],
        "risk": "low",
        "status": "active"
      }
    ],
    "total": 269
  }
}
```

### 5.2 Get Capability

```http
GET /capabilities/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "brain.remember",
    "name": "Remember Context",
    "modules": ["BRAIN"],
    "risk": "low",
    "reversible": true,
    "description": "Store context in persistent memory",
    "status": "active",
    "confidence": 0.94,
    "invoke_count": 14523
  }
}
```

### 5.3 Invoke Capability

```http
POST /capabilities/:id/invoke
Content-Type: application/json

{
  "input": { /* capability-specific */ }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "result": { /* capability output */ },
    "execution_ms": 45,
    "confidence": 0.92
  }
}
```

---

## 6. Synergy Endpoints

### 6.1 List Synergies

```http
GET /synergies
GET /synergies?tier=S
GET /synergies?module=BRAIN
```

Response:
```json
{
  "success": true,
  "data": {
    "synergies": [
      {
        "id": "evolution.propose_and_verify",
        "name": "Propose & Verify",
        "tier": "S",
        "modules": ["SEBA", "VISION", "BRAIN"]
      }
    ],
    "total": 147
  }
}
```

### 6.2 Execute Synergy

```http
POST /synergies/:id/execute
Content-Type: application/json

{
  "input": { /* synergy-specific */ }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "synergy_id": "string",
    "output": { /* synergy output */ },
    "steps": [
      { "step_id": "step_1", "status": "success", "duration_ms": 123 }
    ],
    "execution_ms": 1234
  }
}
```

### 6.3 Dry Run Synergy

```http
POST /synergies/:id/dry-run
Content-Type: application/json

{
  "input": { /* synergy-specific */ }
}
```

---

## 7. Evolution Endpoints

### 7.1 List Proposals

```http
GET /evolution/proposals
GET /evolution/proposals?status=pending
```

Response:
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": "prop_abc123",
        "short_id": "SEBA-001",
        "title": "Optimize memory retrieval",
        "status": "pending",
        "confidence": 0.85,
        "risk": "low"
      }
    ]
  }
}
```

### 7.2 Get Proposal

```http
GET /evolution/proposals/:id
```

### 7.3 List Receipts (Public)

```http
GET /evolution/receipts
GET /evolution/receipts?run_id=<uuid>
```

Response:
```json
{
  "success": true,
  "data": {
    "receipts": [
      {
        "run_id": "run_abc123",
        "phase": "verified",
        "confidence_score": 87,
        "risk_level": "low",
        "tests_run": 24,
        "tests_passed": 24,
        "health_before": 85,
        "health_after": 88,
        "timestamp": "2026-02-09T12:00:00Z"
      }
    ]
  }
}
```

### 7.4 List Stamps

```http
GET /evolution/stamps
```

Response:
```json
{
  "success": true,
  "data": {
    "stamps": [
      {
        "stamp_id": "SEBA-abc123-def456",
        "proposal_id": "SEBA-001",
        "files_modified": 3,
        "applied_at": "2026-02-09T12:00:00Z",
        "applied_by": "seba"
      }
    ]
  }
}
```

### 7.5 Verify Stamp

```http
GET /evolution/stamps/:id/verify
```

Response:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "stamp_id": "SEBA-abc123-def456",
    "hash_match": true,
    "chain_intact": true
  }
}
```

---

## 8. System Endpoints

### 8.1 Health Check

```http
GET /health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "score": 87,
    "components": {
      "database": "healthy",
      "cache": "healthy",
      "providers": "healthy"
    }
  }
}
```

### 8.2 System Status

```http
GET /status
```

Response:
```json
{
  "success": true,
  "data": {
    "version": "8.0.0",
    "epoch": "SYNERGY+",
    "modules": 14,
    "capabilities": 269,
    "synergies": 147,
    "autonomy_mode": "governed",
    "circuit_state": "closed"
  }
}
```

---

## 9. WebSocket API

### 9.1 Connection

```javascript
const ws = new WebSocket('wss://api.cmpsbl.com/v1/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_access_token'
  }));
};
```

### 9.2 Subscribe to Events

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['evolution', 'health']
}));
```

### 9.3 Event Types

| Channel | Events |
|---------|--------|
| evolution | proposal, approval, execution, stamp |
| health | score_change, alert, recovery |
| system | mode_change, circuit_change |

### 9.4 Event Format

```json
{
  "channel": "evolution",
  "event": "stamp",
  "data": {
    "stamp_id": "SEBA-abc123-def456",
    "proposal_id": "SEBA-001"
  },
  "timestamp": "2026-02-09T12:00:00Z"
}
```

---

## 10. Rate Limits

### 10.1 Tier Limits

| Tier | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free | 10 | 1,000 |
| Developer | 100 | 50,000 |
| Professional | 1,000 | 500,000 |
| Enterprise | Custom | Custom |

### 10.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707480000
```

---

## 11. SDKs

### 11.1 Available SDKs

| Language | Package |
|----------|---------|
| TypeScript/JavaScript | `@cmpsbl/sdk` |
| Python | `cmpsbl-sdk` |
| Go | `github.com/cmpsbl/sdk-go` |

### 11.2 TypeScript Example

```typescript
import { CMPSBL } from '@cmpsbl/sdk';

const client = new CMPSBL({ apiKey: 'pf_live_xxx' });

// Store memory
const memory = await client.brain.remember({
  content: 'Important context',
  ttl: 'long'
});

// Execute synergy
const result = await client.synergies.execute('intel.research_and_report', {
  topic: 'AI governance trends'
});
```

---

## 12. Pagination

### 12.1 Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| page_size | integer | 20 | Items per page (max 100) |

### 12.2 Response Format

```json
{
  "success": true,
  "data": { /* items */ },
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 147,
    "total_pages": 8
  }
}
```

---

*CMPSBL OS Substrate v8.0.0 — API Reference*  
*© 2025-2026 PromptFluid®. All rights reserved.*
