# 09 — Rate Limiter

> **Module:** DEFENSE | **Source:** `src/crownjewels/s-tier/012-rate-limiter.ts`

Multi-strategy rate limiting with per-key isolation, burst allowance, penalty escalation, and analytics. Four strategies: fixed window, sliding window, token bucket, and leaky bucket.

## Quick Start

```typescript
import { createRateLimiter } from './rate-limiter';

const limiter = createRateLimiter({
  strategy: 'sliding_window',
  maxRequests: 100,
  windowMs: 60_000,
  burstAllowance: 20,
});

const result = limiter.check('user_123');
if (!result.allowed) {
  console.log(`Rate limited. Retry in ${result.retryAfterMs}ms`);
}

// Penalize abusive users
limiter.penalize('user_456'); // halves their limit
```

## Strategies

| Strategy | Best For |
|----------|----------|
| `fixed_window` | Simple, low-memory rate limiting |
| `sliding_window` | Smooth, accurate request tracking |
| `token_bucket` | Burst-tolerant with steady refill |
| `leaky_bucket` | Constant output rate enforcement |

## API Reference

| Method | Description |
|--------|-------------|
| `check(key)` | Check if request is allowed, returns remaining + retry timing |
| `penalize(key)` | Escalate penalty (halves effective limit per level) |
| `pardon(key)` | Reduce penalty level |
| `reset(key)` | Clear all state for a key |
| `getAnalytics()` | Get allow/deny rates and active key count |

## Use Cases

- **API gateway protection** — Per-user/per-IP throttling
- **AI cost control** — Limit requests per provider per day
- **Abuse prevention** — Escalating penalties for bad actors
