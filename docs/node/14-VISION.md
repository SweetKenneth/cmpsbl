# VISION — Session Analytics & Behavioral Intelligence

> **Node ID:** `vision` · **Sector:** Execution · **Generation:** 1 · **Node #14 of 40**
> **Codename:** *Panopticon* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

VISION is the substrate's behavioral analytics engine. It owns session tracking, login history, anomaly detection, usage analytics, and user journey reconstruction. VISION does not observe content — it observes patterns: when users log in, how long sessions last, what features are adopted, and whether behavioral patterns deviate from established baselines.

---

## Intent Mesh Capabilities

| Capability | Description |
|---|---|
| `vision.last_login` | Get last login details for a user/actor |
| `vision.session_timeline` | Get session activity timeline for anomaly correlation |
| `vision.anomaly_score` | Calculate behavioral anomaly score from session patterns |
| `vision.usage_analytics` | Aggregate usage analytics and feature adoption metrics |
| `vision.user_journey_mapping` | Reconstruct complete user journeys across sessions |

---

## Architecture

### Session Timeline

VISION maintains a per-user timeline of session events:

```
session_timeline(userId):
  1. Query login events → build session start/end pairs
  2. Overlay page navigation events within each session
  3. Calculate session duration, page depth, feature usage
  4. Return ordered timeline with gap detection
```

### Anomaly Scoring

Behavioral anomaly detection uses baseline comparison:

```
anomaly_score(userId):
  baseline = average session metrics over 30-day window
  current = current session metrics
  
  Deviation factors:
    - Session duration vs. baseline mean (weighted 0.3)
    - Login time-of-day vs. usual pattern (weighted 0.2)
    - Feature usage breadth vs. normal (weighted 0.2)
    - Navigation velocity (pages/min) vs. baseline (weighted 0.15)
    - Geographic consistency (weighted 0.15)
  
  anomaly_score = weighted sum of |current - baseline| / stddev
  Score: 0 (normal) → 100 (highly anomalous)
```

### User Journey Mapping

VISION reconstructs complete user journeys across sessions:

```
user_journey(userId, timeRange):
  1. Collect all session timelines within range
  2. Link cross-session patterns (returning user paths)
  3. Identify conversion funnels and drop-off points
  4. Calculate engagement trajectory (improving/declining)
  5. Tag journey milestones (first login, first feature use, etc.)
```

---

## Trade Secrets

### 1. Clockless Session Fingerprinting

VISION uses IDENTITY's session fingerprint (SHA-256 of browser characteristics) to link anonymous sessions to returning users without PII storage. This enables journey mapping across authentication boundaries.

### 2. Feature Adoption Heatmap

Usage analytics aggregate feature-level adoption rates, enabling the substrate to identify which capabilities are underutilized and route users toward them via DECODE suggestions.

### 3. Anomaly-Driven Authentication

When `anomaly_score > 70`, VISION signals DEFENSE to trigger step-up authentication. This provides adaptive security that tightens access controls based on behavioral deviation rather than static rules.

---

## CLM Learning Priorities

1. **Anomaly Baseline Refinement** — Continuously improving baseline models as user behavior evolves
2. **Journey Pattern Recognition** — Identifying common user journey archetypes for predictive routing

---

*CMPSBL® Substrate — VISION Node Deep Dive · Founder Eyes Only*
