# 10: Brain Deep Dive — The Memory & Learning Engine

**Everything You Need to Know About How the AI Remembers and Learns**

---

## What Is the Brain?

The Brain is where all the "thinking" happens. It's responsible for:

1. **Storing memories** — Saving information for later
2. **Retrieving memories** — Finding relevant information when needed
3. **Learning** — Getting smarter from new information
4. **Connecting ideas** — Building a web of related knowledge
5. **Dreaming** — Processing and consolidating overnight

Think of it like a human brain, but for AI. Without it, every conversation would start from zero—like talking to someone with amnesia.

---

## The Two-Tier Memory System

### Hot Memory (Fast Access)

**What it is:** Recent, frequently-used memories stored for quick retrieval.

**Plain English:** This is like your working memory—things you're actively thinking about or used recently.

| Property | Description |
|----------|-------------|
| **Speed** | Very fast (< 100ms) |
| **Size** | Limited (last 30 days typically) |
| **Storage** | In-memory with vector embeddings |
| **Best for** | Recent conversations, active projects |

### Cold Memory (Archive)

**What it is:** Older memories moved to long-term storage.

**Plain English:** This is like your long-term memory—things you learned years ago but can still recall.

| Property | Description |
|----------|-------------|
| **Speed** | Slower (200-500ms) |
| **Size** | Unlimited |
| **Storage** | Database with compression |
| **Best for** | Historical data, reference material |

### How Memories Move Between Tiers

```
New Information
      │
      ▼
┌─────────────┐
│ HOT MEMORY  │ ← New memories land here
└──────┬──────┘
       │
       │ After 30 days (or if confidence < 0.3)
       ▼
┌─────────────┐
│ COLD MEMORY │ ← Archived for long-term
└─────────────┘
```

---

## The Confidence System

Every memory has a **confidence score** from 0.0 to 1.0:

| Score | Meaning | What Happens |
|-------|---------|--------------|
| 0.9-1.0 | **Very confident** | Treated as reliable fact |
| 0.7-0.9 | **Confident** | Trusted but can be updated |
| 0.5-0.7 | **Moderate** | May need verification |
| 0.3-0.5 | **Low** | Marked as uncertain |
| 0.0-0.3 | **Very low** | Candidate for archival/deletion |

### What Changes Confidence?

**Increases confidence:**
- Memory is reinforced (used successfully)
- Multiple sources confirm the same information
- Human explicitly confirms accuracy

**Decreases confidence:**
- Memory hasn't been accessed in a long time
- Conflicting information is received
- Human marks as incorrect

---

## Brain Actions Explained

### `brain.recall` — Search Your Memory

**What it does:** Finds relevant memories based on your query.

**Example:**
```
You: What do you know about user onboarding?

Brain: Found 12 relevant memories:
1. [0.92] User onboarding flow was redesigned in December 2025
2. [0.88] 67% of users complete onboarding within 3 minutes
3. [0.85] Mobile onboarding has 12% lower completion rate
...
```

**How it works:**
1. Your query is converted to a "vector embedding" (a mathematical representation of meaning)
2. Brain searches for memories with similar embeddings
3. Results are ranked by relevance and confidence
4. Top matches are returned

### `brain.store` / `brain.remember` — Save New Memory

**What it does:** Saves new information to memory.

**Example:**
```
You: Remember that our Q1 target is $500k ARR

Brain: ✓ Stored memory
       Type: business_goal
       Confidence: 0.95
       Tags: [Q1, revenue, ARR, target]
```

**What gets saved:**
- The content itself
- When it was saved
- Where it came from
- Related tags and metadata
- Initial confidence score

### `brain.learn` — Ingest Knowledge

**What it does:** Processes larger amounts of information and extracts learnings.

**Example:**
```
You: Learn from this document about AI trends

Brain: Processing document...
       ├── Extracted 47 key concepts
       ├── Created 23 new memories
       ├── Connected to 156 existing memories
       ├── Updated confidence on 12 memories
       └── Learning complete
```

**Difference from store:**
- `store` saves one specific memory
- `learn` processes content, extracts insights, and creates multiple connected memories

### `brain.reflect` — Daily Reflection

**What it does:** Reviews recent memories to find patterns and insights.

**Example:**
```
Brain: Running daily reflection...
       
       PATTERNS IDENTIFIED:
       1. Support tickets mentioning "slow loading" increased 40%
       2. User engagement peaks between 2-4pm EST
       3. API errors correlate with high traffic periods
       
       INSIGHTS GENERATED:
       1. Performance optimization should be prioritized
       2. Consider caching for peak hours
       
       ├── Created 3 new insight memories
       └── Reflection complete
```

**When it runs:**
- Automatically every 24 hours (configurable)
- Can be triggered manually

### `brain.synthesize` — Generate New Insights

**What it does:** Combines multiple memories to generate new understanding.

**Example:**
```
You: Synthesize what you know about customer churn

Brain: Analyzing 234 related memories...
       
       SYNTHESIS:
       Customer churn correlates with three factors:
       1. Support response time > 24 hours (2.3x more likely to churn)
       2. Feature usage below 30% in first week (1.8x more likely)
       3. No login for 14+ consecutive days (3.1x more likely)
       
       RECOMMENDATION:
       Implement proactive outreach when any factor is detected.
       
       Confidence: 0.87 (based on 234 memories over 6 months)
```

### `brain.dream` — Overnight Processing

**What it does:** Runs a deep consolidation cycle, usually at night.

**What happens during a dream cycle:**
1. **Review** all memories from the past 24 hours
2. **Compress** redundant or similar memories
3. **Connect** new memories to existing knowledge graph
4. **Generate** novel insights by combining ideas
5. **Archive** low-confidence memories to cold storage
6. **Cleanup** duplicate or contradictory information

**Example output:**
```
Dream Cycle Complete
├── Processed: 1,247 memories
├── Compressed: 89 redundant memories
├── New connections: 342 graph edges
├── Insights generated: 7
├── Archived to cold: 45 memories
└── Duration: 23 minutes
```

### `brain.deep_think` — Extended Reasoning

**What it does:** Spends extra time analyzing a complex question.

**When to use:**
- Complex problems that need careful analysis
- Questions that span multiple domains
- Strategic decisions with many factors

**Example:**
```
You: Deep think about our go-to-market strategy

Brain: Entering deep think mode...
       
       [Analyzing 1,892 relevant memories]
       [Cross-referencing with market data]
       [Examining historical decisions]
       [Projecting outcomes]
       
       ANALYSIS (17 minutes):
       
       Current State:
       - Primary channel: Product-led growth
       - Conversion rate: 2.3% (below industry avg 3.1%)
       - CAC: $127 (acceptable for ARR $500+)
       
       Key Insight:
       Memory analysis shows users who interact with
       support in first 7 days convert at 4.1x rate.
       This suggests relationship-building matters
       more than feature discovery for your audience.
       
       Recommendation:
       Implement proactive onboarding calls for trial users.
       Expected impact: +1.2% conversion = ~$180k ARR.
       
       Confidence: 0.78
```

---

## The Knowledge Graph

Memories aren't stored in isolation—they're connected in a **knowledge graph**.

```
┌─────────────────────────────────────────────────────────┐
│                    KNOWLEDGE GRAPH                       │
│                                                         │
│      [Customer A] ──owns──> [Account #123]              │
│           │                      │                       │
│        uses                   has_issue                 │
│           │                      │                       │
│           ▼                      ▼                       │
│      [Product X] <──relates──> [Bug #456]               │
│           │                      │                       │
│        version                fixed_in                  │
│           │                      │                       │
│           ▼                      ▼                       │
│      [v2.3.0] ──released──> [Jan 2026]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Why This Matters

Without a graph, the AI would have separate, disconnected facts. With the graph:

**Question:** "What issues does Customer A have?"

**Without graph:** (searches all memories, might miss connections)

**With graph:** 
1. Find Customer A node
2. Follow "owns" edge to Account #123
3. Follow "has_issue" edge to Bug #456
4. Return: "Customer A (via Account #123) is affected by Bug #456"

---

## Brain Status & Health

The Brain reports its health status:

```
substrate:// brain.status

Brain Module Status
═══════════════════════════════════════════

Health Score: 94%

Memory Stats:
├── Hot memories: 12,456
├── Cold memories: 89,234
├── Total size: 2.3 GB
└── Graph edges: 156,789

Recent Activity:
├── Queries (24h): 3,456
├── Stores (24h): 234
├── Avg recall time: 87ms
└── Learning sessions: 12

Last Dream: 6 hours ago
Last Reflection: 4 hours ago
```

---

## Common Questions

### "How much can the brain remember?"

There's no hard limit. The two-tier system means:
- Hot memory is limited by performance (typically 30 days)
- Cold memory is unlimited (stored in database)

### "Does the brain ever forget?"

Yes, intentionally. Low-confidence memories that haven't been accessed are eventually deleted. This prevents accumulation of "junk" memories.

### "Can I make the brain forget something?"

Yes. Use `brain.forget` with a specific memory ID or topic:
```
brain.forget memory_id:abc123
brain.forget topic:"old project data"
```

### "How accurate is recall?"

Accuracy depends on:
- Quality of the original memory
- How specifically you query
- Whether embeddings capture the meaning well

Typical accuracy: 85-95% for well-formed queries.

### "Can I see what the brain knows about me/topic?"

Yes. Use `brain.graph_summary`:
```
brain.graph_summary topic:"user preferences"
```

This shows all connected memories for that topic.

---

## Next Document

→ [11-DEFENSE-DEEP-DIVE.md](./11-DEFENSE-DEEP-DIVE.md) — How the security system protects the substrate
