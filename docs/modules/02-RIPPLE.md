<div align="center">

# 📡 RIPPLE Module — Deep Dive

**Layer:** Kernel · **Boot Order:** 2 · **Dependencies:** CORE

**v9.3.0 ARCHITECT Epoch**

</div>

---

## Purpose

RIPPLE is the **event bus and message orchestration layer**. It provides asynchronous communication between all 21 modules using a hybrid PUSH/PULL delivery model with built-in circuit breaker integration.

Every inter-module communication flows through RIPPLE.

---

## Capabilities

| Capability | Description |
|-----------|-------------|
| Event Publishing | Emit events to named topics |
| Subscription Registry | Declarative topic subscriptions with wildcards |
| Job Queue | Persistent job queue with retry and dead-letter support |
| Fan-Out | Automatic event distribution to all subscribers |
| Circuit Breaker Integration | Skip delivery to unhealthy subscribers |
| Event Replay | Re-deliver past events for recovery |

---

## Architecture

### Hybrid Delivery Model

RIPPLE supports both delivery patterns:

**PUSH Model (Default)**
```
Publisher → RIPPLE → Fan-out to all subscribers → Jobs created per subscriber
```
- Automatic delivery
- Fire-and-forget semantics
- Jobs created for each subscriber
- Best for real-time notifications

**PULL Model**
```
Publisher → RIPPLE → Job Queue → Worker calls ripple.work → Process → Ack/Nack
```
- Manual job processing
- Explicit acknowledgment
- Back-pressure support
- Best for heavy processing

---

## Topic System

Events are organized by hierarchical topics with wildcard support:

| Pattern | Matches |
|---------|---------|
| `memory.stored` | Exact match only |
| `memory.*` | Any memory event |
| `*.started` | Any module's started event |
| `*.*` | All events (use sparingly) |

### Reserved Topics

| Topic | Purpose |
|-------|---------|
| `core.*` | Module lifecycle events |
| `health.*` | Health score changes |
| `circuit.*` | Circuit breaker state changes |
| `dream.*` | Dream cycle events |
| `evolution.*` | Modernizer proposals |
| `security.*` | Defense alerts |

---

## Job Lifecycle

```
┌─────────┐     ┌─────────┐     ┌───────────┐     ┌───────────┐
│ PENDING │────►│ RUNNING │────►│ SUCCEEDED │     │   DEAD    │
│         │     │         │     │           │     │  LETTER   │
└─────────┘     └────┬────┘     └───────────┘     └───────────┘
                     │                                  ▲
                     │          ┌──────────┐            │
                     └─────────►│  FAILED  │────────────┘
                                │          │  (after max retries)
                                └──────┬───┘
                                       │
                                       └──► Retry (with backoff)
```

### Job States

| State | Description | Retention |
|-------|-------------|-----------|
| `pending` | Awaiting processing | Until processed |
| `running` | Currently executing | Duration of execution |
| `succeeded` | Completed successfully | 24 hours |
| `failed` | Execution failed, may retry | Until retry or dead letter |
| `dead_letter` | Exceeded retry limit | 7 days |

---

## Retry Policy

| Parameter | Default |
|-----------|---------|
| Max retries | 3 |
| Backoff strategy | Exponential |
| Base delay | 1,000 ms |
| Max delay | 30,000 ms |
| Jitter | ±20% |

```
delay = min(base × 2^attempt, max_delay) × (1 + random(-0.2, 0.2))
```

---

## Circuit Breaker Integration

RIPPLE monitors subscriber health before delivery:

| Subscriber State | Delivery Behavior |
|-----------------|-------------------|
| `closed` (healthy) | Normal delivery |
| `open` (unhealthy) | Skip delivery, queue for later replay |
| `half-open` (testing) | Deliver one test event, monitor result |

When a subscriber's circuit opens, RIPPLE:
1. Stops delivering events to that subscriber
2. Queues events for replay when circuit closes
3. Emits `circuit.opened` event
4. After recovery timeout, delivers test event
5. If test succeeds, replays queued events

---

## Terminal Commands

| Command | Description |
|---------|-------------|
| `ripple.status` | Bus status and statistics |
| `ripple.jobs` | View pending jobs (filterable by topic, state) |
| `ripple.events` | Recent events (last 100) |
| `ripple.publish` | Manually emit an event |
| `ripple.work` | Process next pending job |
| `ripple.ack` | Acknowledge job completion |
| `ripple.nack` | Negative acknowledgment (trigger retry) |
| `ripple.replay` | Replay a specific event |
| `ripple.drain` | Process all pending jobs in queue |
| `ripple.subscribers` | List all active subscriptions |

---

## Events Emitted

| Event | When |
|-------|------|
| `ripple.started` | RIPPLE boots successfully |
| `ripple.event_published` | Any event published |
| `ripple.job_completed` | Job finishes (success or failure) |
| `ripple.dead_letter` | Job moved to dead letter |
| `ripple.queue_depth_warning` | Queue exceeds 80% capacity |

---

## Performance

| Metric | Value |
|--------|-------|
| Boot time | ~3ms |
| Publish latency | < 5ms |
| Fan-out capacity | 1,000 subscribers |
| Queue depth (max) | 10,000 jobs |
| Event retention | 7 days |
| Throughput | 10,000 events/second |

---

## Integration with Every Module

RIPPLE is the nervous system — every module both publishes to and subscribes from RIPPLE:

```
CORE ──publish──► RIPPLE ──deliver──► BRAIN (memory events)
BRAIN ──publish──► RIPPLE ──deliver──► DREAM (synthesis triggers)
DREAM ──publish──► RIPPLE ──deliver──► MODERNIZER (improvement proposals)
DEFENSE ──publish──► RIPPLE ──deliver──► SYSTEM (security alerts)
```

---

<div align="center">

*CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
