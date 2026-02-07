# CMPSBL OS Substrate — DEFENSE Module Deep Dive

**Version 6.3.0 | Scientific Publication**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-016 |
| **Module** | DEFENSE |
| **Layer** | Operational |
| **Version** | v6.3.0 |

---

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMPSBL OS SUBSTRATE                          │
├─────────────────────────────────────────────────────────────────┤
│  Created By:        Kenneth E Sweet Jr                          │
│  Organization:      PromptFluid®                                │
├─────────────────────────────────────────────────────────────────┤
│  For licensing or acquisition inquiries:                        │
│  Email: Dev@CMPSBL.com | Phone: (760) FLUID-AI           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Module Overview

DEFENSE is the security perimeter engine, providing real-time threat detection, behavioral analysis, and adaptive protection.

| Property | Value |
|----------|-------|
| **Name** | DEFENSE |
| **Layer** | Operational |
| **Boot Order** | 7 |
| **Dependencies** | CORE, RIPPLE |

---

## 2. Security Layers

### 2.1 Four-Layer Perimeter

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEFENSE PERIMETER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Layer 1: Rate Limiting                                        │
│   ├── Per-key limits                                            │
│   ├── Global limits                                             │
│   └── Adaptive thresholds                                       │
│                                                                 │
│   Layer 2: Fingerprinting                                       │
│   ├── User-Agent classification (25+ families)                  │
│   ├── Behavioral patterns                                       │
│   └── Anomaly detection                                         │
│                                                                 │
│   Layer 3: Threat Scoring                                       │
│   ├── IP reputation                                             │
│   ├── Request pattern analysis                                  │
│   └── Z-score anomaly detection                                 │
│                                                                 │
│   Layer 4: Decision                                             │
│   ├── ALLOW (score < 30)                                        │
│   ├── CHALLENGE (30 ≤ score < 70)                               │
│   └── BLOCK (score ≥ 70)                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. User-Agent Classification

DEFENSE classifies 25+ User-Agent families:

| Category | Examples |
|----------|----------|
| `browser` | Chrome, Firefox, Safari |
| `bot` | Googlebot, Bingbot |
| `cli` | curl, wget, httpie |
| `library` | axios, requests |
| `tor-exit` | Tor exit nodes |
| `headless` | Puppeteer, Playwright |
| `unknown` | Unclassified |

---

## 4. Rule DSL

### 4.1 Rule Structure

Rules are defined using a JSONB-based DSL:

```json
{
  "name": "block-tor-exits",
  "condition": {
    "ua_family": "tor-exit"
  },
  "action": "block",
  "priority": 100
}
```

### 4.2 Condition Operators

| Operator | Description |
|----------|-------------|
| `eq` | Equals |
| `ne` | Not equals |
| `in` | In list |
| `contains` | Contains substring |
| `matches` | Regex match |
| `gt`, `lt` | Greater/less than |

### 4.3 Actions

| Action | Behavior |
|--------|----------|
| `allow` | Permit request |
| `challenge` | Require verification |
| `block` | Reject request |
| `log` | Log only |

---

## 5. Reputation System

### 5.1 IP Reputation

Each IP builds a reputation score:

- **Good history:** Score increases
- **Bad behavior:** Score decreases
- **Decay:** Scores normalize over time

### 5.2 Fingerprint Tracking

Behavioral fingerprints track:
- Request patterns
- Path sensitivity
- Velocity metrics

---

## 6. Operating Modes

| Mode | Behavior |
|------|----------|
| `observe` | Log only, no enforcement |
| `enforce` | Full rule enforcement |
| `strict` | Enhanced sensitivity |

---

## 7. Key Operations

| Operation | Description |
|-----------|-------------|
| `defense.status` | Security status |
| `defense.scan` | Threat scan |
| `defense.rules` | List rules |
| `defense.block` | Add block rule |
| `defense.allow` | Add whitelist |
| `defense.reputation` | IP reputation |
| `defense.events` | Security events |

---

## 8. Performance Characteristics

| Metric | Value |
|--------|-------|
| Boot time | ~7ms |
| Classification | <5ms |
| Scoring | <10ms |
| Rule evaluation | <5ms |

---

*CMPSBL OS Substrate v6.0.0 — Human Compatibility Era*
*© 2025-2026 PromptFluid®. All rights reserved.*
