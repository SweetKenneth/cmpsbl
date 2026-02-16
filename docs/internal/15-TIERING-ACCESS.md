<div align="center">

# 🔐 Tiering & Access Control

### CONFIDENTIAL — Trade Secret

**v9.3.0 ARCHITECT Epoch**

</div>

---

## Tier Definitions

| Tier | Target Audience | Monthly Price | Key Limits |
|------|----------------|---------------|------------|
| **Free** | Developers, evaluation | $0 | 1,000 calls/day, 5 modules |
| **Pro** | Small teams, startups | $99/mo | 50,000 calls/day, 15 modules |
| **Enterprise** | Organizations | Custom | Unlimited calls, 18 modules |
| **CMPSBL** | Internal only | N/A | All 21 modules + crown jewels |

---

## Module Access Matrix

| Module | Free | Pro | Enterprise | CMPSBL |
|--------|------|-----|------------|--------|
| CORE | ✅ | ✅ | ✅ | ✅ |
| RIPPLE | ✅ | ✅ | ✅ | ✅ |
| ACCESS | ✅ | ✅ | ✅ | ✅ |
| BRAIN | ✅ | ✅ | ✅ | ✅ |
| DECODE | ✅ | ✅ | ✅ | ✅ |
| DREAM | ❌ | ✅ | ✅ | ✅ |
| DEFENSE | ❌ | ✅ | ✅ | ✅ |
| NEXUS | ❌ | ✅ | ✅ | ✅ |
| VISION | ❌ | ✅ | ✅ | ✅ |
| INTEGRATION | ❌ | ✅ | ✅ | ✅ |
| SYSTEM | ❌ | ✅ | ✅ | ✅ |
| MODERNIZER | ❌ | ❌ | ✅ | ✅ |
| INCLUSIVE | ❌ | ✅ | ✅ | ✅ |
| CORTEX | ❌ | ❌ | ✅ | ✅ |
| MEMORY | ❌ | ✅ | ✅ | ✅ |
| RELAY | ❌ | ❌ | ✅ | ✅ |
| AUDIT | ❌ | ❌ | ✅ | ✅ |
| IDENTITY | ❌ | ✅ | ✅ | ✅ |
| ECONOMY | ❌ | ✅ | ✅ | ✅ |
| SANDBOX | ❌ | ❌ | ✅ | ✅ |
| ENCODE | ❌ | ✅ | ✅ | ✅ |
| **Crown Jewels** | ❌ | ❌ | ❌ | ✅ |

---

## v10.5.2 Crown Jewel Registry (Complete)

### 🔴 CMPSBL-Only — Recursive Cognition & Meta-Intelligence

| Capability | Module | Description |
|-----------|--------|-------------|
| Meta-Reasoning | BRAIN | Recursive cognition — brain reasons about its own reasoning chains |
| Hypothesis Generation | BRAIN | Autonomous hypothesis creation from cross-module data patterns |
| Insight Synthesis | MEMORY | Cross-domain knowledge synthesis producing novel discoveries |
| Lucidity Control | DREAM | Dream depth/lucidity management for creative exploration |
| Cascade Failure Prevention | CORTEX | Predictive cascade failure prevention across dependency chains |
| Error Meta-Learning | ENCODE | Self-improving error pattern recognition |
| Auto-Tiering Meta-Tuning | BRAIN | Self-tuning memory tier watermarks |
| Shadow Loop Auto-Resolution | MODERNIZER | Autonomous stuck evolution cycle resolution |
| Circuit Predictive Management | CORE | Pre-emptive circuit health management |

### 🟡 Enterprise — Advanced Security & Operations

| Capability | Module | Description |
|-----------|--------|-------------|
| Zero-Day Detection | DEFENSE | Novel attack patterns beyond known signatures |
| Attack Correlation | DEFENSE | Cross-IP/session distributed campaign linking |
| Identity Graph | IDENTITY | Cross-session identity graph construction |
| Incident Prediction | SYSTEM | Predictive incident detection from health telemetry |
| Forensic Timeline | AUDIT | Automated forensic timeline for compliance investigations |
| Shadow Loop Detection | MODERNIZER | Stale evolution run detection |
| Circuit Recovery (Graduated) | CORE | Graduated health probe circuit recovery |
| Auto-Tiering Enforcement | BRAIN | Watermark-based memory tier enforcement |
| Error Prevention Engine | ENCODE | Proactive error fingerprint prevention |

### 🟢 Pro — Operational Intelligence

| Capability | Module | Description |
|-----------|--------|-------------|
| Knowledge Gap Detection | MEMORY | Stale/incomplete knowledge detection |
| Cost Anomaly Detection | ECONOMY | Cost spike prediction and anomaly alerting |
| User Journey Mapping | VISION | Complete user journey reconstruction |
| Provider Failure Prediction | NEXUS | Provider outage and degradation forecasting |
| Architecture Drift Detection | ENCODE | Codebase drift from intended design patterns |
| Error-Pattern Lookup | ENCODE | Error fingerprint database queries |

---

## Entitlement Enforcement

Enforcement happens at two layers:

### Layer 1: API Gateway (ACCESS Module)

```
Request → Extract API Key → Lookup Subscription → Check Module Access → Allow/Deny
```

### Layer 2: Runtime (Per-Module)

Each module checks entitlements before executing actions:

```typescript
function checkEntitlement(developerId: string, module: string, action: string): boolean {
  const sub = getSubscription(developerId);
  const tier = sub.tier;
  const allowed = TIER_MODULE_MAP[tier].includes(module);
  const actionAllowed = !RESTRICTED_ACTIONS[action] || tier >= RESTRICTED_ACTIONS[action].minTier;
  return allowed && actionAllowed;
}
```

---

## Crown Jewel Lockdown

Crown jewel meta-engines are protected by multiple layers:

1. **Tier check** — Only CMPSBL tier
2. **IP allowlist** — Only from known internal IPs
3. **MFA verification** — Requires additional authentication factor
4. **Audit logging** — Every access logged to encrypted, separate trail
5. **Rate limiting** — Maximum 10 invocations per hour

### Crown Jewel Auto-Redaction

If any API response or log entry contains references to crown jewel internals:

```
Output → Crown Jewel Scanner → If match → Redact → Log Incident → Return Sanitized
```

Patterns scanned:
- Crown jewel names
- Algorithm signatures
- Internal formula references
- Meta-engine invocation traces

---

## Quota System

| Quota Type | Free | Pro | Enterprise |
|------------|------|-----|------------|
| API calls/day | 1,000 | 50,000 | Unlimited |
| Token usage/day | 100K | 5M | Custom |
| Memory entries | 1,000 | 100,000 | 1,000,000 |
| Dream cycles/hour | 0 | 6 | 12 |
| Agencies | 0 | 3 | Unlimited |
| Agents per agency | 0 | 5 | 20 |

---

<div align="center">

*CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch — INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
