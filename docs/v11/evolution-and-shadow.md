# EVOLUTION & Shadow Training — CMPSBL SPARTA Epoch

## EVOLUTION Lifecycle

The EVOLUTION overlay operates as one of the five protective mesh overlays (DEFENSE → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE). It continuously improves system behavior through autonomous scanning, proposal generation, and governed execution.

### Lifecycle Phases

1. **Scan**: EVOLUTION inspects all Matrix Nodes for optimization opportunities
2. **Propose**: Improvement proposals are generated with risk assessment and opportunity scoring (≥ 0.5 threshold)
3. **Stabilize**: All 12 stabilization gates must pass before production apply (see `docs/v11/evolution-stabilization.md`)
4. **Shadow Execute**: Approved changes are applied in shadow mode first (real snapshots, no synthetic noise)
5. **Verify**: 6-check shadow verification confirms artifact integrity
6. **Gate**: Deterministic promotion gate (≥ 2 shadow runs, ≥ 75% confidence, zero regressions)
7. **Canary**: Staged rollout at 5% → 25% → 50% → 100%
8. **Post-Verify**: Integrity scan after full promotion

## Shadow Training

The IMMUNITY overlay provides shadow training capabilities where:
- New behaviors are tested against **real** system gaps in shadow mode (synthetic noise eliminated)
- Shadow executions do not affect production state
- Results are compared against baseline to measure improvement
- Successful shadow runs promote to production through the deterministic gate
- ≥ 2 real shadow runs required before any production apply

## Stabilization Gates

Before EVOLUTION can modify the live substrate, **12 stabilization gates** must pass:

| Category | Gates |
|----------|-------|
| **Safety (Blockers)** | Release gate passed, real shadow runs, atomic rollback ready, governance permits |
| **Quality** | Executor Tier 3+, distillery confidence ≥ 0.7, opportunity score ≥ 0.5 |
| **Observability** | VISION telemetry wired, chaos paths tested |
| **Strategic** | Manual approval for first 20 cycles, zero-rollback streak ≥ 5 |

See `docs/v11/evolution-stabilization.md` for complete gate reference.

## Observability

The VISION execution node provides unified observability across all EVOLUTION and shadow operations:
- Health attribution for evolution-driven changes
- Audit trails for all proposal lifecycles via `brain_events` table
- Real-time telemetry during shadow execution
- Stabilization gate evaluation events

## Access

EVOLUTION and shadow mode are fully accessible through:
- Dashboard: Infrastructure → EVOLUTION Lifecycle / Shadow Mode
- Terminal: `evolution.*` commands
- API: Via substrate invoke with `module: 'evolution'`
- Code: `import { evolve, stabilizationGates } from '@/lib/evolve'`

## Related Documentation

- [Evolution Stabilization Gates](evolution-stabilization.md) — 12 pre-flight checks
- [Evolution Pipeline Reference](evolution-pipeline-reference.md) — Complete flow diagram
- [Overlays & Evolution](overlays-and-evolution.md) — SEBA framework
- [Release Gate](../RELEASE-GATE.md) — 10-pass pre-release validation

---

© 2025–2026 PromptFluid®. All rights reserved.
