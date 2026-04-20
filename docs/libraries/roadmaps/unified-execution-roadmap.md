# CMPSBL® Unified Execution Roadmap — V2 (Tuned)

> Synthesizes `ascension-v2.md` (pipeline future) + `24-substrate-cohesion-audit.md`
> (substrate cleanup) + cross-checked against existing code, project rules,
> security posture, revenue loop, and federation roadmap.
>
> U.S. Patent App. No. 64/029,678 · © CMPSBL® · PromptFluid™
> Created: April 2026 · Version: 2 (tuned) · Status: ACTIVE
> Owner: Kenneth E. Sweet Jr. (solo) · Cadence: 6 sprints · 28 days

---

## What changed from V1 of this roadmap

| # | Change | Why |
|---|---|---|
| 1 | `/verify/:fingerprint` already exists → reframed as **deepen, not build** | Found `src/pages/VerifyFingerprint.tsx` |
| 2 | Added **Security/RLS sweep** as a track in every sprint | 432 public tables = high attack surface |
| 3 | Added **Edge-function observability** (auth/db/edge logs surfaced) | `supabase--analytics_query` available, untracked |
| 4 | Added **Revenue-loop metrics** (attach rate, checkout conv, re-ascend %) | Mana = distribution channel — must measure |
| 5 | Added **AST detector** as explicit *deferred* item with revival conditions | We discussed and deferred — record it |
| 6 | Added **CLI parity** (Mana CLI can fetch receipts) | Receipts must work outside the web UI |
| 7 | Added **Rollback path** for every cohesion drop | Irreversible drops need snapshot |
| 8 | Sprint 4 SSO/RBAC **descoped** to RBAC-only; SSO moves to post-roadmap | 4 days insufficient for full SSO |
| 9 | Added **Sprint 0 baseline measurement** task | Replaces "TBD" in metrics table |
| 10 | Added **Federation cross-ref** (XCTBL roadmap) | Avoid divergent roadmaps |
| 11 | Added **per-sprint Definition of Done** | Beyond exit criteria — concrete verify steps |
| 12 | Added **per-sprint credit ceiling** | Project rule: credits are real |

---

## Operating Principles (locked)

1. **Speedrun.** Each sprint = 3–5 days. No rolling.
2. **Parallel safe-tracks.** Feature + cleanup + security run together; only one in_progress task per track.
3. **No re-architecture.** All non-negotiables in `ascension-v2.md` + 40-Primitive matrix frozen.
4. **Credits are real.** Search-replace > rewrite; batch parallel; estimate before spend.
5. **Verify before claiming done.** Build → smoke test → receipt check → DoD checklist signed.
6. **Drops are reversible.** Every cohesion drop has a snapshot recorded first.
7. **Real data only.** No mocks, no hardcoded metrics.

---

## Convergence Map (where roadmaps meet)

| V2 Phase | Cohesion Hook | Federation Hook (XCTBL) | Joint Deliverable |
|---|---|---|---|
| P1 — Receipt Explorer | VAULT (11k+ promotions) | Receipt schema = federation contract | VAULT promotions surfaced in receipt drill-down |
| P1 — Failed-run forensics | LEX registry alive | LEX rule IDs portable cross-project | Gate failures cite Lex rule by ID |
| P2 — Smart layer recos | COMPILER → marketplace | Compiler output = federation product | Recos sourced from compiler output |
| P3 — Re-ascension loop | `marketplace_purchases` alive | Cross-project entitlement carryover | One-click re-run with newly owned layers |
| P4 — Repo connector / CI | `scan_*` + `discovery_*` | GitHub PR receipts shareable | URL → discovery → receipt in PR |
| P5 — Determinism proofs | MUTATION → EVOLUTION fold | Reproducibility = federation trust | Single engine name in every receipt |
| P5 — Chain anchoring | `audit_chain_anchors` alive | Federated chain anchors | Periodic head anchor (finish partial) |
| P6 — Scale & polish | Cohesion v2 audit | Federation landing alignment | 280-table target + flagship `/ascension-v2` |

---

## SPRINT 0 — Pre-Flight + Baseline (Day 0, 2–3 hrs · ≤2 credits)

**Goal:** Honest starting line. No work begins until "TBD" is replaced with numbers.

- [ ] Confirm Ascension V2 build green (`bun run build`)
- [ ] Confirm `audit_chain_anchors` accepting writes (insert test row, delete it)
- [ ] Confirm `vault_*` + `compiler_*` tables responsive (`select count(*)`)
- [ ] Snapshot `mem://index.md` Core rules
- [ ] **Measure baselines** for the metrics table (runs/week, attach rate, median duration, table count, theater count)
- [ ] Run `security--get_scan_results` → log current finding count as Sprint 0 baseline
- [ ] Confirm `/verify/:fingerprint` route works against a known artifact

**DoD:** Metrics table "Today" column has real numbers. No "TBD".

---

## SPRINT 1 — Trust & Visibility + Theater Removal (Days 1–4 · ≤8 credits)

**Goal:** Public proof of every run. Drop confirmed-dead tables safely.

### V2 Track — Receipt Explorer (Phase 1)
- [ ] **Deepen** existing `/verify/:fingerprint`: add per-phase audit drill-down
      (init → upload → discovery → locking → ascension → complete)
- [ ] Surface VAULT promotion count + top promoted capabilities per receipt
- [ ] Failed-run forensics: when Pre-Ascension Gate fails, cite failing check + remediation hint
- [ ] Pre-flight estimator: projected layer count + language count *before* upload

### Cohesion Track — Drop Theater (with rollback)
- [ ] **Snapshot first:** export `cascade_*`, `brain_curiosity_*`, `brain_persona_*` to `/mnt/documents/cohesion-snapshots/sprint-1.sql`
- [ ] DROP `cascade_*` (3 tables)
- [ ] DROP `brain_curiosity_*` + `brain_persona_*`
- [ ] Classify 5 of the ~50 `❓ review` 1-table prefixes (start the queue)

### Security Track
- [ ] Run `security--run_security_scan` → fix any finding tied to dropped tables

### CLI Parity Track
- [ ] `mana receipts get <fingerprint>` returns same payload as `/verify/:fingerprint`

**Exit criteria:** Any user (web OR CLI) can verify any run. Zero confirmed-theater tables remain.
**DoD:** Smoke test 3 fingerprints on web + CLI · scan finding count ≤ Sprint 0 baseline · changelog entry written.

---

## SPRINT 2 — Discovery Intelligence + Naming Cleanup (Days 5–8 · ≤10 credits)

**Goal:** Smart recommendations + finish the rename queue.

### V2 Track — Smart Recommendations (Phase 2)
- [ ] Recommendation engine: detected capabilities → top 3 Crown Jewel layers
- [ ] "Why this layer": collision score + evidence + Lex rule reference
- [ ] Compatibility preview: simulate merge before purchase (uses `simulateMergeBatch`)
- [ ] Bundle suggestions: co-attached layers → discounted bundle SKU

### Cohesion Track — Rename + Migrate (snapshot each)
- [ ] `modernizer_*` (7) → fold into `evolution_*`
- [ ] `mutation_*` (3) → fold into `evolution_*`
- [ ] `mesh_*` (6) → rename to `layer_*`
- [ ] `module_*` + `node_*` → rename to `primitive_*`
- [ ] `immune_*` (3) → consolidate into `immunity_*`
- [ ] `learning_*` (6) → fold into `brain_*` edges/crystals

### Security Track
- [ ] Re-scan after each rename — confirm RLS policies migrated, not orphaned

### Observability Track
- [ ] Add edge-function log query helper: surface last-100 errors on `/control` admin page

**Exit criteria:** One name per concept. Recos visible in Step 2 of `/ascension-v2`.
**DoD:** No legacy table names in `src/integrations/supabase/types.ts` · recos render real data · scan clean.

---

## SPRINT 3 — Customer Activation Loop + Revenue Metrics (Days 9–12 · ≤8 credits)

**Goal:** Close post-purchase loop. Make the revenue loop measurable.

### V2 Track — Activation (Phase 3)
- [ ] Post-purchase email + in-app banner → `/ascension-v2`
- [ ] "My Layers" dashboard: owned layers, attach history, re-download artifacts
- [ ] One-click re-ascension of prior uploads with newly-owned layers
- [ ] Artifact versioning: v1/v2/v3 with diff view

### Cohesion Track — Developer Surface
- [ ] Classify `developer_*` (8 tables, ❓) — keep / fold into ACCESS / drop
- [ ] Classify `global_*` (3 tables, ❓)

### Revenue Track (NEW)
- [ ] Instrument funnel: `upload_started → enhance_viewed → layer_selected → checkout_started → purchase_completed → re_ascended`
- [ ] Surface in `/control` Master Power Center as a single chart
- [ ] Define Sprint 6 conversion targets from baseline measured here

### Security Track
- [ ] RLS sweep on `marketplace_*` + `user_layer_entitlements` — paid-asset tables

**Exit criteria:** Returning customer can re-run any prior upload in <3 clicks. Funnel visible.
**DoD:** End-to-end test (signup → upload → buy → re-ascend) green · funnel chart shows non-zero data.

---

## SPRINT 4 — Enterprise Surface (Days 13–17 · ≤12 credits)

**Goal:** Repo-scale + team-scale + CI integration. **SSO descoped.**

### V2 Track — Enterprise (Phase 4, descoped)
- [ ] GitHub repo connector: URL → smart map → confirm → scan
- [ ] CI/CD webhook: auto-ascend on push, post receipt to PR
- [ ] Org workspace: shared layer library, audit log per member
- [ ] **RBAC only** for Architect-tier teams (uses `user_roles` + `governance_*`)
- [ ] ~~SSO~~ → moved to **Post-Roadmap Backlog** (needs separate 5-day sprint)

### Cohesion Track — Single-Table Sweep
- [ ] Process all remaining `❓ review` 1-table prefixes (~45 tables) in PRs of 10
- [ ] Classification gates: alive (keep) / migrate (fold) / theater (drop + snapshot)

### Security Track
- [ ] Penetration-style test on org-workspace data isolation
- [ ] Verify CI webhook signature validation (HMAC)

**Exit criteria:** A team can attach a repo, push code, see receipts in their PR.
**DoD:** Two test orgs cannot see each other's receipts · webhook rejects unsigned payloads.

---

## SPRINT 5 — Determinism Guarantees (Days 18–22 · ≤10 credits)

**Goal:** Cryptographic reproducibility. The defining V2 promise.

### V2 Track — Determinism (Phase 5)
- [ ] Reproducibility proof: same input + layers → byte-identical output
- [ ] Public verification UI: paste two fingerprints → diff or match badge
- [ ] Periodic Merkle head anchoring to `audit_chain_anchors` (finish partial)
- [ ] Third-party attestation: signed receipts importable into external SBOM tools
- [ ] Replay mode: re-execute historical run from receipt alone

### Cohesion Track — Engine Naming Lock
- [ ] Confirm `mutation_*` + `modernizer_*` fold complete (Sprint 2 dep)
- [ ] Receipts reference **EVOLUTION only** — no legacy engine names anywhere
- [ ] CI guard: build fails if `modernizer` or `mutation` strings appear in receipt emitters

### Federation Cross-Ref Track (NEW)
- [ ] Confirm XCTBL federation receipt schema matches V2 receipt schema
  (see `docs/libraries/roadmaps/cmpsbl-xctbl-federation-roadmap.md`)

**Exit criteria:** Reproducibility provable from receipt alone. Federation contract holds.
**DoD:** Two independent runs of identical input produce identical fingerprints in CI.

---

## SPRINT 6 — Scale & Polish (Days 23–28 · ≤10 credits)

**Goal:** Production scale + flagship landing + final cohesion sweep.

### V2 Track — Scale (Phase 6)
- [ ] Streaming export: large repos process incrementally with progress
- [ ] Parallel language emission: 9 emitters in parallel, not sequential
- [ ] Cached fingerprints: skip re-discovery on unchanged files
- [ ] `/ascension-v2` SEO + landing rebuild as flagship surface
      (metadata, sitemap entry, OG image, JSON-LD)

### Cohesion Track — Final Sweep + v2 Publication
- [ ] Re-run cohesion audit — confirm 432 → ~280 (target 35% reduction)
- [ ] Publish updated audit as `25-substrate-cohesion-audit-v2.md`
- [ ] Update `mem://architecture/` references to point at v2 audit

### Documentation Track (NEW — per project rules)
- [ ] Update `/changelog` with all 6 sprints
- [ ] Update `llms.txt`, `humans.txt`, `sitemap.xml`
- [ ] Update `docs/libraries/internal/` index

**Exit criteria:** 1k+ runs/week capacity demonstrated. Cohesion debt cleared.
**DoD:** Lighthouse ≥ 90 on `/ascension-v2` · cohesion v2 audit published · changelog current.

---

## Deferred / Post-Roadmap Backlog

Items intentionally *not* in this roadmap, with revival conditions:

| Item | Why deferred | Revival trigger |
|---|---|---|
| **AST-based detection** (tree-sitter) | 99.3% recall on natural corpus; only adversarial misses | Paying customer hits a real-world miss OR Sprint 5 needs AST-backed proofs |
| **SSO** (SAML/OIDC) | 4-day sprint insufficient for full impl + testing | Architect-tier customer signs annual contract |
| **Streaming language emission to disk** | Bundle size | Repo > 10k files attempted |
| **Multi-region edge function deploys** | No latency complaints yet | p95 > 2s sustained |
| **Real-time collaborative attach** | Single-founder usage pattern | Org workspace gets >5 active members |

---

## Frozen / Non-Negotiable

- Pipeline phase order immutable
- Audit chain Merkle linkage cannot be altered
- Inline embedding mandate (no sibling requires)
- Zero external AI calls in Ascension (NEXUS only outside Ascension)
- Layer 2 runtime engines frozen unless founder approves
- Vertical access dual-gate preserved
- Patent boundary: Ascension collision = Patent #1 · Mana attach/deploy = Patent #2 · converge in V2 export
- Terminology: Cognitives ≠ Agents · Clarity = INCLUSIVE · MODERNIZER/MUTATION = legacy → EVOLUTION
- Protected paths: organ internals, layer routing, CLM serialization, defense shielding, governance, memory stream pipeline, dream synthesis, ascension engine, auth flow, supabase/migrations, src/config

---

## Success Metrics

> Sprint 0 fills the "Today" column with measured values — no TBDs.

| Metric | Today | End S3 | End S6 |
|---|---|---|---|
| Successful runs / week | _S0_ | 100 | 1,000 |
| Avg layers attached / run | _S0_ | 3 | 5 |
| **Attach → checkout conversion** | _S0_ | 15% | 30% |
| **Re-ascension rate** | _S0_ | 25% | 50% |
| Pre-gate failure clarity | low | high | high |
| Median run duration | _S0_ | <30s | <10s |
| Reproducibility verification | none | manual | automated |
| **CLI feature parity (receipts)** | partial | full | full |
| Public table count | _S0_ | ~360 | ~280 |
| Confirmed-theater tables | _S0_ | 0 | 0 |
| Legacy engine names in receipts | yes | no | no |
| **Open security findings (high+)** | _S0_ | 0 | 0 |
| **Funnel events instrumented** | 0 | 6 | 6 |

---

## Execution Cadence

- **Daily:** Self stand-up — current sprint checklist in commit message
- **Sprint end:** Smoke test → DoD signed → changelog → publish artifact
- **End of roadmap (Day 28):** Re-run cohesion audit → regenerate this roadmap from fresh state → archive this version as `unified-execution-roadmap-v2.md`

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Sprint 2 renames break runtime references | CI guard runs `bun run build` after each rename PR |
| Cohesion drops break federated XCTBL projects | Sprint 5 federation cross-ref task verifies before any drop |
| Sprint 4 RBAC ships with org isolation bug | DoD requires two-org isolation test |
| Determinism proof fails on layer non-determinism | Sprint 5 isolates layer execution into deterministic shell first |
| Credit overrun mid-sprint | Per-sprint ceilings declared; founder approval required to exceed |

---

*© CMPSBL® · PromptFluid™ · 2026 · Tuned · Ready to execute.*
