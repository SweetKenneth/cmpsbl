# ACCESS — API Gateway & Developer Portal

> **Node ID:** `access` · **Sector:** OCG · **Generation:** 1 · **Node #7 of 40**
> **Codename:** *Gatekeeper* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

ACCESS manages the external API gateway, developer API keys, subscription tiers, rate limiting, and usage tracking. It is the substrate's outward-facing boundary — every external request passes through ACCESS for authentication, authorization, rate checking, and metering before reaching any internal node.

---

## Architecture

### API Key System

ACCESS uses a hash-based API key system:

```
key_generation:
  raw_key = prefix + crypto.randomUUID()
  key_hash = SHA-256(raw_key)
  store(key_hash, developer_id, scopes, rate_limits)
  return raw_key to developer (shown once)

key_validation:
  incoming_key → SHA-256(incoming_key) → lookup key_hash
  verify: is_active, not expired, scopes match, rate limit not exceeded
```

Keys are **never stored in plaintext** — only the prefix (for identification) and the SHA-256 hash (for verification) are persisted.

### Rate Limiting

Dual-layer rate limiting:
- **Per-minute:** Burst protection (default: 60 req/min)
- **Per-day:** Budget protection (default: 10,000 req/day)

Rate limits are tracked in `access_quotas` with atomic increment operations to prevent race conditions.

### Usage Metering

Every API call is logged to `access_usage` with:
- Module and action invoked
- Tokens consumed
- Compute time (ms)
- Cost in millicents
- Product code for billing attribution

---

## Trade Secrets

### 1. Scoped Access Control

API keys carry an array of scopes (e.g., `['brain.query', 'memory.store', 'decode.chat']`). Each scope maps to specific module+action pairs. A key with `brain.query` cannot invoke `evolution.apply` — the scope check happens at the gateway level before any module code executes.

### 2. Cost Attribution Engine

Every API call has a computed cost in millicents based on: `(base_cost × complexity_multiplier) + (token_count × per_token_rate)`. This feeds into ECONOMY for chargeback and ROI analysis.

### 3. Subscription Tier Gating

Tiers (free, starter, pro, enterprise) are enforced at the gateway:

| Tier | Monthly Quota | Rate/Min | Features |
|---|---|---|---|
| Free | 1,000 calls | 10 | Basic modules only |
| Starter | 50,000 calls | 60 | + Advanced modules |
| Pro | 500,000 calls | 120 | + Priority routing |
| Enterprise | Unlimited | 300 | + Dedicated capacity |

---

## Database Tables

- `access_api_keys` — Key hashes, scopes, rate limits
- `access_developers` — Developer profiles and status
- `access_subscriptions` — Tier, billing, entitlements
- `access_quotas` — Daily usage counters
- `access_usage` — Per-call usage log
- `access_products` — Product catalog with monthly quotas

---

## CLM Learning Priorities

1. **Abuse Pattern Detection** — Learning API usage patterns that indicate credential stuffing or scraping
2. **Optimal Rate Limit Tuning** — Adjusting rate limits based on actual usage patterns per tier

---

*CMPSBL® Substrate — ACCESS Node Deep Dive · Founder Eyes Only*
