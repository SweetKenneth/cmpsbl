# RIPPLE — Event Bus & Dead Letter Queue

> **Node ID:** `ripple` · **Sector:** OCG · **Generation:** 1 · **Node #6 of 40**
> **Codename:** *Pulse* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

RIPPLE is the substrate's event bus — the publish/subscribe backbone through which all 40 nodes communicate. Every signal, state change, and telemetry event flows through RIPPLE's typed channels. It provides priority-based routing, fan-out to multiple subscribers, and a Dead Letter Queue (DLQ) for failed deliveries with automatic retry and forensic audit.

---

## Architecture

### Pub/Sub Core

RIPPLE wraps the Module Bus (`module-bus`) with OCG-level compliance:

```
Publisher → RIPPLE validation → Priority routing → Fan-out → Subscriber(s)
                                                      ↓ (failure)
                                                   DLQ → Retry → Audit
```

### Signal Types

| Priority | Type | TTL | Example |
|---|---|---|---|
| `critical` | System-threatening events | 5min | Circuit breaker open |
| `high` | State changes requiring action | 15min | Governance mode change |
| `normal` | Standard operational signals | 1hr | Health heartbeat |
| `low` | Informational/telemetry | 4hr | Telemetry snapshot |

### Dead Letter Queue (DLQ)

Failed deliveries are routed to the DLQ with exponential backoff retry:

```
retry_delay = min(base_delay × 2^attempt, max_delay)
  base_delay = 1000ms
  max_delay = 60000ms
  max_attempts = 5
  jitter = random(0, 0.25 × retry_delay)
```

After max attempts, the message is permanently stored in the DLQ for forensic analysis and emits a `DLQ_EXHAUSTED` signal to AUDIT.

---

## Trade Secrets

### 1. Priority Preemption

Critical signals preempt the processing queue. If RIPPLE is processing a batch of `low` priority events and a `critical` signal arrives, it immediately suspends the batch and processes the critical signal. This ensures circuit breaker trips and governance overrides have sub-millisecond delivery.

### 2. Fan-Out with Backpressure

When a signal has 10+ subscribers and one subscriber is slow, RIPPLE applies per-subscriber backpressure rather than blocking the entire fan-out. Slow subscribers are throttled independently while fast subscribers receive signals at full speed.

### 3. Idempotency Key Deduplication

Every signal carries an optional idempotency key. RIPPLE maintains a 10,000-entry LRU cache of recently-processed keys. Duplicate signals are silently dropped, preventing event storms from cascading.

---

## CLM Learning Priorities

1. **Signal Pattern Optimization** — Learning optimal fan-out topologies based on actual subscriber response times
2. **DLQ Prevention** — Predicting which subscribers are likely to fail and pre-routing signals through backup paths

---

*CMPSBL® Substrate — RIPPLE Node Deep Dive · Founder Eyes Only*
