# CLM — Ultimate Architecture (v9.0.0 "Perpetual Learner")

**System:** Constant Learning Mode  
**Classification:** 🔒 INTERNAL  
**Last Updated:** 2026-03-23

---

## 1. Purpose

The Constant Learning Mode (CLM) engine is the substrate's **autonomous continuous improvement system**. It operates 24/7 in background cycles, ingesting operational telemetry and converting it into actionable learning that improves every node's performance over time.

---

## 2. Core Engines

### 2.1 High-Performance Ingestion Pipeline
- Parallelized ingestion from all 40 nodes
- Parallel database guards prevent write contention
- Batch module learning (batches of 6 nodes per cycle)

### 2.2 Curriculum Engine
- Cached immutable arrays for curriculum and KPI lookups
- O(1) source maps for deep-dive capability analysis
- Priority-weighted: degraded nodes (health < 70) get priority learning slots

### 2.3 Scoring Buffers
- Reusable scoring buffers prevent allocation churn
- EMA-smoothed performance tracking per node per capability
- Auto-pruning for cold-tier capacity blocks

### 2.4 Real AI Integration
- Learning cycles use NEXUS router for real AI calls
- Model selection optimized for learning task type
- Cost tracking per learning cycle via NEXUS cost ledger

### 2.5 Capacity Configuration
- 600 cycles/day maximum
- 30 cycles/hour maximum
- Debounced state persistence prevents write storms
- Configurable learning window (active hours vs always-on)

---

## 3. Learning Cycle Flow

```
Heartbeat Tick (every 30 min)
    │
    ▼
┌─ Collect Telemetry ──────────────────────┐
│  - Node health scores                     │
│  - Error rates, latency metrics           │
│  - Capability usage patterns              │
└───────────────────────────────────────────┘
    │
    ▼
┌─ Prioritize ─────────────────────────────┐
│  - Degraded nodes first (health < 70)    │
│  - High-traffic capabilities second       │
│  - Batch into groups of 6                 │
└───────────────────────────────────────────┘
    │
    ▼
┌─ Learn ──────────────────────────────────┐
│  - Generate improvement proposals         │
│  - Score proposals (CJPI-style)           │
│  - Route through NEXUS for AI evaluation  │
└───────────────────────────────────────────┘
    │
    ▼
┌─ Apply ──────────────────────────────────┐
│  - Store learnings in MEMORY              │
│  - Update node configuration              │
│  - Emit telemetry                         │
└───────────────────────────────────────────┘
```

---

## 4. Integration Points

| System | Integration |
|--------|-------------|
| **NEXUS** | AI routing for learning evaluations |
| **MEMORY** | Learning storage and retrieval |
| **BRAIN** | Knowledge encoding from learning outputs |
| **NERVE** | Telemetry ingestion |
| **GOVERNANCE** | Learning proposals require governance approval |
| **ADA** | Learning outcomes feed trust calibration |

---

## 5. Performance

| Metric | Value |
|--------|-------|
| Max cycles/day | 600 |
| Max cycles/hour | 30 |
| Batch size | 6 nodes |
| State persistence | Debounced (1s) |
| Memory footprint | Bounded (reusable buffers) |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-23 | System | Ultimate architecture documentation |

---

© 2025–2026 CMPSBL®. Confidential.
