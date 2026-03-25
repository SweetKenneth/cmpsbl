# CMPSBL® — Investor Demo Roadmap

**Classification:** INTERNAL — Governor Eyes Only  
**Created:** 2026-03-25  
**Goal:** Build a pin-protected investor showcase section with real, working demonstrations of core substrate capabilities. No theatrics — only things that genuinely work.

---

## Philosophy

Investors will ask hard technical questions. The best defense is a live system that speaks for itself. Every demo must:

1. **Actually work** — no mocked data, no simulated outputs
2. **Be self-explanatory** — an investor should understand what they're seeing without narration
3. **Show the "so what?"** — each demo must connect to business value
4. **Be honest** — label what's production-ready vs. in-progress

---

## Phase 0 — Access & Shell

Build the investor showcase container before any demos.

- [ ] **Pin-gated entry** — simple PIN code screen (not auth, just a gate)
- [ ] **Investor Showcase layout** — clean, minimal, no admin clutter
- [ ] **Navigation** — card-based grid of available demos with status badges (Live / In Progress / Planned)
- [ ] **Route:** `/investor-showcase` or nested under existing admin

---

## Phase 1 — Low-Hanging Fruit (Already Working)

These systems are functional today and just need a polished investor-facing view.

### 1.1 — 40-Primitive Matrix Overview
**What it proves:** Architectural depth — this isn't a weekend project  
**Demo:** Interactive visualization of all 40 primitives across 4 categories (12 Organs, 12 Layers, 8 Engines, 8 Agents). Click any primitive to see its role, dependencies, and health status.  
**Existing assets:** Primitive taxonomy is fully defined, ModulesHub page exists  
**Work needed:** Investor-focused presentation layer, not the developer view

### 1.2 — Governance & SEBA Pipeline
**What it proves:** This system has safety rails — it's not uncontrolled AI  
**Demo:** Show the 7-gate promotion pipeline (Lint → Test → Security → Blast Radius → Evidence → Governance → Prod). Show real gate pass/fail history. Show that mutations can't bypass governance.  
**Existing assets:** SEBA pipeline logic exists in Evolution module  
**Work needed:** Visual gate flow diagram with real data from evolution cycles

### 1.3 — DEFENSE Layer (Threat Detection)
**What it proves:** Enterprise-grade security built into the substrate  
**Demo:** Live threat score calculation. Feed it sample inputs and show O(1) Trie-based evaluation, behavioral anomaly detection, kill-chain correlation. Show the virus scanner capabilities.  
**Existing assets:** DEFENSE module with full threat pipeline  
**Work needed:** Interactive demo where investor can trigger a scan and see results

### 1.4 — DREAM Engine (Background Learning)
**What it proves:** The system learns when no one is watching — a genuine differentiator  
**Demo:** Show dream cycle history, what was consolidated, what insights emerged. Show the dream pool, dream memory, and dream consent architecture.  
**Existing assets:** Dream tables in DB, dream-eater UI exists  
**Work needed:** Investor summary view — "Here's what the system learned last night"

### 1.5 — Memory Stream & Discovery
**What it proves:** The system discovers new capabilities autonomously  
**Demo:** Show real discovered pipelines with CJPI scores. Show the Mint → Prime → Relic → Mythic → Apex tier system. Let them browse actual crystallized capabilities.  
**Existing assets:** Discovery mining console, artifact registry, foundry page  
**Work needed:** Curated investor view with the best discoveries highlighted

### 1.6 — Mesh Communications (Live System Activity)
**What it proves:** This is a living system with real inter-module communication  
**Demo:** Real-time feed of mesh communications between primitives. Each signal shows source, target, category, personality voice. Show that this isn't simulated.  
**Existing assets:** mesh_comms table, IntentMesh page  
**Work needed:** Investor-facing live feed with personality translations

---

## Phase 2 — The Flagship Demo (Evolution / Ascension)

This is the centerpiece. The thing that makes investors lean forward.

### 2.1 — Evolution: Self-Evolving Software
**What it proves:** The core promise — software that improves itself  
**Demo flow:**
1. System scans its own codebase and identifies real improvements
2. AI (via OpenAI GPT, routed through NEXUS) generates actual code patches
3. SHADOW validates the patches in an isolated environment
4. SEBA gates score the result
5. Investor sees the proposal with diff preview
6. One-click apply (or reject with reason)

**What needs building:**
- [ ] Evolution discovery → structured prompt assembly
- [ ] Edge function: send proposal + file context to OpenAI → receive patch
- [ ] SHADOW dry-run validation of AI-generated patches
- [ ] SEBA gate scoring of validated patches
- [ ] UI: Proposal card with diff view + approve/reject

**Cost:** ~$0.005 per proposal (well within budget)

### 2.2 — Ascension: Code Upload & Enhancement
**What it proves:** External code enters the substrate and gains capabilities  
**Demo flow:**
1. Upload a simple script (Python/JS/etc.)
2. 40-primitive matrix analyzes it
3. System discovers meaningful combinations
4. Export enhanced version with Mini-Runtime
5. The export works standalone — prove portability

**What needs building:**
- [ ] Upload endpoint + language detection
- [ ] Primitive-by-primitive analysis prompts (via OpenAI)
- [ ] Discovery scoring (CJPI)
- [ ] Export ZIP generation (original + runtime + docs + tests)
- [ ] UI: Upload → Analysis → Results → Export flow

**This is the "drop the mic" demo.** If an investor uploads their own code and gets back enhanced software, the product sells itself.

---

## Phase 3 — Supporting Demos (Build As Time Allows)

### 3.1 — IMMUNITY Layer
**What it proves:** Self-healing error correction  
**Demo:** Trigger a controlled failure, show immune response (detection, repair attempt, escalation, learning). Show repair intelligence stats and shared rule registry.  
**Existing assets:** Full immunity module with outcome tracking

### 3.2 — ENCODE Agent (AI Code Execution)
**What it proves:** Graduated autonomy — AI earns trust through proven competence  
**Demo:** Show mastery levels (Novice → Master), competency scoring, the gate system that prevents unsafe code from executing.  
**Existing assets:** ENCODE module, competency tables

### 3.3 — LINGUA Engine (Multi-Language)
**What it proves:** Global reach from day one  
**Demo:** Real-time translation of system outputs across supported languages

### 3.4 — Agency System
**What it proves:** Revenue model — AI teams as a service  
**Demo:** Show a configured agency with agents, task completion stats, economic metrics, and ROI tracking.  
**Existing assets:** Full agency tables and UI

### 3.5 — Audit Chain
**What it proves:** Cryptographic accountability — every action is recorded  
**Demo:** Browse the append-only audit chain, show hash anchors, verify chain integrity

---

## Phase 4 — Investor Experience Polish

- [ ] **Metrics dashboard** — key numbers an investor wants: primitives active, discoveries made, evolution cycles run, uptime, memory consolidated
- [ ] **"Why This Matters" cards** — each demo links to business value (TAM, defensibility, revenue potential)
- [ ] **Comparison matrix** — CMPSBL vs. competitors (Replit, Cursor, Devin, etc.) with honest assessments
- [ ] **Risk acknowledgment section** — show you know the risks (solo founder, pre-revenue, etc.) — this builds trust
- [ ] **Download investor deck** — existing functionality, make sure it's current

---

## Build Order (Recommended)

| Order | Item | Why First |
|-------|------|-----------|
| 1 | Phase 0 — Shell + PIN gate | Container for everything else |
| 2 | 1.1 — Primitive Matrix | Sets the stage, shows scale |
| 3 | 1.6 — Mesh Communications | Proves the system is alive |
| 4 | 1.4 — DREAM Engine | Unique differentiator, easy to demo |
| 5 | 1.5 — Memory Stream | Shows autonomous discovery |
| 6 | 1.2 — SEBA Pipeline | Sets up Evolution demo |
| 7 | 2.1 — Evolution (flagship) | The main event |
| 8 | 1.3 — DEFENSE Layer | Enterprise credibility |
| 9 | 2.2 — Ascension | The "drop the mic" moment |
| 10 | Phase 3 items | Supporting evidence |
| 11 | Phase 4 — Polish | Final presentation layer |

---

## Cost Budget

| Component | Estimated Cost |
|-----------|---------------|
| Evolution proposals (50 demos) | ~$0.25 |
| Ascension analysis (20 uploads) | ~$0.50 |
| Miscellaneous AI calls | ~$0.25 |
| **Total to investor-ready** | **~$1.00** |

Well within the current $1.15 OpenAI balance. Add $5 for comfortable margin.

---

## What NOT To Demo

- Anything that doesn't actually work
- Simulated or mocked telemetry
- Features that require explaining away failures
- The full admin dashboard (too complex, too many rough edges)
- Anything that requires the investor to sign up or authenticate

---

## Success Criteria

An investor should be able to:

1. Enter a PIN and land on a clean showcase page
2. Browse 6-8 working demos in any order
3. Understand what each demo proves without explanation
4. See real data, real system activity, real AI-generated improvements
5. Walk away thinking: "This person built something real"

---

© 2025–2026 CMPSBL®. Internal Use Only.
