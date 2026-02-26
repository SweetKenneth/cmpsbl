# EVOLUTION Pipeline Reference — CMPSBL SPARTA Epoch

## Complete Evolution Flow

```
User/Agent Request
       │
       ▼
┌──────────────────┐
│  evolve() Entry  │  ← Single entry point for all evolution
│  Point           │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Context         │  ← Creates EvolveContext (shadow | production)
│  Validation      │
└──────┬───────────┘
       │
       ├─── production mode ──────────────┐
       │                                   ▼
       │                    ┌──────────────────────────┐
       │                    │  12 Stabilization Gates   │
       │                    │  (run in parallel)        │
       │                    └──────────┬───────────────┘
       │                               │
       │                    ┌──── pass ─┴── fail ────┐
       │                    │                         │
       │                    ▼                         ▼
       │          ┌─────────────────┐      ❌ STABILIZATION_BLOCKED
       │          │ Normalization   │
       │          │ Gate            │
       │          └────────┬────────┘
       │                   │
       │                   ▼
       │          ┌─────────────────┐
       │          │ Shadow          │
       │          │ Verification    │
       │          └────────┬────────┘
       │                   │
       │                   ▼
       │          ┌─────────────────┐
       │          │ Production      │
       │          │ Apply           │
       │          │ (with backup)   │
       │          └─────────────────┘
       │
       ├─── shadow mode ──────────────────┐
       │                                   ▼
       │                    ┌──────────────────────────┐
       │                    │  CodeAgent Execution      │
       │                    │  (plan → write → verify)  │
       │                    └──────────┬───────────────┘
       │                               │
       │                               ▼
       │                    ┌──────────────────────────┐
       │                    │  Shadow Store             │
       │                    │  (artifacts written)      │
       │                    └──────────┬───────────────┘
       │                               │
       │                               ▼
       │                    ┌──────────────────────────┐
       │                    │  Verification             │
       │                    │  (6 checks)               │
       │                    └──────────────────────────┘
       │
       ▼
  ┌──────────────────┐
  │  Telemetry       │  ← All events persisted to brain_events
  │  (VISION)        │
  └──────────────────┘
```

## Key Modules

| Module | File | Purpose |
|--------|------|---------|
| Context Factory | `src/lib/evolve/context.ts` | Creates shadow/production contexts |
| Stabilization Gates | `src/lib/evolve/stabilization-gates.ts` | 12 pre-flight checks for production |
| Shadow Executor | `src/lib/evolve/shadow-executor.ts` | Idempotent shadow phase execution |
| Production Executor | `src/lib/evolve/production-executor.ts` | Gated production apply with backup |
| CodeAgent Controller | `src/lib/evolve/codeagent-controller.ts` | Plan → write → verify pipeline |
| Circuit Breaker | `src/lib/evolve/circuit-breaker.ts` | Hard stop protection |
| Autonomy | `src/lib/evolve/autonomy.ts` | off/advisory/governed modes |
| Eligibility Gate | `src/lib/evolve/eligibility-gate.ts` | System readiness (locks, panic, deps) |
| Telemetry | `src/lib/evolve/telemetry.ts` | Event emission to brain_events |
| Verify | `src/lib/evolve/verify.ts` | 6-check shadow verification |
| Governance Gate | `src/lib/system/governanceGate.ts` | Mode-based subsystem gating |

## Mutation Promotion Engine (MPE)

The MPE (`src/lib/evolution-mesh/mutation-engine.ts`) provides the database-backed mutation lifecycle:

1. **Change Artifacts** — Capture before/after snapshots of proposed changes
2. **Mutation Proposals** — Formal proposals with risk scores and executor selection
3. **Shadow A/B Evaluation** — Run candidate vs baseline in shadow mode
4. **Deterministic Gate** — ≥ 2 shadow runs, ≥ 75% confidence, zero regressions
5. **Canary Rollout** — 5% → 25% → 50% → 100% staged deployment
6. **Post-Verification Scan** — Integrity scan after full promotion
7. **Rollback** — Atomic rollback with artifact status restoration

## Safety Invariants

1. **Shadow never touches production** — Shadow writes to shadow_store only
2. **Production requires verified shadow** — Cannot skip shadow phase
3. **Circuit breaker halts all evolution** — Open circuit = zero evolution activity
4. **Governance overrides everything** — LOCKDOWN mode kills evolution immediately
5. **12 stabilization gates must pass** — Blockers prevent production apply
6. **Failsafe backup before every production apply** — Atomic rollback guaranteed
7. **Manual approval for first 20 cycles** — No autonomous evolution until proven safe
8. **Normalized plans only** — Unnormalized plans are rejected outright

## Telemetry Events

All evolution lifecycle events are persisted to `brain_events` with `module: 'evolve'`:

| Event | When |
|-------|------|
| `evolve_shadow_started` | Shadow execution begins |
| `evolve_shadow_verified` | Shadow artifacts pass verification |
| `evolve_apply_started` | Production apply begins |
| `evolve_apply_completed` | Production apply succeeds |
| `evolve_apply_blocked` | Production apply blocked by gate |
| `stabilization_gates_evaluated` | 12-gate pre-flight check completed |
| `circuit_tripped` | Circuit breaker opened |
| `circuit_reset` | Circuit breaker closed |
| `autonomy_mode_changed` | Autonomy level changed |
| `self_repair_started` | Self-repair cycle initiated |

---

© 2025–2026 PromptFluid®. All rights reserved.
