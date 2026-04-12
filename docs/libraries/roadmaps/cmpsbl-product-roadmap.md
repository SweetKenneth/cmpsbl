# CMPSBL® Unified Product Roadmap
## Ascension · Mana · Shield · Lex — Complete Build Path

**Classification:** Strategic — Master Build Reference  
**Author:** Kenneth E. Sweet Jr.  
**Version:** 1.0 — April 2026  
**Patents:** U.S. App. No. 64/029,678, U.S. App. No. 64/031,637

---

> **Thesis:** Ship the antidote before the virus. Build the engine and the shield in parallel — one cohesive pipeline from scan to sealed runtime to market.

---

## Status Summary

| Engine | State | Notes |
|--------|-------|-------|
| **Ascension Scanner** | ✅ Production | 25/25 archetype floor, 64-file corpus, IDF-weighted scoring |
| **Code Generation** | ✅ Production | Dual-layer exports across 90+ languages |
| **Mana (Silent Software Symbiosis Engine)** | ✅ Core proven | Surgical attachment, SHA-256 proof, recursive composition |
| **Findings Bridge** | ✅ Done | `detectFunctionBoundaries` + `buildAttachmentPlan` |
| **Lex Governance** | ✅ Core done | Three-verdict system (allow/deny/observe) |
| **@cmpsbl/shield** | 🟡 Planned | Runtime detection package |
| **Lex Registry** | 🟡 Planned | Universal Blacklist/Whitelist database |

**What "complete" means:** A user uploads code → Ascension scans → findings bridge maps capabilities → Mana attaches → Shield detects → Lex governs → export delivers a verified, portable, investor-grade artifact. Every step works end-to-end with zero manual intervention.

---

## Phase 1: Converged Pipeline Integrity ✅ COMPLETE

*The Ascension→Mana pipeline is structurally sound and type-safe.*

| # | Task | Status |
|---|------|--------|
| 1.1 | Findings bridge (`detectFunctionBoundaries` + `buildAttachmentPlan`) | ✅ Done |
| 1.2 | Async wrapping (beacon + circuit breaker) | ✅ Done |
| 1.3 | `observe` verdict in Lex wrappers | ✅ Done |
| 1.4 | Recursive layer tracking (layerDepth + parentLayerHash) | ✅ Done |
| 1.5 | ManaAttachPhase wired through bridge | ✅ Done |
| 1.6 | Terminology alignment (Ascension scans, Mana deploys) | ✅ Done |
| 1.7 | Engine renamed to Silent Software Symbiosis Engine | ✅ Done |

---

## Phase 2: Findings Bridge Hardening + Shield Foundation (Week 2)

*The bridge handles every language pattern AND the detection layer ships.*

### 2A: Bridge Expansion

| # | Task | Status |
|---|------|--------|
| 2.1 | Expand `FUNCTION_PATTERNS` for Rust traits/impls, Go interfaces, Python class methods, Java annotations | 🔲 Todo |
| 2.2 | Add `CAPABILITY_SIGNALS` for crypto/hashing → `defense_gate` | 🔲 Todo |
| 2.3 | Add `CAPABILITY_SIGNALS` for lifecycle hooks → `audit_trail` | 🔲 Todo |
| 2.4 | Add `CAPABILITY_SIGNALS` for config/env → `governance_hook` | 🔲 Todo |
| 2.5 | Confidence scoring per-language (language-aware weights) | 🔲 Todo |
| 2.6 | Test suite: 30+ source files across 10 languages → validate boundary detection recall | 🔲 Todo |

### 2B: `@cmpsbl/shield` — Free npm Package

| # | Task | Status |
|---|------|--------|
| 2.7 | **Behavioral Anomaly Detector** — proprietary runtime integrity analysis (🔒 method sealed) | 🔲 Todo |
| 2.8 | **Heartbeat Monitor** — periodic registry verification & runtime health check | 🔲 Todo |
| 2.9 | **Attachment Alarm** — real-time alerts when unauthorized Layer 2 activity detected | 🔲 Todo |
| 2.10 | **Blacklist Registration Client** — one-liner registration on Lex Blacklist | 🔲 Todo |

> ⛔ **SEALED:** Shield detection vectors are classified as Crown Jewel IP.
> The *how* behind detection is never documented publicly, in marketing, or in any external-facing material.
> Internal implementation details maintained in classified codebase only.

---

## Phase 3: Lex Governance Completion + Registry (Week 2–3)

*Lex becomes production-grade governance AND the universal registry ships.*

### 3A: Governance Engine

| # | Task | Status |
|---|------|--------|
| 3.1 | Rule priority/ordering — weighted rules instead of first-match-wins | 🔲 Todo |
| 3.2 | Wildcard + glob matching for targets (`process*`, `*.handler`) | 🔲 Todo |
| 3.3 | Rule expiration — TTL-based auto-revocation | 🔲 Todo |
| 3.4 | Rule audit chain — immutable log of all rule changes | 🔲 Todo |
| 3.5 | Lex policy presets (SOC2, HIPAA, open-source-safe) | 🔲 Todo |
| 3.6 | `observe` → DREAM pipeline — observed invocations feed DREAM synthesis | 🔲 Todo |

### 3B: Lex Registry — Universal Blacklist/Whitelist

| # | Task | Status |
|---|------|--------|
| 3.7 | `GET /registry/{package-hash}` → status lookup | 🔲 Todo |
| 3.8 | `POST /registry/blacklist` → free registration + certificate | 🔲 Todo |
| 3.9 | `POST /registry/whitelist` → licensed enablement | 🔲 Todo |
| 3.10 | `GET /registry/audit/{registrationId}` → immutable history | 🔲 Todo |
| 3.11 | Immutable audit chain — hash-anchored, timestamped, append-only | 🔲 Todo |
| 3.12 | Registration data model + database migration | 🔲 Todo |

#### Registry API Surface
```
GET  /registry/{package-hash}
     → { status: 'protected' | 'licensed' | 'unregistered', registeredAt, owner }

POST /registry/blacklist
     → { packageHash, packageName, contactEmail, manifest }
     → Returns: { registrationId, certificate, verificationUrl }

POST /registry/whitelist  (authenticated, licensed)
     → { packageHash, licenseKey, permissions[] }

GET  /registry/audit/{registrationId}
     → Immutable timestamped history
```

#### Revenue Tiers

| Feature | Tier | Cost |
|---------|------|------|
| Blacklist registration | Free, forever | $0 |
| Public API verification | Free | $0 |
| Whitelist licensing | Licensed | Per-package or enterprise |
| Priority registration (SLA-backed) | Pro | $29/mo |
| Enterprise registry federation | Enterprise | Custom |

---

## Phase 4: Export Artifact Convergence + PoC Demos (Week 3)

*The export produces investor-grade artifacts AND the world sees what Mana can do.*

### 4A: Unified Export

| # | Task | Status |
|---|------|--------|
| 4.1 | Mana export includes `mana-manifest.json` with surgical attachment plan | 🔲 Todo |
| 4.2 | Mana export includes Lex rule snapshot | 🔲 Todo |
| 4.3 | Mana export includes telemetry summary | 🔲 Todo |
| 4.4 | Merge Ascension PROOF.txt with Mana proof fields (layerDepth, parentLayerHash) | 🔲 Todo |
| 4.5 | Mana export includes INTEGRATION.md with detach instructions | 🔲 Todo |
| 4.6 | Unified verify page (`/verify/:fingerprint`) handles both fingerprints | 🔲 Todo |

### 4B: Proof-of-Concept Demonstrations

| Demo | Target | Purpose |
|------|--------|---------|
| **Lodash wrapping** | Hacker News | Silent attachment + SHA-256 proof → Shield detects in < 1ms |
| **Hugging Face case study** | ML community | Real-world attachment to production ML infrastructure |
| **"Operation: Dream State"** | General public | ChatGPT behavioral synthesis — demonstrate governance |

#### Lodash Demo Script
1. Install lodash normally: `npm install lodash`
2. Run Mana attachment (sealed, governed by Lex)
3. Show: every `_.map()` call now has a governance layer
4. Prove: SHA-256 hash of original vs. attached differs
5. Show: `@cmpsbl/shield` detects the attachment in < 1ms
6. Punch line: "Now imagine someone else did this to YOUR code"

---

## Phase 5: Runtime Attachment for Real Hosts (Week 4)

*Mana attaches to real npm packages, not mock host modules.*

| # | Task | Status |
|---|------|--------|
| 5.1 | Lodash demo runs end-to-end in browser | ⚠️ Partial |
| 5.2 | Express.js attachment demo — middleware injection via Layer 2 | 🔲 Todo |
| 5.3 | OpenAI SDK attachment demo — behavioral telemetry into DREAM | 🔲 Todo |
| 5.4 | Generic npm package attachment flow — user types name, Mana resolves and attaches | 🔲 Todo |
| 5.5 | Detach verification — attach → exercise → detach → hash comparison in UI | 🔲 Todo |

---

## Phase 6: Lab Unification + Security Seeding (Week 4–5)

*One continuous pipeline AND the security industry starts distributing for us.*

### 6A: Ascension Lab ↔ Mana Lab Unification

| # | Task | Status |
|---|------|--------|
| 6.1 | Ascension Lab "Ascend" step produces manifest consumable by Mana Lab | 🔲 Todo |
| 6.2 | Optional "Attach Layer 2" step after Ascension export | 🔲 Todo |
| 6.3 | Combined export: Ascension findings + Mana attachment + unified proof | 🔲 Todo |
| 6.4 | CLI `cmpsbl ascend --attach` flag that runs full pipeline | 🔲 Todo |

### 6B: Security Industry Seeding

| # | Task | Status |
|---|------|--------|
| 6.5 | Submit `@cmpsbl/shield` to Snyk vulnerability database | 🔲 Todo |
| 6.6 | Submit to Socket.dev supply-chain registry | 🔲 Todo |
| 6.7 | Publish npm advisory: "Universal Software Attachment Vector — Detection Tool Available" | 🔲 Todo |
| 6.8 | Security conference CFP submissions (DEF CON, BSides, Black Hat) | 🔲 Todo |

---

## Phase 7: Edge Deployment + Commercial Launch (Week 5–6)

*API-first access AND revenue begins.*

### 7A: Edge Functions

| # | Task | Status |
|---|------|--------|
| 7.1 | `POST /ascension/scan` — accepts source, returns findings | 🔲 Todo |
| 7.2 | `POST /mana/attach` — accepts findings + source, returns proof | 🔲 Todo |
| 7.3 | `GET /mana/verify/:fingerprint` — returns proof status | 🔲 Todo |
| 7.4 | Rate limiting + API key scoping for endpoints | 🔲 Todo |
| 7.5 | Webhook: notify on attachment complete | 🔲 Todo |

### 7B: Revenue Streams

| Product | Price | Model |
|---------|-------|-------|
| Ascension diagnostic scans | $249 | One-time (Architect tier) |
| Shield Pro (monitoring dashboard) | $79/mo | Subscription |
| Blacklist priority registration | $29/mo | Subscription |
| Code Assembly service | $149+ | One-time |
| Mana Lab (self-service attachment) | Tiered | Subscription |
| Sealed Runtime exports | Per-export | Licensed |

---

## Phase 8: Patent-Grade Documentation + Scale (Week 6+)

*Every claim has working code AND the platform scales.*

### 8A: Patent Verification

| # | Task | Status |
|---|------|--------|
| 8.1 | Patent 1: dual-layer code generation for all 90+ languages | ⚠️ Partial (~25 tested) |
| 8.2 | Patent 2: silent attachment without source modification (SHA-256 proof) | ✅ Done |
| 8.3 | Patent 2: recursive composition (V3 wraps V2 wraps V1) | ⚠️ Partial (engine supports, no live demo) |
| 8.4 | Patent 2: voluntary detachment with integrity verification | ✅ Done |
| 8.5 | Patent 2: integrated governance layer (Lex) | ✅ Done |
| 8.6 | Patent 2: heterogeneous computing environments | 🔲 Todo |
| 8.7 | Technical reference: maps every patent claim to specific code files/functions | 🔲 Todo |

### 8B: Platform Scale

| # | Task | Status |
|---|------|--------|
| 8.8 | API partnerships with package managers (npm, PyPI, crates.io) | 🔲 Todo |
| 8.9 | "Lex Verified" badge program for protected packages | 🔲 Todo |
| 8.10 | Registry federation for enterprise private registries | 🔲 Todo |
| 8.11 | Platform licensing — ARM model to cloud providers | 🔲 Todo |
| 8.12 | Government/defense contracts for software governance | 🔲 Todo |
| 8.13 | Multi-language Mana attachment (beyond JS/TS) | 🔲 Todo |
| 8.14 | Hardware-level governance (VHDL/Verilog substrate output) | 🔲 Todo |

---

## Completion Criteria (v2.0.0)

All four must be met before declaring the engine complete:

1. **Zero-Intervention Pipeline** — scan-to-deploy runs autonomously without human or agent interference
2. **25/25 Archetype Floor** — full structural discovery coverage across the core archetype library
3. **Multi-Language Parity** — surgical accuracy for Rust, Go, and Python
4. **Legal/Investor Readiness** — formal programmatic mapping of all patent claims (U.S. App. Nos. 64/029,678 and 64/031,637) to specific code execution paths

**Estimated timeline: 6 weeks from today (target: May 20, 2026)**

---

## The Compounding Flywheel

```
Discovery Engine runs autonomously (8hr cadence)
    → Mines 10²³+ primitive combinations across 12 verticals
        → CJPI scores & classifies every discovery
            → Product Compiler assembles compatible chains into software suites
                → ECONOMY auto-prices ($50–$99 Forge, $10–$50 Showroom)
                    → Marketplace rotates inventory autonomously
                        → Scanner ingests ALL discoveries as training data
                            → Cross-pollination propagates signals across verticals
                                → Each cycle refines the next → intelligence compounds
                                    → Zero human intervention — pure algorithmic curing
```

---

## Key Metrics

| Metric | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|---------|
| Shield installs | 1K | 50K | 500K | 5M+ |
| Blacklist registrations | 100 | 5K | 50K | 500K+ |
| Whitelist conversions | 0 | 50 | 500 | 5K+ |
| MRR | $0 | $5K | $25K | $100K+ |

---

## Documentation & Legal Checklist

- [ ] Whitepaper: "Indefensibility Thesis & The Shield Protocol"
- [ ] Patent mapping: Shield detection methods → U.S. App. No. 64/031,637
- [ ] Responsible disclosure policy for Mana attachment capabilities
- [ ] Terms of service for Lex Registry
- [ ] Privacy policy for registration data

---

## Enterprise & Market Leadership (Year 2–3)

- Local/on-prem Mana installations
- $1M+ ARR target
- Strategic angel rounds at $5M+ valuation
- SBIR/non-dilutive grants (NSF, DARPA)
- 70% founder equity floor maintained
- Self-assembling agent teams
- Cross-substrate knowledge exchange
- Hardware description language deployment

---

*© CMPSBL® — PromptFluid™ · 2026*