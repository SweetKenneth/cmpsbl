# CMPSBL® Unified Master Roadmap — 12-Month Sprint to $1M ARR

**Classification:** Strategic — Founder & Investor Use  
**Author:** Kenneth E. Sweet Jr., Solo Founder  
**Entity:** PromptFluid™ LLC (Texas)  
**Version:** 1.0 — April 13, 2026  
**Patents:** U.S. App. No. 64/029,678 · 64/031,637 (Pending)  
**Target:** $1M ARR by October 2027 · $83K MRR steady-state

---

> **North Star:** Every sprint must answer one question — *Does this get us closer to $83K/month?*  
> If it doesn't drive revenue, adoption, or defensibility, it waits.

---

## Table of Contents

1. [Where We Stand — April 2026](#1-where-we-stand)
2. [What's Broken / Missing / Blocking Revenue](#2-whats-broken)
3. [The 12-Month Plan](#3-the-12-month-plan)
4. [Month-by-Month Execution](#4-month-by-month)
5. [Revenue Model & Milestones](#5-revenue-milestones)
6. [Success Metrics](#6-success-metrics)
7. [Risk Register](#7-risk-register)

---

## 1. Where We Stand

### ✅ Built & Operational

| Asset | Status | Revenue Impact |
|-------|--------|----------------|
| 40-Primitive Substrate (12O·12L·8E·8A) | Production | Foundation |
| Ascension Engine v21.0.0 (159 primitives, 90+ languages) | Production | Crown jewel — patent pending |
| Memory Stream (8hr CDM, 12 verticals) | Autonomous | Revenue printer — needs storefront |
| Product Compiler + ECONOMY auto-pricing ($10–$99) | Production | Autonomous listing engine |
| Mana Engine (92 wrappers, SHA-256 proof, Lex governance) | Engine complete | "The Real Product" — autonomous software integration without developers |
| GENESIS Vertical Factory (10-min deployment) | Production | Speed moat |
| 12 Vertical Substrates | Live | Market coverage |
| 11 `@cmpsbl/*` npm packages | Published | Developer distribution channel |
| Governor Control Panel (control.cmpsbl.com) | Live | Internal ops |
| Investor Showcase v19 ("Deterministic Coding" narrative) | Live | Fundraising asset |
| Convex Core™ DPL (sealed artifact export) | Production | Patent-protected IP |
| 200K+ lines of deterministic code | Production | Technical moat |

### ❌ Not Built / Broken / Blocking

| Gap | Impact | Priority |
|-----|--------|----------|
| **No revenue** — zero paying customers | Fatal | P0 |
| **No Stripe checkout flow** for subscriptions | Blocks all revenue | P0 |
| **Shield landing page** (`/shield`) missing | Blocks GTM flywheel entry point | P0 |
| **Mana landing page** (`/mana`) incomplete | Blocks "The Real Product" narrative — autonomous integration SDK | P0 |
| **Lex Registry UI** (`/registry`) missing | Blocks blacklist lead funnel | P0 |
| **No onboarding flow** for developers | Blocks adoption | P1 |
| **Store/Marketplace** not connected to real data | Blocks discovery monetization | P1 |
| **Case studies** page placeholder | Blocks credibility | P1 |
| **Whitepaper / Publication** page thin | Blocks academic + security credibility | P1 |
| **SEO gaps** — missing structured data on key pages | Blocks organic discovery | P2 |
| **Mana runtime loader** (live npm interception) | Blocks Mana commercial demos | P2 |
| **Documentation** not polished for external devs | Blocks enterprise adoption | P2 |
| **Email capture / waitlist** system incomplete | Blocks lead nurturing | P2 |
| **Build errors** (intermittent TypeScript issues) | Blocks deploy confidence | P2 |

---

## 2. What's Broken

### Site Gaps (Lovable-Buildable)

| Page/Feature | Status | Fix |
|---|---|---|
| `/shield` | Missing | Build: hero + install snippet + detection demo + CTA |
| `/mana` | Placeholder TODO | Build: product page — autonomous software integration without developers, Mana Lab flow (Upload → Merge → Lex → Attach → Export) |
| `/registry` | Missing | Build: Lex Registry lookup UI + status badges |
| `/store` | Shell only | Connect to real Memory Stream discovery data |
| `/case-studies` | Placeholder | Build template + 3 initial case studies |
| `/publication` | Thin | Flesh out Indefensibility Thesis + whitepapers |
| Stripe checkout | Missing | Wire subscription tiers + one-time purchases |
| Developer onboarding | Missing | `/start-here` → guided flow to first Ascension scan |
| Email capture | Partial | Waitlist forms on gated routes → database |
| Structured data | Partial | JSON-LD on remaining high-value pages |

### Technical Gaps (Engine-Level)

| System | Gap | Fix |
|---|---|---|
| Mana Loader | No live npm interception | Build `loader.mjs` for Node.js `--loader` hook — enables non-developer integration of packages with other software |
| Shield Package | `@cmpsbl/shield` not published | Build + publish: Proxy Trap Detector + Lex Heartbeat |
| Lex Registry API | No backend endpoint | Edge function: `GET /registry/{hash}` |
| Subscription billing | No Stripe integration | Edge functions for checkout + webhook |
| Usage metering | No per-tier quota enforcement | Middleware for API rate limiting |

---

## 3. The 12-Month Plan

### Strategic Phases

```
MONTH 1–2: THE SHIELD          → Free distribution + lead capture
MONTH 3–4: THE STOREFRONT      → Revenue engine online
MONTH 5–6: THE PROOF           → Case studies + enterprise demos
MONTH 7–9: THE SCALE           → Developer adoption + content flywheel
MONTH 10–12: THE STANDARD      → Enterprise deals + protocol status
```

### Revenue Trajectory

```
Month 1:   $0        (building)
Month 2:   $500      (first diagnostic sales)
Month 3:   $2K       (subscriptions begin)
Month 4:   $5K       (store + subscriptions)
Month 5:   $10K      (enterprise pilots)
Month 6:   $18K      (case study conversions)
Month 7:   $25K      (developer adoption compounds)
Month 8:   $35K      (content flywheel kicks in)
Month 9:   $45K      (enterprise expansions)
Month 10:  $55K      (protocol partnerships begin)
Month 11:  $70K      (scale effects)
Month 12:  $83K      ($1M ARR run-rate)
```

---

## 4. Month-by-Month Execution

---

### MONTH 1 — "Ship the Antidote" (April 13 – May 13)

**Theme:** Build the free entry point. Fix every site gap that blocks credibility.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 1.1 | **Shield Landing Page** (`/shield`) — hero, `npm install`, detection demo, CTA to registry | Lovable | Build | ☐ |
| 1.2 | **Mana Landing Page** (`/mana`) — "The Real Product" narrative: autonomous software integration without developers. Mana Lab flow demo (Upload → Merge → Lex → Attach → Export). Patent badge. | Lovable | Build | ☐ |
| 1.3 | **Lex Registry UI** (`/registry`) — package hash lookup, status badges (protected/licensed/unregistered) | Lovable | Build | ☐ |
| 1.4 | **Lex Registry API** — edge function `GET /registry/{hash}`, database table for registrations | Backend | Build | ☐ |
| 1.5 | **Fix all build errors** — clean `tsc --noEmit`, zero warnings | Lovable | Fix | ☐ |
| 1.6 | **Publication page** (`/publication`) — Indefensibility Thesis, patent references, Zenodo links | Lovable | Build | ☐ |
| 1.7 | **Waitlist capture** — forms on all Phase 2+ gated routes → `waitlist_signups` table | Backend | Build | ☐ |
| 1.8 | **SEO pass** — JSON-LD on `/shield`, `/mana`, `/registry`, `/publication`; update sitemap | Lovable | Polish | ☐ |

**Exit Criteria:** Shield + Mana + Registry pages live. Zero build errors. Waitlist capturing emails.

---

### MONTH 2 — "The Fear Campaign" (May 14 – June 13)

**Theme:** Security industry seeding. First revenue from diagnostics.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 2.1 | **`@cmpsbl/shield` npm publish** — Proxy Trap Detector + Lex Heartbeat Monitor + README | Package | Build | ☐ |
| 2.2 | **Lodash wrapping demo** — live attachment proof with SHA-256 verification page | Lovable | Build | ☐ |
| 2.3 | **Code Diagnostic Clinic** page (`/diagnostic`) — upload code → Ascension report → pay for hardened export | Lovable | Build | ☐ |
| 2.4 | **Stripe integration** — checkout for diagnostics ($149 one-time) | Backend | Build | ☐ |
| 2.5 | **Hacker News launch prep** — lodash demo + Shield announcement post | Content | Write | ☐ |
| 2.6 | **CVE-style advisory** — "Universal Software Attachment Vector — Detection Tool Available" | Content | Write | ☐ |
| 2.7 | **Developer onboarding** (`/start-here`) — guided flow: install SDK → first scan → see results | Lovable | Build | ☐ |
| 2.8 | **Case Study template** — reusable component for `/case-studies` | Lovable | Build | ☐ |

**Exit Criteria:** Shield on npm. Diagnostic clinic accepting payments. HN launch materials ready.

---

### MONTH 3 — "Revenue Engine Online" (June 14 – July 13)

**Theme:** Subscription billing live. Store connected to real data. First $2K MRR.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 3.1 | **Subscription checkout** — Stripe for Builder (free) / Creator ($79) / Architect ($249) tiers | Backend | Build | ☐ |
| 3.2 | **Store connected to live data** — Memory Stream discoveries → purchasable exports | Lovable+DB | Build | ☐ |
| 3.3 | **Tier-gated access** — enforce quotas (Ascension runs, crystallizations, verticals) | Backend | Build | ☐ |
| 3.4 | **Hacker News launch** — lodash demo + Shield + "We built something that can't be stopped" | Marketing | Execute | ☐ |
| 3.5 | **3 case studies** — Hugging Face attachment, Express.js governance, open-source hardening | Lovable | Build | ☐ |
| 3.6 | **Daily Drip campaign** — free Ascension reports of popular OSS → link back to diagnostic | Marketing | Execute | ☐ |
| 3.7 | **Shield Pro dashboard mock** — enterprise monitoring UI preview (gated, waitlist) | Lovable | Build | ☐ |
| 3.8 | **Reddit / Dev.to / Twitter launch** — cross-post demo content | Marketing | Execute | ☐ |

**Exit Criteria:** $2K MRR. 1K Shield installs. 100 blacklist registrations. Store selling exports.

---

### MONTH 4 — "Proof Compounds" (July 14 – Aug 13)

**Theme:** Case studies drive conversions. Enterprise pilot outreach begins.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 4.1 | **Enterprise pilot outreach** — email 20 companies with free Ascension reports of their code | Sales | Execute | ☐ |
| 4.2 | **Showroom rotation** — MERCHANT auto-curates featured discoveries | Lovable+DB | Build | ☐ |
| 4.3 | **Forge catalog** — Product Compiler graduated suites visible in `/forge/catalog` | Lovable | Polish | ☐ |
| 4.4 | **Documentation polish** — external-facing docs for SDK, Ascension API, Shield | Lovable | Write | ☐ |
| 4.5 | **Investor Showcase update** — add live revenue metrics, Shield install counter | Lovable | Polish | ☐ |
| 4.6 | **Blog content pipeline** — 2 technical posts/month (attachment proofs, architecture deep-dives) | Content | Write | ☐ |
| 4.7 | **Compounding Value Dashboard** — streak tracking, rarity distribution for subscribers | Lovable | Build | ☐ |

**Exit Criteria:** $5K MRR. 3 enterprise pilot conversations. 5K Shield installs.

---

### MONTH 5 — "Enterprise Proof" (Aug 14 – Sep 13)

**Theme:** First enterprise deal. Mana commercial positioning.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 5.1 | **Mana runtime loader** — Node.js `--loader` hook for live npm interception. Enables non-developer software integration at the package level. | Engine | Build | ☐ |
| 5.2 | **Mana Lab** (`/mana/lab`) — self-service integration pipeline: Upload any SDK → Merge capabilities → Configure Lex governance → Attach Layer 2 → Export governed package. No developer required. (Governor-gated initially) | Lovable | Build | ☐ |
| 5.3 | **Enterprise pricing page** — $999+/mo tier with white-label, custom substrates | Lovable | Build | ☐ |
| 5.4 | **Security conference materials** — slide deck + demo script for lightning talks | Content | Create | ☐ |
| 5.5 | **Shield → Whitelist conversion flow** — blacklisted packages → "opt into Mana" CTA | Lovable | Build | ☐ |
| 5.6 | **Churn prevention system** — "at-risk" notifications, compounding value warnings | Backend | Build | ☐ |

**Exit Criteria:** $10K MRR. First enterprise deal signed. Mana loader functional.

---

### MONTH 6 — "The Conversion Engine" (Sep 14 – Oct 13)

**Theme:** Fear → Understanding → "Wait, I want this." Blacklist→Whitelist conversions.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 6.1 | **Conversion case studies** — companies that blacklisted → then whitelisted | Lovable | Build | ☐ |
| 6.2 | **Shield Pro launch** — enterprise monitoring dashboard ($79/mo) | Lovable+Backend | Build | ☐ |
| 6.3 | **Multi-vertical demos** — interactive demos for Cyber, Health, Legal, Gaming substrates | Lovable | Build | ☐ |
| 6.4 | **API documentation portal** — OpenAPI spec, interactive playground | Lovable | Build | ☐ |
| 6.5 | **Referral program** — existing subscribers earn credits for referrals | Backend | Build | ☐ |
| 6.6 | **SEO content cluster** — 10 pages targeting "software governance", "runtime protection", "code evolution" | Lovable | Build | ☐ |

**Exit Criteria:** $18K MRR. 50K Shield installs. 5K blacklist registrations. 50 whitelist conversions.

---

### MONTH 7–8 — "Developer Adoption Flywheel" (Oct 14 – Dec 13)

**Theme:** Content compounds. SDK adoption grows. Community forms.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 7.1 | **Developer Academy** (`/academy`) — structured learning paths for substrate adoption | Lovable | Build | ☐ |
| 7.2 | **SDK playground** (`/sdk-playground`) — interactive code editor with live Ascension results | Lovable | Polish | ☐ |
| 7.3 | **Multi-language Mana** — Python + Go attachment wrappers (Rust stretch goal) | Engine | Build | ☐ |
| 7.4 | **"Lex Verified" badge program** — visual badge for protected packages | Design+Backend | Build | ☐ |
| 7.5 | **Community Discord/forum** — developer community for substrate users | External | Setup | ☐ |
| 7.6 | **Monthly technical webinar** — live Ascension demos, Q&A, case study reviews | Marketing | Execute | ☐ |
| 7.7 | **Marketplace Phase 2** — third-party artifact submissions (curated) | Lovable+Backend | Build | ☐ |
| 7.8 | **SBIR/STTR grant applications** — non-dilutive funding for R&D | Business | Apply | ☐ |

**Exit Criteria:** $35K MRR. 500K Shield installs. SDK downloads growing 20%/month.

---

### MONTH 9–10 — "Enterprise Scale" (Dec 14 – Feb 13)

**Theme:** Enterprise pipeline fills. Platform licensing conversations begin.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 9.1 | **Enterprise SSO** — SAML/OIDC for enterprise customers | Backend | Build | ☐ |
| 9.2 | **On-prem deployment option** — self-hosted substrate for regulated industries | Engine | Build | ☐ |
| 9.3 | **Platform licensing model** — ARM-style: license adhesion layer to cloud providers | Business | Design | ☐ |
| 9.4 | **Government/defense positioning** — NIST compliance mapping, FedRAMP prep | Business | Research | ☐ |
| 9.5 | **Insurance industry partnerships** — cyber liability reduction via Mana governance | Business | Outreach | ☐ |
| 9.6 | **Registry federation** — enterprise private registries connected to Lex | Backend | Build | ☐ |

**Exit Criteria:** $55K MRR. 3+ enterprise contracts. Platform licensing LOI.

---

### MONTH 11–12 — "The Standard" (Feb 14 – Apr 13, 2027)

**Theme:** From product to protocol. $83K MRR = $1M ARR.

| # | Deliverable | Type | Owner | Status |
|---|---|---|---|---|
| 11.1 | **Package manager partnerships** — npm, PyPI, crates.io integration proposals | Business | Outreach | ☐ |
| 11.2 | **Hardware-level governance** — VHDL/Verilog substrate output (research phase) | Engine | Research | ☐ |
| 11.3 | **Strategic angel round** — $500K–$1M at $5M+ valuation, 70% founder equity floor | Business | Execute | ☐ |
| 11.4 | **First hire** — DevRel or Sales (revenue-funded) | Business | Hire | ☐ |
| 11.5 | **Lex Registry as infrastructure** — API partnerships, "Lex Verified" standard | Business | Build | ☐ |
| 11.6 | **Year 2 roadmap** — plan next phase based on actual data | Strategy | Plan | ☐ |

**Exit Criteria:** $83K MRR ($1M ARR run-rate). 5M+ Shield installs. 500K+ blacklist registrations. First employee.

---

## 5. Revenue Milestones

### Revenue Streams (Stacked)

| Stream | Launch Month | Steady-State MRR | Notes |
|---|---|---|---|
| Code Diagnostics ($149 one-time) | Month 2 | $2K | Converts to subscriptions |
| Creator subscriptions ($79/mo) | Month 3 | $8K | Core individual tier |
| Architect subscriptions ($249/mo) | Month 3 | $15K | Power users + teams |
| Store exports ($10–$99 one-time) | Month 3 | $5K | Memory Stream monetization |
| Shield Pro ($79/mo) | Month 6 | $8K | Enterprise monitoring |
| Enterprise ($999+/mo) | Month 5 | $25K | White-label + custom |
| Platform licensing | Month 10 | $20K+ | ARM-model deals |
| **Total** | | **$83K+** | |

### Key Conversion Funnel

```
Shield Install (free)
  → Blacklist Registration (free, captured lead)
    → Diagnostic Clinic ($149, one-time)
      → Creator Subscription ($79/mo)
        → Architect Subscription ($249/mo)
          → Enterprise Contract ($999+/mo)
            → Platform License ($10K+/mo)
```

---

## 6. Success Metrics

| Metric | Month 3 | Month 6 | Month 9 | Month 12 |
|--------|---------|---------|---------|----------|
| MRR | $2K | $18K | $45K | $83K |
| Shield npm installs | 1K | 50K | 500K | 5M |
| Blacklist registrations | 100 | 5K | 50K | 500K |
| Whitelist conversions | 0 | 50 | 200 | 500 |
| Paying subscribers | 15 | 100 | 300 | 600+ |
| Enterprise contracts | 0 | 1 | 3 | 5+ |
| Blog posts published | 4 | 12 | 20 | 30 |
| Case studies | 3 | 6 | 10 | 15 |
| npm @cmpsbl downloads/month | 500 | 5K | 20K | 100K |

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Zero paying customers by Month 3 | Medium | Critical | Free diagnostics → prove value → convert |
| Shield perceived as threat, not tool | Medium | High | "We shipped the antidote first" framing |
| Solo founder burnout | High | Critical | Automate everything. CDM runs autonomously. Hire Month 11. |
| Patent challenge | Low | High | Two filed applications + trade secrets |
| Competitor replication | Low | Medium | 200K LOC + 3,000 hrs + patent = 2-year moat minimum |
| Enterprise sales cycle too long | High | Medium | Start with SMB diagnostics, enterprise follows proof |
| Lovable platform limitations | Medium | Medium | Edge functions + external APIs for complex flows |

---

## Appendix: Lovable Build Queue (Ordered)

Things that can be built right now, in priority order:

1. ☐ `/shield` — Shield landing page
2. ☐ `/mana` — Mana product page (rebuild from placeholder)
3. ☐ `/registry` — Lex Registry lookup UI
4. ☐ Lex Registry edge function + database table
5. ☐ Waitlist capture system (gated route forms → DB)
6. ☐ `/publication` — Indefensibility Thesis page
7. ☐ Stripe checkout integration (diagnostics first)
8. ☐ `/diagnostic` — Code Diagnostic Clinic page
9. ☐ `/start-here` — Developer onboarding flow
10. ☐ `/case-studies` — Case study template + 3 studies
11. ☐ Store connected to live discovery data
12. ☐ Subscription tier checkout (Creator/Architect)
13. ☐ JSON-LD structured data on remaining pages
14. ☐ Shield Pro dashboard mock
15. ☐ Compounding Value Dashboard
16. ☐ Investor Showcase live metrics update
17. ☐ Blog content pipeline (component + first posts)
18. ☐ Developer Academy content
19. ☐ SDK Playground polish
20. ☐ Multi-vertical interactive demos

---

*This document supersedes all previous roadmaps. Review monthly. Drift = death.*

---

© 2026 CMPSBL® · PromptFluid™ · All rights reserved.
