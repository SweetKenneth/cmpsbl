# 02: The Brain — Memory and Learning

**How the System Remembers and Gets Smarter**

---

## The Problem With Most AI

When you chat with ChatGPT, Claude, or any AI:

1. You have a conversation
2. The conversation ends
3. **The AI forgets everything**

The next time you chat, it's like talking to someone with amnesia. This is the fundamental limitation of most AI systems—they have no persistent memory.

---

## How Our Brain Works: Two-Tier Memory

We solve this with a **dual-tier memory system**, just like human brains:

### Hot Memory (Short-Term)
- **What it is:** Recent, frequently-accessed information
- **How long it lasts:** Days to weeks
- **What it's for:** Quick recall of active knowledge
- **Human analogy:** Your working memory—what you're actively thinking about

### Cold Memory (Long-Term)
- **What it is:** Older, important information that's been consolidated
- **How long it lasts:** Months to years
- **What it's for:** Deep knowledge that doesn't change often
- **Human analogy:** Your long-term memory—skills, facts, experiences

```
┌─────────────────────────────────────────┐
│            INCOMING INFORMATION          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         HOT MEMORY (Active)              │
│  • Recent conversations                  │
│  • Current tasks                         │
│  • Frequently accessed facts             │
│  • Decays over time if not used          │
└─────────────────┬───────────────────────┘
                  │
         [If important enough]
                  │
                  ▼
┌─────────────────────────────────────────┐
│         COLD MEMORY (Archive)            │
│  • Consolidated knowledge                │
│  • Proven patterns                       │
│  • Historical data                       │
│  • Compressed for storage                │
└─────────────────────────────────────────┘
```

---

## The Knowledge Graph

Memory isn't just a pile of facts. It's a **web of connected ideas**.

**Example:** If the system learns:
- "Kenneth is the founder"
- "Kenneth created promptfluid"
- "promptfluid is a cognitive substrate"

It creates connections:

```
[Kenneth] ──(is founder of)──▶ [promptfluid]
    │                              │
    └──(created)──────────────────┘
                                   │
                          (is a)───┘
                                   │
                                   ▼
                        [cognitive substrate]
```

This allows the system to answer questions it was never explicitly told, like "Who founded the cognitive substrate company?" by following the connections.

---

## How Learning Actually Works

### The Learning Cycle (Every 15 Minutes)

The brain runs automated learning cycles:

1. **Pick a Topic**
   - The system picks something to learn about
   - Topics are weighted by importance (valuation > governance > technical)

2. **Research**
   - Query external sources (Perplexity, web search)
   - Gather new information

3. **Digest**
   - Process information through AI reasoning
   - Extract key insights

4. **Store**
   - Save to hot memory with metadata
   - Create knowledge graph connections

5. **Repeat**
   - The cycle continues automatically

### The Dream Cycle (Nightly)

Every night, the brain runs a "dream" cycle:

1. **Review the day's learnings**
2. **Look for patterns across memories**
3. **Consolidate important things to cold memory**
4. **Forget (decay) unimportant things**
5. **Generate synthesis insights**

**Plain English:** Just like humans, the system "sleeps on it" and wakes up smarter.

---

## Memory Operations You Can Do

| Operation | What It Does | Example |
|-----------|--------------|---------|
| **remember** | Store something new | "Remember that we closed the Series A" |
| **recall** | Retrieve stored information | "What do you know about the Series A?" |
| **forget** | Decrease confidence in a memory | Remove outdated information |
| **reinforce** | Strengthen a memory | Mark something as confirmed/important |
| **reflect** | Analyze patterns in memories | "What patterns do you see?" |
| **synthesize** | Combine learnings into insights | "What have you learned overall?" |

---

## The Confidence System

Every memory has a **confidence score** (0 to 1):

- **1.0** = Absolutely certain (e.g., core facts)
- **0.7-0.9** = Highly confident (e.g., verified learning)
- **0.4-0.6** = Moderately confident (e.g., new information)
- **Below 0.3** = Low confidence (candidates for forgetting)

Confidence changes over time:
- **Reinforcement** increases confidence
- **Lack of access** decreases confidence (decay)
- **Conflicting information** decreases confidence

---

## Why This Matters

### For Users
- AI assistants that actually remember your preferences
- Systems that learn from your specific domain
- No need to re-explain context every session

### For Developers
- Pre-built memory infrastructure
- Don't reinvent knowledge graphs
- Automatic learning pipelines

### For Businesses
- Institutional knowledge that persists
- AI that gets more valuable over time
- Competitive moat from accumulated learning

---

## Technical Reality Check

**What's actually happening under the hood:**

1. Memories are stored in a PostgreSQL database (via Supabase)
2. Each memory has content, type, confidence, metadata, and timestamps
3. Hot memories have embeddings for semantic search
4. The knowledge graph uses a separate edges table
5. Learning cycles are triggered by cron jobs or API calls
6. Dream cycles are scheduled for nighttime processing

**But you don't need to know any of that.** The point is: you say "remember this" and it remembers.

---

## Current Capabilities vs. Future

| Capability | Current Status | Future |
|------------|----------------|--------|
| Hot/Cold memory tiers | ✅ Working | Enhanced compression |
| Knowledge graph | ✅ Working | Deeper relationship mining |
| 15-minute learning cycles | ✅ Working | Adaptive frequency |
| Nightly dream cycles | ✅ Working | Real-time synthesis |
| Cross-domain synthesis | ✅ Working | Multi-agent collaboration |
| Memory search | ✅ Basic | Vector + semantic hybrid |

---

## Next Document

→ [03-THE-MODULES.md](./03-THE-MODULES.md) — The 8 building blocks of the system
