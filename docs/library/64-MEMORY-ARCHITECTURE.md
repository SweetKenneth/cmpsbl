# Memory Architecture

**CMPSBL Substrate OS v8.5.0 — Cognitive Memory Core (SYNERGY+ Epoch)**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Module** | BRAIN (Memory Subsystem) |
| **Version** | v8.5.0 |
| **Status** | Production |
| **Last Updated** | February 2026 |

---

## Overview

The **Memory Architecture** defines how the substrate stores, organizes, retrieves, and consolidates information across its cognitive systems. Built on the unified **Memory Core** (v8.5.0), it implements a formal 5-stage pipeline that eliminates redundant pathways and ensures deterministic cognition.

### SDK Integration (v8.5.0)

The memory system is exposed through two public SDK interfaces for third-party integration:

#### `withPersistentMemory` — Agent Wrapper

```typescript
import { withPersistentMemory } from '@cmpsbl/memory';

const agent = withPersistentMemory({
  agentId: 'my-support-agent',
  scope: 'project' // or 'session'
});

const response = await agent.respond('How do I reset my password?');
await agent.remember('User prefers dark mode');
await agent.logWorkload('Resolved 3 tickets in this session');
```

**Capabilities:**
- Automatic fact extraction on `store()`
- Context-aware `recall()` with confidence scoring
- Workload logging for agent outcome tracking
- Manual `remember()` for explicit knowledge capture

#### `usePersistentAgent` — React Hook

```tsx
import { usePersistentAgent } from '@cmpsbl/memory';

function ChatComponent() {
  const { respond, remember, logWorkload, isLoading } = usePersistentAgent('my-agent');
  
  const handleSend = async (message: string) => {
    const context = await respond(message);
    // context.memories, context.confidence, context.contextString
  };
}
```

**Hook Features:**
- Automatic `MemoryClient` lifecycle management
- Graceful error handling (memory is enhancement, not requirement)
- Loading state tracking
- No provider setup required

---

## Core Principles

1. **Unified Lifecycle**: All memory operations route through a single authoritative module
2. **Tiered Storage**: Hot, warm, and cold tiers based on access patterns and importance
3. **Knowledge Graph**: Edges connect related memories for associative retrieval
4. **Deterministic Retrieval**: Consistent, reproducible memory access patterns
5. **Decay & Pruning**: Natural forgetting prevents unbounded growth

---

## 5-Stage Memory Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    MEMORY PIPELINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. INGEST                                                 │
│   ├── Source validation                                     │
│   ├── Type classification                                   │
│   └── Metadata extraction                                   │
│                                                             │
│   2. STORE                                                  │
│   ├── Tier assignment (hot/warm/cold)                      │
│   ├── Vector embedding generation                          │
│   └── Persistence to brain_memories table                  │
│                                                             │
│   3. INDEX                                                  │
│   ├── Knowledge graph edge creation                        │
│   ├── Similarity clustering                                │
│   └── Tag indexing                                         │
│                                                             │
│   4. REFLECT                                                │
│   ├── Pattern synthesis                                     │
│   ├── Cross-memory correlation                             │
│   └── Insight generation                                   │
│                                                             │
│   5. RETRIEVE                                               │
│   ├── Vector similarity search                             │
│   ├── Graph traversal                                      │
│   └── Access frequency update                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Memory Types

| Type | Description | Retention | Example |
|------|-------------|-----------|---------|
| **episodic** | Event-based memories with temporal context | 30 days | "User asked about API pricing at 3pm" |
| **semantic** | Factual knowledge without specific timing | Indefinite | "React uses JSX syntax" |
| **procedural** | How-to patterns and workflows | Indefinite | "To deploy, run npm build then upload" |
| **reflection** | Self-analysis and insights | 90 days | "CLM identified slow cache hits" |
| **dream** | Synthesized patterns from Dream cycles | 60 days | "Users prefer dark mode 73% of time" |

---

## Tiered Storage

### Hot Tier
- **Criteria**: Accessed within 24 hours OR importance > 0.8
- **Storage**: In-memory cache + primary database
- **Retrieval**: < 50ms
- **Capacity**: ~1,000 memories

### Warm Tier
- **Criteria**: Accessed within 7 days OR importance > 0.5
- **Storage**: Primary database with vector index
- **Retrieval**: < 200ms
- **Capacity**: ~10,000 memories

### Cold Tier
- **Criteria**: Accessed > 7 days ago AND importance < 0.5
- **Storage**: Archive database
- **Retrieval**: < 1,000ms
- **Capacity**: Unlimited (with pruning)

---

## Knowledge Graph

The `brain_knowledge_edges` table connects related memories:

```typescript
interface KnowledgeEdge {
  source_memory_id: string;
  target_memory_id: string;
  relationship_type: 'related' | 'causes' | 'contradicts' | 'extends' | 'similar';
  strength: number;  // 0.0 - 1.0
  created_at: string;
}
```

### Edge Creation Rules

1. **Semantic Similarity**: Edges created when vector similarity > 0.85
2. **Temporal Proximity**: Memories ingested within 5 minutes get weak edges
3. **Explicit References**: Content mentioning related concepts
4. **Reflection Links**: CLM insights connect to source memories

---

## Memory Value Calculation

The `calculate_memory_value` function determines memory importance:

```sql
v_value := (importance_score * 0.4) 
         + (recency_factor * 0.35) 
         + (access_factor * 0.25);
```

Where:
- **importance_score**: Initial importance (0-1)
- **recency_factor**: Exponential decay based on age
- **access_factor**: Logarithmic boost for frequent access

---

## API Reference

### Ingest

```typescript
await memoryCore.ingest(content, {
  type: 'semantic',
  source: 'user_conversation',
  importance: 0.7,
  tags: ['api', 'pricing'],
  metadata: { userId: '...' },
});
```

### Retrieve

```typescript
const memories = await memoryCore.retrieve(query, {
  limit: 10,
  minSimilarity: 0.7,
  types: ['semantic', 'episodic'],
  tier: 'hot',
});
```

### Reflect

```typescript
const insights = await memoryCore.reflect({
  windowDays: 7,
  minPatternStrength: 0.6,
});
```

---

## React Hooks

```typescript
import { useMemoryCycle, useMemoryState } from '@/lib/substrate/memory-core';

function MemoryDashboard() {
  const { ingest, retrieve, isProcessing } = useMemoryCycle();
  const { stats, tierBreakdown } = useMemoryState();

  return (
    <div>
      <p>Total memories: {stats.total}</p>
      <p>Hot tier: {tierBreakdown.hot}</p>
    </div>
  );
}
```

---

## Consolidation & Pruning

### Nightly Consolidation
- Similar memories merged into synthesized versions
- Weak edges below 0.3 strength removed
- Redundant episodic memories collapsed

### Monthly Pruning
- Cold tier memories with value < 0.1 archived
- Orphan edges (no valid targets) deleted
- Storage metrics reported to VISION

---

## Security

1. **Source Validation**: All inputs sanitized before storage
2. **Access Logging**: Every retrieval logged for audit
3. **Encryption**: Sensitive memories encrypted at rest
4. **RLS Policies**: Database-level access control

---

## Related Documentation

- [13-BRAIN-MODULE.md](./13-BRAIN-MODULE.md) — BRAIN module overview
- [63-CLM.md](./63-CLM.md) — Constant Learning Mode
- [65-SPACED-REPETITION.md](./65-SPACED-REPETITION.md) — SM-2 scheduling
- [85-LNCHBL-DISTRIBUTION.md](./85-LNCHBL-DISTRIBUTION.md) — LNCHBL tier map

---

*CMPSBL OS Substrate v8.5.0 — SYNERGY+ Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
