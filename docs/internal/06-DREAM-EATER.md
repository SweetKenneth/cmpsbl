# 06. Dream-Eater Cycles

**CMPSBL OS Substrate — Internal Engineering Library**

---

## What Is Dream-Eater?

Dream-Eater is the substrate's **autonomous learning system**. While the system is idle (or on a schedule), it:

1. Consumes content from configured sources
2. Extracts structured insights using the Doctrine Discipline
3. Integrates learnings into BRAIN
4. Proposes improvements to MODERNIZER

**The name comes from the fact that it "eats" information and "dreams" up improvements.**

---

## The Doctrine Extraction Discipline

**This is the secret framework that makes learning structured and actionable.**

Every piece of consumed content is analyzed through this lens:

```
EXTRACTION SCHEMA:
─────────────────
1. Thesis: What is the core claim?
2. Incentives: Who benefits and how?
3. Power Structure: Who controls what?
4. Winners/Losers: Who gains, who loses?
5. Strategic Moves: What actions are recommended?
6. Assumptions: What must be true for this to work?
7. Timelines: When do things happen?
8. Leverage Points: Where can we apply pressure?
9. Modes of Acquisition: How is value captured?
10. Governance Implications: What rules apply?
11. Valuation Drivers: What creates/destroys value?
12. Narrative Vectors: How is this story told?
```

### Example Extraction

**Input:** "Companies with network effects have higher valuations"

**Extracted:**
```
Thesis: Network effects create defensible moats
Incentives: Investors reward network businesses with premium
Power Structure: Platform owner controls the network
Winners: First movers, platform owners
Losers: Late entrants, commodity players
Strategic Moves: Prioritize user acquisition over monetization early
Assumptions: Network effects compound over time
Leverage Points: User onboarding friction
Valuation Drivers: User growth rate, engagement metrics
```

---

## Dream Cycle Phases

### Phase 1: HARVEST
- Scan configured content sources
- Queue new content for processing
- Respect rate limits and quotas
- Track what's been consumed

### Phase 2: CONSUME
- Feed content to AI provider
- Apply Doctrine Extraction schema
- Generate structured insights
- Calculate confidence scores

### Phase 3: INTEGRATE
- Store insights in BRAIN as `doctrine_integrated` memories
- Link to source content
- Update knowledge graph connections
- Boost related existing memories

### Phase 4: SYNTHESIZE
- Cross-reference new learnings with existing knowledge
- Identify patterns across sources
- Generate "cross-domain insights"
- Flag potential improvements for MODERNIZER

### Phase 5: REST
- Consolidate memories
- Prune low-value learnings
- Generate dream cycle report
- Schedule next cycle

---

## Content Sources

| Source Type | Examples | Update Frequency |
|-------------|----------|------------------|
| RSS Feeds | Tech blogs, news | Every 4 hours |
| Document Uploads | PDFs, research papers | On upload |
| Manual Input | User-provided insights | Immediate |
| Web Crawl | Configured domains | Weekly |
| API Feeds | Partner data streams | Real-time |

---

## The Dream Pool

Agencies can share learnings through the **Dream Pool**:

```
PRIVACY LEVELS:
───────────────
isolated: Only this agency's learnings
pooled: Share with other agencies in same tier
global: Contribute to and receive from global pool

CONSENT CONTROLS:
────────────────
allow_global_pooling: true/false
allow_heuristic_sharing: true/false
allow_template_sharing: true/false
exclude_domains: ["competitor.com", "internal.corp"]
```

**The Secret:** Pooled learnings are **anonymized and abstracted**. No raw content is shared—only extracted patterns.

---

## Autonomous Improvement Loop

```
Dream Cycle completes
        │
        ▼
Synthesized insights reviewed
        │
        ├─[Low confidence]──► Stored for future reference
        │
        └─[High confidence]──► MODERNIZER.propose()
                                    │
                                    ▼
                              Evolution Engine
                              5-phase lifecycle
```

This creates a **closed-loop learning system** where the substrate improves itself based on what it learns.

---

## Cycle Scheduling

```
Default Schedule:
- Light cycle: Every 4 hours (quick RSS scan)
- Deep cycle: Every 24 hours (full synthesis)
- Consolidation: Every 7 days (memory cleanup)

Resource Limits:
- Max 100 items per light cycle
- Max 500 items per deep cycle
- Max 10 AI calls per minute
- Max 50,000 tokens per cycle
```

---

*CMPSBL OS Substrate v6.0.0 — Internal Engineering Library*
