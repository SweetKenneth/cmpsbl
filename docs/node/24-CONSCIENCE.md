# CONSCIENCE — Ethical Reasoning & Bias Detection

> **Node ID:** `conscience` · **Sector:** ESZ (Expansion Sovereignty Zone) · **Generation:** 1 · **Node #24 of 40**
> **Codename:** *Arbiter* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

CONSCIENCE is the substrate's ethical guardian. It owns ethical evaluation of proposed actions, bias detection in outputs, value alignment scoring, and action blocking when ethical thresholds are violated. Every state-changing operation can be routed through CONSCIENCE for an ethical assessment before execution.

---

## Capabilities

| Capability | Description |
|---|---|
| `evaluate` | Ethical evaluation of a proposed action |
| `checkAlignment` | Score alignment between an entity's behavior and stated values |

---

## Architecture

### Ethical Evaluation Engine

```
evaluate(action, context):
  For each active ethical framework:
    1. Score action against framework principles
    2. Run bias detection on action parameters
    3. Check for value misalignment
    4. Aggregate: ethicalScore (0-100)
  
  If ethicalScore < blockThreshold → BLOCK action
  If ethicalScore < warnThreshold → WARN + proceed
  Otherwise → ALLOW
  
  Return: { score, biasFlags[], alignmentDrift, blocked, recommendation }
```

### Bias Detection

Bias types detected:
- **Selection bias** — Systematic exclusion of data subsets
- **Confirmation bias** — Favoring information that confirms existing beliefs
- **Anchoring bias** — Over-reliance on initial information
- **Survivorship bias** — Focusing only on successful outcomes
- **Recency bias** — Overweighting recent events

```
detectBias(output):
  For each bias type:
    Apply pattern matcher specific to bias type
    Score: detected (boolean), confidence (0-1), evidence (string[])
  Return: BiasDetection[]
```

### Value Alignment Scoring

```
checkAlignment(entity):
  1. Retrieve entity's stated values (from configuration)
  2. Analyze recent actions against stated values
  3. Calculate alignment score (0-1)
  4. Track drift over time: drift = |current - baseline|
  5. If drift > 0.15 → flag for review
  6. If drift > 0.30 → escalate to governor
```

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `ethical_degradation` | Avg score < 60% | High/Critical |
| `bias_spike` | ≥ 10 detections in last 30 evals | High/Critical |
| `alignment_drift` | Entity drift > 15% | Medium/High |
| `block_rate_high` | > 20% of actions blocked | High/Critical |
| `evaluation_gap` | No evaluations in > 1 hour | Low |

---

## Trade Secrets

### 1. Block Rate as Health Signal

A block rate exceeding 20% indicates either overly aggressive thresholds or genuinely problematic inputs. The CLM monitors this rate to distinguish between calibration issues (thresholds too tight) and genuine ethical concerns (inputs degrading).

### 2. Alignment Drift Memory

CONSCIENCE maintains historical alignment scores per entity. Drift is calculated against a 30-day rolling baseline, not a fixed reference. This means gradual value evolution is tolerated, but sudden shifts are flagged.

### 3. Framework Composability

Multiple ethical frameworks can be active simultaneously. Scores are aggregated across frameworks, not evaluated independently. An action that passes one framework but violates another still receives a reduced composite score.

---

## CLM Learning Priorities

1. **False Positive Reduction** — Reducing unnecessary blocks by learning from overridden decisions
2. **Drift Baseline Calibration** — Improving drift detection accuracy as entity behavior patterns evolve

---

*CMPSBL® Substrate — CONSCIENCE Node Deep Dive · Founder Eyes Only*
