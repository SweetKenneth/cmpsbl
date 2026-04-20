# Ascension V2 — Production Ready Roadmap

> **Mission:** Ship one feature so clean a stranger can trust it.
> Ascension V2 is the only public product. This roadmap takes it from
> "stable for me" → "stable for anyone who lands on `/ascension-v2`."
>
> Replaces: `ascension-v2-archived-2026-04-20.md` (6-sprint scaffolding plan).
> Baseline: `ascension-v2-baseline.md` (Sprint 0 measurements, still valid).
> © CMPSBL® · 2026 · Kenneth E. Sweet Jr.

---

## North Star

A first-time user lands on `/ascension-v2`, uploads code in any of the
9 shipping languages, and exports a verified Mana-wrapped artifact in
under 60 seconds — **without ever hitting a wall, a confusing state, or
an unexplained failure.**

Everything in this roadmap serves that sentence. If a task doesn't,
it's deferred.

---

## Where We Are (Live, April 20 2026)

| Signal | State |
|---|---|
| Pipeline tests | **16/16 green** (9 property + 7 regression) |
| Shipping languages | **9** (locked — see `mem://constraints/architecture/shipping-languages-only`) |
| Artifacts produced (30d) | **174** across 7 active days |
| `audit_chain_anchors` | Schema live, **0 rows** (anchoring not yet activated) |
| `/verify/:fingerprint` | Live, reachable, untested by external user |
| Funnel instrumentation | **0 / 6 events** wired |
| Re-ascension UX | None (every run is cold-start) |
| "My Layers" surface | None |
| Median run duration | Not measured |

**Translation:** the engine is sound. The product surface around it has
gaps that will silently kill conversion.

---

## The Four Ship-Blockers

Ranked by user-impact, smallest first. Each is independently shippable.

### Block 1 — Funnel Instrumentation *(diagnostic foundation)*
**Why first:** we cannot fix what we cannot see. Every other block in
this roadmap is half-blind without these six events.

**Scope:**
- Emit 6 events to `analytics_events` from the V2 orchestrator:
  `upload_started`, `gate_passed`, `discovery_complete`,
  `layer_attached`, `export_clicked`, `export_complete`
- Each event carries: `run_id`, `language`, `file_count`, `duration_ms`
- Add `started_at` / `completed_at` to the run snapshot so median
  duration becomes a real number
- Surface a single funnel chart on `control.cmpsbl.com` (Governor only)

**Done when:** one real user run produces 6 events end-to-end and the
chart shows a non-zero conversion rate.

**Effort:** ~1 session.

---

### Block 2 — Merkle Head Anchoring *(verifiability proof)*
**Why:** `/verify/:fingerprint` is our trust claim. With 0 rows in
`audit_chain_anchors` the claim is theoretical. First external skeptic
who looks will catch it.

**Scope:**
- Activate the periodic head-anchor job (writes to `audit_chain_anchors`
  every N receipts or every M minutes, whichever first)
- Backfill one anchor for the existing 201 artifacts so the chain has a
  visible root
- Add a "Last anchored: X ago" badge to `/verify/:fingerprint`

**Done when:** `audit_chain_anchors` accumulates rows automatically and
the verify page shows a recent anchor timestamp.

**Effort:** ~1 session.

---

### Block 3 — "My Layers" Dashboard *(retention surface)*
**Why:** users who buy or attach a layer have no place to see it.
They re-discover the Store every visit. This is the difference between
"tried it once" and "uses it weekly."

**Scope:**
- New route `/ascension-v2/layers` (auth-gated)
- Lists every layer the signed-in user owns or has attached
- Each row: name, source (Crown Jewel / Store / SDK), last attached
  date, "Re-attach to next run" button
- Empty state links to `/store`

**Done when:** signing in and visiting the route shows real owned
layers from `artifact_registry` + Store purchases, with working
re-attach.

**Effort:** ~1–2 sessions.

---

### Block 4 — One-Click Re-Ascension *(repeat-usage path)*
**Why:** every current run is a cold start. The pipeline's compounding
value (Lex learning, layer reuse, fingerprint stability) is invisible
until a user runs it twice on the same code.

**Scope:**
- "Run again with same layers" button on the export step
- Pre-populates the new run with the prior run's language, file
  selection, and attached layers
- Shows a diff badge if the source fingerprint changed since last run
- Records `re_ascension_of: <prior_run_id>` in the snapshot for funnel
  attribution

**Done when:** a user can complete a second run in <3 clicks from the
first run's export page.

**Effort:** ~1 session.

---

## Out of Scope (Deferred — and Why)

| Item | Why deferred |
|---|---|
| Substrate table reduction (443 → 280) | Internal hygiene. Zero user-visible impact. Revisit after Block 4. |
| Renaming `modernizer_*` → `evolution_*` | Cosmetic. Receipts already abstract the names. |
| Killing 5 confirmed-theater tables | Snapshot first, delete later. Not blocking ship. |
| Sprint 6 "scale to 1,000 runs/week" | Premature. Fix the funnel before scaling the leak. |
| New language support | We ship 9. Adding a 10th before the existing 9 are bulletproof = treadmill. |
| Marketing site polish | The `/ascension-v2` page is already correct. Don't re-paint walls before fixing plumbing. |

---

## Definition of "Production Ready"

Ascension V2 is production-ready when **all four** are true:

1. ✅ Funnel events flow end-to-end and a real median duration exists
2. ✅ `audit_chain_anchors` writes automatically and verify page proves it
3. ✅ A returning user lands on `/ascension-v2/layers` and sees their work
4. ✅ A returning user can re-run in ≤3 clicks

No sprint numbers. No theater. Four checks, in order, each independently
verifiable.

---

## Execution Rules

- **One block at a time, in order.** No parallel work.
- **Each block ends with a real user run** (Governor account counts as
  user for verification — the events must fire, the anchor must write,
  the layer must appear).
- **Property + regression tests stay green at every step.** If a block
  breaks the 16/16 baseline, it doesn't ship.
- **No new corpora.** Edge cases now come from the funnel telemetry
  (Block 1) — that's the whole point of building it first.
- **Treadmill pause rule applies** (`mem://workflow/treadmill-pause-rule`):
  if any block starts spawning hand-rolled fixtures or repetitive
  one-off scripts, stop and reassess.

---

## After All Four Ship

Then — and only then — we revisit:
- Substrate table cleanup (cohesion pass)
- SDK "build your own layer" public beta
- `/ascension-v2` marketing polish based on real funnel data
- Whether Sprint 6 scale targets are still the right targets

Until then, this document is the only roadmap that matters.

---

*© CMPSBL® · 2026 · Production-Ready Ascension V2 · Replaces all prior V2 sprint plans.*
