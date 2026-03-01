# 12 — Memory & Learning Internals

**Classification:** 🔒 INTERNAL

---

## 1. Purpose

This document describes the substrate's memory architecture, learning engine, DREAM cycle mechanics, and knowledge compounding model. These systems enable the "no reset" persistent intelligence that differentiates Clockless from session-based AI.

## 2. Memory Architecture

### Module Ownership

| Module | Responsibility |
|--------|---------------|
| BRAIN | Knowledge graph, embeddings, classifier models, drift detection |
| MEMORY | Persistent store, SM-2 tiering, WAL, content hash seals |
| DREAM | Offline optimization, pattern discovery, insight promotion |

### Memory Tier Definitions

| Tier | Label | Access Latency | Retention | Storage |
|------|-------|---------------|-----------|---------|
| 0 | Hot | < 10ms | Active session | In-memory cache |
| 1 | Warm | < 100ms | 30–90 days | Indexed database |
| 2 | Cold | < 1s | 1 year | Archived storage |
| 3 | Frozen | On-demand | Indefinite | Deep archive, decay-weighted |

### Promotion & Demotion

```
Hot ←→ Warm: Based on access frequency (SM-2 interval)
Warm ←→ Cold: Based on SM-2 ease factor and time since last access
Cold ←→ Frozen: Based on decay confidence threshold
Frozen → Warm: DREAM cycle pattern recognition can promote
```

## 3. SM-2 Spaced Repetition Engine

### Core Algorithm

```
After recall attempt with quality score q (0-5):

if q >= 3 (successful recall):
  if repetitions == 0: interval = 1 day
  elif repetitions == 1: interval = 6 days
  else: interval = round(interval × easeFactor)
  repetitions += 1
else (failed recall):
  repetitions = 0
  interval = 1 day

easeFactor = max(1.3, 
  easeFactor + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02)))
```

### Health Monitoring

```typescript
interface SM2Stats {
  totalCards: number;
  dueCards: number;
  avgEaseFactor: number;
  avgInterval: number;
  retentionRate: number;
}
```

| Health Metric | Healthy | Warning | Critical |
|--------------|---------|---------|----------|
| Retention rate | > 0.85 | 0.70–0.85 | < 0.70 |
| Overdue ratio | < 0.15 | 0.15–0.30 | > 0.30 |
| Avg ease factor | > 2.0 | 1.5–2.0 | < 1.5 |

### Decay Model

```
confidence(t) = initial_confidence × e^(-λt)
```

Where:
- `λ` = decay constant (varies by memory type)
- `t` = time since last access (days)
- Memories below confidence `0.30` are hidden from query results

## 4. BRAIN Module

### Embeddings

BRAIN stores vector embeddings for semantic search. Each embedding record includes:
- Source text
- Vector representation
- Confidence score
- Creation timestamp
- Last access timestamp
- Access count

### Classifier Models

BRAIN maintains trained classifiers for:
- Intent classification
- Topic categorization
- Sentiment analysis
- Urgency scoring

### Drift Detection

BRAIN monitors embedding drift over time:
- If embedding similarity for known concepts drops below threshold, drift is flagged
- Drift log records: `concept_id`, `expected_similarity`, `actual_similarity`, `timestamp`
- Drift > 20% triggers retraining or re-embedding

### Maintenance Log

Scheduled maintenance tasks:
- Embedding reindexing
- Classifier retraining
- Stale entry cleanup
- Tier rebalancing

## 5. DREAM Cycle (Nocturne v2.0.0)

### Purpose

DREAM runs offline optimization cycles that discover patterns, consolidate learning, and generate improvement insights without consuming real-time resources.

### Cycle Structure

```
1. Trigger: Scheduled or low-activity period detected
2. Gather: Collect recent events, interactions, and learning data
3. Analyze: Pattern recognition across gathered data
4. Generate: Produce insight proposals
5. Guard: Hallucination guards validate insights
6. Budget: Energy budget check (compute limits)
7. Cache: Store validated patterns in latent pattern cache
8. Promote: Submit insights to promotion pipeline
```

### Hallucination Guards

Before any DREAM insight is promoted:

| Guard | Check |
|-------|-------|
| Consistency | Does the insight contradict known facts? |
| Evidence | Is there sufficient supporting data? |
| Novelty | Is this genuinely new, or a false positive? |
| Safety | Could promoting this insight cause harm? |

Failed guards → insight is logged but not promoted.

### Energy Budgets

DREAM cycles have compute caps to prevent runaway resource consumption:

| Parameter | Default |
|-----------|---------|
| Max cycle duration | 5 minutes |
| Max patterns analyzed | 1000 |
| Max insights generated | 50 per cycle |
| Max promotion candidates | 10 per cycle |

### Latent Pattern Cache

Recurring patterns are cached for faster retrieval:
- Cache key: pattern signature hash
- Cache TTL: 7 days
- Eviction: LRU when cache exceeds 500 entries

## 6. Knowledge Compounding Model

### The Compounding Advantage

```
Knowledge_value(t) = K₀ × (1 + learning_rate)^t - decay_losses(t)
```

This creates exponential value growth:
- Each successful interaction adds to knowledge base
- SM-2 ensures knowledge is retained efficiently
- DREAM cycles discover patterns that manual analysis misses
- Evolution pipeline continuously improves the system itself
- Receipt chain ensures improvement history is never lost

### Knowledge Sources

| Source | Mechanism | Retention |
|--------|-----------|-----------|
| User interactions | DECODE captures, BRAIN stores | SM-2 tiered |
| Evolution outcomes | Receipt chain, competency scoring | Permanent |
| DREAM insights | Pattern recognition, promotion pipeline | SM-2 tiered |
| Error recovery | Self-healing logs, DLQ analysis | 90 days |
| Provider performance | NEXUS affinity scoring | Rolling 30 days |

### No-Reset Guarantee

Unlike session-based AI systems:
- There is no conversation window that resets
- There is no context that is lost between sessions
- All learning persists in BRAIN/MEMORY
- DREAM continuously consolidates and strengthens knowledge
- Evolution applies structural improvements that are permanent

## 7. BRAIN Database Tables (Internal)

| Table | Access | Purpose |
|-------|--------|---------|
| `brain_embeddings` | Auth read, service write | Vector embeddings |
| `brain_classifier_models` | Auth read, service write | Trained models |
| `brain_drift_log` | Auth read, service write | Embedding drift records |
| `brain_maintenance_log` | Auth read, service write | Scheduled maintenance |
| `brain_events` | User-scoped | User interaction events |

All tables are RLS-protected. Service-role write access prevents unauthorized knowledge injection.

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial memory and learning documentation |

---

© 2025–2026 PromptFluid®. Confidential.
