# 05 — Capability Export System

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document describes how crystallized capabilities are exported from the CMPSBL substrate as portable, standalone artifacts.

---

## 1. Overview

The Capability Export System transforms crystallized discoveries into portable software packages that run independently of the full substrate. Every export includes a bundled Mini Runtime that reproduces the required node capability contracts.

---

## 2. What Gets Exported

A Capability Pack export includes:

| Component | Description |
|---|---|
| **Implementation** | The capability code in the selected target language |
| **Mini Runtime™** | Zero-dependency TypeScript runtime reproducing substrate contracts |
| **README** | Cinematic functional description, use cases, distribution recommendations |
| **License** | CMPSBL capability license |
| **Technical Dossier** | Architecture details, valuation breakdown, dependency map |
| **Test Bench** | Verification suite for the exported capability |
| **Build Config** | Build configuration for the target environment |
| **Manifest** | JSON metadata: CJPI score, provenance, estimated market value |

---

## 3. Universal Export Adapter

The Universal Export Adapter generates capability implementations across 25 target environments:

### Software Languages (18)

| Tier | CJPI | Languages |
|---|---|---|
| Mint (68+) | Entry | PHP, Ruby, Lua, Elixir, Dart, Kotlin, Scala |
| Prime (80+) | Standard | TypeScript, JavaScript, Python, Go, Java, Swift, Haskell |
| Relic (90+) | Premium | Rust, C, C++, Zig |

### Hardware Description Languages (7)

| Tier | CJPI | Languages |
|---|---|---|
| Silicon (94+) | Hardware | Verilog, VHDL, SystemVerilog, Chisel, SpinalHDL, Amaranth, FIRRTL |

Language availability is permanently score-gated. A capability must reach the required tier to unlock each language target.

---

## 4. Export Process

### Step 1: Select Capability

Choose a crystallized memory from the vault. Only capabilities with CJPI ≥ 68 are eligible for export.

### Step 2: Choose Target Language

Select from available languages based on the capability's CJPI tier. Higher-scoring capabilities unlock more language targets.

### Step 3: Generate Export

The Universal Export Adapter generates the capability pack:

1. Transpiles the capability implementation to the target language
2. Bundles the Mini Runtime
3. Generates documentation (README, dossier, license)
4. Creates test bench
5. Packages build configuration
6. Produces manifest with metadata and valuation

### Step 4: Download

The export is delivered as a ZIP bundle containing all components. The manifest includes a structural fingerprint for integrity verification.

---

## 5. Export Limits

Export limits follow the vault system — there are no per-day caps on exports. Vault capacity is governed by subscription tier.

Upload limits for Ascension ingestion are separate and tier-gated:

| Plan | Uploads Per Day |
|---|---|
| Builder | 0 |
| Studio | 3 |
| Creator | 6 |
| Architect | 12 |

---

## 6. Standalone Execution

Every exported capability is fully standalone. The bundled Mini Runtime reproduces:

- CJPI scoring contracts
- Saga orchestration
- Finite state machine execution
- Required node capability interfaces

No network connection to the CMPSBL substrate is required after export. The capability runs entirely within the developer's own environment.

---

## 7. Documentation in Exports

Every export ZIP includes print-ready HTML documents:

- **MEMORY-DETAILS** — Cinematic description of what the software does, expected use cases, and valuation breakdown
- **LICENSE** — Usage terms for the exported capability
- **README** — Integration guide with recommended distribution channels

The documentation is generated from the capability's metadata and CJPI scoring dimensions.

---

## 8. Provenance and Integrity

Each export includes:

- **Structural fingerprint** — Hash-based integrity seal
- **CJPI provenance** — Scoring details and tier classification
- **Node chain** — The substrate nodes involved in the capability
- **Timestamp** — When the capability was crystallized and exported
- **Manifest version** — Export adapter version used

---

## Related Documents

- [Mini Runtime](06-mini-runtime.md)
- [Crystallized Memories](19-crystallized-memories.md)
- [Ascension](20-ascension.md)
- [Developer Guide](03-developer-guide.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
