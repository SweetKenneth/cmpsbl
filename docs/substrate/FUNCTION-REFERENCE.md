# promptfluid® Substrate — Function Reference

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-FNR-001 |
| Version | v2026.01.1 |
| Last Updated | 2026-01-14 |
| Status | ACTIVE |
| Type | Cognitive Orchestration Substrate |

---

## Overview

This document provides a complete reference for all callable functions in the promptfluid® substrate. All functions are accessible via the unified `pf-substrate` endpoint or through the TypeScript SDK.

---

## Quick Start

### API Endpoint

```
POST https://[project-id].supabase.co/functions/v1/pf-substrate
Content-Type: application/json
```

### TypeScript SDK

```typescript
import { substrate, brain, decode, defense, nexus, vision, system, dream } from '@/lib/substrate';

// Using the full client
await substrate.brain.synthesize();

// Using quick-access exports
await brain.synthesize();
```

---

## Brain Module

Memory, learning cycles, reflection, and knowledge synthesis.

### brain.query(query_text, limit?)

Search memories by text content.

```typescript
await brain.query("machine learning", 10);
```

**Parameters:**
- `query_text` (string, required): Text to search for
- `limit` (number, optional): Maximum results (default: 5)

**Returns:** `{ memories: Memory[] }`

---

### brain.remember(content, memory_type, confidence?, metadata?)

Store a new memory in the brain.

```typescript
await brain.remember(
  "Neural networks learn through backpropagation",
  "fact",
  0.9,
  { source: "textbook" }
);
```

**Parameters:**
- `content` (string, required): Memory content
- `memory_type` (string, required): Type classification
- `confidence` (number, optional): Confidence score 0-1 (default: 0.8)
- `metadata` (object, optional): Additional metadata

**Returns:** `{ memory: Memory }`

---

### brain.reflect()

Trigger a daily reflection cycle that synthesizes recent memories.

```typescript
await brain.reflect();
```

**Returns:** `{ reflection: Reflection }`

---

### brain.reinforce(memory_id, boost?)

Strengthen a memory's confidence through positive reinforcement.

```typescript
await brain.reinforce("mem_abc123", 0.1);
```

**Parameters:**
- `memory_id` (string, required): Memory to reinforce
- `boost` (number, optional): Confidence boost (default: 0.1)

**Returns:** `{ memory: Memory }`

---

### brain.dream()

Run an autonomous dream processing cycle.

```typescript
await brain.dream();
```

**Returns:** `{ dream: Dream, processed: number }`

---

### brain.learn(content, source?)

Ingest new knowledge into the brain.

```typescript
await brain.learn("New insight about AI systems", "user_input");
```

**Parameters:**
- `content` (string, required): Content to learn
- `source` (string, optional): Source attribution

**Returns:** `{ learned: true, memory_id: string }`

---

### brain.synthesize()

**NEW in v1.1.0** — Cross-domain cognitive synthesis.

Connects patterns across hot memory, cold memory, learning patterns, dreams, and reflections.

```typescript
await brain.synthesize();
```

**Returns:**
```json
{
  "synthesis": {
    "hot_memories": 15,
    "cold_memories": 10,
    "patterns": ["pattern_1", "pattern_2"],
    "dream_moods": ["contemplative", "curious"],
    "reflection_lessons": [...]
  },
  "insight_id": "ins_abc123"
}
```

---

### brain.forecast(metric?, window?)

**NEW in v1.1.0** — Probabilistic forecasting engine.

Analyzes global signals, defense events, and usage patterns to provide forecast context.

```typescript
await brain.forecast("security", "30d");
```

**Parameters:**
- `metric` (string, optional): Metric to forecast (default: "general")
- `window` (string, optional): Time window (default: "7d")

**Returns:**
```json
{
  "forecast_context": {
    "metric": "security",
    "window": "30d",
    "tech_signals": 12,
    "avg_sentiment": "0.65",
    "threat_activity": 47,
    "ai_usage": 234
  },
  "recent_forecasts": [...]
}
```

---

### brain.status()

Get brain module health and statistics.

```typescript
await brain.status();
```

**Returns:** `{ memories: number, reflections: number }`

---

## Decode Module

Intent decoding, cognitive interface. The interpreter primitive.

### decode.chat(message, sessionId?)

Primary cognitive interpretation interface.

```typescript
await decode.chat("What patterns do you see?", "session_123");
```

**Parameters:**
- `message` (string, required): Message to interpret
- `sessionId` (string, optional): Session for conversation continuity

**Returns:**
```json
{
  "reply": "...",
  "provider": "groq",
  "model": "llama-3.3-70b-versatile"
}
```

---

### decode.learn(content, source?)

Learn from an interaction.

```typescript
await decode.learn("User prefers concise responses", "interaction");
```

**Returns:** `{ learned: true, memory_id: string }`

---

### decode.dream()

Initiate a Decode dream cycle.

```typescript
await decode.dream();
```

**Returns:** `{ dream: Dream }`

---

### decode.propose(idea)

Submit a proposal for substrate consideration.

```typescript
await decode.propose("Add semantic memory search");
```

**Parameters:**
- `idea` (string, required): Proposal text

**Returns:** `{ placeholder: true }` (stub — full implementation pending)

---

### decode.status()

Get Decode module statistics.

```typescript
await decode.status();
```

**Returns:** `{ conversations: number, dreams: number }`

---

## Defense Module

Bot detection, threat analysis, security.

### defense.analyze(fingerprint, ip?)

Analyze a request for bot/threat indicators.

```typescript
await defense.analyze({ canvas: "...", webgl: "..." }, "192.168.1.1");
```

**Parameters:**
- `fingerprint` (object, required): Browser fingerprint data
- `ip` (string, optional): IP address

**Returns:**
```json
{
  "threat_score": 25,
  "risk_level": "low",
  "action": "allow"
}
```

---

### defense.reputation(ip_address)

Get IP reputation score.

```typescript
await defense.reputation("192.168.1.1");
```

**Returns:**
```json
{
  "reputation": {
    "score": 15,
    "total_requests": 47,
    "last_seen": "2026-01-14T..."
  }
}
```

---

### defense.rules()

Get active defense rules.

```typescript
await defense.rules();
```

**Returns:** `{ rules: DefenseRule[] }`

---

### defense.status()

Get defense module statistics.

```typescript
await defense.status();
```

**Returns:** `{ total_events: number, recent_blocks: number }`

---

## Nexus Module

Multi-provider AI routing for text, image, video.

### nexus.text(prompt, model?)

Generate text via intelligent routing.

```typescript
await nexus.text("Explain quantum computing");
```

**Returns:** Stub — use `nexus.route()` for full functionality.

---

### nexus.route(prompt, systemPrompt?, temperature?, maxTokens?)

Route prompt to best available provider.

```typescript
await nexus.route("Summarize this document");
```

**Returns:**
```json
{
  "content": "...",
  "provider": "groq",
  "model": "llama-3.3-70b-versatile"
}
```

---

### nexus.image(prompt, model?)

Generate image (routes to pf-nexus-image).

```typescript
await nexus.image("A cosmic dreamscape");
```

---

### nexus.status()

Get available providers and routing order.

```typescript
await nexus.status();
```

**Returns:**
```json
{
  "providers": ["groq", "cerebras", "together"],
  "routing_order": ["groq", "cerebras", "together", "deepseek"]
}
```

---

## Vision Module

Observability, metrics, health monitoring.

### vision.health()

System-wide health check.

```typescript
await vision.health();
```

**Returns:**
```json
{
  "healthy": true,
  "checks": { "brain": true, "defense": true, "nexus": true }
}
```

---

### vision.metrics()

Get system metrics.

```typescript
await vision.metrics();
```

**Returns:**
```json
{
  "metrics": {
    "brain_memories": 1247,
    "defense_events": 5832,
    "decode_conversations": 423
  }
}
```

---

### vision.logs(module?, limit?)

Get system event logs.

```typescript
await vision.logs("brain", 50);
```

**Returns:** `{ logs: BrainEvent[] }`

---

### vision.alert(severity, message, metadata?)

**NEW in v1.1.0** — Create an alert with telemetry logging.

```typescript
await vision.alert("warn", "High memory usage detected", { usage: 0.85 });
```

**Parameters:**
- `severity` ('info' | 'warn' | 'error' | 'critical', required)
- `message` (string, required): Alert message
- `metadata` (object, optional): Additional context

**Returns:**
```json
{
  "alert_id": "evt_abc123",
  "severity": "warn",
  "message": "High memory usage detected",
  "timestamp": "2026-01-14T..."
}
```

---

### vision.audit(entity?, action?)

Get audit log entries.

```typescript
await vision.audit("brain", "learn");
```

**Returns:** `{ logs: AuditLog[] }`

---

### vision.status()

Get vision module status.

```typescript
await vision.status();
```

---

## Dream Module

Dream-Eater operations.

### dream.status()

Get Dream-Eater state.

```typescript
await dream.status();
```

**Returns:**
```json
{
  "state": {
    "current_mood": "contemplative",
    "mutation_level": 3,
    "dreams_consumed_today": 12
  },
  "total_dreams": 847
}
```

---

### dream.mood(mood?)

Get or set Dream-Eater mood.

```typescript
// Get mood
await dream.mood();

// Set mood
await dream.mood("curious");
```

---

### dream.cycle()

Trigger a dream cycle (redirects to pf-dream-eater-cycle).

```typescript
await dream.cycle();
```

---

## System Module

Administration and configuration.

### system.status()

Get global system status.

```typescript
await system.status();
```

**Returns:**
```json
{
  "substrate": "promptfluid®",
  "version": "2026.01.1",
  "healthy": true,
  "checks": { "brain": true, "defense": true, "decode": true, "nexus": true }
}
```

---

### system.version()

Get substrate version information.

```typescript
await system.version();
```

**Returns:**
```json
{
  "substrate": "promptfluid®",
  "version": "2026.01.1",
  "type": "Cognitive Orchestration Substrate",
  "build": "2026.01.14"
}
```

---

### system.config(key?)

Get configuration settings.

```typescript
await system.config("rate_limits");
```

---

### system.audit()

Get system audit logs.

```typescript
await system.audit();
```

**Returns:** `{ logs: AuditLog[] }`

---

## Provider Rate Limits

All providers operate at 80% of maximum capacity:

| Provider | Requests/Min | Requests/Day |
|----------|--------------|--------------|
| Groq | 24 | 800 |
| Cerebras | 24 | 11,520 |
| SambaNova | 32 | 32 |
| DeepSeek | 8 | 800 |
| Together | 4 | 800 |

**Total Daily Capacity:** 12,352+ calls

---

## Error Handling

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "module": "brain",
  "action": "synthesize",
  "data": { ... },
  "timestamp": "2026-01-14T..."
}
```

**Error:**
```json
{
  "success": false,
  "module": "brain",
  "action": "synthesize",
  "error": "Error message",
  "timestamp": "2026-01-14T..."
}
```

---

## Contact & Licensing

**Founder:** Kenneth E Sweet Jr  
**Email:** promptfluid@gmail.com  
**Phone:** (760) FLUID-AI  
**Website:** https://promptfluid.com

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
