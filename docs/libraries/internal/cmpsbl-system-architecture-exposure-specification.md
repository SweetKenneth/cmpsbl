# CMPSBL® System Architecture & Exposure Specification

**Version:** 1.0.0  
**Date:** April 10, 2026  
**Author:** Kenneth E. Sweet Jr.  
**Classification:** INTERNAL — Reference Architecture Document  
**Status:** Canonical

---

## 1. Executive Overview

CMPSBL® is a cognitive infrastructure substrate — not an agent platform, not a framework. It provides deterministic discovery, classification, and hardening of software artifacts through a dual-layer architecture protected by two U.S. patent applications (Nos. 64/029,678 and 64/031,637).

### What "Dual-Layer Architecture" Means in Practical Terms

- **Layer 1 (L1):** The original source code submitted by a user or developer. L1 is treated as immutable — it is never modified. Its SHA-256 hash is computed at intake and preserved through the entire pipeline to guarantee bit-identical integrity.

- **Layer 2 (L2):** A generated orchestration layer that wraps L1 at function boundaries. L2 provides emergent capabilities (telemetry, circuit breakers, governance hooks, integrity verification) without altering the original source. L2 is what the substrate produces — it is the "value-add" layer.

The two layers are structurally independent. L1 can execute on its own. L2 requires L1 to have meaning. The combination is exported as a single artifact, but the boundary between them is cryptographically provable.

---

## 2. System Topology

The following describes the major directories in the production codebase and their architectural roles.

### 2.1 `src/core/`

**Responsibility:** Runtime kernel — boot sequence, event bus, lifecycle management, diagnostics, and internal registry.

| Subdirectory | Role |
|---|---|
| `boot/` | System initialization and First Contact ceremony |
| `bus/` | Internal event bus for cross-primitive communication |
| `clock/` | Timing primitives for scheduled operations |
| `diagnostics/` | Runtime health introspection |
| `events/` | Event type definitions and dispatch |
| `graph/` | Dependency graph resolution |
| `lifecycle/` | Primitive lifecycle (init → active → teardown) |
| `metrics/` | Performance counters and timing |
| `registry/` | Runtime primitive registry (not to be confused with the discovery registry) |
| `resilience/` | Circuit breaker and graceful degradation |
| `runtime/` | Core execution context |

**Participates in:** Runtime, binding, reporting.

### 2.2 `src/hooks/`

**Responsibility:** React integration layer — exposes substrate state to the UI through standard React hooks. These are the primary public interface for front-end consumers.

Notable hooks include:
- `useSubstrate` / `useSubstrateOS` — substrate lifecycle access
- `useCapabilities` / `useDiscoveredPipelines` — read discovered primitive data
- `useModuleHealth` / `useHardeningHealth` — observable health signals
- `useGateEngine` / `useEvolutionControlCenter` — governance-gated operations
- `useScanPersistence` / `useDownloadCeremony` — Ascension session management
- `useUserRole` / `useTrialAccess` — access control and entitlement

**Participates in:** Reporting, UI binding. Does NOT participate in generation or core runtime.

### 2.3 `src/lib/substrate/`

**Responsibility:** Central version registry, configuration constants, and substrate-wide shared utilities.

| File | Role |
|---|---|
| `versions.ts` | Single source of truth for all version constants |
| Other substrate-level configs | Cross-cutting constants consumed by all primitives |

**Participates in:** Configuration. Referenced by all layers.

### 2.4 `src/substrate/`

**Responsibility:** Telemetry and provenance utilities — fingerprinting, memory lineage tracking, decode auditing, and substrate-level metrics.

| File | Role |
|---|---|
| `pipeline-fingerprint.ts` | FNV-1a fingerprint generation for artifact provenance |
| `memory-lineage.ts` | Memory Stream lineage tracking |
| `decode-audit.ts` | Decode contract verification |
| `substrate-metrics.ts` | Aggregate substrate health metrics |

**Participates in:** Reporting, verification.

### 2.5 `src/lib/ascension/`

**Responsibility:** The Ascension engine — the core discovery and classification pipeline. This is where source code is scanned, primitives are detected, collision scores computed, and artifacts generated.

Key components:
- `capability-scanner-primitive.ts` — Signal detection against source code
- `primitive-extractor.ts` — Extracts primitive candidates from scan results
- `execution-binding.ts` — Binds discovered primitives to L2 orchestration
- `quality-gate.ts` — Enforces minimum thresholds before artifact generation
- `scan-integrity.ts` — Validates scan consistency
- `chain-injection.ts` — Injects deterministic chain ordering into exports
- `vertical-collision.ts` — Vertical-specific scoring adjustments
- `feedback-loop.ts` — Post-scan learning integration

**Participates in:** Generation (primary), binding, reporting.

### 2.6 `src/lib/factory/`

**Responsibility:** Artifact manufacturing — code generation, report generation, certificate production, and the universal pool scanner that assembles the full primitive candidate pool (~159 candidates across all verticals).

Key components:
- `universal-pool-scanner.ts` — Assembles and sequences the full primitive pool
- `collision-engine.ts` — Computes CJPI collision scores
- `generate-refurbished-code.ts` — Produces the L2 wrapped artifact
- `html-report-generator.ts` — Generates branded HTML reports
- `certificate.ts` — Produces cryptographic proof certificates
- `product-compiler.ts` — Compiles final export packages
- `genesis-seed-engine.ts` — Seeds vertical-specific discovery pools
- `vertical-factory-engine.ts` — Vertical-aware factory routing

**Participates in:** Generation, reporting.

### 2.7 `src/crownjewels/`

**Responsibility:** Crown Jewel registry — the curated catalog of high-value capability discoveries organized by tier (S-Tier, A-Tier) and by vertical (Cyber, Robotics, Quantum, LLM, Agency, Media, Fintech, Ultimate).

| File | Role |
|---|---|
| `canon.ts` | Master Crown Jewel definitions |
| `types.ts` | Type definitions for the jewel registry |
| `s-tier.registry.json` | Serialized S-Tier registry |
| `similarity-guard.ts` | Prevents duplicate/near-duplicate jewel registration |
| `*-vertical-registry.ts` | Per-vertical jewel catalogs (8 files) |

**Participates in:** Reporting, discovery scoring. Does NOT participate in runtime binding.

### 2.8 `src/services/`

**Responsibility:** External service adapters. Currently contains the bot exporter service.

**Participates in:** External integration.

### 2.9 `src/integrations/`

**Responsibility:** Third-party integration clients (database, auth). Auto-generated files — not manually edited.

**Participates in:** Data persistence, authentication.

### 2.10 `src/lib/` (Selected Primitive Libraries)

Each primitive in the 40-primitive matrix has a corresponding library directory:

| Category | Directories |
|---|---|
| **Organs** | `core/`, `system/`, `brain/`, `memory/`, `nerve/`, `nexus/`, `relay/`, `compass/`, `medic/`, `atlas/` |
| **Layers** | `defense/`, `immune/`, `evolution/`, `shadow/`, `vision/`, `gate/`, `integration/`, `treaty/` |
| **Engines** | `dream/`, `harvest/`, `forge/`, `phantom/`, `ripple/`, `ascension/`, `discovery/` |
| **Agents** | `decode/`, `audit/`, `inclusive/`, `engineer/`, `oracle/`, `cortex/`, `contracts/` |
| **Infrastructure** | `mana/`, `nexus/`, `telemetry/`, `factory/`, `execution/`, `registry/` |

Each directory contains the primitive's implementation, types, and any sub-modules. The internal logic of these primitives is proprietary.

---

## 3. Attachment Model (High-Level)

### 3.1 What Attachment Means

"Attachment" refers to the process by which Layer 2 (the generated orchestration layer) binds to Layer 1 (the original source code) at function boundaries. The result is a composite artifact where:

- L1 functions execute normally
- L2 wrappers intercept at entry/exit points to provide observability, governance, and resilience
- The original source code is never modified — attachment operates at the runtime interface

### 3.2 Lifecycle

1. **Scan:** Ascension analyzes L1 source code to detect structural and behavioral signals
2. **Classify:** Detected signals are mapped to the 40-primitive taxonomy via collision scoring
3. **Score:** CJPI (Composability, Justification, Primitive Identity) scores determine capability strength
4. **Sequence:** Selected primitives are ordered into a deterministic execution chain (13 stages)
5. **Bind:** L2 code is generated with function-boundary wrappers targeting specific L1 exports
6. **Package:** The dual-layer artifact is packaged with proof certificates, reports, and integration guides

### 3.3 What Attachment Does NOT Do

- It does NOT modify L1 source code
- It does NOT inject runtime dependencies into L1
- It does NOT require a persistent connection to CMPSBL services after export
- It does NOT execute L1 code during the scan phase — analysis is static/structural

---

## 4. Exposure Classification

The following table defines what parts of the system are safe to expose publicly versus what must remain protected.

| Component | Exposure Level | Reason |
|---|---|---|
| **`src/hooks/`** | **Public** | React integration layer. Exposes observable state only. Contains no proprietary logic. Safe for documentation, examples, and developer reference. |
| **Registry / Verification Layer** (`src/lib/registry/`, `/verify/:fingerprint`) | **Public** | Verification is intentionally public — it validates artifact provenance without revealing how artifacts are produced. The public verification page and `__cmpsbl_verify__()` function are designed for external use. |
| **Reports** (HTML reports, PROOF.txt, manifest.json) | **Public** | Export artifacts are designed for external consumption. Reports contain scores, primitive lists, and fingerprints — but not scoring algorithms or signal vocabularies. |
| **Crown Jewels** (`src/crownjewels/`) | **Restricted** | Registry metadata (names, tiers, categories) may be referenced in public documentation. Internal scoring weights, similarity thresholds, and seed algorithms must remain private. |
| **`src/core/`** | **Private** | Runtime kernel internals. Boot sequence, event bus topology, lifecycle state machines, and resilience logic are proprietary. External consumers interact through hooks, never directly. |
| **`src/lib/ascension/`** | **Private** | The discovery and classification engine. Signal vocabularies, primitive extraction algorithms, collision scoring formulas, chain injection logic, and quality gate thresholds are trade secrets. |
| **`src/lib/factory/`** | **Private** | Artifact generation internals. The universal pool scanner, code generation templates, collision engine, and CJPI scoring weights are proprietary. |
| **`src/lib/mana/`** | **Private** | The Silent Software Symbiosis Engine. Attachment mechanics, Lex governance rules, and wrapper generation are covered by U.S. Patent App. No. 64/031,637. |
| **Binding Logic** (`execution-binding.ts`, `chain-injection.ts`) | **Private** | Determines how L2 wraps L1. Revealing this would enable circumvention of the attachment model. |
| **Orchestration Systems** (`src/lib/nexus/`, `src/lib/execution/`) | **Private** | AI routing, fleet management, load balancing, and circuit breaker implementations are internal infrastructure. |
| **Primitive Libraries** (`src/lib/dream/`, `src/lib/brain/`, etc.) | **Private** | Individual primitive implementations contain proprietary algorithms. Their existence and high-level purpose may be documented; their internals must not be exposed. |
| **`src/lib/substrate/`** | **Restricted** | Version constants and configuration are safe to reference. Internal substrate wiring must remain private. |
| **`src/substrate/`** | **Restricted** | Fingerprinting algorithms and lineage tracking are partially public (fingerprints appear in exports). The implementation of how fingerprints are computed is private. |
| **Exported Artifacts** (ZIP contents) | **Public** | The entire export package (ascended source, proof, manifest, reports, integration guide) is designed for the end user. It is functional and self-contained but reveals nothing about internal discovery or scoring. |

### Exposure Level Definitions

- **Public:** Safe to document, demonstrate, open-source, or expose in API surfaces. No IP risk.
- **Restricted:** High-level descriptions are acceptable. Implementation details, algorithms, weights, and thresholds must not be shared externally.
- **Private:** Must never be exposed in documentation, exports, demos, or external communications. Protected as trade secrets and/or patent-pending IP.

---

## 5. Verification Model

### 5.1 Capability States (5-State Lifecycle — v2.0.0)

Every capability in a CMPSBL artifact exists in exactly one of five strictly-ordered states:

| # | State | Definition | Evidence Required |
|---|-------|-----------|-------------------|
| 1 | **Detected** | Primitive identified during source scan | Signal match in source analysis |
| 2 | **Generated** | L2 orchestration code produced | Wrapper exists in output artifact |
| 3 | **Bound** | Wrappers attached at function boundaries | Structural linkage confirmed in L2 |
| 4 | **Activated** | Runtime hooks observed firing | Execution path confirmation |
| 5 | **BehaviorallyVerified** | Observable runtime effect confirmed | State change, interception, or telemetry observed |

States are strictly ordered — a later state implies all prior states. No state may be claimed without evidence for all preceding states. For Ascension exports, the pipeline terminates at **Bound** (Stage 3). Activation and behavioral verification require the consuming application to integrate and execute the artifact.

### 5.2 Verification Split

**A. Provenance Verification** confirms:
- Artifact origin (fingerprint, serial)
- L1 integrity (SHA-256 hash match)
- Deterministic generation (same input → same L2)
- Primitive presence and chain position

**B. Behavioral Verification** confirms:
- Wrapper execution actually occurred (interception confirmed)
- Observable effects happened (state change, telemetry emit)
- Each primitive's claimed capability is producing measurable results

### 5.3 Runtime Verification Script (4-Gate Integrity)

Exported artifacts include a `RUN_VERIFICATION.ts` script that enforces:

1. **Fingerprint binding** — Artifact identity must match execution context
2. **Fail-closed coverage** — Every expected primitive must have a corresponding probe (no silent omissions)
3. **Tamper detection** — Unexpected/injected primitives are logged as warnings
4. **Delta reporting** — Expected vs. observed vs. extra counts for instant interpretability

### 5.4 How Verification Should Be Interpreted

Verification confirms that:
1. The artifact was produced by the CMPSBL Ascension engine
2. The L1 source code has not been modified since scanning
3. The declared primitives were bound at the stated chain positions
4. The CJPI scores were computed deterministically

Verification does NOT confirm:
- That the primitives will produce specific business outcomes
- That the L2 wrappers are "active" in a runtime sense unless Stage 4+ is proven
- That the collision scores represent a qualitative judgment of code quality

---

## 6. Public Interface

### 6.1 What an External Developer Can Access

| Interface | Access Method | Description |
|---|---|---|
| Ascension scan | Web UI or API | Submit source code, receive classification results |
| Exported artifact | ZIP download | Dual-layer code package with proof and reports |
| Verification page | `/verify/:fingerprint` | Public lookup of artifact provenance |
| `__cmpsbl_verify__()` | Embedded in artifact | Local integrity check function |
| `manifest.json` | In export ZIP | Machine-readable primitive manifest with scores |
| `PROOF.txt` | In export ZIP | Cryptographic certificate of provenance |
| `INTEGRATION.md` | In export ZIP | Step-by-step deployment guide |
| React hooks | `src/hooks/` | UI integration for substrate state observation |
| NPM packages | `@cmpsbl/*` | Published SDK, runtime, and tooling packages |

### 6.2 What Is Intentionally Observable

- Primitive names and their high-level descriptions
- CJPI scores (numeric) and tier classifications
- Chain position ordering (which primitive runs in which stage)
- Collision scores (relative strength of each primitive match)
- Artifact fingerprints and SHA-256 hashes
- Synergy pair associations (which primitives boost each other)
- Vertical classification (which industry domain was detected)

### 6.3 What Is Intentionally Hidden

- Signal vocabularies (the regex/keyword patterns used to detect primitives)
- CJPI scoring weights (the relative importance of each scoring dimension)
- Collision score formulas (how raw signals become numeric scores)
- Cascade decay constants (the mathematical decay model)
- Quality gate thresholds (minimum scores required for inclusion)
- Chain sequencing algorithm (how the 13-stage order is determined)
- L2 wrapper generation templates (how orchestration code is produced)
- Mana attachment mechanics (how L2 binds to L1 at runtime)

---

## 7. Security Boundaries

### 7.1 What Is Hidden and Why

| Boundary | What Is Hidden | Why |
|---|---|---|
| **Discovery Engine** | Signal vocabularies, affinity maps, structural signature patterns | These are the "eyes" of the system. Exposing them would allow competitors to replicate the detection capability or craft adversarial inputs that game the scanner. |
| **Scoring Engine** | CJPI weights, collision formulas, tier thresholds, cascade decay constants | These determine the system's judgment. Exposing them would allow score manipulation and undermine the objectivity of classification. |
| **Attachment Engine (Mana)** | Proxy-based wrapping, prototype chain binding, Lex governance rules | Patent-pending (App. No. 64/031,637). Exposing implementation would enable circumvention and weaken the IP position. |
| **DREAM Synthesis** | Algorithmic offline synthesis, sub-threshold pattern emergence | Patentable proprietary algorithm. No AI components — pure deterministic processing. Exposing internals would eliminate the competitive moat. |
| **Chain Architecture** | Stage-to-position mapping, Iron Law enforcement, synergy boost formulas | Trade secret. The specific ordering and boost mechanics are the result of extensive empirical tuning. |

### 7.2 How the System Can Be Trusted Without Exposure

1. **Cryptographic provenance:** Every artifact includes a SHA-256 hash of the original source and a unique fingerprint. Tampering is detectable.
2. **Deterministic reproducibility:** The same source code, scanned with the same engine version, produces the same classification and scores. Results are reproducible.
3. **Inspectable output:** The exported L2 code is readable. A developer can inspect the generated wrappers, dispatch tables, and orchestration logic — they just cannot see how those were derived.
4. **Public verification:** The `/verify/:fingerprint` endpoint and the embedded `__cmpsbl_verify__()` function provide independent confirmation without requiring trust in the scanner.
5. **Zero post-export dependency:** Exported artifacts run standalone. There is no callback, no license server, no subscription requirement. The code works or it doesn't — verifiable by execution.

---

## 8. Limitations & Guarantees

### 8.1 What the System Does NOT Automatically Do

- **Does not execute user code during scanning.** Analysis is structural/static. No source code is run, evaluated, or interpreted at runtime during the Ascension process.
- **Does not guarantee runtime behavior.** L2 wrappers are structural enhancements. They do not autonomously enforce governance at runtime unless explicitly integrated by the developer.
- **Does not modify L1 source code.** The original source is concatenated verbatim into the export. Any modification invalidates the SHA-256 proof.
- **Does not require external AI.** The Ascension engine uses zero external AI calls. All classification is deterministic and algorithmic.
- **Does not persist user code for training.** Submitted source code is stored in session records for retrieval purposes only. It is not used to train models or improve detection algorithms.

### 8.2 What Requires Explicit Binding or Activation

| Capability | Requires |
|---|---|
| L2 governance hooks (circuit breakers, rate limiters) | Developer must integrate L2 wrappers into their deployment pipeline |
| Mana attachment (runtime wrapping) | Explicit attachment call with Lex governance approval |
| Memory Stream participation | Active subscription tier and autonomous cycle enablement |
| DREAM synthesis contributions | Requires Memory Stream data and 8-hour autonomous cycle completion |
| Crown Jewel exposure | Governor authorization — not automatic, not tier-gated |
| Vertical-specific expansion primitives | Vertical must be selected/purchased; non-selected verticals are read-only |

### 8.3 What Is Optional vs. Guaranteed

| Aspect | Status | Notes |
|---|---|---|
| L1 integrity preservation | **Guaranteed** | SHA-256 hash computed at intake, embedded in proof certificate |
| Deterministic primitive classification | **Guaranteed** | Same input → same output for a given engine version |
| CJPI score computation | **Guaranteed** | Algorithmic — no randomness, no external dependencies |
| Proof certificate generation | **Guaranteed** | Every successful scan produces a PROOF.txt |
| Standalone artifact execution | **Guaranteed** | Zero post-export dependencies on CMPSBL infrastructure |
| Specific primitive selection | **Optional** | Depends on source code signals. Not all primitives will match all code. |
| Synergy boost application | **Optional** | Only applies when both primitives in a synergy pair are co-selected |
| Vertical expansion primitives | **Optional** | Only activated for purchased/selected verticals |
| Runtime Mana attachment | **Optional** | Requires explicit developer action and Lex governance approval |
| Memory Stream / DREAM synthesis | **Optional** | Requires active subscription and autonomous cycle scheduling |

---

## Appendix A: Primitive Taxonomy Summary

The substrate operates on a fixed 40-primitive matrix:

| Category | Count | Role |
|---|---|---|
| Organs | 12 | Core system functions (CORE, SYSTEM, BRAIN, MEMORY, NERVE, NEXUS, IDENTITY, SOVEREIGN, ATLAS, MEDIC, RELAY, CONSCIENCE) |
| Layers | 12 | Cross-cutting concerns (DEFENSE, IMMUNITY, GOVERNANCE, TREATY, EVOLUTION, REFLEX, COMPASS, INTEGRATION, INTENT, ACCESS, VISION, SHADOW) |
| Engines | 8 | Active processing (DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE) |
| Agents | 8 | Autonomous task execution (ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER) |

Each vertical (Cyber, Robotics, Quantum, LLM, Agency, Media, Fintech, Ultimate) adds 16 expansion primitives (8 engines + 8 agents), bringing the total candidate pool to ~159 primitives.

## Appendix B: Patent References

| Filing | Title | Number | Coverage |
|---|---|---|---|
| Filing 001 | Deterministic Discovery & Hardening | U.S. App. No. 64/029,678 | Ascension engine, CJPI scoring, dual-layer architecture |
| Filing 002 | Silent Software Symbiosis | U.S. App. No. 64/031,637 | Mana engine, Lex governance, runtime attachment |
| Filing 003 | Unified Software Integrity Lifecycle | Pending | Consolidated lifecycle: Ascension → Mana → Shield |

---

© 2025–2026 CMPSBL®. All rights reserved.  
Kenneth E. Sweet Jr. · PromptFluid™ TX  
Internal Reference Document — v1.0.0
