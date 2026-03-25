# CMPSBL® — Investor Showcase Roadmap

**Classification:** INTERNAL — Governor Eyes Only  
**Created:** 2026-03-25  
**Updated:** 2026-03-25  
**Goal:** Build a pin-protected investor showcase that hooks emotionally first, explains itself second, and proves depth third.

---

## Guiding Principle

> We are not building a demo. We are building a system that hooks emotionally first, explains itself second, and proves depth third.

If something doesn't serve that flow, cut it.

---

## Philosophy

1. **Actually work** — no mocked data, no simulated outputs
2. **Self-explanatory** — every demo has WHAT / WHY / VALUE blocks (mandatory, no exceptions)
3. **Progressive disclosure** — surface = outcome, depth = architecture
4. **Honest labeling** — production-ready vs. in-progress, clearly marked
5. **Contained complexity** — deep system is NEVER first-load. Always behind interaction
6. **Outcome-first** — show what changed, then how
7. **Guaranteed success** — critical demos must never break during a session

---

## Phase 0 — Access, Shell & Orientation

### 0.1 — PIN-Gated Entry
- [ ] Simple PIN code screen (not auth, just a gate)
- [ ] Route: `/investor-showcase` or nested under admin
- [ ] Clean, minimal — zero admin clutter

### 0.2 — "30-Second WOW" (MANDATORY — First Thing After PIN)

Before any orientation or demo grid, one button:

```
┌─────────────────────────────────────────────┐
│                                             │
│         See it in 30 seconds →              │
│                                             │
│   (preloaded Ascension example — no         │
│    upload required, guaranteed success)     │
│                                             │
│   Click → instant before/after              │
│   transformation with visible timing        │
│                                             │
│   "Enhanced in 1,240ms"                     │
│                                             │
└─────────────────────────────────────────────┘
```

This is the hook. They should feel "what the hell did I just see?" before they think. If we lose them here, nothing else matters.

### 0.3 — "Start Here" Orientation Block

After the WOW moment, provide context:

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

### 0.4 — Showcase Layout
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
| 1.1 Memory Stream & Discovery | The system discovers capabilities autonomously |
| 1.2 Evolution | The system improves its own code |
| 1.3 Ascension | External code enters, enhanced code exits |
| 1.4 Build With the Substrate | Developers build apps with intelligence already wired in |

### Tier 2 — Supporting (Reinforces credibility)
Visible on click/scroll. These prove depth.

| Demo | Purpose |
|------|---------|
| DREAM Engine | Background learning — the system learns when idle |
| DEFENSE Layer | Enterprise-grade security built into the substrate |
| SEBA Pipeline | Safety rails — mutations can't bypass governance |

### Tier 3 — Deep System (Only if they explore)
Hidden behind explicit interaction. Click → expand → explore.

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

### 1.1 — Memory Stream & Discovery (TELL A STORY, NOT A LIST)

**WHAT:** The system observes its own behavior and discovers new software pipelines autonomously.  
**WHY:** No other system discovers its own capabilities. This is self-improving infrastructure.  
**VALUE:** Every discovery is a potential product. The system generates its own IP.  

**Critical design change:** Do NOT present as a catalog/list. Instead:

- Feature ONE real discovery as a narrative:
  - What the system **saw** (the signal)
  - What it **built** (the pipeline)
  - What it **became** (the artifact)
- This featured discovery sits at top, large, story-format
- Below it: recent discoveries as secondary cards
- CJPI scoring and tier badges (Mint → Apex) visible but not leading

**Existing assets:** Discovery mining console, artifact registry, foundry page  
**Work needed:** Curated investor view — story-first, featured discovery, clean cards, no admin noise

### 1.2 — Evolution: Self-Improving Software (OUTCOME FIRST)

**WHAT:** System scans its own codebase → AI generates real code patches → validates → scores → approve/reject  
**WHY:** Software that fixes and improves itself. The core promise.  
**VALUE:** Reduces engineering costs, eliminates tech debt accumulation, scales without hiring.  

**Critical design change:** Lead with OUTCOME, not process.

**UI flow (this order is mandatory):**
1. **BEFORE → AFTER** (the result) — this is what they see first
2. Score badge + timing ("Improved in 840ms")
3. Approve / Reject buttons
4. **Expandable section** (click to reveal):
   - How it was generated (AI prompt + model)
   - How it was validated (SHADOW dry-run results)
   - How it was approved (SEBA gate breakdown)

No internal noise by default. Mechanics only on expand.

**What needs building:**
- [ ] Evolution discovery → structured prompt assembly
- [ ] Edge function: proposal + file context → OpenAI → patch
- [ ] SHADOW dry-run validation
- [ ] SEBA gate scoring
- [ ] Investor-facing UI: outcome-first proposal card

**Cost:** ~$0.005 per proposal

### 1.3 — Ascension: Before → After Transformation (GUARANTEED SUCCESS)

**WHAT:** A basic script enters. The 40-primitive matrix analyzes it. An enhanced, exportable system exits.  
**WHY:** This is the clearest proof of value — input basic code, output production software.  
**VALUE:** Every developer becomes 10x. Every script becomes a product.  

**Two modes (MANDATORY):**

| Mode | Behavior | When |
|------|----------|------|
| **Demo Mode (DEFAULT)** | Preloaded script, guaranteed successful transformation, instant result | Always available, used first |
| **Upload Mode (optional)** | Investor uploads their own code | Available after demo mode impresses |

**Never rely on user input for the "drop the mic" moment.**

**UI must be extremely simple:**
- Side-by-side before/after comparison
- Visible timing ("Enhanced in X ms")
- Export button → download ZIP
- Upload zone appears as secondary action

**What needs building:**
- [ ] Preloaded demo script with guaranteed transformation
- [ ] Upload endpoint + language detection
- [ ] Primitive-by-primitive analysis prompts (via OpenAI)
- [ ] Discovery scoring (CJPI)
- [ ] Export ZIP (original + runtime + docs + tests)
- [ ] Before vs After comparison view

### 1.4 — Build With the Substrate (PLATFORM PROOF)

**WHAT:** A developer clicks one button and gets a working app — with memory, learning, and security already wired in — that exports and runs anywhere without the full substrate.  
**WHY:** This is the bridge between "impressive system" and "investable platform." Without this, CMPSBL is a lab project. With this, it's an ecosystem.  
**VALUE:** Platform economics. Every app built on the substrate = recurring revenue, network effects, and developer lock-in through capability, not dependency.  

**CRITICAL: Do NOT use a real terminal.** This is a visual, guided panel — not a CLI walkthrough. Controlled, instant, zero-risk.

**Demo flow (this order is mandatory):**

#### Step 1 — Generate App (1 click)
- Button: **"Generate Example App"**
- Instantly produces a preloaded tool (no user input required)
- Visible timing: "Scaffolded in X ms"

#### Step 2 — Show Capabilities (Visual, Not Code)
Display capability badges — NOT source code:
- ✓ **Has Memory** — persists across runs
- ✓ **Uses DREAM** — learns from usage
- ✓ **Uses DEFENSE** — built-in safety
- Capabilities first. Code second (expandable only).

#### Step 3 — Run the App
- Click **"Run"**
- App responds to input
- Send a second input → app **remembers the first**
- This is the moment that proves persistence + intelligence

#### Step 4 — Export
- Click **"Export App"**
- Show ZIP contents preview:
  - `src/` — application code
  - `runtime/` — mini substrate runtime
  - `config/` — capability manifest
  - `docs/` — generated documentation

#### Step 5 — Runs Anywhere
- Explicit callout: **"This runs outside CMPSBL — no dependency on the full system"**
- This is the platform proof. Critical.

**Optional: "Under the Hood" (collapsed by default)**

Label: *"Powered by CMPSBL CLI (60+ commands)"*

Contents (static, not interactive):
```
cmpsbl init --template memory-app
cmpsbl capabilities add DREAM DEFENSE
cmpsbl export --target standalone
```
No live terminal. No typing. No risk. Just legitimacy.

**What needs building:**
- [ ] Guided Build Panel component (5-step visual flow)
- [ ] Preloaded app template with Memory + DREAM + DEFENSE wired
- [ ] Interactive run simulation with persistence proof
- [ ] ZIP preview (reuse Ascension export infrastructure)
- [ ] Collapsed CLI reference section

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

### 4.1 — Visible Speed (MANDATORY on all demos)
Surface timing on every operation — speed = capability in an investor's mind:
- [ ] "Generated in X ms"
- [ ] "Validated in X ms"
- [ ] "Pipeline completed in X ms"
- [ ] "Enhanced in X ms"

### 4.2 — System Confidence Signals (MANDATORY)
Lightweight, always-visible indicators:
- [ ] "System Health: Stable" (from Health Engine)
- [ ] "Last successful cycle: X minutes ago"
- [ ] "Live system — no simulated data"
- [ ] Evolution cycles completed count
- [ ] Discoveries crystallized count
- [ ] Primitives active count
- [ ] Clear "production vs experimental" labels

These reduce perceived risk immediately.

### 4.3 — "Why CMPSBL Wins" Summary Layer (MANDATORY)
One compressed, high-signal view — the mental anchor after exploration:

```
┌──────────────────────────────────────────────┐
│  Self-discovering software    → Memory Stream │
│  Self-improving software      → Evolution     │
│  Exportable intelligence      → Ascension     │
│  Developer platform           → Build w/ Sub. │
│  Built-in governance          → SEBA + DEFENSE│
└──────────────────────────────────────────────┘
```

This sits at the bottom of the showcase — the summary they carry out of the room.

### 4.4 — Investor Experience
- [ ] Comparison matrix — CMPSBL vs. Replit, Cursor, Devin (honest)
- [ ] Risk acknowledgment — solo founder, pre-revenue (builds trust)
- [ ] Download investor deck

---

## Build Order

| Order | Item | Why This Order |
|-------|------|----------------|
| 1 | Phase 0 — Shell + PIN + "30-Second WOW" | Hook first, orient second |
| 2 | 1.1 — Memory Stream (story-first) | First demo in recommended path |
| 3 | 1.2 — Evolution (outcome-first) | Core promise, needs edge function work |
| 4 | 1.3 — Ascension (demo mode + upload) | The closer — guaranteed success path |
| 5 | 1.4 — Build With the Substrate | Platform proof — bridges system to ecosystem |
| 6 | 4.1–4.3 — Speed, Confidence, Summary | Credibility signals throughout |
| 7 | 2.1 — DREAM | First supporting demo |
| 8 | 2.2 — DEFENSE | Enterprise credibility |
| 9 | 2.3 — SEBA | Governance proof |
| 10 | Phase 3 — Deep System | Only if time allows |
| 11 | Phase 4.4 — Final Polish | Deck, comparisons, risk disclosure |

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
- Process before outcome
- Upload-dependent demos without a guaranteed fallback

---

## Success Criteria

An investor should be able to:

1. Enter a PIN
2. Click "See it in 30 seconds" → feel the WOW before thinking
3. Read the orientation → understand the system in 10 seconds
4. Follow Memory → Evolution → Ascension → Build → grasp the full story
5. See real data, real timing, real system health
6. Optionally explore deeper (DREAM, DEFENSE, primitives, mesh)
7. Land on "Why CMPSBL Wins" → carry a clear mental model out
8. Walk away thinking: **"This person built something real — and the system explains itself."**

---

## Experience Flow (Emotional Arc)

```
PIN Entry
  ↓
"See it in 30 seconds" → INSTANT WOW (Ascension preview)
  ↓
"Start Here" orientation → CONTEXT
  ↓
Memory Stream → "It discovers on its own?"
  ↓
Evolution → "It improves itself?"
  ↓
Ascension → "I can USE this?"
  ↓
Build With the Substrate → "Developers can build on this?"
  ↓
[Optional] DREAM / DEFENSE / SEBA → "This is enterprise-ready"
  ↓
[Optional] Deep System → "This is... massive"
  ↓
"Why CMPSBL Wins" → ANCHOR
```

Hook → Explain → Prove → **Platform**. In that order. Always.

---

© 2025–2026 CMPSBL®. Internal Use Only.
