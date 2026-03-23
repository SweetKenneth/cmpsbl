# 36 — Memory Persistence & Recall: Complete Deep Dive

**Classification:** 🔒 INTERNAL — Engineering Reference

---

## 1. Executive Summary

Memory in the substrate is not a cache. It is a persistent, tiered, salience-scored knowledge system that remembers across sessions, decays over time, self-organizes through automated tiering, and feeds back into every cognitive loop.

This document covers the complete lifecycle: how data enters the memory system, where it gets stored, how it ages and migrates between tiers, how it gets recalled, and how the Neural Substrate Layer provides local vector search and drift detection on top of it all.

---

## 2. Architecture Overview

Memory operates across three layers:

```
┌──────────────────────────────────────────────────────────┐
│  Layer 3: NEURAL SUBSTRATE (local processing)            │
│  Embedding Engine → Vector Index → Confidence Classifier │
│  → Drift Detector → Maintenance Manager                  │
├──────────────────────────────────────────────────────────┤
│  Layer 2: MEMORY MODULE (vector store + RAG)             │
│  Ingestion → Semantic Search → Staleness Detection       │
│  → Relevance Feedback → Auto-Tiering                     │
├──────────────────────────────────────────────────────────┤
│  Layer 1: MEMORY CORE (persistent DB-backed lifecycle)   │
│  Ingest → Store → Index → Reflect → Retrieve            │
│  3-tier storage: Hot → Warm → Cold                       │
│  Unified Salience Scorer                                 │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Layer 1 — Memory Core (Persistent Lifecycle)

**Source:** `src/lib/substrate/memory-core.ts`

### 3.1 — The Five-Stage Lifecycle

Every memory passes through up to five stages:

| Stage | What Happens | Persistence |
|---|---|---|
| **Ingest** | Content enters the system; noise filtering, dedup, importance scoring, tier assignment | Database insert |
| **Store** | Memory written to the appropriate tier table | `brain_memory_hot`, `brain_memory_warm`, or `brain_memory_cold` |
| **Index** | Graph edges created to connect related memories | `brain_graph_edges` table |
| **Reflect** | System synthesizes insights from accumulated memories | New reflection memory ingested |
| **Retrieve** | Multi-strategy recall with salience ranking | Access counts updated, recall tracked |

### 3.2 — Ingestion Pipeline

When `ingest()` is called, content passes through three guards before storage:

#### Noise Gate
- **Minimum length:** 20 characters
- **Alpha ratio:** ≥ 40% alphanumeric characters (rejects mostly-punctuation noise)
- **Repetition check:** If content > 80 chars and fewer than 5 unique 4-char chunks → rejected as repetitive

#### Dedup Guard
- First 120 characters of content are used as a prefix fingerprint
- `ILIKE` query against `brain_memory_hot` checks for existing matches
- If duplicate found → existing memory's `access_count` is incremented (reinforcement) instead of creating a duplicate

#### Capacity Guard
- If the target tier is Hot: checks current count against `HOT_CAPACITY` (200)
- If Hot is ≥ 80% full → memory is automatically downgraded to Warm
- This prevents hot-tier overflow that would degrade recall performance

### 3.3 — Importance Scoring

Every memory's initial importance is calculated by the **Unified Salience Scorer** — the single authoritative salience function in the entire substrate. All retrieval paths use this same function.

#### Salience Factor Weights

| Factor | Weight | What It Measures |
|---|---|---|
| Confidence | 0.20 | Input confidence score (0–1) |
| Recency | 0.18 | Exponential decay with **30-day half-life**: `e^(-ageDays/30)` |
| Frequency | 0.12 | Logarithmic access count: `log(accessCount + 1) / log(51)` |
| Reinforcement | 0.15 | SM-2 repetition signal: `0.3 + 0.7 × (1 - e^(-reps/5))` |
| Cross-Module | 0.10 | How many modules reference this memory: `refs / 4` |
| Type Weight | 0.10 | Intrinsic type importance (see below) |
| Attention | 0.08 | Current focus boost (0–1) |
| Relevance | 0.07 | Keyword overlap with active query context |

#### Type Importance Hierarchy

```
doctrine_integrated  1.00    ← Highest: core rules
doctrine             0.95
template             0.75
heuristic            0.70
error_pattern        0.65
preference           0.60
reflection           0.50
insight              0.50
conversation         0.40
dream                0.35
general              0.30    ← Lowest: ambient knowledge
```

### 3.4 — Tier Assignment

After importance scoring, the tier is determined by tight thresholds:

```
importance > 0.85  →  HOT    (short_term state)
importance > 0.40  →  WARM   (long_term state)
importance ≤ 0.40  →  COLD   (latent state)
```

These thresholds were tightened from earlier values (0.72 and 0.35) to keep the hot tier lean and responsive.

### 3.5 — The Three Tiers (Database Tables)

| Tier | Table | Capacity | Purpose |
|---|---|---|---|
| **Hot** | `brain_memory_hot` | 200 entries (500 max before emergency prune) | Active working memory. Highest-value, most-accessed memories |
| **Warm** | `brain_memory_warm` | 1,000 entries (10,000 max) | Long-term storage. Reliable knowledge that's accessed periodically |
| **Cold** | `brain_memory_cold` | 5,000 entries (10,000 max) | Archive. Latent knowledge retained for historical context |

### 3.6 — Retrieval System

`retrieve()` supports four strategies:

| Strategy | Mechanism |
|---|---|
| `fulltext` | PostgreSQL `textSearch()` across tier tables |
| `pattern` | `ILIKE` pattern matching (`%query%`) |
| `semantic` | (Delegated to Layer 2 — Neural vector search) |
| `hybrid` | Combines fulltext + pattern, deduplicates, ranks by salience |

**Retrieval Ranking Formula:**
```
score = importance_score × 0.6 + access_count × 0.1 + confidence × 0.3
```

Results are filtered by confidence threshold (default 0.3), then limited.

#### Recall Feedback Bridge
Every retrieval operation:
1. Calls `track_memory_recall` RPC with hit/miss status (for metacognitive monitoring)
2. Updates `last_used` / `last_accessed` timestamps on retrieved memories
3. This feeds back into the salience scorer's recency factor

### 3.7 — Reflection Engine

The `reflect()` method:
1. Pulls recent hot-tier memories filtered by minimum confidence
2. Depth controls scope: `shallow` = 20 memories, `standard` = 50, `deep` = 100
3. Synthesizes insights by finding pattern clusters
4. Stores the reflection itself as a new `reflection` type memory
5. Logs to `brain_events` for audit

### 3.8 — Auto-Degradation (Warm → Cold)

`autoDegradeStaleMemories()` runs periodically (typically during dream/prune cycles):
- Finds warm memories not accessed in `staleDays` (default 14 days)
- Moves them to cold with decayed scores: confidence × 0.8, importance × 0.7
- Tags with `auto_demoted` and records demotion timestamp
- Processes in batches of 50 to avoid overwhelming the database

---

## 4. Layer 2 — Memory Module (Vector Store + RAG)

**Source:** `src/lib/substrate/memory-module/index.ts`

### 4.1 — In-Memory Vector Store

The Memory Module maintains an in-memory vector store (Map-based, capped at 2,000 entries) for fast runtime recall. Each entry carries:

```typescript
interface VectorEntry {
  id: string;
  content: string;
  embedding?: number[];
  source: string;
  relevanceScore: number;      // 0–1, updated by feedback
  accessCount: number;
  embeddingVersion: string;    // Current: '3.0.0'
}
```

### 4.2 — Staleness Detection

Embeddings are tracked by version. When the embedding model changes (current version: `3.0.0`), entries with older versions or older than 7 days are flagged as stale. `refreshStaleEmbeddings()` re-versions them.

If > 30% of entries are stale, a `staleness_alert` event is emitted.

### 4.3 — Relevance Feedback Loop

The system learns from recall quality:
- `recordRelevanceFeedback()` accepts a `wasUseful` boolean and a `relevanceScore`
- Updates the source entry's relevance using exponential moving average: `newScore = old × 0.7 + feedback × 0.3`
- Aggregates statistics: top/low performing sources, improvement rate over time

### 4.4 — Auto-Tiering (Runtime)

`runLocalTiering()` executes every 15 minutes (configurable):

| Action | Threshold | Effect |
|---|---|---|
| Promote | `effectiveScore ≥ 0.9` | Boost relevance by 0.02 |
| Archive | `effectiveScore ≤ 0.08` AND `accessCount === 0` | Delete from vector store |
| Demote | `effectiveScore ≤ 0.25` | Decay relevance by 0.01 |

**Workload-aware:** Recently accessed entries get a recency bonus (up to 0.1) that decays over 7 days.

### 4.5 — Circuit Breaker Integration

The Memory Module initializes with a circuit breaker (threshold: 5 failures, recovery: 30s). All operations use `withResilience()` wrappers that:
- Track success/failure
- Trip the breaker on sustained failures
- Return safe fallback values during open-breaker periods

---

## 5. Layer 3 — Neural Substrate (Local Intelligence)

**Source:** `src/lib/substrate/neural/`

### 5.1 — Components

| Component | Activation Threshold | Function |
|---|---|---|
| **Embedding Engine** | Always active | 384-dimensional vectors via deterministic `hash-embed-v1` — zero API cost |
| **Vector Similarity Index** | 50+ crystals indexed | Nearest-neighbor recall using cosine similarity |
| **Confidence Classifier** | 200+ execution traces | Predicts success probability before autonomous execution |
| **Drift Detector** | 200+ traces | Flags data distribution shifts that indicate model degradation |
| **Maintenance Manager** | Always active | Runs every 15 minutes: tiering, garbage collection, staleness checks |

### 5.2 — hash-embed-v1

The embedding engine uses **deterministic character-level hashing** to generate 384-dimensional vectors. This means:
- Zero external API calls for embeddings
- Zero cost
- Deterministic: same input always produces same vector
- Fast: pure computation, no network

Trade-off: Lower semantic precision than transformer-based embeddings, but sufficient for the substrate's recall needs (pattern matching, not open-domain QA).

### 5.3 — Neural Recall API

```typescript
neuralRecall(query: string, topK: number = 5)
```

This is the primary API for context augmentation. The NEXUS router and DECODE both use it to fetch semantically relevant memories before generating responses.

### 5.4 — Confidence Gate

```typescript
confidenceGate(actionText: string, context?: Record<string, number>)
```

Used before autonomous execution. If the classifier predicts low success probability, the action is escalated to human review rather than auto-executed.

---

## 6. Database-Backed Tiering (Set-Based RPCs)

**Source:** `src/lib/substrate/brain-auto-tiering/`

The auto-tiering system uses **set-based database RPCs** rather than row-by-row logic to prevent system overloads:

| RPC | Function |
|---|---|
| `brain_bulk_demote_hot_to_warm` | Move batches from hot → warm |
| `brain_bulk_demote_warm_to_cold` | Move batches from warm → cold |
| `brain_bulk_promote_warm_to_hot` | Promote high-value warm → hot |

**Capacity Enforcement:**

| Tier | Soft Cap | Emergency Cap (2×) |
|---|---|---|
| Hot | 500 | 1,000 (triggers emergency prune) |
| Warm | 10,000 | 20,000 |
| Cold | 10,000 | 20,000 |

Emergency pruning runs when any tier exceeds 2× its soft capacity, removing the lowest-scoring entries.

---

## 7. Memory Graph (Knowledge Web)

The `index()` stage creates edges in `brain_graph_edges`:

```typescript
{
  source_id: memoryId,
  target_id: relatedMemoryId,
  relation_type: 'semantic' | 'causal' | 'temporal' | 'hierarchical' | 'associative',
  weight: 0.5,
}
```

These edges enable:
- **Causal reasoning:** A → B chains for root cause analysis
- **Semantic clustering:** Related memories grouped for reflection
- **Temporal ordering:** Event sequences reconstructed from timestamps

---

## 8. Cross-Module Memory Access

Memory is not isolated to the MEMORY module. Multiple modules interact with the memory system:

| Module | Access Pattern |
|---|---|
| **BRAIN** | Neural embedding, vector indexing, confidence gating |
| **DREAM** | Consolidation during dream cycles — promotes insights, decays noise |
| **CLM** | Constant Learning Mode — ingests external knowledge into memory |
| **DECODE** | Retrieves context for natural language understanding |
| **NEXUS** | Uses neural recall for context-augmented routing decisions |
| **CORTEX** | Orchestrates memory across cognitive memory chains |
| **ECHO** | Cross-session memory replay |
| **VISION** | Stores scan results and findings as memories |

---

## 9. Data Flow: Complete Memory Lifecycle

```
  Input Content
       │
       ▼
  ┌─────────────┐
  │  NOISE GATE  │  Length < 20? Alpha < 40%? Repetitive? → REJECT
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  DEDUP GUARD │  Prefix match in Hot? → REINFORCE existing
  └──────┬──────┘
         │
         ▼
  ┌─────────────────────────┐
  │  UNIFIED SALIENCE SCORE  │  8 weighted factors → importance (0–1)
  └──────┬──────────────────┘
         │
         ├── importance > 0.85 → HOT  (brain_memory_hot)
         ├── importance > 0.40 → WARM (brain_memory_warm)
         └── importance ≤ 0.40 → COLD (brain_memory_cold)
                  │
                  ▼
           ┌──────────┐
           │  INDEX    │  Create graph edges → brain_graph_edges
           └──────────┘
                  │
                  ▼ (periodic)
           ┌──────────┐
           │  REFLECT  │  Synthesize insights from Hot tier → New memory
           └──────────┘
                  │
                  ▼ (periodic, every 15 min)
           ┌─────────────────┐
           │  AUTO-TIERING    │  Promote/demote between tiers
           │  + DEGRADATION   │  Warm → Cold after 14 days stale
           └─────────────────┘
                  │
                  ▼ (on query)
           ┌──────────┐
           │  RETRIEVE │  Fulltext + Pattern + Vector → Ranked results
           │           │  Recall feedback → Salience update
           └──────────┘
```

---

## 10. Configuration Reference

| Parameter | Value | Location |
|---|---|---|
| Noise gate min length | 20 chars | memory-core.ts |
| Noise gate alpha ratio | 0.40 | memory-core.ts |
| Hot capacity | 200 | memory-core.ts |
| Hot capacity (DB soft cap) | 500 | brain-auto-tiering |
| Warm capacity (DB soft cap) | 10,000 | brain-auto-tiering |
| Cold capacity (DB soft cap) | 10,000 | brain-auto-tiering |
| Hot tier threshold | importance > 0.85 | memory-core.ts |
| Warm tier threshold | importance > 0.40 | memory-core.ts |
| Recency half-life | 30 days | memory-core.ts (salience) |
| Auto-tiering interval | 15 minutes | memory-module, brain-auto-tiering |
| Hot promotion threshold | 0.9 | memory-module |
| Cold archive threshold | 0.08 | memory-module |
| Warm demotion threshold | 0.25 | memory-module |
| Stale demotion age | 14 days | memory-core.ts |
| Embedding dimension | 384 | neural/embedding-engine |
| Embedding model | hash-embed-v1 | neural/embedding-engine |
| Max vector store | 2,000 | memory-module |
| Max feedback log | 500 | memory-module |
| Staleness threshold | 7 days | memory-module |
| Circuit breaker threshold | 5 failures | memory-module |
| Circuit breaker recovery | 30 seconds | memory-module |

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-06 | System | Complete memory deep dive — consolidated from source |

---

© 2025–2026 CMPSBL®. Confidential.
