# Matrix Resilience Suite — CMPSBL v11.1 (Internal)

## Classification: Internal Technical Reference

---

## Overview

The Matrix Resilience Suite is a collection of 10 purpose-built engines that provide enterprise-grade fault tolerance, observability, and self-healing for the 24-node Matrix architecture. This document covers internal implementation details not disclosed in public documentation.

---

## Engine Implementation Details

### 1. NODE CANARY (`src/lib/substrate/node-canary/`)

**Purpose**: Staged rollout controller with automatic rollback.

- Rollout curve: 5% → 25% → 50% → 100%
- Each stage runs for a configurable observation window (default: 60s)
- Health gate compares node health before/after stage advancement
- Rollback triggers on any health regression exceeding 5% threshold
- State stored in-memory via `canaryDeployments` Map

**Key functions**: `startCanary()`, `advanceCanary()`, `rollbackCanary()`, `getCanaryStatus()`

### 2. PRIORITY QUEUE (`src/lib/substrate/priority-queue/`)

**Purpose**: Weighted task scheduling with sector-aware preemption.

- Weight mapping: CORE=1.0, CCR=0.8, CCL=0.6, Execution=0.4, Overlay=0.2
- CORE/CCR tasks can preempt running Execution/Overlay tasks
- Queue depth limit: 1000 items (configurable)
- Starvation prevention: lower-priority tasks get age-based boost after 30s

**Key functions**: `enqueue()`, `dequeue()`, `peek()`, `getQueueStats()`

### 3. SECTOR KILL SWITCH (`src/lib/substrate/sector-killswitch/`)

**Purpose**: Emergency sector isolation.

- Drain timeout: 5s before hard disconnect
- Affected nodes enter `isolated` state in the Matrix Node Registry
- Re-activation requires explicit `reactivateSector()` call
- All isolation events logged to Immutable Incidents

**Key functions**: `killSector()`, `reactivateSector()`, `getKilledSectors()`

### 4. REDUNDANT NODES (`src/lib/substrate/redundant-nodes/`)

**Purpose**: Hot-standby pairs for critical nodes.

- Default pairs: BRAIN↔BRAIN-STANDBY, SYSTEM↔SYSTEM-STANDBY, CORE↔CORE-STANDBY
- State sync interval: every health check cycle
- Failover trigger: primary health drops below 0.3
- Failover is atomic — no split-brain possible due to single-writer model

**Key functions**: `registerPair()`, `triggerFailover()`, `getPairStatus()`

### 5. CHAOS TESTING (`src/lib/substrate/chaos-testing/`)

**Purpose**: Controlled fault injection for resilience validation.

- Injection types: `latency` (adds delay), `crash` (forces node restart), `resource` (memory pressure)
- Each test generates a `ChaosResult` with recovery time and cascade depth
- Tests are non-destructive in production (simulation mode by default)
- Results feed into Anomaly Forecasting for calibration

**Key functions**: `injectFault()`, `getChaosHistory()`, `runChaosScenario()`

### 6. CROSS-SECTOR CORRELATION (`src/lib/substrate/cross-sector-correlation/`)

**Purpose**: Detect correlated failures across sector boundaries.

- Sliding window: 5 minutes of health samples
- Correlation threshold: 0.7 (Pearson coefficient)
- When correlated degradation detected, emits `correlation_alert` event
- Feeds into Kill Switch for automated isolation recommendations

**Key functions**: `analyzeCorrelation()`, `getCorrelationEvents()`, `getActiveCascades()`

### 7. HEALTH HEATMAP (`src/lib/substrate/health-heatmap/`)

**Purpose**: 24-hour temporal health tracking.

- Resolution: 5-minute buckets (288 per 24h window)
- Tracks all 24 Matrix Nodes simultaneously
- Heatmap data structure: `Map<nodeId, HealthBucket[]>`
- Used by dashboard for temporal density visualization

**Key functions**: `recordHealth()`, `getHeatmapData()`, `getNodeTimeline()`

### 8. ANOMALY FORECASTING (`src/lib/substrate/anomaly-forecasting/`)

**Purpose**: Predictive failure analysis.

- Algorithm: Linear regression on rolling 1-hour health window
- Forecast horizon: 30 minutes ahead
- Alert threshold: predicted health < 0.5
- Confidence score based on R² of regression fit

**Key functions**: `forecastNode()`, `forecastAllNodes()`, `getActiveForecasts()`

### 9. QUORUM HEALING (`src/lib/substrate/quorum-healing/`)

**Purpose**: Consensus-based autonomous healing.

- Quorum requirement: 3 independent signals must agree (health, forecast, correlation)
- Prevents false-positive healing loops from single-signal triggers
- Healing actions: restart node, failover to standby, isolate sector
- All decisions logged with full signal attribution

**Key functions**: `proposeHealing()`, `evaluateQuorum()`, `getHealingHistory()`

### 10. IMMUTABLE INCIDENTS (`src/lib/substrate/immutable-incidents/`)

**Purpose**: Append-only post-mortem records.

- Records are sealed on creation — no updates or deletes
- Each incident contains: timestamp, affected nodes, severity, root cause, resolution, duration
- Incident IDs are sequential and gapless
- Retention: indefinite (in-memory buffer + optional DB persistence)

**Key functions**: `createIncident()`, `getIncident()`, `listIncidents()`, `getIncidentStats()`

---

## Unified Hook: `useMatrixResilience`

Located at `src/hooks/substrate/useMatrixResilience.ts`, this hook initializes all 10 engines and returns their public APIs as a single destructurable object. It is the primary integration point for React components.

---

## Terminal Integration

14 commands registered in `TerminalExecutor.ts` under the `matrix.*` namespace:
- `matrix.canary`, `matrix.queue`, `matrix.killswitch`, `matrix.redundant`
- `matrix.chaos`, `matrix.correlation`, `matrix.heatmap`, `matrix.forecast`
- `matrix.quorum`, `matrix.incidents`
- `matrix.status` (unified overview)
- `matrix.resilience` (suite health summary)

---

## Dependencies

- Matrix Node Registry (read-only)
- Evolve Telemetry (`emitEvolveEvent`)
- Circuit Breaker infrastructure
- Substrate Health Engine

---

## Security Considerations

- Kill Switch requires elevated authorization in production
- Chaos Testing locked to simulation mode unless explicitly overridden
- Incident records are cryptographically tamper-evident
- All healing decisions auditable through Quorum logs

---

*Internal Document — CMPSBL v11.1 — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
