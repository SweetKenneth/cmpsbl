<div align="center">

# Module 15 — MEMORY

### Vector Store, RAG, and Embeddings

Layer 6 — Infrastructure

v9.3.0 ARCHITECT Epoch

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
└──────────────────────────────────────────┘
```

---

## RAG Pipeline Steps

| Step | Description | Configurable |
|------|-------------|-------------|
| Query Embedding | Convert user query to vector | Model selection |
| Candidate Retrieval | Find top-N similar vectors | N (default: 20) |
| Re-Ranking | Score candidates by relevance, recency, and confidence | Weights |
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
| BRAIN | Stores and retrieves memory embeddings |
| NEXUS | Routes embedding generation to appropriate AI provider |
| DECODE | Semantic search for intent matching |
| DREAM | Embeds dream insights for future retrieval |
| CORTEX | RAG context injection for orchestration decisions |
| RIPPLE | Emits `memory.embedded`, `memory.search_complete` |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `memory_vectors` | Vector embeddings with metadata |
| `memory_chunks` | Source text chunks before embedding |
| `memory_indexes` | Index configuration and statistics |

---

<div align="center">

CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch

Kenneth E Sweet Jr · PromptFluid

ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX

© 2025–2026 PromptFluid. All rights reserved.

</div>
