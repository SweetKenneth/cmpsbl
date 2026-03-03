# 27 — CLM (Constant Learning Mode)

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

CLM is the substrate's continuous external learning system. It executes topic-driven AI calls at high velocity to expand the knowledge base, governed by mastery thresholds and deduplication to prevent waste.

## 2. Architecture

### 2.1 Pipeline Flow

```
Topic Selection → NEXUS-CLM Bridge → AI Provider → Knowledge Extraction → MEMORY Persistence → Dedup → Mastery Check
```

### 2.2 Core Implementation

| Component | File | Role |
|-----------|------|------|
| Topic Pipeline | `src/lib/control-plane/clm/topic-pipeline.ts` | Topic selection, weighting, scheduling |
| NEXUS-CLM Bridge | `src/lib/control-plane/intel/nexus-clm-bridge.ts` | Routes CLM calls through NEXUS |
| CLM Feedback | `src/lib/substrate/intent-mesh/clm-feedback.ts` | Feedback loop integration |
| Module CLM | `src/lib/substrate/module-clm/` | Per-module CLM configuration |

## 3. Topic Weighting

CLM uses a 70/30 split between two topic pools:

| Pool | Weight | Description |
|------|--------|-------------|
| Global Topics | 70% | System stability, governance, architecture health |
| Node Solo Topics | 30% | Per-module specialized learning |

Topic selection is weighted by:
- Current health score (degraded modules get more learning cycles)
- Mastery level (novel topics preferred once mastered)
- ENGINEER findings (high-severity findings boost related topics)

## 4. High-Velocity Training Engine

**Edge function:** `pf-clm-engine`

| Metric | Value |
|--------|-------|
| Target throughput | 14,400 AI calls/day |
| Cycle frequency | ~10 calls/minute |
| Provider requirement | At least one AI provider key (OpenAI, Anthropic, etc.) |
| Cost governance | ECONOMY tracks per-call costs, daily budgets enforced |

### 4.1 Provider Routing

CLM calls are routed through NEXUS, which selects the optimal provider based on:
- Topic type → provider affinity
- Current provider health
- Cost budget remaining
- Latency requirements (learning calls are latency-tolerant)

## 5. Topic Mastery

### 5.1 Mastery Threshold

Each topic tracks a mastery score:

```
mastery = successful_extractions / total_attempts × recency_weight × novelty_factor
```

Once mastery ≥ 0.85:
- Topic is flagged as "mastered"
- Future calls require novelty (new sub-topics or deeper analysis)
- Prevents redundant learning cycles

### 5.2 Mastery Highlights

`TopicMasteryHighlight` objects are surfaced in INTEL reports:
- Topics approaching mastery
- Topics with declining mastery (knowledge decay)
- Gap analysis: topics with zero coverage

## 6. Deduplication

CLM deduplicates at two levels:

| Level | Method | Purpose |
|-------|--------|---------|
| Input dedup | Topic + prompt fingerprint | Prevents identical calls |
| Output dedup | Content-hash of extracted knowledge | Prevents redundant MEMORY writes |

## 7. Knowledge Distillation

A Knowledge Distillation Engine runs on a 4-hour staggered schedule:

1. Aggregates raw CLM outputs from the last window
2. Distills into refined knowledge entries
3. Merges with existing MEMORY entries
4. Prunes low-confidence extractions
5. Updates mastery scores

### 7.1 Downstream Distribution

For LNCHBL (downstream distributions):
- Patches are synchronized every 30 minutes
- Only distilled, high-confidence knowledge is distributed
- Distribution respects tenant isolation (RLS-enforced)

## 8. Dependencies

| Dependency | Role |
|------------|------|
| NEXUS | Provider routing for AI calls |
| MEMORY | Knowledge persistence |
| ECONOMY | Cost tracking and budget enforcement |
| INTEL | Mastery reporting and CLM health visibility |
| ENGINEER | Finding-driven topic prioritization |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial CLM internal documentation — v13.1.0 |

---

© 2025–2026 PromptFluid®. Confidential.
