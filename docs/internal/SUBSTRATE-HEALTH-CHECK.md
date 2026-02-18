# Substrate Health Check

**Internal ID:** `substrate_health_check`
**Classification:** First-class internal integrity primitive
**Location:** `src/lib/audit/substrate-health-check.ts`

---

## Purpose

The Substrate Health Check is a **non-user-facing, non-monetized** verification mechanism that validates the architectural integrity, governance enforcement, and system coherence of the entire CMPSBL stack.

This is **not** testing, linting, or QA. It is a **structural integrity guarantee** — proof that the system is coherent, governed, and evolution-ready.

---

## Execution Rules

| Rule | Enforcement |
|------|-------------|
| Runnable without authentication | ✅ No credentials required |
| Never mutates state | ✅ Read-only observation |
| Never auto-fixes anything | ✅ Report only |
| No side effects | ✅ Pure verification |

---

## Validation Layers

### A. Filesystem & Structure Integrity
- Confirms all 21 module directories are declared in the canonical registry
- Verifies audit check files are present
- No orphaned directories or missing module roots

### B. Import & Reference Validation
- Verifies core, terminal, and pipeline imports resolve at runtime
- Validates audit check modules are referenced
- Flags any unresolvable import chains

### C. Terminal & Capability Wiring
- Confirms all 10 terminal handler files are declared
- Checks registered command count via `getRegistrationStats()`
- Notes that lazy registration (0 pre-boot) is expected behavior

### D. Route Integrity
- Verifies current route loads without 404
- Confirms all 6 critical routes are declared in contract
- Detects dead or broken route references

### E. Registry Consistency
- Validates 100 crystallized pipelines exist in registry
- Confirms pipeline shape integrity (id, name, tier, modules)
- Verifies tier distribution (≥3 distinct tiers)

### F. Edge Function Presence
- Confirms 54+ active edge functions are declared
- Verifies archived functions are isolated in `_archived/`
- Active inventory excludes legacy/purged functions

### G. Database & Security Behavior
- Confirms RLS enforcement contract: 400/401 = PASS (not failure)
- Validates public showcase tables are intentionally readable
- Confirms infrastructure tables are admin-only hardened

### H. Runtime Render Sanity
- Detects browser vs SSR environment
- Verifies React root element is present
- Checks for fatal error boundary triggers

---

## Report Format

```typescript
interface HealthCheckReport {
  id: string;              // Unique run ID
  timestamp: string;       // ISO 8601
  duration_ms: number;     // Execution time
  overall_verdict: 'PASS' | 'FAIL';
  structural_issues: number;
  layers: LayerResult[];   // Per-layer breakdown
  confirmation: string[];  // Human-readable statements
}
```

### Clean Report Output

When no issues are found:
```
0 structural integrity issues detected.
No broken imports exist.
No orphaned files exist.
No dangling routes exist.
Security blocks function as intended.
```

---

## API

```typescript
import { runSubstrateHealthCheck, quickStructuralCheck } from '@/lib/audit/substrate-health-check';

// Full report
const report = runSubstrateHealthCheck();
console.log(report.overall_verdict); // 'PASS'

// Quick check
const { verdict, issues } = quickStructuralCheck();
```

---

## Integration Points

- **OS Terminal:** Can be invoked via terminal commands
- **Audit Engine:** Complements (does not replace) the existing `runFullAudit()` in `src/lib/audit/`
- **CI/CD:** Designed to be runnable as a pre-deploy gate

---

## What This Is NOT

- ❌ Not a test suite
- ❌ Not a linter
- ❌ Not QA
- ❌ Not user-facing
- ❌ Not monetized

This is a **substrate integrity guarantee** — a structural proof of system coherence.
