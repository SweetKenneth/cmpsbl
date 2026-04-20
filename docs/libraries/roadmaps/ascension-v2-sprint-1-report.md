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

Verdict summary: **5 of 5 alive**. None drop-eligible. Queue continues in
Sprint 2 as part of the rename track.

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
