# CMPSBL® — The Master Plan: Factory Restructure Roadmap

**Classification:** INTERNAL — Strategy  
**Version:** 3.0 — The Full Factory  
**Status:** PROPOSED  
**Author:** Kenneth E. Sweet Jr.  
**Date:** April 2, 2026

---

## Executive Summary

CMPSBL transitions from a substrate-first presentation to a **classic car factory** narrative built on three pillars: **Scouts** (Memory Stream), **Restoration** (Ascension), and **Craftsmen** (the 40-Primitive Substrate). The factory self-reinforces through a flywheel where every customer interaction makes the system stronger.

DECODE serves as the **voice of the factory** — the trusted mechanic who explains what's wrong, what's possible, and what just happened.

Pricing is simplified to **membership + CJPI-based discovery pricing**. No 20-product catalog. One membership. One showroom. One pricing formula.

> *"Fall back in love with the classics."*

---

## The Three Pillars

### Pillar I — The Scouts (Memory Stream)
**The Showroom · New Classics**

An autonomous 8-hour discovery cycle that scours the substrate for capabilities nobody asked it to find. Every discovery scored, valued, and placed in the showroom. The inventory never stops growing.

Buy a new classic. Drive it home today. No customization required — pre-built, pre-scored, production-ready artifacts in 25 languages.

- **$4.3B+** in autonomous discoveries
- **3,000+** catalog entries
- **8hr** discovery cycle

### Pillar II — The Restoration Team (Ascension)
**The Restoration Shop · Your Car**

Bring us the code you've been running for five years. We scan it for vulnerabilities and capabilities. We give you an honest assessment of how long you've got. Then we refurbish it, add new capabilities, and send it back. You swap the old with the new. Almost no downtime.

Your techs still understand it — because it still IS the underlying software.

- **8-stage** pipeline
- **25** export languages
- **Up to 20** primitives per restoration

### Pillar III — The Craftsmen (Substrate)
**The Factory Floor · 40 Primitives**

The 40 specialists who make everything possible. Pure algorithmic code — zero external AI. Deterministic. Auditable. Same output every time you turn the key. The factory runs every 8 hours whether anyone is watching or not.

BRAIN learns everything. DREAM synthesizes while you sleep. SHADOW holds the architecture stable through every change. They never stop.

- **40** Primitives
- **Zero** external AI
- **3** Zenodo DOIs

---

## DECODE — The Voice of the Factory

DECODE is the customer-facing interpreter for the entire factory. Already the voice of the substrate, DECODE takes on three additional roles:

### 1. The Honest Mechanic
After ENCODE scans a customer's code, DECODE explains the findings in plain language:
- What vulnerabilities exist and how severe they are
- What the code's current capabilities are vs. what they could be
- How much runway the current architecture has left
- Which primitives are recommended to run against this specific code

DECODE receives this intelligence from ENCODE (the initial scanner) and translates it from technical primitive output into customer-facing language.

### 2. The Recommendation Engine
After Ascension completes, DECODE walks the customer through:
- What each selected primitive did to the code
- The new capabilities that were added
- The variants available and the trade-offs between them
- How to test the restored code using `@cmpsbl/test-harness`

### 3. Running Discovery Commentary
For customers browsing the Showroom (Memory Stream), DECODE can provide:
- Detailed explanations of any discovery's capabilities
- Context on why a discovery scored the way it did
- Comparisons between similar discoveries
- Real-time narration of ongoing discovery cycles

---

## The Restoration Pipeline — Primitive Roles

### The Scan Team: ENCODE + ORACLE + ENGINEER

The initial code scan uses a **three-primitive team** rather than a single scanner:

| Primitive | Role in Scan | Why |
|-----------|-------------|-----|
| **ENCODE** | Primary code analysis — reads computational signatures, identifies vulnerabilities, maps existing capabilities | ENCODE already does surgical patch analysis. Scanning is a natural extension. |
| **ORACLE** | Predictive assessment — Monte Carlo simulations on the code's future viability, failure probability, architectural runway | ORACLE's simulation and anomaly detection answer "how long has this code got?" |
| **ENGINEER** | Structural evaluation — identifies integration points, dependency chains, compatibility with substrate primitives | ENGINEER knows how things connect. It maps where primitives can attach. |

**Recommendation:** Use the same three-primitive team for both the **initial diagnostic scan** AND the **Ascension primitive selection**. Rationale:
- The scan team already understands the code's topology from the diagnostic
- They have the context needed to recommend which of the 40 primitives will produce the best results
- Adding a second team for selection would mean re-analyzing code that's already been mapped
- ORACLE's prediction models from the scan directly inform which primitives will have the highest impact

### The Ascension Run: Up to 20 Primitives

After the scan team recommends primitives, the customer chooses up to **20 primitives** to run against their code:

```
ENCODE + ORACLE + ENGINEER scan the code
    ↓
Scan team recommends optimal primitive set (up to 20)
    ↓
Customer reviews recommendations via DECODE
    ↓
Customer selects which primitives to run (1–20)
    ↓
Ascension executes selected primitives against the code
    ↓
DECODE explains what changed and what the code can now do
    ↓
Customer receives restored code + technical documentation
```

---

## The Restoration Documentation Package

Every restored piece of code ships with a **complete technical document** (the "Restoration Report"):

### Contents
1. **Pipeline Details** — Every primitive that touched the code, in what order, and what it did
2. **New Capabilities** — What the code can do now that it couldn't before, with usage examples
3. **Vulnerability Assessment** — What was found, what was hardened, what to monitor
4. **Error Codes** — Every error code the restored code can produce, what triggers it, and how to resolve it
5. **Testing Guide** — Step-by-step instructions using `@cmpsbl/test-harness` to verify every new capability
6. **CJPI Certificate** — The code's final score, tier, and fingerprint
7. **Primitive Manifest** — Which of the 40 primitives were involved and their individual contributions

### Testing Integration
```
npm install @cmpsbl/test-harness
npx cmpsbl-test --config ./restoration-report.json
```

The test harness reads the restoration report and generates a test suite specific to the primitives that were applied.

---

## Pricing Model — Simplified

### The Rule: One Membership. One Showroom Formula. No Catalog Chaos.

No 20 different price points for 20 different things. Two revenue streams, both clean.

### Revenue Stream 1: The Restoration Shop (Membership)

**Flat membership fee.** Members can use the shop as much as they want.

| Tier | Price | What You Get |
|------|-------|-------------|
| **Builder** | Included | Browse the Showroom. Access the Junkyard (unlimited Raw-tier picks). View diagnostics. Limited Ascension cycles. |
| **Studio** | $29/mo | Full Restoration Shop access. Rate-limited queue. |
| **Creator** | $49/mo | Priority queue. More concurrent restorations. |
| **Architect** | $79/mo | Maximum throughput. Full primitive catalog access. |

**Rate Limiting & Queue System:**
The **Adaptive Limited Rates Engine** (already discovered in the vault) manages shop capacity:
- Each tier has a throughput limit on concurrent restorations
- When capacity is exceeded, customers are placed **in queue** — their tech is "in the shop"
- Queue position is visible. Estimated completion time is shown.
- This creates **built-up excitement** — customers anticipate what comes out
- If they don't like the result, they can run it back through (membership covers unlimited runs)

The queue isn't a limitation. It's the experience. The factory has a line because the work is worth waiting for.

### Revenue Stream 2: The Showroom (CJPI-Based Discovery Pricing)

Every discovery in the Memory Stream Showroom is priced by a **graduated CJPI formula** that scales with tier rarity:

| CJPI Range | Rate | Price Range | Tier |
|-----------|------|------------|------|
| 68–79 | $1.00/point | $68–$79 | Mint |
| 80–89 | $1.25/point | $100–$111 | Prime |
| 90–93 | $1.50/point | $135–$140 | Relic |
| 94–99 | $2.00/point | $188–$198 | Mythic |
| **100** | **Fixed** | **$1,952** | **Apex — The First Compiler** |

**Why $1,952 for perfect 100s?**
In 1952, Grace Hopper's A-0 System became the first compiler ever written — the moment software stopped being hand-assembled and started being *built*. Every perfect discovery carries the year that changed everything. It's not arbitrary. It's provenance. Premium enough to feel extravagant. Realistic enough that a serious buyer doesn't blink.

### Scarcity Model: One Certificate. One Fingerprint. Gone Forever.

Every single discovery ships with:
- **A unique certificate** with serial number, CJPI score, discovery date, and primitive chain
- **A structural fingerprint** — SHA-256 hash of the chain composition
- **Retirement from the store** — once purchased, the discovery is **permanently retired** from the Showroom

If someone sees something they like, they have **one shot** to buy it. Next time they come back, it could be gone forever. The Showroom inventory rotates every 8 hours. The factory never makes the same thing twice.

This is not artificial scarcity. Every discovery is a unique collision of primitives. The same collision will never produce the same result because BRAIN has learned something new since the last one.

### Revenue Stream 3: The Junkyard (Raw Tier · Free)

Everything scored **below 68** — the Raw tier — doesn't get thrown away. It gets sent to **The Junkyard**.

**What it is:**
A free-access area where Builder-tier (free) users can browse, pick through, and take any Raw-tier discovery at no cost. These are the unrefined extractions — experimental grade, unpolished, sometimes broken. But they're real computational signatures from real discovery cycles.

**Why it works:**

1. **Builder tier gets real value.** Free users aren't locked out staring at a paywall. They're in the yard, hands dirty, pulling parts. This is how you build loyalty before they ever pay.
2. **Raw discoveries get a purpose.** Instead of being discarded below the quality floor, they become the entry drug. Some of them will surprise people.
3. **Ascension upsell.** A free user finds a Raw discovery they think has potential? They can run it through Ascension (paid membership) and see what comes out the other side. A $0 junkyard find that scores 94 after restoration? That's a story they tell everyone.
4. **Community competitions.** "Junkyard Wars" — who can build the best production software using only Raw-tier discoveries? Leaderboard. Bragging rights. Community content that writes itself.
5. **The barn find narrative.** This is the 1967 Shelby GT500 found under a tarp in a barn. Most of the junkyard is scrap. But every now and then, someone finds something nobody expected. That possibility keeps people digging.

**Rules:**
- Raw discoveries (score < 68) are automatically routed to the Junkyard
- No certificate, no fingerprint, no retirement — Junkyard items are **unlimited copies**
- Free users can take as many as they want
- If a Junkyard find is run through Ascension and scores ≥ 68, it enters the Showroom at its new CJPI price — now it's a real classic
- Junkyard inventory is visible to all tiers but only free/Builder users would have reason to dig through it

**The psychology:** The Showroom is velvet rope. The Junkyard is a treasure hunt. Both are powerful. Together they cover every customer mindset — the buyer who wants guaranteed quality AND the tinkerer who wants to find gold in the dirt.

### Stripe Implementation Notes

- **Memberships:** Standard recurring subscriptions (Studio/Creator/Architect tiers)
- **Discovery purchases:** One-time payments with dynamic pricing
  - Stripe supports dynamic pricing via `price_data` in checkout sessions for unique items
  - Each discovery gets a one-time Stripe Price created at discovery time with its CJPI-derived amount
  - On purchase: mark discovery as `retired` in the catalog, generate certificate
  - Perfect 100s ($1,952): pre-created Stripe Price for the Apex tier
- **Junkyard:** No Stripe integration needed — free downloads, tracked by user session for analytics

---

## The Flywheel

```
Customer uploads code → ENCODE+ORACLE+ENGINEER scan →
DECODE explains findings → Customer chooses primitives (up to 20) →
Ascension runs → Node duplicated → BRAIN learns →
Memory Stream discovers more → Showroom gets stronger →
More customers → More nodes → Factory upgrades itself
```

Every auxiliary node that passes through Ascension gets its computational signature stored in the admin layer. Not the customer's code — the archetype, the pattern, the blueprint.

### Three Uses for Every Stored Node

1. **Feed Memory Stream** — Scouts discover using production-hardened patterns, not just the original 40 Primitives. The showroom gets more targeted with every restoration.
2. **Upgrade Ascension** — If a customer's node is stronger than the original, replace it. The factory upgrades itself from the work of its own customers.
3. **Curate specialty substrates** — Fintech nodes → financial substrate. Healthcare nodes → medical substrate. Never design from scratch again.

### Primitive Dual Learning

- **Mode 1:** How do I become a better primitive and serve the substrate?
- **Mode 2:** What gaps does Ascension have that I could fill to become a better partner to the auxiliary nodes? BRAIN studies what nodes don't exist but should. The factory identifies its own blind spots and fills them.

### The Node Engine

When a new node is needed: describe it in plain language, one AI call, node created. That is the only place AI touches this product — on demand, when chosen, not stuffed into everything. Or take existing nodes, feed them through the merger tool, and the substrate combines them into something new. Unpredictable. Emergent. Nobody designed it.

### SHADOW Hot-Swap

When a node is swapped out, SHADOW steps in with a shadow node and holds its place until the replacement arrives. Zero gap. Zero downtime. The car never sits up on blocks.

### Key Legal Principle

No customer code is ever copied or redistributed. CMPSBL observes **patterns and behavioral signatures** — abstracted architectural insights, not source code. Covered in ToS §15 (Continuous Learning & Primitive Reuse).

---

## The Customer Journey (Revised)

```
1. Bring Us Your Tech      → Upload any code, any language, any framework
2. The Diagnostic           → ENCODE+ORACLE+ENGINEER scan. DECODE explains the truth.
3. Choose Your Primitives   → Scan team recommends up to 20. Customer selects.
4. The Restoration          → Ascension runs selected primitives. Queue if at capacity.
5. DECODE Debrief           → DECODE explains every change, every new capability, every variant.
6. The Documentation        → Full restoration report + test harness config + CJPI certificate.
7. Three-Day Test Drive     → Hot-swap architecture. Zero-friction trial. Infrastructure, not policy.
8. Keep It Forever          → Sealed Mini-Runtime. Runs indefinitely. No lock-in. Ever.
```

**The CMPSBL Guarantee:** Three-day test drive. No lock-in. Swap anytime. Black-box protected. The only updates we offer are upgrades — and they're optional. No emergency patches because someone jailbroke your billing bot at 2am. No AI tricks. No liability transfer. No fine print. Just classics.

---

## Product Models — 24 Plans Mapped to the Factory

11 of the 24 product models naturally lock into the classic car narrative. These are the priority commercialization paths.

### Tier 1 — Core Revenue (Launch)

| Model | Factory Name | What It Is | Revenue Model |
|-------|-------------|------------|---------------|
| **21** | **The Diagnostic Clinic** | Upload broken code. ENCODE+ORACLE+ENGINEER scan it. DECODE tells you the truth. Entry point for every customer. | Included in membership |
| **10** | **The Showroom** (Software Generator) | Memory Stream's catalog. Pre-built artifacts in 25 languages. Browse. Buy. Drive home today. | Graduated CJPI pricing ($1–$2/point, $1,952 for 100s) |
| **4** | **The Collision Engine** | Upload two codebases. Discover capabilities neither has alone. 1 + 1 = 3. | Included in Architect membership |

### Tier 2 — Growth Engine

| Model | Factory Name | What It Is | Revenue Model |
|-------|-------------|------------|---------------|
| **17** | **The Licensing Engine** | Developers earn 70% every time their discovery is used. Upload once. Earn forever. | 70/30 split |
| **16** | **The Bounty Board** | Post what you need. The substrate builds it. Rejected candidates become catalog inventory. | 15% of bounty value |
| **6** | **The Time Capsule** | Software that appreciates. Memory Stream discovers enhancements. Optional upgrades. | Included in membership (notifications) |

### Tier 3 — Premium & Scarcity

| Model | Factory Name | What It Is | Revenue Model |
|-------|-------------|------------|---------------|
| **23** | **The Vault** | APEX-tier discoveries. Perfect 100s. $1,952 each. When they're gone, they're gone forever. | $1,952 per Apex edition |
| **12** | **The Auction House** | Extension of Vault scarcity. Competitive bidding on rare discoveries. | Market-driven |
| **18** | **The Incubator** | Monday: prototype. Wednesday: launch-ready product. 48 hours. No equity surrendered. | Premium membership add-on |

### Tier 4 — Endgame

| Model | Factory Name | What It Is | Revenue Model |
|-------|-------------|------------|---------------|
| **9** | **The Marketplace** (Capability Marketplace) | Full ecosystem. Developers list. Customers buy. Two-sided market. | Platform fees |
| **24** | **The Foundry** | Fully autonomous. Memory Stream discovers. Ascension packages. Catalog grows 24/7. | Automated revenue via CJPI pricing |

### Models That Don't Fit (Phase 2+)

The remaining 13 models (per-seat enterprise licensing, white-label configurations, external AI integrations, managed service offerings) don't align with the "classics" narrative. They're valid revenue paths but belong to a later phase after the factory proves product-market fit. Preserved in `CMPSBL-24-Product-Models-v5.docx` for future activation.

---

## The $300 Customer Acquisition Plan

**Target:** 10 paying customers at $29/month = $290 MRR from $300 spend. Day one return.

| Cost | Action |
|------|--------|
| **$0** | Build the Agent Power-Up landing page. Dark theme. "Stop rebuilding your agent. We'll wrap it." Single email capture. First export free. |
| **$0** | r/software Ascension stress test post. "Drop your code. I'll wrap it with new capabilities for free." Every submission = demo. Every demo = potential customer. |
| **$0** | GitHub outreach to 20 agent builders. Search openai-agent, langchain, ai-agent repos with recent commits. "I ran your repo through Ascension. Here's what it found." Free. Targeted. Personal. |
| **$200** | Carbon Ads — developer-specific network. "Your agent. Wrapped. Nothing rewritten." Developer audiences only. No general noise. |
| **$100** | Targeted Slack/Discord community sponsorship. AI governance, EU AI Act compliance, agent security communities. "Bring in your tech. We'll tell you the truth." |

**Paywall position:** The diagnostic is free (included in Builder). The restoration is the paywall — they see what's possible, they subscribe to make it happen.

---

## Competitive Moat — Why Nobody Can Copy This

1. **The Assumption Moat** — Competitors who read the Zenodo disclosures will assume AI at the core. They will build accordingly. They will never replicate it correctly. That assumption is the moat.
2. **2.5 Years of Collision Data** — The Memory Stream has been running for over two years. Every discovery, every score, every collision result is proprietary data. A new entrant needs equivalent runtime duration.
3. **The Node Library** — Every agent that passes through Ascension leaves a node blueprint. The library grows with every customer. A competitor starting today starts with zero nodes.
4. **Three Zenodo DOIs** — Substrate: 10.5281/zenodo.18895141 · Memory Stream: 10.5281/zenodo.18834080 · Ascension: 10.5281/zenodo.19324807. All three pillars have established priority dates on CERN infrastructure.
5. **BRAIN Never Forgets** — Every collision, every swap, every discovery teaches BRAIN something. The primitive learning compounds. Every customer makes the factory smarter for every future customer.
6. **The Factory IS the Product** — Most competitors sell artifacts. We sell the factory that makes them. The factory gets stronger every 8 hours. The artifacts are just proof it's working.

> *"We used AI to help build the factory. Not to stuff it inside every product and make its shortcomings your new problem."*

---

## IP Protection Stack

| Layer | Protection |
|-------|-----------|
| **Sealed Runtime™** | CJPI scoring weights stored as hex-encoded arrays. Internal comments stripped. Generic naming applied. Decompiling reveals functional code but zero insight into discovery methodology. |
| **Moat Signatures** | Cryptographic UUID assigned at ascension. Cannot be derived from discovery parameters. Binds every artifact to its specific discovery event. |
| **Structural Fingerprints** | SHA-256 hash of every discovery's chain composition. Modifying the chain invalidates the fingerprint. Tamper-evident from discovery to deployment. |
| **Zenodo Prior Art** | Three independent records. Three priority dates. All indexed in OpenAIRE on CERN infrastructure. Established before a single patent dollar spent. |
| **Retirement Seal** | Purchased discoveries are permanently retired from the Showroom. Certificate of authenticity + fingerprint = proof of sole ownership. |

---

## Navigation Restructure

### New Primary Navigation
```
Home · Memory Stream · Ascension · Pricing · Docs · Try · Login
```

### Home Page Transformation
Replace current `/explore` hero with the factory narrative:
- **Hero:** "Fall back in love with the classics." + three-pillar overview
- **Section 2:** The Customer Journey (8 steps with DECODE debrief)
- **Section 3:** The Showroom preview (live Memory Stream catalog with CJPI prices)
- **Section 4:** Featured Vault editions (scarcity, perfect 100s at $1,952)
- **Section 5:** The Guarantee
- **CTA:** "Bring Us Your Tech" → Ascension upload

### Content Preservation
All existing pages remain active at their current URLs:

| Route | Action | Purpose |
|-------|--------|---------|
| `/` (new Home) | **CREATE** | Factory-focused landing with classic car narrative |
| `/memory-stream` | **CREATE** | Dedicated Showroom product page with live discovery feed + CJPI pricing |
| `/ascension` | **CREATE** | Dedicated Restoration Shop with DECODE-guided journey |
| `/pricing` | **KEEP** | Update to membership tiers + CJPI pricing formula |
| `/docs` | **KEEP** | Unchanged |
| `/explore` | **KEEP (hidden)** | Remove from nav, keep at URL — emergency reversal home page |
| `/products` | **KEEP (hidden)** | Remove from nav, keep at URL |
| `/topology` | **KEEP (hidden)** | Remove from nav, keep at URL |
| `/substrate/*` | **KEEP (hidden)** | All substrate detail pages stay at their URLs |
| `/npm-ecosystem` | **KEEP (hidden)** | Remove from nav, keep at URL |

**Critical Rule:** No page is deleted. Every existing URL continues to work. Only the navigation menu changes.

---

## Implementation Phases

### Phase 1: The Showroom + DECODE Voice (Week 1–2)
- [x] New home page with factory narrative and "classics" branding ✅
- [ ] DECODE integration as factory voice (diagnostic explanations, discovery commentary)
- [x] Memory Stream catalog browser with graduated CJPI pricing display ✅
- [x] Navigation restructure (preserve all legacy routes) ✅
- [ ] Agent Power-Up landing page live
- [x] ToS §15 live ✅

### Phase 2: The Restoration Shop (Week 3–4)
- [ ] ENCODE+ORACLE+ENGINEER three-primitive scan team implementation
- [ ] Up-to-20 primitive selection UI with scan team recommendations
- [ ] DECODE debrief flow (post-Ascension capability walkthrough)
- [ ] Restoration documentation generator (pipeline details, error codes, test harness config)
- [ ] Adaptive Limited Rates Engine integration (queue system + capacity management)
- [ ] Membership tier checkout (Studio $29 / Creator $49 / Architect $79)

### Phase 3: The Economy (Week 5–8)
- [ ] Graduated CJPI pricing in Stripe ($1–$2/point by tier, $1,952 for perfect 100s)
- [ ] Certificate generation system (serial number, fingerprint, CJPI score)
- [ ] Permanent retirement system (purchased = removed from Showroom forever)
- [ ] Licensing Engine (Model 17) — developer 70/30 split
- [ ] Bounty Board (Model 16) — customer-driven discovery
- [ ] $300 customer acquisition campaign launch

### Phase 4: The Foundry (Week 9–12)
- [ ] Vault editions (Model 23) — Apex-only, $1,952 each
- [ ] Fully autonomous catalog generation (Model 24)
- [ ] Collision Engine public access (Model 4)
- [ ] Marketplace two-sided features (Model 9)
- [ ] Incubator 48-hour pipeline (Model 18)

### Phase 5: Scarcity & Premium (Week 13+)
- [ ] Auction House (Model 12)
- [ ] Specialty substrate curation (Fintech, Healthcare, Legal)
- [ ] Node Engine: plain-language node creation + merger tool
- [ ] Time Capsule notifications (Model 6) — included in membership

---

## Ten Years of Pain — Already Solved

The Memory Stream did not set out to solve enterprise software pain points. It ran on an 8-hour cycle and found these solutions autonomously. None of them were requested.

| Year | Pain Point | Discovery | CJPI |
|------|-----------|-----------|------|
| 2015 | Unpatched OSS Vulnerabilities | Immune Memory Persistence Engine + Adaptive Threat Antibody Generator | 99.1–100 |
| 2016 | Supply Chain Attacks | Federated Identity Resolver + Zero-Trust Continuous Verifier | 100 |
| 2017 | AI Security | Cognitive Firewall | 99.8 |
| 2018 | GDPR & Data Privacy | Selective Memory Erasure Controller + Data Sovereignty Partitioner | 98.9–100 |
| 2020 | Contract & SLA Enforcement | Breach Penalty Calculator + Contract Evolution Mediator | 99.8–100 |
| 2021 | AI Ethics & Explainability | Neural Arbiter + Constitutional AI Guardian | 100 |
| 2023 | EU AI Act Compliance | Regulatory Genome Mapper + Jurisdiction Classifier | 98.3–100 |
| 2024 | Agent Governance | Self-Improving Cognition + Ghost Defense Mesh + Temporal Fitness Tracker | 91–99 |

---

## Emergency Reversal Plan

### Trigger Conditions
- After 30 days: <5 diagnostic uploads AND <3 paying customers AND <50 showroom page views/day → evaluate reversal
- User feedback indicating confusion with new navigation
- Kenneth's discretion at any point

### 5-Minute Rollback
1. Restore `PublicNavLegacy.tsx` as primary navigation
2. Revert home route to `/explore`
3. Re-expose substrate pages in nav dropdown
4. Revert pricing page to previous tier structure

### What Gets Preserved Either Way
- All existing pages remain at their URLs throughout — zero content deletion
- All admin functionality unchanged
- All Ascension/Memory Stream infrastructure unchanged
- Git history preserves every prior state
- `PublicNavLegacy.tsx` kept as hot-swap backup
- Feature flag option available for A/B testing before full rollout
- DECODE voice integration persists regardless of navigation state

---

## Success Metrics

1. New visitor conversion to Memory Stream trial increases
2. Ascension upload volume increases (diagnostic uploads)
3. Time-to-understanding decreases (DECODE debrief completion rate)
4. No increase in 404 errors or broken link reports
5. Admin vault primitive count grows with each Ascension interaction
6. 10 paying customers within 30 days of campaign launch
7. $290+ MRR achieved from $300 spend
8. Queue utilization rate > 60% during peak hours (validates demand signal)
9. Discovery retirement rate (purchases) validates scarcity model
10. Restoration documentation satisfaction (test harness pass rate)

---

*"No self-driving. No flying cars. Just classics. Code built right the first time, running clean every time, owned by you forever."*

---

© 2025–2026 CMPSBL® · PromptFluid™ LLC · Internal Strategy
