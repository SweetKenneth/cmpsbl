# Immunity Mesh — Rule Lifecycle

## Statuses

| Status | Description |
|--------|-------------|
| `learned` | Observed once, not yet reliable |
| `candidate` | ≥20 invocations OR ≥3 executors adopted, confidence ≥0.80 |
| `promoted` | Candidate that passed all stability gates |
| `deprecated` | Promoted but replaced by a better rule |
| `retired` | Disabled, no longer applied (0 invocations in 7d) |
| `blocked` | Explicitly prohibited (security/compliance) |

## Promotion Gates (all must pass)

1. `success_rate_24h ≥ 0.80`
2. No conflict events in last 24h
3. Does not increase avg `duration_ms` by >15% in its category
4. Has lineage tag OR justification note

## Decay / Retirement

- `invocations_7d == 0` → auto-retire
- `success_rate_24h < 0.60` after promotion → demote to candidate + flag
- Oscillation/conflict detected → block until resolved

## Conflict Arbitration (deterministic)

1. Prefer higher `success_rate_24h`
2. Tie-break: lower `p95_duration_ms`
3. Tie-break: broader propagation (more executors)
4. Security-sensitive conflicts → block both + escalate to ENCODE

## Scoring

- **Dominant Score** = `log2(invocations+1) × success_rate × (1 + log2(breadth))`
- **Risk Score** = `(1 - success_rate) × log2(invocations+1) × severity_weight`
- **Spread Velocity** = `propagation_breadth / days_since_first_adoption`
