# OBSERVER — Watchdog Monitoring & Telemetry Aggregation

> **Node ID:** `observer` · **Sector:** Shell · **Generation:** 2 · **Node #41 (Auxiliary)**
> **Codename:** *Sentinel Eye* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

OBSERVER is the substrate's watchdog and telemetry aggregation node. It owns system-wide health monitoring, anomaly detection, alert lifecycle management, and telemetry ingestion. OBSERVER continuously sweeps all 40 primary nodes, ingests telemetry snapshots, detects anomalies via Z-score analysis, and manages a tiered alert escalation pipeline.

---

## Capabilities

| Capability | Description |
|---|---|
| `watchdogReport` | Run a full watchdog sweep across all nodes |
| `telemetrySummary` | Retrieve aggregated telemetry summary (global or per-module) |
| `ingestTelemetry` | Ingest a telemetry snapshot from any node |
| `registerAlert` | Register a new alert condition with threshold and severity |
| `silenceAlert` | Temporarily silence an alert for a given duration |
| `acknowledgeEscalation` | Acknowledge an escalated alert to prevent further escalation |
| `runSweep` | Manually trigger a watchdog sweep on demand |
| `getModuleSummary` | Retrieve telemetry summary scoped to a specific module |

---

## Architecture

### Telemetry Pipeline

```
┌─────────────────────────────────────────────────────────┐
│               OBSERVER Telemetry Pipeline                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐     ┌─────────────┐     ┌───────────┐  │
│  │ Ingestion   │────▶│ Rolling     │────▶│ Anomaly   │  │
│  │ Endpoint    │     │ Buffer      │     │ Detector  │  │
│  │             │     │ (500 max)   │     │ (Z-score) │  │
│  └─────────────┘     └─────────────┘     └───────────┘  │
│                                                │         │
│                                                ▼         │
│                      ┌─────────────┐     ┌───────────┐  │
│                      │ Alert       │◀────│ Escalation│  │
│                      │ Registry    │     │ Engine    │  │
│                      └─────────────┘     └───────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Telemetry Snapshot Model

```typescript
interface TelemetrySnapshot {
  module: string;
  timestamp: number;
  metrics: Record<string, number>;
  tags?: string[];
}
```

### Alert Condition Model

```typescript
interface AlertCondition {
  id: string;
  name: string;
  module: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  severity: 'info' | 'warning' | 'critical';
  triggerCount: number;
  lastTriggeredAt: number | null;
  silencedUntil?: number;
}
```

### Anomaly Detection

```
detectAnomalies(buffer):
  1. For each metric across recent snapshots:
     - Compute rolling mean (μ) and standard deviation (σ)
     - Calculate Z-score: Z = |x - μ| / σ
  2. If Z > 2.0 → flag as anomaly
  3. If Z > 3.0 → flag as critical anomaly, trigger alert
  4. Anomalies are correlated with alert conditions for automatic escalation
```

### Watchdog Sweep

```
runWatchdogSweep():
  1. Query health endpoint for each of the 40 primary nodes
  2. Classify each node: healthy | degraded | unhealthy | offline
  3. Compute per-module health score from recent telemetry
  4. Check all registered alert conditions against current metrics
  5. Escalate any triggered alerts that have not been acknowledged
  6. Return: WatchdogReport with node statuses, anomalies, and alerts
```

---

## Trade Secrets

### 1. Rolling Buffer with Z-Score Detection

OBSERVER maintains a rolling buffer of 500 telemetry snapshots per module. Z-score anomaly detection (threshold > 2.0) runs against this buffer, providing statistically grounded anomaly detection without requiring a large data warehouse. The 500-entry window balances sensitivity against false-positive rate.

### 2. Alert Escalation Ladder

Alerts follow a tiered escalation:
1. **Info** — Logged, available in dashboard
2. **Warning** — Notification emitted to mesh
3. **Critical** — Escalation to GOVERNANCE + CORTEX for intervention

Unacknowledged critical alerts re-escalate every 5 minutes to prevent alert fatigue from causing missed incidents.

### 3. Module-Scoped Summaries

Telemetry can be queried globally (all modules) or scoped to a specific module. Module-scoped summaries are computed on-demand from the rolling buffer, enabling fast drill-down without pre-aggregation overhead.

### 4. Silence Window

Alert silencing uses a time-bounded window (silencedUntil timestamp). When silenced, alerts still log triggers but suppress escalation. This prevents noisy alerts during planned maintenance while preserving the audit trail.

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `node_offline` | Any node unreachable during sweep | Critical |
| `anomaly_spike` | ≥ 5 anomalies in 10-minute window | High |
| `alert_fatigue` | ≥ 10 triggered alerts in 1 hour | Medium |
| `stale_telemetry` | Module not reporting for > 5 minutes | Medium |
| `escalation_unack` | Critical alert unacknowledged > 15 minutes | Critical |

---

## CLM Learning Priorities

1. **Anomaly Threshold Tuning** — Adjusting Z-score thresholds per module based on historical volatility
2. **Alert Correlation** — Learning which alerts frequently co-occur and should be grouped

---

*CMPSBL® Substrate — OBSERVER Node Deep Dive · Founder Eyes Only*
