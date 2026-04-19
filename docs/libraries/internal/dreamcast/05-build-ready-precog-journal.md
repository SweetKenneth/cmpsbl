# 05 — Build-Ready Spec: Precognitive Journal (codename AHEAD)

**Library:** Dreamcast · **Classification:** 🔒 Governor Eyes Only

> **How to use this doc:** Hand this entire file to the AI in any project with CMPSBL substrate access. Say: *"Implement the spec. Check off items as you complete them."*

---

## Product

**Name:** Ahead
**Tagline:** *A journal that knows what you're about to decide before you do.*
**Positioning:** Flagship Precognitive AI demo. Lowest-liability, highest-virality, cleanest-screenshot product in the Dreamcast family.
**Primary user:** Founders, knowledge workers, journalers.
**Pricing:** $19/mo consumer, $99/mo founder tier (multi-decision tracking).

---

## Architecture

```
┌─ User journals ─┐   ┌─ Sub-threshold ─┐   ┌─ DREAM ─┐   ┌─ ORACLE ─┐   ┌─ Forecast ─┐
│ free-text +     │──►│ capture (MEMORY) │──►│resonance│──►│Bayesian/MC│──►│ panel +    │
│ decision frames │   │                  │   │vectors  │   │ prediction│   │ counter-   │
└─────────────────┘   └──────────────────┘   └─────────┘   └───────────┘   │ factual    │
                                                                            └────────────┘
                                                                                  │
                                                              AUDIT receipt ◄─────┘
```

---

## Build Checklist

### Phase 1 — Foundation
- [ ] Vite + React + Tailwind + shadcn, semantic tokens only
- [ ] Magic-link auth (Lovable Cloud)
- [ ] Schema: `ahead_entries`, `ahead_decisions`, `ahead_subthreshold`, `ahead_forecasts`, `ahead_receipts`, `ahead_outcomes` (RLS user-scoped)
- [ ] Federation import of DREAM, ORACLE, AUDIT via substrate bridge

### Phase 2 — Journal Surface
- [ ] Distraction-free journal editor (Notion-quality, not Markdown hell)
- [ ] "Frame a decision" UX: user names a decision, optional 2-4 options, optional deadline
- [ ] Sub-threshold capture: keystroke dwell, retract pairs, idle-on-option dwell
- [ ] Auto-save every keystroke to local IndexedDB, debounced sync to cloud

### Phase 3 — Reflection (DREAM)
- [ ] On entry-save: call DREAM resonance for active decision frames
- [ ] Render top 3 grazed topics with evidence pointers
- [ ] Template phrase bank for reflection (versioned JSON)

### Phase 4 — Forecast (ORACLE)
- [ ] On decision-frame open: call ORACLE with resonance vectors as features
- [ ] Render forecast: `point_estimate%` chance of `option`, within `horizon_days` days
- [ ] Render counterfactual: "if you stop circling X, the forecast flips to Y"
- [ ] Render confidence interval visually (sparkline, not percentage soup)

### Phase 5 — Outcome Loop
- [ ] When deadline passes (or user marks decided): capture actual outcome
- [ ] Show user the calibration history: "Ahead's forecasts have been right 71% of the time for you"
- [ ] **This calibration is the screenshot moment.** Make it shareable as an image.

### Phase 6 — Receipt & Trust
- [ ] AUDIT receipt on every forecast
- [ ] Public-share toggle per forecast (creates signed snapshot URL)
- [ ] Export-everything button (JSON + PDF + receipts bundle)

### Phase 7 — Founder Tier
- [ ] Multi-decision dashboard: track 10+ open decisions in parallel
- [ ] Themes-across-decisions view (DREAM cross-resonance)
- [ ] CSV export for portfolio tracking
- [ ] Stripe: $19 consumer, $99 founder, annual discount 2 months free

### Phase 8 — Safety
- [ ] CONSCIENCE hard-stops on self-harm/relationship-violence keywords
- [ ] No forecasts for `target ∈ {self_harm, suicide}` — those route to Vigil/Mirror
- [ ] Forecast horizon hard-capped at 30 days (longer = forensic mode, future product)

### Phase 9 — Ship
- [ ] SEO + sitemap + robots + llms.txt + canonical
- [ ] PostHog analytics
- [ ] Mobile-first QA (440x664)
- [ ] Publish to `ahead.cmpsbl.com`

---

## The Killer Feature

After 14 days of journaling, the user sees:

> "Ahead has made **23 forecasts** about your decisions. **17 came true** (74%). Your top grazed-but-uncommitted topic this month was **'leaving the consulting job.'** You are 8 days away from the predicted decision window."

That paragraph is rendered from a template. There's no LLM. **The user will screenshot this and post it.** That is the entire growth strategy.

---

## Non-Negotiables

1. Zero generative AI in reflection or forecast rendering. Templates only.
2. Every forecast carries a receipt.
3. Counterfactual must be shown — it's the legal defense and the user-trust feature.
4. Calibration history must be visible and exportable.
5. No forecast > 30 days. No exceptions outside forensic-mode products.

---

## Definition of Done

- A user can journal for 7 days, frame 3 decisions, see deterministic forecasts with counterfactuals on each, watch calibration update as decisions resolve, and export the full receipt bundle. All without an LLM ever generating an insight or prediction phrase.

---

© 2025–2026 CMPSBL®.
