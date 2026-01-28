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

## Migration Guide

All legacy endpoints have been removed. Use the substrate directly:

```typescript
// New way (substrate)
const response = await supabase.functions.invoke('pf-substrate', {
  body: { module: 'cortex', action: 'learn', ...data }
});
```

---

promptfluid® v2026.01 — Cognitive Orchestration Substrate
