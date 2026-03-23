# 37 — Module Orchestration & Communication: Complete Deep Dive

**Classification:** 🔒 INTERNAL — Engineering Reference

---

## 1. Executive Summary

The substrate's 38 nodes don't call each other directly. All inter-module communication flows through a layered bus architecture that provides topology awareness, priority routing, auto-routing tables, circuit-breaker-aware delivery, and persistent audit trails.

This document covers the complete orchestration stack: from the low-level Module Bus through the Matrix Communication Bus, up to the Orchestrator Engine that composes cognitive memory chains.

---

## 2. The Three-Layer Communication Stack

```
┌────────────────────────────────────────────────────────────┐
│  Layer 3: ORCHESTRATOR ENGINE                              │
│  Declarative cognitive memory chains                           │
│  ingest → learn → imagine → reason → govern → synthesize   │
├────────────────────────────────────────────────────────────┤
│  Layer 2: MATRIX COMMUNICATION BUS                         │
│  Topology-aware routing + sector broadcasts                │
│  Breaker-aware node-to-node signaling                      │
│  38-primitive dependency validation                             │
├────────────────────────────────────────────────────────────┤
│  Layer 1: MODULE BUS (Inter-Module Communication Bus)      │
│  In-memory pub/sub + auto-routing table                    │
│  Signal history ring buffer (500 entries)                   │
│  Critical signal persistence to database                   │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Layer 1 — Module Bus

**Source:** `src/lib/substrate/module-bus/index.ts`

### 3.1 — Core Primitives

The Module Bus is a pub/sub system with four operations:

| Operation | Function |
|---|---|
| `publish(from, type, payload, options)` | Emit a signal to the bus |
| `subscribe(module, signalType, handler)` | Register a handler for signal delivery |
| `unsubscribe(subscriptionId)` | Remove a subscription |
| `acknowledge(signalId)` | Mark a signal as handled (prevents re-delivery) |

### 3.2 — Signal Structure

Every signal on the bus carries:

```typescript
interface ModuleSignal {
  id: string;              // UUID
  from: ModuleName;        // Originating module
  to: ModuleName | '*';    // Target ('*' = broadcast)
  type: string;            // Signal type (e.g., 'threat.detected')
  priority: SignalPriority; // 'low' | 'normal' | 'high' | 'critical'
  payload: Record<string, any>;
  timestamp: string;       // ISO 8601
  ttl_ms: number;         // Time-to-live (default: 60,000ms)
  acknowledged: boolean;
}
```

### 3.3 — Signal Delivery

When `publish()` is called, delivery follows this sequence:

1. **Signal created** with UUID, timestamp, TTL
2. **Pushed to history** ring buffer (500 entries, LIFO)
3. **Subscriber matching** — for each subscription:
   - `typeMatch`: subscriber's signalType is `'*'` OR matches signal type
   - `moduleMatch`: signal `to` is `'*'` OR matches subscriber's module
   - `autoRouted`: signal type has an auto-route entry that includes subscriber's module
   - Delivery if: `typeMatch AND (moduleMatch OR autoRouted)`
4. **Handlers invoked** via `Promise.allSettled()` — one handler failure doesn't block others
5. **Persistence**: if signal priority is `critical` OR `persist: true`, written to `brain_events` table

### 3.4 — Auto-Routing Table

The auto-routing table is the substrate's intelligence distribution network. It defines which modules automatically receive which signal types, even if the signal wasn't addressed to them:

```
THREAT_DETECTED      → access, system, vision, audit, identity
RATE_LIMIT_BREACH    → nexus, access, defense, economy
PROVIDER_DOWN        → nexus, decode, dream, relay
REGRESSION_DETECTED  → modernizer, system, cortex, audit
PATTERN_LEARNED      → cortex, dream, modernizer, memory
QUOTA_WARNING        → nexus, system, access, economy
COST_SPIKE           → nexus, system, access, economy
DREAM_INSIGHT        → cortex, modernizer, brain, memory
HEALTH_DEGRADED      → system, vision, cortex, audit
```

This means when DEFENSE publishes a `THREAT_DETECTED` signal, ACCESS, SYSTEM, VISION, AUDIT, and IDENTITY all receive it automatically — even if the signal was published as a broadcast. The auto-routing ensures the right modules react without the sender needing to know the topology.

### 3.5 — Predefined Signal Types

The bus defines 20 standard signal types across six domains:

| Domain | Signals |
|---|---|
| **Health & Status** | `health.degraded`, `health.recovered`, `module.overloaded` |
| **Security** | `threat.detected`, `rate_limit.breach`, `auth.anomaly` |
| **Evolution** | `evolution.proposal_created`, `evolution.applied`, `evolution.regression` |
| **Knowledge** | `knowledge.pattern_learned`, `knowledge.memory_promoted`, `knowledge.insight` |
| **Operational** | `operational.quota_warning`, `operational.provider_down`, `operational.cost_spike` |
| **Planning** | `plan.created`, `plan.approved`, `plan.rejected`, `plan.executed`, `encode.plan.question`, `encode.plan.risk`, `encode.plan.answer`, `encode.plan.ready` |

### 3.6 — Convenience Publishers

High-level functions for common patterns:

```typescript
alertThreat(from, threatType, details)     // → critical priority, persisted, auto-routed
alertDegraded(module, reason, metrics)     // → high priority, persisted
sharePattern(from, pattern, confidence)    // → normal priority, persisted
alertRegression(from, details)             // → critical priority, persisted
```

### 3.7 — Signal History & Diagnostics

- **Ring buffer:** 500 signals, LIFO ordering
- **TTL cleanup:** `cleanupExpired()` removes signals older than their TTL
- **Bus stats:** `getBusStats()` returns total signals, active subscriptions, signals by type/module, unacknowledged count

---

## 4. Layer 2 — Matrix Communication Bus

**Source:** `src/lib/substrate/matrix/communication-bus.ts`

The Matrix Communication Bus extends Layer 1 with topology awareness. It knows about the 38-primitive matrix, the 12-category organization, and node dependencies.

### 4.1 — Sector Broadcast

```typescript
sectorBroadcast(from, sector, type, payload, priority)
```

Delivers a signal to **every node in a specific sector** (excluding the sender). Uses `getNodesBySector()` to resolve sector membership and publishes individually to each node.

The 12 sectors:

| Category | Example Nodes |
|---|---|
| CORE | core |
| SYSTEM | system |
| CCR | brain, memory, cortex |
| OCG | governance, audit, conscience, treaty |
| Execution | encode, decode, shadow |
| ESZ | evolution, dream |
| EPZ | economy, access |
| EMZ | identity, sovereign |
| CSZ | defense, immunity, phantom |
| Fields | intent, relay, ripple, nerve |
| Plane | nexus, vision |
| Shell | echo, reflex, forge, lingua, harvest, compass |

### 4.2 — Node-to-Node Signaling

```typescript
nodeSignal(from, to, type, payload, options)
```

Direct node-to-node communication with **circuit breaker awareness**:

1. Check target node's breaker state via `getNodeState(to)`
2. If breaker is `open` → return `null` immediately (no delivery attempt)
3. Otherwise → delegate to Layer 1 `publish()` with scoped `to` target

This is how the Mutation Pipeline delegates to the SHADOW module — via `nodeSignal` with `priority: 'high'` and `persist: true`.

### 4.3 — Matrix Broadcast

```typescript
matrixBroadcast(from, type, payload, priority)
```

Broadcast to all 38 nodes simultaneously. Used for system-wide announcements like mutation promotions and health checks.

### 4.4 — Health Signal Aggregation

```typescript
requestSectorHealth(requestor, sector)
```

Sends a high-priority `HEALTH_CHECK_REQUEST` to all nodes in a sector. Each node responds on its own telemetry channel.

### 4.5 — Connectivity Map

```typescript
getConnectivityMap(): Record<string, { reachable: string[]; unreachable: string[] }>
```

Returns a complete map of which nodes can reach which dependencies. A dependency is **unreachable** if its breaker is `open` or its health is 0. Used by the Evolution Control Center for topology visualization.

### 4.6 — Matrix Signal Constants

The Matrix Bus defines 13 signal types specific to matrix operations:

| Category | Signals |
|---|---|
| **Node Lifecycle** | `matrix.node.online`, `matrix.node.offline`, `matrix.node.degraded` |
| **Telemetry** | `matrix.telemetry.report`, `matrix.telemetry.anomaly` |
| **Mutation** | `matrix.mutation.proposed/shadow_start/shadow_result/shadow_execute/promoted/rejected/rolled_back` |
| **Health** | `matrix.health.check`, `matrix.health.response` |
| **Governor** | `matrix.governor.approval_request/granted/denied/veto` |

---

## 5. Layer 3 — Orchestrator Engine

**Source:** `src/lib/substrate/orchestrator-engine.ts`

The Orchestrator Engine is the highest-level composition layer. It chains cognitive engines into declarative memory chains and provides lifecycle hooks for monitoring.

### 5.1 — Cognitive Engines

The Orchestrator coordinates five engines:

| Engine | Module | Role |
|---|---|---|
| **Memory Core** | `memory-core.ts` | Ingest, store, index, retrieve, reflect |
| **Learning Engine** | `learning-engine.ts` | Pattern extraction, feedback loops |
| **Imagination Engine** | `imagination-engine.ts` | Latent recombination, synthesis |
| **Reasoning Engine** | `reasoning-engine.ts` | Causal mapping, hypothesis generation |
| **Governance Guard** | `governance-guard.ts` | Coherence checks, ethics validation |

### 5.2 — Preset memory chains

Five built-in pipeline configurations:

| Pipeline | Stages | Governance | Persist |
|---|---|---|---|
| **Memory Pipeline** | ingest → learn → output | No | Yes |
| **Creative Pipeline** | ingest → imagine → synthesize → output | Yes | Yes |
| **Analytical Pipeline** | ingest → reason → govern → output | Yes | Yes |
| **Full Cognitive** | ingest → learn → imagine → reason → govern → synthesize → output | Yes | Yes |
| **Quick Insight** | ingest → learn → output | No | No |

### 5.3 — Pipeline Execution

`executePipeline(config, input)` processes stages sequentially:

1. For each stage, the corresponding engine method is invoked
2. Each stage produces a `PipelineStageResult` with `success`, `durationMs`, and output data
3. Data flows between stages via a `currentData` accumulator
4. `onProgress` callback fires after each stage for real-time monitoring
5. In `sequential` mode, a failed stage halts the pipeline
6. Governance stage failure (`block` decision) throws immediately

### 5.4 — Full Cognitive Cycle

`cognitiveCycle(options)` is the substrate's highest-level operation:

```
Phase 1: Memory    — Ingest input with tags and confidence
Phase 2: Learning  — Extract patterns and feedback signals
Phase 3: Imagination — Run creative recombination (skipped in 'shallow' depth)
Phase 4: Reasoning — Causal mapping and hypothesis generation (only in 'deep' depth)
Phase 5: Governance — Coherence and ethics validation (unless disabled)
```

Output includes: memory count, insights, hypothesis count, governance status.

### 5.5 — Quick Actions

Common orchestration patterns exposed as single calls:

| Method | What It Does |
|---|---|
| `quickLearn(content, topic)` | Ingest + learn in one call |
| `smartRecall(query, limit)` | Retrieve + causal reasoning on results |
| `creativeSynthesize(topic)` | Ingest topic + run imagination cycle |
| `validateContent(content)` | Governance check without persistence |

### 5.6 — Engine Bus

**Source:** `src/lib/substrate/engine-bus.ts`

The Engine Bus is a specialized dispatch layer between the Orchestrator and individual engines:

```typescript
engineBus.dispatch(engine, method, args): DispatchResult
```

It provides:
- Unified invocation interface across all 5 engines
- Timing telemetry for every engine call
- Error capture and propagation
- Engine health tracking

---

## 6. Control Planes

**Source:** `src/lib/substrate/matrix/control-planes.ts`

Four control planes provide logical authority separation:

| Plane | Owner Nodes | Responsibility |
|---|---|---|
| **Governance** | governance, audit, conscience, treaty | Mutation approvals, policy enforcement |
| **Execution** | core, encode, sandbox, shadow, evolution | Code execution, shadow runs |
| **Memory** | memory, brain, dream, audit | Persistent logs, telemetry, receipt chain |
| **Routing** | nexus, relay, ripple, nerve, cortex | Provider orchestration, load balancing |

### 6.1 — Plane Policies

Eight enforced policies:

| Plane | Policy | Description |
|---|---|---|
| Governance | `MUTATION_REQUIRES_APPROVAL` | All mutations need governor sign-off |
| Governance | `DUAL_EXECUTOR_REQUIRED` | Critical mutations need two-man rule |
| Execution | `SHADOW_BEFORE_PRODUCTION` | Mandatory shadow run before promotion |
| Execution | `READINESS_THRESHOLD` | MRI ≥ 0.7 required |
| Memory | `RECEIPT_CHAIN_IMMUTABLE` | Receipts cannot be modified |
| Memory | `TELEMETRY_RETENTION_30D` | 30-day minimum retention |
| Routing | `BREAKER_AWARE_ROUTING` | Route around open breakers |
| Routing | `COST_AWARE_SELECTION` | Provider selection respects budget |

---

## 7. Registry — The Runtime Source of Truth

**Source:** `src/lib/substrate/matrix/registry.ts`

The Matrix Runtime Registry maintains mutable state for all 38 nodes:

### 7.1 — Node State

```typescript
interface RuntimeNodeState {
  id: SubstrateModuleName;
  health: number;              // 0–100
  breakerState: BreakerState;  // 'closed' | 'half-open' | 'open'
  dependencies: SubstrateModuleName[];
  telemetryChannel: string;
  lastHeartbeat: number;
  opsCount: number;
  errorCount: number;
  metadata: Record<string, unknown>;
}
```

### 7.2 — Dependency Map

Every node's upstream dependencies are explicitly defined:

```
decode    → core, brain, memory
encode    → core, decode
dream     → brain, memory
cortex    → core, brain, decode
nexus     → core, system
evolution → core, shadow, governance
defense   → core, identity, access
governance → core, audit
brain     → core, memory
...
```

### 7.3 — Registry Operations

| Operation | Effect |
|---|---|
| `setNodeHealth(id, health)` | Clamp to 0–100, emit `node.health_changed` event |
| `setNodeBreaker(id, state)` | Update breaker, sync with core registry, emit event |
| `heartbeat(id)` | Update `lastHeartbeat` timestamp |
| `recordOp(id, isError)` | Increment `opsCount`, optionally `errorCount` |
| `takeSnapshot()` | Capture point-in-time state of all 38 nodes + integrity report |
| `areDependenciesHealthy(id)` | Check all deps have health ≥ 50 and breaker ≠ open |

### 7.4 — Event System

Registry events are emitted for:
- `node.health_changed` (with before/after values)
- `node.breaker_changed` (with before/after states)
- `node.heartbeat` (with timestamp)
- `registry.snapshot` (with full snapshot data)

Listeners register via `onRegistryEvent()` and receive events synchronously.

---

## 8. End-to-End Signal Flow Example

Here's how a security threat flows through the orchestration stack:

```
1. DEFENSE module detects anomalous access pattern
   │
2. DEFENSE calls alertThreat('defense', 'brute_force', details)
   │
3. Module Bus publish():
   │  - Creates ModuleSignal with priority='critical'
   │  - Pushes to history ring buffer
   │  - Matches subscribers:
   │    • Direct match: any module subscribed to 'threat.detected'
   │    • Auto-route: access, system, vision, audit, identity
   │  - Invokes all matching handlers via Promise.allSettled()
   │  - Persists to brain_events (critical priority)
   │
4. ACCESS module handler fires:
   │  - Evaluates rate limit adjustments
   │  - May publish RATE_LIMIT_BREACH → auto-routed to nexus, access, defense, economy
   │
5. SYSTEM module handler fires:
   │  - Updates system health metrics
   │  - May trigger sectorBroadcast() to CSZ (defense sector)
   │
6. AUDIT module handler fires:
   │  - Appends to Merkle audit chain
   │  - Records immutable evidence
   │
7. IDENTITY module handler fires:
   │  - Flags suspicious user identity
   │  - May quarantine session
   │
8. VISION module handler fires:
   │  - Adds to scan findings
   │  - May trigger evolution proposal via SEBA
```

---

## 9. Architecture Principles

### 9.1 — No Direct Invocation

Modules never import and call each other directly. All communication flows through the bus layers. This enables:
- **Loose coupling:** Modules can be added/removed without breaking others
- **Observability:** Every signal is captured in the ring buffer
- **Resilience:** Breaker-aware routing prevents cascade failures
- **Auditability:** Critical signals are persisted

### 9.2 — Topology-Aware Routing

The Matrix Bus knows the category organization and dependency graph. This enables:
- **Sector isolation:** Problems in one sector can be contained
- **Dependency validation:** Signals to broken dependencies are dropped early
- **Health aggregation:** Sector-level health queries

### 9.3 — Scoped Delivery

Sensitive signals (like ENCODE plan details) use **scoped delivery** — addressed to specific nodes (e.g., `to: 'decode'`) rather than broadcast. This prevents insecure fanout of plan data across the entire matrix.

### 9.4 — Priority Escalation

Signal priority controls:
- **Delivery order:** Higher priority signals are processed first
- **Persistence:** `critical` signals are always written to database
- **Attention:** Governance and evolution systems weight critical signals higher

---

## 10. Diagnostics & Monitoring

| Tool | What It Shows |
|---|---|
| `getBusStats()` | Total signals, subscriptions, by-type/module breakdown, unacked count |
| `getRecentSignals(filters)` | Filtered view of signal history |
| `getConnectivityMap()` | Which nodes can reach which dependencies |
| `getOrchestratorState()` | Active/completed/failed memory chains, avg cycle time, engine health |
| `getAllPlaneStates()` | Status of all 4 control planes |
| `takeSnapshot()` | Point-in-time state of all 38 nodes |

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-06 | System | Complete orchestration deep dive — consolidated from source |

---

© 2025–2026 CMPSBL®. Confidential.
