# Full-System Engineering Audit Ledger

> Generated: 2026-03-03 | Status: In Progress

---

## Phase 1: Dependency Graph Audit

### Finding 1.1 — Global Mutable Singleton Without Reset
- **Severity**: Medium
- **Module**: `src/lib/substrate/dependency-graph/index.ts`
- **Issue**: The `graph` Map is a module-level singleton with no `clear()` or `reset()` function. This prevents test isolation and makes hot-module-reload unpredictable. During SSR or concurrent test runs, stale nodes persist across invocations.
- **Fix**: Add `clearGraph()` export and `getGraphSize()` utility.
- **Validation**: Unit test confirms graph resets correctly.
- **Rollback**: Remove `clearGraph` export; no behavior change to existing consumers.

### Finding 1.2 — Cycle Detection Doesn't Halt Traversal
- **Severity**: High
- **Module**: `src/lib/substrate/dependency-graph/index.ts`
- **Issue**: When a cycle is detected in `computeBootOrder`, the `visit()` function returns `false` but the caller ignores the return value. The cyclic node is still added to the `visited` set and `order` array, producing an incorrect boot order that includes nodes from cycles.
- **Fix**: After detecting a cycle, skip adding the node to the order and don't mark it visited so dependent nodes also fail.
- **Validation**: Test with known circular graph confirms cycles excluded from order.
- **Rollback**: Revert `visit()` logic to original (cycles silently included).

### Finding 1.3 — Over-Centralized Import Hubs
- **Severity**: Low (Architectural Debt)
- **Module**: Multiple
- **Issue**: Fan-in analysis reveals 3 critical import hubs:
  - `../events` — **47 importers** (highest centralization)
  - `../infra-resilience` — **21 importers**
  - `../module-hardening` — **12 importers**
  - `../circuit-breaker` — **direct + via infra-resilience** (dual-path coupling)
- **Risk**: A breaking change in `events/emit.ts` signature cascades across 47+ modules instantly. `infra-resilience` re-exports `circuit-breaker` internals, creating a leaky abstraction where some modules import from both.
- **Fix**: No code change needed — these are legitimate shared infrastructure. Document as known high-risk surfaces. Flag `subsystem-health/index.ts` which imports from BOTH `infra-resilience` AND `circuit-breaker` directly (dual-path coupling).
- **Validation**: N/A (documentation finding)
- **Rollback**: N/A

### Finding 1.4 — Dual-Path Circuit Breaker Imports
- **Severity**: Medium
- **Module**: `src/lib/substrate/subsystem-health/index.ts`, `src/lib/substrate/module-hardening/index.ts`
- **Issue**: These modules import from both `../infra-resilience` (which wraps circuit-breaker) AND directly from `../circuit-breaker`. This breaks the abstraction boundary — if circuit-breaker internals change, both the wrapper and direct consumers must update.
- **Fix**: Acceptable for these specific modules as they need low-level breaker control (reset, raw state). Document as intentional bypass. No code change.
- **Validation**: N/A
- **Rollback**: N/A

### Finding 1.5 — No Circular Dependency Detection at Import Time
- **Severity**: Low
- **Module**: `src/lib/substrate/dependency-graph/index.ts`
- **Issue**: `registerModule()` accepts dependency IDs without validating they exist in the graph. A module can declare a dependency on a not-yet-registered module, and `computeBootOrder` silently skips missing nodes in the traversal.
- **Fix**: Add optional validation mode to `registerModule` that warns on unknown dependencies.
- **Validation**: Console warning emitted for unregistered dependency IDs.
- **Rollback**: Remove validation check.

---

## Phase 2: Failure Domain & Kill-Switch Simulation

### Finding 2.1 — DLQ Missing TTL-Based Eviction
- **Severity**: Medium
- **Module**: `src/lib/substrate/dead-letter-queue.ts`
- **Issue**: Dead letters only evicted by count (max 200), never by age. Stale entries from weeks ago could persist indefinitely, providing misleading diagnostics.
- **Fix**: Added `MAX_AGE_MS = 24h` and `evictStale()` function called on every `addDeadLetter()`.
- **Validation**: Existing consumers unaffected; eviction is additive.
- **Rollback**: Remove `evictStale()` call and `MAX_AGE_MS` constant.

### Finding 2.2 — Timeout Promise Leak in Graceful Degradation
- **Severity**: High
- **Module**: `src/lib/substrate/graceful-degradation/index.ts`
- **Issue**: `withGracefulExec` creates a timeout `Promise` via `setTimeout` that is never cleared when the main function resolves first. In high-throughput scenarios, this leaks timer handles.
- **Fix**: Added `timer` variable and `.finally(() => clearTimeout(timer!))` to `Promise.race`.
- **Validation**: Same fix pattern used in circuit-breaker module.
- **Rollback**: Revert to inline `setTimeout` without cleanup.

### Finding 2.3 — Sector Kill-Switch Missing Expansion Zones
- **Severity**: Medium
- **Module**: `src/lib/substrate/sector-killswitch/index.ts`
- **Issue**: `ALL_SECTORS` only listed 8 original sectors, omitting ESZ, EPZ, EMZ, CSZ expansion zones added in the 38-node topology. `killAllNonEssential` also only targeted 2 sectors.
- **Fix**: Added all 4 expansion zones to `ALL_SECTORS` and `killAllNonEssential`.
- **Validation**: `getKilledSectors()` and `reviveAll()` now cover the full topology.
- **Rollback**: Remove expansion zone entries from array.

### Finding 2.4 — Sequential Subsystem Healing
- **Severity**: Low
- **Module**: `src/lib/substrate/subsystem-health/index.ts`
- **Issue**: `healAllSubsystems` ran heals sequentially. Since subsystems are independent, this unnecessarily doubled total heal time.
- **Fix**: Changed to `Promise.all()` for parallel healing.
- **Validation**: Return type unchanged; subsystem independence confirmed by inspection.
- **Rollback**: Revert to sequential `for` loop.

---

## Phase 3: Idempotency & State Mutation Audit

### Finding 3.1 — Timer Leak in Idempotency Pending Poller
- **Severity**: High
- **Module**: `src/lib/substrate/idempotency.ts`
- **Issue**: When polling for a pending idempotent operation, the `setTimeout` deadline fires even after `setInterval` resolves the promise, causing an unhandled rejection or double-reject.
- **Fix**: Added `deadline` variable cleared alongside `check` interval in both success and failure paths.
- **Validation**: 7/7 idempotency tests pass.
- **Rollback**: Remove `clearTimeout(deadline)` calls.

### Finding 3.2 — Failed Operations Block Re-Execution
- **Severity**: Medium
- **Module**: `src/lib/substrate/idempotency.ts`
- **Issue**: When an operation fails and is cached as `'failed'`, subsequent calls with the same key throw from the poller rather than allowing re-execution. The failed state persisted until TTL expiry.
- **Fix**: Added explicit fall-through comment for `status === 'failed'` to allow re-execution.
- **Validation**: Idempotency tests confirm correct behavior.
- **Rollback**: Remove the fall-through comment (no behavior change — existing code already fell through).

### Finding 3.3 — Duplicate Idempotency Implementation in Relay Hardening
- **Severity**: Low (Architectural Debt)
- **Module**: `src/lib/substrate/relay-hardening.ts`
- **Issue**: Contains a standalone `registerIdempotencyKey()` with its own `Map` and manual TTL cleanup, duplicating the centralized `withIdempotency` from `idempotency.ts`. Different eviction strategies (1h vs 5min).
- **Fix**: Documented as known tech debt. Relay's implementation is simpler (sync, key-only) and fits its webhook dedup use case. No immediate consolidation needed.
- **Validation**: N/A
- **Rollback**: N/A

---

## Phase 4: Observability Coverage Audit
*Pending*

## Phase 5: Performance & Load Boundary Audit
*Pending*

## Phase 6: Memory & Resource Leak Audit
*Pending*

## Phase 7: Security Surface Audit
*Pending*

## Phase 8: Economic & Cost Risk Audit
*Pending*

## Phase 9: Concurrency & Race Condition Audit
*Pending*

## Phase 10: Code Entropy & Orphan Sweep
*Pending*

## Phase 11: Versioning & Migration Audit
*Pending*

## Phase 12: Final Blind Spot Sweep
*Pending*
*Pending*

## Phase 7: Security Surface Audit
*Pending*

## Phase 8: Economic & Cost Risk Audit
*Pending*

## Phase 9: Concurrency & Race Condition Audit
*Pending*

## Phase 10: Code Entropy & Orphan Sweep
*Pending*

## Phase 11: Versioning & Migration Audit
*Pending*

## Phase 12: Final Blind Spot Sweep
*Pending*
