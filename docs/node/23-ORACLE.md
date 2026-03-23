# ORACLE — Predictive Modeling & Probabilistic Reasoning

> **Node ID:** `oracle` · **Sector:** ESZ (Expansion Sovereignty Zone) · **Generation:** 1 · **Node #23 of 40**
> **Codename:** *Prophet* · **Classification:** FOUNDER EYES ONLY
> **Ultimate Form:** v9.0.0 "Omniscience" · **Systems:** 11

---

## Executive Summary

ORACLE is the substrate's predictive intelligence engine. It owns Bayesian network construction, belief propagation, Monte Carlo simulation, probabilistic prediction, confidence-scored forecasting, causal inference, scenario simulation, capacity planning, early warning convergence, prescriptive recommendations, and self-calibrating prediction markets. ORACLE answers "what will happen?" and "what should we do about it?"

---

## Capabilities

| Capability | Description |
|---|---|
| `createNetwork` | Build a Bayesian network with nodes and causal edges |
| `updateBelief` | Propagate new evidence through a network |
| `runMonteCarlo` | Execute Monte Carlo simulation with configurable iterations |
| `predict` | Generate confidence-scored predictions with expiration |

---

## Architecture

### Bayesian Network Engine

```typescript
interface BayesianNetwork {
  id: string;
  name: string;
  nodes: BayesianNode[];       // Random variables
  edges: CausalEdge[];         // Causal relationships
  lastUpdated: number;
  version: number;
}

interface BayesianNode {
  id: string;
  name: string;
  states: string[];            // Possible states
  prior: number[];             // Prior probability distribution
  posterior: number[];          // Updated after evidence
}
```

### Belief Propagation

```
updateBelief(networkId, evidence):
  1. Locate evidence node in network
  2. Update node's posterior to match evidence
  3. Propagate through causal edges:
     For each downstream node:
       posterior[i] = Σ(parent.posterior × conditional_probability)
  4. Normalize all posteriors to sum to 1.0
  5. Increment network version
```

### Monte Carlo Simulation

```
runMonteCarlo(config):
  iterations: number (default: 10,000)
  convergenceThreshold: 0.001
  
  For each iteration:
    1. Sample from prior distributions
    2. Propagate through causal model
    3. Record outcome
  
  Results:
    - Outcome distribution (histogram)
    - Mean, median, std deviation
    - Confidence intervals (90%, 95%, 99%)
    - Convergence status (converged if variance < threshold)
```

### Prediction System

```
predict(model, inputs):
  1. Run model with inputs
  2. Generate confidence score (0-1)
  3. Set expiration (predictions are time-bounded)
  4. Store in prediction ring buffer (500 max)
  5. Return: prediction, confidence, expiresAt
```

---

## Ultimate Form — v9.0.0 "Omniscience" (11 Systems)

### 1. Bayesian Prediction Network
Multi-variable inference engine with BFS belief propagation through causal DAGs. Prior/posterior update cycles with automatic normalization. Tracks total inferences and network versioning.

### 2. Trend Forecaster (Time-Series)
EMA smoothing, double-exponential smoothing, and linear regression on live telemetry streams. Forecasts at 3 horizons (5min, 1hr, 24hr) with confidence-banded projections. Z-score anomaly detection (threshold: 2.5σ). Autocorrelation-based seasonal pattern detection (daily/weekly).

### 3. Scenario Simulation Engine
Monte Carlo "what-if" analysis with Welford's online variance algorithm for convergence detection. Scenario templates: node_failure, traffic_spike, security_breach, upgrade_rollout, capacity_exhaust. Outputs full probability distributions with p5/p25/p50/p75/p95 percentiles and CI90/CI95/CI99 confidence intervals. 20-bucket histograms. Early termination when variance < 0.001.

### 4. Prescriptive Recommendation Engine
Generates ranked action recommendations with composite scoring (40% ROI + 35% confidence + 15% inverse-risk + 10% priority weight). Full lifecycle: pending → accepted/rejected → executed. Outcome tracking with positive/neutral/negative feedback. Adoption rate analytics. Auto-expiry for stale recommendations.

### 5. Prophecy Journal (Prediction Ledger)
Immutable log of every prediction (5000 max ring buffer). Each prophecy has category, confidence, expiration, and outcome tracking. Brier score calculation for probabilistic accuracy. 10-bucket calibration report: "When ORACLE says 80% confident, is it right 80% of the time?" Category-level accuracy tracking to identify strongest/weakest prediction domains.

### 6. Early Warning System
Multi-signal convergence detection. Ingests weak signals from VISION, DEFENSE, MEDIC, NERVE with strength scores. Fires when 3+ signals from 2+ sources converge in the same category. 4-tier severity: advisory → caution → warning → imminent. Horizon estimation (5min/15min/1hr) based on signal recency. Deduplication window prevents alert fatigue.

### 7. Capacity Planning Oracle
Projects resource exhaustion timelines using linear regression on usage samples. Tracks arbitrary resources (storage, memory, API quotas, etc.) with configurable capacity caps. R²-based confidence scoring. 5-tier urgency: safe → monitor → plan → urgent → critical. Generates plain-language scaling recommendations.

### 8. Causal Inference Engine
Distinguishes correlation from causation using Pearson correlation + Granger causality proxy (lagged correlation). Builds causal DAGs with forward/bidirectional/confounded edge classification. Counterfactual reasoning: "What would have happened if X didn't occur?" Bounded counterfactual journal (500 entries).

### 9. Dynamic Risk Matrix
Real-time risk scoring across all 40 nodes. Risk = Probability × Impact. 5 categories: security, performance, compliance, availability, data_integrity. 5 risk levels: negligible → low → moderate → high → critical. Aggregated snapshots with per-category breakdown and highest-risk-node identification.

### 10. Prediction Market (Internal)
Competing prediction models that bid on outcomes. EMA-adjusted credibility scores (α=0.2). Ensemble predictions weighted by model track record. Auto-retirement when credibility drops below 0.2 after 10+ predictions. Leaderboard ranking by credibility. Best model always wins through competition.

### 11. Oracle Telemetry Nexus
Predictions/hour, accuracy rate, calibration drift, recommendation adoption rate, model credibility, active warnings, risk score, and composite system health. 5000-event ring buffer. Non-blocking, observational-only.

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `low_confidence` | ≥ 5 of last 30 below 40% | Medium/High |
| `convergence_failure` | ≥ 5 of last 20 unconverged | Medium/High |
| `stale_network` | Not updated in > 1 hour | Low |
| `prediction_expiry` | ≥ 20 expired predictions in store | Low |
| `capacity_warning` | Prediction store ≥ 450/500 | Medium |

---

## Trade Secrets

### 1. Time-Bounded Predictions

Every prediction has an `expiresAt` timestamp. Expired predictions are flagged by the CLM for pruning. This prevents stale predictions from being used as current intelligence, which is critical for systems that evolve rapidly.

### 2. Convergence Detection

Monte Carlo simulations track convergence by measuring variance reduction across iteration windows. If variance drops below 0.001 threshold, the simulation terminates early — saving compute without sacrificing accuracy.

### 3. Network Versioning

Every belief update increments the network version. This enables AUDIT to track which version of a model produced a given prediction, providing full provenance for regulatory compliance.

### 4. Brier Score Calibration

The Prophecy Journal computes Brier scores for every resolved prediction and generates 10-bucket calibration reports. This answers the critical question: "When ORACLE says 80% confident, is it actually right 80% of the time?" — the gold standard for probabilistic accuracy.

### 5. Causal vs Correlation Discrimination

The Causal Inference Engine uses lagged correlation (Granger proxy) to distinguish genuine causal relationships from mere statistical correlation. This prevents the substrate from acting on spurious patterns.

### 6. Competitive Model Evolution

The Prediction Market forces models to compete. Models earn credibility through accuracy and lose it through failure. Low-credibility models are automatically retired. This ensures the best prediction model always emerges through natural selection.

---

## CLM Learning Priorities

1. **Prediction Accuracy Tracking** — Comparing predictions against actual outcomes to calibrate confidence scores
2. **Simulation Efficiency** — Learning optimal iteration counts per model complexity level
3. **Causal DAG Refinement** — Strengthening/pruning causal edges based on ongoing evidence
4. **Recommendation Outcome Tracking** — Measuring which recommendations lead to positive outcomes

---

*CMPSBL® Substrate — ORACLE Node Deep Dive · Founder Eyes Only*
