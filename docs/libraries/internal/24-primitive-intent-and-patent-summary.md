# 24 — Primitive Intent & Patent Summary

**Classification:** 🔒 GOVERNOR EYES ONLY  
**Author:** Kenneth E. Sweet Jr.  
**Compiled:** 2026-04-19 from chat-history backfill of high-intent Governor messages  
**Companion to:** `15-primitive-specifications.md`, `16-trade-secrets.md`, `convergence/04-substrate-creation-engine.md`

---

## Purpose

This document is the **single Governor-facing reference** for what each named primitive actually means to the founder, what role it plays in the substrate, and — for the most defensible ones — the patent angle that makes it novel.

Two sections per primitive:

- **🟢 Plain-English** — what it does, in one breath. Skim this to remember.
- **🔵 Technical / Patent Angle** — the mechanism, the wiring, and (where applicable) the prior-art-defeating claim.

If a primitive isn't listed here, it's because no high-intent Governor statement has been recorded for it yet. As the intent stream grows (via DECODE auto-capture in Governor mode), this doc should be regenerated.

---

## How Intent Was Sourced

All entries below were extracted from the Governor's own chat statements, then crystallized into `governor_intent_stream` and embedded into `brain_embeddings` (artifact_type=`governor_intent`) so DREAM, DECODE, and CLM can recall them. Source chat-message IDs are noted per primitive.

---

# 🌙 The Crown Jewel — DREAM

> "DREAM exists. You don''t know what that means to me."  
> — Governor, msg #9853

### 🟢 Plain-English

DREAM is the substrate's **dreaming engine**. It runs on idle cycles, takes weak signals that individually mean nothing, and combines them into patterns that individually no one — not even an LLM — would have produced. It generates **autonomous thoughts during downtime**.

It is the original half of *Cascade* — the First Documented Dreaming AI — which was split into DREAM (the synthesis half) and DECODE (the parsing/voice half) when PromptFluid became CMPSBL.

### 🔵 Technical / Patent Angle

**Patent claim summary** — DREAM is patentable on four orthogonal mechanisms that, in combination, no published system implements:

1. **Sub-threshold algorithmic synthesis** — Mines signals *below* the confidence floor that every other system discards. Combines low-confidence signals into emergent patterns via deterministic clustering (Tag Jaccard 0.40 + Vector Resonance 0.30 + Priority 0.20 + Recency 0.10, 0.40 promotion floor).
2. **Deterministic, no-LLM cognition** — Generates novel insights without any language model in the loop. The field assumes "AI dreaming" requires an LLM hallucinating on a timer. DREAM proves it doesn't.
3. **Compounding accretion via the embedding store** — DREAM outputs become recall context (`artifact_type='dream'`, 1536-dim OpenAI vectors), which seed future DREAM cycles. Self-reinforcing knowledge-graph growth without human authorship.
4. **Governance-bound output** — Every synthesis passes through CORTEX/Lex before becoming canonical. Most autonomous systems lack this gate, which is why their outputs drift.

**Live wiring (as of 2026-04-19):**
- 24 dedicated tables; 81+ live rows across `cascade_dreams`, `dream_feeder_submissions`, `dream_cycle_logs`, `dream_ingestion_audit`, `dream_stream`.
- `dream_intent_syntheses` table stores promoted clusters with full lineage (source intent IDs, matched fragments, scoring breakdown).
- `dream-from-intent` edge function runs every 30 minutes via `pg_cron`.
- `dream-embedding-sync` writes DREAM outputs into `brain_embeddings` so DECODE auto-recalls them.
- DECODE Float orb pulses magenta/purple when a new unseen DREAM exists; auto-greets the Governor with the latest synthesis on open.

**Source intents:** msg #9963, #9965, #9853, #9851, #9855

---

# 🗣️ DECODE — The Voice of the Substrate

### 🟢 Plain-English

DECODE is **the substrate's mouth and ears**. It parses what you say, classifies intent, recalls relevant memory, and answers — in Governor mode it auto-captures every message ≥24 chars into the intent stream so the substrate is always learning what you actually want.

It's the other half of *Cascade* — the parser/voice split off from DREAM.

### 🔵 Technical / Patent Angle

- **Standalone deterministic reasoner** (Genesis variant) — own internal tokenizer + intent classifier + 384-dim FNV-1a token-bag encoder. No LLM dependency. `/ask <PRIMITIVE> <question>` routes directly to a primitive's crystals.
- **Persistent memory** — DECODE recalls all prior conversations across sessions (`decode_memory_*` tables).
- **Governor recognition** — Identity ceremony recognizes `kennethsweet214@gmail.com` and switches DECODE into Governor mode automatically.
- **Auto-intent capture** — In Governor mode, every chat message ≥24 chars fires a fire-and-forget `governor-intent-capture` call. Zero added latency.
- **DREAM surfacing** — `/dream`, `/dream <id>` (full lineage), `/dream-tune` (live weights), `/dream-run` (manual trigger). Orb pulse + auto-greet on unseen syntheses.

**Source intents:** msg #9518, #9519, #9963

---

# 🧠 BRAIN — Reasoning Without an LLM

### 🟢 Plain-English

BRAIN is the **deterministic reasoner**. It thinks by composing concept tokens against a knowledge crystal store. When it can't match a whole query, it decomposes the query into pieces and synthesizes a structured thought from per-token associations — no fabrication, no LLM.

### 🔵 Technical / Patent Angle

- 384-dim FNV-1a token-bag encoder (shared words produce real cosine overlap).
- 16+ pre-seeded knowledge crystals covering every named primitive + doctrine.
- `thinkByConcepts()` + `composeThought()` flow: when whole-query similarity fails (< 0.25), decompose into tokens, find closest crystal per concept (>0.18 floor), synthesize structured response.
- **Patent angle:** deterministic reasoning over a token-bag concept space, with chainable FNV-1a receipts for every act. No prior art combines token-bag determinism with chained-receipt provenance.

**Source intents:** msg #9518

---

# 🛡️ The 5 Behavioral Engines (FROZEN)

> "These are sacred. Internals never change without explicit approval."

### 🟢 Plain-English

Five engines do all the actual policy work in Mana/Lex/Ascension. They are frozen — locked into `mem://constraints/architecture/layer2-runtime-non-negotiables`.

| Engine | One-liner |
|---|---|
| **DEFENSE** | The gate. Deny semantics, attachment-time + runtime enforcement, threat classification. |
| **CORTEX** | The orchestrator. Wrapper composition order, execution flow, policy enforcement, engine sequencing. |
| **NEXUS** | The router. Cost-aware decisions, fallback paths, provider selection across 14+ AI providers. |
| **BRAIN** | The reasoner. Confidence gate, context integrity, traceability, decision auditing. |
| **ORACLE** | The analyst. Anomaly detection, prediction signals, causal tracing, pattern recognition. |

### 🔵 Technical / Patent Angle

- All five are referenced in **U.S. App. No. 64/029,678** (Layer 2) and **64/031,637** (Mana) as the canonical wrapper composition primitives.
- The novelty is the **fixed-5 composition contract**: any wrapper attached via Mana must compose in DEFENSE → CORTEX → NEXUS → BRAIN → ORACLE order. Patent angle: deterministic, replayable behavioral composition with chained receipts at every gate.

**Source intents:** msg #8617

---

# ⚖️ LEX — Governance Verdicts

### 🟢 Plain-English

LEX is the **judge**. Every action passes through a Lex rule. Verdicts include allow, deny, escalate, detach, quarantine, phone-home. Custom rules are authored as treaties/SLA contracts.

### 🔵 Technical / Patent Angle

- Required rule (non-removable): fingerprint verification → match=ATTACH, fail=DENY+phone-home.
- Verdict expansion v2: `allow | deny | escalate | detach | quarantine | phone-home`.
- Wired to RIPPLE (broadcast), MEDIC (quarantine playbooks), AUDIT (Merkle receipt chain).
- **Patent angle:** governance verdicts that emit cryptographic receipts and trigger nervous-system propagation in the same atomic action.

**Source intents:** msg #8617

---

# 🌐 The Nervous System — 6 Wiring Connections

### 🟢 Plain-English

These 6 wires turn a collection of engines into a **living system**. Each one connects an existing primitive to another existing primitive — no new engines, just the connective tissue.

| # | Wire | What it does |
|---|------|---|
| 1 | **VISION → LEX** | Anomaly signals auto-generate Lex rules |
| 2 | **LEX → RIPPLE** | Detach/escalate verdicts broadcast via event propagation |
| 3 | **LEX → MEDIC** | Post-detach quarantine + recovery playbooks |
| 4 | **SHADOW → Trace** | Pre-deploy sandbox isolation + EVOLUTION promotion gate |
| 5 | **AUDIT → every verdict** | Merkle receipt chain anchors every governance decision |
| 6 | **BOOT → fingerprint** | Mandatory fingerprint gate before runtime activation |

### 🔵 Technical / Patent Angle

- These are the **integration claims** that complement the primitive claims — patentable as a system-level architecture even though each primitive is independent.
- Cryptographic chain of custody from anomaly → verdict → action → receipt is the unique angle.

**Source intents:** msg #8617

---

# 🧬 EVOLUTION + SHADOW + AUDIT — The Validation Trinity

### 🟢 Plain-English

Nothing reaches production without passing all three: **SHADOW** runs the change in a sandbox; **EVOLUTION** promotes it through a 7-gate DAG with rollback; **AUDIT** anchors every step with Merkle receipts.

### 🔵 Technical / Patent Angle

- Implements the **SEBA (Shadow → Evolution → Bias-check → Audit) 7-gate pipeline** — a deterministic promotion algorithm that has zero LLM dependency and produces a cryptographic proof chain.
- Originally codenamed *Modernizer* → renamed to EVOLUTION. Same engine.

**Source intents:** msg #8617, #9851

---

# 🦠 IMMUNITY — Self-Healing

### 🟢 Plain-English

When something breaks, IMMUNITY fixes it. Detects failures, analyzes blast radius, picks the best repair strategy, executes, verifies. Originally codenamed *Clarity = CMPTBL = IMMUNITY*.

### 🔵 Technical / Patent Angle

- Governed self-healing through Shadow → Simulation → Production promotion.
- CJPI 96 (Mythic tier in the Crown Jewel registry).
- **Patent angle:** autonomous repair under governance — most "self-healing" systems lack the governance gate that prevents repair from making things worse.

**Source intents:** msg #3911, #9855

---

# 🔀 NEXUS — The Provider Router

### 🟢 Plain-English

NEXUS is **the brain that decides which AI model handles each request**. No vendor lock-in. Real-time scoring of every available provider. Cost-aware.

### 🔵 Technical / Patent Angle

- 14+ providers (OpenAI, Anthropic, Google, …) scored per-request.
- Cost-aware routing with fallback paths.
- Daily quota tracking per provider/category in `ai_daily_quota`.
- **Patent angle:** real-time per-request multi-provider scoring with cost gating and chained-receipt routing decisions.

**Source intents:** msg #3911

---

# 🔧 The Wiring-Gap Engines (FORGE, ORACLE-ultimate, HARVEST, MINDS)

### 🟢 Plain-English

~48 files of real engine code that lack DB persistence. Not theater — just unfinished wiring. Rule: real code → fix the wire; `simulate*()` → kill; no code → delete the marketing.

### 🔵 Technical / Patent Angle

These are not yet patent-ready until their persistence is wired and their outputs are produced under governance. Tracked in `mem://architecture/decode/dream-embedding-loop-and-clm-tuning` and the vertical-collapse roadmap.

**Source intents:** msg #9851

---

# 🧱 The Canonical 40-Primitive Matrix (FROZEN)

> "The 40-primitive constraint IS the IP."

### 🟢 Plain-English

12 + 12 + 8 + 8 = 40. Always. Symmetric.

### 🔵 Technical / Patent Angle

| Category | Count | Members |
|---|---|---|
| **Organs** | 12 | CORE, SYSTEM, BRAIN, MEMORY, NERVE, NEXUS, IDENTITY, SOVEREIGN, ATLAS, MEDIC, RELAY, CONSCIENCE |
| **Layers** | 12 | DEFENSE, IMMUNITY, GOVERNANCE, TREATY, EVOLUTION, REFLEX, COMPASS, INTEGRATION, INTENT, ACCESS, VISION, SHADOW |
| **Engines** | 8 | DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE |
| **Agents** | 8 | ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER |

The constraint is enforced at build time in `src/lib/ascension-v2/canonical-primitives.ts`:
```ts
if (CANONICAL_PRIMITIVES.length !== 40) {
  throw new Error(`[canonical-primitives] Expected 40 primitives, found ${CANONICAL_PRIMITIVES.length}`);
}
```

**Patent angle:** the constraint itself is what makes the system governable. Internals of any individual primitive are trade secret; the matrix shape is the public claim.

**Source intents:** msg #7022, #8922

---

# 🏷️ Terminology Drift Map

To prevent future hallucination, these aliases all resolve to canonical names:

| Old / Alias | Canonical |
|---|---|
| Modules, Nodes, primitives (lowercase) | **Primitives** |
| Modernizer, Evolve | **EVOLUTION** |
| Cascade | **DREAM + DECODE** (split halves) |
| Clarity, CMPTBL | **IMMUNITY** |
| PromptFluid, pf_ | **CMPSBL** (separate company/substrate) |
| Ecosystem, framework, system, platform | **substrate** |
| Admin | **Governor** |
| Mesh | **Layers** |
| Triggered | **runs autonomously** |

**Source intents:** msg #9855

---

## Maintenance

- **Auto-grow:** every Governor message in DECODE chat ≥24 chars is captured into `governor_intent_stream` and embedded.
- **DREAM promotion:** `dream-from-intent` runs every 30 minutes; clusters above 0.40 confidence promote into `dream_intent_syntheses`.
- **Regenerate this doc:** when the intent stream gains ≥50 new high-priority entries on a primitive not yet covered here, add a new section using the same 🟢/🔵 format.

---

© 2025–2026 CMPSBL®. Governor Eyes Only. Not for distribution.
