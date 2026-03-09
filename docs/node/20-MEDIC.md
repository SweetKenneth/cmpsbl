# MEDIC — Autonomous Diagnostics & Self-Repair

> **Node ID:** `medic` · **Sector:** Execution · **Generation:** 1 · **Node #20 of 40**
> **Codename:** *Healer* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

MEDIC is the substrate's autonomous health system. It owns diagnostics, quarantine, self-repair orchestration, and overall system health calculation. When any node degrades, MEDIC diagnoses the issue, prescribes a repair action, and — when possible — executes the repair automatically. Nodes that cannot be repaired are quarantined to prevent cascade failures.

---

## Architecture

### Diagnostic Engine

MEDIC classifies node health into four severity levels:

| Severity | Symptoms Required | Response |
|---|---|---|
| `healthy` | 0 | No action |
| `degraded` | 1–2 | Auto-repair with monitoring |
| `critical` | 3–4 | Immediate repair attempt |
| `quarantined` | 5+ | Isolate module, manual intervention |

### Prescription Generator

```
generatePrescription(severity, symptoms):
  healthy → "No action needed"
  quarantined → "Isolate module. {n} symptoms require manual intervention."
  critical → "Immediate repair: address {top 3 symptoms}"
  degraded → "Monitor and auto-repair: {first symptom}"
```

### Quarantine System

```
quarantine(module, reason):
  1. Create QuarantineEntry with timestamp
  2. Signal NERVE to halt traffic to quarantined module
  3. Log to event bus for AUDIT trail
  4. Quarantine persists until explicit release

releaseQuarantine(quarantineId):
  1. Mark releasedAt timestamp
  2. Signal NERVE to resume traffic
  3. Monitor for immediate re-degradation (30s window)
```

### Self-Repair Orchestration

```
executeRepair(diagnosisId, action):
  1. Look up diagnosis
  2. Execute prescribed repair action
  3. Track success/failure with duration
  4. If successful → mark diagnosis as resolved
  5. If failed → escalate to governor
  6. Update overall health calculation
```

### Health Calculation

```
overallHealth = 100 - (activeIssues × 10)
clamped to [0, 100], default 100

activeIssues = diagnoses WHERE resolvedAt IS NULL AND severity ≠ 'healthy'

If hardening.isDegraded() → cap at 40
```

---

## Resilience Infrastructure

- **Circuit Breaker**: Trips after 3 consecutive failures (lower than standard 5, because MEDIC must be conservative)
- **Module Engine**: Hot-swappable v1.0.0
- **Module Hardening**: Max 5 concurrent, 40/min rate limit, health threshold 50%
- **Auto-Restore**: 30s interval with automatic recalculation
- **State Limits**: 300 diagnoses, 50 quarantine entries, 300 repair actions (ring buffer)

---

## Trade Secrets

### 1. Conservative Circuit Breaker

MEDIC's circuit breaker trips at 3 failures instead of the standard 5. This is intentional — MEDIC must be the most reliable node. If MEDIC itself starts failing, it should stop accepting work immediately rather than accumulating failures.

### 2. Symptom-Count Severity

Severity is purely symptom-count-based, not symptom-type-based. This simplification is intentional — it prevents the need for a symptom taxonomy and ensures consistent severity classification across all modules. The prescription generator adds type-specific detail.

### 3. Ring Buffer State Management

All state arrays (diagnoses, quarantine, repairs) use ring buffers with fixed caps (300/50/300). New entries shift old ones out, ensuring bounded memory growth regardless of system lifetime. This is critical for MEDIC, which runs continuously.

### 4. Mutual Health Exclusion

MEDIC never diagnoses itself. Self-diagnosis would create a recursive dependency — if MEDIC is unhealthy, its own diagnosis would be unreliable. Instead, CORE monitors MEDIC's health externally via the standard heartbeat system.

---

## CLM Learning Priorities

1. **Repair Success Prediction** — Learning which repair actions succeed for which symptom patterns
2. **Quarantine Duration Optimization** — Minimizing quarantine time while preventing premature release

---

*CMPSBL® Substrate — MEDIC Node Deep Dive · Founder Eyes Only*
