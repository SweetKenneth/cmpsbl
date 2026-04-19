# Doc 26 — Substrate Conductor (Dynamic Orchestrator)

> **Plain-English Summary**
> Instead of running every background job on its own fixed timer (every 15min, every 30min, every hour…), the substrate now has **one heartbeat** every 2 minutes that wakes a single orchestrator. The orchestrator looks at all registered jobs, asks each one *"do you actually have work to do?"*, and only fires the ones that do. Jobs that have been idle long enough get a forced run as a safety net. Jobs that have produced nothing useful for 3 runs in a row require double the signal pressure before firing again — saving credits.
>
> The result: no more empty cron firings, no more redundant sweeps, and adding a new background job is just one INSERT.

## 1. Architecture

```
                   pg_cron (every 2 min)
                            │
                            ▼
              substrate-conductor (edge function)
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   conductor_pipelines  conductor_signals  conductor_runs
   (registry)           (pressure counts)  (history)
                            │
                            ▼
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  regret-collector   defense-memory-sync   dream-from-gaps   …
  (target edge fns invoked only when their criteria match)
```

## 2. Decision Model (Hybrid)

For each enabled pipeline, the conductor evaluates in this order:

| # | Check                          | Action if true             |
|---|--------------------------------|----------------------------|
| 1 | `now - last_run < min_interval`| **Skip** (cooldown)        |
| 2 | `pressure >= threshold`        | **Dispatch** (signal)      |
| 3 | `now - last_run >= max_interval`| **Dispatch** (ceiling)    |
| 4 | otherwise                      | **Skip**                   |

**Adaptive backoff**: if a pipeline returns `work_units = 0` three runs in a row, the threshold doubles until a non-empty run resets the counter. Idle pipelines naturally rest.

## 3. Signal Sources (allowlist)

The `conductor_eval_signal(q)` SQL function only accepts pre-vetted keys — no raw SQL is ever passed from the conductor. Current signals:

- `unprocessed_decode_gaps` — recent low-confidence DECODE recalls
- `unprocessed_defense_events` — recent blocks not yet learned from
- `unprocessed_regret_candidates` — recent failures not yet synthesized
- `governor_intent_pending` — recent strategic intent statements

Adding a new signal = one new `WHEN` branch in the function.

## 4. Patent-Relevant Properties

1. **Signal-driven cognitive scheduling** — Background work is dispatched based on *epistemic pressure* (how much novel signal exists in upstream tables), not wall-clock time. Most systems use cron or message queues; this couples *intelligence input rate* to *intelligence processing rate* directly.
2. **Self-throttling via empty-run counters** — The system learns its own idle periods without external configuration. A pipeline that consistently finds nothing rests itself; one that keeps finding work runs more aggressively. This is a deterministic, observable form of attention budget.
3. **Single-heartbeat orchestration** — One scheduled invocation manages an unbounded number of cognitive pipelines. New jobs require zero infrastructure changes (cron entries, deployment, secrets) — only a row insert.
4. **Cost-aware dispatch ordering** — Each pipeline declares `cost_estimate_cents`; future versions can defer expensive pipelines under budget pressure.

## 5. Operations

- **Add a pipeline**: `INSERT INTO conductor_pipelines (name, target_function, signal_query, …)`
- **Disable temporarily**: `UPDATE conductor_pipelines SET enabled = false WHERE name = …`
- **Manual tick** (dev): `curl -X POST .../functions/v1/substrate-conductor`
- **Inspect last 50 runs**: `SELECT * FROM conductor_runs ORDER BY dispatched_at DESC LIMIT 50;`
- **Heartbeat job**: `substrate-conductor-tick` in `cron.job` (every 2 min)

## 6. Migration Notes

Retired the following per-job crons (now conductor pipelines):

- `substrate-regret-collector`
- `substrate-defense-memory-sync`
- `substrate-dream-from-gaps`
- `substrate-dream-from-regret`

The legacy `cron-runner` (client-side, in `src/lib/substrate/cron-runner/`) remains for browser-side maintenance jobs (memory GC, rate-limit cleanup) and is unaffected.
