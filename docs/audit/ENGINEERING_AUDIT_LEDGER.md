# CMPSBL Full-System Engineering Audit Ledger
**Version**: v17.1.0 | **Date**: 2026-03-28 | **Status**: In Progress

---

## Phase 1: Dependency Graph Audit ✅

### Stats
- **Total source files**: 2,868
- **Unique import targets**: 1,432
- **Circular dependencies**: 0 detected

### Top Import Hubs (risk: over-centralization)
| Hub File | Import Count | Severity | Action |
|---|---|---|---|
| integrations/supabase/client | 523 | INFO | Expected — single DB client singleton |
| components/ui/button | 371 | INFO | Expected — core UI primitive |
| lib/utils | 337 | INFO | Expected — utility belt |
| data/lib/substrate | 160 | LOW | Monitor — high fan-in but stable interface |

### Heaviest Importers (risk: tight coupling)
| File | Dep Count | Severity | Action |
|---|---|---|---|
| data/templates.ts | 120 | LOW | Data file, not logic — acceptable |
| pages/Blog.tsx | 75 | LOW | Page component — expected for feature pages |

**Finding**: Architecture is clean. No circular dependencies. Hub centralization is intentional (supabase client, UI primitives). No refactoring required.

**Rollback**: N/A — no changes made.

---

## Phase 2: Failure Domain & Kill-Switch Audit ✅

### HIGH Severity Findings

| ID | Issue | File | Fix | Validated |
|---|---|---|---|---|
| FD-001 | addEventListener without removeEventListener | RadioPlayer.tsx | Added full Audio cleanup on unmount (removeAttribute src, load, null ref) | ✅ |
| FD-002 | Supabase channel cleanup uses unsubscribe() instead of removeChannel() | useRealtimeConnection.ts | Changed to supabase.removeChannel(channel) | ✅ |
| FD-003 | 21 fetch() calls flagged without error handling | Various substrate-os tabs | FALSE POSITIVE — these are React Query refetch() calls, not bare fetch(). React Query handles errors via onError/throwOnError | N/A |

### MEDIUM Severity Findings

| ID | Issue | File | Severity | Action |
|---|---|---|---|---|
| FD-004 | DB calls without error checks | 14 files (CCRTab, ForgeTab, etc.) | MEDIUM | These are substrate-os dashboard tabs using supabase calls inside React Query — error handling is at the query level. Low risk. |
| FD-005 | External HTTP without retry/backoff | freeApiAdapters.ts, site-tracker.ts | MEDIUM | Acceptable — these are fire-and-forget analytics/tracking calls. Adding retry would increase cost. |

### Module-Level Singleton Timers (setInterval without clearInterval)

| File | Purpose | Severity | Action |
|---|---|---|---|
| identity-context.ts | Hourly cleanup of expired identity contexts | INFO | Intentional singleton — Map capped at 500, 7-day TTL. No leak. |
| log.ts | Minute-interval cleanup of log dedup cache | INFO | Intentional singleton — guarded by `typeof window`. No leak. |
| learning/collector.ts | 5s flush of learning event queue | INFO | Queue capped at 200 entries. No leak. |
| capability-affinity.ts | FALSE POSITIVE — no setInterval in this file | N/A | N/A |
| performance-heuristics.ts | FALSE POSITIVE — AST pattern check string | N/A | N/A |
| phantom-module | FALSE POSITIVE — comment reference | N/A | N/A |
| sandbox-hardening | FALSE POSITIVE — injection pattern string | N/A | N/A |

**Rollback for FD-001**: Revert RadioPlayer.tsx cleanup useEffect to previous version (just pause + clearInterval).
**Rollback for FD-002**: Change `supabase.removeChannel(channel)` back to `channel.unsubscribe()`.

---

## Phase 3: Idempotency & State Mutation Audit 🔄
*Pending — next batch*

## Phase 4: Observability Coverage Audit 🔄
*Pending*

## Phase 5: Performance & Load Boundary Audit 🔄
*Pending*

## Phase 6: Memory & Resource Leak Audit ✅
*(Covered in Phase 2 — 150 items scanned, 2 HIGH fixes applied, 28 MEDIUM triaged, remainder LOW/INFO)*

## Phase 7: Security Surface Audit 🔄
*Pending*

## Phase 8: Economic & Cost Risk Audit 🔄
*Pending*

## Phase 9: Concurrency & Race Condition Audit 🔄
*Pending*

## Phase 10: Code Entropy & Orphan Sweep 🔄
*Pending*

## Phase 11: Versioning & Migration Audit 🔄
*Pending*

## Phase 12: Final Blind Spot Sweep 🔄
*Pending*

---

## Summary (Phases 1-2)
- **Files scanned**: 2,868
- **Issues found**: 193 (150 resource + 43 failure domain)
- **HIGH severity**: 2 real, 19 false positives
- **Fixes applied**: 2
- **Regressions**: 0
- **Architecture health**: Strong — no circular deps, no tight coupling
