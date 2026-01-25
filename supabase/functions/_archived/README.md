# Archived Edge Functions

These functions have been consolidated into the unified `pf-substrate` endpoint.

## Active Substrate Modules (13 modules)

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

## Cortex (formerly Cascade)

Cortex is the **resurrected** Cascade module under a new namespace. It implements an Agency-class 
autonomous agent with a core loop:

**PROPOSE → EVALUATE → APPLY → AUDIT → LEARN**

### Legacy Cascade Functions (now in Cortex)

| Legacy Function | New Cortex Action |
|-----------------|-------------------|
| pf-cascade-operative | cortex.propose + cortex.evaluate |
| pf-cascade-learner | cortex.learn |
| pf-cascade-improvement-engine | cortex.propose |
| pf-cascade-proposals | cortex.propose |
| pf-cascade-apply | cortex.apply |
| pf-cascade-audit | cortex.audit |
| pf-cascade-summary | cortex.summary |
| pf-cascade-router | (routed through substrate) |
| pf-cascade-learn | cortex.learn |
| pf-cascade-chat | decode.chat |
| pf-cascade-dream | dream.cycle |
| pf-cascade-generate-dream | dream.feed |
| pf-cascade-post-dream | (external blog API) |
| pf-cascade-coder | modernizer.implement |

**Note:** Legacy Cascade code is preserved. Cortex is the modern namespace.

## Migration Guide

All legacy endpoints now return `410 Gone` and redirect to the substrate.

```typescript
// Old way (deprecated)
const response = await supabase.functions.invoke('pf-cascade-learn', { body: data });

// New way (Cortex via substrate)
const response = await supabase.functions.invoke('pf-substrate', {
  body: { module: 'cortex', action: 'learn', ...data }
});
```

---

promptfluid® v2026.01 — Cognitive Orchestration Substrate
