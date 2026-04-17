# Layer Inventory → Ascension v2 Auto-Feed (v2 — In-Flow Toggle Model)

> **Week 1 status:** ✅ Shipped — 13 layers seeded, store cards live with unique imagery.
> **Week 2 status:** 📋 PENDING APPROVAL — this plan.

---

## Decisions (locked from chat)

| Topic | Decision |
|---|---|
| **Naming** | DB keeps `kind` enum, **UI says "LAYER" everywhere**. No "SUITE" chip. |
| **Flow model** | **In-flow toggles** — purchased Layers appear inside the existing `V2EnhanceStep` Layer list, pre-checked, with an **OWNED** badge instead of a tier-lock. |
| **Payments** | Wire **Stripe checkout now**. One-time payments. Re-price all 13 to **$19–$99** for adoption. |
| **Tier interaction** | **Owned = unlocked forever.** No tier gating on purchased Layers. One-time = lifetime grant. |

---

## 1 · Re-pricing (premium → adoption)

| Slug | Old | **New** | Tier |
|---|---|---|---|
| llm-defense-suite | $249 | **$99** | Apex |
| robotics-control-suite | $199 | **$89** | Apex |
| quantum-simulation-suite | $199 | **$89** | Mythic |
| cyber-perimeter-suite | $249 | **$79** | Mythic |
| agency-orchestration-suite | $179 | **$69** | Mythic |
| topological-security-synthesizer | $129 | **$49** | Mythic |
| holographic-integration-guardian | $129 | **$49** | Mythic |
| synthetic-contracts-navigator | $129 | **$39** | Mythic |
| sentinel-evolution-sequencer | $99 | **$39** | Mythic |
| layered-observability-enforcer | $99 | **$39** | Mythic |
| self-healing-learning-scanner | $129 | **$29** | Mythic |
| kinetic-synthesis-controller | $79 | **$29** | Relic |
| resilient-evolution-fabric | $79 | **$19** | Relic |

Range: **$19 – $99**. `original_value_cents` retained at original to keep the strikethrough anchor on cards.

---

## 2 · Database (one migration)

**New table — `user_layer_purchases`** (lifetime grants, idempotent):
```sql
CREATE TABLE public.user_layer_purchases (
  id                uuid PK default gen_random_uuid(),
  user_id           uuid NOT NULL,
  inventory_id      uuid NOT NULL REFERENCES marketplace_inventory(id),
  slug              text NOT NULL,
  stripe_session_id text,
  amount_cents      integer NOT NULL,
  status            text NOT NULL DEFAULT 'paid',
  purchased_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, inventory_id)
);
```
RLS: users see/insert only their own; service role full access (webhook/edge fn).

**Helper:** `has_layer(_user_id uuid, _slug text) returns boolean` (security definer, search_path=public).

**Re-price:** UPDATE 13 rows via insert tool (not migration).

**Backfill:** `stripe_product_id` / `stripe_price_id` after Stripe products are created.

---

## 3 · Stripe wiring

1. `recommend_payment_provider` → confirm Stripe (digital, no MOR needed at this scale).
2. `enable_stripe_payments` (creates test env).
3. Batch `stripe--create_stripe_product_and_price` × 13 (USD, no `recurring_interval`).
4. Save returned `product_id` + `price_id` back to `marketplace_inventory`.
5. Edge function **`create-layer-checkout`**: takes `{ slug }`, looks up price_id, returns Stripe Checkout URL. `mode: "payment"`, success → `/store/owned?session_id=…`, cancel → `/store`.
6. Edge function **`verify-layer-purchase`**: takes `{ session_id }`, confirms `payment_status === 'paid'`, idempotent insert into `user_layer_purchases` (uses service role). Called by `/store/owned` page — no webhook per house rules.

---

## 4 · UI changes

### A. `LayerCard.tsx`
- Drop "SUITE" chip → always show **"LAYER"**.
- Back-side **Acquire** button → calls `create-layer-checkout` (replaces `navigate(/marketplace/...)`).
- If owned: button becomes **"✓ OWNED · Use in Ascension"** (links to `/ascension-v2`).

### B. New hook `useOwnedLayers()`
- Selects `user_layer_purchases` ⨝ `marketplace_inventory` for current user.
- Returns `{ ownedSlugs: Set<string>, ownedLayers: LayerInventoryRow[], loading }`.
- Used by `LayerCard` (own-state badge) and `V2EnhanceStep` (auto-feed).

### C. `V2EnhanceStep.tsx` — the in-flow toggle
- Existing CMPSBL Layer list **stays as-is** (tiered, locked behind subscription).
- **New section above it: "Your Owned Layers"** — only renders when `ownedLayers.length > 0`.
  - Same row shape as CMPSBL Layers, but:
    - **OWNED** badge instead of tier badge
    - **Pre-checked** (added to `selectedLayers` Set on mount)
    - **Never locked**
  - Pillar icon + title + truncated description.
- Owned-Layer slugs piped through `onComplete(enhanced, selectedLayerIds, selectedOwnedSlugs)`.

### D. `/store/owned` landing
- Reads `?session_id=…`, calls `verify-layer-purchase`, shows confirmation + **"Use it now in Ascension"** → `/ascension-v2`.

### E. Copy cleanup
- `LayerInventory.tsx` header: drop "Suite" framing → "Specialty Layers · own them, attach them, ship them."

---

## 5 · Downstream wiring (Layer 2 export)

`V2ResultsStep` already accepts `selectedLayerIds: string[]`. We:
- Resolve owned-Layer slugs → their `primitive_chain` / `suite_capabilities`.
- Fan those primitives into the same export pipeline that handles Crown Jewel layers.
- Add a `marketplace-layers` source in the export manifest so the receipt shows *"Powered by your owned Layers: X, Y, Z"*.

Mechanical fan-out — no new pipeline.

---

## 6 · Files

**New**
- `supabase/migrations/<ts>_user_layer_purchases.sql`
- `supabase/functions/create-layer-checkout/index.ts`
- `supabase/functions/verify-layer-purchase/index.ts`
- `src/hooks/useOwnedLayers.ts`
- `src/pages/StoreOwned.tsx`

**Edited**
- `src/components/store/LayerCard.tsx` — drop SUITE chip, owned-state, checkout
- `src/components/store/LayerInventory.tsx` — header copy
- `src/components/ascension-v2/V2EnhanceStep.tsx` — "Your Owned Layers" section
- `src/components/ascension-v2/V2ProcessingStep.tsx` — accept owned slugs
- `src/components/ascension-v2/V2ResultsStep.tsx` — manifest entry
- `src/pages/AscensionV2.tsx` — plumb new prop
- `src/lib/store/layer-categories.ts` — drop suite-specific labels

---

## 7 · Execution order (when approved)

1. Migration: `user_layer_purchases` + `has_layer()` + RLS.
2. Re-price 13 rows.
3. `recommend_payment_provider` → `enable_stripe_payments` → batch create 13 products → backfill IDs.
4. Edge functions: `create-layer-checkout`, `verify-layer-purchase`.
5. `useOwnedLayers` hook + LayerCard refactor + `/store/owned` page.
6. Ascension wiring: V2EnhanceStep section + V2ProcessingStep/V2ResultsStep plumbing.
7. Smoke test in Stripe test mode, update changelog.

---

## ✅ Approve to execute?

- **"go"** — execute steps 1–7 in order.
- **"go but skip step N"** — partial execution.
- Reply with edits to change pricing, table shape, section placement, or scope.
