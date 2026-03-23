# SIMULATE — Universal Scenario Simulation Engine

> **Primitive ID:** `simulate` · **Category:** EPZ (Execution Projection Zone) · **Generation:** Ultimate · **Primitive #29 of 40**
> **Codename:** *Crucible Prime* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

SIMULATE v9.0.0 "Crucible Prime" is the substrate's reality forking engine — the unified system that answers "what would happen if…?" across every dimension. It consolidates Monte Carlo simulation, multi-dimensional scenario modeling, digital twin forking, temporal projection, cost forecasting, A/B comparison, blast radius analysis, chaos engineering, prediction accuracy tracking, and simulation telemetry into one authoritative engine.

---

## Architecture Overview

```
Request ("what if…?")
        │
        ▼
[2] Scenario Engine          ← 11 templates, parameter sweeps, composition
        │
   ┌────┴────┐
   ▼         ▼
[1] Monte    [3] Digital
    Carlo        Twin Forker
    Core         (state fork + branch + diff)
   └────┬────┘
        ▼
[4] Temporal Projector       ← Time-series with event injection
        │
   ┌────┴────┐
   ▼         ▼
[5] Cost     [6] A/B
    Resource      Scenario
    Projector     Comparator (Cohen's d + effect size)
   └────┬────┘
        ▼
[7] Blast Radius Projector   ← BFS over 35-edge dependency graph
        │
        ▼
[8] Chaos Scenario Library   ← 10 pre-built scenarios, 6 categories
        │
        ▼
[9] Prediction Accuracy      ← Hebbian model calibration
        │
        ▼
[10] Simulation Telemetry    ← Full audit trail + analytics
```

---

## System 1: Monte Carlo Simulation Core

Production-grade Monte Carlo with:

- **Welford's Online Algorithm** for running variance without storing all values
- **Convergence Detection** via coefficient of variation (CoV < threshold → early termination)
- **Seeded RNG** for full reproducibility (same seed = same results)
- **8 Percentiles**: p5, p10, p25, p50, p75, p90, p95, p99
- **3 Confidence Intervals**: 90%, 95%, 99%
- **25-Bucket Histogram** distribution output
- **Configurable Iterations**: 100 → 100,000 with early stop

---

## System 2: Multi-Dimensional Scenario Engine

- **11 Scenario Templates**: node_failure, traffic_spike, security_breach, upgrade_rollout, capacity_exhaust, data_corruption, cascade_failure, latency_degradation, resource_contention, dependency_outage, custom
- **Composable Scenarios**: Merge multiple templates into compound scenarios
- **Parameter Sweeps**: Run a scenario across a dimension range (10+ steps)
- **Per-Dimension Configuration**: Range, step size, distribution (uniform/normal/exponential)
- **Impact Scoring**: Template-specific impact formulas producing 0-100 scores

---

## System 3: Digital Twin Forker

- **State Forking**: Deep-clone substrate state into isolated simulation contexts
- **Mutation Application**: Apply arbitrary mutations without affecting live state
- **Branching**: Fork an existing fork to explore multiple mutation paths
- **Fork Comparison**: Diff two forks (unique changes, conflicting values, divergence score)
- **Parent-Child Tracking**: Full lineage of fork relationships

---

## System 4: Temporal Simulation Projector

- **Time-Series Projection**: Simulate system evolution across configurable time horizons
- **Event Injection**: Schedule events at specific timestamps (failures, restores, scale changes)
- **6 Event Types**: inject_failure, restore, scale_up, scale_down, config_change, load_change
- **Decay & Recovery Curves**: Per-metric decay during active events, recovery when events expire
- **Peak Degradation Tracking**: Identifies worst metric at worst time
- **Recovery Time Calculation**: Time until all metrics return to ≥90% baseline

---

## System 5: Cost & Resource Projection Engine

- **6 Resource Types**: cpu, memory, storage, api_calls, bandwidth, compute_hours
- **Daily Cost Projection**: Per-resource growth rate × cost per unit × projection days
- **Exhaustion Dates**: When each resource hits capacity
- **Budget Runway Analysis**: Days until total budget is consumed
- **Change Impact Simulation**: Before/after cost comparison with break-even calculation
- **Cost Trend Classification**: stable, linear_growth, exponential_growth, declining

---

## System 6: A/B Scenario Comparator

- **Side-by-Side Comparison**: Two interventions with identical initial conditions
- **Statistical Analysis**: Per-metric mean, stdDev, median for both arms
- **Cohen's d Effect Size**: negligible (<0.2), small (0.2-0.5), medium (0.5-0.8), large (>0.8)
- **Winner Determination**: Per-metric and overall with confidence score
- **Stochastic Noise**: ±5% random variation per iteration for realistic outcomes
- **Recommendation Engine**: A, B, or inconclusive based on metric wins

---

## System 7: Blast Radius Projector

- **35-Edge Dependency Graph**: Real substrate node relationships with coupling weights
- **BFS Propagation**: Breadth-first traversal with cumulative weight decay
- **4 Edge Types**: direct, indirect, data, event
- **Risk Heat Map**: Per-node impact score (0-100)
- **Propagation Paths**: Full path from change source to each affected node
- **Recommendation**: safe, review, dangerous (based on critical component count)

---

## System 8: Chaos Scenario Library

10 pre-built, calibrated chaos scenarios across 6 categories:

| Scenario | Category | Severity |
|----------|----------|----------|
| Single Node Crash | infrastructure | moderate |
| Network Partition | network | major |
| Memory Leak | performance | moderate |
| Silent Data Corruption | data | catastrophic |
| Thundering Herd | performance | major |
| Credential Exposure | security | catastrophic |
| Cascade Failure | infrastructure | catastrophic |
| Clock Skew | infrastructure | moderate |
| Configuration Mistake | human_error | major |
| External Dependency Outage | network | major |

Each scenario includes: injection profile, expected recovery, real-world examples, and calibration timestamp.

---

## System 9: Prediction Accuracy Tracker

- **Prediction Recording**: Store predicted metrics from any simulation
- **Resolution**: Compare predictions against actual outcomes when changes are applied
- **Per-Metric Error Calculation**: Normalized absolute error
- **Model Calibration**: EMA-weighted (α=0.15) accuracy tracking per scenario type
- **Hebbian Learning**: Accurate models strengthened (+0.06), inaccurate weakened (-0.03)
- **Bias Detection**: Tracks systematic over/under prediction per model

---

## System 10: Simulation Telemetry & Audit

- **8 Simulation Types Tracked**: monte_carlo, scenario, temporal, cost, ab_comparison, blast_radius, chaos, fork
- **Full Audit Trail**: Every simulation recorded with parameters, outcomes, compute time
- **Analytics Engine**: By-type breakdown, top requesters, simulations/hour, success rate
- **Peak Compute Tracking**: Identifies resource-intensive simulations
- **2000-Entry Rolling Log**: Persistent audit history

---

## Unified Health Assessment

```
overallHealth = (
  monteCarloConvergenceRate × 0.20 +
  predictionAccuracy × 0.25 +
  abDecisiveRate × 0.20 +
  telemetrySuccessRate × 0.20 +
  chaosLibraryBaseline × 0.15
)
```

---

## Integration Chain

```
ORACLE (predictions) ──→ SIMULATE (validate + calibrate)
ECHO (twin state)    ──→ SIMULATE (fork baseline)
EVOLUTION (proposals) ──→ SIMULATE (blast radius + dry-run)
DEFENSE (threats)    ──→ SIMULATE (chaos scenarios)
ECONOMY (budgets)    ──→ SIMULATE (cost projection)
SHADOW (diff engine) ←── SIMULATE (fork comparison)
NERVE (baselines)    ──→ SIMULATE (calibration data)
CORTEX (orchestration) ──→ SIMULATE (pipeline simulation)
```

---

## Cross-Primitive Data Flow

| Source | Data | Purpose |
|--------|------|---------|
| ORACLE | Predictions, probabilities | Scenario parameters |
| ECHO | Digital twin state | Fork baseline |
| NERVE | Latency/throughput baselines | Calibration |
| EVOLUTION | Proposal diffs | Blast radius input |
| DEFENSE | Threat signatures | Chaos scenario triggers |
| ECONOMY | Cost rates, budgets | Resource projection |
| SHADOW | Diff results | Fork comparison validation |

---

*CMPSBL® Substrate — SIMULATE "Crucible Prime" v9.0.0 · Founder Eyes Only*
