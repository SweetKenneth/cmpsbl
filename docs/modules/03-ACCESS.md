<div align="center">

# 🔑 ACCESS Module — Deep Dive

**Layer:** Kernel · **Boot Order:** 3 · **Dependencies:** CORE, RIPPLE

**v9.3.0 ARCHITECT Epoch**

</div>

---

## Purpose

ACCESS manages **identity, authentication, API keys, entitlements, rate limiting, and usage metering** for the substrate. It is the gatekeeper — every external request must pass through ACCESS before reaching any module.

---

## Capabilities

| Capability | Description |
|-----------|-------------|
| API Key Management | Generation, validation, rotation, revocation |
| Rate Limiting | Per-key and global request throttling |
| Usage Metering | Token consumption, cost tracking, quota enforcement |
| Entitlements | Tier-based feature access control |
| Developer Management | Developer registration, profiles |
| Subscription Management | Plan tiers, billing integration |

---

## API Key Architecture

### Key Structure

```
pf_live_aBcDeFgHiJkLmNoPqRsTuVwX
│  │     │
│  │     └─ 24 characters of cryptographic random
│  └─ Environment: live or test
└─ Prefix: pf (PromptFluid)
```

### Key Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Generate │───►│  Active  │───►│ Rotating │───►│ Revoked  │
│          │    │          │    │ (grace)  │    │          │
└──────────┘    └──────┬───┘    └──────────┘    └──────────┘
                       │
                       └───► Expired (auto-revoke)
```

- Keys are hashed (SHA-256) server-side — raw key shown only once at creation
- Grace period during rotation: old key valid for 24 hours after new key generated
- Expiration: configurable, default none

### Security Properties

| Property | Implementation |
|----------|---------------|
| Storage | SHA-256 hash only (raw never stored) |
| Prefix stored | Yes (for identification without decryption) |
| Rotation | New key generated, old key has 24h grace period |
| Revocation | Immediate — hash deleted from active set |

---

## Rate Limiting

### Algorithm: Token Bucket

```
Each key maintains two buckets:
  - Per-minute bucket (burst capacity)
  - Per-day bucket (sustained capacity)

On request:
  1. Check per-minute bucket → if empty, reject (429)
  2. Check per-day bucket → if empty, reject (429)
  3. Consume one token from each bucket
  4. Process request
```

### Default Limits by Tier

| Tier | Requests/Minute | Requests/Day | Burst Allowance |
|------|----------------|-------------|-----------------|
| Free | 20 | 1,000 | 5 extra |
| Pro | 200 | 50,000 | 50 extra |
| Enterprise | 2,000 | Unlimited | 500 extra |

### Adaptive Throttling

When substrate health drops below 70%:
- All rate limits reduced by 30%
- Burst allowances suspended
- Non-essential endpoints return 503

---

## Usage Metering

Every request is metered across multiple dimensions:

| Dimension | Tracking |
|-----------|----------|
| API calls | Count per key per day |
| Tokens consumed | Input + output tokens per request |
| Compute time | Edge function execution time (ms) |
| Cost | Calculated in millicents (1/10th cent) |

### Cost Calculation

```
request_cost = (
    tokens_used × token_rate
  + compute_ms × compute_rate
  + base_request_cost
)
```

Where rates vary by tier and provider used.

---

## Scope System

Scopes control what actions an API key can perform:

```
Scope Hierarchy:
  *:*                     ← Full access (all modules, all actions)
  ├── brain:*             ← All BRAIN operations
  │   ├── brain:read      ← Read-only BRAIN access
  │   └── brain:write     ← Write BRAIN access
  ├── system:*            ← All SYSTEM operations
  │   ├── system:read     ← Read-only system info
  │   └── system:admin    ← Administrative actions
  ├── agency:*            ← All agency operations
  │   ├── agency:manage   ← Create/configure agencies
  │   └── agency:execute  ← Run agency tasks
  └── ... (all 21 modules follow this pattern)
```

---

## Product Catalog

ACCESS manages a product catalog for entitlement management:

| Product Code | Name | Category |
|-------------|------|----------|
| `substrate-core` | Core Substrate Access | Platform |
| `brain-premium` | Enhanced Memory Features | Cognitive |
| `nexus-priority` | Priority AI Routing | Operational |
| `agency-base` | Base Agency Package | Agency |
| `agency-premium` | Premium Agency Features | Agency |
| `integration-enterprise` | Enterprise Adapters | Integration |
| `accessibility-pro` | Professional A11y Scanning | Compliance |

---

## Terminal Commands

| Command | Description |
|---------|-------------|
| `access.status` | Module status |
| `access.register` | Register new developer |
| `access.create_key` | Generate new API key |
| `access.revoke` | Revoke an API key |
| `access.keys` | List keys for a developer |
| `access.entitlements` | View developer entitlements |
| `access.products` | List available products |
| `access.usage` | Usage report (by key, by day) |
| `access.quota` | Current quota status |

---

## Events Emitted

| Event | When |
|-------|------|
| `access.key_created` | New API key generated |
| `access.key_revoked` | API key revoked |
| `access.rate_limited` | Request rejected by rate limiter |
| `access.quota_warning` | 80% of daily quota consumed |
| `access.quota_exceeded` | Daily quota fully consumed |

---

## Performance

| Metric | Value |
|--------|-------|
| Boot time | ~5ms |
| Key validation | < 2ms |
| Rate limit check | < 1ms |
| Usage logging | < 3ms (async) |
| Scope resolution | < 1ms |

---

<div align="center">

*CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
