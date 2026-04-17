# Layer Inventory → Ascension v2 Auto-Feed (v3 — Recurring + Real Layers)

> **Week 1:** ✅ Shipped — 13 CJ store cards live.
> **Week 2:** 📋 PENDING APPROVAL — this plan (supersedes v2).

---

## Locked decisions

| Topic | Decision |
|---|---|
| **Naming** | DB keeps `kind` enum, **UI says "LAYER" everywhere**. No "SUITE" chip. |
| **Flow model** | **In-flow toggles** — owned Layers appear inside `V2EnhanceStep` Layer list, pre-checked, **OWNED** badge, never tier-locked. |
| **Conversion scope** | **Full Layer definitions for all 13 CJs + register in polyglot emitters** (34 native + 53 bridge). Crown Jewels become real, exportable Ascension Layers. |
| **Billing** | **Annual recurring** at $19–$99/yr. Stripe `recurring_interval='year'`, `mode='subscription'`. |
| **Governor access** | **Server-side override in `has_layer()`** — Governor (kennethsweet214@gmail.com) returns true for every slug, forever, including future Layers. No rows inserted. |
| **Tier-gating** | **Owned = unlocked, full stop.** Buyer bypasses all tier checks. Existing CMPSBL in-flow Layers stay tiered. Sub lapse → re-locked (recurring model). |

---

## 1 · Crown Jewel → Layer conversion (FIRST, before anything else)

For each of the 13 CJs (llm-defense-suite, robotics-control-suite, quantum-simulation-suite, cyber-perimeter-suite, agency-orchestration-suite, topological-security-synthesizer, holographic-integration-guardian, synthetic-contracts-navigator, sentinel-evolution-sequencer, layered-observability-enforcer, self-healing-learning-scanner, kinetic-synthesis-controller, resilient-evolution-fabric):

**Per-Layer artifact** (`src/lib/layers/inventory/<slug>.layer.ts`):
```ts
export const <slug>Layer: CmpsblLayerDefinition = {
  id: '<slug>',
  pillar: '<pillar>',
  primitive_chain: [...],   // from existing CJ metadata
  capabilities: [...],      // from suite_capabilities
  signal_hooks: { onAttach, onEmit, onDetach },
  polyglot_targets: ALL_NATIVE | BRIDGE,
};
```

**Registration:**
- Add to `src/lib/layers/registry.ts` so `V2EnhanceStep` discovers them via the same path as existing in-flow Layers.
- Wire into `src/lib/ascension/polyglot/emitters/<lang>/inventory-layers.ts` for all 34 native emitters; bridge layers auto-cover the other 53.
- Add `marketplace-inventory` source tag to export manifest so receipts list `"Powered by your owned Layers: X, Y, Z"`.

**Verification:** smoke-export each Layer in TS / Python / Rust / Go / Java / C# / Verilog (representative slice) before moving to step 2.

---

## 2 · Database (one migration)

```sql
CREATE TABLE public.user_layer_subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL,
  inventory_id             uuid NOT NULL REFERENCES marketplace_inventory(id),
  slug                     text NOT NULL,
  stripe_customer_id       text,
  stripe_subscription_id   text,
  stripe_price_id          text,
  amount_cents             integer NOT NULL,
  status                   text NOT NULL DEFAULT 'active',  -- active|past_due|canceled
  current_period_end       timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, inventory_id)
);
```

RLS: users see/manage only their own; service role full.

**`has_layer(_user_id uuid, _slug text)` (security definer, search_path=public):**
```sql
-- Governor override: full access forever
SELECT EXISTS (
  SELECT 1 FROM auth.users u
  WHERE u.id = _user_id AND u.email = 'kennethsweet214@gmail.com'
)
OR EXISTS (
  SELECT 1 FROM public.user_layer_subscriptions
  WHERE user_id = _user_id AND slug = _slug AND status = 'active'
);
```

---

## 3 · Stripe wiring (annual subscriptions)

1. `recommend_payment_provider` → confirm Stripe.
2. `enable_stripe_payments`.
3. Batch `stripe--create_stripe_product_and_price` × 13 with `recurring_interval: 'year'`, USD, prices below.
4. Backfill `stripe_product_id` + `stripe_price_id` into `marketplace_inventory`.
5. Edge fn **`create-layer-checkout`**: `{ slug }` → `mode: 'subscription'`, success → `/store/owned?session_id=…`, cancel → `/store`.
6. Edge fn **`verify-layer-purchase`**: `{ session_id }` → confirms `payment_status === 'paid'` + sub active → idempotent insert into `user_layer_subscriptions`.
7. Edge fn **`check-layer-subscriptions`**: refreshes status (mirrors `check-subscription` pattern).

### Annual pricing ($/yr)

| Slug | $/yr |
|---|---|
| llm-defense-suite | $99 |
| robotics-control-suite | $89 |
| quantum-simulation-suite | $89 |
| cyber-perimeter-suite | $79 |
| agency-orchestration-suite | $69 |
| topological-security-synthesizer | $49 |
| holographic-integration-guardian | $49 |
| synthetic-contracts-navigator | $39 |
| sentinel-evolution-sequencer | $39 |
| layered-observability-enforcer | $39 |
| self-healing-learning-scanner | $29 |
| kinetic-synthesis-controller | $29 |
| resilient-evolution-fabric | $19 |

`original_value_cents` retained for strikethrough.

---

## 4 · UI changes

- **`LayerCard.tsx`** — drop "SUITE" chip → "LAYER". Acquire button → `create-layer-checkout`. Owned → "✓ OWNED · Use in Ascension" → `/ascension-v2`. Show "$X/yr" not "$X".
- **`useOwnedLayers()` hook** — selects `user_layer_subscriptions` ⨝ `marketplace_inventory` where status='active'. Returns `{ ownedSlugs, ownedLayers, loading }`. Includes Governor override resolution.
- **`V2EnhanceStep.tsx`** — new "Your Owned Layers" section above existing CMPSBL Layer list. Owned items: OWNED badge, pre-checked, never locked. Pillar icon + title + truncated description. Pipes selected owned slugs into `onComplete(enhanced, selectedLayerIds, selectedOwnedSlugs)`.
- **`/store/owned`** — reads `?session_id=…`, calls `verify-layer-purchase`, confirms + CTA to `/ascension-v2`.
- **Copy** — `LayerInventory.tsx` header → "Specialty Layers · subscribe, attach, ship."

---

## 5 · Downstream wiring (Layer 2 export)

`V2ResultsStep` resolves owned-Layer slugs → their registered `CmpsblLayerDefinition` → fans through the same polyglot emitter pipeline as in-flow Layers. Manifest entry: `marketplace-layers: [...]`.

Mechanical fan-out — no new pipeline (polyglot engine already generic).

---

## 6 · Files

**New**
- `src/lib/layers/inventory/<13 slugs>.layer.ts`
- `src/lib/layers/registry.ts` (or extend existing)
- `src/lib/ascension/polyglot/emitters/<lang>/inventory-layers.ts` (per native lang)
- `supabase/migrations/<ts>_user_layer_subscriptions.sql`
- `supabase/functions/create-layer-checkout/index.ts`
- `supabase/functions/verify-layer-purchase/index.ts`
- `supabase/functions/check-layer-subscriptions/index.ts`
- `src/hooks/useOwnedLayers.ts`
- `src/pages/StoreOwned.tsx`

**Edited**
- `src/components/store/LayerCard.tsx`
- `src/components/store/LayerInventory.tsx`
- `src/components/ascension-v2/V2EnhanceStep.tsx`
- `src/components/ascension-v2/V2ProcessingStep.tsx`
- `src/components/ascension-v2/V2ResultsStep.tsx`
- `src/pages/AscensionV2.tsx`
- `src/lib/store/layer-categories.ts`

---

## 7 · Execution order (Layers FIRST, then payments, then UI)

1. **Layers**: build 13 `CmpsblLayerDefinition` files + registry + polyglot emitter registration. Smoke-export each across representative language slice.
2. **Migration**: `user_layer_subscriptions` + `has_layer()` with Governor override + RLS.
3. **Re-price**: update 13 `marketplace_inventory` rows to new annual cents.
4. **Stripe**: `recommend_payment_provider` → `enable_stripe_payments` → batch create 13 annual products → backfill IDs.
5. **Edge functions**: `create-layer-checkout`, `verify-layer-purchase`, `check-layer-subscriptions`.
6. **UI**: `useOwnedLayers` + `LayerCard` refactor + `/store/owned`.
7. **Ascension wiring**: `V2EnhanceStep` "Your Owned Layers" section + V2Processing/Results plumbing.
8. Smoke test in Stripe test mode + verify Governor override + update changelog.

---

## ✅ Approve to execute?

- **"go"** — execute steps 1–8 in order.
- **"go but skip step N"** — partial.
- Reply with edits to change any locked decision.
