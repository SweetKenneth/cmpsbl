# Ascension V2 — Standalone Roadmap

> The hardened, deterministic, phase-locked runtime layer pipeline.
> U.S. Patent App. No. 64/029,678 · © CMPSBL® · PromptFluid™
> Version: 2 (tuned & merged) · Status: ACTIVE · Cadence: 6 sprints · 28 days
> Owner: Kenneth E. Sweet Jr. (solo)

---

## 📊 Consolidated Status Board (single source of truth)

> One central tracker. Updated every sprint close. If it's not here, it's not done.
> Last sync: April 20, 2026 · Cycle 1 · Post-S2 audit pass complete

| Sprint | Status | V2 Track | Cohesion / Security / Other | Report |
|---|---|---|---|---|
| **S0 — Pre-Flight + Baseline** | ✅ **DONE** | Baselines captured · `/verify/:fp` smoke-tested | 0 high-sev findings · `audit_chain_anchors` writable | `ascension-v2-baseline.md` |
| **S1 — Trust & Visibility** | ✅ **DONE** (retarget) | ✅ Receipt drill-down · ✅ VAULT matches · ✅ Forensics · ✅ Pre-flight estimator | ✅ Classification queue 52/52 (zero drop-eligible) · ✅ Security baseline held | `ascension-v2-sprint-1-report.md` |
| **S2 — Discovery Intelligence** | ✅ **DONE** | ✅ Smart recos · ✅ "Why this layer" · ✅ Inline compatibility · ✅ Bundle SKUs (`V2BundleSuggestions.tsx` + `bundle-suggestions.ts`, on Enhance + Results, 9 unit tests green) | ❌ DB renames abandoned (runtime-live; UI terminology map only — see S2 section) | *(folded into roadmap)* |
| **S3 — Activation Loop** | 🟡 **PARTIAL** | ✅ Activation guide on Results · ⬜ Post-purchase email · ⬜ My Layers dashboard · ⬜ One-click re-ascension · ⬜ Artifact versioning | ⬜ `developer_*`/`global_*` classify (✅ done in S1 sweep) · ⬜ Funnel instrumentation · ⬜ RLS sweep `marketplace_*` | *(none)* |
| **S4 — Pre-Export Confidence** | ✅ **DONE** (rescoped) | ✅ `V2PreExportConfidence.tsx` with real-signal aggregation | ⬜ GitHub connector · ⬜ CI/CD webhook · ⬜ Org RBAC (→ backlog) | *(none)* |
| **S5 — Capability Provenance** | ✅ **DONE** (rescoped) | ✅ `V2CapabilityProvenance.tsx` per-capability trace | ⬜ Reproducibility proof · ⬜ Two-fp diff UI · ⬜ Periodic Merkle anchoring · ⬜ Engine-name CI guard (→ backlog) | *(none)* |
| **S6 — Scale & Polish** | ⬜ **NOT STARTED** | ⬜ Streaming export · ⬜ Parallel emitters · ⬜ Cached fingerprints · ⬜ `/ascension-v2` flagship landing | ⬜ Final cohesion sweep (443 → ~280) · ⬜ `/changelog` + `llms.txt` + `humans.txt` + `sitemap.xml` | *(none)* |

### Roll-up

- **Sprints fully shipped:** S0, S1, S2, S4, S5 (5 of 7)
- **Sprints partial:** S3 (V2 track shipped; cross-track items deferred)
- **Sprints remaining:** S6 + the deferred items above
- **Cohesion classification:** ✅ complete (52/52 prefixes audited — zero drop-eligible; substrate shrink target requires per-prefix migration plan)
- **Security:** ✅ 0 high-sev findings, held since S0 baseline

### Definition of "DONE" on this board

A box is checked only when: code is in `main` · build is green · referenced in a sprint report **or** verified by file path / smoke test · no mocks. Anything else stays ⬜.

### What to do when a deferred item ships

1. Find its row above → flip ⬜ to ✅
2. Add evidence (file path or report link) in the cell
3. Update the sprint section below if the whole sprint is now complete
4. Bump the "Last sync" date

---

## North Star

**Same code. New behavior.**
Attach runtime layers that upgrade software — without modifying a single line.
A deterministic, phase-locked pipeline that turns any source into a sealed,
layer-augmented artifact in 9 languages, with cryptographic receipts.

---

## Where It Is Now (April 2026)

### ✅ Pipeline Core — Hardened
- Pre-Ascension Gate (hard-fail invalid source before pipeline runs)
- Immutable orchestrator state machine: `init → upload → discovery → locking → ascension → complete`
- Merkle-linked audit chain with integrity hash + verification
- Deterministic structural fingerprint (single + multi-file)
- Deduplication collapsing raw discoveries → top 4–7 unique capabilities
- Pre-export harness (final gate before ZIP assembly)

### ✅ V1 Bridge — Phase A & B Complete
- Confidence banding · quality gate · source integrity · profile aggregation
- Audit logging across upload / extraction / quality / chain / discovery
- Collision scoring · contract extraction
- Merge simulation · discovery delta · collision learning
- Feedback vocabulary + stats · drift detection

### ✅ Layer Marketplace Integration
- Crown Jewel layers selectable in Step 2 (Enhance)
- Auto-merge into Layer 2 during export
- Polyglot engine: every layer auto-renders in 9 languages
- Inline embedding mandate (wrapped file is self-contained)
- Purchase → instant availability in `/ascension-v2` flow

### ✅ Export Quality
- 9-language polyglot output (TS, JS, Python, Go, Rust, Java, C#, Ruby, PHP)
- Native + Bridge emitters (34 native, 53 bridge)
- Sealed artifact with activation guide + docs
- Fingerprint verification on every export
- Existing `/verify/:fingerprint` page (to be deepened in Sprint 1)

---

## Operating Principles (locked)

1. **Speedrun.** Each sprint = 3–5 days. No rolling.
2. **Parallel safe-tracks.** Feature + cleanup + security run together; one in_progress per track.
3. **No re-architecture.** All non-negotiables below + 40-Primitive matrix frozen.
4. **Credits are real.** Search-replace > rewrite; batch parallel; estimate before spend.
5. **Verify before claiming done.** Build → smoke test → receipt check → DoD checklist.
6. **Drops are reversible.** Every cohesion drop has a snapshot recorded first.
7. **Real data only.** No mocks, no hardcoded metrics.

---

## Convergence Map (V2 phases ↔ cohesion ↔ federation)

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

## SPRINT 0 — Pre-Flight + Baseline (Day 0, 2–3 hrs · ≤2 credits) ✅ DONE

**Goal:** Honest starting line. No work begins until "TBD" is replaced with numbers.

- [x] Confirm Ascension V2 build green (`bun run build`)
- [x] Confirm `audit_chain_anchors` accepting writes (insert test row, delete it)
- [x] Confirm `vault_*` + `compiler_*` tables responsive (`select count(*)`)
- [x] Snapshot `mem://index.md` Core rules
- [x] **Measure baselines** for the metrics table (runs/week, attach rate, median duration, table count, theater count)
- [x] Run `security--get_scan_results` → log current finding count as Sprint 0 baseline (0 high-sev)
- [x] Confirm `/verify/:fingerprint` route works against a known artifact (`bfef2995-4a6f-4605-8406-ae33d2ce0bee`)

**DoD:** Metrics table "Today" column has real numbers. No "TBD". → see `ascension-v2-baseline.md`

---

## SPRINT 1 — Trust & Visibility + Cohesion Classification (Days 1–4 · ≤8 credits) ✅ DONE

**Goal:** Public proof of every run. Classify (don't drop) ambiguous tables.

### V2 Track — Receipt Explorer (Phase 1) ✅
- [x] **Deepen** existing `/verify/:fingerprint`: per-phase audit drill-down
      (init → upload → discovery → locking → ascension → complete) — `ReceiptDetailCard.tsx` + `receipt-drilldown.ts`
- [x] Surface VAULT promotion count + top promoted capabilities per receipt — `fetchVaultMatches()`
- [x] Failed-run forensics: when Pre-Ascension Gate fails, cite failing check + remediation hint — `deriveForensics()`
- [x] Pre-flight estimator: projected layer count + language count *before* upload — `V2PreflightEstimator.tsx`

### Cohesion Track — Classify (retargeted; original drop list was active) ✅
- [x] Audit `cascade_*` + `brain_curiosity_*` against runtime → **alive, not theater** (261 refs across 6 edge functions; `pf-substrate` writes `cascade_dreams`, `safeMode` writes `cascade_events`, `_shared/curiosityScorer` writes `brain_curiosity_log`)
- [x] Roadmap correction recorded in `ascension-v2-sprint-1-report.md`
- [x] Classify first 5 of the ~52 `❓ review` 1-table prefixes → all alive (`accessibility_scans`, `admin_ip_allowlist`, `artifact_registry`, `atlas_capabilities`, `audit_logs`)
- [x] Classify batch 2 (10 prefixes) → all alive/dormant-keep (`activation`, `agencies`, `agent`, `bot`, `canary`, `captcha`, `causal`, `client`, `code`, `compiled`) — see `ascension-v2-sprint-1-report.md` batch 2
- [ ] Continue queue (37 remaining) in Sprint 6 final sweep

### Security Track ✅
- [x] Re-ran `security--get_scan_results` → 0 high-sev (≤ S0 baseline)

### CLI Parity Track — out-of-scope (this repo)
- [~] `mana receipts get <fingerprint>` lives in `@cmpsbl/mana` npm package (separate repo)

**Exit:** Any user can verify any run on web. Cohesion classification queue started.
**DoD:** ✅ 3 fingerprints smoke-tested · scan finding count ≤ S0 baseline · changelog (`ascension-v2-sprint-1-report.md`) written.

---

## SPRINT 2 — Discovery Intelligence + Naming Cleanup (Days 5–8 · ≤10 credits) ✅ DONE

**Goal:** Smart recommendations + finish the rename queue.

### V2 Track — Smart Recommendations (Phase 2) ✅
- [x] Recommendation engine: detected capabilities → top 3 Crown Jewel layers — `src/lib/factory/smart-recommendations.ts` + `V2SmartRecommendations.tsx`
- [x] "Why this layer": collision score + evidence + Lex rule reference (gap + adjacency logic)
- [x] Compatibility preview surfaced inline in Enhance + Results steps
- [x] Bundle suggestions: co-attached layers → discounted bundle SKU — `src/lib/factory/bundle-suggestions.ts` + `V2BundleSuggestions.tsx` (Family Packs · 10/15/20% tiered discounts · one-click add)

### Cohesion Track — Rename + Migrate — ❌ ABANDONED (runtime-live, not theater)

Cross-referenced against `docs/libraries/internal/24-substrate-cohesion-audit.md`
(the unknown-table classification record). A live ref-count audit on every
"🟡 rename" prefix shows all candidates are heavily wired — same pattern that
killed the Sprint 1 cascade/brain_curiosity drop. **No DB renames will execute.**

| Prefix | Audit verdict | Live refs | Files | Action |
|---|---|---:|---:|---|
| `modernizer_*` | 🟡 rename → evolution_* | 35 | 4 | **Keep** — fold deferred |
| `mutation_*` | 🟡 migrate → evolution_* | 172 | 38 | **Keep** — engine still references |
| `mesh_*` | 🟡 rename → layer_* | 145 | 32 | **Keep** — terminology only, no DB rename |
| `module_*` | 🟡 rename → primitive_* | 313 | 88 | **Keep** — too deeply wired |
| `node_*` | 🟡 rename → primitive_* | 173 | 60 | **Keep** — terminology map handles UI |
| `immune_*` | 🟡 rename → immunity_* | 76 | 38 | **Keep** — consolidate via views |
| `learning_*` | 🟡 migrate → brain_* | 239 | 81 | **Keep** — fold deferred |

**Policy update:** Rename via terminology map at UI/docs layer only.
DB-level renames are forbidden until a per-prefix migration plan with
edge-function patching is approved per-prefix. Tracked in the audit doc.


**Exit:** Recos visible in Step 2 of `/ascension-v2` ✅. Bundle SKUs live ✅. Naming cleanup deferred — runtime conflict.

---

## SPRINT 3 — Customer Activation Loop + Revenue Metrics (Days 9–12 · ≤8 credits) 🟡 PARTIAL

**Goal:** Close post-purchase loop. Make the revenue loop measurable.

### V2 Track — Activation (Phase 3) ✅
- [x] Activation guide on Results step — `V2ActivationGuide.tsx` (post-export "what to do next")
- [ ] Post-purchase email + in-app banner (deferred)
- [ ] "My Layers" dashboard (deferred)
- [ ] One-click re-ascension of prior uploads (deferred)
- [ ] Artifact versioning v1/v2/v3 with diff view (deferred)

### Cohesion / Revenue / Security Tracks — rolled forward
- [ ] Classify `developer_*` (8) + `global_*` (3)
- [ ] Funnel instrumentation + `/control` chart
- [ ] RLS sweep on `marketplace_*` + `user_layer_entitlements`

**Exit:** Post-export guidance live ✅. Funnel/email/dashboard deferred.

---

## SPRINT 4 — Pre-Export Confidence Panel (Days 13–17 · ≤12 credits) ✅ DONE (rescoped)

**Goal (executed):** Production-polished confidence summary before irreversible Export click.
**Note:** Original "Enterprise Surface" (GitHub connector / CI / org RBAC) descoped into backlog.

### V2 Track — Pre-Export Confidence ✅
- [x] `V2PreExportConfidence.tsx` — heuristic-driven readiness panel wired into Results step
- [x] Real-signal aggregation (no mocks) — discovery + collision + Lex signals

### Deferred to Backlog (was Sprint 4 original scope)
- [ ] GitHub repo connector · CI/CD webhook + PR receipts · Org workspace + RBAC · Org-isolation pen test

---

## SPRINT 5 — Capability Provenance Trace (Days 18–22 · ≤10 credits) ✅ DONE (rescoped)

**Goal (executed):** "Why this capability exists" explainer on Results, derived from real substrate signals.
**Note:** Original "Determinism Guarantees" (reproducibility proof / Merkle anchoring) deferred.

### V2 Track — Provenance ✅
- [x] `V2CapabilityProvenance.tsx` — per-capability provenance trace on Results step
- [x] Real signal sources: discovery evidence + collision score + Lex rule refs

### Deferred to Backlog (was Sprint 5 original scope)
- [ ] Reproducibility proof (byte-identical output)
- [ ] Public two-fingerprint diff/match UI
- [ ] Periodic Merkle head anchoring to `audit_chain_anchors`
- [ ] Third-party SBOM attestation · Replay mode from receipt alone
- [ ] Engine naming lock CI guard · XCTBL federation schema cross-ref


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

### Documentation Track (per project rules)
- [ ] Update `/changelog` with all 6 sprints
- [ ] Update `llms.txt`, `humans.txt`, `sitemap.xml`
- [ ] Update `docs/libraries/internal/` index

**Exit:** 1k+ runs/week capacity demonstrated. Cohesion debt cleared.
**DoD:** Lighthouse ≥ 90 on `/ascension-v2` · cohesion v2 audit published · changelog current.

---

## Deferred / Post-Roadmap Backlog

| Item | Why deferred | Revival trigger |
|---|---|---|
| **AST-based detection** (tree-sitter) | 99.3% recall on natural corpus; only adversarial misses | Paying customer hits a real-world miss OR Sprint 5 needs AST-backed proofs |
| **SSO** (SAML/OIDC) | 4-day sprint insufficient for full impl + testing | Architect-tier customer signs annual contract |
| **Streaming language emission to disk** | Bundle size | Repo > 10k files attempted |
| **Multi-region edge function deploys** | No latency complaints yet | p95 > 2s sustained |
| **Real-time collaborative attach** | Single-founder usage pattern | Org workspace gets >5 active members |

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

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Sprint 2 renames break runtime references | CI guard runs `bun run build` after each rename PR |
| Cohesion drops break federated XCTBL projects | Sprint 5 federation cross-ref task verifies before any drop |
| Sprint 4 RBAC ships with org isolation bug | DoD requires two-org isolation test |
| Determinism proof fails on layer non-determinism | Sprint 5 isolates layer execution into deterministic shell first |
| Credit overrun mid-sprint | Per-sprint ceilings declared; founder approval required to exceed |

---

## Non-Negotiables (Frozen)

- Pipeline phase order is immutable
- Audit chain Merkle linkage cannot be altered
- Inline embedding mandate (no sibling requires)
- Zero external AI calls in Ascension (NEXUS only outside Ascension)
- Layer 2 runtime engines frozen unless Kenneth approves
- Vertical access dual-gate preserved
- **Patent boundary:** Ascension collision = Patent #1 · Mana attachment/deploy
  (governed by LEX) = Patent #2 · both converge in the V2 export pipeline
- **Terminology:** Cognitives ≠ Agents · Clarity = INCLUSIVE (not IMMUNITY) ·
  MODERNIZER/MUTATION = legacy names → EVOLUTION
- **Protected paths:** organ internals, layer routing, CLM serialization,
  defense shielding, governance, memory stream pipeline, dream synthesis,
  ascension engine, auth flow, supabase/migrations, src/config

---

## Cohesion Linkage

Pairs with `docs/libraries/internal/24-substrate-cohesion-audit.md`
(264-table classification: alive / dormant / theater / migrate). V2-relevant items:

- **VAULT** (11k+ promotions) feeds the pre-export harness — surfaced in
  receipt explorer (Sprint 1)
- **COMPILER** subsystem feeds `marketplace.cmpsbl.com` — Crown Jewel layers in
  Step 2 stay synced with compiler output
- **LEX REGISTRY** governs every Mana attachment in Step 2 — registry health is
  a V2 readiness signal
- **MUTATION** tables folded into EVOLUTION before Phase 5 (Sprint 2 → enforced
  Sprint 5) so reproducibility proofs reference one engine name only
- **AUTOBLOG · CONTROL PLANE · MARKETPLACE** remain standalone peers — they
  consume V2 receipts but do not gate the pipeline

---

## Execution Cadence

- **Daily:** Self stand-up — current sprint checklist in commit message
- **Sprint end:** Smoke test → DoD signed → changelog → publish artifact
- **Day 28:** Re-run cohesion audit → regenerate this roadmap from fresh state
  → archive this version as `ascension-v2-cycle-1.md`

---

*© CMPSBL® · PromptFluid™ · 2026 · Tuned · Ready to execute.*
