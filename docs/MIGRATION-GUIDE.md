# promptfluid® Substrate — Migration Guide

**Migrating from Legacy Functions to Unified Substrate**

---

## Overview

All 200+ legacy edge functions have been consolidated into a single `pf-substrate` endpoint with 11 modules. Legacy endpoints now return `410 Gone` with migration instructions.

---

## Quick Migration

### Before (Legacy)

```typescript
// Old way - many separate endpoints
await supabase.functions.invoke('pf-brain-learn', {
  body: { content: 'New insight', type: 'insight' }
});

await supabase.functions.invoke('pf-brain-scheduler', {
  body: { action: 'schedule', task: '...' }
});

await supabase.functions.invoke('pf-generate-api-key', {
  body: { name: 'Production' }
});
```

### After (Substrate)

```typescript
// New way - unified substrate
await supabase.functions.invoke('pf-substrate', {
  body: { 
    module: 'brain', 
    action: 'remember',
    content: 'New insight',
    memory_type: 'insight'
  }
});

await supabase.functions.invoke('pf-substrate', {
  body: { 
    module: 'core', 
    action: 'schedule',
    module: 'brain',
    action: 'reflect',
    scheduled_at: '2026-01-24T00:00:00Z'
  }
});

await supabase.functions.invoke('pf-substrate', {
  body: { 
    module: 'access', 
    action: 'create_key',
    name: 'Production'
  }
});
```

---

## Function Mapping

### BRAIN Functions

| Legacy Endpoint | New Module/Action |
|----------------|-------------------|
| `pf-brain-learn` | `brain/remember` |
| `pf-brain-query` | `brain/query` |
| `pf-brain-reflect` | `brain/reflect` |
| `pf-brain-reinforce` | `brain/reinforce` |
| `pf-brain-train` | `brain/train` |
| `pf-brain-scheduler` | `core/schedule` |
| `pf-brain-deep-think` | `brain/deep_think` |
| `pf-brain-hypothesis-test` | `brain/hypothesis_test` |
| `pf-brain-cognitive-cycle` | `brain/cognitive_cycle` |
| `pf-brain-dream` | `dream/cycle` |

### CORE Functions

| Legacy Endpoint | New Module/Action |
|----------------|-------------------|
| `pf-core` | `core/status` |
| `pf-core-unified` | `core/config` |
| `pf-core-gateway` | `core/route` |
| `pf-core-settings` | `core/config` |
| `pf-core-usage` | `access/get_usage` |
| `pf-core-keys` | `access/list_keys` |
| `pf-emergency-shutdown` | `core/shutdown` |
| `integration-bus` | `core/integrate` |

### RIPPLE Functions

| Legacy Endpoint | New Module/Action |
|----------------|-------------------|
| `pf-ripple-queue` | `ripple/enqueue` |
| `pf-ripple-generate` | `ripple/enqueue` |
| `pf-ripple-stats` | `ripple/status` |

### ACCESS Functions

| Legacy Endpoint | New Module/Action |
|----------------|-------------------|
| `pf-generate-api-key` | `access/create_key` |
| `pf-sdk-protect` | `access/validate_key` |
| `pf-core-subscription` | `access/check_quota` |

### DEFENSE Functions

| Legacy Endpoint | New Module/Action |
|----------------|-------------------|
| `pf-bot-detection` | `defense/detect` |
| `pf-defense-analyze` | `defense/analyze` |
| `pf-defense-rate-limit` | `core/authorize` |
| `pf-defense-stats` | `defense/stats` |

### CASCADE → DECODE/DREAM

| Legacy Endpoint | New Module/Action |
|----------------|-------------------|
| `pf-cascade-chat` | `decode/chat` |
| `pf-cascade-apply` | `decode/apply` |
| `pf-cascade-dream` | `dream/cycle` |
| `pf-cascade-proposals` | `decode/interpret` |

### SYSTEM Functions

| Legacy Endpoint | New Module/Action |
|----------------|-------------------|
| `pf-system-status` | `system/status` |
| `pf-diagnostics` | `system/diagnostics` |
| `pf-self-heal` | `system/heal` |
| `pf-backup-daily` | `system/backup` |

---

## SDK Migration

### Before (Direct Calls)

```typescript
// Old pattern
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/pf-brain-learn`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ content: '...' })
  }
);
```

### After (SDK)

```typescript
import { SubstrateClient } from '@/lib/substrate';

const substrate = new SubstrateClient();

// Type-safe, with auto-retry and health monitoring
const result = await substrate.brain.remember('Content', 'insight');
```

---

## Error Handling

Legacy endpoints return 410 with migration info:

```json
{
  "error": "Gone",
  "status": 410,
  "message": "This endpoint has been consolidated into pf-substrate.",
  "migration": {
    "from": "pf-brain-learn",
    "to": "pf-substrate?module=brain&action=remember",
    "guide": "See https://promptfluid.ai/docs/migration",
    "example": {
      "old": "supabase.functions.invoke('pf-brain-learn', { body: data })",
      "new": "supabase.functions.invoke('pf-substrate', { body: { module: 'brain', action: 'remember', ...data } })"
    }
  }
}
```

---

## Benefits of Migration

| Aspect | Before | After |
|--------|--------|-------|
| Endpoints | 200+ | 1 unified |
| Cold starts | Multiple | Single |
| Error handling | Inconsistent | Standardized |
| Health monitoring | None | Built-in |
| Circuit breakers | None | Automatic |
| Auto-healing | None | Automatic |
| Rate limiting | Manual | Centralized |

---

## Support

If you encounter issues during migration:

1. Check the 410 response for specific guidance
2. Review the API Reference: `/docs/API-REFERENCE.md`
3. Contact: promptfluid@gmail.com

---

*promptfluid® — The Cognitive Substrate OS*  
*© 2025-2026 promptfluid. All rights reserved.*
