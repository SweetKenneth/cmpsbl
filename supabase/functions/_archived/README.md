# Archived Edge Functions

These functions have been consolidated into the unified `pf-substrate` endpoint.

## Active Substrate Modules (14 modules)

| Module | Purpose | Endpoint |
|--------|---------|----------|
| **Brain** | Memory, learning, reflection, knowledge synthesis | `/pf-substrate?module=brain&action=*` |
| **Decode** | User-facing chat, dream generation, proposals | `/pf-substrate?module=decode&action=*` |
| **Defense** | Bot detection, threat analysis, IP reputation | `/pf-substrate?module=defense&action=*` |
| **Nexus** | Multi-provider AI routing (text, image, video) | `/pf-substrate?module=nexus&action=*` |
| **Vision** | Observability, metrics, health monitoring | `/pf-substrate?module=vision&action=*` |
| **Dream** | Dream-Eater operations, metabolic regulation | `/pf-substrate?module=dream&action=*` |
| **System** | Administration, diagnostics, resilience | `/pf-substrate?module=system&action=*` |
| **Modernizer** | Self-upgrade, improvement proposals | `/pf-substrate?module=modernizer&action=*` |
| **Core** | Kernel, scheduler, lifecycle management | `/pf-substrate?module=core&action=*` |
| **Ripple** | Message bus, pub/sub, event queues | `/pf-substrate?module=ripple&action=*` |
| **Access** | API keys, billing, metering | `/pf-substrate?module=access&action=*` |
| **Integration** | Enterprise adapters, auto-discovery | `/pf-substrate?module=integration&action=*` |
| **Cortex** | Agency-class autonomous proposal/evaluation/execution loop | `/pf-substrate?module=cortex&action=*` |
| **Inclusive** | Accessibility scanning, WCAG compliance, human-compatibility | `/pf-substrate?module=inclusive&action=*` |

## Deleted Legacy Redirects (Cleaned Up 2026-01-28)

The following functions were legacy 410-redirects that have been fully deleted:

- `pf-emergency-shutdown` → core.shutdown
- `pf-generate-api-key` → access.create_key
- `pf-ripple-queue` → ripple.enqueue
- `integration-bus` → core.integrate
- `pf-brain-scheduler` → core.schedule
- `pf-core-keys` → access.list_keys
- `pf-core` → core.status
- `pf-core-unified` → core.config
- `pf-core-usage` → access.get_usage
- `pf-defense-rate-limit` → core.authorize
- `pf-core-status` → core.status
- `pf-core-gateway` → core.route
- `pf-core-settings` → core.config

## Edge Functions Deleted (v7.0.3 — 2026-02-01)

The following edge functions had FULL overlap with substrate modules and have been **permanently deleted**:

| Edge Function | Substrate Module | Deletion Date |
|---------------|------------------|---------------|
| `pf-clarity-scan` | INCLUSIVE.scan | 2026-02-01 |
| `pf-defense-security-report` | DEFENSE.security_report | 2026-02-01 |
| `pf-ripple-image` | Disabled (402 stub) | 2026-01-28 |

## Edge Functions Deleted (v8.5.0 — 2026-02-11)

The 10 adapted capabilities + `pf-modernizer-brain-learn` have been **permanently deleted** from CMPSBL — all logic is now governed via the Capability Auto-Adapt system:

| Edge Function | Governed Capability | Deletion Date |
|---------------|---------------------|---------------|
| `pf-brain-hypothesis-test` | hypothesis-test | 2026-02-11 |
| `pf-resilience-monitor` | resilience-monitor | 2026-02-11 |
| `pf-brain-ethical-boundary` | ethical-boundary | 2026-02-11 |
| `pf-defense-anomaly-detection` | anomaly-detection | 2026-02-11 |
| `pf-brain-systems-reasoning` | systems-reasoning | 2026-02-11 |
| `pf-brain-self-critique` | self-critique | 2026-02-11 |
| `pf-brain-pattern-fusion` | pattern-fusion | 2026-02-11 |
| `pf-brain-temporal-score` | temporal-score | 2026-02-11 |
| `pf-brain-curiosity-reflect` | curiosity-reflect | 2026-02-11 |
| `pf-modernizer-brain-learn` | BRAIN.remember (substrate) | 2026-02-11 |

## ⚠️ LNCHBL Distribution — Edge Function Policy (v8.5.0)

**CRITICAL: LNCHBL has ZERO `pf-*` edge functions.**

All `pf-*` functions have been permanently removed from the LNCHBL distribution. The only edge functions that exist in LNCHBL are:

| Function | Purpose |
|----------|---------|
| `lnchbl-checkout` | Stripe checkout flow |
| `lnchbl-customer-portal` | Customer billing portal |
| `lnchbl-download` | SDK ZIP distribution |
| `lnchbl-phone-home` | Heartbeat & license check |
| `lnchbl-verify` | License verification |

### Patch Protocol Rules

1. Patches MUST target only `distribution_patches` and `distribution_state` tables
2. Patches MUST NEVER reference or depend on any `pf-*` edge function
3. If new edge function code is needed in LNCHBL, embed it in the `edge_function_code` field of the patch payload
4. The `lnchbl-patch-receive` endpoint writes `edge_function_code` to `distribution_edge_functions` table
5. The `lnchbl-download` function reads `distribution_state` to include unlocked capabilities in ZIPs

### Patch Payload Schema

```json
{
  "target_distribution": "LNCHBL",
  "patch_version": "x.y.z",
  "capabilities": [],
  "engines": [],
  "meta_engines": [],
  "config_overrides": {},
  "edge_function_code": null
}
```

## Remaining Standalone Functions (CMPSBL only)

These functions use the free-tier router and have NOT been fully merged:

| Edge Function | Status | Notes |
|---------------|--------|-------|
| `pf-marketing-strategy` | Standalone | Uses free-tier router, user-facing tool |
| `pf-modernizer-export` | Active | Has active usage in ModernizerJobStatus.tsx |

## Partial Overlap — DO NOT DELETE (CMPSBL only)

These functions have logic split across substrate modules and require TODO markers:

- `pf-brain-reflect` → Logic split across BRAIN engines
- `pf-cascade-improvement-engine` → Shared with CORTEX

## Unrepurposed Archived Functions (CMPSBL only)

Functions in `_archived/` that have NOT yet been integrated into the substrate remain available
for future repurposing. They exist ONLY in CMPSBL and are never distributed to LNCHBL.
When repurposed, delete the edge function and add the governed capability via Auto-Adapt.

## Capability Auto-Adapt System v7.0.0

Drop-in edge functions can now be auto-adapted into governed capabilities:

1. Place function in `supabase/functions/_archived/`
2. Include metadata comment:
```typescript
/*
@capability my-capability
@modules BRAIN,DECODE
@risk low
@reversible true
@description My capability description
*/
```
3. Run `system.scan_archived --confirm` in terminal
4. Capability is now governed and invokable via adapter
5. Toggle on/off in `/os` → **Evolve** → **Capabilities** dashboard

See `/src/lib/capabilities/` for the full system.

## Migration Guide

All legacy endpoints have been removed. Use the substrate directly:

```typescript
// New way (substrate)
const response = await supabase.functions.invoke('pf-substrate', {
  body: { module: 'cortex', action: 'learn', ...data }
});
```

---

promptfluid® v2026.02 — Cognitive Orchestration Substrate
