# BRAIN — Ultimate Architecture (v9.0.0 "Synaptic")

**Primitive:** #03 — BRAIN  
**Category:** CCR (Cognitive Core Ring)  
**Weight:** 0.065  
**Classification:** 🔒 FOUNDER EYES ONLY  
**Last Updated:** 2026-03-23

---

## 1. Purpose

BRAIN is the substrate's **cognitive reasoning and intelligence core**. It doesn't just retrieve and rank — it *thinks* across multiple strategies, monitors its own reasoning accuracy, detects contradictions, builds causal models, compresses working memory via chunking, and collaborates with the entire substrate mid-thought via cross-primitive intelligence fusion.

---

## 2. Core Engines (12)

### 2.1 Multi-Strategy Reasoning Engine
- **4 parallel reasoning tracks**: deductive, inductive, abductive, analogical
- Each track produces a confidence-scored conclusion independently
- A **meta-reasoner** selects or blends the strongest result using weighted scoring
- Strategy weights: deductive (0.35), inductive (0.25), abductive (0.25), analogical (0.15)

### 2.2 Cognitive Load Balancer
- Dynamic **thought-budget allocation**: complex queries get more compute, simple ones fast-path
- Load formula: `tokens×0.4 + depth×0.35 + switches×0.25`
- Auto-shed low-priority background reasoning when load ≥ 80%
- Critical threshold at 95% triggers emergency mode

### 2.3 Attention Spotlight Engine
- **Selective mode**: focus on ≤3 highest-relevance context slices (intensity: 0.95)
- **Sustained mode**: maintain focus on 1 target across multi-turn chains (intensity: 0.80)
- **Divided mode**: parallel-process up to 8 independent sub-problems (intensity: 0.50)
- Drift detection via switch-count ratio (switchCount / 50)

### 2.4 Insight Crystallization Pipeline
- Novel reasoning connections are **crystallized** as reusable insights
- Composite scoring: `novelty×0.4 + utility×0.4 + crossDomain×0.2`
- Registry capacity: 500 insights with decay protection for scores > 0.7
- Eviction targets lowest-scoring unprotected insights

### 2.5 Contradiction Detection & Resolution Engine
- Scans beliefs for **negation-pair conflicts** (always/never, true/false, safe/unsafe, etc.)
- Severity classification: low / medium / high / critical (based on cosine similarity)
- Resolution strategies: evidence-weight, temporal-precedence, authority-rank, manual
- Emits governance signals for critical contradictions

### 2.6 Causal Graph Builder
- Directed causal graph with EMA-weighted edge strength
- **do-calculus inspired**: distinguishes correlation from causation via `interventionTested` flag
- DFS-based causal chain tracing (max depth: 10)
- Capacity: 1,000 nodes with weakest-edge eviction
- Automatic root-cause and leaf-effect identification

### 2.7 Metacognitive Monitor
- **Brier score** calibration tracking (target: < 0.15)
- Overconfidence/underconfidence detection (±0.15 threshold)
- 10-bucket calibration curve (predicted vs. actual)
- Per-domain scoring for specialized reasoning accuracy
- Rolling window: last 100 predictions

### 2.8 Working Memory Compression
- Base capacity: **7±2 slots** (Miller's Law)
- **Semantic chunking**: items with cosine similarity > 0.4 are merged into composite slots
- Effective capacity expands to **15–20 items** through smart encoding
- Time-decay relevance: `relevance × e^(-age × 0.01)`
- Evicts lowest-relevance items when over max effective capacity (20)

### 2.9 Cross-Primitive Intelligence Fusion
- BRAIN requests and **fuses** specialized knowledge from up to **6 primitives** simultaneously
- Authority-weighted blending: DEFENSE (0.9), MEMORY (0.9), ORACLE (0.85), CORTEX (0.8)
- Produces confidence-weighted composite results
- Fusion strategy: authority-weighted-blend

### 2.10 Reasoning Trace Ledger
- **Hash-chained audit trail** (FNV-1a) of every reasoning step
- Entry types: premise, inference, conclusion, evidence, assumption
- Max depth: 50 steps per trace, 200 traces retained
- `verifyTrace()` validates chain integrity (tamper detection)
- Enables "show your work" capability for any past decision

### 2.11 Adaptive Learning Rate Governor
- **High-surprise events** get amplified learning (up to 5.0× weight updates)
- **Routine confirmations** get dampened learning (down to 0.01×)
- Surprise detection via prediction error magnitude against threshold
- EMA smoothing prevents oscillation (α = 0.05)
- Range: 0.01× – 5.0× (prevents catastrophic forgetting)

### 2.12 Enhanced Dream ↔ Brain Bidirectional Protocol
- BRAIN submits **unresolved problems** to DREAM queue (priority-ranked, max 50)
- DREAM returns synthesized solutions; BRAIN validates before accepting
- Three-phase: submit → receive solution → validate
- Problems auto-sorted by priority descending

---

## 3. ADA Integration

BRAIN operates within the `cognitive-reasoning` domain:
- **Autonomy threshold:** 70%
- **Rate limit:** 120 decisions/hr
- **DREAM allowed:** ✓
- **Allowed actions:** multi-strategy-reason, crystallize-insight, detect-contradiction, build-causal-edge, compress-working-memory, fuse-intelligence, adjust-learning-rate, submit-to-dream, set-attention-mode, record-prediction
- **Blocked actions:** evolve, delete-causal-graph, clear-insight-registry, modify-metacognitive-calibration

---

## 4. Key Constants

| Parameter | Value |
|---|---|
| Working Memory Base | 7 slots |
| Working Memory Max | 20 (via chunking) |
| Insight Registry | 500 entries |
| Causal Graph Max | 1,000 nodes |
| Trace Max Steps | 50 |
| Trace Ledger Size | 200 |
| Load Shed Threshold | 80% |
| Load Critical | 95% |
| Learning Rate Range | 0.01× – 5.0× |
| Brier Score Target | < 0.15 |
| Dream Queue Max | 50 problems |
| Metacog Window | 100 predictions |

---

## 5. Key Metrics

| Metric | Target |
|---|---|
| Multi-strategy latency | < 10ms |
| Contradiction detection | < 50ms |
| Insight crystallization | < 5ms |
| Causal chain trace | < 20ms (depth 10) |
| Trace verification | < 2ms |
| Fusion latency (6 primitives) | < 100ms |
| Working memory compression ratio | ≥ 2:1 |

---

## 6. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  BRAIN v9.0.0 "Synaptic"                     │
│            Cognitive Reasoning & Intelligence Core            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Multi-Strategy │  │  Cognitive     │  │  Attention     │ │
│  │  Reasoning (4)  │  │  Load          │  │  Spotlight     │ │
│  │                 │  │  Balancer      │  │  (sel/sus/div) │ │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘ │
│          │                   │                    │           │
│  ┌───────┴───────────────────┴────────────────────┴───────┐  │
│  │              Cognitive Processing Core                  │  │
│  │  BM25 │ SDR │ Associative Graph │ Working Memory (7±2) │  │
│  │  Hebbian Strengthening │ Predictive Pre-fetch          │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────┐  ┌────┴───────────┐  ┌────────────────┐ │
│  │  Insight        │  │  Contradiction │  │  Causal Graph  │ │
│  │  Crystallizer   │  │  Detector &    │  │  Builder       │ │
│  │  (500 cap)      │  │  Resolver      │  │  (1K nodes)    │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Metacognitive  │  │  WM Compress   │  │  Cross-Primitive    │ │
│  │  Monitor        │  │  & Chunking    │  │  Intelligence  │ │
│  │  (Brier <0.15)  │  │  (7→20 slots)  │  │  Fusion (×6)   │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Reasoning      │  │  Adaptive      │  │  Dream ↔ Brain │ │
│  │  Trace Ledger   │  │  Learning Rate │  │  Bidirectional │ │
│  │  (Hash-chained) │  │  (0.01–5.0×)   │  │  Protocol      │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Hook API Surface

The `useBrain()` hook exposes:
- **12 queries**: status, memoryState, patterns, curiosity, graphSummary, synapticState, workingMemory, metacognition, insightRegistry, causalGraph, reasoningTraces, dreamQueue
- **30+ mutations**: all legacy operations + multiStrategyReason, updateCognitiveLoad, setAttention, crystallizeInsight, searchInsights, scanContradictions, resolveContradiction, addCausalEdge, traceCausalChain, recordPrediction, addToWorkingMemory, clearWorkingMemory, fuseIntelligence, createReasoningTrace, appendTraceEntry, verifyTrace, computeLearningRate, submitToDream, receiveDreamSolution, validateDreamSolution

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-23 | System | v9.0.0 "Synaptic" — 12-engine ultimate architecture |

---

© 2025–2026 CMPSBL®. Confidential.
