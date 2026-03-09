# NEXUS — AI Provider Router & Model Intelligence

> **Node ID:** `nexus` · **Sector:** Execution · **Generation:** 1 · **Node #16 of 40**
> **Codename:** *Oracle* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

NEXUS is the substrate's AI routing engine — the single gateway through which all AI model requests flow. It owns provider health monitoring, optimal model selection, load balancing, failover routing, cost optimization, and provider failure prediction. NEXUS abstracts away provider-specific APIs, presenting a unified interface to all substrate nodes.

---

## Intent Mesh Capabilities

| Capability | Description |
|---|---|
| `nexus.provider_health` | Get health and reliability metrics for AI providers |
| `nexus.optimal_routing` | Determine optimal model/provider for a given task |
| `nexus.provider_failure_prediction` | Predict provider outages before they impact routing |

---

## Architecture

### Provider Registry

NEXUS maintains a live registry of AI providers with health metrics:

```typescript
interface ProviderState {
  id: string;                // e.g., 'openai', 'google'
  models: ModelConfig[];     // Available models
  health: number;            // 0-100 composite health
  latencyP50: number;        // Median latency (ms)
  latencyP95: number;        // 95th percentile latency
  errorRate: number;         // Recent error rate (0-1)
  quotaRemaining: number;    // Remaining daily quota
  costPerToken: number;      // Cost in millicents
  lastChecked: number;       // Timestamp
}
```

### Optimal Routing Algorithm

```
optimal_route(task):
  1. Filter providers by capability (supports required model family)
  2. Filter by quota (remaining > estimated tokens)
  3. Score each provider:
     score = (health × 0.35)
           + ((1 - errorRate) × 0.25)
           + (latencyScore × 0.20)
           + (costEfficiency × 0.20)
  4. Apply priority boost for task.priority === 'critical'
  5. Select highest scoring provider
  6. If primary fails → automatic failover to second-ranked
```

### Failover Chain

```
failover(request, failedProvider):
  1. Mark failedProvider circuit as FAILED
  2. Select next provider from sorted candidates
  3. If no candidates → queue to DLQ with retry backoff
  4. Log routing decision to AUDIT
```

### Provider Failure Prediction

```
predict_failure(provider):
  1. Collect last 100 request outcomes
  2. Calculate rolling error rate over 5-minute windows
  3. Detect trend: if error rate increasing over 3 consecutive windows
  4. If trend detected AND current error rate > 5%:
     → Signal "degradation_predicted" to CORTEX
     → Pre-warm alternative providers
     → Gradually shift traffic (10% → 30% → 50% → 100%)
```

---

## Trade Secrets

### 1. Multi-Axis Scoring

Provider selection is never based on a single metric. The 4-axis score (health, reliability, latency, cost) ensures that a fast-but-unreliable provider doesn't win over a slightly slower but rock-solid alternative.

### 2. Gradual Traffic Shifting

When failure prediction triggers, NEXUS doesn't hard-cut traffic. It gradually shifts: 10% → 30% → 50% → 100%. This prevents thundering-herd problems on the failover provider and allows the primary to recover without total traffic loss.

### 3. Cost Attribution Pipeline

Every model call is tagged with the requesting module and task type. This feeds into ECONOMY for per-module cost attribution, enabling precise budget tracking and ROI analysis per substrate capability.

### 4. Model-Task Matching

NEXUS maintains a capability matrix mapping task types to optimal models:
- Complex reasoning → `gpt-5`, `gemini-2.5-pro`
- Fast classification → `gpt-5-nano`, `gemini-2.5-flash-lite`
- Code generation → `gpt-5`, `gemini-2.5-flash`
- Image analysis → `gemini-2.5-pro`, `gemini-2.5-flash`

---

## CLM Learning Priorities

1. **Provider Reliability Modeling** — Learning long-term reliability patterns per provider/model
2. **Cost-Performance Optimization** — Finding the cost-performance frontier for each task type

---

*CMPSBL® Substrate — NEXUS Node Deep Dive · Founder Eyes Only*
