# Memory & Learning

---

## How CMPSBL Remembers

Unlike traditional AI systems that lose context between sessions, CMPSBL maintains persistent memory through a 4-tier architecture managed by the **MEMORY Organ**.

---

## Memory Tiers

| Tier | Speed | Capacity | What's Stored |
|------|-------|----------|--------------|
| **Hot** | < 1ms | 2,000 entries | Active session context, routing cache, circuit breaker state |
| **Warm** | < 50ms | 5,000 entries | Recent tasks, active learning topics, working memory |
| **Cold** | < 500ms | 10,000 entries | Historical data, completed work, distilled knowledge |
| **Glacier** | < 2s | 50,000 entries | Long-term archive, deep historical data |

---

## Automatic Tier Management

Knowledge moves between tiers automatically:

- **Hot → Warm:** After 15 minutes of inactivity or session end
- **Warm → Cold:** After 14 days with low usage
- **Cold → Glacier:** Extended retention threshold
- **Emergency cascade:** Bulk demotion if capacity exceeded

---

## Constant Learning Mode (CLM)

CLM is the substrate's always-on learning engine. It runs continuous learning cycles in the background:

- **Topic sourcing:** 70% from system telemetry (what the system observes), 30% from scheduled curriculum
- **Throughput:** Up to 14,400 learning cycles per day
- **Distillation:** Mature knowledge compressed and promoted to permanent MEMORY Organ storage
- **Compounding:** Every cycle makes the system smarter — knowledge accumulates over time

### CLM by Plan

| Plan | CLM Cycles/Day |
|------|---------------|
| Free | Not available |
| Pro | 100 |
| Enterprise | 14,400 |
| Self-Hosted | Unlimited |

---

## DREAM Engine Synthesis

The **DREAM Engine** generates heuristic insights through autonomous synthesis cycles. It:

- Processes signals from across the substrate
- Generates novel patterns and connections
- Proposes improvements that enter the evolution pipeline
- Powers agent self-improvement (agents get better over time)

DREAM Engine synthesis is how the substrate discovers things it wasn't explicitly programmed to find.

---

## Memory Stream

The Memory Stream is the substrate's discovery engine. It observes system behavior and identifies new capabilities:

1. System activity generates behavioral signals
2. Discovery scoring (CJPI) evaluates novelty, utility, and complexity
3. High-scoring discoveries crystallize into portable memory chains
4. Crystallized memories can be exported as artifact packs

The Memory Stream is how CMPSBL discovers new software capabilities autonomously.

---

## Memory Chains

Memory chains are predefined multi-primitive reaction workflows. When trigger conditions are met, chains fire automatically:

- **100 active chains** across 9 categories (security, learning, operations, governance, etc.)
- **Guarded execution** — Node Lock Guard prevents conflicts; Cascade Tracker prevents runaway reactions
- **Governed** — GOVERNANCE Layer can pause or override any chain
- **Audited** — every execution logged with tamper-evident receipts

---

© 2025–2026 CMPSBL®. All rights reserved.
