# CMPSBL® — Investor Showcase Roadmap

**Classification:** INTERNAL — Governor Eyes Only  
**Created:** 2026-03-25  
**Updated:** 2026-03-25  
**Goal:** Build a pin-protected investor showcase that explains itself in layers. Not a demo — a self-narrating system.

---

## Guiding Principle

> We are not building a demo. We are building a system that explains itself in layers.

If we get this right:
- The system answers questions for me
- Investors explore instead of interrogate
- Complexity becomes a strength instead of a liability

---

## Philosophy

1. **Actually work** — no mocked data, no simulated outputs
2. **Self-explanatory** — every demo has WHAT / WHY / VALUE blocks (mandatory, no exceptions)
3. **Progressive disclosure** — surface = outcome, depth = architecture
4. **Honest labeling** — production-ready vs. in-progress, clearly marked
5. **Contained complexity** — the 40 primitives, mesh, deep system are NEVER first-load. Always behind interaction (click → expand → explore)

---

## Phase 0 — Access, Shell & Orientation

### 0.1 — PIN-Gated Entry
- [ ] Simple PIN code screen (not auth, just a gate)
- [ ] Route: `/investor-showcase` or nested under admin
- [ ] Clean, minimal — zero admin clutter

### 0.2 — "Start Here" Orientation Block (MANDATORY — First Thing They See)

Before any demo grid loads, investors see:

**What this system does (1–2 sentences):**
> CMPSBL is a cognitive operating system that discovers, improves, and exports software capabilities autonomously — using 40 specialized AI primitives that coordinate through a live mesh.

**3-Step Flow:**
```
Discover → Improve → Export
```

**Recommended demo order:**
1. Memory Stream — see how the system discovers
2. Evolution — see how it improves itself
3. Ascension — see what it exports

This block is non-negotiable. Without it, the system feels like complexity instead of capability.

### 0.3 — Showcase Layout
- [ ] Demo cards organized by tier (visually separated, not just listed)
- [ ] Tier 1 visible on first load. Tier 2 and 3 collapsed/hidden behind interaction
- [ ] Status badges: Live / In Progress / Planned
- [ ] No full dashboards, no internal tooling noise, no admin complexity

---

## Demo Tiering (MANDATORY STRUCTURE)

All demos are split into 3 tiers. This is not optional.

### Tier 1 — Core (Investor MUST understand these)
Visible on first load. These tell the story.

| Demo | Purpose |
|------|---------|
| Memory Stream & Discovery | The system discovers capabilities autonomously |
| Evolution | The system improves its own code |
| Ascension | External code enters, enhanced code exits |

### Tier 2 — Supporting (Reinforces credibility)
Visible on click/scroll. These prove depth.

| Demo | Purpose |
|------|---------|
| DREAM Engine | Background learning — the system learns when idle |
| DEFENSE Layer | Enterprise-grade security built into the substrate |
| SEBA Pipeline | Safety rails — mutations can't bypass governance |

### Tier 3 — Deep System (Only if they explore)
Hidden behind explicit interaction. These impress the technical investor.

| Demo | Purpose |
|------|---------|
| 40-Primitive Matrix | Architectural depth — not a weekend project |
| Mesh Communications | Living system with real inter-module communication |
| Agency System | Revenue model — AI teams as a service |
| Audit Chain | Cryptographic accountability |
| IMMUNITY Layer | Self-healing error correction |
| ENCODE Agent | Graduated autonomy and competency gates |

---

## Demo Content Standard (EVERY Demo Must Include)

```
┌─────────────────────────────────────┐
│  WHAT YOU'RE SEEING                 │
│  Plain description of the demo      │
├─────────────────────────────────────┤
│  WHY IT MATTERS                     │
│  Technical significance             │
├─────────────────────────────────────┤
│  BUSINESS VALUE                     │
│  Revenue, defensibility, TAM, moat  │
└─────────────────────────────────────┘
```

If a demo can't explain itself in those 3 blocks, it's not ready for investors. Do not ship it.

---

## Phase 1 — Tier 1 Demos (Build First)

### 1.1 — Memory Stream & Discovery
**WHAT:** The system observes its own behavior and discovers new software pipelines autonomously. Real discovered capabilities with CJPI scoring. Mint → Prime → Relic → Mythic → Apex tiering.  
**WHY:** No other system discovers its own capabilities. This is self-improving infrastructure.  
**VALUE:** Every discovery is a potential product. The system generates its own IP.  
**Existing assets:** Discovery mining console, artifact registry, foundry page  
**Work needed:** Curated investor view — best discoveries highlighted, clean cards, no admin noise  

### 1.2 — Evolution: Self-Improving Software
**WHAT:** System scans its own codebase → AI generates real code patches → SHADOW validates → SEBA scores → one-click approve/reject  
**WHY:** Software that fixes and improves itself. The core promise.  
**VALUE:** Reduces engineering costs, eliminates tech debt accumulation, scales without hiring.  

**UI must be extremely simple:**
- Diff view (before/after)
- Score badge
- Approve / Reject buttons
- No internal noise by default
- Deep detail (SHADOW results, SEBA gate breakdown) only on expand

**What needs building:**
- [ ] Evolution discovery → structured prompt assembly
- [ ] Edge function: proposal + file context → OpenAI → patch
- [ ] SHADOW dry-run validation
- [ ] SEBA gate scoring
- [ ] Investor-facing UI: proposal card with diff + approve/reject

**Cost:** ~$0.005 per proposal

### 1.3 — Ascension: Before → After Transformation
**WHAT:** Upload a basic script. The 40-primitive matrix analyzes it. Download an enhanced, exportable system with runtime, docs, and tests.  
**WHY:** This is the clearest proof of value — input basic code, output production software.  
**VALUE:** Every developer becomes 10x. Every script becomes a product.  

**UI must be extremely simple:**
- Upload zone
- Analysis progress (clean, not noisy)
- Before/After comparison (side by side)
- Export button → download ZIP

**What needs building:**
- [ ] Upload endpoint + language detection
- [ ] Primitive-by-primitive analysis prompts (via OpenAI)
- [ ] Discovery scoring (CJPI)
- [ ] Export ZIP (original + runtime + docs + tests)
- [ ] Before vs After comparison view

**This is the "drop the mic" demo.** If an investor uploads their own code and gets back enhanced software, the product sells itself.

---

## Phase 2 — Tier 2 Demos (Build Second)

### 2.1 — DREAM Engine
**WHAT:** The system consolidates learning during idle time — dream cycles, memory synthesis, insight generation.  
**WHY:** Autonomous background improvement. No other system does this.  
**VALUE:** Compound intelligence — the system gets smarter every day without intervention.  
**Work needed:** Investor summary view — "Here's what the system learned last night"

### 2.2 — DEFENSE Layer
**WHAT:** Live threat score calculation. O(1) Trie-based evaluation, behavioral anomaly detection, kill-chain correlation.  
**WHY:** Enterprise-grade security baked into the substrate, not bolted on.  
**VALUE:** Security is the #1 enterprise concern. This is a prerequisite for enterprise adoption.  
**Work needed:** Interactive scan → results flow (investor triggers, system responds)

### 2.3 — SEBA Pipeline
**WHAT:** 7-gate promotion pipeline (Lint → Test → Security → Blast Radius → Evidence → Governance → Prod). Real pass/fail history.  
**WHY:** Proves the system has safety rails — AI mutations can't bypass governance.  
**VALUE:** Regulatory compliance, auditability, risk mitigation. Investors need to know AI isn't uncontrolled.  
**Work needed:** Visual gate flow diagram with real cycle data

---

## Phase 3 — Tier 3 Demos (Build If Time Allows)

All behind explicit interaction. Click → expand → explore.

### 3.1 — 40-Primitive Matrix
**WHAT/WHY/VALUE:** Architectural depth visualization. 12 Organs + 12 Layers + 8 Engines + 8 Agents. Click any primitive → see role, dependencies, health. Proves this isn't a toy.

### 3.2 — Mesh Communications
**WHAT/WHY/VALUE:** Real-time feed of live inter-primitive communication. Source → target → category → personality voice. Proves the system is alive, not static.

### 3.3 — Agency System
**WHAT/WHY/VALUE:** Revenue model demo. Configured agency with agents, task completion, economic metrics, ROI tracking. AI teams as a service.

### 3.4 — Audit Chain
**WHAT/WHY/VALUE:** Append-only cryptographic audit trail. Hash anchors, chain integrity verification. Enterprise accountability.

### 3.5 — IMMUNITY Layer
**WHAT/WHY/VALUE:** Self-healing. Controlled failure → immune response → detection → repair → learning. Shows system resilience.

### 3.6 — ENCODE Agent
**WHAT/WHY/VALUE:** Graduated autonomy. Novice → Master mastery levels. Competency scoring. Gates that prevent unsafe execution. Trust through proven competence.

---

## Phase 4 — Credibility Signals & Polish

### 4.1 — Live System Stats (MANDATORY)
Surface real, live numbers — not simulated:
- [ ] Evolution cycles completed
- [ ] Discoveries crystallized
- [ ] Primitives active
- [ ] Memory consolidated
- [ ] System uptime
- [ ] Clear "production vs experimental" labels

### 4.2 — Before vs After Demo (Standalone)
One explicit, repeatable transformation:
- [ ] Input: basic script (pre-loaded example OR user upload)
- [ ] Output: enhanced system with runtime
- [ ] Side-by-side comparison
- [ ] This may be integrated into Ascension (1.3) or standalone

### 4.3 — Investor Experience
- [ ] "Why This Matters" value cards per demo
- [ ] Comparison matrix — CMPSBL vs. Replit, Cursor, Devin (honest)
- [ ] Risk acknowledgment — solo founder, pre-revenue (builds trust)
- [ ] Download investor deck

---

## Build Order

| Order | Item | Why This Order |
|-------|------|----------------|
| 1 | Phase 0 — Shell + PIN + "Start Here" | Container + orientation before anything |
| 2 | 1.1 — Memory Stream | First demo in recommended path |
| 3 | 1.2 — Evolution | Core promise, needs edge function work |
| 4 | 1.3 — Ascension + Before/After | The closer — "drop the mic" |
| 5 | 4.1 — Live Stats | Credibility signals throughout |
| 6 | 2.1 — DREAM | First supporting demo |
| 7 | 2.2 — DEFENSE | Enterprise credibility |
| 8 | 2.3 — SEBA | Governance proof |
| 9 | Phase 3 — Deep System | Only if time allows |
| 10 | Phase 4 — Polish | Final presentation layer |

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

## What NOT To Show

- Anything that doesn't actually work
- Simulated or mocked telemetry
- Full admin dashboards
- Internal tooling noise
- Features that require explaining away failures
- Anything requiring the investor to sign up or authenticate
- All demos visible at once (progressive disclosure is mandatory)

---

## Success Criteria

An investor should be able to:

1. Enter a PIN and see the "Start Here" orientation
2. Follow the recommended path: Memory → Evolution → Ascension
3. Understand each demo through WHAT / WHY / VALUE blocks — no verbal explanation needed
4. See real data, real system activity, real AI-generated improvements
5. Optionally explore deeper (DREAM, DEFENSE, primitives, mesh)
6. Walk away thinking: **"This person built something real — and the system explains itself."**

---

© 2025–2026 CMPSBL®. Internal Use Only.
