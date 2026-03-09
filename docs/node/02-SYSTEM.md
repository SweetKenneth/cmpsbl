# SYSTEM — Lifecycle Manager & Configuration Authority

> **Node ID:** `system` · **Sector:** Kernel · **Generation:** 1 · **Node #2 of 40**
> **Codename:** *Sentinel* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

SYSTEM is the lifecycle manager for the entire substrate. It owns configuration state, manages node lifecycle transitions, provides diagnostic aggregation, and runs the self-repair loop. While CORE handles boot sequencing, SYSTEM handles everything that happens *after* boot — health monitoring, configuration changes, audit cycles, and graceful degradation.

---

## Architecture

### Audit Runner

The SYSTEM audit runner (`auditRunner.ts`) performs parallelized audits across six subsystems:

1. **Control Plane Storage** — Validates persistence layer integrity
2. **Mutation Receipt Chain** — Verifies tamper-evident hash chain
3. **Event Stream** — Checks event buffer health and overflow
4. **Plan Store** — Validates active mutation plans
5. **Discussion Node** — Checks DECODE conversation health
6. **Ironclad Fabric** — Validates hardening suite integrity

Each subsystem returns an `AuditResult` with `healthy: boolean`, `findings: AuditFinding[]`, and `score: number`.

### Self-Repair Loop

When the audit runner detects degradation, SYSTEM triggers the self-repair loop (`selfRepairLoop.ts`):

```
audit → identify degraded subsystems → select repair strategy → execute → re-audit → report
```

Repair strategies include:
- **Cache Reset** — Clears stale in-memory state
- **Health Recheck** — Forces fresh health computation
- **Circuit Breaker Reset** — Resets stuck breakers to `closed`
- **Event Buffer Drain** — Flushes overflowing event buffers
- **Receipt Chain Rebuild** — Recomputes chain from anchors

---

## Trade Secrets

### 1. The Six-Subsystem Audit Matrix

SYSTEM doesn't audit individual nodes — it audits the *connective tissue* between them. This is a deliberate architectural choice: individual node health is tracked by the Matrix Registry, but the integrity of the *communication channels* between nodes is SYSTEM's unique responsibility.

### 2. Repair Strategy Selection Algorithm

```
for each degraded subsystem:
  strategies = RepairStrategies.getApplicable(subsystem)
  strategies.sort(by: risk ASC, effectiveness DESC)
  for strategy in strategies:
    if strategy.risk <= acceptable_threshold:
      result = strategy.execute()
      if result.success: break
      else: escalate_to_next_strategy()
```

The risk threshold is dynamic: during LOCKDOWN governance mode, only zero-risk strategies (cache reset, health recheck) are permitted.

### 3. Terminal Integration

SYSTEM exposes its audit and repair through four terminal commands with escalating authority:

| Command | Action | Risk |
|---|---|---|
| `system.audit` | Read-only audit scan | None |
| `system.repair` | Targeted subsystem repair | Low |
| `system.fix` | Aggressive multi-subsystem repair | Medium |
| `system.heal --all` | Full system-wide repair cycle | High |

The `--force` flag on `system.heal` resets all health scores to baseline before re-computing.

---

## Algorithms

### Health Aggregation

SYSTEM computes a composite health score using weighted subsystem scores:

```
system_health = Σ(subsystem_score × subsystem_weight) / Σ(subsystem_weights)
```

Weights: Control Plane (0.25), Receipt Chain (0.20), Event Stream (0.15), Plan Store (0.15), Discussion (0.10), Ironclad (0.15).

### Diagnostic Aggregation

The diagnostics aggregator collects metrics from all 40 nodes and computes:
- **Memory pressure** — Heap usage vs. available budget
- **DLQ depth** — Dead letter queue overflow risk
- **Telemetry lag** — Event processing backlog in milliseconds

---

## Capability Router Registration

| Capability | Priority |
|---|---|
| `lifecycle_management` | 90 |
| `configuration` | 90 |
| `diagnostics` | 85 |

---

## CLM Learning Priorities

1. **Predictive Failure Detection** — Learning failure patterns to trigger pre-emptive repair before degradation is user-visible
2. **Repair Strategy Optimization** — Learning which repair strategies are most effective for which failure modes

---

*CMPSBL® Substrate — SYSTEM Node Deep Dive · Founder Eyes Only*
