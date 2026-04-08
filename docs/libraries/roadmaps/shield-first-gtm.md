# Shield-First GTM Roadmap — Build Reference

**Classification:** Strategic — Build Reference  
**Author:** Kenneth E. Sweet Jr.  
**Version:** 1.0 — April 2026  
**Patents:** U.S. App. No. 64/029,678, U.S. App. No. 64/031,637

---

> **Core Thesis:** Ship the antidote before the virus. The shield IS the distribution engine.

---

## Table of Contents

1. [Phase 0 — "The Shield"](#phase-0--the-shield)
2. [Phase 1 — "The Fear"](#phase-1--the-fear)
3. [Phase 2 — "The Conversion"](#phase-2--the-conversion)
4. [Phase 3 — "The Standard"](#phase-3--the-standard)
5. [Phase 4 — Enterprise & Market Leadership](#phase-4--enterprise--market-leadership)
6. [Technical Specifications](#technical-specifications)
7. [The Flywheel](#the-flywheel)
8. [Key Metrics](#key-metrics)
9. [Engine Completion Criteria](#engine-completion-criteria)

---

## Phase 0 — "The Shield" (Pre-Launch — Now → Month 2)

*Build the defense before announcing the weapon*

### 0A: `@cmpsbl/shield` — Free npm Package

A runtime detection library. Zero dependencies. Works in Node.js and browsers.

| Component | Description | Build Priority |
|-----------|-------------|----------------|
| **Proxy Trap Detector** | Detects when function exports have been wrapped by foreign Proxies | 🔴 Critical |
| **Lex Heartbeat Monitor** | Continuous runtime check for unauthorized governance layers | 🔴 Critical |
| **Attachment Alarm** | Real-time alerts when Layer 2 activity is detected on protected code | 🟡 High |
| **Blacklist Registration Client** | One-liner to register software on the Lex Blacklist | 🟡 High |

#### Technical Implementation Notes
```typescript
// Core detection: check if exports have been Proxy-wrapped
function detectProxyWrap(target: unknown): boolean {
  // Proxy.revocable leaves detectable traces
  // Object.getOwnPropertyDescriptor behavior differs on Proxied objects
  // typeof handler traps leak through specific edge cases
}

// Lex Heartbeat: periodic registry verification
function startHeartbeat(packageHash: string, intervalMs = 30000): void {
  // GET /registry/{package-hash} → { status, lastChecked, alerts }
  // If status !== 'protected' → fire attachment alarm
}
```

### 0B: Lex Registry — The Universal Blacklist/Whitelist

| Feature | Tier | Cost |
|---------|------|------|
| **Blacklist registration** | Free, forever | $0 |
| **Public API verification** | Free | $0 |
| **Whitelist licensing** | Licensed | Per-package or enterprise |
| **Priority registration (SLA-backed)** | Pro | $29/mo |
| **Enterprise registry federation** | Enterprise | Custom |

#### API Surface
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

#### Data Model
```
registration {
  id: uuid
  package_hash: sha256
  package_name: string
  status: 'protected' | 'licensed' | 'unregistered'
  owner_email: string
  manifest: json
  registered_at: timestamp
  updated_at: timestamp
  audit_chain: hash[]  // immutable append-only
}
```

### 0C: Documentation & Legal

- [ ] Whitepaper: "Indefensibility Thesis & The Shield Protocol"
- [ ] Patent mapping: Shield detection methods → U.S. App. No. 64/031,637
- [ ] Responsible disclosure policy for Mana attachment capabilities
- [ ] Terms of service for Lex Registry
- [ ] Privacy policy for registration data

---

## Phase 1 — "The Fear" (Months 1–3) — $5K MRR Target

*Security companies become your distribution army*

### 1A: Proof-of-Concept Demos

| Demo | Target | Purpose |
|------|--------|---------|
| **Lodash wrapping** | Hacker News | Silent attachment + SHA-256 proof. Viral launch moment. |
| **Hugging Face case study** | ML community | Real-world attachment to production ML infrastructure |
| **"Operation: Dream State"** | General public | ChatGPT behavioral synthesis campaign — demonstrate governance |

#### Lodash Demo Script
1. Install lodash normally: `npm install lodash`
2. Run Mana attachment (sealed, governed by Lex)
3. Show: every `_.map()` call now has a governance layer
4. Prove: SHA-256 hash of original vs. attached differs
5. Show: `@cmpsbl/shield` detects the attachment in < 1ms
6. Punch line: "Now imagine someone else did this to YOUR code"

### 1B: Security Industry Seeding

- [ ] Submit `@cmpsbl/shield` to Snyk vulnerability database
- [ ] Submit to Socket.dev supply-chain registry
- [ ] Publish npm advisory: "Universal Software Attachment Vector — Detection Tool Available"
- [ ] Security conference lightning talks: "We built something that can't be stopped. Here's how to detect it."
- [ ] Target conferences: DEF CON, BSides, Black Hat (CFP submissions)

### 1C: Revenue Streams

| Product | Price | Model |
|---------|-------|-------|
| Ascension diagnostic scans | $249 | One-time (Architect tier) |
| Shield Pro (monitoring dashboard) | $79/mo | Subscription |
| Blacklist priority registration | $29/mo | Subscription |
| Code Assembly service | $149+ | One-time |

---

## Phase 2 — "The Conversion" (Months 4–6) — Market Proof

*Fear → Understanding → "Wait, I want this"*

### 2A: Case Studies

- [ ] Companies that blacklisted → then whitelisted (conversion stories)
- [ ] Security firms adopting Mana for authorized penetration testing
- [ ] Enterprise "Shadow Shield" deployments for vulnerability mitigation
- [ ] Before/after metrics: detection speed, governance coverage, compliance scores

### 2B: Mana Commercial Launch

| Product | Description | Pricing |
|---------|-------------|---------|
| **Whitelist licensing** | Per-package or enterprise-wide Mana enablement | Tiered |
| **Mana Lab** | Self-service attachment pipeline with full governance | Subscription |
| **Sealed Runtime exports** | Lex governance baked into distributed code | Per-export |

### 2C: Ascension Engine Completion (v2.0.0)

| Criterion | Target | Status |
|-----------|--------|--------|
| Zero-intervention pipeline | Scan-to-deploy runs autonomously | 🟡 Planned |
| 25/25 archetype coverage | Full structural discovery | 🟡 Planned |
| Multi-language parity | Surgical accuracy: Rust, Go, Python | 🟡 Planned |
| Legal/investor readiness | Patent claims → code execution paths mapped | 🟡 Planned |

---

## Phase 3 — "The Standard" (Months 7–12) — Scale & Defend

*From product to protocol*

### 3A: Lex Registry → Industry Infrastructure

- [ ] API partnerships with package managers (npm, PyPI, crates.io)
- [ ] "Lex Verified" badge program for protected packages
- [ ] Registry federation for enterprise private registries
- [ ] Public dashboard: real-time global registration metrics

### 3B: Platform Licensing ($1M–$50M deals)

| Channel | Description | Target |
|---------|-------------|--------|
| **ARM model** | License the adhesion layer to cloud providers | AWS, GCP, Azure |
| **Government/defense** | Software governance contracts | DoD, DHS, NSA |
| **Insurance** | Cyber liability reduction via Lex-verified status | Major carriers |

### 3C: Product Compiler

- [ ] Multi-language Mana attachment (beyond JS/TS)
- [ ] Hardware-level governance (VHDL/Verilog substrate output)
- [ ] Edge device deployment (IoT, embedded systems)

---

## Phase 4 — Enterprise & Market Leadership (Year 2–3)

- [ ] Local/on-prem Mana installations
- [ ] $1M+ ARR target
- [ ] Strategic angel rounds at $5M+ valuation
- [ ] SBIR/non-dilutive grants (NSF, DARPA)
- [ ] 70% founder equity floor maintained
- [ ] Self-assembling agent teams
- [ ] Cross-substrate knowledge exchange
- [ ] Hardware description language deployment

---

## Technical Specifications

### Shield Detection Methods

```
Detection Vector 1: Proxy Trap Fingerprinting
  - Object.getOwnPropertyDescriptor() on Proxied vs. native differs
  - Proxy.revocable() leaves revocation handle traces
  - handler.get/set/apply trap timing differs from native access

Detection Vector 2: Prototype Chain Verification
  - Attached objects gain additional prototype links
  - __proto__ depth increases post-attachment
  - Symbol.toStringTag behavior changes under governance layer

Detection Vector 3: Memory Footprint Analysis
  - Governed objects consume measurably more heap
  - WeakRef resolution timing differs for wrapped objects
  - FinalizationRegistry callbacks fire differently
```

### Lex Registry Architecture

```
┌─────────────────────────────────────────┐
│            Lex Registry API             │
│  GET /registry/{hash}                   │
│  POST /registry/blacklist               │
│  POST /registry/whitelist               │
│  GET /registry/audit/{id}               │
├─────────────────────────────────────────┤
│         Immutable Audit Chain           │
│  Hash-anchored · Timestamped · Append   │
├─────────────────────────────────────────┤
│          Registration Store             │
│  package_hash · status · owner · chain  │
├─────────────────────────────────────────┤
│        Federation Layer (Phase 3)       │
│  Enterprise private registries          │
│  Cross-registry synchronization         │
└─────────────────────────────────────────┘
```

---

## The Flywheel

```
Ship Shield (free) → Security cos distribute it
    → Millions learn Mana exists
        → Fear drives blacklist registration
            → Registrations = qualified leads
                → Leads convert to whitelist (licensed)
                    → Revenue funds more demos
                        → More demos = more fear = more shields
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

## Engine Completion Criteria (v2.0.0)

All four must be met before declaring the engine complete:

1. **Zero-Intervention Pipeline** — scan-to-deploy runs autonomously without human or agent interference
2. **25/25 Archetype Floor** — full structural discovery coverage across the core archetype library
3. **Multi-Language Parity** — surgical accuracy for Rust, Go, and Python
4. **Legal/Investor Readiness** — formal programmatic mapping of all patent claims (U.S. App. Nos. 64/029,678 and 64/031,637) to specific code execution paths

---

## What Makes This Strategy Work

1. **The product markets itself** — security companies become unpaid salesforce
2. **Fear is free distribution** — no ad spend needed
3. **Blacklist = lead gen** — every registration is a future customer
4. **Ethical high ground** — "We shipped the shield first"
5. **Network effect** — the more shields deployed, the more valuable the whitelist becomes
6. **Binary framing** — forces action over inaction

---

*© CMPSBL® — PromptFluid™ · 2026*
