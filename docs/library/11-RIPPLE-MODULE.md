# CMPSBL OS Substrate — RIPPLE Module Deep Dive

**Version 8.5.0 (SYNERGY+ Epoch) | Production Ready**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-011 |
| **Module** | RIPPLE |
| **Layer** | Kernel |
| **Version** | v8.0.0 |
| **Capabilities** | 5 |

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

## 1. Module Overview

RIPPLE is the message bus and event orchestration layer of the substrate, providing asynchronous communication between all modules.

| Property | Value |
|----------|-------|
| **Name** | RIPPLE |
| **Layer** | Kernel |
| **Boot Order** | 2 |
| **Dependencies** | CORE |
| **Capabilities** | 5 |

---

## 2. Capabilities (5)

### 2.1 Core Synergies (1)

| Capability | Description | Modules | Risk |
|------------|-------------|---------|------|
| `intent_amplification` | Transforms vague user intent into precise actions | DECODE, RIPPLE, INCLUSIVE | Low |

### 2.2 NEW High-Value Capabilities (4) — v7.6.0

| Capability | Description | Risk |
|------------|-------------|------|
| `event_correlation_engine` | Links related events across time windows to identify patterns and root causes | Low |
| `message_deduplication_guard` | Prevents duplicate event processing with content-hash and idempotency tracking | Low |
| `broadcast_throttle_manager` | Intelligent rate limiting for broadcasts to prevent subscriber overload | Low |
| `subscription_health_monitor` | Monitors subscriber connection health and auto-heals stale subscriptions | Low |

### 2.3 Capability Usage

```typescript
import { capabilityEngine } from '@/lib/substrate/capabilities';

// Correlate events
const correlations = await capabilityEngine.execute('event_correlation_engine', {
  eventTypes: ['user.action', 'system.response'],
  timeWindow: '5m',
  correlationKey: 'sessionId'
});

// Monitor subscription health
const health = await capabilityEngine.execute('subscription_health_monitor', {
  namespace: 'brain.*'
});
```

---

## 3. Architecture

### 3.1 Hybrid Delivery Model

RIPPLE implements both PUSH and PULL delivery:

**PUSH Model:**
- Automatic event fan-out to subscribers
- Jobs created for each subscriber
- Fire-and-forget semantics

**PULL Model:**
- Manual job processing via `ripple.work`
- Worker loop pattern
- Explicit acknowledgment required

### 3.2 Event Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Module    │───►│   RIPPLE    │───►│ Subscribers │
│  (Publisher)│    │    Bus      │    │  (Workers)  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       │    publish()     │    fan-out       │
       └──────────────────┴──────────────────┘
```

---

## 4. Key Concepts

### 4.1 Topics

Events are organized by topic:

| Topic Pattern | Description |
|---------------|-------------|
| `memory.*` | Memory operations |
| `health.*` | Health events |
| `proposal.*` | Evolution proposals |
| `circuit.*` | Circuit breaker events |

### 4.2 Job States

| State | Description |
|-------|-------------|
| `pending` | Awaiting processing |
| `running` | Currently executing |
| `succeeded` | Completed successfully |
| `failed` | Execution failed |
| `dead_letter` | Exceeded retry limit |

---

## 5. Key Operations

| Operation | Description |
|-----------|-------------|
| `ripple.status` | Bus status |
| `ripple.jobs` | View pending jobs |
| `ripple.events` | Recent events |
| `ripple.publish` | Emit an event |
| `ripple.work` | Process next job |
| `ripple.ack` | Acknowledge completion |
| `ripple.nack` | Negative acknowledgment |
| `ripple.replay` | Replay an event |
| `ripple.drain` | Drain queue |

---

## 6. Performance Characteristics

| Metric | Value |
|--------|-------|
| Boot time | ~3ms |
| Publish latency | <5ms |
| Fan-out capacity | 1,000 subscribers |
| Queue depth | 10,000 jobs |
| Event correlation | <20ms |
| Deduplication check | <2ms |

---

## 7. Changelog

### v7.6.0 (2026-02-06) — SYNERGY+ Epoch
- **4 NEW Capabilities**: event_correlation_engine, message_deduplication_guard, broadcast_throttle_manager, subscription_health_monitor
- **Total Capabilities**: 5

---

### v8.5.0 (2026-02-11) — Infrastructure Integration
- **Correlation ID Propagation** (`substrate/correlation-id/`): End-to-end request tracing across modules and edge functions. Context forking, span tracking, header extraction. `createCorrelation()`, `propagate()`, `forkContext()`. **Tier: Builder**
- **Event Replay** (`substrate/event-replay/`): Deterministic event replay for debugging and testing. `replay()`, `replayRange()`, `getReplayStatus()`. **Tier: Builder**
- **Realtime Bridge** (`substrate/realtime-bridge/`): Syncs the module communication bus with Supabase realtime channels. `bridgeChannel()`, `syncState()`, `disconnect()`. **Tier: Builder**
- **Module Communication Bus** (`substrate/module-bus/`): Pub/sub communication layer for real-time inter-module signaling. `publish()`, `subscribe()`, `broadcast()`. **Tier: Builder**
- **Total Capabilities**: 5 + 4 infrastructure = 9

---

*CMPSBL OS Substrate v8.5.0 — SYNERGY+ Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
