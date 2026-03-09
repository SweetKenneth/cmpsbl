# BRAIN — Neural Substrate & Knowledge Crystallization

> **Node ID:** `brain` · **Sector:** Cognitive (CCR) · **Generation:** 1 · **Node #3 of 40**
> **Codename:** *Cortex Prime* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

BRAIN is the neural substrate layer — the seat of learning, knowledge crystallization, and predictive inference. It provides local neural processing using zero-dependency deterministic embeddings, a vector similarity index for nearest-neighbor recall, a confidence classifier for success prediction, and a drift detector that flags distribution shifts in real-time.

BRAIN is the most data-intensive node in the substrate. It manages knowledge crystals, heuristic patterns, training traces, and the embedding index — all without a single external API call.

---

## Architecture

### Hash-Embed-v1 Engine

BRAIN uses a proprietary `hash-embed-v1` implementation for generating embeddings:

- **Algorithm:** Deterministic character-level hashing to produce 384-dimensional vectors
- **Cost:** Zero — no external embedding API calls
- **Determinism:** Same input always produces the same vector, enabling cache-friendly comparison
- **Speed:** Sub-millisecond per embedding on modern hardware

```
for each character c in input:
  hash = FNV-1a(c, position, seed)
  vector[hash % 384] += weight(c, position)
normalize(vector) → unit L2 norm
```

### Neural Components

BRAIN has four self-activating neural components that progressively unlock as training data accumulates:

| Component | Activation Threshold | Function |
|---|---|---|
| **Vector Similarity Index** | 50 crystals | Nearest-neighbor recall using cosine similarity |
| **Confidence Classifier** | 100 traces | Predicts success probability for proposed actions |
| **Drift Detector** | 200 traces | Flags data distribution shifts using KL-divergence approximation |
| **Pattern Synthesizer** | 500 crystals | Generates new knowledge from pattern intersections |

### Knowledge Crystal Structure

```typescript
interface KnowledgeCrystal {
  id: string;
  content: string;
  embedding: number[];          // 384-dim hash-embed-v1
  confidence: number;           // 0-1 decay curve
  accessCount: number;
  source: string;               // origin node
  tags: string[];
  createdAt: number;
  lastAccessed: number;
  embeddingVersion: string;     // '3.0.0' current
}
```

---

## Trade Secrets

### 1. Zero-Cost Embedding Strategy

The entire embedding pipeline runs client-side with zero API costs. This is a fundamental architectural decision: by using deterministic hashing instead of transformer-based embeddings, BRAIN can process unlimited knowledge crystals without any usage-based billing. The trade-off is lower semantic fidelity compared to OpenAI/Cohere embeddings, but the substrate compensates with higher crystal volume and multi-strategy recall.

### 2. Progressive Self-Activation

Neural components don't boot on startup — they self-activate when training data thresholds are met. This means a fresh substrate has no neural overhead, while a mature substrate progressively gains intelligence. The activation thresholds are:

```
50 crystals  → Vector Index activates (recall becomes semantic)
100 traces   → Classifier activates (predictions begin)
200 traces   → Drift Detector activates (anomaly detection)
500 crystals → Synthesizer activates (autonomous knowledge creation)
```

### 3. Staleness Detection & Auto-Reindexing

Embeddings older than 7 days are marked stale. When the `CURRENT_EMBEDDING_VERSION` is bumped (currently `3.0.0`), all stale entries are automatically reindexed. The staleness report feeds into SEBA for prioritized maintenance.

### 4. CCR Brain Hardening

The Brain Hardening layer (`ccr/brain-hardening.ts`) wraps all BRAIN operations with:
- Input validation (max content size, character filtering)
- Output sanitization (PII scrubbing)
- Rate limiting per-session
- Circuit breaker integration

---

## Algorithms

### Cosine Similarity Recall

```
similarity(a, b) = dot(a, b) / (||a|| × ||b||)
```

Results are ranked by similarity score and filtered by a configurable threshold (default: 0.65).

### Confidence Decay Curve

Crystal confidence decays over time using a half-life model:

```
confidence(t) = initial_confidence × 2^(-t / half_life)
```

Half-life varies by memory type:
- `doctrine`: 90 days (near-permanent)
- `heuristic`: 30 days
- `conversation`: 7 days
- `error_pattern`: 14 days

### Drift Detection (KL-Divergence Approximation)

```
drift_score = Σ(p_new[i] × log(p_new[i] / p_baseline[i]))
```

When `drift_score > 0.15`, BRAIN emits a `DRIFT_DETECTED` signal to EVOLUTION for investigation.

---

## Database Tables

| Table | Purpose | RLS |
|---|---|---|
| `brain_embeddings` | Vector storage for knowledge crystals | service_role write, authenticated read |
| `brain_classifier_models` | Trained classifier state | service_role write, authenticated read |
| `brain_drift_log` | Drift detection history | service_role write, authenticated read |
| `brain_maintenance_log` | Auto-tiering and maintenance records | service_role write, authenticated read |

---

## CLM Learning Priorities

1. **Embedding Quality Optimization** — Learning which hash seeds produce the best recall accuracy for different content types
2. **Cross-Node Knowledge Synthesis** — Combining crystals from multiple nodes to discover emergent patterns

---

*CMPSBL® Substrate — BRAIN Node Deep Dive · Founder Eyes Only*
