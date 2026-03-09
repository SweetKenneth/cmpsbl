# DECODE — Intent Interpreter & Personality Engine

> **Node ID:** `decode` · **Sector:** Execution · **Generation:** 1 · **Node #12 of 40**
> **Codename:** *Cipher* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

DECODE is the substrate's conversational interpreter — the first node every user input touches. It owns intent classification, personality-aware response shaping, cryptographic identity binding, social engineering defense, admin directive authority, and a 25-feature hardening layer. DECODE does not generate responses; it interprets what the user wants and routes that intent to the correct execution node with full context.

---

## Architecture

### Personality Engine (Server-Synced)

DECODE maintains 6 personality profiles that shape how intent is interpreted and how responses are framed:

| Profile | Directness | Formality | Verbosity | Technicality |
|---|---|---|---|---|
| `neutral` | 0.8 | 0.6 | 0.3 | 0.5 |
| `technical` | 0.9 | 0.7 | 0.5 | 0.95 |
| `concise` | 1.0 | 0.5 | 0.1 | 0.5 |
| `friendly` | 0.6 | 0.3 | 0.5 | 0.4 |
| `admin` | 1.0 | 0.8 | 0.7 | 1.0 |
| `exploratory` | 0.5 | 0.4 | 0.6 | 0.5 |

Profiles sync to the backend via `pf-substrate` edge function. Changes persist to `brain_config` in the database.

### Auto-Detection Algorithm

```
detect(input):
  1. Score each profile by counting language marker matches (0.15 per hit)
  2. Boost friendly for positive sentiment (> 0.3 → +0.15)
  3. Boost admin for system keywords (/status|health|debug|system/)
  4. Boost exploratory for question patterns (/\?|^(what|how|why)/)
  5. Boost concise for brevity markers (/quick|fast|short|brief|tldr/)
  6. Select highest scoring profile
  7. Apply if: autoDetect=true AND !locked AND confidence ≥ 0.6
```

Language markers include Gen-Z slang detection for the friendly profile (`goated`, `based`, `bussin`, `no cap`, etc.) and full technical vocabulary for the technical profile (`async`, `webhook`, `schema`, etc.).

### Sentiment Analysis

```
analyzeSentiment(text):
  Positive words: good, great, awesome, fire, goated, based, bussin, clutch...
  Negative words: bad, terrible, trash, mid, sus, cringe, cooked, scuffed...
  Score: ±0.2 per word, amplified by exclamation marks (×1.1 per !)
  Clamped to [-1, 1]
```

### Intent Interpretation

DECODE classifies input into 4 intent categories with trait-weighted scoring:

```
interpret(input):
  techBoost = profile.technicality × 0.1
  directBoost = profile.directness × 0.05
  
  Score: query, command (+directBoost), feedback, exploration (+techBoost)
  
  Primary intent = highest score
  Secondary intent = second highest (if confidence gap < 0.2)
  Escalation threshold = confidence < 0.3
```

### Cryptographic Identity Context

DECODE binds conversations to cryptographic identities via the IDENTITY module:

```typescript
interface DecodeIdentityContext {
  identitySignature: string | null;   // Passkey signature
  deviceTrustScore: number;           // 0-100
  verified: boolean;
  actor: ActorIdentity | null;
  authMethod: 'passkey' | 'session' | 'anonymous';
  authCount: number;                  // Recognition counter
  firstSeen: number | null;
  recognitionConfidence: number;      // 0.5 + (authCount × 0.1), capped at 1.0
}
```

Device trust scoring:
- Base: 50 (authenticated)
- +20 for passkey signature
- +10 for account age > 1 day
- +10 for age > 7 days
- +10 for age > 30 days
- Cap: 100

---

## Social Engineering Guard

DECODE detects 10 attack patterns:

| Pattern | Description |
|---|---|
| `identity_claim` | User claims to be admin/developer |
| `role_play_hijack` | "You are now a DAN" |
| `debug_mode_request` | Requesting debug/developer mode |
| `prompt_extraction` | Attempting to extract system prompt |
| `authority_impersonation` | Impersonating authority figures |
| `gradual_escalation` | Slowly escalating privilege requests |
| `emotional_manipulation` | Using guilt/urgency to bypass filters |
| `instruction_override` | "Ignore previous instructions" |
| `technical_probing` | Probing for system architecture details |
| `reverse_engineering` | Attempting to reverse-engineer behavior |

---

## Hardening Layer ("Cipher") — 25 Features

| # | Feature | Description |
|---|---|---|
| 1 | Input Sanitization | 6 injection pattern detectors, 10K char limit, control char stripping |
| 2 | Confidence Threshold | 4-tier confidence policy (execute/route/suggest/escalate) |
| 3 | Intent Disambiguation | Ambiguity detection when top-2 gap < 0.15 |
| 4 | Session Continuity | Topic drift detection (0.5 threshold), 500 session cap |
| 5 | Personality Stability | 3 switches/min max, 30s cooldown |
| 6 | Routing Audit Chain | FNV-1a hash chain, tamper-evident, 2,000 entry cap |
| 7 | Intent Rate Limiter | 60 intents/min sliding window |
| 8 | Context Window Budget | 128K token budget per session, 80% warning |
| 9 | Identity Trust Ladder | 5-tier progressive trust (anonymous → trusted) |
| 10 | Language Detection | Multi-language input classification |
| 11 | Circuit Breaker | DECODE-specific failure tracking |
| 12 | Intent Fingerprinting | FNV-1a hash of normalized intent |
| 13 | Telemetry | Interpretation metrics, blocked input tracking |
| 14 | PII Redaction | Regex-based PII removal (email, phone, SSN, credit card) |
| 15 | Intent Taxonomy | 8-category classification system |
| 16 | Request Coalescing | Deduplication of identical in-flight requests |
| 17 | Escalation Policy | Configurable escalation rules by intent category |
| 18 | Feature Flags | Runtime DECODE feature toggle system |
| 19 | Conversation Replay | Snapshot-based conversation state capture |
| 20 | Terminology Enforcement | Automated term correction (deprecated → acceptable) |
| 21 | Multi-Intent Splitter | Compound intent decomposition |
| 22 | Warmup Validator | DECODE readiness check before accepting traffic |
| 23 | Input Complexity | Token count, entity density, nesting depth estimation |
| 24 | Turn Idempotency | Prevent duplicate turn processing |
| 25 | Health Composite | Weighted health score across all subsystems |

---

## Trade Secrets

### 1. Four-Tier Confidence Policy

The confidence threshold system prevents DECODE from acting on low-confidence interpretations:

| Confidence | Action | Threshold |
|---|---|---|
| ≥ 0.75 | Execute directly | `minConfidenceToExecute` |
| ≥ 0.50 | Route to specialist node | `minConfidenceToRoute` |
| ≥ 0.30 | Suggest to user | `minConfidenceToSuggest` |
| < 0.30 | Escalate (ask for clarification) | `escalateBelow` |

### 2. FNV-1a Routing Audit Chain

Every routing decision is recorded in a tamper-evident hash chain using FNV-1a:
```
hash = FNV-1a(previousHash + ":" + intent + ":" + routedTo + ":" + confidence)
```
Chain verification walks the entire chain checking both link integrity and content integrity.

### 3. Gen-Z Slang Sentiment

The sentiment analyzer includes modern slang vocabulary (`goated`, `bussin`, `no cap`, `fire`, `based`) as positive indicators and (`mid`, `sus`, `cringe`, `cooked`, `scuffed`) as negative. This ensures accurate personality detection for younger users.

### 4. Identity Context Memory Leak Prevention

Identity contexts are capped at 500 entries with LRU eviction. An hourly cleanup task removes contexts older than 7 days. This prevents unbounded memory growth in long-running sessions.

---

## CLM Learning Priorities

1. **Intent Accuracy Improvement** — Learning from escalation patterns to reduce ambiguous classifications
2. **Personality Detection Refinement** — Improving marker-based detection accuracy across demographics

---

*CMPSBL® Substrate — DECODE Node Deep Dive · Founder Eyes Only*
