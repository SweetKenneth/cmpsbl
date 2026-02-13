# MEMORY Module

**CMPSBL® Substrate — Infrastructure Layer | v9.1.0 ARCHITECT Epoch**

---

## Overview

The **MEMORY** module provides vector/RAG orchestration and semantic recall as a dedicated infrastructure service. Unlike the BRAIN module (which handles cognitive memory tiers), MEMORY is the low-level infrastructure for embedding storage, similarity search, and retrieval-augmented generation pipelines.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| **Vector Embedding** | Convert text/data to high-dimensional vectors | FREE |
| **Semantic Search** | Find similar content by meaning, not keywords | FREE |
| **RAG Pipeline** | Retrieval-Augmented Generation orchestration | Builder |
| **Embedding Cache** | Warm cache for frequently accessed embeddings | Builder |
| **Cross-Module Recall** | Unified recall API for all substrate modules | Pro |
| **Memory Compression** | Lossy/lossless compression for cold storage | Pro |

---

## Architecture

```
┌───────────────────────────────────┐
│         MEMORY MODULE             │
├───────────────────────────────────┤
│  Embedding Engine                 │
│  ├── Text → Vector conversion     │
│  ├── Multi-model support          │
│  └── Batch embedding pipeline     │
├───────────────────────────────────┤
│  Similarity Index                 │
│  ├── HNSW graph index             │
│  ├── Cosine / Euclidean distance  │
│  └── Filtered search              │
├───────────────────────────────────┤
│  RAG Orchestrator                 │
│  ├── Context window management    │
│  ├── Chunk overlap control        │
│  └── Source attribution           │
└───────────────────────────────────┘
```

---

## SDK Usage

```typescript
import { substrate } from '@cmpsbl/sdk';

// Embed content
const embedding = await substrate.memory.embed({
  content: 'CMPSBL substrate architecture overview',
  model: 'text-embedding-3-small'
});

// Semantic search
const results = await substrate.memory.search({
  query: 'How does the event bus work?',
  topK: 5,
  threshold: 0.78
});

// RAG pipeline
const context = await substrate.memory.rag({
  query: userMessage,
  sources: ['docs', 'changelog'],
  maxTokens: 2000
});
```

---

## Integration Points

| Module | Integration |
|--------|-------------|
| BRAIN | Cognitive memory backed by MEMORY vectors |
| DECODE | Intent embeddings for semantic command matching |
| DREAM | Dream insight embeddings for pattern recall |
| ENCODE | Code embedding for similar snippet retrieval |
| RELAY | Webhook payload embedding for anomaly detection |

---

## Related Resources

- [BRAIN Module](./13-BRAIN-MODULE.md) — Cognitive memory tiers
- [Memory Architecture](./64-MEMORY-ARCHITECTURE.md) — Hot/Warm/Cold tiering
- [Capabilities Depot](/capabilities) — All 400+ capabilities

---

*CMPSBL® MEMORY Module — v9.1.0 ARCHITECT Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
