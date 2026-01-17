# promptfluid® Substrate — API Reference

**v2026.01 — Complete API Documentation**

---

## Endpoint

```
POST https://[project-id].supabase.co/functions/v1/pf-substrate
```

---

## Request Format

```json
{
  "module": "brain|decode|defense|nexus|vision|dream|system",
  "action": "<action-name>",
  "payload": { ... }
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { ... },
  "timestamp": "2026-01-17T12:00:00.000Z",
  "substrate_version": "3.11.0"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "module": "brain",
  "action": "query",
  "timestamp": "2026-01-17T12:00:00.000Z"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request (invalid module/action) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (blocked/insufficient permissions) |
| `404` | Not found (unknown module/action) |
| `422` | Validation error (invalid payload) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Authentication

### Public Endpoints
No authentication required:
- All `status` actions
- `vision.health`, `vision.pulse`
- `dream.feed` (rate-limited)

### Authenticated Endpoints
Require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| IP (general) | 100 requests / 5 minutes |
| IP (chat) | 20 requests / 5 minutes |
| IP (dream feed) | 15 requests / 5 minutes |
| Authenticated user | 500 requests / 5 minutes |
| Daily per account | 5,000 requests / day |

---

## Module: Brain

Memory, learning, and reflection operations.

### brain/status
Get module health status.

**Payload:** None

**Response:**
```json
{
  "status": "healthy",
  "memories_count": 1250,
  "hot_memories": 50,
  "cold_memories": 1200,
  "last_reflection": "2026-01-17T00:00:00Z"
}
```

---

### brain/query
Search memories by text.

**Payload:**
```json
{
  "query_text": "machine learning",
  "limit": 10,
  "type": "fact"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query_text` | string | Yes | Search query |
| `limit` | number | No | Max results (default: 20) |
| `type` | string | No | Filter by memory type |

---

### brain/remember
Store a new memory.

**Payload:**
```json
{
  "content": "Neural networks learn through backpropagation",
  "memory_type": "fact",
  "source": "user_input",
  "confidence": 0.9,
  "metadata": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Memory content |
| `memory_type` | string | Yes | Type classification |
| `source` | string | No | Origin of memory |
| `confidence` | number | No | Confidence score (0-1) |
| `metadata` | object | No | Additional metadata |

---

### brain/reflect
Trigger daily reflection cycle.

**Payload:**
```json
{
  "date": "2026-01-17"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | No | Reflection date (default: today) |

---

### brain/reinforce
Boost memory confidence.

**Payload:**
```json
{
  "memory_id": "uuid",
  "boost": 0.1
}
```

---

### brain/dream
Run autonomous dream cycle.

**Payload:**
```json
{
  "seed": "optional seed",
  "mode": "standard"
}
```

---

### brain/coherence_check
Validate memory coherence across tiers.

**Payload:**
```json
{
  "depth": "standard"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `depth` | string | No | `standard` or `deep` |

---

### brain/graph_summary
Get knowledge graph structure summary.

**Payload:** None

**Response:**
```json
{
  "node_count": 500,
  "edge_count": 1200,
  "avg_connections": 2.4,
  "clusters": 12
}
```

---

### brain/session_reflection
Cross-module session activity reflection.

**Payload:**
```json
{
  "hours": 24
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hours` | number | No | Lookback window (1-168) |

---

## Module: Decode

Human interface and intent parsing.

### decode/status
Get module status.

---

### decode/chat
Process conversational message.

**Payload:**
```json
{
  "message": "What can you help me with?",
  "sessionId": "session_123",
  "conversationHistory": []
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User message |
| `sessionId` | string | No | Session identifier |
| `conversationHistory` | array | No | Previous messages |

---

### decode/intent
Extract structured intent from message.

**Payload:**
```json
{
  "message": "I need to analyze my website performance"
}
```

**Response:**
```json
{
  "intent": "analyze_website",
  "entities": {
    "target": "website",
    "action": "performance_analysis"
  },
  "confidence": 0.92
}
```

---

### decode/dream
Generate dream content.

**Payload:**
```json
{
  "seed": "optional seed",
  "mood": "contemplative"
}
```

---

## Module: Defense

Security, bot detection, and threat analysis.

### defense/status
Get module status.

---

### defense/analyze
Analyze request for threats.

**Payload:**
```json
{
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "fingerprint": { "canvas": "...", "webgl": "..." }
}
```

**Response:**
```json
{
  "risk_score": 15,
  "is_bot": false,
  "threats": [],
  "recommendation": "allow"
}
```

---

### defense/reputation
Get IP reputation score.

**Payload:**
```json
{
  "ip_address": "192.168.1.1"
}
```

**Response:**
```json
{
  "ip": "192.168.1.1",
  "score": 85,
  "classification": "trusted",
  "last_seen": "2026-01-17T12:00:00Z",
  "total_requests": 150
}
```

---

### defense/ip_intel
Comprehensive IP intelligence report.

**Payload:**
```json
{
  "ip_address": "192.168.1.1",
  "include_history": true
}
```

**Response:**
```json
{
  "ip": "192.168.1.1",
  "reputation": { "score": 85, "classification": "trusted" },
  "activity": { "total_requests": 150, "blocked_count": 0 },
  "threat_indicators": [],
  "recommendations": ["continue_monitoring"]
}
```

---

### defense/anomaly_probe
Statistical anomaly detection.

**Payload:**
```json
{
  "lookbackHours": 24
}
```

---

### defense/posture
Consolidated security posture.

**Payload:** None

---

### defense/limits
Rate limit status.

**Payload:** None

---

## Module: Nexus

Multi-provider AI routing.

### nexus/status
Get available providers.

---

### nexus/route
Route to best available provider.

**Payload:**
```json
{
  "prompt": "Explain quantum computing",
  "systemPrompt": "You are a helpful assistant",
  "temperature": 0.7
}
```

**Response:**
```json
{
  "response": "Quantum computing is...",
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "tokens_used": 150,
  "latency_ms": 450
}
```

---

### nexus/providers
Provider availability matrix.

**Payload:** None

**Response:**
```json
{
  "providers": {
    "groq": { "available": true, "latency_avg": 200 },
    "cerebras": { "available": true, "latency_avg": 350 },
    "together": { "available": true, "latency_avg": 400 },
    "deepseek": { "available": false, "latency_avg": null }
  }
}
```

---

### nexus/route_stats
AI routing analytics (24h).

**Payload:** None

---

## Module: Vision

Observability and monitoring.

### vision/status
Get module status.

---

### vision/health
System-wide health check.

**Payload:** None

**Response:**
```json
{
  "status": "healthy",
  "modules": {
    "brain": "healthy",
    "decode": "healthy",
    "defense": "healthy",
    "nexus": "healthy",
    "dream": "healthy",
    "system": "healthy"
  },
  "uptime_seconds": 86400
}
```

---

### vision/pulse
Ultra-lightweight heartbeat (no DB queries).

**Payload:** None

**Response:**
```json
{
  "alive": true,
  "timestamp": "2026-01-17T12:00:00Z",
  "version": "3.11.0"
}
```

---

### vision/metrics
System metrics.

**Payload:**
```json
{
  "period": "24h",
  "type": "performance"
}
```

---

### vision/introspection
Deep substrate self-analysis.

**Payload:** None

---

### vision/quota
AI usage quota observability.

**Payload:** None

---

### vision/dependency_map
Module dependency analysis.

**Payload:** None

**Response:**
```json
{
  "modules": {
    "brain": { "status": "healthy", "dependencies": ["database"] },
    "decode": { "status": "healthy", "dependencies": ["brain", "nexus"] }
  },
  "cascade_risks": []
}
```

---

### vision/dashboard
Dashboard data aggregation.

**Payload:** None

---

### vision/health_snapshot
Quick consolidated health check.

**Payload:** None

---

## Module: Dream

Dream processing and autonomous cognition.

### dream/status
Get Dream-Eater state.

---

### dream/feed
Submit dream for processing (public, rate-limited).

**Payload:**
```json
{
  "dream_content": "I was floating through an endless library...",
  "dream_type": "dream"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dream_content` | string | Yes | Dream text |
| `dream_type` | string | No | `dream` or `nightmare` |

---

### dream/cycle
Execute dream cycle.

**Payload:**
```json
{
  "force": false,
  "send_email": false
}
```

---

### dream/awaken
Awaken Dream-Eater.

**Payload:**
```json
{
  "action": "awaken"
}
```

---

## Module: System

Administration and configuration.

### system/status
Global system status.

---

### system/health
Full system health.

---

### system/version
Get substrate version.

**Response:**
```json
{
  "version": "3.11.0",
  "build": "2026.01.17",
  "environment": "production"
}
```

---

### system/audit
Query audit log.

**Payload:**
```json
{
  "since": "2026-01-10",
  "action_type": "security"
}
```

---

### system/backup
Create system backup.

**Payload:**
```json
{
  "include_data": true,
  "tables": ["brain_memories", "defense_events"]
}
```

---

### system/heal
Trigger self-healing.

**Payload:**
```json
{
  "target": "brain",
  "force": false
}
```

---

### system/restart
Restart service.

**Payload:**
```json
{
  "service": "brain"
}
```

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
