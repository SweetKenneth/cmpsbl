# RIPPLE — Event Bus Node

## Purpose
RIPPLE is the signal and event bus for the substrate. It handles event emission, subscription, batching, deduplication, and cross-module event propagation.

## Namespace
`ripple.*`

## Command Examples
```
ripple.emit <event>       # Emit a named event
ripple.subscribe <event>  # Subscribe to event stream
ripple.batch              # Flush event batch
ripple.stats              # Event throughput statistics
ripple.recent             # Recent event log
```

## Response Shape
```typescript
interface EventRecord {
  id: string;
  module: string;
  action: string;
  outcome: 'started' | 'succeeded' | 'failed';
  timestamp: string;
  traceId: string;
  metadata?: Record<string, unknown>;
}
```

## Failure Modes
- **Event flood**: High-volume emission exceeds buffer → oldest events dropped with warning
- **Subscriber timeout**: Slow subscriber blocks propagation → async detachment
- **Deduplication miss**: Duplicate events not caught → idempotency at handler level

## Governance Implications
- Event emission is not governed (fire-and-forget by design)
- Event subscriptions are audited for sensitive event types
- RELAY (webhook dispatch) is a downstream consumer of RIPPLE events
