# CMPSBL® Library 16 — ACCESS Module

**Epoch:** CONTRACT (V13)  
**Classification:** Internal  
**Author:** Kenneth E. Sweet Jr.  
**Date:** 2026-02  

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Library ID** | CMPSBL-LIB-016 |
| **Module** | ACCESS |
| **Sector** | OCG (Operational Compliance Grid) |
| **Codename** | Gatekeeper |
| **Weight** | 0.040 (4%) |
| **Boot Order** | 7 |

---

## 1. Purpose

ACCESS manages API entitlements, developer keys, rate limiting, and quota management. It is the commercial gateway to the substrate, handling authentication, authorization, and usage metering.

---

## 2. Key Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateKey()` | `(key: string) → Promise<ValidationResult>` | Validate an API key |
| `checkQuota()` | `(keyId: string) → Promise<QuotaResult>` | Check remaining quota |
| `recordUsage()` | `(usage: UsageRecord) → Promise<void>` | Record API usage |
| `getSubscription()` | `(developerId: string) → Promise<Subscription>` | Get subscription details |

---

## 3. API Key Structure

```
API Key: pf_live_xxxxxxxxxxxxxxxxxxxx

Components:
- Prefix: pf_live_ or pf_test_
- Random: 24 character secure random
- Hash: SHA-256 stored server-side
```

---

## 4. Rate Limiting

- Per-key limits (requests/minute, requests/day)
- Global limits across all keys
- Adaptive thresholds based on usage patterns
- Burst allowances for legitimate traffic spikes
- Persistent rate limiting across browser tabs

---

## 5. Scope Hierarchy

```
*:*                 (full access)
├── brain:*         (all brain operations)
│   ├── brain:read
│   └── brain:write
├── system:*        (all system operations)
│   ├── system:read
│   └── system:admin
└── ...
```

---

## 6. Database Tables

| Table | Purpose |
|-------|---------|
| `access_api_keys` | API key storage (hashed) |
| `access_developers` | Developer profiles |
| `access_products` | Product catalog |
| `access_subscriptions` | Subscription management |
| `access_usage` | Per-request usage logging |
| `access_quotas` | Daily quota tracking |

---

© 2025–2026 PromptFluid®. All rights reserved.
