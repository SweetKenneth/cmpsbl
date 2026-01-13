# Archived Edge Functions

These functions have been consolidated into the unified `pf-substrate` endpoint.

## Active Substrate Modules

| Module | Purpose | Endpoint |
|--------|---------|----------|
| **Brain** | Memory, learning, reflection, knowledge synthesis | `/pf-substrate?module=brain&action=*` |
| **Cascade** | User-facing chat, dream generation, proposals | `/pf-substrate?module=cascade&action=*` |
| **Defense** | Bot detection, threat analysis, IP reputation | `/pf-substrate?module=defense&action=*` |
| **Nexus** | Multi-provider AI routing (text, image, video) | `/pf-substrate?module=nexus&action=*` |
| **Vision** | Observability, metrics, health monitoring | `/pf-substrate?module=vision&action=*` |

## Migration Guide

All legacy endpoints now return `410 Gone` and redirect to the substrate.

```typescript
// Old way (deprecated)
const response = await supabase.functions.invoke('pf-brain-learn', { body: data });

// New way (substrate)
const response = await supabase.functions.invoke('pf-substrate', {
  body: { module: 'brain', action: 'learn', ...data }
});
```

## Archived Function Categories

### Brain (consolidated)
- pf-brain-* (80+ functions) → `module=brain`

### Cascade (consolidated)
- pf-cascade-* (15+ functions) → `module=cascade`

### Defense (consolidated)
- pf-defense-* (30+ functions) → `module=defense`
- pf-bot-* (10+ functions) → `module=defense`

### Nexus (consolidated)
- pf-nexus-* (4 functions) → `module=nexus`

### Vision (new)
- pf-analytics-*, pf-health-*, pf-diagnostics-* → `module=vision`

---

promptfluid® v2026.01 — Cognitive Orchestration Substrate
