# Immunity Mesh — Overview

The Immunity Mesh is a governed, battle-testable immune runtime for the substrate's executor fleet. It wraps every executor with defense, repair, and escalation capabilities.

## Architecture

- **Rule Engine**: Tracks rule dominance, risk, propagation, lineage, conflicts, and cost
- **Lifecycle Governance**: Rules progress through learned → candidate → promoted → deprecated → retired
- **Telemetry**: Rolling 24h/7d windows for success rates, invocations, cost accounting
- **Storm Simulator**: Adversarial stress testing across 8 attack categories
- **Shadow-Only**: All training/testing is shadow-only — OFF = zero overhead

## Key Principles

1. **OFF = identical prod behavior** — no background jobs, no overhead
2. **No silent failure paths** — every job logs outcomes + errors
3. **Shadow mode NEVER writes to production state**
4. **Escalations are explicit + traceable** (run ID, executor, signature, reason)
5. **No magic numbers** — all thresholds in `constants.ts`

## Database Tables

| Table | Purpose |
|-------|---------|
| `immunity_rules` | Central rule catalog with status, confidence, success rate |
| `immunity_rule_invocations` | Per-invocation telemetry (outcome, duration, cost) |
| `immunity_rule_propagation` | Cross-executor adoption tracking |
| `immunity_rule_lineage` | Parent/child rule relationships |
| `immunity_rule_conflicts` | Detected conflicts + resolution |
| `immunity_mesh_runs` | Run records for storms + training |

## Dashboard Panels

- **Dominant Rules (Top 5)** — by dominant_score
- **Risky Rules** — success_rate <60% with ≥20 invocations
- **Cross-Executor Propagation** — breadth, most spread, fastest spreading
- **Rule Conflicts** — conflict type + resolution status
- **Cost & Latency** — per-rule avg/p95 duration, per-executor cost totals
- **Recent Runs** — storm/training run history
- **Mutation Storm** — adversarial stress test control
