# 06: Architecture Diagrams

**Visual Maps of How Everything Connects**

---

## The Complete System Overview

```
╔═══════════════════════════════════════════════════════════════════╗
║                     PROMPTFLUID COGNITIVE SUBSTRATE                ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        ║
║   │   USERS     │     │    APIs     │     │   BOTS      │        ║
║   │  (Humans)   │     │ (Machines)  │     │ (Blocked)   │        ║
║   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘        ║
║          │                   │                   │                ║
║          └───────────────────┼───────────────────┘                ║
║                              │                                    ║
║                              ▼                                    ║
║   ╔═══════════════════════════════════════════════════════════╗  ║
║   ║                     DEFENSE MODULE                         ║  ║
║   ║   Bot Detection → Threat Analysis → Rate Limiting          ║  ║
║   ╚═══════════════════════════════════════════════════════════╝  ║
║                              │                                    ║
║                    [Safe requests only]                           ║
║                              │                                    ║
║                              ▼                                    ║
║   ╔═══════════════════════════════════════════════════════════╗  ║
║   ║                     DECODE MODULE                          ║  ║
║   ║   Natural Language → Structured Intent → Routed Commands   ║  ║
║   ╚═══════════════════════════════════════════════════════════╝  ║
║                              │                                    ║
║          ┌───────────────────┼───────────────────┐                ║
║          ▼                   ▼                   ▼                ║
║   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        ║
║   │   BRAIN     │     │   NEXUS     │     │   DREAM     │        ║
║   │  (Memory)   │◄───►│  (AI Route) │◄───►│  (Evolve)   │        ║
║   └─────────────┘     └─────────────┘     └─────────────┘        ║
║          │                   │                   │                ║
║          └───────────────────┼───────────────────┘                ║
║                              │                                    ║
║                              ▼                                    ║
║   ╔═══════════════════════════════════════════════════════════╗  ║
║   ║                     VISION MODULE                          ║  ║
║   ║   Logging → Metrics → Dashboards → Alerts                  ║  ║
║   ╚═══════════════════════════════════════════════════════════╝  ║
║                              │                                    ║
║                              ▼                                    ║
║   ╔═══════════════════════════════════════════════════════════╗  ║
║   ║              SYSTEM + MODERNIZER MODULES                   ║  ║
║   ║   Health → Healing → Backup → Upgrade → Rollback           ║  ║
║   ╚═══════════════════════════════════════════════════════════╝  ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**What this shows:**
1. All traffic enters through Defense (security first)
2. Human language is translated by Decode
3. Core modules (Brain, Nexus, Dream) work together
4. Everything is monitored by Vision
5. System and Modernizer keep it running and improving

---

## The Request Flow

When someone makes a request, here's what happens:

```
USER REQUEST: "What did we learn about competitors last week?"
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: DEFENSE                                                 │
│ ─────────────────                                               │
│ • Check IP reputation: 92/100 (trusted)                         │
│ • Bot score: 0.02 (human)                                       │
│ • Rate limit check: 4/100 requests this hour (OK)               │
│ • Decision: ALLOW                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: DECODE                                                  │
│ ─────────────────                                               │
│ • Parse: "competitors" + "last week" + "learned"                │
│ • Intent: RECALL (memory retrieval)                             │
│ • Timeframe: 7 days                                             │
│ • Topic filter: "competitor"                                    │
│ • Route to: BRAIN.recall                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: BRAIN                                                   │
│ ─────────────────                                               │
│ • Search hot memory for "competitor" (last 7 days)              │
│ • Found: 12 memories                                            │
│ • Rank by relevance and confidence                              │
│ • Return top 5 most relevant                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: NEXUS (if synthesis needed)                             │
│ ─────────────────                                               │
│ • Take 5 memories                                               │
│ • Route to Groq for summarization                               │
│ • Generate coherent response                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: VISION                                                  │
│ ─────────────────                                               │
│ • Log request (type: recall, latency: 234ms)                    │
│ • Update metrics (daily queries: +1)                            │
│ • Check for anomalies (none)                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
USER RECEIVES: "Last week, you learned 5 things about competitors:
               1. Competitor X raised $10M...
               2. Competitor Y launched new feature...
               [etc.]"
```

---

## The Brain Memory Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         BRAIN MODULE                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   INCOMING DATA                                                   │
│   ─────────────                                                   │
│   • User inputs                                                   │
│   • Learning cycle discoveries                                    │
│   • Dream cycle insights                                          │
│   • External data feeds                                           │
│                     │                                             │
│                     ▼                                             │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │              HOT MEMORY                                  │    │
│   │  ┌──────────────────────────────────────────────────┐   │    │
│   │  │ Recent memories (days to weeks)                   │   │    │
│   │  │ • High access frequency                           │   │    │
│   │  │ • Full embeddings for semantic search             │   │    │
│   │  │ • Confidence decays if not accessed               │   │    │
│   │  │ • ~1,000-10,000 items typically                   │   │    │
│   │  └──────────────────────────────────────────────────┘   │    │
│   └────────────────────────┬────────────────────────────────┘    │
│                            │                                      │
│                   [Dream cycle consolidation]                     │
│                            │                                      │
│                            ▼                                      │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │              COLD MEMORY                                 │    │
│   │  ┌──────────────────────────────────────────────────┐   │    │
│   │  │ Archived memories (months to years)               │   │    │
│   │  │ • Low access frequency                            │   │    │
│   │  │ • Compressed for storage                          │   │    │
│   │  │ • Important/proven knowledge                      │   │    │
│   │  │ • ~10,000-100,000 items over time                 │   │    │
│   │  └──────────────────────────────────────────────────┘   │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│   KNOWLEDGE GRAPH                                                 │
│   ───────────────                                                 │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │                                                         │    │
│   │   [Kenneth]───(founded)───►[promptfluid]                │    │
│   │       │                         │                       │    │
│   │       │                    (is a type of)               │    │
│   │       │                         │                       │    │
│   │   (created)                     ▼                       │    │
│   │       │                  [AI Substrate]                 │    │
│   │       │                         │                       │    │
│   │       └─────────────────────────┘                       │    │
│   │                                                         │    │
│   │   Edges connect related concepts for inference          │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## The Nexus Routing System

```
                         INCOMING AI REQUEST
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                         NEXUS ROUTER                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   STEP 1: CLASSIFY REQUEST                                        │
│   ─────────────────────────                                       │
│   │                                                               │
│   ├── Text Generation?  ────► route to: text providers            │
│   ├── Reasoning?        ────► route to: reasoning providers       │
│   ├── Research?         ────► route to: search providers          │
│   ├── Image Generation? ────► route to: image providers           │
│   └── Video Generation? ────► route to: video providers           │
│                                                                   │
│   STEP 2: SELECT PROVIDER (Cascade)                               │
│   ─────────────────────────────────                               │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ TIER 1: PRIMARY                                          │    │
│   │ ┌─────────┐                                              │    │
│   │ │  GROQ   │ ◄── Try first (fastest, free tier)           │    │
│   │ └────┬────┘                                              │    │
│   │      │ If fails...                                       │    │
│   │      ▼                                                   │    │
│   │ TIER 2: SECONDARY                                        │    │
│   │ ┌─────────┐ ┌─────────┐                                  │    │
│   │ │CEREBRAS │ │SAMBANOVA│ ◄── High throughput backups      │    │
│   │ └────┬────┘ └────┬────┘                                  │    │
│   │      │           │ If both fail...                       │    │
│   │      └─────┬─────┘                                       │    │
│   │            ▼                                             │    │
│   │ TIER 3: FALLBACK                                         │    │
│   │ ┌─────────┐ ┌─────────┐ ┌─────────┐                      │    │
│   │ │TOGETHER │ │DEEPSEEK │ │HYPERBOLIC│ ◄── Additional      │    │
│   │ └─────────┘ └─────────┘ └─────────┘                      │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│   STEP 3: EXECUTE + MONITOR                                       │
│   ─────────────────────────                                       │
│   • Send request to selected provider                             │
│   • Measure latency                                               │
│   • Cache response                                                │
│   • Update provider health score                                  │
│   • Return result                                                 │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## The Self-Improvement Cycle

```
┌───────────────────────────────────────────────────────────────────┐
│                    MODERNIZER SELF-IMPROVEMENT                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────┐                                                 │
│   │   ANALYZE   │ ◄── Scan codebase for improvement opportunities │
│   └──────┬──────┘                                                 │
│          │                                                        │
│          ▼                                                        │
│   ┌─────────────┐                                                 │
│   │  PROPOSE    │ ◄── Generate detailed upgrade plan              │
│   └──────┬──────┘                                                 │
│          │                                                        │
│          ▼                                                        │
│   ╔═════════════╗                                                 │
│   ║   HUMAN     ║ ◄── REQUIRED: Human reviews and approves        │
│   ║   APPROVAL  ║                                                 │
│   ╚══════╤══════╝                                                 │
│          │                                                        │
│     ┌────┴────┐                                                   │
│     │         │                                                   │
│     ▼         ▼                                                   │
│  APPROVED  REJECTED ──────► End (no changes)                      │
│     │                                                             │
│     ▼                                                             │
│   ┌─────────────┐                                                 │
│   │   BACKUP    │ ◄── Create full system backup                   │
│   └──────┬──────┘                                                 │
│          │                                                        │
│          ▼                                                        │
│   ┌─────────────┐                                                 │
│   │   SHADOW    │ ◄── Test changes in shadow environment          │
│   │    TEST     │                                                 │
│   └──────┬──────┘                                                 │
│          │                                                        │
│     ┌────┴────┐                                                   │
│     │         │                                                   │
│     ▼         ▼                                                   │
│   PASSED   FAILED ──────► Rollback + Alert                        │
│     │                                                             │
│     ▼                                                             │
│   ┌─────────────┐                                                 │
│   │   DEPLOY    │ ◄── Apply to production                         │
│   └──────┬──────┘                                                 │
│          │                                                        │
│          ▼                                                        │
│   ┌─────────────┐                                                 │
│   │   MONITOR   │ ◄── Watch for 60 seconds                        │
│   └──────┬──────┘                                                 │
│          │                                                        │
│     ┌────┴────┐                                                   │
│     │         │                                                   │
│     ▼         ▼                                                   │
│  HEALTH    HEALTH                                                 │
│  ≥ 95%     < 95% ──────► AUTO-ROLLBACK                            │
│     │                                                             │
│     ▼                                                             │
│   ┌─────────────┐                                                 │
│   │   LEARN     │ ◄── Record what worked for future               │
│   └─────────────┘                                                 │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## The Defense Perimeter

```
                        INTERNET TRAFFIC
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                    DEFENSE PERIMETER                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   LAYER 1: IP REPUTATION                                          │
│   ───────────────────────                                         │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ Known Bad IPs ────► BLOCK immediately                    │    │
│   │ Unknown IPs   ────► Continue to Layer 2                  │    │
│   │ Known Good IPs ───► Fast-track (still checked)           │    │
│   └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│   LAYER 2: BOT DETECTION                                          │
│   ──────────────────────                                          │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ Behavioral Analysis:                                     │    │
│   │ • Mouse movements (humans are irregular)                 │    │
│   │ • Typing patterns (humans have rhythm)                   │    │
│   │ • Request timing (bots are too regular)                  │    │
│   │ • Browser fingerprint (bots have weird configs)          │    │
│   │                                                         │    │
│   │ Bot Score: 0.0 (definitely human) to 1.0 (definitely bot)│    │
│   │                                                         │    │
│   │ Score > 0.7 ────► BLOCK                                  │    │
│   │ Score > 0.4 ────► CHALLENGE (captcha)                    │    │
│   │ Score < 0.4 ────► ALLOW                                  │    │
│   └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│   LAYER 3: RATE LIMITING                                          │
│   ──────────────────────                                          │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ Per IP:     100 requests/hour                            │    │
│   │ Per User:   1000 requests/hour                           │    │
│   │ Per Org:    10000 requests/hour                          │    │
│   │                                                         │    │
│   │ Exceeded? ────► 429 Too Many Requests                    │    │
│   └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│   LAYER 4: CONTENT INSPECTION                                     │
│   ───────────────────────────                                     │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ Check for:                                               │    │
│   │ • Prompt injection attempts                              │    │
│   │ • SQL injection                                          │    │
│   │ • XSS attempts                                           │    │
│   │ • Unusual payload sizes                                  │    │
│   │                                                         │    │
│   │ Suspicious? ────► BLOCK + LOG for analysis               │    │
│   └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│                    ALLOWED INTO SYSTEM                            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## The Dream Cycle

```
┌───────────────────────────────────────────────────────────────────┐
│              DREAM CYCLE (Runs Nightly at 2 AM)                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   PHASE 1: GATHER (10 minutes)                                    │
│   ────────────────────────────                                    │
│   • Collect all memories from last 24 hours                       │
│   • Collect all learning cycle outputs                            │
│   • Collect all user interactions                                 │
│   • Collect all error logs                                        │
│                              │                                    │
│                              ▼                                    │
│   PHASE 2: ANALYZE (20 minutes)                                   │
│   ─────────────────────────────                                   │
│   • Look for patterns across memories                             │
│   • Identify frequently accessed topics                           │
│   • Find contradictions or inconsistencies                        │
│   • Detect knowledge gaps                                         │
│                              │                                    │
│                              ▼                                    │
│   PHASE 3: SYNTHESIZE (15 minutes)                                │
│   ───────────────────────────────                                 │
│   • Generate cross-domain insights                                │
│   • Create new knowledge graph edges                              │
│   • Formulate hypotheses for testing                              │
│   • Summarize key learnings                                       │
│                              │                                    │
│                              ▼                                    │
│   PHASE 4: CONSOLIDATE (10 minutes)                               │
│   ──────────────────────────────────                              │
│   • Move important memories: Hot → Cold                           │
│   • Compress old memories                                         │
│   • Decay unused memories                                         │
│   • Update confidence scores                                      │
│                              │                                    │
│                              ▼                                    │
│   PHASE 5: MUTATE (5 minutes)                                     │
│   ───────────────────────────                                     │
│   • Increment mutation level                                      │
│   • Store evolution checkpoint                                    │
│   • Flag improvement opportunities                                │
│   • Update system metadata                                        │
│                              │                                    │
│                              ▼                                    │
│   DREAM CYCLE COMPLETE                                            │
│   ────────────────────                                            │
│   Output: Dream report with:                                      │
│   • Insights generated                                            │
│   • Patterns discovered                                           │
│   • Memories consolidated                                         │
│   • Improvement suggestions                                       │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Next Document

→ [07-MARKET-POSITION.md](./07-MARKET-POSITION.md) — Where we stand vs. competition
