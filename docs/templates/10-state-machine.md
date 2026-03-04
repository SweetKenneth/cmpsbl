# 10 — State Machine

> **Module:** BRAIN | **Source:** `src/crownjewels/s-tier/013-state-machine.ts`

Finite state machine with guards, effects, entry/exit hooks, transition history, and snapshot/restore for persistence. Ideal for workflow orchestration, UI flows, and agent lifecycles.

## Quick Start

```typescript
import { createStateMachine } from './state-machine';

const order = createStateMachine({
  id: 'order',
  initial: 'draft',
  context: { total: 0, items: [] as string[] },
  states: {
    draft: { onEnter: () => console.log('Order started') },
    submitted: {},
    paid: { onEnter: () => console.log('Payment received') },
    shipped: {},
    cancelled: {},
  },
  transitions: [
    { from: 'draft', to: 'submitted', event: 'submit', guard: (ctx) => ctx.items.length > 0 },
    { from: 'submitted', to: 'paid', event: 'pay' },
    { from: 'paid', to: 'shipped', event: 'ship' },
    { from: ['draft', 'submitted'], to: 'cancelled', event: 'cancel' },
  ],
});

order.updateContext(ctx => ({ ...ctx, items: ['widget'] }));
await order.send('submit');   // draft → submitted
console.log(order.state);     // 'submitted'
console.log(order.can('pay')); // true
console.log(order.availableEvents()); // ['pay', 'cancel']
```

## API Reference

| Method | Description |
|--------|-------------|
| `send(event)` | Attempt a transition |
| `can(event)` | Check if event is valid from current state |
| `availableEvents()` | List all valid events from current state |
| `matches(state)` | Check current state |
| `getContext()` | Get context snapshot |
| `updateContext(fn)` | Update context immutably |
| `getHistory()` | Get transition history |
| `snapshot()` | Serialize for persistence |
| `restore(snap)` | Restore from snapshot |

## Use Cases

- **Order workflows** — draft → submitted → paid → shipped
- **Agent lifecycles** — idle → thinking → acting → reflecting
- **UI wizards** — Multi-step forms with validation gates
- **Approval flows** — Pending → approved/rejected with guards
