# 21 — Ascension Internals

**Version:** Documentation Epoch 041  
**Classification:** Internal  
**Last Updated:** 2026-03-17

---

## Purpose

This document describes the internal architecture of the Ascension subsystem — the pipeline that transforms developer software into first-class substrate primitives (Auxiliary Node).

---

## 1. System Overview

The Ascension subsystem converts arbitrary source code into managed nodes that participate in the CMPSBL discovery engine. The pipeline follows this flow:

```
Upload → Language Detection → Regex Extraction → Language Post-Processing
→ Deduplication → Quality Gate → Node Registration → Chain Injection
→ Delta Measurement → BRAIN Learning
```

All operations are user-scoped via RLS on `artifact_registry`.

---

## 2. Primitive Extraction

**File:** `src/lib/ascension/primitive-extractor.ts`

The extraction engine uses regex patterns to identify functions, classes, modules, and keywords across 25 languages (18 software + 7 HDL). Each pattern has a unique ID for traceability.

**Pipeline stages:**
1. **Regex extraction** — Pattern matching with per-file isolation
2. **Language post-processing** — Framework boilerplate filtering, trust classification
3. **Semantic deduplication** — Canonical name normalization, Jaccard similarity merge
4. **Quality gate** — Weighted scoring (confidence, complexity, name quality, keywords, snippet usefulness)

**Safety guards:**
- Max 1MB per file content
- Max 300 raw primitives before quality gate
- Max 80 accepted primitives per node (configurable)
- Individual file extraction errors are caught — partial results preserved

---

## 3. Quality Gate

**File:** `src/lib/ascension/quality-gate.ts`

Every extracted primitive receives a quality score (0–1) computed from five weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Confidence | 0.30 | Extraction confidence based on pattern match quality |
| Complexity | 0.20 | Control flow complexity (1–10 scale) |
| Keywords | 0.15 | Domain keyword richness in source snippet |
| Name Quality | 0.20 | Multi-word descriptiveness, penalizes generic names |
| Snippet | 0.15 | Snippet length, parameter/output detection |

**Rejection criteria:**
- Quality score below threshold (default: 0.35)
- Confidence below threshold (default: 0.50)
- Boilerplate name with insufficient compensating signals

**Output:** Ranked accepted primitives + rejected primitive report + quality summary.

BRAIN learns from accepted primitives only. Rejected primitives produce weak negative signals.

---

## 4. Language Post-Processing

**File:** `src/lib/ascension/language-postprocessor.ts`

Applies language-specific cleanup:
- Identifies framework boilerplate (React hooks, Python dunder methods, PHP magic methods, etc.)
- Classifies extraction trust: `high`, `medium`, `heuristic`
- Normalizes names to `snake_case` canonical form for deduplication
- Downgrades confidence for test files and boilerplate

---

## 5. Deduplication

**File:** `src/lib/ascension/deduplication.ts`

Conservative semantic deduplication using two passes:
1. **Exact match:** Group by canonical name, keep highest-quality version
2. **Fuzzy match:** Jaccard token similarity ≥ 0.75 + same category → merge

Preserves provenance: merged primitives retain alias names and contributing files.

---

## 6. Node Storage

**File:** `src/lib/ascension/node-registry.ts`  
**Table:** `artifact_registry` (category: `proprietary-evolution`)

Node metadata follows a structured schema (version 2) with sections:

| Section | Contents |
|---------|----------|
| `identity` | Node name, language, source files, derived surface |
| `extraction` | Primitives, stats, quality summary, warnings |
| `lifecycle` | Status, mode, run limit, timestamps |
| `performance` | CJPI metrics, delta history |
| `learning` | BRAIN event counts, primitive success map |
| `provenance` | Ingestion timestamp, correlation ID, file names |

Legacy v1 flat metadata is auto-migrated on read via `migrateMetadata()`.

---

## 7. Chain Injection

**File:** `src/lib/ascension/chain-injection.ts`

Ascension nodes participate in discovery chains as `ModuleEffect` instances:
- Module names use collision-safe format: `Ψ₄₁_NODENAME`
- Reserved canonical names (40 substrate primitives) are guarded
- Individual primitive execution failures are isolated — do not poison the chain
- Each injection annotates context with execution trace and primitive count

---

## 8. Delta Measurement

**File:** `src/lib/ascension/delta-measurement.ts`

Measures the before/after impact of injecting a node:

1. Run baseline chain (without node)
2. Run comparison chain (with node injected)
3. Capture snapshots: output keys, confidence, timing, recoveries
4. Compute deltas with weighted impact score

**Impact scoring:**
- New outputs: +2 per key
- Confidence improvement: +10 per unit
- Annotations added: +0.5 per annotation
- Confidence degradation: -15 per unit
- Recovery increase: -3 per recovery

Verdict: `positive` (>2), `neutral` (-2 to 2), or `negative` (<-2).

---

## 9. BRAIN Learning Bridge

**File:** `src/lib/ascension/brain-learning-bridge.ts`

Feeds structured signals into BRAIN with weighted importance:

| Event | Weight | Signal |
|-------|--------|--------|
| Accepted primitive | 1.0 | Quality, confidence, category, language |
| Rejected primitive | – | Negative frequency signal only (in-memory) |
| Chain participation (CJPI ≥ 68) | 2.0 | High-value discovery signal |
| Chain participation (CJPI < 68) | 0.5 | Low-value signal |
| Delta measured (high impact) | 2.0 | Node meaningfully changed computation |
| Node promotion | 1.5 | Lifecycle success signal |
| Node archival | 0.5 | Lifecycle end signal |

**Structured insights available:**
- Top primitive families by frequency
- Strongest languages by extraction quality
- High-impact categories by chain contribution
- Promotion candidates by average CJPI

---

## 10. Audit Trail

**File:** `src/lib/ascension/ingest-audit.ts`

All events are logged to `audit_logs` with action prefix `ingest.*`:

| Event | Action |
|-------|--------|
| File upload | `ingest.upload` |
| Extraction complete | `ingest.extraction` |
| Quality gate result | `ingest.quality_gate` |
| Node created | `ingest.node_created` |
| Chain participation | `ingest.chain_participation` |
| Delta measured | `ingest.delta_measured` |
| Promotion | `ingest.promotion` |
| Demotion | `ingest.demotion` |
| Deletion | `ingest.deletion` |

All events support optional `correlationId` for end-to-end lifecycle tracing.
All logging is non-blocking — failures are silently swallowed.

---

## 11. Governor Dashboard

**File:** `src/pages/admin/GovernorNodeDashboard.tsx`

Admin-only interface providing:
- Node listing with status/mode/language/quality filtering
- Quality gate summary per node
- Primitive inspection with trust and quality indicators
- Governor actions: promote, archive, set temporary, delete, re-extract
- Destructive action confirmations via AlertDialog
- Error states and loading indicators
- Audit trail per node

---

## 12. Naming Convention

All ascension primitive module names follow the format: `Ψ₄₁_NODENAME`

- Names are uppercased and sanitized (alphanumeric + underscore only)
- Maximum 30 characters for the name portion
- Canonical substrate module names are guarded — collisions produce `Ψ₄₁_X_NODENAME`
- The `isAscensionModule()` helper distinguishes ascension primitives from canonical modules

---

© 2025–2026 PromptFluid®. All rights reserved.
