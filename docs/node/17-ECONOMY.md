# ECONOMY — Cost Attribution & Financial Intelligence

> **Node ID:** `economy` · **Sector:** Execution · **Generation:** 1 · **Node #17 of 40**
> **Codename:** *Ledger* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

ECONOMY is the substrate's financial brain. It owns cost tracking, budget enforcement, value attribution, ROI calculation, quota management, and cost anomaly detection. Every AI call, every API request, every compute operation has a cost — ECONOMY ensures those costs are tracked, attributed, and optimized.

---

## Intent Mesh Capabilities

| Capability | Description |
|---|---|
| `economy.actor_value` | Lifetime value and cost attribution per actor |
| `economy.budget_check` | Check if an operation is within budget constraints |
| `economy.cost_forecast` | Forecast costs and identify savings opportunities |
| `economy.quota_status` | Check quota usage and remaining allocation |
| `economy.cost_anomaly_detection` | Detect cost anomalies and spending spikes |

---

## Architecture

### Cost Attribution Model

```
attribute_cost(operation):
  base_cost = operation.tokens × per_token_rate[provider][model]
  complexity_multiplier = operation.complexity_score / 100
  compute_cost = operation.compute_ms × compute_rate_per_ms
  
  total_cost_millicents = (base_cost × complexity_multiplier) + compute_cost
  
  Attribution:
    → developer_id (who triggered it)
    → module (which substrate node)
    → product_code (which product/feature)
    → api_key_id (which access key)
```

### Budget Enforcement

```
budget_check(operation):
  1. Look up developer's subscription tier
  2. Get current period usage from access_quotas
  3. Estimate operation cost
  4. If (current_usage + estimated_cost) > tier.monthly_quota:
     → Reject with "quota_exceeded"
  5. If (current_usage + estimated_cost) > tier.monthly_quota × 0.9:
     → Allow but signal "quota_warning"
  6. Otherwise → Allow
```

### Cost Anomaly Detection

```
detect_anomalies():
  For each developer:
    daily_costs = last 30 days of cost data
    baseline = rolling_mean(daily_costs, window=7)
    stddev = rolling_stddev(daily_costs, window=7)
    
    today_cost = sum of today's costs
    z_score = (today_cost - baseline) / stddev
    
    if z_score > 2.5 → anomaly detected
    if z_score > 4.0 → critical anomaly (auto-throttle)
```

### ROI Calculation

```
calculate_roi(module, period):
  total_cost = sum(access_usage.cost_millicents WHERE module AND period)
  total_value = sum(access_usage.task_value_cents WHERE module AND period)
  
  roi = (total_value - total_cost) / total_cost × 100
  
  Per-capability breakdown:
    For each capability in module:
      capability_roi = capability_value / capability_cost × 100
```

---

## Database Tables

| Table | Purpose |
|---|---|
| `access_usage` | Per-call cost and token tracking |
| `access_quotas` | Daily usage counters per API key |
| `access_subscriptions` | Tier, billing, entitlements |
| `agency_economics` | Aggregate economic metrics per agency |

---

## Trade Secrets

### 1. Millicent Precision

All costs are tracked in millicents (1/1000 of a cent) to prevent rounding errors on high-volume, low-cost operations. Aggregation to display amounts only happens at the presentation layer.

### 2. Predictive Cost Forecasting

ECONOMY uses 7-day rolling averages to project end-of-period costs. When projected costs exceed 80% of budget with 50%+ of the period remaining, it signals a "budget_overrun_likely" warning to the developer.

### 3. Cross-Module Cost Allocation

When CORTEX orchestrates a multi-module workflow, ECONOMY attributes costs to the originating module and the executing modules separately. This dual attribution enables both "who asked for it" and "who did the work" analysis.

---

## CLM Learning Priorities

1. **Cost Optimization Patterns** — Learning which model/provider combinations offer the best cost-performance ratio per task type
2. **Anomaly Detection Sensitivity** — Tuning z-score thresholds based on developer usage patterns

---

*CMPSBL® Substrate — ECONOMY Node Deep Dive · Founder Eyes Only*
