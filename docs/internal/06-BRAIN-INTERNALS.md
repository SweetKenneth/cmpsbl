<div align="center">

# 🧠 BRAIN Module — Architecture Internals

### CONFIDENTIAL — Trade Secret

**v9.3.0 ARCHITECT Epoch**

</div>

---

## Memory Architecture

BRAIN implements a **four-tier memory hierarchy**, each tier with distinct persistence, retrieval, and decay characteristics.

### Tier Map

| Tier | Type | Persistence | Max Entries | Retrieval | Decay Rate |
|------|------|-------------|-------------|-----------|------------|
| T1 | **Episodic** | Session-scoped | 10,000 | O(1) hash | λ = 0.023/day |
| T2 | **Semantic** | Permanent | Unlimited | Vector similarity | λ = 0.0046/day |
| T3 | **Procedural** | Permanent | 5,000 | Pattern match | None (reinforced) |
| T4 | **Meta-cognitive** | Permanent | 1,000 | Graph traversal | λ = 0.001/day |

### Memory Record Schema (Internal)

```typescript
interface BrainRecord {
  id: string;                    // UUID v4
  content: string;               // Raw memory content
  memory_type: 'episodic' | 'semantic' | 'procedural' | 'meta';
  confidence: number;            // 0.0–1.0, see doc 04
  importance: number;            // 0.0–1.0, derived
  access_count: number;          // Retrieval counter
  last_accessed: string;         // ISO timestamp
  embedding_vector: number[];    // 1536-dim float32
  associations: string[];        // Related memory IDs
  source_module: string;         // Originating module
  tags: string[];                // Semantic tags
  decay_rate: number;            // Per-day decay constant
  created_at: string;
  updated_at: string;
}
```

---

## Normalization Pipeline

Every memory passes through a 5-stage normalization pipeline before storage:

```
Raw Input → Deduplicate → Normalize → Embed → Score → Store
```

### Stage Details

| Stage | Operation | Secret Algorithm |
|-------|-----------|-----------------|
| 1. **Deduplicate** | Cosine similarity check against existing memories. Threshold: **0.92** — above this, memories merge rather than create new entries. |
| 2. **Normalize** | Content standardization: lowercase, strip noise tokens, resolve pronouns against session context. |
| 3. **Embed** | Generate 1536-dimension embedding vector via NEXUS-routed model. Fallback: local TF-IDF if provider unavailable. |
| 4. **Score** | Compute initial confidence using the **Value Score Formula** (see doc 03). Initial confidence = `base_weight × source_reliability × content_novelty`. |
| 5. **Store** | Write to database with full metadata. Emit `memory.stored` event to RIPPLE bus. |

### Deduplication Merge Logic

When similarity ≥ 0.92:

```
merged_confidence = max(existing.confidence, new.confidence) + 0.05
merged_access_count = existing.access_count + 1
merged_content = new.content  // Newer content wins
merged_associations = union(existing.associations, new.associations)
```

---

## Retrieval Algorithm

BRAIN retrieval uses a **weighted multi-signal ranking**:

```
retrieval_score = (
    cosine_similarity × 0.40
  + recency_score    × 0.25
  + access_frequency × 0.15
  + importance       × 0.20
)
```

Where:
- `cosine_similarity` = dot product of query embedding vs. memory embedding
- `recency_score` = `1 / (1 + days_since_access)`
- `access_frequency` = `min(1.0, access_count / 50)`
- `importance` = pre-computed importance score

### Retrieval Limits

| Context | Max Results | Timeout |
|---------|-------------|---------|
| Direct query | 10 | 50ms |
| Context enrichment | 5 | 30ms |
| Dream synthesis | 25 | 200ms |
| Cross-module | 3 | 20ms |

---

## Association Graph

BRAIN maintains an internal **association graph** connecting related memories:

- **Edge weight** = co-occurrence frequency × relevance score
- **Max edges per node** = 20 (pruned by lowest weight)
- **Graph traversal depth** = 3 hops maximum for any single retrieval
- **Pruning schedule** = Every 1,000 new memories, prune edges with weight < 0.1

### Graph Topology Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Average degree | 4–8 | < 2 or > 15 |
| Clustering coefficient | 0.3–0.6 | < 0.1 |
| Largest component % | > 80% | < 50% |

---

## Reinforcement Mechanics

When a memory is successfully used (retrieved and led to a positive outcome):

```
new_confidence = min(1.0, current_confidence + boost × (1 - current_confidence))
```

Where `boost` values are:

| Outcome | Boost |
|---------|-------|
| Direct retrieval success | 0.05 |
| Used in successful task | 0.10 |
| Cross-referenced by DREAM | 0.03 |
| User explicitly confirmed | 0.15 |
| Contradicted by new data | -0.20 |

---

## Garbage Collection

Memories are subject to automated garbage collection:

| Condition | Action |
|-----------|--------|
| confidence < 0.05 | Delete |
| Not accessed in 90 days AND confidence < 0.2 | Archive |
| Contradicted 3+ times | Flag for review |
| Orphan (no associations, no access in 30 days) | Soft delete |

---

<div align="center">

*CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch — INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
