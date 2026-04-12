# CMPSBL® — REVIVAL Epoch Roadmap

**Classification:** INTERNAL — Strategy  
**Version:** 18.0.0 — REVIVAL  
**Status:** Phase 1–3 Shipped · Phase 4–5 In Progress  
**Author:** Kenneth E. Sweet Jr.  
**Date:** April 2, 2026

---

## Executive Summary

CMPSBL operates as a **Software Refurbishment Center** built on three pillars: **Discovery** (Memory Stream), **Refurbishment** (Restoration Shop / Ascension), and **Assembly** (Code Assembly). The platform is powered by the 40-Primitive substrate — pure algorithmic code, zero external AI.

DECODE serves as the **voice of the platform** — the interpreter who explains diagnostics, walks through restorations, and narrates discoveries.

Pricing is unified: **4-tier membership + graduated CJPI discovery pricing**. One membership. One Showroom. One pricing formula.

---

## The Three Pillars

### Pillar I — Discovery (Memory Stream)
**The Showroom · Pre-Built Discoveries**

An autonomous 8-hour discovery cycle that scours the substrate for capabilities nobody asked it to find. Every discovery is scored, valued, and placed in the Showroom. The inventory never stops growing.

- Static 100-item Showroom catalog (CJPI 68–100)
- Graduated CJPI pricing ($1–$2/point, $1,952 for Apex 100s)
- Solution-forward UI grouped by quality tier
- Stripe dynamic checkout via `showroom-checkout` edge function

### Pillar II — Refurbishment (Restoration Shop)
**Ascension · Code Restoration**

Bring us code that's broken, outdated, or underperforming. We scan it, diagnose it, and refurbish it using the 40-Primitive substrate. You get back hardened, documented code with a full restoration report.

- Diagnostic scan (ENCODE + ORACLE + ENGINEER)
- DECODE debrief for every restoration
- Restoration documentation package
- Queue-based capacity management per membership tier

### Pillar III — Assembly (Code Assembly)
**Unifying Fragmented Codebases**

The strategic third pillar: take fragmented code from multiple sources, resolve dependencies, and assemble them into a hardened, integrated system using the 40-Primitive substrate.

- Multi-source ingestion
- Dependency resolution
- Substrate-powered integration
- ⬜ Not yet shipped — roadmap item

---

## DECODE — The Voice of the Platform

DECODE is the customer-facing interpreter for the entire platform:

### 1. The Diagnostician
After ENCODE scans code, DECODE explains findings in plain language:
- What vulnerabilities exist and their severity
- Current capabilities vs. potential
- Which primitives are recommended for this specific code

### 2. The Debriefer
After restoration completes, DECODE walks the customer through:
- What each primitive did to the code
- New capabilities added
- Variants available and trade-offs
- How to test using `@cmpsbl/test-harness`

### 3. Discovery Commentary
For customers browsing the Showroom, DECODE provides:
- Detailed capability explanations
- Context on CJPI scoring
- Comparisons between similar discoveries

---

## Pricing Model

### Membership Tiers (Stripe Recurring)

| Tier | Price | Concurrent Restorations | Key Features |
|------|-------|------------------------|--------------|
| **Builder** | Free | Browse only | Showroom access, Foundry (Open Archive), view diagnostics |
| **Studio** | $29/mo | 2 | Full Restoration Shop, restoration docs, DECODE debrief |
| **Creator** | $49/mo | 4 | Priority queue, early access to new primitives |
| **Architect** | $79/mo | 8 | Maximum throughput, full primitive catalog, Collision Engine |

All paid tiers include a **7-day free trial** (no charge until day 8).  
Annual billing saves **20%**.

Stripe Price IDs are mapped in `src/config/engine-stripe-products.ts`.

### Showroom Discovery Pricing (Stripe Dynamic)

| CJPI Range | Rate | Price Range | Tier |
|-----------|------|------------|------|
| 68–79 | $1.00/point | $68–$79 | Mint |
| 80–89 | $1.25/point | $100–$111 | Prime |
| 90–93 | $1.50/point | $135–$140 | Relic |
| 94–99 | $2.00/point | $188–$198 | Mythic |
| **100** | **Fixed** | **$1,952** | **Apex** |

**Why $1,952?** In 1952, Grace Hopper's A-0 System became the first compiler ever written. Every perfect discovery carries the year that changed everything.

### Scarcity Model
- Unique certificate with serial number, CJPI score, discovery date, and primitive chain
- SHA-256 structural fingerprint
- Purchased discoveries are permanently retired from the Showroom

### Open Archive (Foundry / Junkyard)
Everything scored **below 68** (Raw tier) goes to the Open Archive — free access for all users. Includes "Restore via CMPSBL" CTAs for refurbishment upsell.

---

## What Actually Shipped (Phases 1–3)

### Phase 1: Platform Foundation ✅
- [x] 40-Primitive substrate live (12 Organs, 12 Layers, 8 Engines, 8 Agents)
- [x] Memory Stream autonomous 8-hour discovery cycle
- [x] DREAM synthesis (pure algorithmic, zero AI)
- [x] DECODE integration as platform voice
- [x] Navigation restructure with all legacy routes preserved
- [x] PublicNav + EnhancedFooter standardized across all pages
- [x] Breadcrumb navigation on all internal pages

### Phase 2: The Showroom & Economy ✅
- [x] Showroom with solution-forward horizontal-scroll carousels
- [x] Static 100-item catalog (CJPI 68–100)
- [x] Graduated CJPI pricing display
- [x] Dynamic Stripe checkout (`showroom-checkout` edge function with `price_data`)
- [x] Checkout redirect flow (`/checkout/redirect` page)
- [x] Certificate generation system
- [x] Permanent retirement system (purchased = removed forever)
- [x] Open Archive / Foundry with "Restore via CMPSBL" CTAs

### Phase 3: Restoration Shop & Membership ✅
- [x] Restoration Shop page (`/ascension`)
- [x] ENCODE + ORACLE + ENGINEER three-primitive scan team
- [x] DECODE debrief flow
- [x] Restoration documentation package
- [x] Queue-based capacity management
- [x] 4-tier membership checkout (Builder/Studio/Creator/Architect)
- [x] Stripe subscription integration with static Price IDs
- [x] 7-day free trial on all paid tiers
- [x] Plans page (`/plans`) as unified pricing destination
- [x] Agent Power-Up landing page
- [x] Lab-grade visual polish (scan lines, glow effects, glass cards, micro-animations)

---

## What's Next (Phases 4–5)

### Phase 4: Activation & Scale — IN PROGRESS
- [ ] File/Repo upload support for Code Assembly (ZIP/Git ingestion)
- [ ] Real-time Restoration Status Tracker (queue position, progress, ETA)
- [ ] Centralized Member Dashboard (subscription management, restoration history, purchases)
- [ ] Public "Before/After" Case Studies (showcase refurbishment results)
- [ ] Automated Email Delivery for restoration reports
- [ ] REST API for programmatic access (agencies, power users)

### Phase 5: Growth & Ecosystem
- [ ] Code Assembly full pipeline (multi-source ingestion → dependency resolution → integrated output)
- [ ] Collision Engine public access (upload two codebases, discover emergent capabilities)
- [ ] Developer Licensing (70/30 split for community-contributed discoveries)
- [ ] Specialty substrate curation (Fintech, Healthcare, Security verticals)
- [ ] Enhanced Foundry with community contributions and quality tiers

---

## The Compounding Flywheel

```
Customer uploads code → Ascension scans against 159-primitive pool
    → CJPI classifies & certifies capabilities (zero AI)
        → Discoveries route to Showroom / S-Tier Vault / Junkyard
            → Product Compiler assembles compatible chains into suites
                → ECONOMY auto-prices → Marketplace rotates inventory
                    → Scanner ingests ALL discoveries as training data
                        → 12 verticals cross-pollinate intelligence
                            → BRAIN learns structural patterns (not source code)
                                → Memory Stream compounds every 8 hours
                                    → Substrate gets stronger with every cycle
```

Every scan leaves a computational signature (not customer code) that feeds back into the discovery cycle. The substrate gets stronger with every interaction — pure algorithmic compounding, not AI inference.

### Key Legal Principle
No customer code is ever copied or redistributed. CMPSBL observes **patterns and behavioral signatures** — abstracted architectural insights, not source code. Covered in ToS §15 (Continuous Learning & Primitive Reuse).

---

## Competitive Moat

1. **The Assumption Moat** — Competitors who read the Zenodo disclosures will assume AI at the core. They'll never replicate it correctly.
2. **2.5 Years of Collision Data** — Proprietary discovery data from 2+ years of continuous runtime.
3. **The Pattern Library** — Every restoration adds patterns. A competitor starting today starts with zero.
4. **Three Zenodo DOIs** — Substrate: `10.5281/zenodo.18895141` · Memory Stream: `10.5281/zenodo.18834080` · Ascension: `10.5281/zenodo.19324807`.
5. **BRAIN Never Forgets** — Compound learning from every collision, swap, and discovery.
6. **The Platform IS the Product** — We sell the platform that makes artifacts, not just the artifacts.

---

## IP Protection Stack

| Layer | Protection |
|-------|-----------|
| **Convex Core™ Sealed Artifact** | CJPI scoring weights as hex-encoded arrays. Internal comments stripped. Generic naming. |
| **Moat Signatures** | Cryptographic UUID at ascension. Cannot be derived from discovery parameters. |
| **Structural Fingerprints** | SHA-256 hash of chain composition. Tamper-evident from discovery to deployment. |
| **Zenodo Prior Art** | Three independent records on CERN infrastructure. Three priority dates. |
| **Retirement Seal** | Purchased discoveries permanently retired. Certificate + fingerprint = proof of sole ownership. |

---

## Site Architecture (Current)

### Primary Navigation
```
Home · Showroom · Assembly · Plans · Restoration Shop · Foundry · Docs
```

### Key Routes
| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Home — platform overview with 3-pillar narrative | ✅ Live |
| `/showroom` | Discovery marketplace with CJPI tiers | ✅ Live |
| `/assembly` | Code Assembly service page | ✅ Live |
| `/plans` | Unified pricing (4 tiers + CJPI formula) | ✅ Live |
| `/ascension` | Restoration Shop | ✅ Live |
| `/foundry` | Open Archive / discovery browser | ✅ Live |
| `/checkout/redirect` | Stripe checkout redirect handler | ✅ Live |
| `/agent-power-up` | Agent refurbishment landing page | ✅ Live |
| `/member` | Member Hub | ✅ Live |

### Legacy Routes (preserved, redirected)
`/explore` → `/` · `/upgrade` → `/plans` · `/pricing` → `/plans` · `/restoration-shop` → `/ascension` · `/junkyard` → `/foundry`

---

## Emergency Reversal Plan

### 5-Minute Rollback
1. Restore `PublicNavLegacy.tsx` as primary navigation
2. Revert home route to `/explore`
3. Re-expose substrate pages in nav dropdown
4. Revert pricing page to previous tier structure

All existing pages remain at their URLs. Zero content deletion. Git history preserves every prior state.

---

## Success Metrics

1. Diagnostic upload volume (entry point conversions)
2. Showroom purchase rate (discovery retirement validates scarcity)
3. Membership conversion (Builder → paid tier)
4. Queue utilization rate > 60% during peak (demand signal)
5. DECODE debrief completion rate (time-to-understanding)
6. Restoration documentation satisfaction (test harness pass rate)
7. Zero increase in 404 errors or broken links
8. 10 paying customers within 30 days of campaign launch

---

© 2025–2026 CMPSBL® · PromptFluid™ LLC · Internal Strategy
