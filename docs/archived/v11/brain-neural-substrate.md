# BRAIN Neural Substrate Layer

**Parent Module:** BRAIN  
**Topology Class:** Internal Layer (within BRAIN module)  
**Status:** Implemented — Active  
**Epoch:** SPARTA v11.5+

---

## Overview

The Neural Substrate Layer adds a lightweight neural network to the BRAIN module, enabling semantic memory retrieval, confidence-calibrated gating, pattern generalization, and distribution drift detection. It does **not** replace cloud LLM reasoning — it augments the BRAIN's existing pattern-accumulation engine with learned representations.

---

## Design Principles

1. **Browser-executable** — Core embedding and similarity run client-side
2. **Edge-trainable** — Classifier and drift detector train/infer via backend or client-side
3. **Non-blocking** — Neural operations are async; the system degrades gracefully to keyword lookup if unavailable
4. **Budget-neutral** — No additional AI API calls; all inference is local
5. **Progressive** — Activates only after sufficient training data exists (minimum thresholds per component)

---

## Four Components

### 1. Embedding Engine (`embedding-engine.ts`)

| Property | Value |
|----------|-------|
| Model | Deterministic hash embeddings (`hash-embed-v1`) |
| Dimensions | 384 |
| Execution | In-browser, main thread |
| Latency | <5ms per embedding |
| Activation | 50+ knowledge crystals |

Converts text artifacts into dense vector representations for similarity comparison.

### 2. Vector Similarity Index (`vector-index.ts`)

| Property | Value |
|----------|-------|
| Algorithm | Brute-force cosine similarity (upgrade path: HNSW) |
| Max Index Size | 10,000 vectors |
| Query Time | <5ms for top-k=10 |
| Auto-refresh | Every 5 minutes |
| Persistence | Database-backed |

Primary API: `neuralRecall(query, topK)` — returns semantically similar artifacts ranked by cosine similarity.

### 3. Confidence Classifier (`confidence-classifier.ts`)

| Property | Value |
|----------|-------|
| Architecture | Online logistic regression (384 + 3 context features) |
| Training Data | `brain_reasoning_traces` with confidence labels |
| Retraining | Every 4 hours (automated) |
| Activation | 200+ reasoning traces |

Gating thresholds:
| Confidence | Recommendation | Action |
|------------|---------------|--------|
| > 0.85 | `proceed` | Execute autonomously |
| 0.60 - 0.85 | `cautious` | Execute with enhanced logging |
| < 0.60 | `escalate` | Flag for review |

### 4. Drift Detector (`drift-detector.ts`)

| Property | Value |
|----------|-------|
| Method | Statistical distribution monitoring (reconstruction error tracking) |
| Alert Threshold | Reconstruction error > 2σ from rolling mean |
| Check Interval | Every 30 minutes |
| Training | Weekly autoencoder retrain |
| Activation | 500+ cached embeddings |

Drift alerts are logged to `brain_drift_log` and signal the Immunity Field for targeted repair.

---

## Data Flow

```
Incoming Query
      |
      v
[Embedding Engine] --> Float32Array[384]
      |
      +------------------------+
      v                        v
[Vector Similarity]    [Confidence Classifier]
[Index (top-k)]        [predict success]
      |                        |
      v                        v
  ranked results          confidence score
      |                   + recommendation
      +----------+-----------+
                 v
         [NEXUS Router]
         (augmented prompt
          + confidence gate)
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `brain_embeddings` | 384-dim vectors with artifact references |
| `brain_classifier_models` | Serialized model weights (confidence + drift) |
| `brain_drift_log` | Drift detection events |
| `brain_maintenance_log` | All automated task execution logs |

---

## Maintenance

**Fully automated.** See [brain-maintenance-automation.md](./brain-maintenance-automation.md) for complete schedule.

10 tasks run on fixed intervals:
- 5 Neural Substrate tasks (embedding, indexing, training, drift checking)
- 5 BRAIN memory tasks (tiering, decay, compression, metacognition, cleanup)

Zero operator intervention required after initial boot.

---

## Integration Points

| System | Integration |
|--------|------------|
| **NEXUS Router** | `neuralRecall()` for context injection; `confidenceGate()` for go/no-go |
| **CLM** | New artifacts trigger incremental embedding |
| **Distillation Engine** | Classifier retrains during distillation cycles |
| **Immunity Field** | Receives drift alerts for targeted repair |
| **Matrix Integrity** | Neural health contributes to BRAIN sector pulse |

---

## API Surface

```typescript
import {
  initializeNeuralSubstrate,
  shutdownNeuralSubstrate,
  getNeuralSubstrateStatus,
  neuralRecall,
  confidenceGate,
} from '@/lib/substrate/neural';

// Boot (called automatically by SubstrateProvider)
await initializeNeuralSubstrate();

// Semantic memory retrieval
const results = await neuralRecall("How should OCG handle relay timeouts?", 5);

// Confidence gating
const prediction = confidenceGate("Apply mutation to relay module", {
  mastery_score: 0.82,
  historical_success_rate: 0.91,
});

// Full status
const status = getNeuralSubstrateStatus();
```

---

## Non-Goals

- **No local text generation** — Cloud LLMs handle all generative tasks
- **No fine-tuning of foundation models** — This is a retrieval + classification layer
- **No GPU requirement** — All inference runs on CPU
- **No additional API costs** — Zero external API calls

---

*CMPSBL OS Substrate — BRAIN Neural Substrate Layer*  
*© 2025-2026 PromptFluid. All rights reserved.*
