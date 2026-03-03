# Memory Architecture

**CMPSBL Substrate OS v10.9.0 — Cognitive Memory Core**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Module** | BRAIN (Memory Subsystem) |
| **Version** | v10.9.0 |
| **Status** | Production |
| **Last Updated** | February 2026 |

---

## Overview

The **Memory Architecture** defines how the substrate stores, organizes, retrieves, and consolidates information across its cognitive systems. Built on the unified **Memory Core** (v10.9.0), it implements a 15-feature cognitive upgrade delivering vector search, spaced repetition, contradiction detection, causal graphs, and full audit provenance.

---

## Core Principles

1. **Unified Lifecycle**: All memory operations route through a single authoritative module
2. **Tiered Storage**: Hot, warm, cold, and archive tiers with adaptive per-user capacity
3. **Knowledge Graph**: Typed causal edges connect related memories for associative retrieval
4. **Deterministic Retrieval**: Metacognitive self-assessment adjusts strategy automatically
5. **Non-Destructive Cascade**: Memories are never deleted — only demoted through tiers
6. **Per-User Isolation**: Every user+agent pair has independent memory partitions
7. **Audit Provenance**: Full lineage tracking on every memory operation

---

## 15-Feature Cognitive Upgrade (v10.9.0)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 1 | **Vector Embedding Search** | ✅ | HNSW-indexed semantic similarity across hot/warm tiers |
| 2 | **Spaced Repetition** | ✅ | SM-2 algorithm reinforces recalled memories |
| 3 | **Contextual Pre-fetch** | ✅ | Predicts needed memories, pre-loads into hot tier |
| 4 | **Cross-Agent Sharing** | ✅ | Agents share memories within same user scope |
| 5 | **Episodic Replay** | ✅ | Reconstruct full interaction timelines |
| 6 | **Contradiction Detection** | ✅ | Flags conflicting facts with resolution workflow |
| 7 | **Causal Graph** | ✅ | Cause→effect edges built from interaction patterns |
| 8 | **Confidence Decay Curves** | ✅ | Per-type decay (episodic=fast, procedural=slow) |
| 9 | **Dream Consolidation** | ✅ | DREAM merges warm memories into semantic knowledge |
| 10 | **Metacognitive Assessment** | ✅ | Self-adjusting retrieval strategy based on hit rates |
| 11 | **Workload-Aware Tiering** | ✅ | Hourly activity patterns drive tier boundaries |
| 12 | **Memory Compression** | ✅ | Verbose memories summarized on warm cascade |
| 13 | **User Fingerprinting** | ✅ | Persistent preference profiles from interaction patterns |
| 14 | **RAG Pipeline** | ✅ | Formal context injection with source attribution |
| 15 | **Audit Provenance** | ✅ | Full memory lineage: source, recalls, reinforcements |

---

## Memory Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                  MEMORY PIPELINE v10.9.0                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. INGEST                                                 │
│   ├── Source validation + fact extraction                   │
│   ├── Salience gate scoring                                │
│   ├── User fingerprint update (#13)                        │
│   └── Provenance chain initialization (#15)                │
│                                                             │
│   2. STORE                                                  │
│   ├── Adaptive tier assignment (hot/warm/cold)             │
│   ├── Vector embedding generation (#1)                     │
│   ├── Contradiction detection (#6)                         │
│   ├── Causal edge creation (#7)                            │
│   └── Decay curve assignment (#8)                          │
│                                                             │
│   3. INDEX                                                  │
│   ├── HNSW vector index update (#1)                        │
│   ├── Knowledge graph edge insertion (#7)                  │
│   ├── Tag + keyword indexing                               │
│   └── Spaced repetition scheduling (#2)                    │
│                                                             │
│   4. REFLECT                                                │
│   ├── Dream consolidation cycle (#9)                       │
│   ├── Memory compression (#12)                             │
│   ├── Metacognitive self-assessment (#10)                   │
│   ├── Workload-aware tier adjustment (#11)                 │
│   └── Confidence decay application (#8)                    │
│                                                             │
│   5. RETRIEVE                                               │
│   ├── Vector similarity search (#1)                        │
│   ├── Causal graph traversal (#7)                          │
│   ├── Spaced repetition boost (#2)                         │
│   ├── Contextual pre-fetch (#3)                            │
│   ├── Cross-agent recall (#4)                              │
│   ├── RAG context assembly (#14)                           │
│   └── Provenance update (#15)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Memory Types & Decay Curves (#8)

| Type | Decay Rate | Min Floor | Retention | Example |
|------|-----------|-----------|-----------|---------|
| **episodic** | 0.05/day (fast) | 0.05 | ~20 days | "User asked about pricing at 3pm" |
| **semantic** | 0.005/day (slow) | 0.10 | ~200 days | "React uses JSX syntax" |
| **procedural** | 0.002/day (very slow) | 0.15 | ~500 days | "To deploy, run npm build" |
| **user_fact** | 0.005/day (slow) | 0.10 | Indefinite | "User's name is Ken" |
| **preference** | 0.002/day (very slow) | 0.15 | Indefinite | "Prefers dark mode" |
| **reflection** | 0.01/day (medium) | 0.05 | ~90 days | "CLM identified slow cache" |

---

## Adaptive Tiered Storage

### Hot Tier
- **Capacity**: 200–2,000 per user (adaptive)
- **Scaling**: `base * ln(recalls) * recall_rate_multiplier`
- **Retrieval**: < 50ms
- **Features**: Vector index, SM-2 scheduling, contradiction detection

### Warm Tier
- **Capacity**: 2,000–20,000 per user (adaptive)
- **Retrieval**: < 200ms
- **Features**: Compression summaries, decay curves

### Cold Tier
- **Capacity**: 20,000–200,000 per user
- **Retrieval**: < 1,000ms

### Archive Tier
- **Capacity**: Unlimited
- **Purpose**: Non-destructive preservation — memories never deleted

---

## Causal Knowledge Graph (#7)

```typescript
interface CausalEdge {
  source_memory_id: string;
  target_memory_id: string;
  relationship_type: 'related' | 'causes' | 'contradicts' | 'extends' | 'similar';
  strength: number;       // 0.0–1.0
  causal_direction: string; // 'causes' | 'caused_by' | 'correlates'
  evidence_count: number;
  last_reinforced_at: string;
}
```

Edges are reinforced when traversed during recall, increasing `evidence_count` and `strength`.

---

## Spaced Repetition (#2)

Implements the SM-2 algorithm:

```
IF quality ≥ 3:
  interval = review_count == 0 ? 1 : review_count == 1 ? 6 : ceil(interval × ease)
  ease = max(1.3, ease + 0.1 - (5-q) × (0.08 + (5-q) × 0.02))
ELSE:
  reset to interval=1, review_count=0
```

Memories due for review are boosted 1.1× during recall, ensuring critical knowledge stays fresh.

---

## User Fingerprinting (#13)

```typescript
interface UserFingerprint {
  preferred_topics: string[];
  communication_style: 'formal' | 'casual' | 'neutral';
  complexity_preference: 'low' | 'medium' | 'high';
  interaction_count: number;
  avg_message_length: number;
  top_keywords: string[];
  personality_signals: Record<string, unknown>;
}
```

Built passively from every interaction — enables personalized recall strategies.

---

## RAG Pipeline (#14)

Every recall generates a tracked RAG context:

```typescript
interface RAGContext {
  query_text: string;
  recalled_memory_ids: string[];
  recalled_tiers: string[];
  context_string: string;
  total_tokens: number;
  was_useful: boolean;       // rated post-response
  response_quality: number;  // 0-1
}
```

---

## Audit Provenance (#15)

Every memory carries full lineage:

```typescript
interface MemoryProvenance {
  source: string;
  ingested_at: string;
  recall_count: number;
  last_recalled_at: string;
  reinforced_count: number;
  contradiction_checks: number;
  lineage: string[]; // chain of transformations
}
```

---

## API Reference

### Store with Salience Gate
```typescript
await client.store(content, {
  memory_type: 'user_fact',
  source: 'conversation'
});
// Automatically: extracts facts, scores salience, routes to tier,
// detects contradictions, updates fingerprint, builds provenance
```

### Multi-Tier Recall
```typescript
const result = await client.recall(query, 10);
// result.memories — ranked by relevance across all tiers
// result.confidence — 0-1 with user_fact boost
// result.tiers_searched — ['spaced_repetition', 'hot', 'warm', 'substrate_vector']
// result.rag_context_id — for quality feedback
```

### Episodic Replay (#5)
```typescript
const timeline = await client.replayEpisode({
  from: '2026-02-19T00:00:00Z',
  to: '2026-02-20T00:00:00Z'
});
```

### Cross-Agent Sharing (#4)
```typescript
const shared = await client.shareWithAgent('target-agent', memoryIds);
```

### Dream Consolidation (#9)
```typescript
const { merged, compressed } = await client.triggerConsolidation();
```

---

## Security

1. **Per-User Isolation**: All tiers partitioned by `user_id` + `agent_id`
2. **Access Logging**: Every retrieval logged for audit via provenance
3. **Encryption**: Sensitive memories encrypted at rest
4. **RLS Policies**: Database-level access control on all brain tables
5. **Fingerprint Privacy**: User profiles never exposed externally

---

## Related Documentation

- [13-BRAIN-MODULE.md](./13-BRAIN-MODULE.md) — BRAIN module overview
- [63-CLM.md](./63-CLM.md) — Constant Learning Mode
- [65-SPACED-REPETITION.md](./65-SPACED-REPETITION.md) — SM-2 scheduling

---

*CMPSBL OS Substrate v10.9.0 — ARCHITECT Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
