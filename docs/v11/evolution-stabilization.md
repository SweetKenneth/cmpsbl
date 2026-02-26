# EVOLUTION Stabilization Gates — CMPSBL SPARTA Epoch

## Overview

Before the EVOLUTION overlay can begin self-modifying the live substrate, **12 stabilization gates** must pass. These gates ensure that the system has sufficient safety infrastructure, training maturity, and operational confidence to permit autonomous evolution.

Gates are divided into two severities:
- **Blockers** — Must pass. Evolution is halted if any blocker fails.
- **Warnings** — Advisory. Logged but do not prevent evolution.

## The 12 Gates

### Safety Gates (Blockers)

| # | Gate | What It Checks |
|---|------|----------------|
| 1 | **Release Gate Integration** | Last release gate run passed all required checks (10-pass validation) |
| 2 | **Real Shadow Execution** | ≥ 2 shadow runs used real production snapshots (no synthetic noise) |
| 3 | **Atomic Rollback Verification** | Snapshot + failsafe backup infrastructure is wired and operational |
| 4 | **Governance Gate Enforcement** | Governance mode permits evolution; not in LOCKDOWN or OBSERVE |

### Confidence & Quality (Mixed)

| # | Gate | What It Checks | Severity |
|---|------|----------------|----------|
| 5 | **Per-Operation Performance Baselines** | Performance baselines exist via release gate perf pass | Warning |
| 6 | **Executor Graduation (Tier 3+)** | At least one executor has competency score ≥ 60 | Blocker |
| 7 | **Knowledge Distillery Confidence** | CLM knowledge outputs average confidence ≥ 0.7 | Warning |
| 8 | **Opportunity Score Threshold** | Evolution proposals require opportunity_score ≥ 0.5 | Warning |

### Observability (Warnings)

| # | Gate | What It Checks |
|---|------|----------------|
| 9 | **VISION Telemetry** | Telemetry pipeline emits evolution lifecycle events to brain_events |
| 10 | **Chaos Pass for Evolution** | Circuit breaker is operational; chaos paths (timeout, failure) are tested |

### Strategic (Mixed)

| # | Gate | What It Checks | Severity |
|---|------|----------------|----------|
| 11 | **Manual Approval Mode** | First 20 evolution cycles must use manual approval (autonomy='off') | Blocker |
| 12 | **Zero-Rollback Streak** | ≥ 5 consecutive verified runs with zero rollbacks in last 7 days | Warning |

## Integration Point

The stabilization gates are wired into the **main `evolve()` function** as a pre-flight check for production mode. When `evolve({ mode: 'production' })` is called:

1. All 12 gates run in parallel
2. If any blocker fails → evolution is rejected with `STABILIZATION_BLOCKED`
3. Warnings are logged via telemetry but do not block
4. The full report is available in the `data.stabilization` field of the response

## Running Manually

```typescript
import { stabilizationGates } from '@/lib/evolve';

const report = await stabilizationGates.run();
console.log(stabilizationGates.format(report));
```

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MIN_EXECUTOR_TIER` | 3 | Minimum executor competency tier |
| `MIN_DISTILLERY_CONFIDENCE` | 0.7 | Knowledge pack confidence floor |
| `MIN_OPPORTUNITY_SCORE` | 0.5 | Minimum gap opportunity score |
| `MANUAL_APPROVAL_CYCLES` | 20 | Cycles before auto-evolution allowed |
| `ZERO_ROLLBACK_STREAK_REQUIRED` | 5 | Consecutive verified runs needed |
| `MIN_SHADOW_RUNS_REAL` | 2 | Minimum non-synthetic shadow runs |

## Graduation Path

1. **Phase 1 (Manual):** Run 20 evolution cycles with manual approval. All must verify.
2. **Phase 2 (Advisory):** Switch autonomy to `advisory`. System suggests but human approves.
3. **Phase 3 (Governed):** Switch autonomy to `governed`. System auto-evolves low-risk changes with human override.

---

© 2025–2026 PromptFluid®. All rights reserved.
