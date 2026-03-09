# COMPASS — Spatial-Temporal Reasoning & Forecasting

> **Node ID:** `compass` · **Sector:** EPZ (Expansion Perception Zone) · **Generation:** 1 · **Node #26 of 40**
> **Codename:** *Navigator* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

COMPASS owns spatial-temporal reasoning — distance calculation, route optimization, time-series forecasting, and temporal pattern detection. It provides the substrate with a sense of "where" and "when," enabling location-aware decisions and predictive temporal analysis.

---

## Capabilities

| Capability | Description |
|---|---|
| `calculateDistance` | Geo-distance between two points (Haversine) |
| `optimizeRoute` | Multi-waypoint route optimization |
| `forecastTimeSeries` | Time-series forecasting with confidence intervals |
| `detectPatterns` | Temporal pattern detection (seasonality, trends, anomalies) |

---

## Architecture

### Route Optimization

```
optimizeRoute(waypoints[]):
  1. Calculate distance matrix (all pairs)
  2. Apply nearest-neighbor heuristic for initial path
  3. Optimize with 2-opt improvement:
     While improvements found:
       For each pair of edges:
         If swapping reduces total distance → swap
  4. Calculate efficiency = optimal_distance / actual_distance
  5. Store route (ring buffer, 200 max)
```

### Time-Series Forecasting

```
forecastTimeSeries(data, horizon):
  1. Decompose: trend + seasonality + residual
  2. Extrapolate trend using linear regression
  3. Project seasonal component forward
  4. Generate predictions with decaying confidence:
     confidence[t] = base_confidence × decay^t
  5. Return: predictions[] with timestamp + value + confidence
```

### Temporal Pattern Detection

```
detectPatterns(data):
  Patterns detected:
    - Seasonality (daily, weekly, monthly cycles)
    - Trend (increasing, decreasing, stable)
    - Anomaly (z-score > 3.0 from moving average)
    - Changepoint (structural shift in distribution)
  
  Each pattern: { type, confidence, startIndex, endIndex, metadata }
```

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `efficiency_drop` | Avg route efficiency < 60% | Medium/High |
| `accuracy_decline` | Avg forecast accuracy < 70% | Medium/High |
| `pattern_stale` | Patterns with < 30% confidence | Low |
| `forecast_divergence` | ≥ 3 recent forecasts with low tail confidence | Medium |
| `capacity_warning` | Route store ≥ 180/200 | Low |

---

## Trade Secrets

### 1. Decaying Confidence

Forecast confidence decays exponentially with prediction horizon. This honestly represents increasing uncertainty — a 1-hour forecast at 95% confidence vs. a 1-week forecast at 40% confidence. Consumers of COMPASS predictions always know how much to trust them.

### 2. 2-Opt Route Improvement

The initial nearest-neighbor solution is typically 20-30% suboptimal. The 2-opt improvement phase iteratively swaps edge pairs, converging on a locally optimal solution that's typically within 5% of the global optimum — adequate for real-time routing.

### 3. Pattern Confidence Feedback

Low-confidence patterns aren't deleted — they're flagged by the CLM as "stale." This allows COMPASS to maintain weak signals that may strengthen with more data, rather than prematurely discarding potentially valuable patterns.

---

## CLM Learning Priorities

1. **Forecast Model Selection** — Learning which decomposition method works best for each data characteristic
2. **Route Heuristic Improvement** — Improving initial heuristic quality to reduce optimization iterations

---

*CMPSBL® Substrate — COMPASS Node Deep Dive · Founder Eyes Only*
