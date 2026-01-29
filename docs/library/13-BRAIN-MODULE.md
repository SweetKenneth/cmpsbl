# CMPSBL OS Substrate — BRAIN Module Deep Dive

**Version 6.1.0 | Scientific Publication**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-013 |
| **Module** | BRAIN |
| **Layer** | Cognitive |
| **Version** | v6.1.0 |

---

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMPSBL OS SUBSTRATE                          │
├─────────────────────────────────────────────────────────────────┤
│  Created By:        Kenneth E Sweet Jr                          │
│  Organization:      PromptFluid®                                │
├─────────────────────────────────────────────────────────────────┤
│  For licensing or acquisition inquiries:                        │
│  Email: promptfluid@gmail.com | Phone: (214) 548-0883           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Module Overview

BRAIN is the persistent memory and learning system of the substrate, providing long-term context retention, semantic retrieval, and knowledge synthesis.

| Property | Value |
|----------|-------|
| **Name** | BRAIN |
| **Layer** | Cognitive |
| **Boot Order** | 4 |
| **Dependencies** | CORE, RIPPLE |

---

## 2. Memory Core Architecture (v6.1.0)

### 2.1 Unified Lifecycle

The **memory_core** module provides a unified memory lifecycle:

```
Ingest → Store → Index → Reflect → Retrieve
   │        │       │        │         │
   ▼        ▼       ▼        ▼         ▼
 Capture  Persist  Graph   Insights  Search
```

| Stage | Description |
|-------|-------------|
| **Ingest** | Capture raw input, calculate importance |
| **Store** | Persist to appropriate tier (hot/warm/cold) |
| **Index** | Build knowledge graph connections |
| **Reflect** | Generate insights from accumulated memories |
| **Retrieve** | Multi-strategy recall with semantic search |

### 2.2 Memory State Schema

| State | Description | Persistence |
|-------|-------------|-------------|
| **short_term** | Session-based, volatile | RAM only |
| **long_term** | Tiered persistent storage | Database |
| **latent** | Pending consolidation | Queue |

### 2.3 Three-Tier Model

| Tier | Threshold | Capacity | Latency |
|------|-----------|----------|---------|
| **Hot** | Score > 0.6 | 500 | <10ms |
| **Warm** | Score > 0.35 | 2,000 | <50ms |
| **Cold** | Score > 0.1 | 10,000 | <200ms |

### 2.4 Memory Scoring

Memory value is calculated using:

- **Recency** — Time since last access (exponential decay)
- **Frequency** — Number of accesses
- **Relevance** — Semantic importance
- **Confidence** — Source reliability
- **Type** — Memory classification weight

### 2.5 Automatic Tiering

The BRAIN module continuously evaluates memories:

1. Score calculation (hourly)
2. Tier promotion/demotion
3. Capacity enforcement
4. Pruning of low-value entries

---

## 3. Knowledge Graph

### 3.1 Graph Structure

**Nodes:** Memory entries
- ID, content, type, confidence, tier

**Edges:** Relationships
- Source, target, relation type, weight

### 3.2 Relation Types

| Type | Description |
|------|-------------|
| `SEMANTIC` | Meaning-based connection |
| `CAUSAL` | Cause-effect relationship |
| `TEMPORAL` | Time-sequence ordering |
| `HIERARCHICAL` | Parent-child structure |
| `ASSOCIATIVE` | General correlation |

### 3.3 Graph Operations

| Operation | Description |
|-----------|-------------|
| `brain.graph` | Summary statistics |
| `brain.graph --inspect` | Edge/node browser |
| `brain.graph --stats` | Connectivity metrics |
| `brain.graph --export` | JSON export |

---

## 4. Learning Cycle

### 4.1 Reflection Process

```
Input → Store → Accumulate → Reflect → Synthesize
                                │
                                ▼
                         New Memories
                        (reflection type)
```

### 4.2 Reflection Triggers

- Scheduled (daily)
- Threshold-based (memory count)
- Manual (`brain.reflect`)

---

## 5. Retrieval Strategies

### 5.1 Multi-Strategy Search

1. **Full-Text Search** — PostgreSQL websearch
2. **Pattern Matching** — ILIKE queries
3. **Hot Memory Scan** — In-tier search
4. **Semantic Similarity** — Embedding-based (when available)

### 5.2 Query Processing

```
Query → Parse → Strategy Selection → Parallel Search → Merge → Rank
```

---

## 6. Key Operations

| Operation | Description |
|-----------|-------------|
| `brain.status` | Memory system status |
| `brain.remember` | Store memory (legacy) |
| `brain.recall` | Search memories (legacy) |
| `brain.reflect` | Trigger reflection |
| `brain.tier` | Run tiering |
| `brain.prune` | Remove low-value |
| `brain.graph` | Knowledge graph |

### 6.1 Memory Core Operations (v6.1.0)

| Operation | Description |
|-----------|-------------|
| `brain.memory_ingest` | Unified ingest with lifecycle |
| `brain.memory_retrieve` | Multi-strategy retrieval |
| `brain.memory_state` | Get state schema |
| `brain.memory_cycle` | Run full lifecycle |

---

## 7. Memory Types

| Type | Purpose |
|------|---------|
| `doctrine` | Core system knowledge |
| `doctrine_integrated` | Synthesized doctrine |
| `reflection` | Reflection outputs |
| `preference` | User preferences |
| `conversation` | Dialogue history |
| `dream` | Dream cycle outputs |
| `general` | Uncategorized |
| `insight` | Task-derived insights |
| `template` | Execution templates |
| `heuristic` | Learned strategies |
| `error_pattern` | Failure patterns |

---

## 8. Performance Characteristics

| Metric | Value |
|--------|-------|
| Boot time | ~8ms |
| Hot recall | <10ms |
| Warm recall | <50ms |
| Cold recall | <200ms |
| Reflection time | 30-60s |
| Tiering cycle | ~5s |

---

## 9. Backward Compatibility

Legacy commands remain functional:

| Legacy | Routes To |
|--------|-----------|
| `remember()` | `memory_core.ingest()` |
| `recall()` | `memory_core.retrieve()` |
| `reflect()` | `memory_core.reflect()` |

---

*CMPSBL OS Substrate v6.1.0*
*© 2025-2026 PromptFluid®. All rights reserved.*
