# promptfluid® api reference

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-API-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Type | Cognitive Orchestration Substrate |

---

## Overview

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

---

## API Overview

promptfluid exposes functionality through Supabase Edge Functions, providing a serverless API layer with automatic scaling and global distribution.

### Base URL

```
https://{PROJECT_ID}.supabase.co/functions/v1/
```

### Authentication

| Mode | Header | Use Case |
|------|--------|----------|
| Anonymous | None | Public endpoints |
| JWT | `Authorization: Bearer {token}` | User-authenticated |
| Service | `Authorization: Bearer {service_role_key}` | Server-to-server |

---

## Brain Substrate APIs

### POST /pf-brain

Main orchestration endpoint for brain interactions.

**Request:**
```json
{
  "action": "query" | "learn" | "reflect" | "dream",
  "payload": {
    "content": "string",
    "context": "object",
    "options": "object"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "string",
    "memories_used": ["uuid"],
    "confidence": 0.85,
    "metadata": {}
  }
}
```

### GET /pf-brain-status

Health and status check for brain module.

### POST /pf-brain-learn

Ingest new information into brain memory.

### POST /pf-brain-reflect

Trigger reflection cycle.

### POST /pf-brain-dream

Initiate dream cycle.

---

## Nexus Routing APIs

### POST /pf-nexus-router

Unified AI routing endpoint.

**Request:**
```json
{
  "prompt": "string",
  "task_type": "chat" | "code" | "analysis" | "creative" | "research",
  "model_preference": "string",
  "max_tokens": 2000,
  "temperature": 0.7,
  "stream": false
}
```

**Response:**
```json
{
  "success": true,
  "response": "string",
  "model_used": "groq/llama-3.3-70b",
  "provider": "groq",
  "tokens": {
    "input": 150,
    "output": 500,
    "total": 650
  },
  "latency_ms": 1234,
  "cost_usd": 0.00065
}
```

### POST /pf-nexus-text

Text generation endpoint.

### POST /pf-nexus-image

Image generation endpoint.

### POST /pf-nexus-video

Video generation endpoint.

---

## Defense Intelligence APIs

### POST /pf-bot-detection

Analyze request for bot characteristics.

**Response:**
```json
{
  "is_bot": false,
  "risk_score": 15,
  "action": "allow",
  "signals": {
    "header_score": 10,
    "behavior_score": 5,
    "reputation_score": 20,
    "fingerprint_score": 10
  },
  "recommendation": "allow"
}
```

### POST /pf-defense-event

Log security event.

### GET /pf-defense-rules

Retrieve active defense rules.

---

## Cascade Operative APIs

### POST /pf-cascade-operative

Main operative endpoint.

### POST /pf-cascade-chat

Conversational interface.

### POST /pf-cascade-dream

Trigger dream generation.

### POST /pf-cascade-learn

Ingest learning material.

---

## Vision Observability APIs

### GET /pf-vision-metrics

Retrieve system metrics.

### GET /pf-vision-health

System health check.

---

## Contact & Licensing

**Founder:** Kenneth E Sweet Jr  
**Email:** promptfluid@gmail.com  
**Phone:** (760) FLUID-AI  
**Website:** https://promptfluid.com

For licensing inquiries regarding the promptfluid® substrate, contact promptfluid@gmail.com.

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
