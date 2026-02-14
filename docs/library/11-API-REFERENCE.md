<div align="center">

# API Reference

### Public API Surface for All 21 Modules

<table>
<tr><td><strong>Document</strong></td><td>11 — API Reference</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>

</div>

---

## Unified Endpoint

All modules are accessed through a single endpoint:

```
POST /functions/v1/pf-substrate
Content-Type: application/json
Authorization: Bearer <api-key>

{
  "module": "<module-name>",
  "action": "<action-name>",
  "payload": { ... }
}
```

### Response Format

```json
{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { ... },
  "metadata": {
    "duration_ms": 142,
    "tokens_used": 0,
    "cost_millicents": 0
  }
}
```

### Error Format

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "API key rate limit exceeded. Retry after 60 seconds.",
  "retry_after": 60
}
```

---

## Module Actions Reference

### CORE

| Action | Parameters | Description |
|--------|-----------|-------------|
| `health` | — | System-wide health report |
| `config` | `key?: string` | Get configuration value(s) |
| `status` | — | Boot status of all modules |

### BRAIN

| Action | Parameters | Description |
|--------|-----------|-------------|
| `query` | `query_text: string`, `limit?: number` | Search memories |
| `remember` | `content: string`, `memory_type: string`, `confidence?: number` | Store new memory |
| `reflect` | — | Trigger reflection cycle |
| `reinforce` | `memory_id: string`, `boost?: number` | Boost memory confidence |
| `learn` | `content: string`, `source?: string` | Ingest new knowledge |
| `session_reflection` | `hours?: number` | Cross-module session reflection |
| `graph_summary` | — | Knowledge graph structure |

### NEXUS

| Action | Parameters | Description |
|--------|-----------|-------------|
| `route` | `task: string`, `prompt: string`, `context?: string` | Route to optimal AI provider |
| `providers` | — | List available providers and health |
| `estimate_cost` | `task: string`, `tokens?: number` | Estimate request cost |

### DEFENSE

| Action | Parameters | Description |
|--------|-----------|-------------|
| `analyze_threat` | `request_data: object` | Analyze request for threats |
| `report` | `period?: string` | Security incident report |
| `behavioral_scan` | `actor_id: string` | Behavioral analysis |

### MODERNIZER

| Action | Parameters | Description |
|--------|-----------|-------------|
| `propose` | `description: string`, `category: string` | Propose evolution |
| `validate` | `proposal_id: string` | Validate proposal |
| `apply` | `proposal_id: string` | Apply validated evolution |
| `rollback` | `stamp_id: string` | Rollback applied evolution |
| `history` | `limit?: number` | Evolution history |

### DECODE

| Action | Parameters | Description |
|--------|-----------|-------------|
| `parse` | `input: string` | Parse natural language input |
| `generate` | `prompt: string`, `context?: string` | Generate response |
| `detect_intent` | `input: string` | Classify user intent |

### DREAM

| Action | Parameters | Description |
|--------|-----------|-------------|
| `dream_cycle` | — | Trigger autonomous learning cycle |
| `insights` | `limit?: number` | Get recent insights |
| `status` | — | Dream module status |

### VISION

| Action | Parameters | Description |
|--------|-----------|-------------|
| `metrics` | `module?: string` | Get metrics for module(s) |
| `alerts` | `severity?: string` | Get active alerts |
| `health` | — | Health scores for all modules |

### SYSTEM

| Action | Parameters | Description |
|--------|-----------|-------------|
| `health_check` | — | Full system diagnostic |
| `heal` | `module: string` | Trigger auto-heal for module |
| `dependency_graph` | — | Module dependency visualization |

### ACCESS

| Action | Parameters | Description |
|--------|-----------|-------------|
| `validate_key` | `key: string` | Validate API key |
| `usage` | `period?: string` | Usage report |
| `quota` | — | Current quota status |

### RIPPLE

| Action | Parameters | Description |
|--------|-----------|-------------|
| `publish` | `event: string`, `payload: object` | Publish event |
| `analytics` | `event?: string` | Event analytics |

### Additional Modules

INTEGRATION, INCLUSIVE, MEMORY, RELAY, AUDIT, IDENTITY, ECONOMY, SANDBOX, and ENCODE follow the same invocation pattern. See the [Module Actions Registry](../substrate/MODULE-ACTIONS-REGISTRY.md) for the complete action reference.

---

## Authentication

All requests require a valid API key in the Authorization header:

```
Authorization: Bearer pf_live_xxxxxxxxxxxx
```

Keys are scoped to specific modules and actions. Attempting to access a module outside the key's scope returns a `403 FORBIDDEN` error.

---

## Rate Limits

| Plan | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free | 10 | 500 |
| Pro | 100 | 10,000 |
| Enterprise | 1,000 | 100,000 |

Rate limit headers are included in every response:

```
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708000000
```

---

<div align="center">

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
