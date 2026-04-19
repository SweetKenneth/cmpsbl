# 04 — Build-Ready Spec: Reflective Therapy Companion (codename MIRROR)

**Library:** Dreamcast · **Classification:** 🔒 Governor Eyes Only

> **How to use this doc:** Open any Lovable project that has access to the CMPSBL substrate (or import via the federation transfer pattern in `mem://workflow/cross-project-federation-transfer-pattern`). Hand this entire file to the AI and say: *"Implement the spec. Check off items as you complete them."*

---

## Product

**Name:** Mirror
**Tagline:** *The therapist's notebook the patient gets to read.*
**Positioning:** Reflective AI companion for therapy clients between sessions. Wraps any LLM-based therapist chatbot; surfaces sub-threshold themes deterministically.
**Primary user:** Therapy clients (consumer) and therapists (B2B2C).
**Pricing:** $19/mo consumer, $9/seat B2B2C bulk.

---

## Architecture

```
┌─ User ─┐  chat   ┌─ Wrapped LLM ─┐  events  ┌─ DREAM ─┐  resonance  ┌─ DECODE ─┐
│ React  │◄───────►│ (NEXUS-routed │─────────►│ engine  │────────────►│  mirror  │
│  app   │         │   therapist)  │          │ (CMPSBL)│             │   panel  │
└────────┘         └───────────────┘          └─────────┘             └──────────┘
                                                    │
                                                    ▼
                                              ┌─ AUDIT ─┐  user-owned receipt
                                              │ receipt │
                                              └─────────┘
```

---

## Build Checklist

### Phase 1 — Foundation
- [ ] Initialize Vite + React + Tailwind + shadcn project
- [ ] Wire CMPSBL substrate import (federation pattern, read-only DREAM/AUDIT access)
- [ ] Auth: magic-link via Lovable Cloud, no passwords
- [ ] Schema (Lovable Cloud): `mirror_sessions`, `mirror_messages`, `mirror_subthreshold_events`, `mirror_reflections`, `mirror_receipts` (RLS: user owns own data)

### Phase 2 — Chat Surface
- [ ] Chat UI (semantic tokens only, mobile-first)
- [ ] LLM wrap via NEXUS router (no Lovable AI direct), system prompt = "warm, non-directive therapist; never diagnose"
- [ ] Sub-threshold capture client lib: keystroke timing, retraction pairs, dwell-on-suggestion
- [ ] Stream events to `mirror_subthreshold_events` (debounced, batched)

### Phase 3 — Reflection Panel
- [ ] DREAM resonance call every N messages (configurable, default 6)
- [ ] Render ReflectivePayload as a quiet side panel (collapsible, never interrupts chat)
- [ ] Template phrase bank (versioned JSON, NOT generative): 60 starter phrases across 8 reflection categories
- [ ] "Why am I seeing this?" tooltip → expand to show event evidence

### Phase 4 — Receipt & Export
- [ ] AUDIT receipt on every reflection
- [ ] User-export: PDF + JSON download of session + receipts
- [ ] "Share with my therapist" → time-limited signed URL (7 days)

### Phase 5 — Safety (CONSCIENCE)
- [ ] Crisis-keyword detection (deterministic regex + curated list, NOT model-based)
- [ ] If detected → swap reflection panel for `crisis_response` template + 988 / Samaritans link
- [ ] Hard-block forecasts in this product (Mirror is reflection-only; forecasting lives in Tide/Vigil)
- [ ] Under-18 lockout (DOB capture + opt-in flow)

### Phase 6 — B2B2C Therapist Console
- [ ] `/therapist` route (separate role)
- [ ] Therapist sees client-shared receipts (only when client clicks share)
- [ ] Aggregate themes view across own clients (anonymized, opt-in only)
- [ ] Stripe billing: $9/seat × clients

### Phase 7 — Polish & Ship
- [ ] SEO: title, meta, og, sitemap, robots, llms.txt, canonical
- [ ] Analytics: PostHog managed, no Lovable AI
- [ ] Performance: route splitting, lazy reflection panel
- [ ] Smoke-test full flow on mobile (440x664) + desktop
- [ ] Publish to `mirror.cmpsbl.com` (custom domain)

---

## Non-Negotiables (DO NOT SKIP)

1. **Zero generative AI in the reflection layer.** Reflection phrases are template-rendered. The chat LLM is the *therapist surface*; DREAM is the *insight layer*. Conflating them voids the patent.
2. **Receipts on every output.** No exception. AUDIT primitive call is not optional.
3. **User owns the data.** Export must work. Delete must be honored within 24h.
4. **Crisis safety is deterministic.** No model in the loop for crisis routing.
5. **Use semantic tokens.** No `text-white`, no inline hex.

---

## Definition of Done

- A user can hold a therapy-style conversation, see a quiet panel of reflections every few exchanges, download a receipt, and share with their therapist — all without a single LLM-generated insight phrase reaching them.

---

© 2025–2026 CMPSBL®.
