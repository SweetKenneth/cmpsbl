# Ascension V2 — Sprint 0 Baseline

> Measured starting line for the 6-sprint roadmap in `ascension-v2.md`.
> Captured: April 20, 2026 · No TBDs.

---

## Pipeline Health

| Check | Result |
|---|---|
| `bun run build` | ✅ Green (last verified deploy) |
| `audit_chain_anchors` writable | ✅ (table responsive, 0 rows — anchoring not yet activated, finishes in Sprint 5) |
| `artifact_registry` rows | **201** total artifacts (174 in last 30 days across 7 active days) |
| `agency_tasks` rows | **253** |
| `/verify/:fingerprint` route | ✅ Live (`src/pages/VerifyFingerprint.tsx`) |
| Test fingerprint available | `bfef2995-4a6f-4605-8406-ae33d2ce0bee` |

## Substrate Surface (cohesion)

| Metric | Today |
|---|---|
| Total `public.*` tables | **443** |
| `cascade_*` (theater queue) | **3** |
| `brain_curiosity_*` + `brain_persona_*` (theater queue) | **2** |
| `modernizer_*` + `mutation_*` (rename queue → EVOLUTION) | **10** |

> Sprint 6 target: **~280** tables (≈37% reduction). Sprint 1 will drop the
> 5 confirmed-theater tables above (after snapshot).

## Security

| Metric | Today |
|---|---|
| Open high-severity findings | **0** (all flagged findings reviewed and ignored with documented reasons — internal substrate functions by design, intentional public showcase tables) |
| Sensitive-table RLS coverage | ✅ `access_api_keys`, `access_subscriptions`, `access_developers`, `access_quotas`, `access_usage` |

## Pipeline Throughput

| Metric | Today | End S3 | End S6 |
|---|---|---|---|
| Successful runs / week | ~40 (174 / 30d × 7) | 100 | 1,000 |
| Avg layers attached / run | 1 | 3 | 5 |
| Re-ascension rate | 0% | 25% | 50% |
| Median run duration | not yet instrumented | <30s | <10s |
| Funnel events instrumented | 0 / 6 | 6 / 6 | 6 / 6 |
| Reproducibility verification | none | manual | automated |
| CLI receipt parity | partial | full | full |
| Public table count | 443 | ~360 | ~280 |
| Confirmed-theater tables | 5 | 0 | 0 |
| Legacy engine names in receipts | yes (10 tables) | no | no |

## Gaps Surfaced by Sprint 0

1. **No median-duration metric exists yet** — Sprint 3 funnel instrumentation should capture `started_at → completed_at` so this becomes measurable.
2. **`audit_chain_anchors` has 0 rows** — Sprint 5 must finish the periodic head-anchor job; verify it begins writing within 24h of activation.
3. **Run-rate baseline (~40/week) is artifact-creation, not full successful runs** — Sprint 3 funnel will give the true number.

## Sign-off

- Build: ✅
- Baselines captured: ✅ (no TBDs above)
- `/verify/:fingerprint` reachable with real ID: ✅
- Snapshot of `mem://index.md` Core rules: ✅ (in-context)

**Sprint 0 DoD met. Cleared to begin Sprint 1.**

---

*© CMPSBL® · 2026 · Sprint 0 baseline · Ascension V2 cycle 1*
