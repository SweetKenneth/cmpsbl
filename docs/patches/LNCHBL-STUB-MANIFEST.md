# LNCHBL Stub Manifest Patch

**Origin:** CMPSBL Canonical  
**Target:** LNCHBL Distribution  
**Purpose:** Ensure all CMPSBL-only internals are permanently stubbed, blocked, or absent in LNCHBL.

---

## PROMPT FOR LNCHBL PROJECT

Paste the following into the LNCHBL project:

---

### Instructions

This is the **LNCHBL Stub Manifest** from the CMPSBL canonical substrate. Your job is to audit the LNCHBL codebase and ensure **every item below** is either:

1. **Absent** (file/function doesn't exist — ideal), or
2. **Stubbed** (replaced with a no-op that throws or returns a clear error), or
3. **Blocked** (import path aliased to a stub module)

If any of these exist in working form, they represent a security or IP violation.

---

## 1. EDGE FUNCTIONS — Block All `pf-*` Functions

LNCHBL must have **ZERO** `pf-*` edge functions. These are CMPSBL-only. If any exist in `supabase/functions/`, delete them entirely.

**Functions that must NOT exist:**
- `pf-nexus-router`
- `pf-vault`
- `pf-seba-*` (any SEBA-prefixed function)
- `pf-cortex-*` (any CORTEX-prefixed function)
- `pf-governor-*`
- `pf-clm-*`
- `pf-modernizer-*`
- `pf-encode-*`
- `pf-decode-*`
- `pf-brain-*`
- `pf-agency-*`
- `pf-autoblog-*`
- `pf-blog-*`
- `pf-accessibility-*`
- `pf-security-*`

**Allowed LNCHBL functions (whitelist):**
- `lnchbl-checkout`
- `lnchbl-customer-portal`
- `lnchbl-download`
- `lnchbl-phone-home`
- `lnchbl-verify`
- `lnchbl-patch-receive` (if implemented)

**Action:** Run `ls supabase/functions/` and delete any directory starting with `pf-`.

---

## 2. SELF-EVOLUTION ENGINES — Stub or Remove

These are CMPSBL crown jewels and must never execute in LNCHBL:

| Module | Files to Stub/Remove |
|--------|---------------------|
| **SEBA** | `src/lib/seba/`, `src/lib/terminal/seba-handlers.ts` |
| **CORTEX** | `src/lib/cortex/`, any `cortex-*` imports |
| **Evolution Mesh** | `src/lib/evolution-mesh/` — all services (snapshot, diff, integrity, promotion, telemetry, mutation) |
| **Predictive Healing** | `src/lib/system/predictiveHealing.ts` |
| **MODERNIZER** | Any `modernizer-*` files |
| **CLM** | Any `clm-*` files |

**Stub pattern** (if the import is referenced elsewhere and can't be cleanly removed):

```typescript
// src/lib/seba/index.ts (STUB)
export const executeSEBA = () => {
  throw new Error('[LNCHBL] SEBA is not available in this distribution.');
};
export const registerSEBAHandlers = () => {};
```

---

## 3. GOVERNANCE & CANON — Read-Only or Absent

These protect distribution identity and must never be writable:

| Item | Rule |
|------|------|
| `src/lib/distribution/index.ts` | Must exist but `DISTRIBUTION_ID` must be `'LNCHBL'`, not `'CMPSBL'` |
| `src/lib/patches/author.ts` | **DELETE entirely.** LNCHBL receives patches, it does not author them. |
| `src/lib/substrate-export.ts` | **DELETE entirely.** LNCHBL cannot export substrate bundles. |
| `PROHIBITED_PATCH_FIELDS` | Must still be enforced if patch-receive exists |

---

## 4. TERMINAL COMMANDS — Disable Internal Commands

These terminal handler registrations must be stubbed to no-ops:

```typescript
// These should be empty functions or absent:
registerSEBAHandlers()      // SEBA commands
registerEncodedHandlers()   // Encoded/obfuscated commands
registerEncodeModuleHandlers() // ENCODE module
registerInfraHandlers()     // Infrastructure internals
registerInfraModuleHandlers() // Infra Six
registerMeshHandlers()      // Intent Mesh
```

**Keep only:**
- `registerHandler()` (core registry)
- `registerSynergyHandlers()` (if synergies are tier-unlocked)
- Basic `executeCommand()` / `dryRunCommand()`

---

## 5. STORES & STATE — Block Internal Metrics

| Store/Module | Action |
|-------------|--------|
| `src/stores/publicMetricsStore` | OK to keep (read-only public metrics) |
| `src/core/metrics/moduleAdapters/` | Remove all adapters that query CMPSBL-only tables |
| Internal health monitoring | Stub `startMonitoring()`, `runHealthCheck()` to no-ops |
| `src/lib/system/auditLogging.ts` | Stub — LNCHBL should not write to CMPSBL audit tables |
| `src/lib/system/dependencyGraph.ts` | Stub or remove |
| `src/lib/system/performanceProfiler.ts` | Stub or remove |
| `src/lib/system/resourceMonitor.ts` | Stub or remove |

---

## 6. IDENTITY MERGE SHIM — Review

`src/lib/substrate/identity-access-merge.ts` routes identity calls to the ACCESS module. This is acceptable in LNCHBL **only if** the ACCESS module is properly scoped to LNCHBL's own auth. Verify:

- `handleIdentityProxy()` does not call CMPSBL-specific endpoints
- Events emitted stay within LNCHBL's event bus, not CMPSBL's

---

## 7. DATABASE TABLES — Do Not Create CMPSBL-Only Tables

These tables belong to CMPSBL and must **not** exist in LNCHBL's schema:

- `cmpsbl_patches` (LNCHBL uses `distribution_patches` instead)
- `brain_memory_hot`, `brain_memory_warm`, `brain_memory_cold`
- `cognitive_registry`
- `agent_competency`
- `ai_daily_quota`, `ai_usage_log`, `ai_learning_data`
- `atlas_capabilities`
- `auto_blog_*`, `autoblog_*`
- `audit_logs` (CMPSBL's internal audit)
- Any table prefixed with `agency_*` (unless LNCHBL has its own agency feature)

**LNCHBL-specific tables (keep):**
- `distribution_patches`
- `distribution_state`
- `distribution_edge_functions`
- Any `lnchbl_*` prefixed tables

---

## 8. BRANDING ENFORCEMENT

- Remove ALL references to "Lovable" (the build tool, not the product name)
- Module names must be ALL CAPS: BRAIN, MEMORY, DEFENSE, DECODE, ENCODE, etc.
- No version numbers in SEO, meta tags, or OG cards
- Assert script `scripts/assert-no-lovable.sh` should be present and passing

---

## 9. VERIFICATION CHECKLIST

After applying stubs, run these checks:

```bash
# 1. No pf-* functions exist
ls supabase/functions/ | grep "^pf-" && echo "FAIL: pf-* functions found" || echo "PASS"

# 2. No Lovable AI references
bash scripts/assert-no-lovable.sh

# 3. No patch authoring capability
test -f src/lib/patches/author.ts && echo "FAIL: author.ts exists" || echo "PASS"

# 4. No substrate export
test -f src/lib/substrate-export.ts && echo "FAIL: export utility exists" || echo "PASS"

# 5. Distribution ID is LNCHBL
grep -r "DISTRIBUTION_ID.*CMPSBL" src/ && echo "FAIL: CMPSBL identity found" || echo "PASS"

# 6. No evolution mesh services active
grep -r "mutationEngine\|promotionService\|snapshotService" src/ --include="*.ts" -l
```

---

## 10. SEALED RUNTIME ENFORCEMENT

If LNCHBL exposes any "experience" features (templates, sealed runtimes), ensure the 10-point enforcement interface is active:

1. ✅ Source visibility disabled
2. ✅ Prompt leakage blocked
3. ✅ Memory leakage blocked
4. ✅ Internal config hidden
5. ✅ System graph not visible
6. ✅ Cross-project bleed prevented
7. ✅ Export disabled
8. ✅ Duplication blocked
9. ✅ Cloning blocked
10. ✅ Discovery engine composition blocked

---

*Generated by CMPSBL Canonical — Canon Authority Preserved*
