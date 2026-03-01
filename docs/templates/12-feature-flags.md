# 12 — Feature Flags

> **Module:** DECODE | **Source:** `src/crownjewels/s-tier/015-feature-flags.ts`

Runtime feature toggling with percentage rollouts, user targeting, A/B cohort assignment, kill switches, dependency chains, and evaluation analytics. No external service required.

## Quick Start

```typescript
import { createFeatureFlagEngine } from './feature-flags';

const flags = createFeatureFlagEngine();

// Register flags
flags.register('dark_mode', { enabled: true });
flags.register('new_checkout', {
  enabled: true,
  rolloutPercentage: 25,
  variants: [
    { id: 'control', weight: 50 },
    { id: 'redesign', weight: 50 },
  ],
});
flags.register('premium_feature', {
  enabled: true,
  targetUsers: ['user_vip_1', 'user_vip_2'],
  dependencies: ['dark_mode'],
});

// Evaluate
const result = flags.evaluate('new_checkout', { userId: 'user_123' });
if (result.enabled) {
  console.log(`Showing variant: ${result.variant}`);
}

// Kill switch for incidents
flags.kill('new_checkout'); // instant disable
flags.revive('new_checkout'); // re-enable
```

## API Reference

| Method | Description |
|--------|-------------|
| `register(key, config)` | Create a feature flag |
| `update(key, changes)` | Update flag configuration |
| `evaluate(key, ctx)` | Evaluate flag for a user context |
| `kill(key)` | Emergency disable (overrides everything) |
| `revive(key)` | Remove kill switch |
| `getAnalytics(key?)` | Get enable/disable rates |
| `listFlags()` | List all registered flags |

## Use Cases

- **Progressive rollouts** — Ship to 5% → 25% → 100% of users
- **A/B testing** — Deterministic cohort assignment without external tools
- **Kill switches** — Instant disable during incidents
- **Entitlement gating** — Target specific users for premium features
