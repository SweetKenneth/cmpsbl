# CMPSBL OS Substrate — API Reference

**Version 6.3.0 | Scientific Publication**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-004 |
| **Version** | v6.3.0 |
| **Last Updated** | January 2026 |
| **Classification** | Public Research Document |

---

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMPSBL OS SUBSTRATE                          │
├─────────────────────────────────────────────────────────────────┤
│  Created By:        Kenneth E Sweet Jr                          │
│  Organization:      PromptFluid®                                │
├─────────────────────────────────────────────────────────────────┤
│  For licensing or acquisition inquiries:                        │
│  Email: Dev@CMPSBL.com | Phone: (760) FLUID-AI           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. API Overview

The CMPSBL OS Substrate exposes a unified API for all modules, mesh overlays, and zones. This document provides the public interface specification for integration and development.

### 1.1 Base Endpoint

All requests are routed through a single orchestrator endpoint:

```
POST /functions/v1/pf-substrate
```

### 1.2 Request Format

```json
{
  "module": "<module_name>",
  "action": "<action_name>",
  "payload": {
    // Action-specific parameters
  }
}
```

### 1.3 Response Format

```json
{
  "success": true,
  "module": "<module_name>",
  "action": "<action_name>",
  "data": {
    // Response data
  },
  "timestamp": "2026-01-25T00:00:00.000Z",
  "latency_ms": 45
}
```

### 1.4 Error Response

```json
{
  "success": false,
  "module": "<module_name>",
  "action": "<action_name>",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  },
  "warnings": [],
  "timestamp": "2026-01-25T00:00:00.000Z"
}
```

---

## 2. Authentication

### 2.1 API Key Authentication

```
Authorization: Bearer <api_key>
```

API keys are obtained through the ACCESS module and include:
- Scoped permissions
- Rate limiting
- Usage metering

### 2.2 Key Scopes

| Scope | Access Level |
|-------|--------------|
| `*:*` | Full access to all modules |
| `brain:*` | All BRAIN operations |
| `brain:read` | Read-only BRAIN access |
| `brain:write` | Write-only BRAIN access |
| `system:read` | System monitoring only |

---

## 3. Module APIs

### 3.1 SYSTEM Module

#### system.status

Returns current system status.

**Request:**
```json
{
  "module": "system",
  "action": "status"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_health": 100,
    "overall_status": "healthy",
    "modules_count": 14,
    "uptime_ms": 3600000,
    "version": "6.0.0",
    "version": "5.5.0",
    "proof_mode": false
  }
}
```

#### system.health

Returns detailed health metrics for all modules.

**Request:**
```json
{
  "module": "system",
  "action": "health"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_health": 100,
    "overall_status": "healthy",
    "modules": {
      "core": { "health": 100, "status": "healthy", "circuit_state": "closed" },
      "brain": { "health": 100, "status": "healthy", "circuit_state": "closed" }
      // ... all modules and zones
    }
  }
}
```

#### system.diagnostics

Returns comprehensive system diagnostics.

**Request:**
```json
{
  "module": "system",
  "action": "diagnostics",
  "payload": {
    "full": false  // Optional: true for extended diagnostics
  }
}
```

**Response (default):**
```json
{
  "success": true,
  "data": {
    "overall_health": 100,
    "overall_status": "healthy",
    "error_rate": 0.0,
    "heal_attempts": 0,
    "open_circuits": 0,
    "module_count": 14,
    "categories": {
      "kernel": 3,
      "cognitive": 3,
      "operational": 4,
      "admin": 3,
      "orchestrator": 1
    },
    "proof_mode": false
  }
}
```

#### system.modules

Returns module registry information.

**Request:**
```json
{
  "module": "system",
  "action": "modules",
  "payload": {
    "view": "full"  // Optional: "full" for complete registry
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "name": "core",
        "category": "kernel",
        "roles": ["operator"],
        "boot_order": 1,
        "dependencies": [],
        "dependents": ["brain", "decode", "defense"],
        "eligible_for_upgrade": true,
        "capabilities": ["scheduling", "routing", "lifecycle"]
      }
      // ... all modules and zones
    ]
  }
}
```

---

### 3.2 BRAIN Module

#### brain.status

Returns memory system status.

**Request:**
```json
{
  "module": "brain",
  "action": "status"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "memories": 2500,
    "hot_memories": 450,
    "warm_memories": 1500,
    "cold_memories": 550,
    "graph_edges": 3200,
    "reflection_ok": true,
    "graph_ok": true,
    "last_reflection": "2026-01-25T00:00:00.000Z"
  }
}
```

#### brain.remember

Stores a new memory.

**Request:**
```json
{
  "module": "brain",
  "action": "remember",
  "payload": {
    "content": "User prefers dark mode",
    "memory_type": "preference",
    "confidence": 0.9
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "memory_id": "mem_abc123",
    "tier": "hot",
    "score": 0.85
  }
}
```

#### brain.recall

Searches memories using semantic matching.

**Request:**
```json
{
  "module": "brain",
  "action": "recall",
  "payload": {
    "query": "user preferences",
    "limit": 10,
    "tier": "all"  // Optional: "hot", "warm", "cold", "all"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "memories": [
      {
        "id": "mem_abc123",
        "content": "User prefers dark mode",
        "memory_type": "preference",
        "score": 0.85,
        "tier": "hot",
        "relevance": 0.92
      }
    ],
    "total": 1
  }
}
```

#### brain.graph

Returns knowledge graph information.

**Request:**
```json
{
  "module": "brain",
  "action": "graph",
  "payload": {
    "mode": "summary"  // "summary", "inspect", "stats", "export"
  }
}
```

**Response (summary):**
```json
{
  "success": true,
  "data": {
    "total_nodes": 2500,
    "total_edges": 3200,
    "density": 1.28,
    "top_node_types": ["doctrine", "reflection", "preference"],
    "hub_nodes": [
      { "id": "node_1", "label": "Core Doctrine", "degree": 45 }
    ]
  }
}
```

---

### 3.3 NEXUS Module

#### nexus.status

Returns router status.

**Request:**
```json
{
  "module": "nexus",
  "action": "status"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "active_providers": 8,
    "healthy_providers": 8,
    "primary_provider": "provider_a",
    "fallback_enabled": true,
    "total_requests": 10000,
    "success_rate": 99.5
  }
}
```

#### nexus.route

Routes a request to the best available provider.

**Request:**
```json
{
  "module": "nexus",
  "action": "route",
  "payload": {
    "prompt": "Summarize this document",
    "provider": "auto",  // Optional: specific provider or "auto"
    "options": {
      "max_tokens": 1000,
      "temperature": 0.7
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Document summary...",
    "provider_used": "provider_a",
    "tokens_used": 450,
    "latency_ms": 1200,
    "cost_millicents": 5
  }
}
```

#### nexus.providers

Lists available providers.

**Request:**
```json
{
  "module": "nexus",
  "action": "providers"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "name": "provider_a",
        "status": "healthy",
        "health_score": 100,
        "priority": 1,
        "capabilities": ["text", "code", "analysis"]
      }
      // ... additional providers
    ]
  }
}
```

---

### 3.4 CORTEX Module

#### cortex.status

Returns orchestrator status.

**Request:**
```json
{
  "module": "cortex",
  "action": "status"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "state": "active",
    "panic_frozen": false,
    "pending_proposals": 0,
    "active_sequences": 0,
    "last_dispatch": "2026-01-25T00:00:00.000Z"
  }
}
```

#### cortex.world

Returns module world snapshot.

**Request:**
```json
{
  "module": "cortex",
  "action": "world",
  "payload": {
    "view": "default"  // "default", "dag", "roles", "eligible"
  }
}
```

**Response (default):**
```json
{
  "success": true,
  "data": {
    "categories": {
      "kernel": ["core", "ripple", "access"],
      "cognitive": ["brain", "decode", "dream"],
      "operational": ["defense", "nexus", "vision", "integration"],
      "admin": ["system", "modernizer"],
      "orchestrator": ["cortex"]
    },
    "counts": {
      "kernel": 3,
      "cognitive": 3,
      "operational": 4,
      "admin": 2,
      "orchestrator": 1,
      "total": 13
    }
  }
}
```

**Response (dag):**
```json
{
  "success": true,
  "data": {
    "dag": {
      "nodes": ["core", "brain", "vision", "..."],
      "edges": [
        { "from": "core", "to": "brain" },
        { "from": "brain", "to": "vision" }
      ]
    }
  }
}
```

#### cortex.inventory

Returns module inventory.

**Request:**
```json
{
  "module": "cortex",
  "action": "inventory",
  "payload": {
    "eligible_only": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "name": "brain",
        "category": "cognitive",
        "roles": ["observer", "operator"],
        "health_score": 100,
        "circuit_state": "closed",
        "eligible_for_upgrade": true,
        "shadow_supported": true,
        "production_supported": true
      }
      // ... all modules
    ]
  }
}
```

#### cortex.plan

Returns evolution sequences.

**Request:**
```json
{
  "module": "cortex",
  "action": "plan",
  "payload": {
    "eligible_only": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sequences": [
      {
        "sequence_id": "seq_001",
        "target_modules": ["brain", "vision"],
        "risk_level": "low",
        "required_roles": ["operator"],
        "ready": true,
        "reason": "All target modules healthy and eligible"
      }
    ],
    "message": "1 sequence eligible for execution"
  }
}
```

---

### 3.5 VISION Module

#### vision.pulse

Returns real-time system pulse.

**Request:**
```json
{
  "module": "vision",
  "action": "pulse"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-01-25T00:00:00.000Z",
    "overall_health": 100,
    "active_modules": 13,
    "requests_per_minute": 120,
    "error_rate": 0.0,
    "p50_latency_ms": 45,
    "p95_latency_ms": 120,
    "p99_latency_ms": 250
  }
}
```

#### vision.inspect

Inspects observability state.

**Request:**
```json
{
  "module": "vision",
  "action": "inspect",
  "payload": {
    "include_links": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tracked_modules": 13,
    "module_list": ["core", "brain", "..."],
    "circuits_open": 0,
    "heals_total": 5,
    "last_heal": "2026-01-24T12:00:00.000Z",
    "telemetry_providers": ["internal", "provider_a", "provider_b"]
  }
}
```

#### vision.diagnostics

Returns observability diagnostics.

**Request:**
```json
{
  "module": "vision",
  "action": "diagnostics",
  "payload": {
    "full": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "2.0.0",
    "uptime_ms": 3600000,
    "uptime_human": "1h 0m 0s",
    "tracking_enabled": true,
    "modules_tracked": 13,
    "error_rate_1h": 0.0
  }
}
```

---

## 4. Rate Limiting

### 4.1 Default Limits

| Tier | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free | 10 | 1,000 |
| Developer | 60 | 10,000 |
| Enterprise | 1,000 | Unlimited |

### 4.2 Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706140800
```

### 4.3 Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45 seconds."
  },
  "retry_after": 45
}
```

---

## 5. Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Malformed request body |
| `UNAUTHORIZED` | Missing or invalid API key |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Module or action not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `MODULE_UNAVAILABLE` | Module circuit is open |
| `INTERNAL_ERROR` | Unexpected server error |
| `VALIDATION_ERROR` | Parameter validation failed |
| `PROOF_MODE_BLOCKED` | Write operation blocked in proof mode |

---

## 6. Webhooks

### 6.1 Event Types

| Event | Description |
|-------|-------------|
| `memory.stored` | New memory created |
| `memory.recalled` | Memory accessed |
| `health.degraded` | Module health dropped |
| `circuit.opened` | Circuit breaker tripped |
| `proposal.created` | New improvement proposed |

### 6.2 Webhook Payload

```json
{
  "event": "memory.stored",
  "timestamp": "2026-01-25T00:00:00.000Z",
  "data": {
    "memory_id": "mem_abc123",
    "memory_type": "preference",
    "tier": "hot"
  }
}
```

---

## 7. SDK Integration

### 7.1 TypeScript SDK

```typescript
import { substrate } from '@cmpsbl/sdk';

// Initialize
const client = substrate.init({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-substrate-endpoint'
});

// Use module shortcuts
await client.brain.remember({ content: 'Test', memory_type: 'general' });
await client.system.health();
await client.nexus.route({ prompt: 'Hello world' });
```

### 7.2 Generic HTTP

```bash
curl -X POST https://your-endpoint/functions/v1/pf-substrate \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "system",
    "action": "status"
  }'
```

---

## 8. Contact

For API access, licensing, or support:

| Contact | Details |
|---------|---------|
| **Creator** | Kenneth E Sweet Jr |
| **Organization** | PromptFluid® |
| **Email** | promptfluid@gmail.com |
| **Phone** | (214) 548-0883 |

---

*CMPSBL OS Substrate v5.5.0*
*© 2025-2026 PromptFluid®. All rights reserved.*
