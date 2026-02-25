# Telemetry & Observability — CMPSBL v11.1

## Classification: Technical Reference

---

## Overview

The CMPSBL substrate produces continuous telemetry across all 24 Matrix Nodes. This document describes the three-layer observability stack: **GOAL** (truth layer), **HAE** (attribution engine), and **VISION** (presentation surface).

---

## Layer 1: GOAL — Global Observability Access Layer

GOAL is the substrate's truth system. It is the sole authority for health values, integrity scores, and system state.

### Components

| Component | Purpose | Frequency |
|-----------|---------|-----------|
| Snapshot Engine | Captures system-wide state | Every 10 minutes |
| Integrity Validator | Detects numeric conflicts between zones | On every health update |
| Event Store | Append-only immutable log | Continuous |
| Metric Aggregator | Rolls up per-node metrics to sector/global | On snapshot |

### Snapshot Schema

```typescript
interface GOALSnapshot {
  id: string;                    // UUID v4
  timestamp: number;             // Unix ms
  matrixIntegrity: number;       // 0–100 weighted score
  structuralIntegrity: number;   // 0–100 composite
  sectorHealth: {
    core: number;
    ccr: number;
    ccl: number;
    execution: number;
    overlay: number;
  };
  nodeStates: Map<string, {
    health: number;
    breakerState: BreakerState;
    failureCount: number;
    lastRecovery: number | null;
  }>;
  anomalies: AnomalyRecord[];
  correlationId: string;
}
```

### Integrity Validation Rules

1. **Weight sum invariant**: Σ(node.weight) must equal 1.000 ± 0.001
2. **Health range invariant**: Every node health ∈ [0, 100]
3. **Breaker-health consistency**: open breaker → health must be 0
4. **Sector aggregation consistency**: sector score must equal mean of member nodes
5. **Monotonic snapshot IDs**: snapshot timestamps must be strictly increasing

---

## Layer 2: HAE — Health Attribution Engine

HAE answers the question: **"Why did health change?"**

### Attribution Algorithm

When a health change exceeds the significance threshold (Δ > 2%):

1. **Identify changed nodes**: Compare current snapshot to previous
2. **Rank by weighted impact**: `impact = Δhealth × node.weight`
3. **Correlate with events**: Match health changes to events within ±30s window
4. **Generate attribution report**: Ordered list of (node, cause, impact)

### Attribution Categories

| Category | Description |
|----------|-------------|
| `breaker_trip` | Circuit breaker state change caused health drop |
| `recovery` | Node recovered from degraded state |
| `evolution` | EVOLUTION overlay applied a change |
| `external` | External dependency failure propagated |
| `chaos` | Chaos testing injection (expected) |
| `unknown` | No correlated event found |

### Dashboard Integration

HAE feeds directly into the Matrix Integrity Map:
- Top attribution displayed as "Primary cause" badge
- Full attribution chain available on node drill-down
- Historical attributions viewable in timeline mode

---

## Layer 3: VISION — Observability Surface

VISION is the Execution-tier node responsible for presenting telemetry data to operators and dashboards.

### Capabilities

| Capability | Detail |
|-----------|--------|
| Health aggregation | Real-time rollup of all 24 nodes |
| Metric visualization | Time-series charts, heatmaps, sparklines |
| Audit trail rendering | Searchable, filterable event history |
| Alert management | Threshold-based alerting with escalation |
| Export | Snapshot export as JSON for external analysis |

### Metric Types

```typescript
type MetricType =
  | 'gauge'      // Point-in-time value (e.g., health percentage)
  | 'counter'    // Monotonically increasing (e.g., request count)
  | 'histogram'  // Distribution (e.g., response time buckets)
  | 'summary'    // Percentile-based (e.g., p50/p95/p99 latency)
```

### Retention Policy

| Tier | Resolution | Retention |
|------|-----------|-----------|
| Real-time | 1-second | 5 minutes |
| Short-term | 1-minute | 1 hour |
| Medium-term | 5-minute | 24 hours |
| Long-term | 1-hour | 30 days |

Data is automatically downsampled as it ages through tiers.

---

## Telemetry Pipeline

```
Node Health Change
  → RIPPLE (event emission)
  → GOAL Snapshot Engine (state capture)
  → HAE (attribution analysis)
  → VISION (dashboard update)
  → AUDIT (compliance record)
```

Every step in this pipeline is:
- **Asynchronous**: No step blocks the originating node
- **Idempotent**: Duplicate events produce identical results
- **Bounded**: Buffer sizes are capped at every stage
- **Auditable**: Full correlation ID chain from origin to dashboard

---

## Key Metrics

### System-Level

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `matrix.integrity` | Weighted node health | < 40 → CRITICAL |
| `matrix.structural` | Breaker + weight coherence | < 70 → WARN |
| `matrix.open_breakers` | Count of open circuit breakers | > 3 → CRITICAL |
| `matrix.recovery_rate` | Successful recoveries / total failures | < 0.5 → WARN |

### Per-Node

| Metric | Description |
|--------|-------------|
| `node.health` | Current health (0–100) |
| `node.breaker_state` | Circuit breaker state |
| `node.failure_count` | Failures in current window |
| `node.last_recovery` | Timestamp of last recovery |
| `node.uptime_pct` | Percentage uptime over 24h |

---

*Technical Reference — CMPSBL v11.1 — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
