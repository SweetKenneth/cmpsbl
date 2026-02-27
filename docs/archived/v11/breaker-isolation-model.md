# Breaker Isolation Model — CMPSBL v11.1

## Circuit Breaker Architecture

Every Matrix Node has an independent circuit breaker that tracks failure state without cross-node contamination.

## Breaker States

| State | Health Effect | Behavior |
|-------|--------------|----------|
| **closed** | `rawHealth` | Normal operation |
| **half-open** | `min(rawHealth, 50)` | Probing recovery — limited traffic |
| **rerouting** | `min(rawHealth, 85)` | Traffic redirected to fallback path |
| **open** | `0` | Full isolation — node considered offline |

## State Transitions

```
closed → half-open   (on failure threshold exceeded)
half-open → closed   (on successful probe)
half-open → open     (on probe failure)
open → half-open     (on recovery timer expiry)
rerouting → closed   (on fallback success)
```

## Failure Tracking

Each breaker maintains:
- **Failure count**: Incremented on each failed operation
- **Last recovery timestamp**: Set when transitioning from non-closed to closed
- **State**: Current breaker state

## Dashboard Visibility

The Matrix Integrity Map panel exposes read-only breaker state for every node:
- Breaker state with visual indicator
- Failure count
- Last recovery timestamp
- Node weight
- Sector grouping

No mutation endpoints are exposed from the dashboard. Breaker state changes are driven entirely by the substrate runtime.

## Isolation Guarantees

- A degraded zone reduces only its own sector score
- Open breakers in one sector cannot cascade to another
- CORE breaker open triggers global CRITICAL regardless of other sectors

---

© 2025–2026 PromptFluid®. All rights reserved.
