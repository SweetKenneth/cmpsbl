# 08 — Circuit Breaker

> **Module:** IMMUNITY | **Source:** `src/crownjewels/s-tier/011-circuit-breaker.ts`

Three-state circuit breaker (closed → open → half-open) with configurable thresholds, exponential backoff, jitter, and per-resource isolation. Prevents cascade failures across external dependencies.

## Quick Start

```typescript
import { createCircuitBreaker, createBreakerPanel } from './circuit-breaker';

// Single breaker
const breaker = createCircuitBreaker('payment-api', {
  failureThreshold: 5,
  timeout: 30_000,
  onStateChange: (from, to, name) => console.log(`${name}: ${from} → ${to}`),
});

const result = await breaker.call(() => fetch('/api/payment'));

// Multi-resource panel
const panel = createBreakerPanel({ failureThreshold: 3 });
await panel.call('stripe', () => stripe.charges.create(params));
await panel.call('sendgrid', () => sendgrid.send(email));
console.log(panel.getDegraded()); // ['stripe'] if it's failing
```

## API Reference

### `createCircuitBreaker(name, config)`

| Method | Description |
|--------|-------------|
| `call(fn)` | Execute through breaker — rejects if open |
| `shouldAttempt()` | Check if call would be allowed |
| `recordSuccess()` | Manually record success |
| `recordFailure()` | Manually record failure |
| `reset()` | Force breaker to closed state |
| `getStats()` | Get breaker statistics |

### `createBreakerPanel(defaults)`

| Method | Description |
|--------|-------------|
| `call(name, fn)` | Execute through named breaker (auto-creates) |
| `getOrCreate(name)` | Get or create a named breaker |
| `getAll()` | Get stats for all breakers |
| `getHealthy()` | List closed breakers |
| `getDegraded()` | List open/half-open breakers |

## Use Cases

- **External API protection** — Stop hammering failing services
- **Database failover** — Detect and route around degraded replicas
- **AI provider resilience** — Cascade to backup models on failure
