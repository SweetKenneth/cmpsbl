# 03 — Memory Stream & Foundry

**Classification:** 📖 OPEN ACCESS / PRIOR ART  
**Version:** v13.5 — IRONCLAD Epoch  
**DOI:** [10.5281/zenodo.18234909](https://doi.org/10.5281/zenodo.18234909)

---

## 1. Purpose

This document describes the memory stream architecture and the Foundry subsystem: the mechanism by which the substrate captures raw signals, processes them into structured discoveries, and crystallizes high-value findings into permanent, replayable artifacts.

## 2. Memory Stream Architecture

### 2.1 Signal Lifecycle

The memory stream follows a four-stage lifecycle:

```
Signal → Observation → Discovery → Crystallization
```

| Stage | Description |
|---|---|
| Signal | Raw input event, interaction, or environmental change |
| Observation | Filtered and contextualized signal with metadata |
| Discovery | Validated finding with confidence score and provenance |
| Crystallization | Permanent artifact with structural fingerprint and replay capability |

### 2.2 Signal Sources

Signals originate from multiple substrate subsystems:

- User interactions (DECODE)
- Generation outputs (ENCODE)
- Governance decisions (GOVERNANCE)
- Health events (SYSTEM)
- Cross-module synergy completions (CORTEX)
- Offline consolidation results (DREAM)

### 2.3 Memory Tiers

The substrate maintains multiple memory tiers with different retention and access characteristics:

| Tier | Retention | Access Pattern |
|---|---|---|
| Working memory | Session-scoped | Immediate, high-frequency |
| Short-term memory | Hours to days | Indexed, searchable |
| Long-term memory | Persistent | Retrieval-augmented |
| Crystallized memory | Permanent | Structural fingerprint verified |

## 3. The Foundry

### 3.1 Overview

The Foundry is the subsystem responsible for transforming raw discoveries into production-grade artifacts. It operates as a pipeline with quality gates, validation stages, and structural verification.

### 3.2 Processing Stages

1. **Intake** — discovery enters the Foundry queue with metadata and provenance chain
2. **Validation** — discovery is tested against consistency constraints and prior knowledge
3. **Enrichment** — cross-references are resolved, related discoveries are linked
4. **Scoring** — the Crown Jewel Pipeline Index (CJPI) assigns a composite quality score
5. **Tiering** — discoveries are assigned to S/A/B/C/D tiers based on CJPI score
6. **Crystallization** — top-tier discoveries are fingerprinted and stored permanently
7. **Audit** — the complete processing chain is logged to the AUDIT module

### 3.3 Crown Jewel Pipeline Index

The CJPI is a composite scoring system that evaluates discoveries across multiple dimensions. The scoring formula and specific weight allocations are withheld (see Sealed Mechanisms §17), but the evaluated dimensions include:

- Novelty relative to existing knowledge base
- Reproducibility and verification status
- Cross-module applicability
- Potential for downstream pipeline generation
- Structural coherence

### 3.4 Structural Fingerprinting

Every crystallized artifact receives a structural fingerprint — a content-addressable identifier derived from the artifact's semantic structure rather than its raw bytes. This enables:

- **Deduplication** — identical discoveries from different sources are merged
- **Lineage tracking** — derived artifacts reference their parent fingerprints
- **Replay verification** — crystallized artifacts can be re-validated against their original inputs

## 4. DREAM State Integration

The DREAM module performs offline cognitive consolidation — analogous to sleep-state memory processing in biological systems. During DREAM cycles:

1. Recent observations are replayed against existing long-term memory
2. Pattern conflicts are identified and resolved
3. Low-confidence memories are either strengthened or pruned
4. High-value patterns are promoted for Foundry processing

DREAM operates on a batch schedule and does not interfere with real-time processing.

## 5. Disclosure Boundary

The following are withheld from this document:

- CJPI scoring weights and formula
- Memory importance scoring heuristics
- DREAM cycle scheduling algorithms
- Structural fingerprint generation method

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-06 | Kenneth E. Sweet Jr. | Initial memory stream & foundry documentation — v13.5 |

---

© 2025–2026 PromptFluid®. All rights reserved.
