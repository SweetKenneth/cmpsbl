# DREAM — Synthesis Engine & Lineage Tracker

> **Node ID:** `dream` · **Sector:** Cognitive (CCR) · **Generation:** 1 · **Node #5 of 40**
> **Codename:** *Oneiros* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

DREAM is the substrate's synthesis engine — responsible for consolidating scattered knowledge into coherent heuristics, detecting semantic drift in derived knowledge, and maintaining lineage provenance for every synthesized artifact. DREAM operates during low-activity periods, generating new knowledge from existing patterns.

DREAM is the only node that *creates* new knowledge without external input. Every other node transforms, stores, or routes — DREAM imagines.

---

## Architecture

### Lineage & Semantic Drift Protection

DREAM tracks the full lineage of every synthesized heuristic:

```typescript
interface MemoryLineage {
  id: string;
  parentIds: string[];          // Source memories
  generation: number;           // Derivation depth
  rootSources: string[];        // Original non-derived sources
  synthesisMethod: string;      // Algorithm used
  confidenceDecay: number;      // Per-generation confidence loss
}
```

**MAX_GENERATION = 5** — No heuristic can be derived more than 5 levels deep from root sources. This prevents semantic drift (the "telephone game" effect) where meaning degrades through successive derivation.

### Dream Candidate Selection

Not all memories are eligible for dream synthesis. The filter pipeline:

```
filterDreamCandidates(memories):
  1. Exclude memories with generation >= MAX_GENERATION
  2. Exclude memories accessed in last 4 hours (still "active")
  3. Exclude memories with confidence < 0.3 (too uncertain)
  4. Exclude memories already used in 3+ syntheses (overexploited)
  5. Rank remaining by synthesis priority score
```

### Synthesis Priority Score

```
priority = (confidence × 0.3) + (access_frequency × 0.25) + (recency × 0.2) + (uniqueness × 0.25)
```

Where `uniqueness` is the inverse of how many similar memories exist (high uniqueness = rare knowledge = more valuable synthesis target).

---

## Trade Secrets

### 1. The Generation Depth Limit

MAX_GENERATION = 5 is the key guardrail against semantic drift. When DREAM synthesizes knowledge from two memories of generation 2 and 3, the output is generation 4. At generation 5, no further synthesis is allowed — the knowledge is "terminal" and must be validated by BRAIN before any further use.

### 2. Memory Weighting Function

```typescript
memoryWeight(entry: MemoryEntry): number {
  const ageDecay = Math.exp(-age_hours / 168);     // 7-day half-life
  const accessBoost = Math.log2(1 + accessCount);   // Logarithmic diminishing returns
  const confWeight = confidence * confidence;        // Quadratic confidence emphasis
  return ageDecay * accessBoost * confWeight;
}
```

This function determines how much influence each source memory has on the synthesized output. The quadratic confidence emphasis means low-confidence memories have almost no influence.

### 3. Heuristic Builder

When DREAM synthesizes a new pattern, it creates a structured `DreamHeuristic`:

```typescript
interface DreamHeuristic {
  id: string;
  rule: string;                 // Natural language rule
  confidence: number;           // Synthesis confidence
  sourceLineage: MemoryLineage;
  applicableDomains: string[];  // Where this rule applies
  counterExamples: number;      // Known exceptions
  validatedBy: string | null;   // BRAIN validation stamp
}
```

Heuristics with `counterExamples > 3` are automatically flagged for human review.

### 4. Dream Metrics

```typescript
interface DreamMetrics {
  totalSyntheses: number;
  avgConfidence: number;
  generationDistribution: Record<number, number>;
  driftScore: number;           // Overall semantic drift measurement
  activeHeuristics: number;
  retiredHeuristics: number;
}
```

The `driftScore` is computed as the average confidence loss across all generation transitions. A drift score > 0.2 triggers a DREAM pause until BRAIN revalidates the heuristic chain.

---

## Algorithms

### Dream Consolidation Cycle

```
1. Fetch eligible candidates (filterDreamCandidates)
2. Sort by synthesis priority
3. For each candidate pair:
   a. Check lineage compatibility (no circular derivation)
   b. Compute semantic overlap (cosine similarity > 0.5)
   c. If compatible: synthesize new heuristic
   d. Assign generation = max(parent_gen) + 1
   e. Compute confidence = min(parent_conf) × 0.85
4. Store new heuristics in MEMORY (WARM tier)
5. Emit DREAM_SYNTHESIS_COMPLETE signal
```

### Semantic Drift Score

```
drift = Σ(|confidence(gen_n) - confidence(gen_n-1)|) / n_transitions
```

---

## CCR Dream Hardening

The Dream Hardening layer (`ccr/dream-hardening.ts`) enforces:
- Maximum synthesis batch size (50 candidates per cycle)
- Minimum inter-cycle interval (15 minutes)
- Confidence floor (no heuristic below 0.1 survives)
- Lineage integrity verification before every synthesis

---

## CLM Learning Priorities

1. **Synthesis Quality Scoring** — Learning which memory pair combinations produce the most useful heuristics
2. **Optimal Consolidation Timing** — Predicting the best moments for dream cycles based on system activity patterns

---

*CMPSBL® Substrate — DREAM Node Deep Dive · Founder Eyes Only*
