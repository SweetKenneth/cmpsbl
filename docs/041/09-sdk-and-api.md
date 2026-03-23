# 09 — SDK & API

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document describes the integration surface for the CMPSBL cognitive substrate, including the unified API gateway, authentication, and available endpoints.

---

## 1. Integration Model

CMPSBL uses a dependency-free, direct-integration model. All substrate operations are accessed via standard REST API calls using `fetch` with JSON payloads and Bearer token authorization.

No external SDK or npm package installation is required. This eliminates dependency management and version compatibility concerns.

---

## 2. Unified Gateway

All substrate operations route through a single endpoint:

```
POST https://api.cmpsbl.com/v1/substrate
```

### Request Format

```json
{
  "module": "<node_name>",
  "action": "<resolver_name>",
  "input": { ... }
}
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "confidence": 0.92,
  "executionMs": 340,
  "receipt": "receipt_abc123"
}
```

### Error Format

```json
{
  "success": false,
  "error": "Description of the error",
  "code": "ERROR_CODE"
}
```

---

## 3. Authentication

### API Keys

Developer API keys are generated from the API Access page. Keys use Bearer token authentication:

```bash
curl -X POST https://api.cmpsbl.com/v1/substrate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"module":"brain","action":"query","input":{"prompt":"Hello"}}'
```

### Key Properties

| Property | Description |
|---|---|
| Prefix | Visible identifier for key management |
| Hash | Stored securely; raw key shown only at generation |
| Scopes | Optional scope restrictions |
| Rate Limits | Per-minute and per-day call limits |
| Expiration | Optional expiration date |

### Agent Connect

For external AI agents, the Agent Connect system provides secure, auth-gated access by dynamically injecting the user's JWT into agent prompts.

---

## 4. Available Module Actions

### BRAIN — Reasoning & Analysis

```json
{ "module": "brain", "action": "query", "input": { "prompt": "...", "context": {} } }
```

### MEMORY — Storage & Recall

```json
// Store
{ "module": "memory", "action": "store", "input": { "content": "...", "tags": [], "importance": 0.8 } }

// Search
{ "module": "memory", "action": "semantic_search", "input": { "query": "...", "limit": 10 } }

// Recall
{ "module": "memory", "action": "recall", "input": { "id": "memory_id" } }
```

### DEFENSE — Security

```json
{ "module": "defense", "action": "threat_score", "input": { "content": "..." } }
```

### EVOLUTION — Mutation Management

```json
{ "module": "evolution", "action": "upgrade_readiness", "input": {} }
```

### FORGE — Blueprint Synthesis

```json
{ "module": "forge", "action": "signal_forge", "input": { "seed": "...", "constraints": {} } }
```

### HARVEST — Discovery Queries

```json
{ "module": "harvest", "action": "discover", "input": { "domain": "...", "limit": 10 } }
```

---

## 5. Engine API

S-tier engines use a separate authentication mechanism:

```
POST https://api.cmpsbl.com/v1/engine
```

```bash
curl -X POST https://api.cmpsbl.com/v1/engine \
  -H "X-Engine-Key: YOUR_ENGINE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"engine":"GODMIND","action":"invoke","input":{...}}'
```

### Zero-Dependency SDK

A copy-pasteable TypeScript client (`cmpsbl-engine-sdk.ts`) is available for typed engine access:

```typescript
import { EngineClient } from './cmpsbl-engine-sdk';

const client = new EngineClient({ key: 'YOUR_ENGINE_KEY' });

// META engines
const result = await client.meta.godmind({ prompt: '...' });

// Any engine
const result = await client.call('PANDORA', { input: '...' });
```

---

## 6. Health & Status

```json
{ "module": "system", "action": "health", "input": {} }
```

Returns:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "nodes": 40,
    "activeNodes": 40,
    "uptime": "99.97%",
    "version": "v14.2.0"
  }
}
```

---

## 7. Rate Limits

| Tier | Per Minute | Per Day |
|---|---|---|
| Builder | 10 | 100 |
| Studio | 60 | 1,000 |
| Creator | 120 | 5,000 |
| Architect | 300 | 25,000 |

Rate limit headers are included in every response:

```
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1710576000
```

---

## 8. Webhook Events

(Interface in active refinement)

The platform supports webhook notifications for:

- Ascension cycle completion
- Discovery events (new high-tier findings)
- Export completion
- Governance mode changes

---

## 9. Error Codes

| Code | Description |
|---|---|
| `AUTH_REQUIRED` | Missing or invalid API key |
| `RATE_LIMITED` | Rate limit exceeded |
| `MODULE_NOT_FOUND` | Invalid module name |
| `ACTION_NOT_FOUND` | Invalid action for module |
| `VALIDATION_ERROR` | Invalid input format |
| `GOVERNANCE_BLOCKED` | Action blocked by governance |
| `CONSENT_REQUIRED` | Mutation requires user approval |

---

## Related Documents

- [Developer Guide](03-developer-guide.md)
- [API Reference](15-api-reference.md)
- [Architecture Overview](07-architecture-overview.md)

---

© 2025–2026 CMPSBL®. All rights reserved.
