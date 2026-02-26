# BRAIN Neural Substrate Layer

**Parent Module:** BRAIN  
**Topology Class:** Internal Layer (within BRAIN module)  
**Status:** Specification Draft  
**Epoch:** SPARTA v11.5+

---

## Overview

The Neural Substrate Layer adds a lightweight neural network to the BRAIN module, enabling semantic memory retrieval, confidence-calibrated gating, pattern generalization, and distribution drift detection. It does **not** replace cloud LLM reasoning — it augments the BRAIN's existing pattern-accumulation engine with learned representations.

---

## Design Principles

1. **Browser-executable** — Core embedding and similarity run client-side via `onnxruntime-web`
2. **Edge-trainable** — Classifier and drift detector train/infer via backend functions
3. **Non-blocking** — Neural operations are async; the system degrades gracefully to keyword lookup if unavailable
4. **Budget-neutral** — No additional AI API calls; all inference is local or edge-computed
5. **Progressive** — Activates only after sufficient training data exists (minimum thresholds per component)

---

## Four Components

### 1. Embedding Engine

**Purpose:** Convert text artifacts (crystals, traces, heuristics, incoming queries) into dense vector representations.

| Property | Value |
|----------|-------|
| Model | `all-MiniLM-L6-v2` (quantized INT8, ~23MB) |
| Runtime | `onnxruntime-web` (WASM backend) |
| Dimensions | 384 |
| Execution | In-browser, async worker thread |
| Latency Target | <50ms per embedding |

**Process:**
1. On BRAIN boot, load quantized ONNX model into a Web Worker
2. Encode all hot/warm memory artifacts into vectors on first load
3. Incrementally encode new artifacts as they arrive from CLM/Distillation
4. Cache vectors in IndexedDB for persistence across sessions

**Activation Threshold:** Minimum 50 knowledge crystals in `brain_knowledge_crystals`

```
Input: "How should OCG handle relay timeouts?"
Output: Float32Array[384] — dense semantic vector
```

---

### 2. Vector Similarity Index (Neural Recall)

**Purpose:** Replace keyword/tag-based memory lookup with semantic nearest-neighbor search.

| Property | Value |
|----------|-------|
| Algorithm | HNSW (Hierarchical Navigable Small World) |
| Implementation | In-memory JS (hnswlib-wasm or custom) |
| Index Size | Up to 10,000 vectors |
| Query Time | <5ms for top-k=10 |
| Persistence | IndexedDB snapshot every 100 insertions |

**Process:**
1. Build HNSW index from cached embedding vectors
2. On query: embed the query → search index → return top-k similar artifacts
3. Artifacts are returned with cosine similarity scores
4. Results feed into NEXUS prompt augmentation as ranked context

**API Surface:**
```typescript
interface NeuralRecallResult {
  artifact_id: string;
  artifact_type: 'crystal' | 'trace' | 'heuristic';
  similarity: number; // 0.0 - 1.0
  content: string;
  metadata: Record<string, any>;
}

neuralRecall(query: string, topK?: number): Promise<NeuralRecallResult[]>
```

**Fallback:** If index is empty or model unavailable, falls back to existing tag-based lookup.

---

### 3. Confidence Classifier

**Purpose:** Predict the probability of success for a given action/pattern before execution.

| Property | Value |
|----------|-------|
| Architecture | Logistic regression / small MLP (2 hidden layers, 64 units) |
| Training Data | `brain_reasoning_traces` with outcome labels |
| Features | Embedding vector + mastery score + module context + historical success rate |
| Runtime | Backend function (trained periodically, inference via edge) |
| Output | `confidence: 0.0-1.0` + `recommendation: proceed | cautious | escalate` |

**Process:**
1. **Training (async, backend):** Every distillation cycle, retrain classifier on latest labeled traces
2. **Inference (edge function):** Given a proposed action embedding + context features, predict success probability
3. **Gating:** NEXUS router consults the confidence gate before committing to autonomous actions
4. **Feedback:** Actual outcomes are fed back to improve calibration (ECE tracking)

**Training Schedule:** Piggybacks on existing distillation cron — no additional budget

**Activation Threshold:** Minimum 200 labeled reasoning traces

**Gating Thresholds:**
| Confidence | Recommendation | Action |
|------------|---------------|--------|
| > 0.85 | `proceed` | Execute autonomously |
| 0.60 - 0.85 | `cautious` | Execute with enhanced logging |
| < 0.60 | `escalate` | Flag for review or fallback to cloud LLM |

---

### 4. Drift Detector

**Purpose:** Identify when incoming patterns deviate significantly from the BRAIN's learned distribution, signaling potential environmental changes or novel problem domains.

| Property | Value |
|----------|-------|
| Architecture | Lightweight autoencoder (encoder: 384→128→64, decoder: 64→128→384) |
| Training Data | Historical embedding vectors from all artifact types |
| Metric | Reconstruction error (MSE) |
| Runtime | Backend function (trained weekly, inference on every batch) |
| Alert Threshold | Reconstruction error > 2σ from rolling mean |

**Process:**
1. **Training:** Autoencoder learns to reconstruct "normal" embedding distributions
2. **Detection:** New embeddings are passed through — high reconstruction error = distribution shift
3. **Response:** Drift signal is sent to the Immunity Field for investigation
4. **Adaptation:** If drift persists for >3 cycles, trigger re-indexing and notify CLM to prioritize the shifted domain

**Integration with Immunity Field:**
- Drift signal feeds into `immune_drift_alerts` (new concept, lightweight)
- Immunity Field can trigger targeted repair cycles for the drifted domain
- Prevents the BRAIN from confidently applying stale patterns to changed conditions

**Activation Threshold:** Minimum 500 stored embedding vectors

---

## Data Flow

```
Incoming Query
      │
      ▼
┌─────────────┐
│  Embedding   │──→ Float32Array[384]
│   Engine     │
└─────────────┘
      │
      ├──────────────────────────┐
      ▼                          ▼
┌─────────────┐          ┌──────────────┐
│   Vector     │          │  Confidence   │
│   Similarity │          │  Classifier   │
│   Index      │          └──────────────┘
└─────────────┘                  │
      │                          ▼
      │                   confidence score
      ▼                   + recommendation
  top-k results                  │
      │                          │
      └──────────┬───────────────┘
                 ▼
         ┌──────────────┐
         │ NEXUS Router  │
         │ (augmented    │
         │  prompt +     │
         │  confidence   │
         │  gate)        │
         └──────────────┘
```

---

## Database Additions

| Table | Purpose |
|-------|---------|
| `brain_embeddings` | Cached embedding vectors with artifact references |
| `brain_classifier_models` | Serialized classifier weights and training metadata |
| `brain_drift_log` | Drift detection events with reconstruction errors |

---

## Resource Budget

| Component | Memory | Storage | Compute |
|-----------|--------|---------|---------|
| Embedding Engine | ~50MB (model + WASM) | ~25MB IndexedDB | Web Worker thread |
| Vector Index | ~40MB (10k vectors) | ~20MB IndexedDB | Main thread (<5ms queries) |
| Confidence Classifier | N/A (edge) | ~1MB model weights | Edge function (~10ms) |
| Drift Detector | N/A (edge) | ~2MB model weights | Edge function (~15ms) |
| **Total client-side** | **~90MB** | **~45MB** | **1 Web Worker** |

---

## Activation Gates

The Neural Substrate activates progressively as training data accumulates:

| Component | Minimum Data | Status Without |
|-----------|-------------|----------------|
| Embedding Engine | 50 crystals | Disabled — tag lookup used |
| Vector Similarity | 50 crystals + embeddings | Disabled — tag lookup used |
| Confidence Classifier | 200 labeled traces | Disabled — rule-based gating |
| Drift Detector | 500 embeddings | Disabled — no drift monitoring |

---

## Integration Points

| System | Integration |
|--------|------------|
| **NEXUS Router** | Consults Neural Recall for context injection; respects Confidence Gate |
| **CLM** | New artifacts trigger incremental embedding + index insertion |
| **Distillation Engine** | Classifier retrains during distillation cycles |
| **Immunity Field** | Receives drift alerts for targeted repair |
| **MEMORY** | Embeddings stored alongside existing memory artifacts |
| **Matrix Integrity** | Neural health contributes to BRAIN sector pulse |

---

## Non-Goals

- **No local text generation** — Cloud LLMs handle all generative tasks
- **No fine-tuning of foundation models** — This is a retrieval + classification layer
- **No GPU requirement** — All client-side inference runs on WASM/CPU
- **No additional API costs** — Zero external API calls for neural operations

---

*CMPSBL OS Substrate — BRAIN Neural Substrate Layer*  
*© 2025-2026 PromptFluid. All rights reserved.*
