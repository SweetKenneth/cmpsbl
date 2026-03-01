# CMPSBL® Substrate OS — Academic Reference

**For deposit at:** OSF (Open Science Framework) & Zenodo  
**Author:** Kenneth E. Sweet Jr.  
**ORCID:** 0009-0001-4237-1243  
**Affiliation:** PromptFluid®  
**Date:** 2026-02  
**Classification:** Public (Academic)

---

## Abstract

CMPSBL (Composable) is a field-based cognitive substrate operating system designed for governed, self-evolving artificial intelligence systems. It implements a 24-node matrix architecture organized across Spine, Grid, Execution, Field, Plane, and Shell topologies, producing a weighted integrity score that quantifies system health as a deterministic function. The substrate introduces several novel contributions: (1) a clockless execution model with cognitive load balancing, (2) a self-evolving bounded agent (SEBA) with governance-gated evolution, (3) persistent control plane state with atomic versioned snapshots and write-ahead logging, (4) a constant learning mode (CLM) with spaced repetition integration, and (5) a multi-layer governance framework with veto authority, coherence validation, and ethical constraint checking. This document provides the academic reference for reproducibility, methodology, and validation.

**Keywords:** cognitive architecture, AI operating system, substrate computing, governed AI, self-evolving systems, agentic AI, composable intelligence, context engineering

---

## 1. Introduction

### 1.1 Problem Statement

Modern AI systems lack a unified operational substrate that combines persistent memory, governed self-evolution, ethical constraints, and fault-tolerant execution into a single coherent runtime. Existing frameworks (LangChain, CrewAI, AutoGPT) provide orchestration but not a **governed operating system** for intelligence.

### 1.2 Contribution

CMPSBL provides:

1. **A formal cognitive architecture** with 24 independently monitored nodes
2. **Deterministic health scoring** via weighted matrix integrity
3. **Self-evolution with governance gates** preventing uncontrolled mutation
4. **Persistent state** surviving process restarts via atomic snapshots
5. **Multi-tier memory** with SM-2-derived spaced repetition
6. **Tamper-evident audit** via Merkle chains

### 1.3 Scope

This reference covers the CONTRACT epoch (v13.x) of the CMPSBL substrate. Prior versions (v5.5.0 through v12.x) are archived and referenced where relevant.

---

## 2. System Architecture

### 2.1 Topology

The substrate organizes 24 nodes into six topological sectors:

| Sector | Nodes | Aggregate Weight | Role |
|--------|-------|-----------------|------|
| Spine: CORE | CORE | 0.200 | Kernel boot authority |
| Spine: SYSTEM | SYSTEM | 0.050 | Lifecycle management |
| Spine: CCR | BRAIN, MEMORY, DREAM | 0.150 | Cognitive reality |
| Grid: OCG | RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT | 0.200 | Operational compliance |
| Execution | DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, INTEGRATION | 0.250 | Specialized processing |
| Fields | EVOLUTION, IMMUNITY, INTENT | 0.090 | Transformation fabric |
| Plane | GOVERNANCE | 0.030 | Policy enforcement |
| Shell | DEFENSE | 0.030 | Containment boundary |

**Invariant:** Σ(weight) = 1.000

### 2.2 Boot Sequence

```
CORE → SYSTEM → CCR → OCG → 9 Execution Nodes → Fields permeate → Plane supervises → Shell encloses
```

Each node boots with an independent circuit breaker. The boot sequence is strict: downstream nodes cannot initialize before their upstream dependencies.

### 2.3 Integrity Equation

```
I = Σᵢ(hᵢ × wᵢ)

where:
  hᵢ = health of node i (0–100)
  wᵢ = weight of node i
  Σwᵢ = 1.0
```

Circuit breaker states modify health: `closed` = raw value, `half_open` = min(h, 50), `open` = 0, `rerouting` = min(h, 85).

---

## 3. Core Engines

### 3.1 Engine Bus

The Engine Bus is the canonical routing layer. All engine execution routes through `dispatch()`:

- **Command Resolution:** DJB2-hashed command-to-engine lookup table
- **Load Balancing:** Two-tier admission (hard shed + soft backpressure)
- **Retry:** Configurable retry with delay
- **Chain Execution:** Sequential dispatch with chain context propagation
- **Telemetry Integration:** Automatic start/end event emission

### 3.2 Memory Core

Unified memory lifecycle implementing five stages:

```
Ingest → Store → Index → Reflect → Retrieve
```

- **Tiering:** hot / warm / cold with access-frequency-based promotion
- **Retrieval Strategies:** fulltext, semantic, pattern, hybrid
- **Memory Types:** doctrine, reflection, preference, conversation, dream, insight, template, heuristic, error_pattern

### 3.3 Learning Engine

Five-stage learning loop:

```
Input → Feedback → Adjustment → Reinforcement → Stabilization
```

Tracks short-term gain, long-term gain, decay rate, and reinforcement weight.

### 3.4 Imagination Engine

Four-stage generative pipeline:

```
Latent Extraction → Recombination → Simulation → Synthesis
```

Operates offline from live input. Produces dreams, insights, fusions, and patterns. Feeds outputs to Learning Engine.

### 3.5 Reasoning Engine

Five-stage reasoning pipeline:

```
Causal Mapping → Dependency Analysis → Hypothesis Generation → Hypothesis Validation → Impact Projection
```

Generates causal links with evidence references and confidence scores. Hypotheses are validated against contradicting evidence.

### 3.6 Governance Guard

Three-stage constraint enforcement:

```
Coherence Validation → Ethical Constraint Check → Governance Signal Emission
```

Signals: block, warn, audit, approve. Risk levels: none, low, medium, high, critical.

### 3.7 Orchestrator Engine

Chains all cognitive engines into unified pipelines:

```
Modes: sequential | parallel | adaptive
Stages: ingest → learn → imagine → reason → govern → synthesize → output
```

Provides preset pipelines and custom pipeline configuration.

---

## 4. Self-Evolution (SEBA)

### 4.1 Architecture

The Self-Evolving Bounded Agent uses four sub-modules:

1. **CognitiveAnalyzer:** 9 specialized analysis engines scanning for improvements
2. **ProposalGenerator:** Generates structured improvement proposals
3. **GovernanceGate:** Evaluates proposals against safety controls and risk budgets
4. **EvolutionExecutor:** Applies approved changes with rollback capability

### 4.2 Safety Controls

- Maximum proposals per cycle (configurable)
- Cumulative risk budget
- Cryptographic snapshots before each evolution
- Tamper-evident receipts for every proposal
- Shadow-to-production promotion pipeline

### 4.3 Phases

```
idle → scanning → proposing → governing → executing → verifying → idle
```

### 4.4 LLM-Enhanced Analysis

SEBA integrates with supported AI models for predicted impact analysis, returning structured impact assessments with confidence scores.

---

## 5. Persistent Control Plane

### 5.1 Durable State Domains

Ten domains are persisted to durable storage:

1. Feature flags
2. Configuration
3. Canary deployments
4. Retry budgets
5. Metrics snapshots
6. Cascade history
7. Idempotency store
8. Schema registry
9. Queue snapshots
10. Chaos rules

### 5.2 Atomic Versioned Commits

All domain writes are staged in-memory and committed atomically via a database RPC (`cp_commit_snapshot`). Each commit produces:

- A monotonically increasing `revision_id`
- A SHA-256 `snapshot_hash` over canonical JSON
- A WAL (write-ahead log) of individual mutations
- A manifest listing per-domain counts

### 5.3 Leader Election

A lease-based leader election prevents multi-instance races:

- Lease TTL: configurable (default 60s)
- Renewal: every TTL/2
- Only the leader performs periodic snapshots
- Non-leaders can still trigger manual flushes

### 5.4 Point-in-Time Restore

The system supports restoring to any previous revision by:

1. Loading domain rows filtered by `revision_id`
2. Optionally replaying WAL from restored revision to latest
3. Verifying snapshot hash integrity

---

## 6. Constant Learning Mode (CLM)

### 6.1 Design

CLM provides always-on, rate-limited, reflective learning:

- **Budget Governor:** Daily token and call limits
- **Topic Bank:** Curriculum organized by category with spaced repetition (SM-2)
- **Quiet Hours:** Learning pauses during configured hours
- **Per-Module CLM:** Each module has a dedicated self-analysis and learning cycle

### 6.2 Encoded Learning

A dedicated learning engine for code-writing improvement operates 24/7 alongside the general CLM curriculum.

---

## 7. Fault Tolerance

### 7.1 Circuit Breakers

Every node implements an independent circuit breaker with states: closed, half_open, open, rerouting.

### 7.2 Cascade Detection

Temporal correlation of failures across modules within a 10-second window. Chains of 3+ distinct module failures trigger cascade alerts.

### 7.3 Graceful Degradation

Modules can be individually isolated without affecting the rest of the system. The substrate continues operating with degraded integrity scores.

---

## 8. Validation Methodology

### 8.1 Health Verification

The matrix integrity equation is validated by:

1. Computing expected score from known node states
2. Comparing against runtime-computed score
3. Verifying weight invariant (Σ = 1.0)

### 8.2 Persistence Verification

1. Commit a snapshot → restart → rehydrate → verify all domains match
2. Simulate crash mid-commit → verify last committed revision is intact
3. Disable persistence → verify runtime continues without errors

### 8.3 Evolution Verification

1. SEBA proposes a change → governance gate evaluates → verify decision matches policy
2. Apply evolution → verify rollback snapshot exists
3. Verify audit receipt chain integrity (Merkle verification)

---

## 9. Reproducibility

### 9.1 Technology Stack

- **Runtime:** React + TypeScript + Vite
- **State:** Zustand stores
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Styling:** Tailwind CSS
- **3D:** Three.js (React Three Fiber)

### 9.2 Source Availability

The substrate architecture is proprietary. This academic reference provides sufficient detail for independent analysis and verification of claims without exposing implementation source code.

### 9.3 Prior Publications

| Version | Repository | DOI |
|---------|-----------|-----|
| v5.5.0 | OSF: [osf.io/ah7nx](https://osf.io/ah7nx/overview) | — |
| v5.5.0 | Zenodo: [18379258](https://zenodo.org/records/18379258) | — |
| AIGVRN v1.0 | Zenodo: [18209222](https://zenodo.org/records/18209222) | — |

---

## 10. References

1. Sweet, K. E. Jr. (2025). "CMPSBL Substrate OS: A Governed Cognitive Architecture." OSF Preprint.
2. Sweet, K. E. Jr. (2025). "AI Governance Reference Namespace (AIGVRN v1.0)." Zenodo.
3. Piotr Wozniak (1990). "SuperMemo 2 Algorithm." — Basis for spaced repetition in CLM.
4. Michael Nygard (2007). "Release It!" — Circuit breaker pattern reference.
5. Hector Garcia-Molina (1987). "Sagas." — Distributed transaction compensation pattern.
6. Ralph Merkle (1979). "Merkle Trees." — Tamper-evident data structure reference.

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| CCR | Clockless Cognitive Reality — hidden meta-engine (BRAIN, MEMORY, DREAM) |
| OCG | Operational Compliance Grid — infrastructure services (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT) |
| SEBA | Self-Evolving Bounded Agent — autonomous improvement engine |
| CLM | Constant Learning Mode — always-on learning system |
| WAL | Write-Ahead Log — append-only mutation journal |
| TSAC | Truth-Source Alignment Check — verification engine |

---

© 2025–2026 PromptFluid®. All rights reserved.
