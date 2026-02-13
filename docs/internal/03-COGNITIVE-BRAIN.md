# 03. Cognitive Brain Module

**CMPSBL OS Substrate — Internal Engineering Library**

---

## The Memory Secret

The BRAIN module doesn't just store memories—it **values them**. Every memory has a score that determines whether it lives in fast "hot" storage or slow "cold" archive. **No memory is ever truly lost**—they cascade through tiers based on access patterns.

---

## 3-Tier Memory Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      HOT MEMORY (500 max)                    │
│  Fast access • High value (≥0.6) • Frequently recalled       │
│  Storage: brain_memory_hot table                             │
│  Protected types: core_identity, principles, safety_laws     │
└─────────────────────────────────────────────────────────────┘
                           │
                    [value drops below 0.6]
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    WARM MEMORY (2,000 max)                   │
│  Standard access • Medium value (0.35-0.6) • Occasional      │
│  Storage: brain_memory_warm table                            │
│  Promotes back to hot if value rises above 0.75              │
└─────────────────────────────────────────────────────────────┘
                           │
                    [value drops below 0.35]
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    COLD MEMORY (10,000 max)                  │
│  Archived • Low value (<0.35) • Rarely accessed              │
│  Storage: brain_memory_cold table                            │
│  Pruned when value drops below 0.05                          │
└─────────────────────────────────────────────────────────────┘
```

**Persistent Memory Guarantee**: Apps and substrate components can recall ANY memory regardless of tier. The recall engine searches hot→warm→cold automatically, with hot being fastest.

---

## The Value Score Formula

**This is the core algorithm that makes the brain "smart":**

```
value = (recency × 0.4) + (frequency × 0.35) + (confidence × 0.25)

Where:
- recency: How recently was this memory accessed?
  Formula: 1 - (days_since_access / 365)
  Range: 0 (year old) to 1 (today)

- frequency: How often is this memory recalled?
  Formula: min(1, access_count / 100)
  Range: 0 (never) to 1 (100+ times)

- confidence: How reliable is this memory?
  Range: 0 (uncertain) to 1 (verified fact)
```

### Example Calculations

| Memory | Recency | Frequency | Confidence | **Value** |
|--------|---------|-----------|------------|-----------|
| "API key format is pf_live_xxx" | 0.9 | 0.8 | 1.0 | **0.89** |
| "User prefers dark mode" | 0.5 | 0.3 | 0.7 | **0.48** |
| "Old bug workaround" | 0.1 | 0.05 | 0.6 | **0.21** |

---

## Memory Types

| Type | Purpose | Retention |
|------|---------|-----------|
| `core_identity` | Who is Cascade | Permanent (never archived) |
| `system_awareness` | What systems exist | Permanent |
| `principles` | Foundational rules | Permanent |
| `safety_laws` | Hard constraints | Permanent |
| `fact` | Learned information | Value-based |
| `doctrine_integrated` | Extracted insights | Value-based |
| `episodic` | Specific events | Value-based |
| `procedural` | How to do things | Value-based |

---

## The 5 Cognitive Engines

The BRAIN has specialized sub-engines:

### 1. Storage Engine
- Handles all memory writes
- Calculates initial value score
- Determines hot/warm/cold placement
- Deduplicates similar memories

### 2. Recall Engine
- Semantic search across all tiers
- Boosts value on access (learning)
- Returns memories with context
- Handles "I don't know" gracefully

### 3. Consolidation Engine
- Runs during idle periods
- Merges similar memories
- Promotes high-value cold → warm → hot
- Demotes low-value hot → warm → cold

### 4. Curiosity Engine
- Identifies knowledge gaps
- Generates exploration queries
- Tracks what hasn't been explored
- Feeds DREAM module

### 5. Cross-Domain Engine
- Finds connections between domains
- Generates novel insights
- Creates "aha moment" memories
- Highest confidence for discoveries

---

## Memory Operations

### Storing a Memory

```
brain.store "GPU scheduling increases throughput"

Internal Flow:
1. Parse content, detect type (fact)
2. Calculate initial confidence (0.8)
3. Check for duplicates (semantic similarity)
4. If duplicate: boost existing memory's frequency
5. If new: insert with value = 0.5 (neutral start)
6. Place in HOT tier (all new memories start hot)
7. Publish brain.memory.stored event
```

### Recalling Memories

```
brain.recall "performance optimizations"

Internal Flow:
1. Embed query into vector space
2. Search HOT tier first (fastest)
3. If insufficient: search WARM tier
4. If still insufficient: search COLD tier
5. Rank by relevance × value
6. Boost accessed memories' recency score
7. Return top N with confidence scores
```

---

## Consolidation Schedule

```
Every 4 hours:
1. Calculate value scores for all HOT memories
2. Demote HOT → WARM if value < 0.3
3. Promote WARM → HOT if value > 0.7

Every 24 hours:
1. Calculate value scores for all WARM memories
2. Demote WARM → COLD if value < 0.1
3. Merge semantically similar memories (keep highest confidence)

Every 7 days:
1. Prune COLD memories with value < 0.01
2. Generate consolidation report
3. Update memory statistics
```

---

## Constant Learning Mode (CLM) v6.7.0

**CLM is the substrate's always-on learning capability.**

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Budget-Governed** | 70% of daily Nexus allocation dedicated to learning |
| **Spaced Repetition** | SM-2 algorithm for memory consolidation |
| **Kill Switch** | Emergency halt for runaway learning |
| **Quiet Hours** | Respects operator-defined rest periods |

### Budget Governor

The Budget Governor ensures CLM never starves production workloads:

```
Daily Budget = DAILY_NEXUS_LIMIT × 0.70

Enforcement:
- Budget resets at midnight
- Micro-learning mode activates below 5% remaining
- Kill switch halts all learning immediately
- Consecutive failures trigger auto-pause
```

### Topic Selection Algorithm

```
Roll random 0.0–1.0:

0.00–0.50 → Core Curriculum (highest priority foundational topics)
0.50–0.75 → Gap Detection (topics from recent failures)
0.75–0.90 → Spaced Repetition (due for review)
0.90–1.00 → Deep Dive (exploratory, only if budget > 20%)
```

### Spaced Repetition (SM-2)

```
After each review:
  new_ease = ease + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
  new_ease = max(1.3, new_ease)

Interval calculation:
  if quality < 3: reset to 1 day (failed recall)
  else: new_interval = previous_interval × ease

Max interval: 180 days
```

---

## Infrastructure Integration

### Federated Memory Sync
- **Location:** `src/lib/substrate/federated-memory/`
- **Purpose:** Cross-instance memory sharing with privacy controls and conflict resolution
- **Strategies:** latest-wins, highest-confidence, merge
- **Tier:** Pro

### Memory Deduplication
- **Location:** `src/lib/substrate/memory-dedup/`
- **Purpose:** Content-hash based deduplication to prevent memory bloat
- **Tier:** Builder

### Memory GC & Scheduler
- **Location:** `src/lib/substrate/memory-gc/`
- **Purpose:** Automated garbage collection on 6-hour autonomous cycles
- **Tier:** Builder

### Semantic Search (TF-IDF/n-gram)
- **Location:** `src/lib/substrate/semantic-search/`
- **Purpose:** Client-side semantic search for memory recall without external API calls
- **Tier:** FREE

---

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch — Internal Engineering Library*
*© 2025-2026 PromptFluid®. All rights reserved.*
