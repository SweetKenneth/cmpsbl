# 27 — CLM (Constant Learning Mode)

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

CLM is the substrate's continuous external learning system. It executes topic-driven AI calls at high velocity to expand the knowledge base across all 40 substrate nodes, governed by mastery thresholds, deduplication, health-prioritized learning, and auto-maintenance to prevent waste.

## 2. Architecture

### 2.1 Pipeline Flow

```
Node Health Scan → Topic Selection → NEXUS-CLM Bridge → AI Provider → Knowledge Extraction → MEMORY Persistence → Cold Auto-Prune → Dedup → Mastery Check
```

### 2.2 Core Implementation

| Component | File | Role |
|-----------|------|------|
| Edge Engine (v6.0.0) | `supabase/functions/pf-clm-engine/index.ts` | Server-side 24/7 learning engine |
| Runtime Scheduler | `src/lib/substrate/clm/runtime-scheduler.ts` | Client-side supplementary learning |
| Topic Pipeline | `src/lib/control-plane/clm/topic-pipeline.ts` | Topic selection, weighting, scheduling |
| NEXUS-CLM Bridge | `src/lib/control-plane/intel/nexus-clm-bridge.ts` | Routes CLM calls through NEXUS |
| CLM Feedback | `src/lib/substrate/intent-mesh/clm-feedback.ts` | Feedback loop integration |
| Module Hooks | `src/lib/substrate/clm/module-hooks.ts` | Per-module CLM integration (all 40 nodes) |
| Node Priorities | `src/lib/substrate/clm/node-priorities.ts` | Per-node top-2 learning priorities |
| Budget Governor | `src/lib/substrate/clm/budget-governor.ts` | NEXUS dynamic budget allocation |
| Config | `src/lib/substrate/clm/config.ts` | CLM configuration and overrides |

## 3. Node Coverage

CLM covers all **40 substrate nodes** across all sectors:

| Sector | Nodes |
|--------|-------|
| CORE + SYSTEM | core, system |
| CCR Zone | brain, memory, dream |
| OCG Zone | ripple, access, identity, relay, audit, nerve |
| Execution | decode, encode, vision, cortex, nexus, economy, sandbox, inclusive, medic, integration, evolution |
| ESZ | sovereign, oracle, conscience, treaty |
| EPZ | compass, echo, reflex |
| EMZ | forge, lingua, harvest |
| CSZ | shadow, phantom |
| Fields | immunity, intent |
| Plane | governance |
| Shell | defense |
| Auxiliary | atlas, observer |

## 4. Topic Weighting

CLM uses a 70/30 split between two topic pools:

| Pool | Weight | Description |
|------|--------|-------------|
| Global Topics | 70% | System stability, governance, architecture health |
| Node Solo Topics | 30% | Per-module specialized learning (40 node-specific topics) |

Topic selection is weighted by:
- Current health score (degraded modules get priority learning cycles)
- Mastery level (novel topics preferred once mastered)
- ENGINEER findings (high-severity findings boost related topics)

## 5. High-Velocity Training Engine

**Edge function:** `pf-clm-engine` (v6.0.0)

| Metric | Value |
|--------|-------|
| Daily cycle cap | 600 cycles/day |
| Hourly cycle cap | 30 cycles/hour |
| Burst size | 3–5 cycles per invocation |
| Modules per cycle | 4 (health-prioritized) |
| Topics per cycle | 3 (rotating through 15 domains) |
| Provider requirement | At least one AI provider key |
| Cost governance | ECONOMY tracks per-call costs, daily budgets enforced |

### 5.1 Provider Routing

CLM calls are routed through NEXUS, which selects the optimal provider based on:
- Topic type → provider affinity
- Current provider health
- Cost budget remaining
- Latency requirements (learning calls are latency-tolerant)

### 5.2 Health-Prioritized Learning

Each cycle fetches 24h node health scores and preferentially selects degraded nodes (health < 70) for learning, ensuring the most impacted modules receive remediation first.

## 6. Topic Mastery

### 6.1 Mastery Threshold

Each topic tracks a mastery score:

```
mastery = successful_extractions / total_attempts × recency_weight × novelty_factor
```

Once mastery ≥ 0.85:
- Topic is flagged as "mastered"
- Future calls require novelty (new sub-topics or deeper analysis)
- Prevents redundant learning cycles

### 6.2 Mastery Highlights

`TopicMasteryHighlight` objects are surfaced in INTEL reports:
- Topics approaching mastery
- Topics with declining mastery (knowledge decay)
- Gap analysis: topics with zero coverage

## 7. Deduplication

CLM deduplicates at two levels:

| Level | Method | Purpose |
|-------|--------|---------|
| Input dedup | Topic + prompt fingerprint | Prevents identical calls |
| Output dedup | Content-hash of extracted knowledge | Prevents redundant MEMORY writes |

## 8. Memory Auto-Maintenance

### 8.1 Tier Overflow Handling

| Tier | Threshold | Action |
|------|-----------|--------|
| Hot | ≥ 85% | Redirect writes to Warm |
| Cold | ≥ 95% | Auto-prune lowest-value entries (up to 5%) |
| Hot overflow | > limit | Trigger `pf-substrate` tier relief |

### 8.2 Cold Auto-Pruning

When cold tier reaches 95% capacity, the engine automatically:
1. Evicts entries with `value_score < 0.3` older than 30 days
2. Falls back to pruning `value_score < 0.25` by oldest-first
3. Prunes up to 200 entries per cycle

### 8.3 Knowledge Distillation

A Knowledge Distillation Engine runs on a 4-hour staggered schedule:
1. Aggregates raw CLM outputs from the last window
2. Distills into refined knowledge entries
3. Merges with existing MEMORY entries
4. Prunes low-confidence extractions
5. Updates mastery scores

## 9. Dependencies

| Dependency | Role |
|------------|------|
| NEXUS | Provider routing for AI calls |
| MEMORY | Knowledge persistence (hot/warm/cold) |
| ECONOMY | Cost tracking and budget enforcement |
| INTEL | Mastery reporting and CLM health visibility |
| ENGINEER | Finding-driven topic prioritization |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-22 | System | v6.0.0 — Full 40-node coverage, raised caps, auto-maintenance |
| 2026-03-03 | System | Initial CLM internal documentation — v13.1.0 |

---

© 2025–2026 CMPSBL®. Confidential.
