# The Factory — Restructure Roadmap

**Version:** 1.0  
**Status:** PROPOSED  
**Author:** Kenneth E. Sweet Jr.  
**Date:** April 2, 2026

---

## Executive Summary

Restructure the CMPSBL site navigation and product presentation around "The Factory" — a unified discovery-to-protection pipeline where **Memory Stream** discovers latent capabilities and **Ascension** hardens them into sellable products. All existing pages remain intact at their current URLs for instant reversal.

---

## The Factory Model

```
Code Input → Memory Stream (Discovery/Value Assessment) → Ascension (Hardening/Protection) → Sellable Product Output
```

### Core Insight

The substrate implements a self-reinforcing flywheel:

1. **Memory Stream** (Active Discovery) — analyzes input code against the 40 Primitives, discovers latent capabilities, scores them via CJPI, and crystallizes high-value combinations.

2. **Ascension** (Passive Protection) — wraps discovered capabilities in governance, observability, IP protection, and portability. Every auxiliary primitive that passes through Ascension leaves a blueprint behind.

3. **Admin Vault Flywheel** — production-hardened primitives extracted during Ascension are stored in the admin layer and used for:
   - **Seeding Memory Stream** with real-world code patterns beyond the original 40 Primitives
   - **Upgrading internal Ascension primitives** when customer-built patterns prove superior
   - **Assembling specialty substrates** (e.g., Fintech, Healthcare) from curated collections

4. **SHADOW Hot-Swap** — zero-downtime primitive replacement. When a primitive is removed for upgrade, SHADOW holds its place until the replacement arrives.

5. **BRAIN Learning** — BRAIN already ingests every interaction. The stored blueprints serve as inspiration for new primitives (e.g., "Build a PRISM primitive based on what made that combo powerful").

### Key Principle

No customer code is ever copied or redistributed. CMPSBL observes **patterns and behavioral signatures** — abstracted architectural insights, not source code. This is covered in ToS §15 (Continuous Learning & Primitive Reuse).

---

## Navigation Restructure

### Current Navigation
```
Home(/explore) · Products · Pricing · Docs · Try · Login
```

### Proposed Navigation
```
Home · Memory Stream · Ascension · Pricing · Docs · Login
```

### Page Strategy

| Route | Action | Purpose |
|-------|--------|---------|
| `/` (new Home) | **CREATE** | Factory-focused landing: dual hero (Memory Stream + Ascension), flywheel visualization |
| `/memory-stream` | **CREATE** | Dedicated Memory Stream product page with live discovery feed |
| `/ascension` | **CREATE** | Dedicated Ascension product page with transformation pipeline visualization |
| `/pricing` | **KEEP** | Update to emphasize Factory tiers (Builder → Creator → Architect) |
| `/docs` | **KEEP** | Unchanged |
| `/explore` | **KEEP (hidden)** | Remove from nav but keep at URL. This is the emergency reversal home page. |
| `/products` | **KEEP (hidden)** | Remove from nav, keep at URL |
| `/topology` | **KEEP (hidden)** | Remove from nav, keep at URL |
| `/substrate/*` | **KEEP (hidden)** | All substrate detail pages stay at their URLs |
| `/npm-ecosystem` | **KEEP (hidden)** | Remove from nav, keep at URL |
| `/try` | **EVALUATE** | May redirect to Memory Stream trial or keep as-is |

### Critical Rule
**No page is deleted.** Every existing URL continues to work. Only the navigation menu changes.

---

## Implementation Phases

### Phase 1 — Foundation (No Breaking Changes)
1. Add ToS §15 (Continuous Learning & Primitive Reuse) ✅
2. Create `/memory-stream` product page
3. Create `/ascension` product page
4. Create new Factory-focused home page at `/` or `/factory`

### Phase 2 — Navigation Swap
1. Update `PublicNav` to new menu structure
2. Move `/explore` link out of main nav (keep URL active)
3. Move substrate detail pages out of main nav (keep URLs active)
4. Update footer links to include both new and legacy paths

### Phase 3 — Flywheel Visualization
1. Build interactive Factory pipeline visualization on new home page
2. Show live Memory Stream → Ascension flow
3. Display admin vault statistics (abstracted, no sensitive data)
4. Integrate CJPI scoring display

### Phase 4 — Content Refinement
1. Write Memory Stream product copy emphasizing autonomous discovery
2. Write Ascension product copy emphasizing code evolution + IP protection
3. Update pricing page to align with Factory narrative
4. Update SEO metadata, sitemap, and LLMs.txt

---

## Emergency Reversal Plan

### Trigger Conditions
- Discovery that npm ecosystem visibility was critical for growth
- User feedback indicating confusion with new navigation
- Kenneth's discretion at any point

### Reversal Steps (< 5 minutes)

1. **Restore `PublicNav`** — revert to the saved pre-restructure navigation component
   - The old nav is preserved in git history at the commit before Phase 2
   - Alternatively, keep a `PublicNavLegacy.tsx` component as a hot-swap backup

2. **Re-expose `/explore` as Home** — change the root route back to `/explore`

3. **Re-expose substrate pages in nav** — restore Products dropdown with all substrate links

4. **No data loss** — all pages remain at their URLs throughout the restructure, so reversal is purely a navigation swap

### Safeguards Built In
- **All existing pages stay at their URLs** — nothing is ever deleted
- **Git history preserves every state** — any prior navigation can be restored
- **`PublicNavLegacy.tsx`** — keep a copy of the current nav component as a fallback
- **Feature flag option** — can gate the new nav behind a flag for A/B testing before full rollout

---

## What This Preserves

| Asset | Status |
|-------|--------|
| `/explore` (current home) | ✅ Intact, accessible via direct URL |
| All substrate pages | ✅ Intact at current URLs |
| npm ecosystem page | ✅ Intact at `/npm-ecosystem` |
| Topology visualization | ✅ Intact at `/topology` |
| All primitive detail pages | ✅ Intact at `/substrate/*` |
| SEO juice on existing URLs | ✅ No redirects, no broken links |
| Investor showcase | ✅ Unchanged behind PIN gate |

## What This Adds

| Asset | Purpose |
|-------|---------|
| Factory home page | Dual-hero Memory Stream + Ascension |
| `/memory-stream` | Dedicated product page |
| `/ascension` | Dedicated product page |
| ToS §15 | Legal coverage for learning flywheel |
| Admin vault documentation | Internal reference for flywheel operations |
| Reversal plan | Instant rollback capability |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| npm visibility loss | Emergency reversal plan; keep `/npm-ecosystem` SEO-indexed |
| User confusion | Gradual rollout; legacy URLs always work |
| SEO disruption | No URLs change; add new pages, never remove |
| Scope creep | Phases are independent; can stop after any phase |

---

## Success Metrics

1. New visitor conversion to Memory Stream trial increases
2. Ascension upload volume increases
3. Time-to-understanding decreases (measured by session analytics)
4. No increase in 404 errors or broken link reports
5. Admin vault primitive count grows with each Ascension interaction

---

© 2025–2026 CMPSBL®. Internal Use Only.
