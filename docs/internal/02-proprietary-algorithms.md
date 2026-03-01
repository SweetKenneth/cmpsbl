# 02 — Proprietary Algorithms

**Classification:** 🔒 INTERNAL — Trade Secret

---

## 1. Purpose

This document catalogs every proprietary algorithm, scoring model, and computation contract used within the CMPSBL Substrate. These are the mathematical and logical foundations that drive system behavior. None of these formulas or thresholds may be externalized without explicit governor approval.

## 2. Weighted Matrix Integrity (WMI)

### Formula

```
I = Σ(hᵢ × wᵢ)   where   Σwᵢ = 1.000
```

- `hᵢ` = health score of module `i` (0–100)
- `wᵢ` = assigned weight of module `i`
- `I` = composite integrity score (0–100)

### Invariants

- The sum of all weights MUST equal exactly `1.000`.
- Weight validation is a release gate check — build fails if violated.
- Integrity score < 40 triggers auto-heal consideration.
- Integrity score < 60 blocks evolution promotion.

### Weight Assignment Policy

Weights are assigned by architectural criticality, not by feature complexity. Kernel modules (CORE) carry the highest weight. Field modules carry proportional weights based on permeation scope. Weights are immutable during a release epoch and may only change through governed evolution proposals.

## 3. Clockless Execution Model

### Description

The system operates on a demand-pulled, event-driven execution model. There are no timers, no cron jobs, and no fixed polling intervals. Work is triggered by state changes, user intent, or system events.

### Key Properties

1. **No idle compute cost** — modules only activate when work exists.
2. **Deterministic health accounting** — health is computed from actual events, not from timer ticks.
3. **Triple-deferred boot** — system initialization is deferred three times to ensure dependency readiness:
   - Defer 1: Registry population
   - Defer 2: Dependency graph validation
   - Defer 3: Health gate verification

### Strategic Value

Reduces infrastructure cost while maintaining responsiveness. Prevents false-positive health degradation caused by timer-based polling during low-activity periods.

## 4. SM-2 Spaced Repetition Engine

### Purpose

Governs memory tiering and knowledge retention across the substrate's MEMORY module.

### Core Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `easeFactor` | Multiplier for interval growth | 2.5 |
| `interval` | Days until next review | 1 |
| `repetitions` | Successful recall count | 0 |
| `retentionRate` | Percentage of memories retained | 0.85 target |

### Algorithm

```
After each recall attempt:
  if quality >= 3:
    if repetitions == 0: interval = 1
    if repetitions == 1: interval = 6
    else: interval = interval × easeFactor
    repetitions += 1
  else:
    repetitions = 0
    interval = 1

  easeFactor = max(1.3, easeFactor + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02)))
```

### Health Monitoring

| Metric | Healthy Threshold |
|--------|-------------------|
| Retention rate | > 0.70 |
| Overdue ratio | < 0.30 |
| Average ease factor | > 1.5 |

SM-2 health failure triggers an alert in VISION and increases MEMORY module's maintenance priority.

## 5. Memory Tier Definitions

| Tier | Label | Access Pattern | Retention |
|------|-------|---------------|-----------|
| 0 | Hot | < 10ms, in-memory cache | Active session |
| 1 | Warm | < 100ms, indexed database query | 30–90 days |
| 2 | Cold | < 1s, archived storage | 1 year |
| 3 | Frozen | On-demand retrieval | Indefinite, decay-weighted |

### Decay Rules

- Memories below confidence threshold `0.30` are hidden from query results.
- Decay is time-weighted: `confidence = initial_confidence × e^(-λt)` where λ is the decay constant per memory type.
- DREAM cycles can promote decayed memories back to warm tier if pattern recognition identifies recurring relevance.

## 6. Circuit Breaker State Machine

### States

```
CLOSED → (failures ≥ threshold) → OPEN → (timeout expires) → HALF-OPEN → (success) → CLOSED
                                                              HALF-OPEN → (failure) → OPEN
```

### Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `failureThreshold` | 3 | Consecutive failures to open |
| `successThreshold` | 2 | Successes in half-open to close |
| `openDurationMs` | 60,000 | Time before transitioning to half-open |
| `halfOpenMaxConcurrent` | 1 | Max concurrent requests in half-open |

### Per-Module Isolation

Every module has its own circuit breaker instance. Circuit state is tracked per-service identifier. A circuit opening in NEXUS does not affect DECODE's circuit state.

## 7. Cascade Detection

### Algorithm

1. Track failure propagation across module boundaries.
2. If ≥ 3 modules report failures within a 30-second window, declare cascade.
3. Identify cascade origin by analyzing failure timestamps.
4. Arrest propagation by opening circuit breakers on affected downstream modules.
5. Log cascade event with full trace in RIPPLE.

### Cascade Chain Classification

| Type | Description | Response |
|------|-------------|----------|
| Linear | A → B → C sequential failure | Open circuit at origin |
| Fan-out | A → (B, C, D) simultaneous | Isolate origin, quarantine |
| Cyclic | A → B → A mutual dependency | Break cycle, restart both |

## 8. Merkle Audit Chain

### Purpose

Tamper-evident, cryptographic logging of all evolution receipts and governance decisions.

### Structure

```
Receipt[n].chainHash = SHA-256(Receipt[n-1].chainHash + Receipt[n].contentHash)
Receipt[0].previousHash = '0'.repeat(64)  // Genesis block
```

### Verification

```typescript
interface ChainVerification {
  valid: boolean;
  totalReceipts: number;
  verifiedCount: number;
  firstBrokenAt: number | null;
  brokenReceiptId: string | null;
  chainHead: string | null;
}
```

To verify the chain: iterate from genesis, recompute each `chainHash`, and compare against the stored value. Any mismatch indicates tampering.

## 9. Cognitive Load Balancing

### Purpose

Distributes processing load across available AI providers based on task complexity, provider health, and cost budget.

### Routing Factors

1. **Task classification** — semantic analysis determines task category (chat, analysis, generation, code).
2. **Context window matching** — route to provider whose context window fits the input size.
3. **Cost-aware scoring** — factor in per-token cost against budget remaining.
4. **Health weighting** — prefer providers with higher uptime and lower latency.
5. **Affinity scoring** — track per-task-type provider performance and build learned preferences.

### Formula

```
routeScore(provider, task) = 
  healthWeight × provider.healthScore
  + costWeight × (1 - provider.normalizedCost)
  + affinityWeight × provider.taskAffinity[task.type]
  + latencyWeight × (1 - provider.normalizedLatency)
```

## 10. Evolution Confidence Scoring

### Purpose

Determines whether a mutation proposal is safe to promote from shadow to production.

### Factors

| Factor | Weight | Source |
|--------|--------|--------|
| Pre/post integrity delta | 0.30 | Matrix integrity scan |
| Governance compliance | 0.25 | GOVERNANCE evaluation |
| Error rate change | 0.20 | VISION telemetry |
| Performance regression | 0.15 | Latency metrics |
| Security impact | 0.10 | DEFENSE assessment |

### Promotion Threshold

- Confidence ≥ 0.80: auto-promote eligible
- Confidence 0.60–0.79: requires governor review
- Confidence < 0.60: rejected, logged for analysis

## 11. Request Deduplication (Coalescing)

### Purpose

Prevents duplicate in-flight requests from consuming redundant provider resources.

### Algorithm

1. Hash the request payload (model + messages + parameters).
2. Check in-flight request cache for matching hash.
3. If match found, attach caller to existing promise (coalesce).
4. If no match, execute request and cache the promise with TTL.
5. On completion, all coalesced callers receive the same response.

### Cache TTL

| Category | TTL |
|----------|-----|
| Chat responses | 5 minutes |
| System queries | 2 hours |
| Static lookups | 24 hours |

## 12. Integrity Health Score Grading

### Grade Boundaries

| Grade | Score Range | Meaning |
|-------|------------|---------|
| A | 90–100 | Optimal — no action needed |
| B | 75–89 | Healthy — minor items |
| C | 60–74 | Acceptable — monitor closely |
| D | 40–59 | Degraded — active investigation |
| F | 0–39 | Critical — auto-heal triggered |

### Composite Calculation

The composite health score for any module is computed from:

1. Uptime percentage (last 24h)
2. Error rate (last 1h)
3. Circuit breaker state (penalty for open)
4. P95 latency (against baseline)
5. Quarantine status (binary penalty)

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial creation with all known algorithms |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
