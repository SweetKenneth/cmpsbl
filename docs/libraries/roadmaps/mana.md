
# Mana Detailed Roadmap — Execution Plan

## Current State (Updated April 13, 2026)

### ✅ Phase 0 — Complete
- Mana engine core (engine, lex, loader, manifest-consumer, findings-bridge, config, types)
- ManaHome campaign hub page
- ManaLab wizard UI (Upload → Merge → Lex → Attach → Export)
- Shield landing page
- ManaProof page
- Mana component library (CodeWrapAnimation, LexRuleSelector, ManaStats, etc.)

### ✅ Phase 1A — Lex Registry Backend (Complete)
- `lex_registry` table with SHA-256 hash lookups, status enum (protected/licensed/unregistered)
- `lex_registry_events` immutable audit trail with hash-anchored entries
- Auto-audit triggers on INSERT and status changes
- RLS: public read, authenticated write, registrant-only updates
- `lex-registry-lookup` edge function — public GET API
- `lex-registry-register` edge function — authenticated POST
- Client service (`src/services/lex-registry.ts`) with lookup, register, audit functions
- Shield page wired to real backend (package registration + lookup)

---

## Phase 1B: Registry Hardening (Next)
1. **Rate limiting** on registration endpoint (prevent spam)
2. **Input sanitization** — additional validation on metadata field
3. **Registry stats endpoint** — total registrations, breakdown by status
4. **SEO updates** for Shield page with real registry data

## Phase 2: Shield Detection Demo (Week 2)
1. **Live Proxy trap detection visualization** — in-browser demo showing detection in action
2. **Lex Heartbeat Monitor UI** — real-time status check against registry API
3. **Attachment Alarm component** — visual alert on Layer 2 activity detection
4. **npm install flow** — real package page or registry placeholder

## Phase 3: Proof-of-Concept Demos (Week 3)
1. **Lodash wrapping demo** — interactive: pick function → show silent attachment → SHA-256 proof
2. **Hugging Face case study** — real-world attachment narrative with proof artifacts
3. **"Operation: Dream State" teaser** — campaign page

## Phase 4: Revenue Infrastructure (Week 4)
1. **Shield Pro ($79/mo)** — enterprise monitoring dashboard
2. **Blacklist Priority ($29/mo)** — SLA-backed registration
3. **Ascension Architect ($249)** — diagnostic scan
4. **Stripe integration** with Plans/Store pages

## Phase 5: Registry Dashboard (Week 5)
1. **My Registrations page** — list, status, audit trail
2. **Public registry search** — by name or hash
3. **Blacklist → Whitelist conversion flow** with pricing

## Phase 6: Launch Prep (Week 6)
1. **SEO optimization** for all Mana/Shield pages
2. **Changelog + docs updates**
3. **Public API documentation**
4. **Security scan + hardening**

---

## Key Metrics
| Metric | Target (Phase 1) | Target (Phase 3) |
|--------|-------------------|-------------------|
| Registry entries | 100 | 5,000 |
| Lookup API calls/day | 500 | 50,000 |
| Shield page conversions | 10% | 15% |
| Whitelist upgrades | 0 | 50 |

---

*© CMPSBL® — PromptFluid™ · 2026*
