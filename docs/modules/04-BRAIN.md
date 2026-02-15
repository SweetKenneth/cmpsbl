<div align="center">

# 🧠 BRAIN Module — Deep Dive

**Layer:** Cognitive · **Boot Order:** 4 · **Dependencies:** CORE, RIPPLE

**v10.5.1 ARCHITECT Epoch**

</div>

---

## Purpose

BRAIN is the **four-tier memory system** of the substrate. It stores, retrieves, associates, and maintains knowledge across sessions, enabling the substrate to learn, recall, and build upon prior interactions.

BRAIN is what makes the substrate *remember*.

---

## Memory Tiers

| Tier | Type | Purpose | Persistence | Capacity |
|------|------|---------|-------------|----------|
| T1 | **Episodic** | Recent events, conversations | Session-scoped | 10,000 entries |
| T2 | **Semantic** | Facts, knowledge, concepts | Permanent | Unlimited |
| T3 | **Procedural** | How-to knowledge, skills | Permanent | 5,000 entries |
| T4 | **Meta-cognitive** | Knowledge about own knowledge | Permanent | 1,000 entries |

### How Tiers Interact

```
User Input → Episodic (T1) stores the interaction
                │
                ▼
           Semantic (T2) extracts and stores facts
                │
                ▼
           Procedural (T3) learns patterns from repeated actions
                │
                ▼
           Meta-cognitive (T4) tracks what BRAIN knows well vs. poorly
```

---

## Universal Brain Transfer Pipeline (v10.5.0+)

BRAIN now serves as the **central knowledge hub** for all 21 modules via the Universal Brain Transfer Pipeline. Knowledge discovered in any module is automatically routed to relevant consumers:

```
BRAIN Memories
      │
      ▼
┌──────────────────┐
│  Relevance Engine │  Score memories against module specializations
└────────┬─────────┘
         │
         ├──► DECODE — Conversation patterns, epistemic signals
         ├──► DEFENSE — Threat signatures, behavioral baselines
         ├──► MEMORY — Embedding refresh signals, staleness data
         ├──► ECONOMY — Cost patterns, budget heuristics
         ├──► RELAY — Delivery reliability data
         ├──► AUDIT — Compliance patterns
         ├──► IDENTITY — Actor behavior profiles
         ├──► SANDBOX — Execution safety heuristics
         └──► All 21 modules — Cross-module insights
```

### Transfer Mechanics

| Field | Description |
|-------|-------------|
| **Frequency** | Every 5 minutes (via CLM Engine) |
| **Selection** | Top 50 memories by relevance per cycle |
| **Routing** | Tag-based affinity matching per module |
| **Injection** | Hot tier (`brain_memory_hot`) for instant recall |
| **Feedback** | Relevance scores updated via EMA feedback loop |

---

## Memory Consolidation Engine (v10.5.0+)

Server-side autonomous consolidation runs every 5 minutes:

| Operation | Criteria | Action |
|-----------|----------|--------|
| **Promotion** | Warm → Hot | access_count > 10 within 24h |
| **Demotion** | Hot → Warm | No access in 48h |
| **Pruning** | Cold deletion | confidence < 0.1 AND age > 30 days |

---

## Core Operations

### Remember

Store a new memory:

```
brain.remember("The user prefers dark mode")
  → Deduplicate against existing memories
  → Normalize content
  → Generate embedding vector
  → Compute initial confidence score
  → Store with full metadata
  → Emit memory.stored event
```

### Recall

Retrieve relevant memories:

```
brain.recall("What are the user's preferences?")
  → Generate query embedding
  → Vector similarity search across memory tiers
  → Rank by weighted multi-signal score
  → Return top-k results with confidence scores
```

### Forget

Remove or decay a memory:

```
brain.forget("memory_id_123")
  → Mark memory as forgotten
  → Remove from active index
  → Retain in archive for audit trail
  → Update association graph
```

### Associate

Create links between related memories:

```
brain.associate("memory_A", "memory_B", strength: 0.8)
  → Create bidirectional edge in association graph
  → Weight = co-occurrence × relevance
  → Pruned if weight falls below 0.1
```

---

## Retrieval Ranking

When recalling memories, BRAIN ranks results using four signals:

| Signal | Weight | Description |
|--------|--------|-------------|
| **Semantic similarity** | 40% | Cosine distance between query and memory embeddings |
| **Recency** | 25% | How recently the memory was accessed |
| **Access frequency** | 15% | How often the memory has been retrieved |
| **Importance** | 20% | Pre-computed importance score |

---

## Confidence System

Every memory has a confidence score (0.0 to 1.0):

| Confidence | Meaning |
|-----------|---------|
| 0.8–1.0 | High confidence — used in responses without hedging |
| 0.5–0.79 | Medium confidence — used with qualifiers |
| 0.2–0.49 | Low confidence — mentioned only if directly asked |
| < 0.2 | Very low — candidate for garbage collection |

### Confidence Changes

| Event | Effect |
|-------|--------|
| Successfully used in a task | +0.05 to +0.15 |
| User confirms accuracy | +0.15 |
| Contradicted by new information | -0.20 |
| Not accessed in 30 days | Gradual decay |
| Relevance feedback (v10.5.0+) | EMA adjustment ±0.05 |

---

## Association Graph

BRAIN maintains a graph of related memories:

- Each memory = node
- Each relationship = weighted edge
- Maximum 20 edges per node
- Graph traversal limited to 3 hops
- Pruning runs every 1,000 new memories

### Use Cases for Associations

- **Context enrichment**: When recalling memory A, also surface closely associated memories
- **Contradiction detection**: Linked memories with conflicting content flagged for review
- **Dream synthesis**: DREAM uses association paths to discover non-obvious connections
- **Cross-module transfer**: Association paths inform Brain Transfer routing decisions

---

## Garbage Collection

Automatic cleanup of low-value memories:

| Condition | Action |
|-----------|--------|
| Confidence < 0.05 | Permanent delete |
| Not accessed in 90 days + confidence < 0.2 | Archive |
| Contradicted 3+ times | Flag for review |
| Orphaned (no associations, no access in 30 days) | Soft delete |
| Cold tier + confidence < 0.1 + age > 30 days (v10.5.0+) | Server-side pruning |

---

## Terminal Commands

| Command | Description |
|---------|-------------|
| `brain.status` | Memory system status |
| `brain.remember` | Store a memory |
| `brain.recall` | Retrieve memories by query |
| `brain.forget` | Remove a memory |
| `brain.associate` | Link two memories |
| `brain.stats` | Memory statistics (counts by tier, avg confidence) |
| `brain.search` | Full-text search across all tiers |
| `brain.transfer` | Trigger knowledge transfer to target modules (v10.5.0+) |
| `brain.consolidate` | Trigger memory consolidation cycle (v10.5.0+) |

---

## Events Emitted

| Event | When |
|-------|------|
| `memory.stored` | New memory created |
| `memory.recalled` | Memory retrieved |
| `memory.forgotten` | Memory removed |
| `memory.decayed` | Memory confidence decreased |
| `memory.reinforced` | Memory confidence increased |
| `memory.contradiction` | Conflicting memory detected |
| `memory.promoted` | Memory moved hot ← warm (v10.5.0+) |
| `memory.demoted` | Memory moved warm ← hot (v10.5.0+) |
| `memory.transferred` | Memory injected into target module (v10.5.0+) |

---

## Performance

| Metric | Value |
|--------|-------|
| Boot time | ~5ms |
| Store latency | < 20ms |
| Recall latency | < 50ms |
| Association lookup | < 10ms |
| Embedding generation | < 100ms (via NEXUS) |
| Transfer cycle | < 6s (server-side) |
| Consolidation cycle | < 3s (server-side) |

---

## Integration Points

| Module | Integration |
|--------|-------------|
| **DECODE** | Provides context for intent parsing; receives conversation patterns via transfer |
| **DREAM** | Source material for autonomous synthesis |
| **VISION** | Memory usage metrics and trends |
| **CORTEX** | Cross-module context assembly |
| **DEFENSE** | Memory poisoning detection; receives threat signatures via transfer |
| **MEMORY** | Embedding storage and RAG recall; receives staleness signals via transfer |
| **ECONOMY** | Receives cost pattern heuristics via transfer |
| **CLM Engine** | 24/7 server-side orchestration of transfer and consolidation |

---

<div align="center">

*CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
