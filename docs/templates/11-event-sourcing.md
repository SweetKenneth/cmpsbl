# 11 — Event Sourcing Engine

> **Module:** MEMORY | **Source:** `src/crownjewels/s-tier/014-event-sourcing.ts`

Append-only event store with materialized view projections, snapshots, event replay, stream isolation, and temporal queries. Foundation for CQRS, audit trails, and undo/redo systems.

## Quick Start

```typescript
import { createEventStore } from './event-sourcing';

const store = createEventStore();

// Register a projection
store.registerProjection({
  name: 'balance',
  initialState: { balance: 0, transactions: 0 },
  handlers: {
    'deposit': (state, event) => ({
      balance: state.balance + (event.payload as any).amount,
      transactions: state.transactions + 1,
    }),
    'withdrawal': (state, event) => ({
      balance: state.balance - (event.payload as any).amount,
      transactions: state.transactions + 1,
    }),
  },
});

// Append events
store.append('account_001', 'deposit', { amount: 100 });
store.append('account_001', 'withdrawal', { amount: 30 });
store.append('account_001', 'deposit', { amount: 50 });

// Project current state
const balance = store.project('balance', 'account_001');
// { balance: 120, transactions: 3 }

// Correlation tracking
store.append('order_1', 'created', { items: 3 }, { correlationId: 'saga_42' });
store.append('order_1', 'paid', { amount: 99 }, { correlationId: 'saga_42' });
const saga = store.getByCorrelation('saga_42'); // both events
```

## API Reference

| Method | Description |
|--------|-------------|
| `append(stream, type, payload, meta?)` | Append event to stream |
| `appendBatch(stream, events)` | Append multiple events atomically |
| `getStream(stream, opts?)` | Get events for a stream (with version range) |
| `getByType(type, opts?)` | Get events by type across all streams |
| `getByCorrelation(id)` | Get all events in a correlation group |
| `registerProjection(proj)` | Register a materialized view projection |
| `project(name, stream)` | Compute current state from events |
| `takeSnapshot(name, stream)` | Cache projection state for performance |
| `replay(stream, handler, opts?)` | Replay events through a handler |
| `getStats()` | Get store statistics |

## Use Cases

- **Financial ledgers** — Immutable transaction history with balance projections
- **CQRS architectures** — Separate read/write models
- **Undo/redo** — Replay events to any point in time
- **Distributed sagas** — Track multi-service workflows via correlation
