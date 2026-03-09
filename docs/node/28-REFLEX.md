# REFLEX — Real-Time Edge Decisions & Sub-10ms Response

> **Node ID:** `reflex` · **Sector:** EPZ (Expansion Perception Zone) · **Generation:** 1 · **Node #28 of 40**
> **Codename:** *Impulse* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

REFLEX is the substrate's fastest node — designed for sub-10ms response loops. It owns real-time edge decisions, reactive trigger rules, immediate response generation, and latency-critical processing. When the substrate needs to react instantly, REFLEX handles it.

---

## Capabilities

| Capability | Description |
|---|---|
| `registerNode` | Register an edge processing node |
| `addRule` | Define a reactive trigger rule |
| `decide` | Execute a real-time decision |
| `heartbeat` | Edge node health check |

---

## Architecture

### Edge Node Model

```typescript
interface EdgeNode {
  id: string;
  name: string;
  status: 'active' | 'degraded' | 'overloaded' | 'offline';
  capabilities: string[];
  latencyMs: number;           // Current measured latency
  throughput: number;          // Decisions per second
  lastHeartbeat: number;
}
```

### Rule Engine

```
addRule(condition, action, priority):
  Rules are evaluated in priority order (critical → high → normal → low)
  
  Condition: predicate function returning boolean
  Action: response function returning decision
  
  Rules with hitCount === 0 after sufficient traffic
  are flagged by CLM as "ineffective"
```

### Decision Pipeline

```
decide(input):
  MUST complete in < 10ms (P99 target)
  
  1. Match input against rule conditions (priority-ordered)
  2. First matching rule → execute action
  3. Record: decision, latency, confidence, rule used
  4. If no rules match → default action with low confidence
  5. Track throughput (decisions/sec)
```

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `latency_spike` | P99 > 10ms | Medium/High/Critical |
| `node_degradation` | Degraded or offline nodes | Medium/High |
| `rule_ineffective` | ≥ 5 enabled rules with zero hits | Low |
| `low_confidence` | ≥ 10 of last 50 below 50% | Medium/High |
| `throughput_drop` | < 1/sec after 100+ decisions | Medium |

---

## Trade Secrets

### 1. Priority-Ordered Rule Evaluation

Rules are evaluated in strict priority order and short-circuit on first match. This ensures critical rules always fire first, and evaluation completes in O(n) worst case — critical for the sub-10ms budget.

### 2. P99 Latency Target

REFLEX targets P99 < 10ms, not P50. The CLM monitors P99 specifically because a single slow decision in a real-time system is more damaging than consistently "okay" average performance. Spikes above 50ms trigger critical alerts.

### 3. Hit Count Analytics

Every rule tracks its hit count. Rules that are enabled but never fire are flagged as "ineffective" by the CLM. This prevents rule table bloat and keeps the evaluation fast by identifying rules that should be disabled or refactored.

### 4. Throughput as Stall Detector

If throughput drops below 1 decision/sec after 100+ total decisions, REFLEX flags a potential stall. This distinguishes between "no traffic" (normal) and "processing frozen" (problem).

---

## CLM Learning Priorities

1. **Rule Priority Tuning** — Learning optimal rule ordering for lowest average latency
2. **Edge Node Load Balancing** — Distributing decisions across edge nodes to prevent hotspots

---

*CMPSBL® Substrate — REFLEX Node Deep Dive · Founder Eyes Only*
