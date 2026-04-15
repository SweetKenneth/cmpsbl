# Mana as Distribution Channel — Architecture Specification

**Classification:** Internal — Strategic Architecture
**Patents:** U.S. App. No. 64/029,678 (Ascension) · U.S. App. No. 64/031,637 (Mana)
**Version:** 1.0.0
**Date:** April 15, 2026

---

## Executive Summary

Mana becomes the **distribution channel** for all substrate-produced software.
Instead of selling standalone products that lack context, every item in the
Showroom, Store, and Crown Jewel vault can be **attached to user code** during
the Ascension pipeline — giving substrate-produced software a concrete use case
as capability add-ons.

## Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASCENSION V2 PIPELINE                        │
│                                                                 │
│  Step 1: UPLOAD                                                 │
│  ├─ User drops source files / pastes code                       │
│  ├─ Fingerprint computed (FNV-1a structural hash)               │
│  └─ Candidate registered in artifact_registry                   │
│                                                                 │
│  Step 2: ENHANCE (Optional — Skippable)                         │
│  ├─ Mode A: SDK-Built Software                                  │
│  │   └─ Developer uploads their own @cmpsbl/sdk-built package   │
│  │      that integrates with other software via Mana (no API)   │
│  ├─ Mode B: Substrate Store Add-Ons (Future)                    │
│  │   └─ Browse purchasable capabilities from:                   │
│  │      • Crown Jewels (50+ substrate-native algorithms)        │
│  │      • Memory Stream discoveries (COMPILER-built)            │
│  │      • Showroom products (curated substrate output)          │
│  │   └─ Selected items are Mana-wrapped and merged with         │
│  │      user code BEFORE Ascension collision                    │
│  └─ Skip → proceeds with raw user code only                    │
│                                                                 │
│  Step 3: ANALYZE (Automated)                                    │
│  ├─ 40-Primitive collision matrix runs against:                 │
│  │   USER CODE + any Mana-attached enhancements                 │
│  ├─ Dedup engine collapses to top 4-7 unique capabilities       │
│  ├─ Auto-lock (no manual step)                                  │
│  └─ Audit chain records all operations                          │
│                                                                 │
│  Step 4: RESULTS                                                │
│  ├─ Single wrapped cmpsbl.ts export                             │
│  ├─ Audit chain integrity badge (SHA-256)                       │
│  ├─ Capability summary                                          │
│  └─ Post-Results Upsell: "Enhance Further"                     │
│     └─ Surface purchasable Store items relevant to the          │
│        discovered capabilities (future)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Why Step 2 (Before Ascension)

Mana-attached software is merged with user code **before** the 40-Primitive
collision. This means the Ascension engine processes everything together:

- User's legacy code
- Mana-attached SDK packages
- Substrate Store add-ons

The primitives collide against the **combined** codebase, producing richer
and more accurate capability discovery. An add-on that provides, say,
DEFENSE capabilities will surface as a capability in the user's ascended
output — not as a separate download.

## Why Post-Results Upsell (After Ascension)

After free Ascension completes, users see what capabilities their code
has. This is the ideal moment to surface: "Your code scored 72 on DEFENSE.
Want to enhance it?" — linking directly to a Store item that can be
purchased and attached in a re-run.

## Two Modes of Mana Attachment

### Mode A: SDK-Built Software (Available Now)

Developers build software using `@cmpsbl/sdk` and want it to integrate
with other users' software without requiring an API. The Mana wrapping
enables silent function-boundary attachment:

```
Developer builds package → Uploads to Enhance step →
Mana wraps at function boundaries → Merged with host code →
Ascension processes combined codebase → Single output file
```

This is analogous to Stripe's payment SDK: developers build a custom
integration that plugs into the broader ecosystem. The difference is
Mana operates at the code level, not the API level.

### Mode B: Substrate Store Add-Ons (Future — Docs Only)

Software produced by the substrate itself becomes purchasable
enhancement capability:

| Source | Description | Example |
|--------|-------------|---------|
| Crown Jewels | 50+ highest-CJPI substrate algorithms | DEFENSE-class encryption primitive |
| Memory Stream | COMPILER-built from autonomous discovery | Auto-generated caching optimizer |
| COMPILER Software Suites | Full multi-capability packages built by COMPILER | Enterprise Security Suite (DEFENSE+GOVERNANCE+AUDIT) |
| Showroom | MERCHANT-curated substrate output | Enterprise audit logger |
| Junkyard | Lower-tier but functional items | Simple rate limiter |
| SDK-Built (Community) | Developer-built packages using @cmpsbl/sdk | Custom domain-specific enhancer |

**Purchase flow (future):**
```
User sees results → "Enhance with DEFENSE Shield" →
Purchase ($29-$249 depending on tier) →
Item Mana-wrapped → Re-run Ascension with enhancement →
New ascended output includes purchased capability
```

## Primitive Roles in the Supply Chain

### ECONOMY — Automatic Pricing Engine

ECONOMY sets prices for all Store add-ons automatically based on:
- **CJPI score** — higher-scoring capabilities command higher prices
- **Tier classification** — Crown Jewels > COMPILER Suites > Showroom > Junkyard
- **Demand signals** — purchase frequency, Ascension gap analysis data
- **Complexity** — chain depth, number of primitives involved
- **Competitive positioning** — no manual price-setting required

ECONOMY ensures the marketplace self-regulates. When COMPILER produces
a new capability, ECONOMY prices it immediately based on its CJPI score
and tier. No human intervention needed for pricing decisions.

### MERCHANT — Curation & Catalog Governance

MERCHANT decides what appears in the Store catalog:
- **Curates COMPILER output** — not everything COMPILER builds is Store-worthy
- **Quality gate** — minimum CJPI threshold for Store listing
- **Suite composition** — groups related capabilities into purchasable bundles
- **Seasonal drops** — manages Showroom rotation and featured items
- **Gap analysis** — identifies missing capabilities and requests COMPILER builds

MERCHANT + ECONOMY work together: MERCHANT decides *what* sells,
ECONOMY decides *at what price*.

### SDK + DREAM + EVOLUTION — Developer Capability Loop

Developers using `@cmpsbl/sdk` have access to substrate primitives
that help them build better packages:

| Primitive | SDK Developer Use |
|-----------|-------------------|
| DREAM | Sub-threshold synthesis — suggests capability combinations the developer hasn't considered |
| EVOLUTION | Self-improvement — SDK packages can evolve their own algorithms over time |
| CORTEX | Runtime orchestration — manages execution context for complex multi-capability packages |
| DEFENSE | Security hardening — automatic vulnerability shielding in SDK-built packages |
| ARCHITECT | Structural analysis — validates that SDK packages are architecturally sound |

This means SDK-built packages that flow into Step 2 aren't just
raw code — they're substrate-enhanced code built with the same
primitives that Ascension uses to analyze them. The substrate
helps developers build better inputs for its own pipeline.

### COMPILER — Autonomous Software Factory

COMPILER takes Memory Stream discoveries and builds them into
production-ready software:

```
Memory Stream discovers capability pattern
    → COMPILER builds standalone package
    → MERCHANT curates into Store catalog
    → ECONOMY prices automatically
    → User purchases in Ascension Step 2
    → Mana wraps and attaches
    → Ascension processes combined codebase
    → User gets enhanced output
```

COMPILER doesn't just build individual capabilities. It builds
**Software Suites** — coherent bundles of related capabilities:
- Security Suite (DEFENSE + GOVERNANCE + AUDIT + SIEVE)
- Intelligence Suite (BRAIN + MEMORY + CORTEX + ORACLE)
- Resilience Suite (FAILSAFE + BEACON + BASTION + WATCHTOWER)

These suites are the premium tier of Store add-ons.

## Complete Ecosystem Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   SUBSTRATE SUPPLY CHAIN                     │
│                                                              │
│  Memory Stream (8hr autonomous)                              │
│       │                                                      │
│       ▼                                                      │
│  COMPILER (builds packages + suites)                         │
│       │                                                      │
│       ▼                                                      │
│  MERCHANT (curates catalog, quality gates)                    │
│       │                                                      │
│       ▼                                                      │
│  ECONOMY (auto-prices by CJPI + tier + demand)               │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────────────┐                                 │
│  │     STORE CATALOG       │                                 │
│  │  Crown Jewels           │                                 │
│  │  COMPILER Suites        │◄──── SDK Devs (DREAM+EVOLUTION) │
│  │  Showroom Items         │                                 │
│  │  Community Packages     │                                 │
│  └───────────┬─────────────┘                                 │
│              │                                               │
│              ▼                                               │
│  ASCENSION Step 2 (Enhance)                                  │
│       │                                                      │
│       ▼                                                      │
│  MANA WRAP → ASCENSION COLLISION → RESULTS                   │
│       │                                                      │
│       ▼                                                      │
│  Richer output → More demand → More discoveries              │
│       │                                                      │
│       └──────────────► Memory Stream (cycle repeats)         │
└─────────────────────────────────────────────────────────────┘
```

## Data Architecture

### Step 2 Storage

Mana-attached files are stored alongside the candidate in `artifact_registry`:

```sql
-- SDK-built attachment
category: 'proprietary-mana-attachment-v2'
tier: 'enhancement'
metadata: {
  attachment_type: 'sdk-built',
  source_package: '@user/their-package',
  mana_wrapped: true,
  pipeline_version: 'v2'
}

-- Store add-on (future)
category: 'proprietary-mana-attachment-v2'
tier: 'store-addon'
metadata: {
  attachment_type: 'store-addon',
  store_item_id: '<uuid>',
  store_item_name: 'DEFENSE Shield',
  purchase_id: '<uuid>',
  mana_wrapped: true,
  pipeline_version: 'v2'
}
```

### Data Isolation

All V2 data uses distinct category prefixes:
- `proprietary-evolution-v2` — uploaded candidate
- `proprietary-mana-attachment-v2` — Mana enhancements
- `proprietary-discovery-v2` — raw discoveries
- `proprietary-ascended-v2` — final locked capabilities

Zero collision with V1 categories.

## Revenue Model Integration

| Tier | What They Get | Price |
|------|---------------|-------|
| Free Ascension | Upload → Analyze → Export (no enhancements) | $0 |
| SDK Enhance | Attach own packages via Mana step | Free (SDK cost) |
| Store Add-On | Single capability from Store | $29–$79 |
| Crown Jewel Add-On | Premium substrate algorithm | $129–$249 |
| Architect Bundle | Full Ascension + all available add-ons | $249/mo |

## Implementation Phases

### Phase 1: Now (This Build)
- [x] Skippable Step 2 UI with SDK upload mode
- [x] Mana wrapping of uploaded enhancement files
- [x] Merge enhancement with host code before Analyze step
- [x] Post-results placeholder for future Store add-ons

### Phase 2: Store Catalog (When COMPILER Has Built Enough)
- [ ] Browse Store items in Step 2
- [ ] Purchase flow (Stripe integration)
- [ ] Mana-wrap purchased items automatically
- [ ] Re-run Ascension with purchased enhancement

### Phase 3: Smart Recommendations (Post-Launch)
- [ ] After Ascension, recommend specific Store items based on
      capability gaps (e.g., low DEFENSE score → suggest DEFENSE add-on)
- [ ] "Your code + this add-on = X% improvement" predictions
- [ ] Subscription model for ongoing enhancements

## ASCII Architecture Diagram

```
                    ┌──────────────┐
                    │  USER CODE   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   UPLOAD     │ Step 1
                    │  Fingerprint │
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │       ENHANCE?          │ Step 2 (Skippable)
              │                         │
              │  ┌─────────────────┐    │
              │  │ SDK-Built Pkg   │◄───┤ Mode A: Developer upload
              │  └────────┬────────┘    │
              │           │             │
              │  ┌────────▼────────┐    │
              │  │ Store Add-On    │◄───┤ Mode B: Purchase (Future)
              │  └────────┬────────┘    │
              └───────────┼─────────────┘
                          │
               ┌──────────▼──────────┐
               │   MANA WRAP         │
               │  Function-boundary  │
               │  attachment         │
               └──────────┬──────────┘
                          │
           ┌──────────────▼──────────────┐
           │       MERGED CODEBASE       │
           │  User code + enhancements   │
           └──────────────┬──────────────┘
                          │
                   ┌──────▼───────┐
                   │   ANALYZE    │ Step 3
                   │  40-Primitive│
                   │  Collision   │
                   │  + Dedup     │
                   │  + Auto-Lock │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │   RESULTS    │ Step 4
                   │  Single File │
                   │  + Upsell    │
                   └──────────────┘
```

## Key Insight

Every product the substrate has ever built or will build now has a
**concrete use case**: enhancing someone's ascended code. The Memory
Stream's autonomous discoveries, the Crown Jewels, the COMPILER's
output — all of it can flow through Mana into Ascension as purchasable
capabilities. This transforms inventory into revenue.

---

© 2025–2026 CMPSBL® — PromptFluid™ · All rights reserved.
U.S. Patent App. No. 64/029,678 · U.S. Patent App. No. 64/031,637
