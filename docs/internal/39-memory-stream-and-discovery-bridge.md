# 39 — Memory Stream & Discovery Bridge

**Classification:** 🔒 INTERNAL — Trade Secret  
**Version:** v14.2.0 — MINDGAMES Epoch

---

## 1. Purpose

This document describes the Memory Stream — the substrate's real-time discovery observation layer — and the Discovery–Learning Bridge that feeds accepted discoveries back into the cognitive knowledge base. Together, these systems close the loop between autonomous capability discovery and persistent substrate intelligence.

## 2. Memory Stream Architecture

### 2.1 Overview

The Memory Stream is not a database table — it is an **event-driven observation pipeline** that monitors all substrate activity and surfaces high-value behavioral signals for the Discovery Engine to evaluate.

```
System Activity (40-primitive matrix)
       ↓
  RIPPLE Event Bus
       ↓
  Memory Stream Observer
       ↓
  Salience Scoring
       ↓
  Discovery Engine Trigger
       ↓
  CJPI Evaluation → Tier Assignment → Vault Promotion
```

### 2.2 Signal Sources

The Memory Stream ingests signals from all 12 canonical sectors:

| Category | Signal Types |
|--------|-------------|
| Kernel (SPINE) | Boot events, health pulses, integrity changes |
| CCR | Knowledge crystallization, embedding drift, memory tier moves |
| OCG | Event bus patterns, access anomalies, audit trail events |
| Execution (EXE) | DECODE/ENCODE chain completions, VISION analysis results |
| ESZ | FORGE outputs, LINGUA translations, HARVEST ingestions |
| EPZ | ORACLE predictions, CONSCIENCE bias detections |
| EMZ | TREATY negotiations, COMPASS navigations, ECHO feedback loops |
| CSZ | REFLEX reactions, SOVEREIGN decisions |
| Fields | EVOLUTION mutations, SHADOW verifications, PHANTOM anonymizations |
| Plane | GOVERNANCE mode changes, INTENT mesh resolutions |
| Atlas | ATLAS governance events, capability registry changes |
| Shell | DEFENSE perimeter events, IMMUNITY adaptive responses |

### 2.3 Salience Scoring

Each incoming signal receives a salience score before being forwarded to the Discovery Engine:

```
salience = (signal_novelty × 0.35) +
           (cross_sector_flag × 0.25) +
           (temporal_density × 0.20) +
           (anomaly_score × 0.20)
```

| Factor | Description |
|--------|-------------|
| `signal_novelty` | How different this signal is from the last 500 in the ring buffer |
| `cross_sector_flag` | Boolean — does this signal span multiple sectors? (1.0 if yes) |
| `temporal_density` | Burst detection — are many signals arriving in rapid succession? |
| `anomaly_score` | Standard deviation from the rolling 1-hour signal baseline |

**Thresholds:**
- Salience ≥ 0.70 → Immediate discovery evaluation
- Salience 0.40–0.69 → Queued for batch evaluation
- Salience < 0.40 → Logged only (no discovery trigger)

### 2.4 Ring Buffer

The Memory Stream maintains a **500-entry ring buffer** of recent system activity:
- Oldest entries are evicted when capacity is reached
- Buffer is used for novelty computation and temporal density analysis
- Buffer contents are never persisted — they exist only in runtime memory
- On substrate restart, the buffer is empty (cold start) and fills within ~5 minutes of normal operation

## 3. Discovery Bridge

### 3.1 Purpose

The Discovery Bridge (`src/lib/discovery/learning-bridge.ts`) automatically feeds **accepted** discoveries into the substrate's knowledge base without altering exported artifacts.

### 3.2 Bridge Process

```
Discovery Accepted (CJPI scored, tier assigned)
       ↓
  Learning Domain Classification
       ↓
  submitLearning() → MEMORY module (HOT tier)
       ↓
  [If CJPI ≥ 85] contributeRule() → Evolution Mesh
       ↓
  [If multi-module] recordSynergyOutcome() → Stability tracking
```

### 3.3 Learning Domain Mapping

Discoveries are classified into five learning domains:

| Domain | Trigger Modules | Example |
|--------|----------------|---------|
| Security | DEFENSE, IMMUNITY, PHANTOM | "Cross-zone threat correlation pipeline" |
| Intelligence | BRAIN, MEMORY, ORACLE | "Predictive knowledge crystallization" |
| Compliance | GOVERNANCE, AUDIT, CONSCIENCE | "Autonomous policy verification chain" |
| Infrastructure | NEXUS, CORTEX, SYSTEM | "Fleet-wide failover orchestration" |
| Synthesis | Any cross-category combination | "DECODE→ORACLE→FORGE creative reasoning" |

### 3.4 High-Value Discovery Handling (CJPI ≥ 85)

Discoveries scoring 85+ receive special treatment:
1. **Synergy Chain Rule** — The module combination is recorded as a proven synergy pattern in the Evolution Mesh, influencing future mutation proposals
2. **Knowledge Crystal** — A distilled summary is crystallized and promoted to the BRAIN's embedding index
3. **Priority Learning** — Submitted to CLM as a high-priority topic for deeper exploration

### 3.5 Retroactive Backfill

The Discovery Mining Console (`/admin/discovery`) provides a "Backfill Learning" action that:
- Iterates all historical discovery runs
- Re-submits accepted discoveries through the bridge
- Ensures the knowledge base reflects all past successful patterns
- Idempotent — duplicate submissions are detected and skipped

## 4. Circuit Breaker Integration

Both the Memory Stream and Discovery Engine are hardened with stateful circuit breakers:

| Parameter | Memory Stream | Discovery Engine |
|-----------|--------------|-----------------|
| Failure threshold | 5 consecutive failures | 5 consecutive failures |
| Reset timeout | 30 seconds | 60 seconds |
| Half-open test | 1 signal | 1 candidate |
| Health score range | 0–100 | 0–100 |
| Auto-heal target | `system.heal` | `system.heal` |

## 5. Resilience Guards

| Guard | Value | Purpose |
|-------|-------|---------|
| Ring buffer cap | 500 entries | Prevents unbounded memory growth |
| Salience evaluation timeout | 50ms | Ensures stream doesn't block RIPPLE |
| Bridge submission timeout | 5s | Prevents learning from stalling discovery |
| Deduplication window | 10,000-entry LRU | Prevents duplicate learning submissions |
| Batch evaluation interval | 60s | Prevents discovery engine overload |

## 6. Telemetry

| Event | Destination | Frequency |
|-------|-------------|-----------|
| `memory_stream.signal_received` | RIPPLE | Every signal |
| `memory_stream.discovery_triggered` | RIPPLE + AUDIT | Per evaluation |
| `discovery_bridge.learning_submitted` | AUDIT | Per accepted discovery |
| `discovery_bridge.synergy_recorded` | AUDIT | Per multi-module discovery |
| `discovery_bridge.backfill_completed` | AUDIT | Per backfill run |

## 7. Integration Points

| System | Role |
|--------|------|
| RIPPLE | Signal ingestion source |
| Discovery Engine (doc 21) | Consumes high-salience signals |
| MEMORY | Receives learning submissions |
| Evolution Mesh | Receives synergy chain rules |
| CLM (doc 27) | Receives priority learning topics |
| BRAIN | Receives knowledge crystals |
| AUDIT | All bridge activity logged |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | Initial Memory Stream & Discovery Bridge — v14.2.0 |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
