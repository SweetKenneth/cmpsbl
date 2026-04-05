# Dual-Layer Deterministic Software Evolution System for Autonomous Primitive-Based Code Hardening Without Source Modification

**U.S. Patent Application No. 64/029,678**  
**Confirmation No. 8985**  
**Inventor:** Kenneth E. Sweet Jr.  
**Assignee:** PromptFluid™ (TX)  
**Filing Status:** Patent Pending  
**Classification:** Cognitive Infrastructure / Deterministic Code Hardening  
**Contact:** ascension@cmpsbl.com

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Plain-Language Summary](#2-plain-language-summary)
3. [Technical Definition](#3-technical-definition)
4. [The Problem Being Solved](#4-the-problem-being-solved)
5. [The Dual-Layer Architecture](#5-the-dual-layer-architecture)
6. [The Deterministic Evolution Pipeline](#6-the-deterministic-evolution-pipeline)
7. [Primitive-Based Code Hardening](#7-primitive-based-code-hardening)
8. [Integrity Verification](#8-integrity-verification)
9. [Artifact Export Structure](#9-artifact-export-structure)
10. [Diagrams](#10-diagrams)
11. [Claims Summary](#11-claims-summary)
12. [Glossary](#12-glossary)

---

## 1. Abstract

A system and method for autonomously hardening software source code through a deterministic, dual-layer architecture that wraps — but never modifies — the original source. The system ingests developer code, performs algorithmic signal detection against a matrix of functional primitives, discovers emergent capability chains via deterministic collision scoring, and exports a sealed runtime artifact. The entire pipeline operates without external artificial intelligence calls, producing reproducible results: identical input code always yields identical hardened output. The hardening layer provides circuit breakers, input validation gates, state mutation governance, health telemetry, and cryptographic integrity verification, all without altering a single byte of the developer's original source code.

---

## 2. Plain-Language Summary

### What It Does (For Non-Technical Readers)

Imagine you write a piece of software — an app, a script, a tool. You hand it to this system. The system:

1. **Reads** your code to understand its structure, dependencies, and potential weak points.
2. **Discovers** what protective capabilities your code needs by matching patterns in your code against a library of 40 functional building blocks (called "primitives").
3. **Wraps** your code in a protective shell — like putting a phone in a case. Your phone (code) is untouched. The case (the hardening layer) adds drop protection, screen guards, and waterproofing.
4. **Gives it back** as a package: your original code + the protective layer + a report of what was discovered and protected.

### Key Principle

**Your code is never changed.** The system adds protection *around* it, not *inside* it.

### Why This Matters

- Traditional code security tools modify your source code, which can introduce new bugs.
- This system keeps your code byte-for-byte identical while adding enterprise-grade protection.
- The process is fully deterministic — no randomness, no AI guessing. Run it twice on the same code, you get the same result.

---

## 3. Technical Definition

**Dual-Layer Deterministic Software Evolution System for Autonomous Primitive-Based Code Hardening Without Source Modification** is defined as:

> A fully algorithmic, zero-external-AI processing pipeline that accepts arbitrary developer source code as input, performs multi-stage structural analysis and signal detection, executes deterministic collision scoring against a fixed matrix of functional primitives, discovers emergent capability chains scored by a composite quality index (CJPI), and exports a dual-layer artifact wherein Layer 1 is the unmodified original source code and Layer 2 is a generated sealed runtime providing autonomous circuit breakers, input validation gates, state mutation governance hooks, health telemetry instrumentation, compressed event reporting, and FNV-1a cryptographic integrity verification — all without modifying the original source code.

### Formal Component Breakdown

| Term | Definition |
|------|-----------|
| **Dual-Layer** | Architecture consisting of Layer 1 (original source, unmodified) and Layer 2 (generated hardening runtime). |
| **Deterministic** | Given identical input, the system always produces identical output. Achieved through FNV-1a seeded PRNG for collision ordering. |
| **Software Evolution** | The process of discovering and applying protective capabilities to source code, advancing it from "raw" to "hardened" state. |
| **Autonomous** | Requires no human intervention during processing. The pipeline runs end-to-end without manual steps. |
| **Primitive-Based** | Hardening capabilities are drawn from a fixed library of 40 functional primitives organized in a 12-12-8-8 structural matrix. |
| **Code Hardening** | The addition of resilience, security, governance, and observability mechanisms to software. |
| **Without Source Modification** | The developer's original source code is included byte-for-byte unchanged in the output artifact. All hardening exists in a separate generated layer. |

---

## 4. The Problem Being Solved

### Current State of the Art

Existing code hardening, security scanning, and code evolution tools suffer from one or more of the following limitations:

1. **Source Modification Required** — Tools like linters with auto-fix, transpilers, and security patchers modify the developer's source code directly. This introduces risk: new bugs, broken logic, changed behavior.

2. **Non-Deterministic Results** — AI-powered code analysis tools produce different results on each run due to model temperature, context window variations, and stochastic inference.

3. **Single-Concern Analysis** — Most tools address one concern (security, performance, or style) in isolation, missing emergent cross-concern interactions.

4. **Human-Dependent Workflows** — Traditional code review and hardening requires human experts at every stage, creating bottlenecks and inconsistency.

### What This Invention Provides

- **Zero source modification** — The original code is never touched.
- **Full determinism** — Same input → same output, always.
- **Multi-concern discovery** — The 40-primitive matrix covers security, resilience, governance, observability, identity, networking, and more.
- **Fully autonomous** — No human intervention required during processing.
- **Zero external AI** — The entire pipeline is pure algorithmic code.

---

## 5. The Dual-Layer Architecture

### Layer 1: Original Source Code

The developer's source code as submitted. Not a copy — the actual file, included byte-for-byte identical in the output artifact. No transformations, no injections, no modifications of any kind.

### Layer 2: Convex Core™ Sealed Artifact

A generated runtime module that wraps Layer 1 without modifying it. Layer 2 is:

- **Generated** — Created algorithmically based on the discoveries made during pipeline processing.
- **Black-boxed** — Delivered as an obfuscated, sealed artifact to protect proprietary logic.
- **Self-verifying** — Contains FNV-1a integrity hashes computed at generation time; verifiable at boot and runtime.

### Layer 2 Contains

| Component | Purpose |
|-----------|---------|
| **Circuit Breakers** | Per-primitive fault isolation. If a discovered capability fails at runtime, the circuit opens to prevent cascade failure. Configurable thresholds and recovery windows. |
| **DEFENSE Gates** | Input validation injected at function boundaries. Prevents unvalidated data from reaching sensitive operations. |
| **GOVERNANCE Hooks** | Audit instrumentation on state mutations. Every state change is logged with before/after values, timestamps, and caller identity. |
| **BEACON Health Signals** | Lightweight health markers emitted at configurable intervals. Enables external monitoring without code instrumentation. |
| **Telemetry Compression** | Event batching achieving approximately 85% reduction in telemetry payload size versus raw event streaming. |
| **Integrity Verification** | FNV-1a hash chain from boot through runtime, ensuring the artifact has not been tampered with. |

### How Layers Interact

```
┌─────────────────────────────────────────────────────┐
│                    RUNTIME                          │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │         LAYER 2: Convex Core™               │   │
│   │  ┌──────────┐ ┌──────────┐ ┌────────────┐   │   │
│   │  │ Circuit  │ │ DEFENSE  │ │ GOVERNANCE │   │   │
│   │  │ Breakers │ │  Gates   │ │   Hooks    │   │   │
│   │  └──────────┘ └──────────┘ └────────────┘   │   │
│   │  ┌──────────┐ ┌──────────┐ ┌────────────┐   │   │
│   │  │ BEACON   │ │Telemetry │ │ Integrity  │   │   │
│   │  │ Signals  │ │Compress  │ │ FNV-1a     │   │   │
│   │  └──────────┘ └──────────┘ └────────────┘   │   │
│   │                                             │   │
│   │   ┌─────────────────────────────────────┐   │   │
│   │   │     LAYER 1: Original Source Code   │   │   │
│   │   │     (BYTE-FOR-BYTE UNMODIFIED)      │   │   │
│   │   └─────────────────────────────────────┘   │   │
│   │                                             │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

  Layer 2 WRAPS Layer 1.
  Layer 1 is NEVER modified.
  All hardening exists in Layer 2.
```

---

## 6. The Deterministic Evolution Pipeline

The system processes source code through a sequential pipeline of 8 phases. Each phase is fully algorithmic — no external AI, no stochastic processes.

### Phase 1: Intake & Classification

```
Input: Developer source code file(s)

Processing:
  1. Language detection (file extension + AST analysis)
  2. Structure analysis (imports, exports, functions, classes)
  3. Dependency graph construction
  4. Security surface scan (known vulnerability patterns)
  5. Complexity metrics (cyclomatic, cognitive, Halstead)

Output: Structured topology representation
```

The system builds a complete structural map of the code: what functions exist, what they call, what data flows between them, where external dependencies are used, and where potential vulnerability surfaces exist.

### Phase 2: Primitive Registration

```
40 functional primitives register their handlers:

Each primitive exposes:
  ├── Input contract   — what signals it responds to
  ├── Output contract  — what it produces when activated
  ├── Confidence threshold — minimum confidence to fire
  └── Fallback behavior — degraded operation if primary fails
```

The 40 primitives are organized in a structural matrix:

| Category | Count | Role |
|----------|-------|------|
| Organs | 12 | Core processing capabilities (BRAIN, MEMORY, IDENTITY, etc.) |
| Layers | 12 | Cross-cutting concerns (DEFENSE, GOVERNANCE, RELAY, etc.) |
| Engines | 8 | Autonomous processing units (NEXUS, CORTEX, BEACON, etc.) |
| Agents | 8 | Specialized operational actors (WRAITH, OBSIDIAN, RAPTOR, etc.) |

### Phase 3: Signal Detection

The system analyzes the source code topology and generates **signals** — structural patterns, risk indicators, capability opportunities. Each signal maps to one or more primitives.

```
Source Code Topology → Signal Detection Engine → Signal Set

Example mappings:
  "unvalidated_input"      → DEFENSE, SANDBOX
  "recursive_structure"    → BRAIN, CORTEX
  "external_api_call"      → NEXUS, RELAY, IMMUNITY
  "state_mutation"         → MEMORY, AUDIT, GOVERNANCE
  "cryptographic_operation"→ IDENTITY, ACCESS
```

**Note:** The specific signal detection patterns — what the system looks for in code and how it extracts signals — constitute a protected trade secret and are not disclosed in this document. The primitive names and their general function are public; the signal extraction logic is not.

### Phase 4: Collision Pass

```
For each signal in the Signal Set:
  For each of the 40 primitives:
    Calculate affinity score:
      base_affinity   = primitive.resolver_match(signal)
      context_bonus   = cross_signal_correlation(signal, other_signals)
      confidence      = base_affinity × context_bonus

    If confidence ≥ primitive.threshold:
      Record collision: (signal, primitive, confidence)
```

**Determinism guarantee:** Collision scoring uses FNV-1a seeded PRNG for per-collision variance. The seed is derived from the input code's structural hash. Same input → same seed → same collision ordering → same results.

### Phase 5: Chain Discovery

Collisions are grouped into capability chains — sequences of primitives that fire on related signals and can be composed into higher-order capabilities.

```
Chain Discovery Algorithm:
  1. SEED:   Start with highest-confidence collision
  2. WALK:   Follow signal dependencies to find related collisions
  3. SCORE:  Each chain receives a compound CJPI score
  4. PRUNE:  Chains below CJPI 68 are discarded
  5. RANK:   Remaining chains ordered by compound score
```

### Phase 6: CJPI Scoring

Each discovered chain is scored using the Crown Jewel Priority Index (CJPI):

```
CJPI = (
  Novelty        × 0.30    // How unique is this capability chain?
  + Utility      × 0.30    // How useful is the discovered capability?
  + Complexity   × 0.20    // How sophisticated is the primitive interaction?
  + Composability × 0.20   // Can this chain combine with others?
)

Tier Classification:
  96–100  →  Apex
  90–95   →  Mythic
  80–89   →  Relic
  68–79   →  Prime
  50–67   →  Mint
   0–49   →  Raw (discarded)
```

### Phase 7: Hardening (Layer 2 Generation)

Based on the discovered chains, the system generates Layer 2:

```
For each discovered primitive in qualifying chains:
  1. Generate circuit breaker (fault isolation)
  2. Generate DEFENSE gate (input validation at function boundaries)
  3. Generate GOVERNANCE hook (state mutation auditing)
  4. Generate BEACON signal (health telemetry marker)
  5. Generate telemetry compression logic (event batching)
  6. Compute FNV-1a integrity hash for this segment

Assemble all generated components into a single sealed artifact.
Compute final FNV-1a hash chain over entire Layer 2.
```

### Phase 8: Export

```
Final Artifact Package:
  ├── {source-file}.{ext}              ← Layer 1: Original code (UNMODIFIED)
  ├── _runtime/
  │   ├── convex-core.{ext}            ← Layer 2: Sealed artifact
  │   ├── chain-executor.{ext}         ← Chain orchestration logic
  │   └── discovery-engine.{ext}       ← Discovery metadata
  ├── REPORT.html                      ← Human-readable discovery report
  ├── USER-GUIDE.html                  ← Integration guide
  ├── cmpsbl-manifest.json             ← Machine-readable metadata
  └── test/                            ← Generated test harness
```

---

## 7. Primitive-Based Code Hardening

### What "Primitive-Based" Means

Rather than applying a fixed set of security rules (like a linter) or relying on AI to suggest fixes (like a copilot), this system uses a **matrix of functional primitives** — self-contained capability units that activate when their signal patterns are detected in the source code.

### The 40-Primitive Matrix

```
┌───────────────────────────────────────────────────────────────┐
│                    40-PRIMITIVE MATRIX                        │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │    12 ORGANS          │  │    12 LAYERS          │          │
│  │  Core Processing      │  │  Cross-Cutting        │          │
│  │                       │  │                       │          │
│  │  BRAIN    MEMORY      │  │  DEFENSE   GOVERNANCE │          │
│  │  CORTEX   IDENTITY    │  │  RELAY     AUDIT      │          │
│  │  NEXUS    ACCESS      │  │  SANDBOX   IMMUNITY   │          │
│  │  ...                  │  │  ...                  │          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │    8 ENGINES          │  │    8 AGENTS           │          │
│  │  Autonomous Units     │  │  Specialized Actors   │          │
│  │                       │  │                       │          │
│  │  BEACON   AUTOMATON   │  │  WRAITH    OBSIDIAN   │          │
│  │  FAILSAFE ARCHITECT   │  │  MONOLITH  RAPTOR     │          │
│  │  ...                  │  │  ...                  │          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                              │
│  Matrix Structure: 12 + 12 + 8 + 8 = 40 Primitives          │
└───────────────────────────────────────────────────────────────┘
```

### How Primitives Harden Code

Each primitive contributes specific hardening capabilities:

| Primitive Type | Hardening Contribution |
|---------------|----------------------|
| **DEFENSE** | Input validation gates at function boundaries. Blocks unvalidated data from reaching sensitive operations. |
| **GOVERNANCE** | State mutation hooks. Logs every state change with before/after snapshots. |
| **BEACON** | Health signal markers. Lightweight probes emitted at intervals for external monitoring. |
| **FAILSAFE** | Circuit breaker implementation. Isolates faults to prevent cascade failures. |
| **MEMORY** | State persistence guards. Ensures state is recoverable after failures. |
| **IDENTITY** | Authentication and authorization checkpoints. |
| **RELAY** | Network communication guards. Timeout enforcement, retry logic. |
| **SANDBOX** | Execution isolation boundaries. Prevents untrusted code from accessing protected resources. |

### Vertical Expansion

Beyond the core 40 primitives, the system supports vertical expansion primitives for specialized domains. During processing, the candidate pool can expand to include domain-specific primitives (e.g., for cybersecurity, robotics, quantum computing). Vertical primitives receive a domain affinity bonus during collision scoring, ensuring specialized capabilities surface when relevant signals are detected.

---

## 8. Integrity Verification

### FNV-1a Hash Chain

The system uses FNV-1a (Fowler–Noll–Vo) hashing to create a tamper-evident integrity chain:

```
Integrity Chain:

  1. BOOT HASH
     Computed over Layer 2 artifact at generation time.
     Stored in cmpsbl-manifest.json.

  2. SEGMENT HASHES
     Each generated component (circuit breaker, gate, hook)
     has its own FNV-1a hash.

  3. CHAIN HASH
     All segment hashes are combined into a single chain hash.
     Any modification to any segment invalidates the chain.

  4. RUNTIME VERIFICATION
     At boot, Layer 2 recomputes hashes and compares against
     stored values. Mismatch → integrity violation → halt.

Verification Flow:
  Boot → Compute hashes → Compare → Match? → Run
                                   → Mismatch? → HALT + alert
```

### Why FNV-1a

- **Deterministic** — Same input always produces same hash.
- **Fast** — Minimal computational overhead at boot and runtime.
- **Non-cryptographic but sufficient** — For integrity verification (not encryption), FNV-1a provides adequate collision resistance with superior performance.

---

## 9. Artifact Export Structure

### Complete Package Diagram

```
artifact-package/
│
├── source/
│   └── {original-file}.{ext}         ← LAYER 1
│       Byte-for-byte identical to submitted code.
│       No modifications. No injections. No transformations.
│
├── _runtime/
│   ├── convex-core.{ext}             ← LAYER 2 (sealed, obfuscated)
│   │   Contains: circuit breakers, DEFENSE gates,
│   │   GOVERNANCE hooks, BEACON signals, telemetry
│   │   compression, FNV-1a integrity chain.
│   │
│   ├── chain-executor.{ext}          ← Chain orchestration
│   │   Executes discovered capability chains in
│   │   deterministic order.
│   │
│   └── discovery-engine.{ext}        ← Discovery metadata
│       Read-only record of what was discovered
│       during pipeline processing.
│
├── REPORT.html                       ← Human-readable report
│   Discovery results, CJPI scores, chain visualizations,
│   primitive activation map, security surface analysis.
│
├── USER-GUIDE.html                   ← Integration guide
│   How to integrate the hardened artifact into
│   the developer's existing build pipeline.
│
├── cmpsbl-manifest.json              ← Machine-readable metadata
│   {
│     "version": "...",
│     "layer1_hash": "...",
│     "layer2_hash": "...",
│     "chain_hash": "...",
│     "discovered_chains": [...],
│     "cjpi_scores": {...},
│     "primitive_activations": [...]
│   }
│
└── test/                             ← Generated test harness
    Automated tests verifying Layer 2 hardening
    does not alter Layer 1 behavior.
```

---

## 10. Diagrams

### Diagram A: End-to-End Pipeline

```
INPUT                    PROCESSING                              OUTPUT
─────                    ──────────                              ──────

                    ┌─────────────────────────────────────┐
                    │     DETERMINISTIC PIPELINE           │
                    │                                     │
 Developer    ────► │  Phase 1: Intake & Classification   │
 Source Code        │          │                          │
                    │          ▼                          │
                    │  Phase 2: Primitive Registration    │
                    │          │                          │
                    │          ▼                          │
                    │  Phase 3: Signal Detection          │
                    │          │                          │
                    │          ▼                          │
                    │  Phase 4: Collision Pass            │
                    │          │                          │
                    │          ▼                          │     ┌──────────────┐
                    │  Phase 5: Chain Discovery           │────►│  LAYER 1     │
                    │          │                          │     │  (Unmodified │
                    │          ▼                          │     │   Source)    │
                    │  Phase 6: CJPI Scoring              │     └──────────────┘
                    │          │                          │            +
                    │          ▼                          │     ┌──────────────┐
                    │  Phase 7: Hardening (Layer 2 Gen)   │────►│  LAYER 2     │
                    │          │                          │     │  (Sealed     │
                    │          ▼                          │     │   Runtime)   │
                    │  Phase 8: Export                    │     └──────────────┘
                    │                                     │            +
                    └─────────────────────────────────────┘     ┌──────────────┐
                                                               │  Report +    │
                    Zero external AI calls.                     │  Manifest +  │
                    Fully deterministic.                        │  Tests       │
                    Same input → same output.                   └──────────────┘
```

### Diagram B: Dual-Layer Runtime Architecture

```
    ┌──────────────────────────────────────────────────────────────┐
    │                        RUNTIME HOST                          │
    │                                                              │
    │  ┌────────────────────────────────────────────────────────┐  │
    │  │               LAYER 2: Convex Core™                   │  │
    │  │                                                        │  │
    │  │   INBOUND REQUEST                                      │  │
    │  │         │                                              │  │
    │  │         ▼                                              │  │
    │  │   ┌───────────┐    ┌──────────────┐                    │  │
    │  │   │ INTEGRITY │───►│  FNV-1a      │──► OK? Continue    │  │
    │  │   │  CHECK    │    │  VERIFY      │──► FAIL? Halt      │  │
    │  │   └───────────┘    └──────────────┘                    │  │
    │  │         │                                              │  │
    │  │         ▼                                              │  │
    │  │   ┌───────────┐                                        │  │
    │  │   │ DEFENSE   │──► Validate inputs at boundary         │  │
    │  │   │  GATE     │──► Block malformed data                │  │
    │  │   └───────────┘                                        │  │
    │  │         │                                              │  │
    │  │         ▼                                              │  │
    │  │   ┌───────────┐                                        │  │
    │  │   │ CIRCUIT   │──► Check breaker state                 │  │
    │  │   │ BREAKER   │──► Open? → Fallback path               │  │
    │  │   └───────────┘──► Closed? → Continue                  │  │
    │  │         │                                              │  │
    │  │         ▼                                              │  │
    │  │  ┌─────────────────────────────────────────────────┐   │  │
    │  │  │            LAYER 1: Original Source              │   │  │
    │  │  │                                                 │   │  │
    │  │  │   Developer's code executes here.               │   │  │
    │  │  │   Byte-for-byte identical to what was           │   │  │
    │  │  │   submitted. No modifications.                  │   │  │
    │  │  │                                                 │   │  │
    │  │  └─────────────────────────────────────────────────┘   │  │
    │  │         │                                              │  │
    │  │         ▼                                              │  │
    │  │   ┌───────────┐                                        │  │
    │  │   │GOVERNANCE │──► Log state mutations                 │  │
    │  │   │  HOOK     │──► Record before/after + caller        │  │
    │  │   └───────────┘                                        │  │
    │  │         │                                              │  │
    │  │         ▼                                              │  │
    │  │   ┌───────────┐    ┌──────────────┐                    │  │
    │  │   │  BEACON   │───►│  TELEMETRY   │──► Compressed      │  │
    │  │   │  SIGNAL   │    │  COMPRESS    │    event batch      │  │
    │  │   └───────────┘    └──────────────┘    (~85% smaller)  │  │
    │  │                                                        │  │
    │  └────────────────────────────────────────────────────────┘  │
    │                                                              │
    │   OUTBOUND RESPONSE                                          │
    └──────────────────────────────────────────────────────────────┘
```

### Diagram C: Collision & Chain Discovery

```
    SOURCE CODE TOPOLOGY
            │
            ▼
    ┌───────────────────┐
    │ SIGNAL DETECTION  │
    │                   │
    │ Extract patterns: │
    │ • unvalidated_input│
    │ • state_mutation  │
    │ • external_api    │
    │ • recursive_struct│
    │ • crypto_operation│
    └───────┬───────────┘
            │
            ▼ Signal Set
    ┌───────────────────────────────────────────────────────┐
    │                  COLLISION PASS                        │
    │                                                       │
    │  Signal: "unvalidated_input"                          │
    │    × DEFENSE  → confidence 0.94  ✓ COLLISION          │
    │    × SANDBOX  → confidence 0.87  ✓ COLLISION          │
    │    × BRAIN    → confidence 0.31  ✗ below threshold    │
    │    × MEMORY   → confidence 0.22  ✗ below threshold    │
    │    ...                                                │
    │                                                       │
    │  Signal: "state_mutation"                              │
    │    × GOVERNANCE → confidence 0.96  ✓ COLLISION         │
    │    × AUDIT      → confidence 0.91  ✓ COLLISION         │
    │    × MEMORY     → confidence 0.88  ✓ COLLISION         │
    │    ...                                                │
    │                                                       │
    │  (Repeat for all signals × all 40 primitives)         │
    │                                                       │
    │  Determinism: FNV-1a seeded PRNG from input hash      │
    │  Same input → same seed → same collisions             │
    └───────────────────┬───────────────────────────────────┘
                        │
                        ▼ Collision Set
    ┌───────────────────────────────────────────────────────┐
    │                CHAIN DISCOVERY                         │
    │                                                       │
    │  1. SEED:  Highest-confidence collision                │
    │  2. WALK:  Follow signal dependencies                  │
    │  3. SCORE: Compound CJPI per chain                     │
    │  4. PRUNE: Discard chains < CJPI 68                    │
    │  5. RANK:  Order by score                              │
    │                                                       │
    │  Discovered Chain Example:                             │
    │  ┌────────┐   ┌──────────┐   ┌────────────┐           │
    │  │DEFENSE │──►│GOVERNANCE│──►│  BEACON    │           │
    │  │ (0.94) │   │  (0.96)  │   │  (0.89)   │           │
    │  └────────┘   └──────────┘   └────────────┘           │
    │  Chain CJPI: 91 (Mythic Tier)                          │
    └───────────────────────────────────────────────────────┘
```

### Diagram D: Determinism Guarantee

```
    RUN 1                              RUN 2
    ─────                              ─────

    Input: app.py ──┐              Input: app.py ──┐
                    │                              │
                    ▼                              ▼
    ┌───────────────────┐          ┌───────────────────┐
    │  Structural Hash  │          │  Structural Hash  │
    │  = 0xA7F3B2C1     │          │  = 0xA7F3B2C1     │
    └─────────┬─────────┘          └─────────┬─────────┘
              │                              │
              ▼                              ▼
    ┌───────────────────┐          ┌───────────────────┐
    │  FNV-1a Seed      │          │  FNV-1a Seed      │
    │  = 0xA7F3B2C1     │          │  = 0xA7F3B2C1     │
    └─────────┬─────────┘          └─────────┬─────────┘
              │                              │
              ▼                              ▼
    ┌───────────────────┐          ┌───────────────────┐
    │  Same signals     │          │  Same signals     │
    │  Same collisions  │          │  Same collisions  │
    │  Same chains      │          │  Same chains      │
    │  Same CJPI scores │          │  Same CJPI scores │
    │  Same Layer 2     │          │  Same Layer 2     │
    └─────────┬─────────┘          └─────────┬─────────┘
              │                              │
              ▼                              ▼
    ┌───────────────────┐          ┌───────────────────┐
    │  Output artifact  │    ══    │  Output artifact  │
    │  (IDENTICAL)      │          │  (IDENTICAL)      │
    └───────────────────┘          └───────────────────┘

    GUARANTEE: Same input code will ALWAYS produce
    the same hardened artifact. No randomness.
    No AI inference. No stochastic processes.
```

---

## 11. Claims Summary

The following novel claims are asserted by this patent application:

### Claim 1: Dual-Layer Architecture
A method for hardening software source code using a dual-layer architecture wherein the first layer is the unmodified original source code and the second layer is a generated runtime artifact that provides hardening capabilities without modifying the first layer.

### Claim 2: Deterministic Primitive Collision
A method for discovering software hardening opportunities through deterministic collision scoring between detected code signals and a fixed matrix of functional primitives, using seeded pseudo-random number generation to ensure identical inputs always produce identical discovery results.

### Claim 3: Zero-External-AI Processing
A fully algorithmic pipeline for code analysis, capability discovery, and artifact generation that operates without any external artificial intelligence calls, model inference, or stochastic processes.

### Claim 4: Signal-to-Primitive Mapping
A resolver/handler pattern wherein code signals — patterns detected in source code structure — are systematically matched against primitive input contracts to determine which hardening capabilities should be activated.

### Claim 5: Self-Verifying Artifacts
A method for producing sealed runtime artifacts that contain embedded FNV-1a integrity hash chains, enabling self-verification at boot and runtime to detect tampering or corruption.

### Claim 6: Autonomous Multi-Concern Hardening
A system that autonomously applies hardening across multiple concerns (security, resilience, governance, observability, identity, networking) in a single processing pass through a unified primitive matrix, without requiring separate tools or manual intervention for each concern.

### Claim 7: Chain Discovery via Compound Scoring
A method for discovering emergent capability chains — ordered sequences of primitives that fire on related signals — and scoring them using a composite quality index (CJPI) that evaluates novelty, utility, complexity, and composability.

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| **Ascension** | The commercial name for the complete pipeline (Phases 1–8). |
| **BEACON** | A primitive providing health signal markers for external monitoring. |
| **CJPI** | Crown Jewel Priority Index. Composite score (0–100) for rating discovered capability chains. |
| **Circuit Breaker** | Fault isolation mechanism. Opens on failure to prevent cascade; closes after recovery window. |
| **Collision** | An event where a detected code signal matches a primitive's input contract above the confidence threshold. |
| **Convex Core™** | Commercial name for the Layer 2 sealed runtime artifact. |
| **DEFENSE Gate** | Input validation injected at function boundaries. |
| **Deterministic** | Producing identical output from identical input, with no randomness. |
| **FNV-1a** | Fowler–Noll–Vo hash function, variant 1a. Used for integrity verification throughout the system. |
| **GOVERNANCE Hook** | Audit instrumentation that logs state mutations with before/after values. |
| **Hardening** | The process of adding resilience, security, and observability mechanisms to software. |
| **Layer 1** | The unmodified original source code. |
| **Layer 2** | The generated sealed runtime artifact (Convex Core™). |
| **Primitive** | A self-contained functional capability unit in the 40-primitive matrix. |
| **Signal** | A pattern, risk indicator, or structural characteristic detected in source code. |
| **Signal Detection** | The process of analyzing source code to extract signals (protected trade secret). |

---

## Legal Notices

**Patent Pending** — U.S. Patent Application No. 64/029,678  
**Inventor:** Kenneth E. Sweet Jr.  
**Assignee:** PromptFluid™ (TX)  
**Brand:** CMPSBL®  

The signal detection patterns, collision scoring heuristics, and internal pipeline mechanics described herein constitute protected trade secrets of CMPSBL® / PromptFluid™. This document is prepared for patent filing purposes and authorized legal review only.

© 2025–2026 CMPSBL® / PromptFluid™. All rights reserved.
