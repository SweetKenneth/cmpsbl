# RELAY Module

**CMPSBL® Substrate — Infrastructure Layer | v9.1.0 ARCHITECT Epoch**

---

## Overview

The **RELAY** module provides centralized outbound webhook delivery and side-effect orchestration. It ensures reliable, auditable delivery of events to external systems with retry logic, circuit breaking, and dead-letter queuing.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| **Webhook Dispatch** | Reliable HTTP delivery with retries | FREE |
| **Event Fanout** | One event → multiple destinations | Builder |
| **Circuit Breaker** | Automatic endpoint health management | Builder |
| **Dead-Letter Queue** | Failed deliveries stored for replay | Pro |
| **Intelligent Routing** | Route events by content/type/priority | Pro |
| **Delivery Guarantees** | At-least-once with deduplication | Enterprise |

---

## Architecture

```
┌───────────────────────────────────┐
│          RELAY MODULE             │
├───────────────────────────────────┤
│  Dispatch Engine                  │
│  ├── HTTP/HTTPS delivery          │
│  ├── Exponential backoff          │
│  └── HMAC signature verification  │
├───────────────────────────────────┤
│  Circuit Breaker                  │
│  ├── Per-endpoint health tracking │
│  ├── Half-open probe cycle        │
│  └── Automatic recovery           │
├───────────────────────────────────┤
│  Dead-Letter Queue                │
│  ├── Failed delivery storage      │
│  ├── Manual/automatic replay      │
│  └── TTL-based expiration         │
└───────────────────────────────────┘
```

---

## SDK Usage

```typescript
import { substrate } from '@cmpsbl/sdk';

// Register a webhook endpoint
await substrate.relay.register({
  url: 'https://api.example.com/webhook',
  events: ['brain.memory.created', 'dream.cycle.complete'],
  secret: 'whsec_...',
  retries: 3
});

// Dispatch an event
await substrate.relay.dispatch({
  event: 'task.completed',
  payload: { taskId: '123', result: 'success' },
  priority: 'high'
});

// Check delivery status
const status = await substrate.relay.deliveryStatus('dlv_abc123');
```

---

## Integration Points

| Module | Integration |
|--------|-------------|
| RIPPLE | Internal events forwarded to external via RELAY |
| AUDIT | Every delivery logged with tamper-evident hash |
| DEFENSE | Rate limiting on outbound delivery |
| VISION | Delivery latency/failure metrics |

---

*CMPSBL® RELAY Module — v9.1.0 ARCHITECT Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
