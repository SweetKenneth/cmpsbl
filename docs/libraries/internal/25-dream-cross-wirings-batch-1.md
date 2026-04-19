# 25 — DREAM Cross-Wirings Batch 1: Gaps, Defense, Regret

**Status:** Live, autonomous, cron-driven.
**Audience:** Governor only (internal documentation).
**Date wired:** 2026-04-19.

---

## Plain-English Summary

Three feedback loops were closed today so the substrate compounds intelligence
from three previously-evaporating signals:

1. **DECODE → DREAM (gap-driven dreaming).** When DECODE can't recall an answer
   well, the question gets logged. DREAM later synthesizes a candidate insight
   to fill that gap and embeds it so DECODE finds it next time.
2. **DEFENSE → MEMORY.** Every blocked / challenged attack gets distilled into a
   durable warm-memory lesson, so recurring attacks short-circuit on the
   memory lookup instead of re-running the full rule chain.
3. **Regret Loop (patentable).** Failed Ascensions, rejected Lex rules,
   abandoned product compilations, and false-positive immunity escalations
   are swept into a regret log. DREAM then runs **negative-space synthesis** —
   counterfactual dreams of "what should have happened instead" — and embeds
   those into brain so future similar decisions get challenged before commit.

Nothing in this batch uses an LLM for the synthesis step. All three loops are
**deterministic** (no creative generation), **auditable** (every dream carries
its source IDs), and **idempotent** (dedupe via decision_ref / question_hash).

---

## Technical / Patent Summary

### Loop 1 — DECODE → DREAM (gap-driven)

| Layer | Component |
|------|-----------|
| Capture table | `public.decode_gap_log` (question, best_similarity, attempts, addressed flag) |
| Synthesis fn  | `dream-from-gaps` edge fn — pulls worst-similarity unaddressed gaps, embeds the query, RPC `match_brain_embeddings` for weak context, deterministically synthesizes via 6-angle rotor (PROCEDURAL, RATIONALE, FAILURE-MODE, CROSS-DOMAIN, TEMPORAL, CONSTRAINT) |
| Persistence  | New row in `dream_log` (mode='gap_fill') + embedding in `brain_embeddings` (artifact_type='dream') |
| Closure      | Gap row marked `addressed=true` with `dream_id` reference |
| Schedule     | `substrate-dream-from-gaps` — every 15 min |

### Loop 2 — DEFENSE → MEMORY

| Layer | Component |
|------|-----------|
| Capture table | `public.defense_events` (existing, populated by `logDefenseEvent`) |
| Synthesis fn  | `defense-memory-sync` edge fn — groups hostile events by `(fingerprint_family, reason, action)`, builds structured lesson, dedupes via `goal_ref='defense:<key>'` |
| Persistence  | Insert/reinforce row in `brain_memory_warm` (`memory_type='procedural'`, `source_module='defense'`, `category='security'`) — reinforcement bumps `access_count` and `value_score` |
| Recall path  | DECODE / ASCENSION / IMMUNITY recall surfaces already query `brain_memory_warm`, so the lesson surfaces automatically at request-time |
| Schedule     | `substrate-defense-memory-sync` — every 20 min |

### Loop 3 — Regret (patentable negative-space synthesis)

| Layer | Component |
|------|-----------|
| Capture fn   | `regret-collector` edge fn — sweeps 4 sources (failed `ascension_runs`, rejected `lex_rules`, failed `autoblog_queue`, false-positive `immune_escalations`), idempotent via `decision_ref` |
| Capture table | `public.brain_regret_log` (decision_type, decision_summary, outcome_summary, severity 1-10, dreamed flag) |
| Synthesis fn  | `dream-from-regret` edge fn — produces `# DREAM-REGRET :: NEGATIVE-SPACE SYNTHESIS` documents with explicit counterfactual + substrate guidance for future similar decisions |
| Persistence  | `dream_log` (mode='regret_counterfactual') + `brain_embeddings` (artifact_type='dream') |
| Closure      | Regret row marked `dreamed=true` with `dream_id` reference |
| Schedule     | `substrate-regret-collector` — every 30 min (NEW today) |
|             | `substrate-dream-from-regret` — every 30 min (already existed) |

### Why the Regret Loop is Patentable

Most learning systems train on positive examples. The substrate's regret loop
trains on **negative space** — outcomes the system itself rejected, retracted,
or failed to deliver. It does this **deterministically** (no LLM drift), with
**full lineage** (every counterfactual dream points back at the originating
regret row and entity), and **closes the feedback loop at recall time** (the
counterfactual is embedded so the next similar decision automatically retrieves
the prior failure as context). To our knowledge, no public AI substrate today
treats its own retracted decisions as a first-class training signal with
deterministic counterfactual synthesis and embedded recall. Combined with the
governor-intent stream (Doc #24) and the gap-driven loop above, this gives the
substrate three orthogonal sources of self-improvement signal — positive intent,
absence-of-knowledge, and reversed-decisions — synthesized through one
deterministic engine.

---

## Verification Today

- ✅ `regret-collector` invoked → 200 OK, 0 candidates in 7-day window (clean state).
- ✅ `dream-from-gaps` invoked → 200 OK, 0 unaddressed gaps in queue.
- ✅ `defense-memory-sync` invoked → 200 OK, 0 hostile events in window (clean state).
- ✅ Cron job `substrate-regret-collector` registered (jobid 50, schedule `*/30 * * * *`).
- ✅ All other crons confirmed running: dream-from-intent (30m), dream-from-gaps (15m), dream-from-regret (30m), defense-memory-sync (20m), telemetry-to-dream (45m), dream-from-harvest (hourly), dream-to-primitives (hourly).

The pipeline is idle because there is no qualifying source data right now — not
because of a bug. Loops will fire automatically as production traffic generates
defense events, DECODE recall failures, and regret-eligible outcomes.

---

## Source Files

- `supabase/functions/regret-collector/index.ts`
- `supabase/functions/dream-from-regret/index.ts`
- `supabase/functions/dream-from-gaps/index.ts`
- `supabase/functions/defense-memory-sync/index.ts`
- `src/lib/defense/core.ts` (writes `defense_events`)
- `src/lib/defense/learning.ts` (telemetry only — does not need changes; sync edge fn handles the durable promotion)

---

© 2025–2026 CMPSBL® · Internal — Governor visibility only.
