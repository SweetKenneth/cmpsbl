# Weighted Matrix Integrity Model — CMPSBL v11.1

## Integrity Equation

```
matrixIntegrity = Σ(node.health × node.weight)
```

Where:
- `node.health` ∈ [0, 100] — adjusted by breaker state
- `node.weight` ∈ (0, 1) — assigned per node definition
- `Σ(node.weight)` = 1.000 (enforced at compile time)

## Breaker Adjustments

Circuit breaker state modifies reported health **without altering the underlying breaker logic**:

| Breaker State | Health Adjustment |
|---------------|-------------------|
| `closed` | `rawHealth` (no change) |
| `half-open` | `min(rawHealth, 50)` |
| `rerouting` | `min(rawHealth, 85)` |
| `open` | `0` |

## Dual Integrity Metrics

### Operational Integrity
Weighted node health. This is the primary integrity score displayed on the dashboard.

### Structural Integrity
Composite of:
- **Breaker coherence** (70%): Percentage of nodes with closed breakers
- **Weight coherence** (30%): Deviation of Σ(weight) from 1.0

## CRITICAL Trigger

The CRITICAL banner fires when:
- `matrixIntegrity < 40`, OR
- CORE node breaker state is `open`

Otherwise:
- `matrixIntegrity ≥ 80` → **MATRIX STABLE**
- `40 ≤ matrixIntegrity < 80` → **MATRIX DEGRADED**

## Weight Distribution

| Sector | Total Weight | Per-Node Weight |
|--------|-------------|-----------------|
| CORE (1) | 0.200 | 0.200 |
| CCR (4) | 0.200 | 0.050 |
| CCL (5) | 0.200 | 0.040 |
| Execution (9) | 0.250 | ~0.028 |
| Overlay (5) | 0.150 | 0.030 |

---

© 2025–2026 PromptFluid®. All rights reserved.
