# 05 — NEXUS Routing Engine

**Classification:** 🔒 INTERNAL

---

## 1. Purpose

This document describes the complete architecture of NEXUS, the substrate's AI provider routing engine. NEXUS manages a 14-provider fleet with real-time health tracking, cost optimization, failover cascades, and distributed tracing.

## 2. System Tables

| Table | Purpose |
|-------|---------|
| `nexus_provider_health` | Real-time health scores, latency, uptime per provider |
| `nexus_cost_ledger` | Token usage, cost tracking per provider per period |
| `nexus_traces` | Distributed request tracing across routing decisions |
| `nexus_provider_affinity` | Learned per-task-type provider performance scores |
| `nexus_anomalies` | Detected anomalies in provider behavior |

## 3. Routing Modes

### 3.1 Standard Route (`nexusRoute`)

Default routing mode. Selects the optimal provider based on:
1. Task classification (semantic analysis of input)
2. Provider health score
3. Cost budget remaining
4. Context window size match
5. Learned affinity for task type

### 3.2 Stream Route (`nexusStreamRoute`)

Native SSE (Server-Sent Events) support for streaming responses. Maintains an open connection and streams tokens as they are generated.

### 3.3 Consensus Route (`nexusConsensusRoute`)

Sends the same request to multiple providers and requires agreement (e.g., 2-of-3) before returning a result. Used for:
- Critical governance decisions
- High-stakes data classification
- Security-sensitive operations

### 3.4 Image Route (`nexusImageRoute` v2)

Dedicated routing for image generation with a Pro-tier cascade:

```
Google AI Studio (Imagen) → Lovable → FAL.ai → Stability AI
```

Each provider is attempted in order. If a provider fails or returns low quality, the next in the cascade is tried.

## 4. Intelligence Features

### 4.1 Semantic Task Classification

Input is analyzed to determine task category before routing:

| Category | Examples | Preferred Providers |
|----------|---------|-------------------|
| Chat | Conversational responses | Fast, low-cost |
| Analysis | Data interpretation, reasoning | High-capability |
| Generation | Content creation, code | Creative-optimized |
| Code | Programming tasks | Code-specialized |
| Classification | Categorization, labeling | Fast, deterministic |

### 4.2 Token-Aware Routing

Routes requests to providers whose context window can accommodate the input:

```
if input_tokens > provider.max_context_window × 0.9:
  skip provider (too close to limit)
```

### 4.3 Automatic Prompt Compression

When input exceeds all available providers' context windows, NEXUS applies compression:
1. Remove redundant whitespace and formatting
2. Summarize conversation history (keep system + last N turns)
3. Truncate with semantic boundary awareness

## 5. Resilience Features

### 5.1 Request Coalescing

Identical in-flight requests are deduplicated:

```
requestHash = hash(model + messages + parameters)
if inFlightCache.has(requestHash):
  return inFlightCache.get(requestHash)  // Same promise
```

### 5.2 Exponential Backoff with Jitter

Failed requests are retried with:
```
delay = min(baseDelay × 2^attempt + random(0, jitter), maxDelay)
```

| Parameter | Value |
|-----------|-------|
| Base delay | 1000ms |
| Max delay | 30,000ms |
| Jitter range | 0–500ms |
| Max attempts | 3 |

### 5.3 Half-Open Circuit Probes

When a provider's circuit breaker opens:
1. After `openDurationMs`, transition to half-open
2. Allow 1 probe request through
3. If probe succeeds → close circuit
4. If probe fails → reopen circuit, reset timer

## 6. Caching

### Tiered TTL

| Category | TTL | Eviction |
|----------|-----|----------|
| Chat responses | 5 minutes | LRU |
| System queries | 2 hours | LRU |
| Static lookups | 24 hours | LRU |

### LRU Cache

- Maximum 1000 entries
- Cost-aware hit tracking (records cost savings from cache hits)
- Cache key: `hash(model + messages + temperature + maxTokens)`

## 7. Cost Tracking

Every NEXUS call logs:
- Provider used
- Model used
- Input tokens
- Output tokens
- Estimated cost (in millicents)
- Response time
- Success/failure

Daily quota tracking per provider prevents runaway costs.

## 8. Provider Health Monitoring

Each provider is scored on:
- Uptime (rolling 24h)
- Average response time (P95)
- Error rate (rolling 1h)
- Rate limit hits (rolling 1h)

Health scores feed directly into routing weight calculations.

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial NEXUS documentation |

---

© 2025–2026 CMPSBL®. Confidential.
