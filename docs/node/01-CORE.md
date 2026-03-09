# CORE — Kernel Scheduler & Boot Sequencer

> **Node ID:** `core` · **Sector:** Kernel · **Generation:** 1 · **Node #1 of 40**
> **Codename:** *Heartbeat* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

CORE is the substrate's kernel — the first node to boot and the last to shut down. It owns the master scheduler, the boot sequencer, and the health heartbeat that every other node depends on. Without CORE, no node can initialize, no circuit breaker can trip, and no mutation can execute.

CORE is deliberately minimal. Its entire surface area is four operations: `boot`, `pulse`, `health`, and `invoke`. This simplicity is the trade secret — a kernel that cannot fail because it has almost nothing to fail *at*.

---

## Architecture

### Boot Sequence

CORE boots in a strict order enforced by the `initializeSubstrate()` entry point:

1. **CORE.boot** — Initializes the kernel scheduler, sets `initialized = true`
2. **CCR.boot** — Layer 0 meta-engine (SYSTEM, BRAIN, MEMORY, DREAM zones)
3. **OCG** — Operational Compliance Grid (served by substrate nodes directly)
4. **Execution Layer** — 11 nodes: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION
5. **ESZ/EPZ/EMZ/CSZ** — Expansion zones boot last
6. **Mesh Overlays** — GOVERNANCE, INTENT, IMMUNITY, DEFENSE

### Triple-Deferred Initialization

CORE uses a triple-deferral strategy to achieve zero main-thread blocking:

```
document.readyState === 'complete'
  → requestIdleCallback (timeout: 10s)
    → setTimeout(100ms)
      → initializeSubstrate()
```

This ensures the UI is fully interactive before any substrate work begins. On browsers without `requestIdleCallback`, a 5-second `setTimeout` fallback is used.

### Yield-to-Main Protocol

Between each boot phase, CORE yields to the main thread using the Scheduler API:

```typescript
const yieldToMain = () => new Promise<void>(resolve => {
  if ('scheduler' in window && 'yield' in window.scheduler) {
    window.scheduler.yield().then(resolve);
  } else {
    setTimeout(resolve, 0);
  }
});
```

This prevents long-task jank even on low-end devices.

---

## Trade Secrets

### 1. The 40-Node Pulse Fallback

If either CORE or CCR fails to boot, CORE falls back to pinging every node individually. This is the only place in the substrate where all 40 nodes are iterated sequentially — and it only runs on degraded boot:

```
for each node in [execution, esz, epz, emz, csz, mesh]:
  yield → invoke(node, 'pulse') → count active
```

The health percentage reported (`N/40 nodes active`) is the ground truth used by ATLAS governance.

### 2. Capability Router Registration

CORE registers three foundational capabilities at import time:

| Capability | Priority | Purpose |
|---|---|---|
| `scheduling` | 95 | Master scheduler ownership |
| `health` | 95 | Authoritative health source |
| `boot_sequencing` | 95 | Boot order enforcement |

No other node can register these capabilities at priority ≥ 95.

### 3. Graceful Shutdown Hook System

CORE's shutdown system uses a priority queue. The Control Plane persistence hook runs at priority 1 (highest), ensuring all in-flight state is flushed before any other shutdown work:

```typescript
registerShutdownHook('control-plane-persistence', async () => {
  await flushAll();
  await stopPersistenceScheduler();
}, 1);
```

---

## Algorithms

### Health Calculation

CORE health is binary: either the kernel booted (`health: 100`) or it didn't (`health: 0`). There is no degraded state for CORE itself — degradation is tracked at the CCR and individual node level.

### Subsystem Health Registry

After boot, CORE initializes the subsystem health registry (`subsystem-health`) which provides per-subsystem health scores to GOAL (Global Observability Access Layer).

### Auto-Recovery Engine

CORE starts the automatic circuit recovery engine (`core-circuit-recovery`) which monitors all circuit breakers across the matrix and attempts recovery when breakers are in `open` state.

---

## Operational Parameters

| Parameter | Value | Notes |
|---|---|---|
| Boot priority | 0 (first) | Always boots before all other nodes |
| Idle callback timeout | 10,000ms | Maximum wait before forced init |
| Fallback delay | 5,000ms | Used when `requestIdleCallback` unavailable |
| Post-idle delay | 100ms | Additional breathing room after idle callback |
| Shutdown priority | 1 | Highest priority (runs first) |

---

## Dependencies

- **Upstream:** None (CORE is the root)
- **Downstream:** Every node in the matrix depends on CORE for boot sequencing
- **Internal:** `substrate.invoke()`, `events.emit()`, `subsystem-health`, `core-circuit-recovery`

---

## CLM Learning Priorities

1. **Predictive Boot Optimization** — Learning which nodes are likely to be needed first based on user navigation patterns
2. **Failure Pattern Recognition** — Identifying boot failure signatures before they cascade

---

*CMPSBL® Substrate — CORE Node Deep Dive · Founder Eyes Only*
