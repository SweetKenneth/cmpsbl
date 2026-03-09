# LINGUA — Protocol Translation & Schema Bridging

> **Node ID:** `lingua` · **Sector:** EMZ (Expansion Manufacturing Zone) · **Generation:** 1 · **Node #30 of 40**
> **Codename:** *Polyglot* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

LINGUA is the substrate's universal translator. It owns protocol translation between modalities, schema mapping between data formats, fidelity scoring for translation quality, and modality bridge management. When two nodes speak different "languages" (JSON vs. protobuf, REST vs. GraphQL, typed vs. untyped), LINGUA bridges them.

---

## Capabilities

| Capability | Description |
|---|---|
| `translate` | Translate data between modality formats |
| `mapSchema` | Create schema mappings between data structures |
| `createBridge` | Establish a persistent modality bridge |

---

## Architecture

### Translation Engine

```
translate(data, fromFormat, toFormat):
  1. Look up bridge for fromFormat → toFormat
  2. If bridge exists and enabled:
     - Apply schema mapping
     - Transform field names, types, and structures
     - Calculate fidelity score (0-1)
     - Record latency
  3. If no bridge → attempt dynamic mapping via schema inference
  4. Return: { translated, fidelityScore, latencyMs, quality }
```

### Fidelity Scoring

```
fidelityScore:
  1.0 = perfect lossless translation
  0.8+ = high quality, minor format adjustments
  0.5-0.8 = acceptable, some data coercion
  < 0.5 = low quality, potential data loss

Quality classification:
  fidelity ≥ 0.9 → 'excellent'
  fidelity ≥ 0.7 → 'good'
  fidelity ≥ 0.5 → 'acceptable'
  fidelity < 0.5 → 'poor'
```

### Modality Bridges

```
Bridge: persistent connection between two modality formats
  - from: source format identifier
  - to: target format identifier
  - enabled: boolean (CLM can disable degraded bridges)
  - avgFidelity: rolling average across translations
  - totalTranslations: count
```

### Schema Mapping

```
mapSchema(sourceSchema, targetSchema):
  1. Analyze field names for semantic similarity
  2. Analyze types for compatibility
  3. Generate mapping: source_field → target_field + transform
  4. Confidence score per mapping (0-1)
  5. Validate with test data if available
```

---

## CLM Diagnostics

| Diagnostic | Threshold | Deduction |
|---|---|---|
| Low fidelity | Avg < 70% (last 50) | -15 |
| Latency spikes | > 20% exceed 50ms | -10 |
| Disabled bridges | Any disabled | -3 each (max -20) |
| Low schema confidence | < 50% | -2 each (max -10) |
| Translation capacity | ≥ 450/500 | -5 to -15 |
| Schema capacity | ≥ 80/100 | -5 |

Health score: `100 - total_deductions`, clamped to [0, 100].

---

## Trade Secrets

### 1. Dynamic Schema Inference

When no pre-built bridge exists, LINGUA attempts dynamic mapping by analyzing field name semantics and type compatibility. This handles ad-hoc translation needs without requiring manual bridge configuration.

### 2. Bridge Auto-Disable

When a bridge's average fidelity drops below 50% across 50+ translations, the CLM flags it as degraded. Critically degraded bridges are auto-disabled to prevent low-quality translations from propagating through the system.

### 3. Latency-Quality Tradeoff

LINGUA tracks both fidelity and latency per translation. The CLM monitors the ratio — if high-fidelity translations consistently exceed 50ms, it suggests switching to a lower-fidelity but faster translation mode for non-critical operations.

---

## CLM Learning Priorities

1. **Schema Mapping Accuracy** — Improving semantic field matching for higher auto-mapping confidence
2. **Fidelity Optimization** — Learning which translation strategies maximize fidelity per format pair

---

*CMPSBL® Substrate — LINGUA Node Deep Dive · Founder Eyes Only*
