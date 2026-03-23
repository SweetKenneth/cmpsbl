# LINGUA v9.0.0 "Polyglot" — Ultimate Architecture

**Node:** #30 — LINGUA  
**Sector:** EMZ (Expansion Manufacturing Zone)  
**Weight:** 0.015  
**Classification:** 🔒 FOUNDER EYES ONLY  
**Last Updated:** 2026-03-23  
**Codename:** *Polyglot*

---

## 1. Purpose

LINGUA is the substrate's **universal translation and protocol bridging engine**. It owns cross-modal translation (text↔code↔image↔audio↔structured_data↔embedding↔graph), schema mapping between data formats, fidelity scoring, modality bridge management, and cross-primitive format negotiation. When two nodes speak different "languages," LINGUA bridges them with measured quality.

---

## 2. Core Engines

### 2.1 Adaptive Fidelity Engine
- **EMA-weighted fidelity profiles** per format pair — learns which translation strategies yield highest scores over time
- **Quality-aware routing** — automatically selects fast/lossy vs slow/lossless based on caller's quality tier (draft/standard/premium/certified)
- **CUSUM-based regression detection** — alerts when a previously-excellent bridge degrades beyond 80% of its EMA baseline
- **Auto-disable** — bridges dropping below 35% EMA fidelity are automatically disabled to prevent low-quality propagation
- **Auto-degrade** — bridges below 50% fidelity are marked as `degraded` status

### 2.2 Schema Intelligence Layer
- **Semantic field matching** — goes beyond name similarity: `user_email` ≈ `contact.email_address` via alias groups and Levenshtein distance ratios
- **Type coercion graph** — knows `number→string` is safe, `string→boolean` is lossy, `array→string` is lossy
- **Schema versioning** — tracks schema evolution over time, auto-generates migration mappings v1→v2→v3 with parent chain
- **Auto-inference** — `inferSchemaMapping()` generates field mappings from source/target field names with no manual configuration
- **Semantic alias database** — covers email, name, phone, address, id, created, updated, description, amount + variants

### 2.3 Protocol Bridge Mesh
- **42 modality bridges** — all 7×6 directional pairs initialized on boot
- **BFS-based transitive bridging** — if A→B and B→C exist, auto-composes A→C (max 3 hops) with combined fidelity scoring
- **Bidirectional round-trip verification** — translates A→B→A and measures preservation (weekly per active bridge)
- **Hot-swap** — replaces degraded bridge with fresh instance without downtime, preserving format pair
- **Bridge status lifecycle**: `warming` → `active` → `degraded` → `disabled`

### 2.4 Multi-Modal Translation Pipeline
- **Streaming translation** — 64KB chunked processing for large payloads
- **Batch translation** — queue up to 50 items per batch with priority ordering
- **Priority lanes** — `governance` > `high` > `normal` > `low` processing order
- **Partial translation** — when full fidelity isn't possible, translates what it can and marks untranslated fields
- **Ring buffer** — 1,000-entry translation history (up from 500)

### 2.5 Cross-Primitive Format Negotiation
- **Format capability registry** — each node advertises supported formats, preferred format, and fallback chain
- **Auto-negotiation** — `negotiateFormat()` finds highest-fidelity bridge between two nodes' format sets
- **Fallback chains** — cascading format alternatives when preferred format fails
- **Direct match optimization** — skips translation entirely when both nodes share a common format

### 2.6 Anomaly Detection & Telemetry
- **EMA-smoothed baselines** — tracks rolling average latency and fidelity (α=0.05)
- **Fidelity drop alerts** — fires when translation fidelity drops below 70% of baseline
- **Latency spike alerts** — fires when latency exceeds 3x baseline (critical at 5x)
- **100-entry alert ring buffer** — retains recent anomalies for dashboard display
- **Bridge statistics dashboard** — active/degraded/disabled/warming counts, per-bridge fidelity trends
- **Fidelity heat map** — visual grid of all format pair fidelities and translation counts
- **Schema statistics** — total mappings, validated count, average confidence, versioned count

---

## 3. Constants & Limits

| Parameter | Value |
|---|---|
| Translation ring capacity | 1,000 |
| Schema ring capacity | 200 |
| Max transitive bridge depth | 3 hops |
| Fidelity EMA alpha | 0.15 |
| Regression threshold | 5 consecutive low-fidelity |
| Degraded fidelity floor | 50% |
| Auto-disable fidelity | 35% |
| Round-trip verification interval | Weekly |
| Batch max size | 50 items |
| Streaming chunk size | 64KB |
| Latency budget | 100ms |
| Max concurrent operations | 24 |
| Rate limit | 200 ops/window |
| Max content length | 100,000 chars |
| Max field mappings | 200 per schema |

---

## 4. Type Coercion Safety Graph

| Conversion | Safety |
|---|---|
| `number → string` | ✅ Safe |
| `boolean → string` | ✅ Safe |
| `boolean → number` | ✅ Safe |
| `date → string` | ✅ Safe |
| `string → number` | ⚠️ Lossy |
| `number → boolean` | ⚠️ Lossy |
| `string → boolean` | ⚠️ Lossy |
| `string → date` | ⚠️ Lossy |
| `array → string` | ⚠️ Lossy |
| `object → string` | ⚠️ Lossy |
| Unknown pairs | ❓ Unknown |

---

## 5. Fidelity Scoring

| Fidelity | Quality | Meaning |
|---|---|---|
| ≥ 0.9 | Excellent | Lossless translation |
| ≥ 0.7 | Good | Minor format adjustments |
| ≥ 0.5 | Acceptable | Some data coercion |
| < 0.5 | Poor | Potential data loss, bridge degraded |
| < 0.35 | Critical | Bridge auto-disabled |

Quality tier multipliers:
- `certified`: 1.0x
- `premium`: 0.98x
- `standard`: 0.95x
- `draft`: 0.85x

Transitive path penalty: 0.9x per hop.

---

## 6. CLM Diagnostics

| Diagnostic | Threshold | Deduction |
|---|---|---|
| Low fidelity | Avg < 70% (last 50) | -15 |
| Latency spikes | > 20% exceed 50ms | -10 |
| Disabled bridges | Any disabled | -3 each (max -20) |
| Low schema confidence | < 50% | -2 each (max -10) |
| Translation capacity | ≥ 900/1000 | -5 to -15 |
| Schema capacity | ≥ 160/200 | -5 |

Health score: `100 - total_deductions`, clamped to [0, 100].

Additional health deductions in v9.0.0:
- Degraded bridges: -2 each
- Disabled bridges: -5 each
- Critical anomalies (last 5 min): -3 each

---

## 7. ADA Integration

LINGUA operates within the `protocol-translation` domain:

| Parameter | Value |
|---|---|
| **Autonomy threshold** | 75% |
| **Rate limit** | 100 decisions/hr |
| **DREAM allowed** | ✓ |
| **Allowed actions** | `select-bridge`, `disable-degraded-bridge`, `compose-transitive-bridge`, `switch-quality-tier`, `warm-bridge`, `retry-translation`, `hot-swap-bridge` |
| **Blocked actions** | `delete-bridge`, `modify-schema-permanently`, `create-permanent-bridge`, `evolve` |

---

## 8. API Surface

### Queries (Hook)
| Query | Interval | Description |
|---|---|---|
| `state` | 30s | Full module state |
| `health` | 30s | Health score (0–100) |
| `resilience` | 60s | Circuit breaker + resilience posture |
| `hardening` | 60s | Hardening configuration |
| `bridgeStats` | 30s | Bridge mesh statistics |
| `fidelityHeatMap` | 60s | Per-pair fidelity grid |
| `schemaStats` | 60s | Schema mapping statistics |
| `anomalies` | 15s | Recent anomaly alerts |

### Mutations (Hook)
| Mutation | Description |
|---|---|
| `init` | Initialize LINGUA engine |
| `upgradeEngine` | Apply engine version upgrade |
| `runCLM` | Trigger CLM diagnostic cycle |
| `translate` | Translate content between modalities |
| `mapSchema` | Create schema mapping |
| `findPath` | Find transitive bridge path |
| `verifyBridge` | Round-trip verification |
| `swapBridge` | Hot-swap degraded bridge |
| `streamTranslate` | Chunked streaming translation |
| `batchTranslate` | Queue batch translation |
| `processBatches` | Process queued batches |
| `partialTranslate` | Best-effort partial translation |
| `inferMapping` | Auto-infer schema mapping |
| `migrateSchema` | Generate schema version migration |
| `registerFormats` | Register node format capabilities |
| `negotiate` | Auto-negotiate format between nodes |

### Sync Utilities
| Function | Description |
|---|---|
| `getCoercionSafety(from, to)` | Query type coercion safety graph |
| `getFallbackChain(nodeId)` | Get format fallback chain for a node |

---

## 9. Trade Secrets

### Dynamic Schema Inference
When no pre-built mapping exists, LINGUA analyzes field name semantics (alias groups + Levenshtein distance) and type compatibility to auto-generate mappings without manual configuration.

### Bridge Auto-Disable with Hot-Swap Recovery
When EMA fidelity drops below 35% across accumulated translations, the bridge is auto-disabled. The system can hot-swap with a fresh bridge instance in `warming` status, preserving the format pair while resetting fidelity metrics.

### Transitive Bridge Composition
BFS-based path finding composes multi-hop translations (max 3 hops) with combined fidelity scoring. A→C via B applies a 0.9x penalty per hop, correctly modeling cumulative translation loss.

### Anomaly Detection Baseline Learning
Uses EMA-smoothed baselines (α=0.05) that adapt to normal operating conditions. Alerts fire on statistical deviations rather than fixed thresholds, reducing false positives during legitimate workload changes.

---

## 10. File Map

| File | Purpose |
|---|---|
| `src/lib/substrate/lingua-module/index.ts` | Core engine (v9.0.0) |
| `src/lib/substrate/lingua/index.ts` | Barrel exports |
| `src/lib/substrate/lingua/clm.ts` | CLM diagnostics |
| `src/lib/substrate/lingua/hardening.ts` | Input validation & limits |
| `src/lib/substrate/lingua/s-tier.ts` | S-Tier primitive exports |
| `src/hooks/substrate/useLingua.ts` | React hook |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-23 | System | v9.0.0 Ultimate architecture — 6 engines, ADA integration |

---

© 2025–2026 PromptFluid®. Confidential.
