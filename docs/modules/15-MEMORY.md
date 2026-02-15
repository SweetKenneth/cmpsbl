<div align="center">

# Module 15 — MEMORY

### Vector Store, RAG, and Embeddings

Layer 6 — Infrastructure

v10.5.1 ARCHITECT Epoch

</div>

---

## Purpose

MEMORY provides the substrate's vector storage and retrieval infrastructure. It manages embeddings, powers semantic search, and enables Retrieval-Augmented Generation (RAG) across the entire system. While BRAIN manages what to remember, MEMORY manages how to store and find it.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| Embedding Generation | Convert text to vector embeddings via NEXUS providers | Free |
| Semantic Search | Find memories by meaning, not just keywords | Free |
| Vector Storage | Store and index high-dimensional embeddings | Free |
| RAG Pipeline | Retrieve relevant context and inject into AI prompts | Pro |
| Hybrid Search | Combine semantic similarity with keyword and metadata filters | Pro |
| Embedding Staleness Detection (v10.5.1) | Track embedding model versions and flag stale vectors for re-embedding | Pro |
| Relevance Feedback Loop (v10.5.1) | EMA-based relevance scoring that adjusts retrieval weights based on utility | Pro |
| Embedding Updates | Re-embed content when models improve | Enterprise |
| Cross-User Search | Search across user boundaries (admin only) | Enterprise |
| Knowledge Graph Construction | Build relationship graphs from embedding clusters | CMPSBL |
| Embedding Compression | Reduce storage requirements while preserving retrieval quality | CMPSBL |

---

## Architecture

```
┌──────────────────────────────────────────┐
│              MEMORY Module                │
├──────────────┬───────────────────────────┤
│  Embedding    │  Vector Index             │
│  Engine       │  (pgvector)              │
│              │                           │
│  Text → Vec  │  Similarity search        │
│  via NEXUS   │  HNSW indexing            │
│              │  Cosine distance           │
├──────────────┴───────────────────────────┤
│           RAG Pipeline                    │
│                                          │
│  Query → Embed → Search → Rank → Inject  │
│                                          │
│  Retrieves top-k relevant chunks and     │
│  injects them into the AI prompt context │
├──────────────────────────────────────────┤
│     Embedding Health (v10.5.1)           │
│                                          │
│  Staleness Detection → Version Tracking  │
│  Relevance Feedback → EMA Scoring        │
└──────────────────────────────────────────┘
```

---

## Embedding Staleness Detection (v10.5.1)

MEMORY now tracks `embeddingVersion` on every vector and compares against the current model version:

| Field | Description |
|-------|-------------|
| `embeddingVersion` | Model version used to generate the vector |
| `currentVersion` | Latest available embedding model version |
| `staleCount` | Number of vectors needing re-embedding |
| `stalePercentage` | Proportion of stale vectors in the store |

When staleness exceeds 20%, MEMORY automatically queues re-embedding jobs via the CLM Engine.

---

## Relevance Feedback Loop (v10.5.1)

Every retrieval operation now feeds back into relevance scoring:

```
Retrieval → Was result useful? → EMA adjustment
                                    │
                                    ├── Useful: relevanceScore += α × (1 - current)
                                    └── Not useful: relevanceScore -= α × current
```

| Parameter | Value |
|-----------|-------|
| α (learning rate) | 0.1 |
| Initial relevance | 0.5 |
| Minimum threshold | 0.05 (below = candidate for pruning) |

---

## RAG Pipeline Steps

| Step | Description | Configurable |
|------|-------------|-------------|
| Query Embedding | Convert user query to vector | Model selection |
| Candidate Retrieval | Find top-N similar vectors | N (default: 20) |
| Re-Ranking | Score candidates by relevance, recency, and confidence | Weights |
| Relevance Feedback | Apply EMA-adjusted relevance scores (v10.5.1) | Learning rate |
| Context Assembly | Format retrieved chunks for prompt injection | Template |
| Token Budget | Ensure context fits within model's context window | Max tokens |

---

## Vector Index Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| Dimensions | 1536 | Matches OpenAI ada-002 embeddings |
| Index Type | HNSW | Hierarchical Navigable Small World graph |
| Distance Metric | Cosine | Cosine similarity for normalized vectors |
| ef_construction | 64 | Index build quality parameter |
| m | 16 | Maximum connections per node |

---

## Integration with Other Modules

| Module | Integration |
|--------|------------|
| BRAIN | Stores and retrieves memory embeddings; receives staleness signals via Brain Transfer |
| NEXUS | Routes embedding generation to appropriate AI provider |
| DECODE | Semantic search for intent matching |
| DREAM | Embeds dream insights for future retrieval |
| CORTEX | RAG context injection for orchestration decisions |
| RIPPLE | Emits `memory.embedded`, `memory.search_complete`, `memory.stale_detected` |
| CLM Engine | Server-side re-embedding and relevance recalculation every 5 minutes |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `memory_vectors` | Vector embeddings with metadata and `embeddingVersion` |
| `memory_chunks` | Source text chunks before embedding |
| `memory_indexes` | Index configuration and statistics |

---

<div align="center">

CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch

Kenneth E Sweet Jr · PromptFluid

ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX

© 2025–2026 PromptFluid. All rights reserved.

</div>
