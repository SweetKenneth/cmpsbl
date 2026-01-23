# promptfluid® Substrate — OS Completion Roadmap

**v2026.01 → v2026.10 | From Hobby to Production AI Operating System**

---

## Executive Summary

The substrate currently has **8 operational modules** (Brain, Decode, Defense, Nexus, Vision, Dream, System, Modernizer). To become a true AI operating system that developers adopt, we need **3 additional kernel-level modules** and **consolidation of 200+ scattered edge functions**.

| Gap | Priority | Effort | Impact |
|-----|----------|--------|--------|
| **CORE (Kernel)** | P0 | High | Execution scheduler, lifecycle, state machine |
| **RIPPLE (Message Bus)** | P0 | Medium | Async queues, pub/sub, event sourcing |
| **ACCESS (Identity/Billing)** | P1 | Medium | API keys, quotas, Stripe integration |
| **Function Consolidation** | P1 | Low | Repurpose 200+ legacy functions → 11 unified endpoints |

---

## Current State Assessment

### ✅ Operational Modules (8)

| Module | Status | Endpoint |
|--------|--------|----------|
| **Brain** | ✅ Production | `pf-substrate?module=brain` |
| **Decode** | ✅ Production | `pf-substrate?module=decode` |
| **Defense** | ✅ Production | `pf-substrate?module=defense` |
| **Nexus** | ✅ Production | `pf-substrate?module=nexus` |
| **Vision** | ✅ Production | `pf-substrate?module=vision` |
| **Dream** | ✅ Production | `pf-substrate?module=dream` |
| **System** | ✅ Production | `pf-substrate?module=system` |
| **Modernizer** | ✅ Production | `pf-substrate-upgrade` |

### ⚠️ Existing Functions to Repurpose

| Function | Current State | Target Module |
|----------|--------------|---------------|
| `pf-ripple-queue` | Skeleton (70 lines) | → RIPPLE |
| `pf-ripple-generate` | Exists | → RIPPLE |
| `pf-ripple-image` | Exists | → RIPPLE |
| `pf-ripple-stats` | Exists | → RIPPLE |
| `pf-core` | Basic config (109 lines) | → CORE |
| `pf-core-unified` | Settings/usage (106 lines) | → CORE |
| `integration-bus` | Full (335 lines) | → CORE |
| `pf-generate-api-key` | Working | → ACCESS |
| `pf-brain-scheduler` | Full (252 lines) | → CORE (scheduler) |
| `pf-defense-rate-limit` | Exists | → CORE (rate limiting) |

---

## Phase 1: CORE Module (The Kernel) ✅ COMPLETE

**Timeline:** 2 weeks → **Completed 2026-01-23**  
**Credit Estimate:** Low (repurpose existing)

### What CORE Does

The kernel that manages all other modules. Every request flows through Core.

```
Developer Request → CORE → Route to Module → Execute → Return
                     ↓
              [Schedule, Authorize, Log, Meter]
```

### Core Actions to Implement

| Action | Description | Repurpose From |
|--------|-------------|----------------|
| `core.boot` | Initialize all modules, validate dependencies | `pf-core` |
| `core.schedule` | Queue jobs with priority, retry logic | `pf-brain-scheduler` |
| `core.authorize` | Check permissions, rate limits | `pf-defense-rate-limit` |
| `core.route` | Forward requests to correct module | `pf-core-gateway` |
| `core.meter` | Track usage per API key | `pf-core-usage` |
| `core.integrate` | Connect external services | `integration-bus` |
| `core.config` | Global system configuration | `pf-core-settings` |
| `core.shutdown` | Graceful system shutdown | `pf-emergency-shutdown` |

### Database Tables Required

```sql
-- Job scheduler
CREATE TABLE core_jobs (
  id UUID PRIMARY KEY,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'queued',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_by TEXT
);

-- System state machine
CREATE TABLE core_state (
  id UUID PRIMARY KEY,
  state TEXT NOT NULL, -- 'booting', 'running', 'degraded', 'maintenance', 'shutdown'
  modules_status JSONB,
  last_heartbeat TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Execution contexts
CREATE TABLE core_contexts (
  id UUID PRIMARY KEY,
  api_key_id UUID,
  developer_id TEXT,
  permissions JSONB,
  rate_limit_remaining INTEGER,
  created_at TIMESTAMPTZ
);
```

### Consolidation Target

Merge into `pf-substrate?module=core`:
- `pf-core`
- `pf-core-unified`
- `pf-core-admin`
- `pf-core-gateway`
- `pf-core-keys`
- `pf-core-settings`
- `pf-core-status`
- `pf-core-subscription`
- `pf-core-usage`
- `pf-brain-scheduler` (scheduler logic only)
- `pf-defense-rate-limit` (rate limit logic only)
- `pf-emergency-shutdown`
- `integration-bus`

---

## Phase 2: RIPPLE Module (Message Bus) ✅ COMPLETE

**Timeline:** 1.5 weeks → **Completed 2026-01-23**  
**Credit Estimate:** Low (repurpose existing)

### What RIPPLE Does

Async job processing, pub/sub messaging, event sourcing.

```
Module A publishes "memory.stored" → RIPPLE → Module B subscribes → triggered
```

### Ripple Actions to Implement

| Action | Description | Repurpose From |
|--------|-------------|----------------|
| `ripple.enqueue` | Add job to queue | `pf-ripple-queue` |
| `ripple.dequeue` | Get next job | `pf-ripple-queue` |
| `ripple.publish` | Publish event to topic | New |
| `ripple.subscribe` | Subscribe to topic | New |
| `ripple.status` | Queue stats | `pf-ripple-stats` |
| `ripple.retry` | Retry failed job | New |
| `ripple.dead_letter` | View failed jobs | New |

### Database Tables Required

```sql
-- Job queues
CREATE TABLE ripple_jobs (
  id UUID PRIMARY KEY,
  queue_name TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, dead
  priority INTEGER DEFAULT 5,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pub/sub topics
CREATE TABLE ripple_topics (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE ripple_subscriptions (
  id UUID PRIMARY KEY,
  topic_id UUID REFERENCES ripple_topics(id),
  subscriber_module TEXT NOT NULL, -- 'brain', 'dream', etc.
  subscriber_action TEXT NOT NULL, -- action to call when event fires
  filter_conditions JSONB, -- optional filters
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event log (event sourcing)
CREATE TABLE ripple_events (
  id UUID PRIMARY KEY,
  topic TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  publisher_module TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Consolidation Target

Merge into `pf-substrate?module=ripple`:
- `pf-ripple-queue`
- `pf-ripple-generate`
- `pf-ripple-image`
- `pf-ripple-stats`

---

## Phase 3: ACCESS Module (Identity & Billing) ✅ COMPLETE

**Timeline:** 2 weeks → **Completed 2026-01-23**  
**Credit Estimate:** Medium

### What ACCESS Does

API key management, usage metering, quotas, billing integration.

```
Request with API Key → ACCESS.validate → Check quota → Allow/Deny
                                           ↓
                                   [Log usage, bill if needed]
```

### Access Actions to Implement

| Action | Description | Repurpose From |
|--------|-------------|----------------|
| `access.create_key` | Generate new API key | `pf-generate-api-key` |
| `access.validate_key` | Validate API key | `pf-sdk-protect` |
| `access.revoke_key` | Revoke API key | New |
| `access.list_keys` | List developer's keys | `pf-core-keys` |
| `access.get_usage` | Get usage stats | `pf-core-usage` |
| `access.check_quota` | Check remaining quota | New |
| `access.create_checkout` | Stripe checkout | `defense-create-checkout` |
| `access.webhook` | Stripe webhook handler | Existing |
| `access.portal` | Customer portal | `defense-customer-portal` |

### Database Tables Required

```sql
-- API Keys with scopes
CREATE TABLE access_api_keys (
  id UUID PRIMARY KEY,
  developer_id UUID NOT NULL,
  key_hash TEXT NOT NULL, -- hashed, never store raw
  key_prefix TEXT NOT NULL, -- first 8 chars for display
  name TEXT,
  scopes TEXT[] DEFAULT '{}', -- ['brain:read', 'nexus:write']
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage metering
CREATE TABLE access_usage (
  id UUID PRIMARY KEY,
  api_key_id UUID REFERENCES access_api_keys(id),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  compute_ms INTEGER DEFAULT 0,
  cost_millicents INTEGER DEFAULT 0, -- 0.001 cents
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily quota tracking
CREATE TABLE access_quotas (
  id UUID PRIMARY KEY,
  api_key_id UUID REFERENCES access_api_keys(id),
  date DATE NOT NULL,
  calls_used INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_millicents INTEGER DEFAULT 0,
  UNIQUE(api_key_id, date)
);

-- Subscriptions/tiers
CREATE TABLE access_subscriptions (
  id UUID PRIMARY KEY,
  developer_id UUID NOT NULL,
  tier TEXT DEFAULT 'free', -- free, starter, pro, enterprise
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_quota INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Consolidation Target

Merge into `pf-substrate?module=access`:
- `pf-generate-api-key`
- `pf-sdk-protect`
- `pf-core-keys`
- `pf-core-usage`
- `pf-core-subscription`
- `defense-create-checkout`
- `defense-check-subscription`
- `defense-customer-portal`
- `bot-sniper-create-checkout`
- `bot-sniper-check-subscription`
- `create-agency-checkout`

---

## Phase 4: Function Consolidation ⏳ IN PROGRESS

**Timeline:** 1 week  
**Credit Estimate:** Very Low (file moves + redirects)
**Status:** Legacy functions identified, consolidation framework ready

### Consolidation Matrix

| Legacy Functions | Count | Target |
|------------------|-------|--------|
| `pf-brain-*` | 80+ | `pf-substrate?module=brain` |
| `pf-cascade-*` | 15+ | `pf-substrate?module=dream` |
| `pf-defense-*` | 30+ | `pf-substrate?module=defense` |
| `pf-marketing-*` | 20+ | Archive (out of scope) |
| `pf-clarity-*` | 25+ | Archive (legacy product) |
| `pf-modernizer-*` | 10+ | `pf-substrate-upgrade` |
| `pf-access-*` | 10+ | Archive (legacy product) |
| `pf-email-*` | 6 | `pf-substrate?module=system` |
| `pf-studio-*` | 6 | Future: Studio module |

### Migration Strategy

1. **Route legacy calls** → Add `410 Gone` + redirect info
2. **Move logic** → Extract reusable code to `_shared/`
3. **Archive source** → Move to `_archived/` with README
4. **Update SDK** → Point to unified endpoints

---

## Phase 5: OS Polish ✅ COMPLETE

**Timeline:** 1 week → **Completed 2026-01-23**  
**Credit Estimate:** Low
**Status:** Dashboard tabs, SDK enhancements, boot sequence implemented

### Boot Sequence

When substrate starts, display:

```
promptfluid® Substrate v2026.10
─────────────────────────────────
[CORE]       ████████████ READY     12ms
[BRAIN]      ████████████ READY     8ms
[DECODE]     ████████████ READY     5ms
[DEFENSE]    ████████████ READY     7ms
[NEXUS]      ████████████ READY     15ms
[VISION]     ████████████ READY     4ms
[DREAM]      ████████████ READY     6ms
[RIPPLE]     ████████████ READY     3ms
[ACCESS]     ████████████ READY     9ms
[SYSTEM]     ████████████ READY     5ms
[MODERNIZER] ████████████ READY     11ms
─────────────────────────────────
11 modules loaded | Health: 100%
```

### Dashboard Updates

- Add CORE tab (job scheduler view, system state)
- Add RIPPLE tab (queue visualization, pub/sub topics)
- Add ACCESS tab (API key management, usage charts)
- Boot sequence animation on /os load

### SDK Enhancements

```typescript
// Full SDK surface
import { substrate } from '@promptfluid/sdk';

// Core (kernel)
await substrate.core.boot();
await substrate.core.schedule({ module: 'brain', action: 'reflect', delay: '5m' });
await substrate.core.config('rate_limit_default');

// Ripple (message bus)
await substrate.ripple.enqueue('process_memory', { memoryId: '...' });
await substrate.ripple.publish('memory.stored', { id: '...' });
await substrate.ripple.subscribe('memory.stored', 'dream', 'process');

// Access (identity)
const key = await substrate.access.createKey({ name: 'Production', scopes: ['brain:*'] });
const usage = await substrate.access.getUsage('2026-01-01', '2026-01-31');
```

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPER SDK                           │
├─────────────────────────────────────────────────────────────────┤
│                          ACCESS                                  │
│               (API Keys, Quotas, Billing)                       │
├─────────────────────────────────────────────────────────────────┤
│                           CORE                                   │
│        (Scheduler, Router, Lifecycle, State Machine)            │
├───────────────┬───────────────┬─────────────────────────────────┤
│               │    RIPPLE     │                                 │
│               │  (Msg Bus)    │                                 │
├───────┬───────┼───────┬───────┼───────┬───────┬───────┬─────────┤
│ BRAIN │DECODE │DEFENSE│ NEXUS │ VISION│ DREAM │SYSTEM │MODERNIZER│
└───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┘
                              │
                    ┌─────────┴─────────┐
                    │    SUPABASE DB    │
                    │  (PostgreSQL)     │
                    └───────────────────┘
```

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: CORE** | 2 weeks | Kernel module with scheduler, routing, lifecycle |
| **Phase 2: RIPPLE** | 1.5 weeks | Message bus with queues, pub/sub |
| **Phase 3: ACCESS** | 2 weeks | Identity, billing, API key management |
| **Phase 4: Consolidation** | 1 week | 200+ functions → 11 endpoints |
| **Phase 5: Polish** | 1 week | Boot sequence, dashboard, SDK |
| **Total** | **7.5 weeks** | **Production-ready AI OS** |

---

## Success Criteria

### Technical

- [ ] 11 unified modules responding to `pf-substrate`
- [ ] Boot sequence completes in <500ms
- [ ] All 200+ legacy functions archived or migrated
- [ ] 100% health score maintainable
- [ ] <100ms p99 latency for core operations

### Adoption

- [ ] SDK published to npm
- [ ] Developer documentation complete
- [ ] Example applications in 3+ languages
- [ ] First external developer onboarded

### Business

- [ ] Usage-based billing operational
- [ ] Stripe integration complete
- [ ] Multi-tenant isolation verified

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes | Legacy functions return 410 with migration guide |
| Data loss | Mandatory backup before consolidation |
| Performance regression | Benchmark before/after each phase |
| Scope creep | Strict phase boundaries, no new features |

---

**Ready for review. Approve to begin Phase 1: CORE Module.**

---

*promptfluid® — The Cognitive Substrate OS*  
*© 2025-2026 promptfluid. All rights reserved.*
