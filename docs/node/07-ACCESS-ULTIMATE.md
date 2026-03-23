# ACCESS — API Gateway & Developer Portal (Ultimate Form)

> **Node ID:** `access` · **Sector:** OCG · **Generation:** Ultimate · **Node #7 of 40**
> **Codename:** *Gatekeeper Prime* · **Classification:** FOUNDER EYES ONLY
> **Ultimate Form:** v9.0.0 "Gatekeeper Prime"

---

## Executive Summary

ACCESS v9.0.0 "Gatekeeper Prime" is the substrate's external boundary — every external request passes through ACCESS for authentication, authorization, rate limiting, cost metering, and abuse detection before reaching any internal node. It provides 10 Ultimate Form systems spanning cryptographic key management, adaptive rate limiting, hierarchical scope enforcement, real-time cost attribution, subscription lifecycle management, developer identity with reputation scoring, automated abuse detection, O(1) entitlement caching, per-developer circuit breakers, and unified telemetry.

---

## Architecture Overview

```
External API Request
        │
        ▼
[9] Gateway Circuit Breaker   ← Per-developer breaker + global degradation
        │
        ▼
[1] Cryptographic Key Vault   ← SHA-256 hash lookup + rotation + lineage
        │
        ▼
[8] Entitlement Cache         ← O(1) scope/tier/quota resolution
        │
        ▼
[3] Scope Enforcement Engine  ← Hierarchical scope tree + wildcard match
        │
        ▼
[2] Adaptive Rate Limiter     ← Sliding window + burst detection + EMA tuning
        │
        ▼
[7] Abuse Detection Engine    ← Z-score anomaly + scraping + stuffing detection
        │
        ▼
   ┌────┴────┐
   ▼         ▼
[4] Usage Metering      [5] Subscription Lifecycle
    Pipeline                 Manager
    │                        │
    └───────┬────────────────┘
            ▼
[6] Developer Identity Registry ← Reputation scoring + status lifecycle
            │
            ▼
[10] Access Telemetry Dashboard ← Unified health from all 10 systems
```

---

## System 1: Cryptographic Key Vault

- **HMAC-SHA256 key generation** with `pf_live_` / `pf_test_` prefixes
- **Zero-plaintext storage**: Only prefix (for identification) and hash (for verification) persisted
- **Key rotation with grace periods**: Old key valid during configurable grace window (default 5 min)
- **Revocation propagation**: Instant invalidation across all sessions
- **Key lineage tracking**: Parent-child chain showing rotation history
- **5,000-key capacity** with priority eviction (revoked first)

## System 2: Adaptive Rate Limiter

- **Sliding window counters**: 60 one-second slots (per-minute) + 24 one-hour slots (per-day)
- **Burst detection**: Configurable burst window (default 5s) with allowance threshold
- **Per-endpoint rate shaping**: Different limits per API endpoint
- **EMA-smoothed auto-tuning**: Automatically adjusts thresholds based on developer usage patterns
- **Three-tier decisions**: allow / throttle / deny with retry-after headers

## System 3: Scope Enforcement Engine

- **Hierarchical scope tree**: `*:*` → `brain:*` → `brain:read` with wildcard matching
- **21 default scopes** across 7 modules (brain, memory, decode, system, evolution, encode)
- **Scope intersection**: Compute effective permissions from multiple scope sets
- **Dynamic escalation requests**: Developers can request scope upgrades with governance approval
- **Scope audit trail**: Full history of grants, revocations, and escalation decisions (3,000-entry buffer)
- **Tier-gated scopes**: Scopes tagged by tier (free/starter/pro/enterprise)

## System 4: Usage Metering Pipeline

- **Per-call cost computation**: `(base_cost × complexity_multiplier) + (tokens × per_token_rate)` in millicents
- **8 default cost rules**: brain.query (10mc), brain.reasoning (50mc), encode.mutation (100mc), evolution.apply (200mc)
- **Real-time aggregation**: Hourly and daily buckets per key with module and product attribution
- **Overage detection**: 75% warn → 90% throttle → 100% block with configurable monthly limits
- **Cost attribution**: Per-product-code breakdown for chargeback and ROI analysis

## System 5: Subscription Lifecycle Manager

- **4 tiers**: Free (1K calls, 10/min) → Starter (50K, 60/min) → Pro (500K, 120/min) → Enterprise (unlimited, 300/min)
- **Tier transition engine**: Entitlement diff showing features added/removed on upgrade/downgrade
- **Grace period handling**: 7-day grace after period expiration before locking
- **Quota rollover**: 10% of unused quota carries to next period
- **Status lifecycle**: active → grace → past_due → expired / cancelled

## System 6: Developer Identity Registry

- **Status lifecycle**: pending → active → suspended → banned (terminal)
- **Reputation scoring**: Composite of usage consistency (30%), error rate (25%), payment history (25%), abuse score (20%)
- **EMA-smoothed metrics**: Error rate and consistency updated per request
- **Auto-suspension**: 3+ abuse flags trigger automatic suspension
- **5,000-developer capacity** with banned-first eviction

## System 7: Abuse Detection Engine

- **Credential stuffing detection**: High unique endpoint count in low request count
- **Scraping fingerprinting**: Uniform request interval detection (stdDev < 50ms = bot)
- **Z-score anomaly scoring**: Welford's online stats per key baseline
- **Severity tiers**: low → medium → high → critical
- **Action escalation**: flag → throttle → quarantine → ban
- **IMMUNITY integration**: Critical signals automatically escalated
- **2,000-signal rolling buffer** with per-key baselines

## System 8: Entitlement Resolution Cache

- **O(1) cache lookups** with configurable TTL (default 5 minutes)
- **Cache invalidation**: Automatic on tier change, scope update, key rotation
- **Developer-wide invalidation**: Clear all cached entries for a developer
- **Per-request snapshots**: Audit-grade entitlement records per API call
- **Batch warm-up API**: Pre-populate cache with known entitlements
- **2,000-entry capacity** with LFU eviction on overflow

## System 9: Gateway Circuit Breaker

- **Per-developer breakers**: Trips after 5 consecutive 5xx errors (configurable)
- **Three-state machine**: closed → open (after trips) → half_open (after recovery timeout) → closed (after probe successes)
- **Global degradation levels**: none → L1 (>5% open) → L2 (>15%) → L3 (>30%) → L4 (>50%)
- **Retry-after generation**: Jittered backoff (0-5s jitter) prevents thundering herd
- **Half-open probing**: 3 successful probes required to close breaker
- **Failure decay**: Successes gradually reduce failure count in closed state

## System 10: Access Telemetry Dashboard

- **Unified health composite**: Key vault integrity (15%) + rate limiter accuracy (20%) + scope enforcement (15%) + breaker stability (15%) + abuse precision (20%) + cache hit rate (15%)
- **Trend analysis**: Last 5 vs previous 5 snapshots for improving/stable/degrading
- **200-snapshot rolling buffer** with per-system stats
- **Cross-system aggregation**: Stats from all 9 subsystems in one snapshot

---

## Unified Health Assessment

```
overallHealth = (
  keyVaultIntegrity × 0.15 +      // Active keys / total keys
  rateLimiterAccuracy × 0.20 +     // 1 - denied rate
  scopeEnforcementRate × 0.15 +    // Grant rate
  breakerStability × 0.15 +        // 100 - open breakers × 15
  abuseDetectionPrecision × 0.20 + // 100 - critical × 20
  cacheHitRate × 0.15              // Cache hit / total lookups
)
```

---

## Integration Chain

```
DEFENSE   ──→ ACCESS (threat signals trigger key suspension)
IMMUNITY  ──→ ACCESS (anomaly alerts escalate to quarantine)
ECONOMY   ←── ACCESS (cost attribution feeds billing)
NERVE     ←── ACCESS (rate limit events → system signals)
AUDIT     ←── ACCESS (every key operation → immutable log)
GOVERNANCE ──→ ACCESS (tier/scope changes require approval)
BRAIN     ──→ ACCESS (API gateway for all external brain queries)
DECODE    ──→ ACCESS (chat requests validated before routing)
```

---

## Trade Secrets

### 1. Sliding Window + Token Bucket Hybrid
The rate limiter combines sliding window accuracy (60 one-second slots for true per-minute counting) with burst tolerance (configurable allowance window). This prevents both steady-state abuse and spike abuse.

### 2. Scope Bitmask Intersection
Pre-computed hierarchical scope matching uses wildcard prefix checking — `brain:*` matches any `brain:read`, `brain:write` via simple string prefix comparison. No bitmap allocation needed; O(scopes × granted) but with small constant factors.

### 3. Developer Reputation as Implicit Gate
The composite reputation score (0-100) silently gates automatic tier upgrades. Developers with reputation < 60 cannot auto-upgrade beyond "starter" — they need manual review. This prevents abuse accounts from self-promoting.

### 4. EMA-Smoothed Rate Auto-Tuning
Rate limits auto-adjust based on exponentially weighted moving average of actual usage. Consistently low-usage developers get tighter limits (reducing attack surface), while high-usage developers get expanded limits (reducing false denials).

### 5. Grace Period Key Rotation
During rotation, both old and new keys are valid simultaneously for the grace period (default 5 minutes). This ensures zero-downtime key rotation for deployed applications — the old key works until the new one is confirmed active.

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `key_rotation_overdue` | Key > 90 days old | Medium |
| `rate_limit_saturation` | EMA > 80% of limit | Medium |
| `scope_escalation_backlog` | > 5 pending escalations | Low |
| `cost_spike` | > 3x daily average | High |
| `abuse_storm` | ≥ 3 critical signals in 5 min | Critical |
| `cache_cold` | Hit rate < 30% | Medium |
| `gateway_degraded` | Degradation > L2 | High |

---

*CMPSBL® Substrate — ACCESS "Gatekeeper Prime" v9.0.0 · Founder Eyes Only*
