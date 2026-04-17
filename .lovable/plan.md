# Layer Inventory — Week 1 ✅ SHIPPED

## What shipped (this batch)

### Database
- Added 4 columns to `marketplace_inventory`: `kind`, `pillar`, `origin_vertical`, `suite_capabilities`
- Added 2 partial indexes on `kind` and `pillar` for active rows
- All 23 existing inventory rows untouched (default `kind='template'`)

### Seed (13 new rows, all active)

**5 Specialty Suites (`kind='suite'`, pillar=`suites`)**
| Slug | Tier | Price |
|---|---|---|
| `llm-defense-suite` | Mythic | $249 |
| `cyber-perimeter-suite` | Mythic | $249 |
| `quantum-simulation-suite` | Relic | $199 |
| `robotics-control-suite` | Relic | $199 |
| `agency-orchestration-suite` | Relic | $179 |

**8 Curated Vault Layers (`kind='layer'`)**
| Slug | Pillar | Tier | Price |
|---|---|---|---|
| `self-healing-learning-scanner` | synthesis-evolution | Mythic | $129 |
| `holographic-integration-guardian` | integration-contracts | Mythic | $129 |
| `synthetic-contracts-navigator` | integration-contracts | Mythic | $129 |
| `topological-security-synthesizer` | defense-security | Mythic | $129 |
| `sentinel-evolution-sequencer` | synthesis-evolution | Mythic | $99 |
| `layered-observability-enforcer` | defense-security | Mythic | $99 |
| `kinetic-synthesis-controller` | synthesis-evolution | Relic | $79 |
| `resilient-evolution-fabric` | synthesis-evolution | Relic | $79 |

### UI
- **NEW** `src/lib/store/layer-categories.ts` — pillar metadata, tier color tokens, group helper
- **NEW** `src/components/store/LayerCard.tsx` — single layer/suite card with tier badge, capability chips, price + "View" CTA → `/marketplace/{slug}`
- **NEW** `src/components/store/LayerInventory.tsx` — fetches active rows where `pillar IS NOT NULL`, groups by pillar, renders horizontal snap-scroll rows per category
- **EDIT** `src/pages/Store.tsx`:
  - Removed Plans tab + UpgradeContent import (the standalone `/plans` page stays untouched)
  - Inserted `<LayerInventory />` above the original Agents/Engines deck
  - "Compare Plans" CTA at the bottom now links to `/plans`

## Still open (separate follow-ups)

- **Stripe wiring** — the 13 new layers ship with `stripe_product_id = NULL`. Purchase flow via `marketplace-fulfill` needs Stripe IDs to charge. Two options when ready:
  - (a) batch-create 13 Stripe products + prices, populate IDs
  - (b) you create them in dashboard, I wire the IDs
- **Roadmap doc** (`src/pages/ManaDistributionDoc.tsx`) — not edited this batch; flag for next pass

---

## Original Shield Roadmap (kept for reference)

# CMPSBL® Remapped Roadmap — "Shield First" GTM Strategy

## The Core Thesis
> Ship the antidote before the virus. The shield IS the distribution engine.

(See git history for the full Phase 0–4 plan if needed.)

*© CMPSBL® — PromptFluid™ · 2026*
