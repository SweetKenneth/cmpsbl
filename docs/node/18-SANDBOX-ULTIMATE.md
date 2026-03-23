# Node 18 — SANDBOX (Terrarium)

> **Version:** 9.0.0 · **Codename:** Terrarium  
> **Role:** Sovereign Execution Realm — secure, instrumented universe for untrusted code, experiments, and builder workloads  
> **Personality:** The Warden

---

## Overview

SANDBOX is the substrate's dedicated isolation and execution management node. It provides hermetically sealed environments where untrusted code, builder projects, mutation experiments, and chaos tests run without risk to the substrate core. Every sandbox is metered, recorded, monitored for escape attempts, and garbage-collected.

---

## 10 Systems

### 1. Isolation Boundary Engine
Creates hermetically sealed execution contexts with zero-trust defaults.

- **Namespace isolation:** No shared state (memory, filesystem, network)
- **Capability allow-lists:** Only explicitly granted capabilities accessible
- **Syscall filtering:** 7 dangerous operations denied by default (`exec`, `spawn`, `fork`, `kill`, `raw_socket`, `mount`, `chroot`)
- **Stack/recursion limits:** Default 256 stack depth, 64 recursion depth
- **Nested sandboxing:** Child inherits parent restrictions, can never exceed parent permissions

### 2. Resource Metering & Quotas
Every sandbox has a budget — CPU, memory, I/O, wall-clock time.

- **5 tier defaults:** builder (30s CPU), experiment (60s), evolution (90s), chaos (45s), system (120s)
- **Real-time tracking:** CPU cycles, heap bytes, I/O ops, wall-clock time
- **Graceful enforcement:** Warning at 80%, burst allowance (1.2–2.0×) for 5–15s, kill at burst limit
- **Cost attribution:** Maps resource usage to requesting entity

### 3. Execution Timeline Recorder
Full deterministic replay for sandbox execution.

- **Event recording:** Every call, I/O op, state mutation, capability access, error
- **Auto-checkpoints:** Every 500 events with state snapshots
- **Timeline scrubbing:** Replay forward/backward to any point
- **Diff viewer:** Compare state between any two checkpoints
- **Max 10,000 events** per sandbox with ring buffer

### 4. Escape Detection & Containment
Detects and prevents sandbox escape attempts.

- **5 attempt types:** boundary_probe (5), privilege_escalation (8), memory_breach (9), namespace_access (7), resource_hijack (6)
- **Auto-freeze:** Sandboxes frozen at threat level ≥7
- **Triple containment:** Freeze + alert DEFENSE + log forensic snapshot
- **Forensic linking:** Escape attempts cross-referenced with forensic snapshots

### 5. Network Policy Controller
Controls all network access for sandboxed code.

- **Default deny:** No network unless explicitly allowed
- **Domain allow-lists:** Per-sandbox approved endpoints with subdomain matching
- **Egress rate limiting:** Configurable requests/second per sandbox
- **TLS enforcement:** All connections require TLS 1.2+
- **DNS restriction:** `any`, `approved_only`, or `internal_only`
- **Traffic logging:** Full request/response metadata capture

### 6. Experiment Orchestrator
Manages controlled experiments within sandbox environments.

- **5-phase lifecycle:** DESIGN → PROVISION → EXECUTE → OBSERVE → CONCLUDE
- **Max 4 variants** with control vs. treatment isolation
- **Traffic splitting:** Percentage-based allocation summing to 100%
- **Statistical significance:** Simplified z-test (30+ samples, >5% difference)
- **Promotion:** Winning variant can be promoted to production

### 7. Builder Project Runtime
Execution environment for builder/developer projects.

- **Project-scoped sandbox** with tier-based quotas (builder/pro/governor)
- **Capability token injection:** Only purchased/activated capabilities
- **Hot-reload:** Code changes without sandbox restart
- **Build artifact isolation:** Outputs stay within sandbox filesystem
- **Lifecycle:** initializing → running → suspended → terminated

### 8. Forensic Snapshot Engine
Immutable, hash-sealed forensic captures of sandbox state.

- **Auto-trigger:** On crash, escape attempt, resource exhaustion, anomaly
- **Full capture:** Memory state, execution stack, filesystem, network log, timeline position
- **Merkle chain:** Content-hashed with previous-hash linking for tamper evidence
- **Retention:** 30-day default, critical snapshots permanent
- **Chain verification:** `verifyChain()` validates entire snapshot history

### 9. Sandbox Fleet Manager
Manages lifecycle of all sandboxes across the substrate.

- **Pre-warmed pool:** 5 sandboxes ready for instant provisioning
- **Lifecycle states:** PROVISIONING → ACTIVE → SUSPENDED → TERMINATED → ARCHIVED
- **GC scheduler:** Reclaims terminated sandboxes after 5-minute grace period
- **Fleet ceiling:** Max 100 sandboxes, 40% resource cap
- **Priority preemption:** High-priority sandboxes evict low-priority under pressure

### 10. Sandbox Telemetry Hub
Unified observability for all sandbox activity.

- **Per-sandbox metrics:** CPU%, memory%, I/O ops, wall-clock, capability calls
- **Fleet aggregates:** Avg CPU/memory, escape rate, provisioning P95 latency
- **Resource efficiency:** Actual usage vs. allocated quota
- **Experiment success rate:** % producing actionable results
- **100 metric samples** per sandbox, 500 latency samples fleet-wide

---

## Signal Flow

```
Sandbox Request (builder, experiment, chaos, mutation)
  → Fleet Manager (provision from pool)
  → Isolation Boundary Engine (create namespace)
  → Resource Metering (apply quota)
  → Network Policy Controller (configure rules)
  → Capability injection (allow-list)
  → Execute workload
  → Timeline Recorder (record everything)
  → Escape Detection (continuous monitoring)
  → Forensic Snapshot Engine (capture on anomaly)
  → Experiment Orchestrator (manage if experiment)
  → Telemetry Hub (emit metrics)
  → Fleet Manager (terminate + GC)
```

---

## Health API

```typescript
import { getSandboxUltimateHealth } from '@/lib/substrate/sandbox-module/ultimate';

const health = getSandboxUltimateHealth();
// → { version: '9.0.0', codename: 'Terrarium', overallHealth: 0–100, systems: { ... } }
```

**Overall health** is a weighted composite:
- Security (escape containment rate): 40%
- Resource health (no exceeded quotas): 30%
- Fleet headroom (utilization inverse): 30%

---

## File Structure

```
src/lib/substrate/sandbox-module/ultimate/
├── index.ts                      # Unified API + health
├── isolationBoundaryEngine.ts    # System 1
├── resourceMetering.ts           # System 2
├── executionTimelineRecorder.ts  # System 3
├── escapeDetection.ts            # System 4
├── networkPolicyController.ts    # System 5
├── experimentOrchestrator.ts     # System 6
├── builderProjectRuntime.ts      # System 7
├── forensicSnapshotEngine.ts     # System 8
├── sandboxFleetManager.ts        # System 9
└── sandboxTelemetryHub.ts        # System 10
```

---

*CMPSBL OS Substrate v15.7.0 · SANDBOX v9.0.0 "Terrarium"*
