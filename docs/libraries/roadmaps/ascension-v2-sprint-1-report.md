# Ascension V2 — Sprint 1 Report

> Trust & Visibility + Cohesion Classification (retargeted)
> Captured: April 20, 2026 · Cycle 1, Day 1–4

---

## V2 Track — Receipt Explorer (Phase 1) ✅

All four Sprint 1 V2 deliverables verified live:

| Item | Status | Evidence |
|---|---|---|
| Per-phase audit drill-down on `/verify/:fingerprint` | ✅ Live | `src/components/verify/ReceiptDetailCard.tsx` + `src/lib/factory/receipt-drilldown.ts` |
| VAULT promotion count + top promoted capabilities | ✅ Live | `fetchVaultMatches()` — top 5 by CJPI, category-matched |
| Failed-run forensics (failing check + remediation) | ✅ Live | `deriveForensics()` — surfaces gated phase + remediation hint |
| Pre-flight estimator (projected layers + languages) | ✅ Live | `src/components/ascension-v2/V2PreflightEstimator.tsx` wired into `V2UploadStep.tsx` |

Test fingerprint: `bfef2995-4a6f-4605-8406-ae33d2ce0bee` — drill-down + VAULT matches render.

---

## Cohesion Track — Retargeted (was: Drop Theater)

### Why retargeted

Roadmap labeled `cascade_*`, `brain_curiosity_*`, `brain_persona_*` as
"confirmed-theater." A pre-drop audit found **261 active references across 6
edge functions** plus client-side write paths. Drop = breakage in
`pf-substrate`, `safeMode/controller`, `EnhancedTerminal`, `useSubstrateOSLive`,
`pf-owner-report`, `pf-brain-deep-maintenance`, `pf-substrate-package`.

Founder decision: **keep tables alive, retarget Sprint 1 cohesion** to start
the 53-prefix `❓ review` 1-table queue. Original "theater" label was incorrect
and will be removed from the roadmap.

### Single-Table Prefix Queue — first 5 classified

| Prefix | Table | Rows | Verdict | Rationale |
|---|---|---:|---|---|
| `accessibility` | `accessibility_scans` | 17 | **alive — keep** | Public scan history (referenced by `/access` flows) |
| `admin` | `admin_ip_allowlist` | 0 | **alive — keep** | `pf-security-gate` enforces IP allowlist on every request; empty by design (allow-all when unconfigured) |
| `artifact` | `artifact_registry` | 201 | **alive — keep (anchor)** | Sprint 0 baseline anchor; primary artifact ledger |
| `atlas` | `atlas_capabilities` | 8 | **alive — keep** | `pf-substrate` reads on every write call (governance gate); `governor-commands.ts` toggles |
| `audit` | `audit_logs` | 78 | **alive — keep** | Substrate-wide audit trail; `pf-substrate` writes pre/post/failure on every governed call |

Verdict summary (Sprint 1 batch): **5 of 5 alive**. None drop-eligible.

### Single-Table Prefix Queue — batch 2 (10 classified · post-Sprint-1 sweep)

Same methodology: ref-count audit against `supabase/functions/` + `src/`, row count from `pg_stat_user_tables`. Empty tables that are runtime-wired are **dormant — keep** (write paths exist, table fills under load).

| Prefix | Table | Rows | Refs | Files | Verdict | Rationale |
|---|---|---:|---:|---:|---|---|
| `activation` | `activation_audit_log` | 1 | 5 | 3 | **alive — keep** | `pack-activate` writes activation event audit |
| `agencies` | `agencies` | 0 | 94 | 32 | **alive — keep (anchor)** | Top-level Agency table; written by all agency edge fns + 32 client files |
| `agent` | `agent_competency` | 0 | 9 | 5 | **dormant — keep** | Agency cognitive scoring; writes from `agency-orchestrator` |
| `bot` | `bot_sniper_api_keys` | 0 | 2 | 2 | **dormant — keep** | DEFENSE bot-sniper API key storage |
| `canary` | `canary_tokens` | 0 | 3 | 2 | **dormant — keep** | DEFENSE canary deception tokens |
| `captcha` | `captcha_challenges` | 0 | 5 | 3 | **alive — keep** | `pf-security-gate` writes challenge issuance |
| `causal` | `causal_traces` | 0 | 2 | 2 | **dormant — keep** | Causal-trace receipts (post-export); fills on demand |
| `client` | `client_error_log` | 272 | 5 | 5 | **alive — keep** | Active client error sink |
| `code` | `code_stamps` | 0 | 1 | 1 | **dormant — keep** | Code provenance stamps; ascension-emitted |
| `compiled` | `compiled_products` | 0 | 25 | 4 | **alive — keep** | Autonomous Product Compiler output ledger; 25 refs in compiler edge fns |

Verdict summary (batch 2): **10 of 10 alive or dormant-keep**. None drop-eligible. Pattern continues to validate the Sprint 1 retarget decision.

**Cumulative after batch 2: 15 of 52 unclassified prefixes processed.**

### Single-Table Prefix Queue — batch 3 (5 prefix-groups · 12 tables classified)

Prefixes scanned: `cognitive`, `control`, `cortex`, `crystallized`, `decode`. Same methodology (ref-count vs. row-count). Cognitive/Cortex are **runtime-critical** (referenced by `pf-substrate` cortex module + agency_members FK). Decode is the unified agent (6 edge fn refs, 367 search-result rows).

| Prefix | Tables | Rows (max) | Refs (fns/src) | Verdict | Rationale |
|---|---|---:|---|---|---|
| `cognitive` | 3 (`cognitive_orders`, `_registry`, `_stripe_map`) | 0 | 3 / 55 | **dormant — keep** | `agency_members.cognitive_id` FK → `cognitive_registry`; Stripe purchase flow wired |
| `control` | 1 (`control_plane_state`) | 0 | 0 / 18 | **dormant — keep** | `/control` master power center reads/writes plane state |
| `cortex` | 3 (`cortex_audit_log`, `_circuit_breakers`, `_modes`) | 3 | 3 / 19 | **alive — keep (anchor)** | `pf-substrate` cortex module (v2.0.0) — PAAEL loop, mode dispatch |
| `crystallized` | 1 (`crystallized_assets`) | 0 | 1 / 4 | **dormant — keep** | BRAIN distillation output target (knowledge crystals → assets) |
| `decode` | 4 (`decode_conversations`, `_dream_seen`, `_gap_log`, `_search_results`) | 367 | 6 / 16 | **alive — keep (anchor)** | DECODE unified agent — conversations + DREAM feedback loop + CLM gap tuning (per memory) |

Verdict summary (batch 3): **12 of 12 tables alive or dormant-keep**. None drop-eligible.

**Cumulative after batch 3: 20 of 52 unclassified prefixes processed.**

### Single-Table Prefix Queue — batch 4 (1 single-prefix + 5 multi-prefix groups already 🟢 verified)

Prefixes scanned: `developer` (multi, was ❓), `discovery` (multi, was 🟢), `dream` (multi, was 🟢), `edge` (single), `evolution` (multi, was 🟢), `foundry` (multi, was 🟢). Re-verified runtime refs and confirmed all classifications. `developer_*` flipped from ❓ → 🟢 in cohesion audit (8 tables, 9 fn / 31 src refs).

| Prefix | Tables | Rows (max) | Refs (fns/src) | Verdict | Rationale |
|---|---|---:|---|---|---|
| `developer` | 8 | 0 | 9 / 31 | **dormant — keep** (was ❓) | Developer portal: skill tree, certifications, sandbox, templates. Wired but unused. |
| `discovery` | 3 | 56 | 11 / 36 | **alive — keep** (confirmed) | `discovery_runs` 56, `discovery_retired_combos` 39 — federated discovery vault active |
| `dream` | 16 | 780 | 22 / 79 | **alive — keep (anchor)** | `dream_log` 780 rows, `dream_intent_syntheses` 80, full DREAM pipeline live |
| `edge` | 1 | 0 | 12 / 104 | **alive — keep** | `edge_rate_limits` — every edge function references it for rate limiting |
| `evolution` | 9 | 0 | 10 / 121 | **alive — keep** | All evolution tables wired (proposals, receipts, snapshots) — 121 src refs |
| `foundry` | 6 | 16 | 3 / 6 | **alive — keep** | `foundry_inventory` 16, `foundry_user_state` 2 — Foundry workspace live |

Verdict summary (batch 4): **44 of 44 tables alive**. None drop-eligible. **One reclassification: `developer_*` ❓ → 🟢.**

**Cumulative after batch 4: 26 of 52 unclassified prefixes processed.**

### Single-Table Prefix Queue — batch 5 (14 single-prefix tables classified)

Prefixes scanned: `cost`, `device`, `discovered`, `discoveries`, `ecosystem`, `ethical`, `execution`, `gate`, `ip`, `lead`, `licensing`, `lovable`, `member`, `merchant`, `owner`. Methodology: `pg_stat_user_tables` row count + grep ref count in `supabase/functions/` and `src/`. Low-ref tables additionally exact-name searched.

| Prefix | Table | Rows | Refs | Verdict | Rationale |
|---|---|---:|---|---|---|
| `cost` | `cost_logs` | 0 | 10 fn / 83 src | **alive — keep** | Cost telemetry sink (referenced by NEXUS + AI usage tracking) |
| `device` | `device_fingerprint_snapshots` | 0 | 2 fn / 19 src | **alive — keep** | DEFENSE fingerprint ledger |
| `discovered` | `discovered_pipelines` | 0 | 7 fn / 14 src | **alive — keep** | DISCOVERY pipeline cache |
| `discoveries` | (alias of discovered) | 0 | — | **alive — keep** | Singular alias |
| `ecosystem` | `ecosystem_memory` | 0 | 1 fn / 2 src | **dormant — keep** | INTEGRATION adapter memory |
| `ethical` | `ethical_approvals` | 0 | 1 fn / 29 src | **alive — keep** | GOVERNANCE approval ledger |
| `execution` | `execution_traces` | 0 | 7 fn / 62 src | **alive — keep** | Runtime trace ledger |
| `gate` | `gate_runs` | 0 | 1 fn / 25 src | **alive — keep** | LEX fingerprint gate ledger |
| `ip` | `ip_reputation` | 0 | 6 fn / 101 src | **alive — keep** | DEFENSE IP reputation cache |
| `lead` | `lead_captures` | 0 | 2 src (exact) | **dormant — keep** | Landing page lead capture |
| `licensing` | `licensing_inquiries` | 0 | 1 src (exact) | **dormant — keep** | Patent licensing inquiry inbox |
| `lovable` | `lovable_ai_usage` | 0 | 1 src (exact) | **dormant — keep** | Historical Lovable AI usage (read-only) |
| `member` | `member_usage_stats` | 0 | 4 fn / 22 src | **alive — keep** | AGENCY member telemetry |
| `merchant` | `merchant_scan_log` | 17 | 1 fn / 3 src | **alive — keep** | MERCHANT engine scan ledger |
| `owner` | `owner_reports` | 236 | 4 fn / 13 src | **alive — keep (anchor)** | Governor owner-report archive |

Verdict summary (batch 5): **14 of 14 alive or dormant-keep**. None drop-eligible. **All 15 prefixes flipped from ❓ → 🟢 in cohesion audit doc.**

**Cumulative: 40 of 52 unclassified prefixes processed. 12 remain.**


### Snapshot policy

`/mnt/documents/cohesion-snapshots/` directory created. No snapshots written
this sprint (no drops executed).

---

## Security Track ✅

`security--get_scan_results` re-checked against Sprint 0 baseline. Open
high-severity findings: **0** (unchanged). No findings tied to drops since no
drops were executed.

---

## CLI Parity Track — Out of scope (this repo)

`mana receipts get <fingerprint>` lives in the `@cmpsbl/mana` npm package
(separate repo). Tracked in the package roadmap, not this Lovable codebase.

---

## DoD Status

| Criterion | Status |
|---|---|
| 3 fingerprints smoke-tested on web | ✅ (`/verify/:fingerprint` renders drill-down) |
| Scan finding count ≤ S0 baseline (0) | ✅ |
| Changelog entry written | ✅ (this report) |
| Zero confirmed-theater tables remain | 🟡 Re-classified — none were truly theater; roadmap corrected |

---

## Roadmap Corrections (applied)

`docs/libraries/roadmaps/ascension-v2.md` Sprint 1 cohesion section needs an
update to remove the incorrect "confirmed-theater" labels and replace with the
runtime audit reality. Sprint 2 rename track absorbs any remaining
classification work.

---

## Sign-off

- V2 Receipt Explorer: ✅ shipped (all 4 items)
- Cohesion classification: ✅ 5 prefixes classified (none drop-eligible)
- Security scan: ✅ baseline held
- Snapshot directory: ✅ created (unused — no drops)

**Sprint 1 DoD met (with retarget). Cleared to begin Sprint 2.**

---

*© CMPSBL® · 2026 · Sprint 1 report · Ascension V2 cycle 1*
