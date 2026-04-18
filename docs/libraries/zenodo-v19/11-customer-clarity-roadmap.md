# Customer Clarity Roadmap — v19

> The honest, focused product surface for CMPSBL®.
> One product. One story. Everything else = internal IP.
> © CMPSBL® · PromptFluid™ · Kenneth E. Sweet Jr.

---

## North Star

**Ascension v2 is the product.** Everything else is either:
1. A **free developer on-ramp** (CLI, SDK) that funnels into Ascension
2. **Internal IP** (verticals, discovery, primitives, memory stream) that powers what customers receive
3. **Add-ons** (Store) that extend Ascension

If a thing doesn't fit one of those three buckets, it shouldn't be customer-facing.

---

## What Customers Actually Get

### Tier 1 — Free
- **Ascension v2** (rate-limited) — wrap their code with Lex + Mana
- **@cmpsbl/cli** — full developer terminal
- **@cmpsbl/sdk** — build your own layers (coming soon)
- **DECODE** — the unified interface/agent
- **Crown Jewel system bonuses** — bundled into CLI/SDK standard
- **CMPSBL Radio** — usage-based access
- **Browse the Store** — see what layers are available

### Tier 2 — Paid (single paid tier)
- **Everything in Free**, no rate limits
- **Full Ascension v2** — all 9 languages, all SDK layer attachment
- **DREAM synthesis** — surfaced as a product capability tied to Ascension
- **Priority queue** for restorations
- **Store credit / discounts** on add-on layers
- **CMPSBL Radio** — unlimited

### Tier 3 — Enterprise (optional, kept quiet until ready)
- Custom contracts only. Not actively marketed until offering is real.
- *Decision: may collapse to just Free + Paid for v19 launch.*

---

## What Goes Away (Public Surface)

| Surface | Action | Reason |
|---|---|---|
| `/marketplace` subdomain | **Kill** — redirect to `/store` | Fragmentation. One commerce surface. |
| Memory Packs (in `/store`) | **Remove** | Roll into CLI/SDK standard capabilities |
| Crown Jewel page on `/plans` | **Remove from plans** | Becomes silent CLI/SDK bonus for all users |
| Agencies (public marketing) | **Hide / archive** | World is swarmed with agents. Not the differentiator. |
| Vertical home pages | **Stay gated** (already are) | Internal IP factories only |
| `/tiers` route | **Rename to `/plans`** | Clearer language |
| 4-tier pricing (Builder/Studio/Creator/Architect) | **Collapse to Free + Paid** (+ Enterprise optional) | Decision paralysis kills conversion |

---

## What Becomes Internal Quiet IP

These are the **factory** — not the storefront. Customers benefit from output, never see internals.

- **Memory Stream** (8h autonomous discovery loop) — internal
- **Discovery Engine** (159-primitive federated pool, 9 vertical domains) — internal
- **All 12 verticals** (Cyber, Robotics, Fintech, Gaming, Health, Media, Quantum, LLM, Education, Marketplace-internal, Agency, PromptFluid) — internal, gated
- **All 40 primitives EXCEPT DECODE** — internal
- **Compiler / Merchant pipeline** — internal mechanics, surfaced only as Store inventory
- **CJPI scoring · Lex priorities · FNV salts · DREAM synthesis weights** — internal (already excluded from Zenodo v19 per IP policy)

**Why this works:** the moat is *what comes out* of these systems, not the systems themselves. Telling the world how the factory works invites copying. Showing them the products doesn't.

---

## /store — The Single Commerce Surface

`/store` sells exactly **three things**. Nothing else.

### 1. Layers
- Crown Jewel + SDK-built layers for Ascension v2
- Purchased layers attach to the user's account
- Auto-merge into Layer 2 during Ascension export (Step 2 — Enhance)
- *Primary commerce loop — the everyday purchase.*

### 2. Meta Engines
- Premium standalone engines (output of internal Compiler graduating Memory Stream discoveries)
- Work in CLI, SDK, and standalone
- Higher price point, higher capability
- Surfaced as completed products, never as pipeline mechanics

### 3. Meta Agents
- Premium agent-class add-ons (CMPSBL Cognitives, not generic agents)
- Work in CLI, SDK, and standalone
- The moat — distinct from the saturated agent market because they ride the substrate

**Removed from Store:** Memory Packs (folded into CLI/SDK standard), Engines/Software Suites as a separate section (collapsed into Meta Engines), any vertical-specific SKUs.

---

## DREAM — Tied to Ascension

DREAM stops being a vague engine reference and becomes a **named capability** of paid Ascension:
- "Ascension Pro includes DREAM synthesis: algorithmic sub-threshold pattern surfacing during restoration"
- No standalone DREAM page, no separate SKU
- Lives inside the Ascension product description

---

## CMPSBL Radio

- **Free tier**: usage-limited
- **Paid tier**: unlimited
- Stays as ambient surface — not a primary product, not killed

---

## Execution Phases

### Phase 1 — Surgical text + nav cleanup (low risk)
1. `/tiers` → `/plans` (route + nav)
2. Collapse pricing UI to Free + Paid (Enterprise as small footer link)
3. Remove Memory Packs section from `/store`
4. Remove Crown Jewel section from `/plans`
5. Hide Agency vertical from public marketing nav
6. `/marketplace` subdomain → 301 redirect to `/store`

### Phase 2 — Store restructure
1. `/store` rebuilt with 3 sections: Layers · Engines/Suites · Meta Engines
2. Wire purchased layers → Ascension Step 2 selection (already partially done)
3. Compiler output pipeline → Engines section

### Phase 3 — Ascension as flagship
1. Homepage hero stays as-is (already correct)
2. `/ascension-v2` becomes the canonical product page
3. DREAM described as a paid Ascension feature
4. SDK "build your own layer" coming-soon banner

### Phase 4 — Internal IP lockdown
1. Verify all vertical pages stay behind `?1952=cmpsbl + PIN` gate
2. Memory Stream surface = founder-only (Foundry)
3. Audit any public reference to discovery engine internals → remove

---

## Why This Wins

- **One answer to "what do I buy?"** → Ascension v2 (free or paid) + optional Store layers
- **One answer to "why should I trust this?"** → patents filed, layers are real, CLI/SDK prove it works
- **Devs who laughed get a free CLI** that demonstrates the substrate is real
- **The IP stays protected** — verticals, primitives, discovery all internal
- **No agency noise** — you're not competing in a saturated market
- **Compounding moat** — every internal vertical run feeds Store inventory without exposing the machine

---

## Non-Negotiables

- Homepage hero structure: **untouched** (text only, already done)
- Ascension pipeline phase order: **immutable**
- Vertical dual-gate: **preserved**
- Patent boundary preserved: Ascension (Patent #1) · Mana (Patent #2)
- Terminology: Cognitives ≠ Agents · INCLUSIVE ≠ IMMUNITY · EVOLUTION (not MODERNIZER)
- No Lovable AI references — NEXUS only
- Real data only, no mocks, no hardcoded metrics

---

*© CMPSBL® · PromptFluid™ · 2026 · v19*
