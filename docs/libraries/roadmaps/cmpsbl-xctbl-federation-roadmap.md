# CMPSBL ⇄ XCTBL Universe — Federation Roadmap

> **Hand this entire document to the AI on each linked project in the order listed.**
> Tell it: *"Read this roadmap and execute the section labeled with this project's name. When done, check off the completed items and stop."*
> Each project owns its own section. Nothing here merges codebases or SSOs.

**Master account holding credits:** `kennethsweet214@gmail.com`
**Sequence:** CMPSBL prep → XCTBL → RCRDBL → RNDRBL → PTCHBL → RCKBL → RSTRBL → RSLVBL → CRCKBL → SIGNAL.XCTBL → CMPSBL final reveal

**Excluded from federation (do not touch):** CRXBL, XCTBL Labs (SPLCBL/CRFTBL/GNRTBL).

---

## Founding principles (every project must honor)

1. **No SSO mixing.** XCTBL keeps its native cool SSO. CMPSBL keeps its enterprise auth. Federation happens at the **identity claim layer** only — never the session layer.
2. **No codebase merging.** Each project ships independently on its own deploy.
3. **World first, bridge second.** XCTBL universe must natively contain CMPSBL primitives as living world-objects *before* any cross-traffic doors open publicly.
4. **Public-safe surfaces only.** XCTBL consumes CMPSBL's *public primitive registry* — never internals, never CJPI weights, never Crown Jewel details.
5. **Reversible.** Every step ships behind a feature flag or an opt-in toggle. Nothing forces traffic across.

---

## ✅ Phase 0 — CMPSBL pre-sync work *(this project, completed today)*

These are shipped on `cmpsbl.com` so every other project has something stable to point at.

- [x] `/origin` page live — public-readable origin story (Lovable credits → broken substrate ceiling → 2,500 users in a day → all-inclusive humans → CMPSBL born).
- [x] Public primitive registry endpoint — `GET /api/public/primitives` returns canonical 40-primitive matrix (names + categories only, zero internals).
- [x] Heritage memory updated to lock the federation principles (no SSO mixing, world-first sequencing).
- [x] Cross-project workflow saved to memory so any future session knows the transfer pattern.
- [x] This roadmap committed to `docs/libraries/roadmaps/cmpsbl-xctbl-federation-roadmap.md` so it travels with whoever holds the doc.

---

## Phase 1 — XCTBL.com (the hub)

> Transfer XCTBL workspace into Kenneth's main account. Hand AI this doc. Tell it: *"Execute Phase 1."*

- [ ] Add a read-only `cmpsblPrimitives` loader that fetches `https://cmpsbl.com/api/public/primitives` on world boot.
- [ ] Define a `WorldObject` adapter that maps each CMPSBL primitive into an XCTBL Space entity (name → lore-skin, category → habitat).
  - DEFENSE → "Guardian" archetype
  - MEMORY → "Oracle" archetype
  - NEXUS → "Wayfinder" archetype
  - (full mapping table in `src/lore/primitive-archetypes.ts`)
- [ ] Render primitives as ambient world-objects in the XCTBL³ Space hub — visible, not yet interactive.
- [ ] Add tiny "Powered by CMPSBL Substrate" footer badge (link → `cmpsbl.com/origin`).
- [ ] Verify nothing leaks: no CJPI scores, no internals, no Crown Jewel names.
- [ ] Transfer XCTBL back to `kennethsweet214@gmail.com`.

---

## Phase 2 — RCRDBL.com (Records & Retention)

> *"Execute Phase 2."*

- [ ] Same `cmpsblPrimitives` loader pattern as XCTBL.
- [ ] Render primitives as **artifacts in the Records archive** — each primitive becomes a "record" with a Vel'kora-styled card.
- [ ] Add reflection lore: each primitive gets one sentence of in-world description (no technical leak).
- [ ] Footer badge "Powered by CMPSBL Substrate" → `cmpsbl.com/origin`.
- [ ] Transfer back.

---

## Phase 3 — RNDRBL.com (Crew Log / WebHarmony)

> *"Execute Phase 3."*

- [ ] Loader + adapter (same pattern).
- [ ] Render primitives as **crew members in the Crew Log** — each primitive becomes a named crew entity with a role card.
- [ ] Tie into WebHarmony accessibility lore: primitives are "the crew that makes the ship inclusive."
- [ ] Footer badge.
- [ ] Transfer back.

---

## Phase 4 — PTCHBL.com (Dream Eater / Mars Settlement)

> *"Execute Phase 4."*

- [ ] Loader + adapter.
- [ ] Render primitives as **Settler tools in the Mars colony** — each primitive becomes a piece of settler equipment with a Sol-dated entry.
- [ ] Weave into MCG protocol lore: primitives are "the 40 protocols Vel'kora Scanner relies on."
- [ ] Footer badge.
- [ ] Transfer back.

---

## Phase 5 — RCKBL.com (Dream Eater Companion)

> *"Execute Phase 5."*

- [ ] Loader + adapter.
- [ ] Render primitives as **echoes you bring back** — each appears as a fragment in the companion's reflection log.
- [ ] Footer badge.
- [ ] Transfer back.

---

## Phase 6 — RSTRBL.com (Project Sanctuary)

> *"Execute Phase 6."*

- [ ] Loader + adapter.
- [ ] Render primitives as **archived sanctuaries** — each primitive becomes a saved-state location in the archive.
- [ ] Footer badge.
- [ ] Transfer back.

---

## Phase 7 — RSLVBL.com (Transmissions Hub)

> *"Execute Phase 7."*

- [ ] Loader + adapter.
- [ ] Render primitives as **transmission channels** — each primitive is a channel broadcasting in the hub.
- [ ] Footer badge.
- [ ] Transfer back.

---

## Phase 8 — CRCKBL (Domain Miner Engine v3.0.0)

> *"Execute Phase 8."*

- [ ] Loader + adapter.
- [ ] Render primitives as **mining rigs** — each primitive is a rig in the miner roster.
- [ ] Footer badge.
- [ ] Transfer back.

---

## Phase 9 — SIGNAL.XCTBL.com (Quantum Star Watch)

> *"Execute Phase 9."*

- [ ] Loader + adapter.
- [ ] Render primitives as **stars on the Quantum Watch** — each primitive is a tracked star with a magnitude derived from its public category (no CJPI).
- [ ] Footer badge.
- [ ] Transfer back.

---

## Phase 10 — CMPSBL.com final reveal

> Transfer CMPSBL (last) and tell AI: *"Execute Phase 10."*
> Only run this **after** Phases 1–9 are all checked off.

- [ ] On `/origin`, append a "The Universe" section listing all 9 federated XCTBL sites with live status badges.
- [ ] In `/decode`, add the **earned cross-door**: after a user has shipped 3+ primitives, show one quiet line — *"You've shipped 3 primitives. Want to see where they came from?"* → links to `xctbl.com`.
- [ ] Add `/federation` page (Governor-only) showing live counts of how many primitives each XCTBL site is rendering.
- [ ] Public launch post on `/changelog`: "The world is open."

---

## Workflow each transfer cycle

1. You: transfer the next project's workspace into the credit-holding account.
2. You: open the project, hand AI this doc, say *"Execute Phase N."*
3. AI: reads this doc, reads its phase, ships the work, **checks off completed items in this doc**, commits.
4. You: transfer that project back to its home account.
5. Move to the next project.

---

## What CMPSBL's public primitive registry returns

```
GET https://cmpsbl.com/api/public/primitives

{
  "version": "1.0.0",
  "matrix": "12·12·8·8 = 40",
  "primitives": [
    { "name": "DEFENSE",   "category": "layer",  "publicDescription": "..." },
    { "name": "MEMORY",    "category": "organ",  "publicDescription": "..." },
    ...40 entries total
  ]
}
```

**Never returned:** CJPI scores, dependency footprints, signature hashes, Crown Jewel internals, runtime config, governance rules.

---

## Locked decisions (do not re-litigate)

- ❌ No SSO bridging. Two SSOs stay independent forever.
- ❌ No codebase merge.
- ❌ CRXBL is not part of this federation.
- ❌ XCTBL Labs (SPLCBL/CRFTBL/GNRTBL) are not part of this federation.
- ✅ Identity federation, if ever needed, is a one-way claim table on the CMPSBL side only — opt-in, no token relay.
- ✅ World-first, bridge-second sequencing is non-negotiable.

---

© 2026 CMPSBL® · Kenneth E. Sweet Jr. · Solo founder.
