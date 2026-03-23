# NERVE — Inter-Node Signal Propagation

> **Node ID:** `nerve` · **Sector:** OCG · **Generation:** 1 · **Node #11 of 40**
> **Codename:** *Synapse* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

NERVE is the substrate's signal nervous system — owning typed signal emission, reception, heartbeat monitoring, backpressure control, circuit breaking, topology mapping, priority routing, and idempotency deduplication. While RIPPLE provides the raw pub/sub bus, NERVE adds intelligence: it decides whether a signal should be sent at all (dedup), whether the destination can accept it (backpressure), whether the path is healthy (circuit breaker), and which route is optimal (priority routing).

---

## Registered Capabilities (8)

| Capability | Description |
|---|---|
| `nrv_signal_emit` | Typed signal emission with priority + TTL |
| `nrv_signal_receive` | Validated signal reception with ordering |
| `nrv_heartbeat` | Heartbeat monitor for failure detection |
| `nrv_backpressure` | Downstream overload backpressure |
| `nrv_circuit_break` | Signal-layer circuit breaking |
| `nrv_topology_map` | Live topology & routing map |
| `nrv_priority_route` | Priority-based shortest-path routing |
| `nrv_dedup` | Idempotency-key deduplication |

---

## Architecture

### Signal Emission Pipeline

Every signal passes through a 4-gate pipeline before delivery:

```
emitSignal(from, to, type, payload, options):
  1. DEDUP GATE — Check idempotency key against 2,000-entry cache (5s window)
  2. CIRCUIT GATE — If destination circuit is OPEN and in cooldown, reject
  3. BACKPRESSURE GATE — If destination is CRITICAL, only pass priority=critical
  4. DELIVER — Route via matrixBroadcast (to='*') or nodeSignal (targeted)
  5. RECORD — Track latency sample, increment stats, reset circuit on success
```

### Heartbeat Monitor

NERVE polls all 40 nodes on a 10-second cycle:

| Threshold | Status | Action |
|---|---|---|
| < 30s since last seen | `alive` | Normal |
| 30s – 60s | `suspect` | Increment missed count |
| > 60s | `dead` | Broadcast `NODE_OFFLINE` via matrix bus |

Dead node detection triggers a single matrix broadcast on first detection (`missedCount === 1`), preventing flood announcements.

### Backpressure Controller

Queue depth reports from downstream nodes trigger graduated throttling:

| Queue Depth | Pressure Level | Throttle Delay |
|---|---|---|
| 0–9 | `none` | 0ms |
| 10–24 | `low` | 50ms |
| 25–49 | `medium` | 250ms |
| 50–99 | `high` | 1,000ms |
| 100+ | `critical` | 5,000ms (only critical signals pass) |

### Circuit Breaker

Standard 3-state circuit breaker per destination node:

```
CLOSED → (5 consecutive failures) → OPEN → (30s cooldown) → HALF-OPEN → (success) → CLOSED
                                                            → (failure) → OPEN
```

Constants: `CIRCUIT_FAILURE_THRESHOLD = 5`, `CIRCUIT_COOLDOWN_MS = 30,000`.

### Deduplication Engine

A 2,000-key LRU cache with 5-second window prevents duplicate signal delivery:

```
isDuplicate(key, now):
  prev = dedupCache.get(key)
  if !prev → false
  if (now - prev) < 5000ms → true (deduplicated)

Eviction: When cache exceeds 2,000 entries:
  1. Window eviction — delete keys older than 5s
  2. Hard cap — delete oldest entries until at capacity
```

---

## Trade Secrets

### 1. Four-Gate Emission Pipeline

The emission pipeline applies gates in a specific order: dedup → circuit → backpressure → deliver. This order is critical because dedup is O(1) and cheapest, circuit check prevents wasted work on known-broken paths, and backpressure is the most nuanced check requiring pressure level evaluation.

### 2. First-Detection-Only Broadcast

Dead node announcements use `missedCount === 1` to ensure exactly one matrix broadcast per death event. Subsequent heartbeat cycles update stats but don't re-announce, preventing announcement storms during sustained outages.

### 3. Priority Signal Bypass

Signals with `priority: 'critical'` bypass backpressure gates entirely. This ensures that system-critical signals (circuit recovery, emergency shutdown) always reach their destination regardless of downstream load.

### 4. Latency Tracking via Sliding Window

NERVE maintains a 100-sample sliding window of signal delivery latencies. The `avgLatencyMs` stat is continuously updated, feeding into topology health assessments without the memory cost of storing all historical samples.

### 5. Self-Heartbeat

At the end of every heartbeat cycle, NERVE calls `registryHeartbeat('nerve')` to register its own liveness with the matrix registry. This prevents NERVE itself from being falsely marked as dead.

---

## CLM Integration

The NERVE CLM cycle (`clm.ts`) produces a composite health score:

```
healthScore = 100
  - (deadNodes × 15)
  - (openCircuits × 10)
  - (criticalBackpressure × 5)
  - (avgLatency > 200ms ? 10 : 0)
  - (avgLatency > 500ms ? 15 : 0)
clamped to [0, 100]
```

CLM insights are generated for: dead nodes (critical), open circuits (warning), high backpressure (warning), high dedup rates (info), and high latency (warning).

---

## Hardening Layer ("Synapse")

The hardening layer (`hardening.ts`) provides:

- **Signal validation** — Blocks prototype pollution signals (`__proto__`, `constructor`, etc.)
- **Payload size limits** — 64KB maximum, serialization check
- **Signal type length** — 128 character maximum
- **Flood protection** — 100 signals/sec per source node (1-second sliding window)
- **Health report** — Composite report across all hardening subsystems

---

## Capability Auto-Activation Engine (v1.0.0)

NERVE v9.1.0 includes the **Capability Auto-Activation Engine** — the substrate's autonomic nervous system that transforms 50 idle capabilities into event-reactive behaviors.

### Architecture

```
System Event/Signal
  → NERVE Signal Router (pattern match)
  → Activation Registry (50 rules, 5 tiers)
  → Guard Layer (governance / cooldown / concurrency)
  → Auto-Execute Capability
  → Telemetry / Audit
```

### Tier Breakdown

| Tier | Count | Latency Budget | Scope |
|------|-------|---------------|-------|
| T1 Critical | 10 | <100ms | Security, integrity, privacy |
| T2 Operational | 10 | <500ms | Infrastructure, failover, healing |
| T3 Intelligence | 10 | <2s | Learning, prediction, enrichment |
| T4 Optimization | 10 | <5s | Tuning, analysis, compliance |
| T5 Autonomous | 10 | Idle | Self-improvement, consolidation |

### Guard Layer

- **Governance blocks** — Per-rule override via `governanceBlock(ruleId)`. T1 security rules are non-governable.
- **Cooldown enforcement** — Configurable multiplier, per-rule cooldowns (1s–7200s).
- **Concurrency limiting** — Max 5 concurrent activations (configurable).

### Key Capabilities Auto-Activated

- `ACT_001` — Threat Neutralization (DEFENSE, on threat severity ≥7)
- `ACT_003` — Session Kill on Leakage (SHADOW, on data leakage severity ≥9)
- `ACT_011` — Adaptive Route Optimization (RELAY, on latency >500ms)
- `ACT_021` — Memory Tier Promotion (MEMORY, on access frequency spike)
- `ACT_041` — Dream Consolidation Cycle (DREAM, on system idle)

---

## CLM Learning Priorities

1. **Signal Routing Optimization** — Learning which paths have lowest latency under different load conditions
2. **Backpressure Prediction** — Anticipating downstream overload before it reaches critical thresholds
3. **Auto-Activation Tuning** — Optimizing cooldown timings and severity thresholds from execution outcomes

---

*CMPSBL® Substrate — NERVE Node Deep Dive · Founder Eyes Only*
