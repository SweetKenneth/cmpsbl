# CMPSBL® Unified Execution Roadmap — Ship Now

> Synthesizes `ascension-v2.md` (pipeline future) + `24-substrate-cohesion-audit.md`
> (substrate cleanup) into one ordered, executable backlog. Aligned at the
> endpoints where both roadmaps meet: **VAULT receipts**, **COMPILER → Marketplace**,
> **LEX registry health**, **MUTATION → EVOLUTION fold**, **determinism proofs**.
>
> U.S. Patent App. No. 64/029,678 · © CMPSBL® · PromptFluid™
> Created: April 2026 · Status: ACTIVE · Owner: Kenneth E. Sweet Jr. (solo)

---

## Operating Principles (locked)

1. **Speedrun.** Every sprint ships in 3–5 days, not weeks.
2. **Parallel where safe.** Cleanup tracks (cohesion) run alongside feature tracks (V2).
3. **No re-architecture.** All non-negotiables from `ascension-v2.md` and the 40-Primitive matrix are frozen.
4. **Credits are real.** Search-replace > rewrite. Batch parallel calls.
5. **Verify before claiming done.** Build → smoke test → receipt check.

---

## Convergence Map (where the two roadmaps meet)

| V2 Phase                          | Cohesion Audit Hook              | Joint Deliverable                              |
|-----------------------------------|----------------------------------|------------------------------------------------|
| Phase 1 — Receipt Explorer        | VAULT (11k+ promotions) alive    | Surface VAULT promotions in receipt drill-down |
| Phase 1 — Failed-run forensics    | LEX registry alive               | Gate failures cite Lex rule by ID              |
| Phase 2 — Smart layer recos       | COMPILER → marketplace.cmpsbl    | Recos sourced from compiler output             |
| Phase 4 — Repo connector / CI     | `scan_*` + `discovery_*` alive   | GitHub URL → discovery tables → receipt        |
| Phase 5 — Determinism proofs      | MUTATION → EVOLUTION fold        | One engine name in reproducibility receipts    |
| Phase 5 — Chain anchoring         | `audit_chain_anchors` alive      | Periodic head anchor (already partial)         |

---

## SPRINT 0 — Pre-Flight (Day 0, 1–2 hrs)

Before any sprint runs:
- [ ] Confirm Ascension V2 build is green
- [ ] Confirm `audit_chain_anchors` table accepting writes
- [ ] Confirm `vault_*` and `compiler_*` tables responsive
- [ ] Snapshot current `mem://index.md` Core rules

---

## SPRINT 1 — Trust & Visibility + Theater Removal (Days 1–4)

**Goal:** Public proof of every run + remove confirmed dead weight.

### V2 Track — Receipt Explorer (Phase 1)
- [ ] `/ascension-v2/verify` — paste fingerprint → chain proof page
- [ ] Receipt drill-down: per-phase audit entry (init / upload / discovery / locking / ascension / complete)
- [ ] Surface VAULT promotion count + top promoted capabilities per receipt
- [ ] Failed-run forensics: when Pre-Ascension Gate fails, cite the failing check + suggested fix
- [ ] Pre-flight estimator: projected layer count + language count before upload

### Cohesion Track — Drop Theater
- [ ] DROP `cascade_*` (3 tables, confirmed theater)
- [ ] DROP `brain_curiosity_*` + `brain_persona_*` (theater subset of brain_*)
- [ ] Audit `❓ review` single-table prefixes — classify each as alive/migrate/drop

**Exit criteria:** Any user can verify any run. Zero confirmed-theater tables remain.

---

## SPRINT 2 — Discovery Intelligence + Naming Cleanup (Days 5–8)

**Goal:** Make layer recommendations smart + finish the rename queue.

### V2 Track — Smart Recommendations (Phase 2)
- [ ] Recommendation engine: read detected capabilities → suggest top 3 Crown Jewel layers
- [ ] "Why this layer" explainer: collision score + evidence + Lex rule reference
- [ ] Compatibility preview: simulate merge before purchase (uses `simulateMergeBatch`)
- [ ] Bundle suggestions: frequently co-attached layers → discounted bundle

### Cohesion Track — Rename + Migrate
- [ ] `modernizer_*` (7 tables) → fold into `evolution_*`
- [ ] `mutation_*` (3 tables) → fold into `evolution_*`
- [ ] `mesh_*` (6 tables) → rename to `layer_*` (LAYERS owner)
- [ ] `module_*` + `node_*` → rename to `primitive_*` (per terminology map)
- [ ] `immune_*` (3 tables) → consolidate into `immunity_*`
- [ ] `learning_*` (6 tables) → fold into `brain_*` edges/crystals

**Exit criteria:** One name per concept. Recos visible in Step 2 of `/ascension-v2`.

---

## SPRINT 3 — Customer Activation Loop (Days 9–12)

**Goal:** Close the post-purchase loop. Re-ascension becomes one click.

### V2 Track — Activation (Phase 3)
- [ ] Post-purchase email + in-app banner → `/ascension-v2`
- [ ] "My Layers" dashboard: owned layers, attach history, re-download artifacts
- [ ] One-click re-ascension of prior uploads with newly-owned layers
- [ ] Artifact versioning: v1/v2/v3 of same source with diff view

### Cohesion Track — Developer Surface Audit
- [ ] Classify `developer_*` (8 tables, ❓ review) — keep, fold into ACCESS, or drop
- [ ] Classify `global_*` (3 tables, ❓ review) — same decision tree

**Exit criteria:** Returning customer can re-run any prior upload in <3 clicks.

---

## SPRINT 4 — Enterprise Surface (Days 13–17)

**Goal:** Repo-scale + team-scale + CI integration.

### V2 Track — Enterprise (Phase 4)
- [ ] GitHub repo connector: URL → smart map → confirm → scan (spec exists)
- [ ] CI/CD webhook: auto-ascend on push, post receipt to PR
- [ ] Org workspace: shared layer library, audit log per member
- [ ] SSO + RBAC for Architect-tier teams (uses `user_roles` + `governance_*`)

### Cohesion Track — Single-Table Sweep
- [ ] Process all `❓ review` 1-table prefixes from cohesion audit (~50 tables)
  Classification: alive (keep) / migrate (fold) / theater (drop). Batch in PRs of 10.

**Exit criteria:** A team can attach a repo, push code, and see receipts in their PR.

---

## SPRINT 5 — Determinism Guarantees (Days 18–22)

**Goal:** Cryptographic reproducibility. The defining V2 promise.

### V2 Track — Determinism (Phase 5)
- [ ] Reproducibility proof: same input + layers → byte-identical output
- [ ] Public verification UI: paste two fingerprints → diff or match
- [ ] Periodic Merkle head anchoring to `audit_chain_anchors` (finish partial impl)
- [ ] Third-party attestation: signed receipts importable into external SBOM tools
- [ ] Replay mode: re-execute historical run from receipt alone

### Cohesion Track — Engine Naming Lock
- [ ] Confirm `mutation_*` + `modernizer_*` fold complete (Sprint 2 dependency)
- [ ] Receipts reference **EVOLUTION only** — no legacy engine names
- [ ] Add CI guard: fail build if `modernizer` or `mutation` strings appear in receipt emitters

**Exit criteria:** Reproducibility provable from receipt alone.

---

## SPRINT 6 — Scale & Polish (Days 23–28)

**Goal:** Production scale + flagship landing.

### V2 Track — Scale (Phase 6)
- [ ] Streaming export: large repos process incrementally with progress
- [ ] Parallel language emission: 9 emitters in parallel, not sequential
- [ ] Cached fingerprints: skip re-discovery on unchanged files
- [ ] `/ascension-v2` SEO + landing rebuild as flagship surface

### Cohesion Track — Final Sweep
- [ ] Run cohesion audit again — confirm 432 → ~280 tables (target 35% reduction)
- [ ] Publish updated cohesion audit as v2

**Exit criteria:** 1k+ runs/week capacity. Cohesion debt cleared.

---

## Frozen / Non-Negotiable (carried from both roadmaps)

- Pipeline phase order immutable
- Audit chain Merkle linkage cannot be altered
- Inline embedding mandate (no sibling requires)
- Zero external AI calls in Ascension (NEXUS only outside Ascension)
- Layer 2 runtime engines frozen unless founder approves
- Vertical access dual-gate preserved
- Patent boundary: Ascension collision = Patent #1 · Mana attach/deploy = Patent #2 · converge in V2 export
- Terminology: Cognitives ≠ Agents · Clarity = INCLUSIVE · MODERNIZER/EVOLVE = legacy → EVOLUTION
- Protected paths (per project rules): organ internals, layer routing, CLM serialization, defense shielding, governance, memory stream pipeline, dream synthesis, ascension engine, auth flow, supabase/migrations, src/config

---

## Success Metrics (track weekly)

| Metric                          | Today  | End Sprint 3 | End Sprint 6 |
|---------------------------------|--------|--------------|--------------|
| Successful runs / week          | TBD    | 100          | 1,000        |
| Avg layers attached per run     | 1      | 3            | 5            |
| Re-ascension rate               | 0%     | 25%          | 50%          |
| Pre-gate failure clarity        | low    | high         | high         |
| Median run duration             | ~?s    | <30s         | <10s         |
| Reproducibility verification    | none   | manual       | automated    |
| Public table count              | 432    | ~360         | ~280         |
| Confirmed-theater tables        | ~10+   | 0            | 0            |
| Legacy engine names in receipts | yes    | no           | no           |

---

## Execution Cadence

- **Daily:** Stand-up against current sprint checklist (self, in commit messages)
- **Sprint end:** Smoke test → update changelog → publish artifact
- **End of roadmap (Day 28):** Re-run cohesion audit, regenerate this roadmap from fresh state

---

*© CMPSBL® · PromptFluid™ · 2026 · Ready to execute.*
