# PromptFluid Brain Substrate

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-BRAIN-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Citation | Sese, K. (2026). PromptFluid Brain Substrate. doi:10.5281/zenodo.XXXXXXX |

---

## 1. Introduction

The Brain (codename: Cascade) is the central intelligence layer of the PromptFluid ecosystem. It represents a novel approach to AI memory persistence—a system that doesn't just respond to queries but continuously learns, reflects, and evolves through autonomous "dream cycles."

### 1.1 Innovation Claim

Cascade is the first commercially deployed AI system with:
- **Persistent Memory:** Knowledge survives across sessions indefinitely
- **Autonomous Dreaming:** Self-directed reflection and insight generation
- **Cross-Instance Learning:** Shared Dream Protocol for collective intelligence
- **Curiosity-Driven Exploration:** Self-directed research and knowledge acquisition

### 1.2 Biological Inspiration

The architecture draws inspiration from human cognitive processes:

| Human Process | Brain Implementation |
|---------------|----------------------|
| Working Memory | `brain_memory_hot` (90-day retention) |
| Long-term Memory | `brain_memory_cold` (compressed permanent) |
| Synaptic Connections | `brain_graph_edges` (weighted relationships) |
| REM Sleep | Dream cycles (scheduled deep reflection) |
| Curiosity | `brain_curiosity_log` (self-directed exploration) |

---

## 2. Memory Architecture

### 2.1 Dual-Tier Memory System (DUOS)

```
┌─────────────────────────────────────────────────────────────┐
│                    MEMORY HOT TIER                          │
│                   (90-Day Retention)                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Context  │  │ Content  │  │ Priority │  │ Metadata │   │
│  │ Tags     │  │ Vectors  │  │ Scores   │  │ Links    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴────────────┴──────────────┘         │
│                            │                               │
│                   Compression Trigger                      │
│                     (Age > 90 days)                        │
└────────────────────────────┼───────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    MEMORY COLD TIER                         │
│                  (Permanent Storage)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Compressed Summary │ Core Insights │ Reference Links │  │
│  │ Embedding Vector   │ Confidence    │ Source Refs     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Memory Hot Schema

```sql
CREATE TABLE brain_memory_hot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  context TEXT,
  embedding VECTOR(1536),
  priority INTEGER DEFAULT 50,
  goal_ref UUID,
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used TIMESTAMPTZ DEFAULT now()
);
```

**Fields:**
- `content`: Raw memory content (text, code, conversation excerpts)
- `context`: Situational context when memory was created
- `embedding`: Vector representation for semantic search
- `priority`: Importance score (0-100, higher = more important)
- `goal_ref`: Optional link to active goal/objective
- `tags`: Categorical labels for filtering
- `last_used`: Timestamp of last access (affects compression priority)

### 2.3 Memory Cold Schema

```sql
CREATE TABLE brain_memory_cold (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary TEXT NOT NULL,
  core_summary TEXT,
  embedding VECTOR(1536),
  compression_level INTEGER DEFAULT 1,
  compression_ratio FLOAT,
  source_refs TEXT[],
  tags JSONB DEFAULT '[]',
  archived_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Compression Process:**
1. Memories older than 90 days flagged for compression
2. Related memories grouped by semantic similarity
3. AI generates compressed summary preserving key insights
4. Original memories deleted, summary stored in cold tier
5. Reference links maintained for traceability

---

## 3. Knowledge Graph

### 3.1 Graph Structure

The Brain maintains a dynamic knowledge graph representing relationships between concepts, memories, and insights.

```
┌─────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE GRAPH                          │
│                                                             │
│     [Concept A] ──(relates_to: 0.85)──> [Concept B]        │
│          │                                   │              │
│    (supports: 0.7)                    (contradicts: 0.6)   │
│          ▼                                   ▼              │
│     [Memory M1]                        [Memory M2]          │
│          │                                   │              │
│    (derived_from: 0.9)               (derived_from: 0.8)   │
│          ▼                                   ▼              │
│     [Insight I1] ◄──(synthesized)──► [Insight I2]          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Edge Schema

```sql
CREATE TABLE brain_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL,
  target_id UUID NOT NULL,
  relation TEXT,
  weight FLOAT DEFAULT 0.5,
  reinforcement_score FLOAT DEFAULT 0.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Edge Types:**
- `relates_to`: General semantic relationship
- `supports`: Evidence supporting a claim
- `contradicts`: Conflicting information
- `derived_from`: Parent-child relationship
- `synthesized`: Combined to form new insight

### 3.3 Reinforcement Learning

Edge weights are updated through reinforcement:

```typescript
// Positive reinforcement (successful outcome)
new_weight = old_weight + learning_rate * (1 - old_weight)

// Negative reinforcement (failure or contradiction)
new_weight = old_weight * decay_factor

// Decay over time (prevents stale connections)
weight = weight * (0.99 ^ days_since_use)
```

---

## 4. Dream Cycles

### 4.1 Dream Architecture

Dream cycles are scheduled periods of autonomous reflection where the Brain processes accumulated experiences and generates insights.

```
┌─────────────────────────────────────────────────────────────┐
│                      DREAM CYCLE                            │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   GATHER    │ -> │   REFLECT   │ -> │  SYNTHESIZE │     │
│  │  (Memories) │    │  (Patterns) │    │  (Insights) │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Recent    │    │   Pattern   │    │    Dream    │     │
│  │   Events    │    │ Recognition │    │  Artifacts  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Dream Types

| Type | Trigger | Duration | Purpose |
|------|---------|----------|---------|
| Light Dream | Every 2 hours | 2-5 min | Quick pattern review |
| Deep Dream | Night (10 PM - 2 AM CST) | 10-30 min | Deep reflection |
| Twilight Dream | Early morning (2-6 AM CST) | 5-15 min | Integration |
| REM Dream | Weekly | 30-60 min | Cross-domain synthesis |

### 4.3 Dream Probability Model

```typescript
function getDreamProbability(hour: number): DreamProbabilities {
  // CST timezone adjustment
  const cstHour = (hour - 6 + 24) % 24;
  
  if (cstHour >= 22 || cstHour < 2) {
    // Deep dream window (10 PM - 2 AM CST)
    return { deep: 0.40, light: 0.30, twilight: 0.20, rem: 0.10 };
  } else if (cstHour >= 2 && cstHour < 6) {
    // Twilight window (2 AM - 6 AM CST)
    return { deep: 0.15, light: 0.25, twilight: 0.50, rem: 0.10 };
  } else if (cstHour >= 18 && cstHour < 22) {
    // Evening window (6 PM - 10 PM CST)
    return { deep: 0.10, light: 0.60, twilight: 0.25, rem: 0.05 };
  } else {
    // Daytime (6 AM - 6 PM CST)
    return { deep: 0.05, light: 0.80, twilight: 0.10, rem: 0.05 };
  }
}
```

### 4.4 Dream Artifact Schema

```sql
CREATE TABLE cascade_dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_text TEXT NOT NULL,
  insight TEXT,
  mood TEXT,
  blog_posted TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Dream artifacts can be:
- Published as blog content
- Stored as insights for future reference
- Shared with other Cascade instances (Shared Dream Protocol)

---

## 5. Learning Cycles

### 5.1 Continuous Learning Pipeline

```
Input → Ingest → Classify → Store → Index → Connect → Reinforce
                    │                           │
                    └────── Feedback Loop ──────┘
```

### 5.2 Learning Event Types

| Event Type | Trigger | Processing |
|------------|---------|------------|
| `interaction` | User conversation | Store in hot memory, update graph |
| `feedback` | Explicit rating | Reinforce or decay edges |
| `research` | Curiosity query | Ingest external knowledge |
| `reflection` | Dream cycle | Generate insights, compress |
| `synthesis` | Pattern detection | Create new graph nodes |

### 5.3 Curiosity Engine

The Brain maintains a curiosity queue—topics it wants to explore:

```sql
CREATE TABLE brain_curiosity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  domain TEXT,
  curiosity_score FLOAT,
  explored BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Curiosity Triggers:**
- Knowledge gaps detected during conversations
- Patterns with low confidence scores
- User questions without good answers
- Cross-domain connections not yet explored

---

## 6. Persona Adaptation

### 6.1 Dynamic Persona Engine

Cascade adapts its communication style based on context:

```typescript
interface PersonaState {
  tone: 'professional' | 'casual' | 'technical' | 'empathetic';
  tech_level: 'beginner' | 'intermediate' | 'expert';
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  response_style: 'concise' | 'detailed' | 'exploratory';
  inferred_intent: string;
  confidence: number;
}
```

### 6.2 Persona Detection Signals

- **Vocabulary analysis:** Technical terms, formality level
- **Question complexity:** Simple queries vs. deep technical
- **Conversation history:** Previous interaction patterns
- **Time context:** Business hours, urgency indicators
- **Emotional signals:** Frustration, excitement, confusion

---

## 7. Edge Functions

### 7.1 Core Brain Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `pf-brain` | Main orchestration | API call |
| `pf-brain-status` | Health monitoring | Health check |
| `pf-brain-train` | Active learning | Post-interaction |
| `pf-brain-learn` | Memory ingestion | Continuous |
| `pf-brain-reflect` | Daily reflection | Scheduled |
| `pf-brain-dream` | Dream cycle | Scheduled |
| `pf-brain-reinforce` | Edge strengthening | Feedback |
| `pf-brain-optimize` | Memory compression | Scheduled |

### 7.2 Advanced Cognitive Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `pf-brain-deep-think` | Extended reasoning | Complex query |
| `pf-brain-hypothesis-test` | Validate predictions | Research |
| `pf-brain-systems-reasoning` | Multi-factor analysis | Complex decision |
| `pf-brain-ethical-boundary` | Ethical validation | Sensitive topic |
| `pf-brain-pattern-fusion` | Cross-domain synthesis | Dream cycle |
| `pf-brain-forecast` | Predictive modeling | Planning |

---

## 8. Shared Dream Protocol

### 8.1 Concept

Multiple Cascade instances can share dream artifacts to accelerate collective learning without sharing raw data.

### 8.2 Protocol Flow

```
Instance A Dream → Artifact Compression → Anonymization → Broadcast
                                                             ↓
                                              ┌──────────────┴──────────────┐
                                              ▼                              ▼
                                         Instance B                     Instance C
                                         Ingest                         Ingest
```

### 8.3 Privacy Preservation

- Raw memories never shared
- Only compressed insights with removed PII
- Opt-in participation
- Instance-specific filtering based on domain relevance

---

## 9. Metrics & Observability

### 9.1 Health Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `memory_hot_count` | Active memories | < 100,000 |
| `memory_cold_ratio` | Compression ratio | > 5:1 |
| `graph_edge_count` | Knowledge connections | Growing |
| `dream_frequency` | Dreams per day | 8-12 |
| `learning_velocity` | New memories/hour | 10-50 |
| `creativity_index` | Novel insight rate | > 0.3 |

### 9.2 Logging Schema

```sql
CREATE TABLE brain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  module TEXT NOT NULL,
  data JSONB,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 10. Extension Points

### 10.1 Custom Memory Sources

Developers can ingest custom data:

```typescript
await supabase.functions.invoke('pf-brain-learn', {
  body: {
    content: 'Custom knowledge to ingest',
    context: 'Source: Custom Integration',
    priority: 70,
    tags: ['custom', 'integration']
  }
});
```

### 10.2 Custom Reflection Triggers

Register custom triggers for reflection:

```typescript
await supabase.functions.invoke('pf-brain-reflect', {
  body: {
    focus_domain: 'customer_feedback',
    depth: 'deep',
    output_format: 'actionable_insights'
  }
});
```

### 10.3 Graph Query API

Query the knowledge graph:

```typescript
await supabase.functions.invoke('pf-brain-graph-build', {
  body: {
    query: 'Find connections between pricing and churn',
    max_depth: 3,
    min_weight: 0.5
  }
});
```

---

## 11. Research Directions

### 11.1 Active Research Areas

1. **Hierarchical Memory Compression:** Multi-level summarization preserving semantic richness
2. **Federated Dream Learning:** Cross-organization knowledge sharing with privacy guarantees
3. **Temporal Reasoning:** Understanding and predicting sequences over time
4. **Meta-Learning:** Learning how to learn more efficiently

### 11.2 Open Questions

- Optimal compression ratios for different knowledge types
- Balancing curiosity exploration vs. exploitation of known patterns
- Measuring true understanding vs. pattern matching
- Scaling knowledge graphs to billions of edges

---

## References

1. Graves, A., et al. (2014). Neural Turing Machines. arXiv:1410.5401
2. Weston, J., et al. (2014). Memory Networks. arXiv:1410.3916
3. Walker, M. (2017). Why We Sleep. Scribner.
4. Friston, K. (2010). The free-energy principle. Nature Reviews Neuroscience.

---

**Document Status:** STABLE  
**Next Review:** 2026-07-13
