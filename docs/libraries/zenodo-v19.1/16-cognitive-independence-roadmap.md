# Cognitive Independence Roadmap

> The 4-stage path from LLM-dependent to substrate-native cognition.
> Why CLM and Memory are the moat — even though Brain doesn't yet "think."
> © CMPSBL® · PromptFluid™ · Kenneth E. Sweet Jr.

---

## Premise

Today, **Brain routes through NEXUS** to external LLM providers for any generative task. This is honest and intentional. CMPSBL is not currently a foundation-model company — it is a *governed cognitive infrastructure* company.

That said, **Constant Learning Mode (CLM)** and the **Memory Stream** are not redundant. They are the accumulator that converts every external call into substrate-native ground truth. The roadmap below is how that ground truth graduates Brain off LLM dependency in defined stages, with measurable exit criteria per stage.

---

## Audit Snapshot (v19.1 baseline)

| Store | Rows | Role |
|---|---|---|
| `brain_events` | 69,362 | Behavioral substrate — every Brain action |
| `brain_memory_cold` | 9,950 | Long-term consolidated memories |
| `brain_memory_warm` | 7,734 | Mid-tier active memories |
| `discoveries` | 7,266 | Memory Stream output (primitive collisions) |
| `brain_graph_edges` | 4,699 | Knowledge graph relationships |
| `discovery_runs` | 3,343 | 8h loop iterations |
| `brain_memories` | 2,000 | Core memory pool |
| `vertical_clm_cycles` | 1,784 | CLM across 12 verticals |
| `brain_knowledge_crystals` | 755 | High-confidence distilled facts |
| `brain_graph_nodes` | 750 | Graph entities |
| `brain_memory_hot` | 579 | Active working memory |
| `brain_distillation_runs` | 534 | Memory→crystal compression |
| `brain_reasoning_traces` | **410** | **Step-by-step reasoning corpus** |
| `brain_transfer_heuristics` | 204 | Cross-domain pattern reuse |

**Verdict:** raw material is sufficient to begin Stage 1 immediately. Stages 3 and 4 require continued accumulation, which the Memory Stream does autonomously every 8 hours.

---

## The Four Stages

### Stage 1 — Retrieval-first DECODE (immediate)

**Goal:** before any external LLM call, vector-search the existing memory corpus. If a high-confidence answer exists, return it locally with cited memory IDs. Otherwise fall through to NEXUS, and log the call for future training.

**Substrate dependency:** ❌ none — purely retrieval.
**Required:**
- Backfill `brain_embeddings` (384-dim, MiniLM) over crystals, warm, cold, and reasoning traces.
- `match_brain_embeddings` RPC for cosine similarity search.
- DECODE retrieval-first router (calls match RPC, evaluates threshold, decides local vs. NEXUS).

**Exit criteria:**
- ≥40% of incoming DECODE queries answered locally with similarity > 0.78.
- ≥1,000 crystals indexed.
- Cited-memory accuracy validated by sampling.

**Status (v19.1):** in build.

---

### Stage 2 — Substitution learning

**Goal:** every fall-through to NEXUS is logged with full deterministic context (input, output, surrounding memory snapshot). The substitution corpus grows.

**Substrate dependency:** ❌ none — passive logging.
**Required:**
- `ai_learning_data` populated on every NEXUS call.
- Periodic distillation pass: cluster substitutions, mint new crystals, attach embeddings.

**Exit criteria:**
- ≥10,000 logged substitutions.
- ≥3,000 new crystals minted from substitutions.
- Crystal coverage of ≥60% of common DECODE intents.

**Status:** infrastructure present; pipeline to be wired post-Stage 1.

---

### Stage 3 — Narrow specialized models

**Goal:** train small, deterministic, narrow-task models on the CLM corpus. Each one replaces a class of LLM calls. Examples:
- **Lex rule selector** — chooses the right Lex rule given a Mana session context. Trained on `brain_reasoning_traces` + `lex_registry_events`.
- **Primitive router** — predicts which primitive(s) handle an incoming task. Trained on `brain_events` + `discovery_runs`.
- **Layer recommender** — suggests Mana layers for an Ascension input. Trained on `cli_ascension_sessions` + Store catalog.
- **Fingerprint classifier** — tier classification without LLM calls.

**Substrate dependency:** small (sklearn / lightweight transformers). No general-purpose LLM in the loop.
**Required:**
- Training pipeline (one-shot edge job per model).
- `brain_classifier_models` populated with serialized weights + provenance.
- Inference helper in `_shared/`.

**Exit criteria:**
- ≥4 narrow models in production.
- ≥30% of total NEXUS call volume diverted to narrow models.
- Per-task accuracy ≥ NEXUS baseline within 5%.

**Status:** corpus accumulating. Lex rule selector is the first candidate (highest determinism, smallest output space).

---

### Stage 4 — CMPSBL Cognitive (sealed Convex Core™ artifact)

**Goal:** a substrate-native cognitive — small, sealed, deterministic — trained exclusively on substrate-generated data. Distinct from generic LLMs because it inherits the determinism guarantee and the Merkle-anchored provenance of its training corpus.

**Substrate dependency:** training only. Inference runs inside Convex Core™.
**Required:**
- Curation of training corpus (crystals + traces + verified outputs).
- Reproducible training job with fingerprinted weights.
- Sealing into Convex Core™ artifact (no external dependencies at inference).
- Sold as a **Meta Agent (CMPSBL Cognitive)** in `/store`.

**Exit criteria:**
- First cognitive shipped as a Store SKU.
- Customer-verifiable training-data fingerprint.
- DECODE can route critical tasks to the cognitive instead of NEXUS.

**Status:** roadmap target. Not in v19.1 scope. The stage exists so the world knows where this is going and why CLM is the foundation.

---

## Why this isn't "just RAG"

RAG retrieves text and pastes it into an LLM prompt. The four stages above progressively *replace* the LLM:

| Stage | LLM role |
|---|---|
| 0 (today) | LLM does everything |
| 1 | LLM only when memory misses |
| 2 | LLM calls become training data |
| 3 | Narrow models replace specific call classes |
| 4 | Substrate-native cognitive replaces general calls |

Each stage is **independently shippable** and produces real cost, latency, and determinism gains. Stage 4 is the destination, but Stage 1 alone meaningfully reduces NEXUS spend and increases response provenance.

---

## What this changes about CLM and Memory

Nothing operationally. Memory Stream still runs autonomously every 8 hours. Distillation still mints crystals. CLM still cycles. The roadmap simply makes explicit what those cycles are *for*: building the training and retrieval substrate that lets Brain leave the LLM behind in defined, measurable phases.

---

## Customer-facing posture

Stages 1 and 2 are **internal**. Customers experience them as faster, cheaper, more cited DECODE responses.
Stage 3 is **internal infrastructure**. Customers experience it as improved Lex resolution, better layer recommendations, and faster Ascension classifications.
Stage 4 is the **first customer-facing cognitive product** — sold in `/store` as a Meta Agent, marketed as "trained only on the substrate's own work."

This is consistent with the Customer Clarity Roadmap: the factory is internal, the products are external.

---

## Non-Negotiables

- All stages preserve **determinism** in customer-facing outputs.
- All training corpora are **fingerprinted and Merkle-anchored**.
- No customer data enters training without explicit consent (per IP & Data Protection policy).
- The substrate never fabricates — local answers always cite source memory IDs.
- LLM dependency reduction is **measured, not claimed**: NEXUS call volume is the public KPI.

---

*© CMPSBL® · PromptFluid™ · 2026 · v19.1*
