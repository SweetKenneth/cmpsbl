# VISION — Observability & Telemetry Node

## Purpose
VISION provides observability, telemetry aggregation, metric dashboards, anomaly forecasting, health trend analysis, SLA monitoring, capacity planning, and **scanner-correlated debt targeting** for the technical debt elimination pipeline.

## Namespace
`vision.*`

## Command Examples
```
vision.dashboard            # Observability dashboard summary
vision.metrics <node>       # Metrics for specific node
vision.alerts               # Active alerts
vision.trends               # Health trend analysis
vision.sla                  # SLA compliance report
vision.forecast             # Anomaly forecast
vision.scan.correlate       # Performance-debt correlation report
vision.scan.hotspots        # Error hotspot map
vision.scan.regression <id> # Post-fix regression gate result
```

## Response Shape
```typescript
interface VisionDashboard {
  success: boolean;
  nodes: { id: string; health: number; latency: number }[];
  alerts: Alert[];
  slaCompliance: number;
  forecastedIssues: Forecast[];
}
```

## Scanner Integration Capabilities

### (#18) Performance-Correlated Debt
Cross-references live performance/error metrics with scanner findings to prioritize debt that causes real user pain.

**Impact Score Formula:**
```
impactScore = (latencyFactor × 0.4) + (errorFactor × 0.4) + (trafficFactor × 0.2)
```
Where:
- `latencyFactor` = min(1, p95LatencyMs / 5000)
- `errorFactor` = min(1, errorRate × 10)
- `trafficFactor` = min(1, rpm / 100)

**Outputs:**
- `PerformanceCorrelation[]` — per-finding impact scores with targeted recommendations
- `hotPaths[]` — endpoints with p95 > 1000ms or errorRate > 5%
- Severity tiers: CRITICAL (>0.8), HIGH (>0.5), MEDIUM (>0.3), LOW

**Key Functions:**
- `correlatePerformanceDebt(visionMetrics, scanFindings)` → sorted correlation report

### (#19) Error Hotspot Mapping
Aggregates error logs by path/module, identifies top offenders, and boosts scanner finding priority when findings overlap with active hotspots.

**Severity Classification:**
| Error Count | Severity |
|---|---|
| >100 | critical |
| >50 | high |
| >10 | medium |
| ≤10 | low |

**Priority Boost Values:**
| Hotspot Severity | Finding Priority Boost |
|---|---|
| critical | +40 |
| high | +25 |
| medium | +10 |
| low | +5 |

**Coverage Gap Detection:** Paths with >5 errors but zero scanner findings are flagged as coverage gaps — areas the scanner should expand into.

**Key Functions:**
- `mapErrorHotspots(errorLogs, scanFindings)` → hotspot map with coverage gaps
- `reprioritizeByErrors(findings, hotspotMap)` → reprioritized finding list

### (#22) Regression Detection Loop
Post-fix metrics gate: after a scanner fix is applied, monitors VISION metrics to confirm improvement (not regression).

**Verdict Logic:**
| Condition | Verdict | Pass? |
|---|---|---|
| errorRate↓ >1% AND latency↓ | `improved` | ✅ |
| |errorRate Δ| ≤1% AND |latency Δ| ≤50ms | `stable` | ✅ |
| errorRate↑ >5% OR latency↑ >200ms | `regressed` | ❌ |
| <2 snapshots | `insufficient_data` | ❌ |

Regression detection integrates with the EVOLUTION module's `detectRegression()` for delta-point analysis.

**Key Functions:**
- `evaluateFixEffectiveness(preFix, postFix)` → verdict + recommendation
- `createRegressionMonitor(findingId, fixId, windowMs)` → monitoring session with snapshot collector
- `batchEvaluateFixes(fixResults[])` → pass rate, regression count, summary

### (#41) Resource Profiling
Profiles CPU, memory, and network waste caused by technical debt, translating abstract findings into concrete resource costs.

**Waste Grade Scale:**
| Monthly Cost | Grade |
|---|---|
| ≤10¢ | A |
| ≤50¢ | B |
| ≤$2 | C |
| ≤$5 | D |
| >$5 | F |

**Category Impact Baselines:**
| Category | CPU (ms) | Memory (MB) | Network (KB) |
|---|---|---|---|
| performance | 50 | 10 | 20 |
| complexity | 30 | 5 | 0 |
| dead_code | 5 | 15 | 10 |
| accessibility | 2 | 1 | 5 |

**Key Functions:**
- `profileResourceWaste(findings, metrics?)` → `ResourceProfilingReport` with worst offenders, estimated monthly savings, and grade distribution

## Core Capabilities
| Capability | Description |
|---|---|
| Metric Ingestion | Collects latency, error rate, RPM from all endpoints |
| Alert Management | Consolidation, priority ranking, fatigue prevention |
| SLA Monitoring | Compliance tracking against defined targets |
| Anomaly Forecasting | Predictive model for future issues |
| Health Trends | Historical trend analysis per node |
| Capacity Planning | Resource utilization projections |
| Debt Correlation | Maps telemetry signals to scanner findings |
| Hotspot Detection | Identifies highest-error code paths |
| Regression Gating | Blocks promotion of fixes that cause regressions |
| Resource Profiling | Quantifies CPU/memory/network waste per finding |

## Failure Modes
- **Metric ingestion lag**: Telemetry data delayed → stale dashboard with warning indicator
- **Alert fatigue**: Too many alerts firing → automatic alert consolidation and priority ranking
- **Forecast miss**: Predicted anomaly does not materialize → model recalibration
- **Regression false positive**: Fix marked regressed due to unrelated spike → manual override with audit trail

## Governance Implications
- VISION is read-only by default — it observes but does not mutate system state
- Alert-triggered actions (auto-remediation) require governance approval
- SLA violations are escalated to GOVERNANCE plane automatically
- Regression gate verdicts are persisted as evolution receipts
- Error hotspot data feeds back into scan priority rankings
