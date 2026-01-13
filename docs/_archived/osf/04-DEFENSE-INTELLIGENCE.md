# promptfluid® defense intelligence

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-DEFENSE-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Type | Cognitive Orchestration Substrate |
| Citation | Sweet Jr, K.E. (2026). promptfluid defense intelligence. doi:10.5281/zenodo.XXXXXXX |

---

## 1. Introduction

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

defense is the security intelligence layer of promptfluid, providing behavioral bot detection, device fingerprinting, threat intelligence, and adaptive rule generation. Unlike signature-based detection systems, defense uses AI-powered behavioral analysis to identify threats in real-time.

### 1.1 Design Philosophy

Traditional bot detection relies on known signatures and patterns. defense takes a fundamentally different approach:

1. **Behavioral Analysis:** Detect anomalies in behavior, not known patterns
2. **Adaptive Learning:** Rules evolve based on observed attack patterns
3. **Zero-Day Protection:** Detect novel threats without prior signatures
4. **Low False Positives:** AI reduces false positive rate through context analysis
5. **Privacy-Preserving:** Minimal data collection, maximum protection

### 1.2 Market Context

- **Global Bot Management Market:** $3.5B (2025), 15% CAGR
- **Annual ADA Lawsuits:** 4,500+ targeting inaccessible websites
- **Bot Traffic:** 40-50% of all internet traffic is non-human

---

## 2. Architecture

### 2.1 Defense Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEFENSE PIPELINE                                │
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │ Request  │ -> │ Feature  │ -> │  Risk    │ -> │    Decision      │  │
│  │ Capture  │    │ Extract  │    │ Scoring  │    │ (Allow/Challenge)│  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────────────┘  │
│       │               │               │                   │             │
│       ▼               ▼               ▼                   ▼             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │  Headers │    │ Device   │    │Behavioral│    │     Actions      │  │
│  │    IP    │    │Fingerprnt│    │ Analysis │    │  ┌───────────┐   │  │
│  │    UA    │    │ JS Sigs  │    │ ML Model │    │  │  ALLOW    │   │  │
│  │ Cookies  │    │ TLS Data │    │          │    │  ├───────────┤   │  │
│  └──────────┘    └──────────┘    └──────────┘    │  │ CHALLENGE │   │  │
│                                                   │  ├───────────┤   │  │
│                                                   │  │  BLOCK    │   │  │
│                                                   │  └───────────┘   │  │
│                                                   └──────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     FEEDBACK LOOP TO BRAIN                        │   │
│  │  Event Logging → Pattern Detection → Rule Evolution → Adaptation  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Extraction

### 3.1 Device Fingerprinting

Multi-factor device identification:

```typescript
interface DeviceFingerprint {
  // Browser signals
  canvas_hash: string;           // Canvas rendering signature
  webgl_hash: string;            // WebGL renderer fingerprint
  audio_hash: string;            // AudioContext fingerprint
  font_list_hash: string;        // Installed fonts signature
  
  // Hardware signals
  screen_resolution: string;     // Display dimensions
  color_depth: number;           // Color bit depth
  device_memory: number;         // RAM (approximate)
  hardware_concurrency: number;  // CPU cores
  
  // Derived
  composite_hash: string;        // Combined fingerprint
  entropy_score: number;         // Uniqueness measure
}
```

### 3.2 Behavioral Signals

| Signal | Description | Bot Indicator |
|--------|-------------|---------------|
| Mouse movement | Path, velocity, jitter | Linear paths, no jitter |
| Keystroke dynamics | Timing, pattern | Uniform timing |
| Scroll behavior | Speed, pattern | Mechanical scrolling |
| Time on page | Engagement duration | Too fast/too slow |
| Navigation pattern | Page sequence | Unnatural sequence |
| Form interaction | Field focus, typing | No hesitation |

---

## 4. Risk Scoring

### 4.1 Scoring Model

Risk scores range from 0 (definitely human) to 100 (definitely bot):

```typescript
interface RiskScore {
  total: number;              // 0-100 composite score
  components: {
    header_score: number;     // 0-25 based on header analysis
    device_score: number;     // 0-25 based on fingerprint
    behavior_score: number;   // 0-25 based on behavioral signals
    reputation_score: number; // 0-25 based on IP/history
  };
  confidence: number;         // Model confidence (0-1)
  factors: string[];          // Contributing factors
}
```

### 4.2 Decision Thresholds

| Score Range | Decision | Action |
|-------------|----------|--------|
| 0-30 | Allow | Pass through, minimal logging |
| 31-60 | Monitor | Allow with enhanced logging |
| 61-80 | Challenge | Present CAPTCHA or puzzle |
| 81-100 | Block | Reject request, block IP |

---

## 5. IP Reputation System

### 5.1 Reputation Schema

```sql
CREATE TABLE ip_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL UNIQUE,
  score INTEGER DEFAULT 50,
  total_requests INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Score Evolution

```typescript
// Positive events (confirmed human)
// - Successful CAPTCHA solve: +5
// - Normal browsing pattern: +1
// - Successful purchase: +10

// Negative events (bot indicators)
// - Failed CAPTCHA: -10
// - Rate limit hit: -5
// - Blocked request: -15
// - Attack pattern: -25
```

---

## 6. Adaptive Rule Engine

### 6.1 Rule Types

| Type | Description | Example |
|------|-------------|---------|
| Header | Match header patterns | UA contains "bot" |
| Rate | Request frequency limits | >100 req/min |
| Geo | Geographic restrictions | Block TOR exit nodes |
| Behavioral | Behavioral anomalies | Linear mouse paths |
| Composite | Combined conditions | Rate + Geo + Header |

### 6.2 Brain-Powered Rule Evolution

defense learns from attack patterns and generates new rules automatically with confidence thresholds for auto-approval.

---

## 7. Challenge Systems

### 7.1 Challenge Types

| Challenge | Difficulty | Bot Resistance | User Friction |
|-----------|------------|----------------|---------------|
| Invisible reCAPTCHA | Low | Medium | Very Low |
| Image Selection | Medium | High | Medium |
| Proof of Work | High | Very High | Low |
| Custom Puzzle | Variable | High | Medium |

---

## 8. WordPress Integration

### 8.1 Plugin Architecture

defense powers three WordPress plugins:

| Plugin | Focus | Features |
|--------|-------|----------|
| Reflex Bot Sniper (Full) | Complete suite | WAF, malware, behavioral |
| Bot Sniper Standalone | Core detection | Behavioral only |
| Clarity | Accessibility | WCAG scanning |

---

## 9. Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `pf-bot-detection` | Main analysis endpoint | API call |
| `pf-behavioral-analysis` | Behavioral scoring | Detection request |
| `pf-defense-event` | Event logging | All decisions |
| `pf-defense-stats` | Analytics aggregation | Dashboard |
| `pf-defense-rules` | Rule management | Admin |
| `pf-defense-ip-reputation` | IP scoring | Detection |

---

## Contact & Licensing

**Founder:** Kenneth E Sweet Jr  
**Email:** promptfluid@gmail.com  
**Phone:** (760) FLUID-AI  
**Website:** https://promptfluid.com

For licensing inquiries regarding the promptfluid® substrate, contact promptfluid@gmail.com.

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
