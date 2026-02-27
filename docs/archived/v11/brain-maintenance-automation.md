# BRAIN Automated Maintenance Guide

**Module:** BRAIN Neural Substrate + Memory Maintenance  
**Status:** Active — Fully Automated  
**Epoch:** SPARTA v11.5+

---

## Overview

All BRAIN maintenance tasks are handled by the **Maintenance Manager** (`src/lib/substrate/neural/maintenance-manager.ts`). Once the substrate boots, every task runs on its own schedule with no operator intervention required.

---

## Automated Task Schedule

### Neural Substrate Tasks

| Task | Interval | Purpose |
|------|----------|---------|
| `neural_embed_new_artifacts` | Every 10 min | Encode new knowledge crystals into 384-dim vectors |
| `neural_refresh_vector_index` | Every 5 min | Reload in-memory HNSW index from database |
| `neural_classifier_retrain` | Every 4 hours | Retrain confidence classifier on latest reasoning traces |
| `neural_drift_check` | Every 30 min | Check for distribution shifts in incoming patterns |
| `neural_drift_retrain` | Weekly | Retrain autoencoder baseline for drift detection |

### BRAIN Memory Maintenance Tasks

| Task | Interval | Purpose |
|------|----------|---------|
| `brain_memory_tiering` | Every 1 hour | Promote/demote memories across hot→warm→cold→archive |
| `brain_confidence_decay` | Every 6 hours | Apply time-based value decay to aging memories |
| `brain_warm_compression` | Every 4 hours | Compress long warm memories into summaries |
| `brain_metacognition` | Every 2 hours | Assess retrieval strategy and adjust recall parameters |
| `brain_stale_embedding_cleanup` | Daily | Remove orphaned embeddings for deleted artifacts |

---

## Activation Gates

Components activate progressively as data accumulates:

| Component | Minimum Data | Without Threshold |
|-----------|-------------|-------------------|
| Embedding Engine | 50 knowledge crystals | Disabled — tag lookup used |
| Vector Index | 50 crystals + embeddings cached | Disabled — tag lookup used |
| Confidence Classifier | 200 reasoning traces | Disabled — rule-based gating |
| Drift Detector | 500 cached embeddings | Disabled — no drift monitoring |

**No action needed** — the system checks thresholds automatically and activates when ready.

---

## How It Starts

The Maintenance Manager is initialized automatically during substrate boot:

```
SubstrateProvider mount
  → initializeNeuralSubstrate()
    → maintenanceManager.start()
      → embeddingEngine.initialize()
      → vectorIndex.load()
      → confidenceClassifier.initialize()
      → driftDetector.initialize()
      → Schedule all 10 tasks on their intervals
```

---

## Monitoring

### Via Terminal Commands

```
brain/neural status     — Neural substrate component states
brain/maintenance log   — Recent maintenance task executions
brain/drift alerts      — Drift detection anomaly history
```

### Via Database

```sql
-- Recent maintenance runs
SELECT task_type, status, duration_ms, details
FROM brain_maintenance_log
ORDER BY created_at DESC
LIMIT 20;

-- Drift anomalies
SELECT * FROM brain_drift_log
WHERE is_anomaly = true
ORDER BY created_at DESC;

-- Active classifier model
SELECT model_type, training_samples, accuracy, created_at
FROM brain_classifier_models
WHERE is_active = true;
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `brain_embeddings` | Cached 384-dim vectors with artifact references |
| `brain_classifier_models` | Serialized classifier/autoencoder weights |
| `brain_drift_log` | Drift detection events with reconstruction errors |
| `brain_maintenance_log` | Execution log for all automated tasks |

---

## Resource Usage

| Resource | Impact |
|----------|--------|
| **AI API calls** | **Zero** — all inference is local WASM/CPU |
| **Client memory** | ~90MB (model + index) |
| **IndexedDB** | ~45MB (cached vectors) |
| **Database writes** | ~50-100 rows/hour (logs + embeddings) |
| **Edge function calls** | Zero (classifier runs client-side) |

---

## Failure Handling

- Tasks that fail are logged with error messages in `brain_maintenance_log`
- Failed tasks retry on their next scheduled interval
- No task failure cascades to other tasks
- All maintenance functions degrade gracefully to no-ops when dependencies are unavailable

---

## Previously Missing Automation (Now Fixed)

Before the Neural Substrate Layer, these BRAIN tasks required manual invocation or were not running:

1. **Memory tiering** — hot→warm→cold promotion/demotion was only triggered by specific user actions
2. **Confidence decay** — memories retained inflated value scores indefinitely
3. **Warm compression** — warm tier memories grew unbounded without summarization
4. **Metacognitive assessment** — retrieval strategy was static, not adaptive

All four are now automated on fixed intervals.

---

*CMPSBL OS Substrate — BRAIN Automated Maintenance Guide*  
*© 2025-2026 PromptFluid. All rights reserved.*
