# MEMORY — Tiered Cognitive Storage & RAG Orchestration

> **Node ID:** `memory` · **Sector:** Cognitive (CCR) · **Generation:** 1 · **Node #4 of 40**
> **Codename:** *Vault* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

MEMORY is the authoritative owner of all persistent conversation memory and system state storage across the substrate. By architectural decree, no other node may implement standalone persistence — all memory flows through MEMORY's tiered system spanning HOT, WARM, COLD, and LEGACY tiers.

MEMORY provides vector embedding search (HNSW index), spaced repetition (SM-2 scheduling), contextual pre-fetch, cross-agent sharing, episodic replay, contradiction detection, causal graph construction, and a full RAG pipeline with audit trail.

---

## Architecture

### Four-Tier Memory Model

| Tier | Retention | Access Pattern | Storage |
|---|---|---|---|
| **HOT** | Active session | Sub-millisecond, in-memory | JavaScript Map |
| **WARM** | 24 hours | Low-latency, localStorage | Encrypted localStorage |
| **COLD** | 30 days | On-demand, database | Supabase `brain_memories` |
| **LEGACY** | Permanent | Archival, compressed | Supabase with compression |

### Memory Lifecycle (5 Stages)

```
INGEST → STORE → INDEX → REFLECT → RETRIEVE
```

1. **Ingest** — Capture raw input from any source node, validate, assign type
2. **Store** — Route to appropriate tier based on type and importance
3. **Index** — Build knowledge graph connections, generate embeddings
4. **Reflect** — Periodic insight generation from accumulated memories
5. **Retrieve** — Multi-strategy recall (fulltext, semantic, pattern, hybrid)

### Memory Types

```typescript
type MemoryType = 
  | 'doctrine'            // Immutable core principles
  | 'doctrine_integrated' // Principles integrated into behavior
  | 'reflection'          // Self-generated insights
  | 'preference'          // User preferences
  | 'conversation'        // Dialog history
  | 'dream'               // Dream synthesis outputs
  | 'general'             // Unclassified
  | 'insight'             // Cross-node insights
  | 'template'            // Reusable patterns
  | 'heuristic'           // Learned rules
  | 'error_pattern';      // Failure signatures
```

---

## Trade Secrets

### 1. The Memory Ownership Principle

All persistent storage MUST flow through MEMORY. This is enforced at the architectural level:

> *"The use of separate, standalone persistence subsystems (e.g., 'PERSISTENT', 'STORAGE_ENGINE') is strictly prohibited to ensure centralized memory management and cognitive consistency across the 40-primitive matrix."*

This means ECONOMY's ledger, SEBA's receipt store, and every other node's state ultimately flows through MEMORY's governance.

### 2. Spaced Repetition (SM-2 Algorithm)

MEMORY uses the SuperMemo SM-2 algorithm for knowledge retention scheduling:

```
easiness = max(1.3, easiness + 0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
interval = {
  repetition 1: 1 day
  repetition 2: 6 days
  repetition n: interval(n-1) × easiness
}
```

High-quality recalls increase the interval exponentially. Poor recalls reset to 1 day. This ensures frequently-needed knowledge stays accessible while rarely-used knowledge gracefully decays.

### 3. Contradiction Detection

When a new memory contradicts an existing one, MEMORY flags the conflict:

```
for each new_memory:
  similar = vector_search(new_memory.embedding, threshold=0.8)
  for each match in similar:
    if sentiment_divergence(new_memory, match) > 0.6:
      emit CONTRADICTION_DETECTED(new_memory, match)
      route_to_CONSCIENCE for resolution
```

Contradictions are routed to CONSCIENCE (ESZ) for ethical resolution.

### 4. Dream-Driven Consolidation

During DREAM cycles, MEMORY receives consolidation signals:

- Frequently-accessed HOT memories are promoted to WARM with higher importance
- WARM memories with decaying access counts are demoted to COLD
- COLD memories below confidence threshold are archived to LEGACY
- Cross-memory patterns are synthesized into new `insight` entries

### 5. RAG Pipeline with Audit

The RAG (Retrieval-Augmented Generation) pipeline:

```
Query → Chunk → Embed → Search → Rank → Filter → Augment → Audit Log
```

Every RAG retrieval is logged with: query hash, result IDs, relevance scores, source attribution. This creates a full provenance trail for any AI-generated content.

---

## Algorithms

### Hybrid Recall Strategy

```
results = union(
  fulltext_search(query, limit=20),
  semantic_search(embedding(query), threshold=0.65, limit=20),
  pattern_match(extract_patterns(query), limit=10)
)
deduplicate(results)
rank(results, by: [relevance × 0.4, recency × 0.3, access_count × 0.2, confidence × 0.1])
return top_k(results, limit)
```

### Workload-Aware Tiering

MEMORY monitors access patterns and adjusts tier boundaries dynamically:

- If HOT tier exceeds 1000 entries → aggressive eviction to WARM
- If WARM tier query latency > 50ms → pre-load popular entries to HOT
- If COLD tier contains entries accessed >5× in 24h → promote to WARM

### Relevance Feedback Loop

Users can mark retrieval results as useful/not useful. This feedback adjusts future ranking:

```
source_score[source] = ewma(feedback_scores, alpha=0.1)
future_rank_boost = source_score[source] × 0.2
```

---

## Hardening (Vault v2.0.0)

The Memory Hardening layer provides:
- **Encryption at rest** — All WARM tier entries encrypted with XOR obfuscation
- **Access audit trail** — Every read/write logged with caller identity
- **Quota enforcement** — Per-tier entry limits to prevent memory exhaustion
- **Integrity checksums** — SHA-256 hashes on all COLD/LEGACY entries

---

## CLM Learning Priorities

1. **Adaptive Tiering Thresholds** — Learning optimal tier boundaries based on actual access patterns
2. **Retrieval Quality Optimization** — Improving recall precision through relevance feedback integration

---

*CMPSBL® Substrate — MEMORY Node Deep Dive · Founder Eyes Only*
