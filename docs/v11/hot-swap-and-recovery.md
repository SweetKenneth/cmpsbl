# Hot-Swap & Recovery Protocols — CMPSBL v11.1

## Classification: Technical Reference

---

## Overview

The CMPSBL substrate supports **live replacement** of individual zones and modules without system restart. This document describes the hot-swap protocol, recovery procedures, and failover guarantees.

---

## Hot-Swap Protocol

### Applicable Entities

| Entity Type | Hot-Swappable | Notes |
|-------------|:------------:|-------|
| CCR Zones | ✅ | Independent circuit breakers enable surgical swap |
| CCL Zones | ✅ | Infrastructure services support graceful handoff |
| Execution Surfaces | ✅ | Shadow validation required before promotion |
| Overlay Meshes | ⚠️ | Sequential — must maintain hierarchy order |
| CORE Kernel | ❌ | Standalone — requires full restart |

### Swap Sequence

```
Phase 1: PREPARE
  ├── Open circuit breaker on target entity
  ├── Target health drops to 0 (isolated)
  ├── Downstream consumers detect isolation via RIPPLE event
  └── Graceful drain: in-flight operations complete (timeout: 10s)

Phase 2: LOAD
  ├── New version initializes in shadow mode
  ├── Shadow instance receives mirrored traffic (read-only)
  ├── Baseline comparison runs for observation window (default: 60s)
  └── Shadow metrics collected: latency, error rate, output consistency

Phase 3: VALIDATE
  ├── Compare shadow metrics against baseline
  ├── Validation criteria:
  │   ├── Error rate ≤ baseline + 1%
  │   ├── p95 latency ≤ baseline × 1.5
  │   └── Output consistency ≥ 95%
  ├── On PASS: proceed to Phase 4
  └── On FAIL: abort, restore old version, close breaker

Phase 4: PROMOTE
  ├── Shadow instance promoted to primary
  ├── Circuit breaker closes on new version
  ├── Old version enters drain mode (30s timeout)
  ├── RIPPLE emits "swap.complete" event
  └── HAE records attribution: category = "evolution"
```

---

## Recovery Protocols

### Automatic Recovery

The substrate implements three tiers of automatic recovery:

#### Tier 1: Circuit Breaker Reset

- **Trigger**: Node failure count exceeds threshold
- **Action**: Breaker opens → auto-recovery timer starts
- **Timer**: Default 60s, configurable per node
- **On timer expiry**: Breaker moves to half-open → probe traffic sent
- **On probe success**: Breaker closes → full traffic restored

#### Tier 2: Redundant Node Failover

- **Trigger**: Primary node health drops below 30%
- **Action**: Standby node promoted to primary
- **Guarantee**: Atomic — no split-brain due to single-writer model
- **Default pairs**: CORE↔CORE-STANDBY, BRAIN↔BRAIN-STANDBY, SYSTEM↔SYSTEM-STANDBY

#### Tier 3: Quorum Healing

- **Trigger**: Three independent signals agree on degradation
- **Signals**: Health monitor, anomaly forecaster, cross-sector correlator
- **Actions**: Restart node, failover to standby, or isolate sector
- **Quorum requirement**: 3/3 signals must agree (no majority voting)

### Manual Recovery

| Command | Action |
|---------|--------|
| `matrix.reset <node>` | Force circuit breaker to closed state |
| `matrix.failover <node>` | Trigger manual failover to standby |
| `matrix.killswitch <sector>` | Emergency sector isolation |
| `matrix.reactivate <sector>` | Re-enable isolated sector |

---

## Failover Guarantees

### Zero Data Loss

- All in-flight operations complete before swap (graceful drain)
- State is synced between primary and standby on every health check cycle
- Event store is append-only — no events lost during transitions

### Bounded Downtime

| Scenario | Max Downtime |
|----------|-------------|
| Single node circuit trip | 60s (auto-recovery timer) |
| Hot-swap with shadow validation | 70s (10s drain + 60s shadow) |
| Redundant node failover | < 1s (atomic promotion) |
| Sector kill switch + reactivation | 5s drain + manual reactivation |

### Cascade Prevention

- Circuit breakers are per-node — no cross-node infection
- Sector isolation prevents cross-sector cascade
- CORE breaker open triggers CRITICAL but does not force other breakers open
- Each overlay mesh has independent failure tracking

---

## Canary Deployments

For non-emergency updates, the Node Canary system provides staged rollout:

```
Stage 1:   5% traffic → observe 60s → health gate
Stage 2:  25% traffic → observe 60s → health gate
Stage 3:  50% traffic → observe 60s → health gate
Stage 4: 100% traffic → observation complete
```

**Rollback trigger**: Any stage showing health regression > 5% from baseline.

---

## Observability During Recovery

All recovery events are visible through:

1. **Matrix Integrity Map**: Real-time breaker state visualization
2. **Terminal**: `matrix.status` shows recovery state per node
3. **GOAL Snapshots**: Recovery events captured in system snapshots
4. **HAE Attribution**: Recovery cause attributed to specific trigger
5. **Immutable Incidents**: Post-mortem record created for every recovery

---

*Technical Reference — CMPSBL v11.1 — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
