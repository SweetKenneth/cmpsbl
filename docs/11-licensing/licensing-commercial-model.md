# Licensing & Commercial Model

## 1. Purpose

This document defines the licensing tiers, feature boundaries, usage limits, and enforcement model for the CMPSBL substrate.

## 2. Tier Definitions

| Tier | Target Audience | Pricing Model |
|------|----------------|--------------|
| Free | Evaluators, individual developers | No cost |
| Pro | Small teams, active developers | Monthly subscription |
| Enterprise | Organizations, regulated industries | Annual contract |
| Self-Hosted | Operators requiring full control | License fee + BYOK |

## 3. Feature Boundaries

| Feature | Free | Pro | Enterprise | Self-Hosted |
|---------|------|-----|-----------|------------|
| DECODE | Basic | Full | Full | Full |
| ENCODE | Basic | Full | Full | Full |
| NEXUS routing | Single provider | Multi-provider | Multi-provider + custom | Full |
| MEMORY | Session only | Persistent (warm) | Persistent (hot+warm+cold) | Full |
| BRAIN | — | Basic reasoning | Full reasoning | Full |
| DREAM | — | — | Full | Full |
| CORTEX | — | Basic pipelines | Full orchestration | Full |
| VISION | — | Basic | Full | Full |
| ECONOMY | Usage view | Full analytics | Full + export | Full |
| SANDBOX | — | Limited | Full | Full |
| INCLUSIVE | Scan only | Scan + report | Full compliance | Full |
| INTEGRATION | — | Standard | Custom | Full |
| Agency framework | — | 1 agency | Unlimited | Unlimited |
| Artifact Packs | — | Select packs | All packs | All packs |
| Admin dashboard | — | — | Full | Full |
| GOVERNANCE controls | — | — | Full | Full |
| Crown Jewel capabilities | — | — | — | Admin only |

## 4. Usage Limits

| Resource | Free | Pro | Enterprise |
|----------|------|-----|-----------|
| API calls/day | 100 | 5,000 | 50,000 |
| Tokens/day | 10,000 | 500,000 | 5,000,000 |
| Storage | 100 MB | 5 GB | 50 GB |
| Agencies | 0 | 1 | Unlimited |
| Team members | 1 | 5 | Unlimited |
| Concurrent sessions | 1 | 10 | 100 |

## 5. SLA Differences

| Metric | Free | Pro | Enterprise |
|--------|------|-----|-----------|
| Availability | Best effort | 99.5% | 99.9% |
| Support response | Community | 24 hours | 4 hours |
| Incident escalation | — | Email | Dedicated channel |
| Data backup | — | Daily | Continuous + export |

## 6. Upgrade Path

```
Free → Pro: Self-service upgrade via billing portal
Pro → Enterprise: Contact sales for annual contract
Any → Self-Hosted: License agreement + infrastructure setup
```

- Upgrades take effect immediately.
- Downgrades take effect at end of current billing period.
- Data is retained for 30 days after downgrade.
- Self-hosted licenses include migration support.

## 7. Enforcement Model

| Limit | Enforcement | User Experience |
|-------|------------|----------------|
| API rate limit | HTTP 429 with retry-after | Clear error message with upgrade prompt |
| Token quota | Request rejected with quota status | Dashboard warning at 80%, block at 100% |
| Storage limit | Write rejected | Dashboard warning at 90%, block at 100% |
| Feature gate | HTTP 403 with tier info | Feature shown as locked with upgrade path |
| Concurrent sessions | Oldest session terminated | Notification to user |

- No silent degradation: users always receive clear feedback when limits are reached.
- Grace period: 10% buffer on quotas for burst usage (does not roll over).
- Hard limits: Crown Jewel capabilities and admin functions have no grace period.

## 8. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Verified licensing model for v13.1.0 |
| 2026-03-01 | System | Initial canonical licensing model |

---

© 2025–2026 PromptFluid®. All rights reserved.
