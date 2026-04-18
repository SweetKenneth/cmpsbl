# Vertical Collapse & Ascension Anchor — Consolidation Roadmap

**Status:** Audit complete · awaiting execution approval
**Date:** 2026-04-18
**Author:** Pair-programming session for Kenneth E. Sweet Jr.
**Triggering doc:** `cmpsbl-lies-ledger-detailed-report_7.html` (117 findings, 58% fiction+theater)

---

## 1. The audit (real DB numbers, no estimates)

Ran against the live database `2026-04-18`. Every number below is `SELECT COUNT(*)`.

### 1.1 What the verticals actually are

| Vertical (only 5 exist, not 12) | Primitives | MemStream rows | CLM cycles | Last MemStream activity |
|---|---:|---:|---:|---|
| `cyber-v1` (CMPSBL CYBER™) | 16 | 8 | 356 | **2026-04-04** (15 days stale) |
| `robo-v1` (CMPSBL ROBOTICS™) | 16 | 8 | 352 | **2026-04-04** |
| `llm-v1` (CMPSBL LLM™) | 16 | 8 | 352 | **2026-04-04** |
| `quantum-v1` (CMPSBL QUANTUM™) | 16 | 8 | 352 | **2026-04-04** |
| `agency-v1` (CMPSBL AGENCY™) | 16 | 8 | 352 | **2026-04-04** |
| `health`, `gaming`, `education`, `fintech`, `legal`, `media`, `ultimate` | **0** | **0** | **0** | never existed in DB |

**The Lies Ledger was right.** The site advertises 12+ verticals (`vertical-factory-engine.ts` ships 12 themes; subdomains for 14 are configured). Five rows exist. The other seven verticals are pure routing + theme fiction — no primitives, no memory stream, no CLM, no Crown Jewels.

### 1.2 What's running vs decorative

| System | Total rows | Last 7 days | Verdict |
|---|---:|---:|---|
| `discoveries` | 7,266 | **7,266** | ✅ **REAL** — actively producing |
| `vertical_clm_cycles` | 1,764 | **780** | ✅ **REAL** — running daily |
| `discovery_runs` | 3,343 | active | ✅ **REAL** |
| `discovered_pipelines` | 40 | — | ✅ real |
| `foundry_discovery_metrics` | 202 | — | ✅ real |
| `vertical_memory_stream` | 40 | **0** | ⚠️ **STALE** — 15 days dead |
| `cli_ascension_sessions` | 2 | 0 | ⚠️ Ascension worked **twice ever** (2026-04-14) |
| `vertical_ascension_sessions` | 1 | 0 | ⚠️ One real run |
| `artifact_registry` (apex/mythic/prime tiers) | 204 | **178 in 30d** | ✅ **REAL** — Crown Jewel pipeline produces |

### 1.3 The Crown Jewel reality

| Tier | Count | Source |
|---|---:|---|
| `apex` | 83 | proprietary-ascended (real) |
| `mythic` | 50 | proprietary-ascended/crystallized (real) |
| `prime` | 27 | proprietary-ascended/crystallized (real) |
| `relic` | 34 | proprietary-ascended/crystallized (real) |
| `mint` | 6 | proprietary-crystallized (real) |
| `candidate` | 2 | proprietary-evolution (real) |
| `system` | 3 | ascension-run-snapshot (real) |

**205 real artifacts in `artifact_registry`.** Documentation calls these "Crown Jewels" and groups them by vertical. Database has zero `vertical_id` foreign key on `artifact_registry` — **the vertical attribution is purely a presentation overlay, not data**. Flattening loses nothing.

---

## 2. What's real, what stays, what dies

### 2.1 KEEP — load-bearing real systems

- `discoveries` + `discovery_runs` (7,266 + 3,343 rows, daily activity) → **the prime Discovery Engine works**
- `vertical_clm_cycles` (1,764 rows, 780 in 7 days) → **CLM is running** — feed all 5 verticals' cycles into one prime stream
- `artifact_registry` (205 real Crown Jewels across 7 tiers) → **the prime vault**
- `cli_ascension_sessions` schema — **the moat**, even though only 2 sessions ran. Surface this in the home and make it the signup driver.
- `foundry_discovery_metrics` (202 rows) — keep
- `discovered_pipelines` (40 rows) — keep
- `substrate_*` tables (50+ tables, real config/runtime) — untouched

### 2.2 MERGE (flatten into prime, drop vertical attribution)

- `vertical_primitives` (80 rows × 5 verticals) → migrate the schema to a single `prime_primitives` set; the 16-per-vertical custom primitives become 80 prime primitives in one matrix-extension pool. **Drop `vertical_id` column.**
- `vertical_memory_stream` (40 rows, stale) → fold non-empty rows into the prime memory stream; archive the rest. Schema retired.
- `vertical_clm_cycles` (1,764 rows, hot) → repoint to `prime_clm_cycles` with a `lens` column for historical traceability only. Future writes go to a single stream.
- `vertical_ascension_sessions` (1 row) → merge into `cli_ascension_sessions`. One Ascension table.

### 2.3 DELETE — pure theater (subdomains, themes, gates, SSO)

- **7 of 12 vertical themes** that have zero DB presence: `health`, `gaming`, `education`, `fintech`, `legal`, `media`, `ultimate` — delete from `vertical-factory-engine.ts`, `domains.ts`, `VerticalThemeWrapper.tsx`, `DomainAwareHome.tsx`.
- **`VerticalAccessGate`, dual-PIN gate for verticals** — delete (no real verticals to gate).
- **`crossVerticalSSO.ts` SSO relay** — delete (one substrate, one auth).
- **`VerticalReturnBanner.tsx`** — delete (nowhere to return from).
- **`/pages/CyberSecurityHome.tsx`, `RoboticsHome.tsx`, `QuantumHome.tsx`, `LLMHome.tsx`, `AgencyHome.tsx`, `UltimateHome.tsx`, `MediaHome.tsx`, `VerticalSubstrateHome.tsx`** — delete.
- **`vertical_substrates` table** — drop after migrating the 5 names into a `prime.lens_history` reference table for the 205 artifacts to retain provenance.

### 2.4 ARCHIVE — keep schema, drop UI

- `agency_*` tables (28 of them) — these belong to a different product (CMPSBL AGENCY paid feature). Keep the tables, but the agency vertical landing/subdomain dies. Agency stays as a paid product, not a vertical.

---

## 3. Subdomain plan (301 redirects, no broken links)

All 14 vertical subdomains in `project_urls` collapse to `cmpsbl.com`:

| From | To | Method |
|---|---|---|
| `security.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `robotics.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `quantum.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `llm.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `agency.cmpsbl.com/*` | `cmpsbl.com/agency` *(paid product, not vertical)* | 301 |
| `ultimate.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `media.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `gaming.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `education.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `health.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |
| `fintech.cmpsbl.com/*` | `cmpsbl.com/*` | 301 |

**Keep separate:**
- `cmpsbl.com` (substrate prime — unchanged)
- `marketplace.cmpsbl.com` (real product surface)
- `control.cmpsbl.com` (Governor-only, real)
- `mana.cmpsbl.com` (real distribution channel per memory `mem://architecture/mana/distribution-channel-and-ascension-step-2`)

**Implementation:** Single React router check at app root — if hostname matches a retired vertical subdomain, immediately `window.location.replace('https://cmpsbl.com' + pathname + search)`. No SPA flicker because it fires before render. Will add equivalent to Lovable host config when execution begins.

---

## 4. Home page — minimal diff (per your decision)

You chose **"Keep current FactoryHome, just retire vertical messaging."** Diff scope:

1. Remove any "12 verticals" / "vertical substrates" copy from `FactoryHome.tsx`.
2. Strengthen Ascension placement — single hero card, real `cli_ascension_sessions` count as live proof.
3. Remove vertical portal grids/links/tiles.
4. No new home design, no rewrite.

Estimated scope: ~150 LOC of edits to `FactoryHome.tsx` + dependent components. No DB writes.

---

## 5. Ordered execution plan (next session)

Each step is independently shippable. Stop after any step if needed.

| # | Step | Files | DB? | Risk |
|---|---|---|---|---|
| 1 | Subdomain redirect shim — add hostname-check to `App.tsx`/`main.tsx` that 301-equivalents all 11 vertical hosts to `cmpsbl.com`. Ship before any deletions. | `src/App.tsx`, new `src/lib/routing/subdomainRedirect.ts` | no | low — pure additive |
| 2 | Delete dead vertical pages (the 8 `*Home.tsx` files in §2.3) + `VerticalAccessGate`, `VerticalReturnBanner`, `VerticalThemeWrapper`, `crossVerticalSSO.ts`, `domain` helpers. Update `DomainAwareHome.tsx` → just renders `<FactoryHome />`. | ~15 files deleted, 2 simplified | no | low — verticals already redirected |
| 3 | Strip 7 fictional vertical themes from `vertical-factory-engine.ts` and `domains.ts`. Keep only `cyber/robotics/llm/quantum/agency` until DB migration. | 2 files | no | low |
| 4 | Update home copy (`FactoryHome.tsx`) — remove vertical messaging, strengthen Ascension hero. Add real-counts widget reading `cli_ascension_sessions`. | 1 file | no | low |
| 5 | DB migration: create `prime_primitives`, `prime_memory_stream`, `prime_clm_cycles` (or alter existing). Backfill from `vertical_*` tables. Add `lens` provenance column. | 1 migration | yes | medium — requires backup checkpoint |
| 6 | Code switch — every read of `vertical_primitives` etc. switches to `prime_*`. Delete the old tables in a follow-up migration after a week of dual-read confidence. | ~30 files | yes | medium |
| 7 | Update SEO: `sitemap.xml`, `robots.txt`, `LLMs.txt`, public changelog entry: "Substrate consolidated. Vertical subdomains retired. Ascension is the anchor." | 4 files | no | low |
| 8 | Re-run the Lies Ledger audit script and republish the report. Delta should show fiction count drop by ~15-20 entries (the vertical-related ones). | runs the existing audit | no | none |

---

## 6. What this is honest about

- **The discovery engine is real.** 7,266 rows, daily activity. That's the strongest signal in the DB — preserve and surface it.
- **CLM is real.** 780 cycles in 7 days. The "vertical CLM" is just one prime CLM with a vertical tag — flatten the tag, keep the engine.
- **Crown Jewels are real but not vertical-attributed in the DB.** 205 artifacts. Vertical grouping was UI overlay — flatten it without data loss.
- **Ascension is real but barely used.** 2 CLI sessions ever, last on April 14. **This is the moat per your direction** — the next session's home work makes that visible.
- **Memory Stream is dead.** 15 days stale on every vertical. Either revive it as one prime stream or retire it. Recommend retire-then-rebuild as a single prime stream.
- **The 7 phantom verticals never existed in the DB.** The Lies Ledger called this; we now have the row counts to prove it.

## 7. What this is NOT touching (per `mem://constraints/architecture/layer2-runtime-non-negotiables`)

- Ascension pipeline internals
- Mana runtime
- Lex governance
- Crown Jewel signature/hash logic
- `supabase/migrations/*` (read-only — only forward migrations added)
- Auth flow
- Governor recognition

---

## 8. Open questions before execution

1. **Agency** — keep as a paid product page (`cmpsbl.com/agency`) or fully retire? Has 28 real DB tables and an active feature surface.
2. **`/beta` Ascension page you mentioned** — should the new prime Ascension area replace the existing `/ascension` route, sit at `/ascension/v2`, or move `/beta` to `/ascension`?
3. **CLM cycle history** — preserve the per-vertical `lens` value forever (audit trail) or null it out after the merge?
4. **Subdomain DNS** — once the redirect shim ships, do you want me to draft an issue/checklist for actually retiring the DNS A-records, or leave that to you?

Answer those and the next session executes steps 1–8 in order.
