# 21 — Ascension: Technical Deep Dive

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-17

---

## Purpose

This document provides a comprehensive technical walkthrough of the Ascension lifecycle — the process where developer software enters the CMPSBL cognitive substrate and produces Ascended Memories. It covers each phase in detail, explaining what happens, why it matters, and how developers can maximize the value of their Ascension cycles.

---

## 1. Overview

Ascension transforms external developer software into substrate-enhanced capability artifacts. The process has four sequential phases:

```
INGEST → DISCOVERY → CRYSTALLIZATION → EXPORT
```

Each phase builds on the previous, progressively transforming raw code into portable, enhanced software bundles.

---

## 2. Phase 1 — INGEST

### 2.1 What Happens

Your software is uploaded, analyzed, and registered as the **Auxiliary Node** — a first-class participant in the substrate's 40-primitive cognitive matrix.

### 2.2 File Processing

The ingest system reads your uploaded files with intelligent encoding detection:

- **Encoding support:** UTF-8 and UTF-16 (LE/BE) with automatic BOM detection
- **Maximum file size:** 1 MB per file
- **Supported formats:** 25+ languages across software and hardware description languages

For known source extensions, the system uses direct text reading rather than binary detection heuristics, ensuring reliable ingestion of HDL files (Verilog, VHDL, SystemVerilog) that can be misidentified by generic file readers.

### 2.3 Language Detection

The system detects your source language from file extensions and stores it permanently with the candidate. Supported languages include:

**Software:**
Python, TypeScript, JavaScript, Rust, Go, PHP, Ruby, Swift, Kotlin, Java, C#, C++, C, Lua, Dart, Scala, Elixir, Haskell, Zig

**Hardware Description Languages:**
Verilog, SystemVerilog, VHDL, Bluespec, SPICE, Chisel, Amaranth

### 2.4 Capability Surface Analysis

This is where the substrate begins understanding your code. The system scans your source to build a **capability profile** for the Auxiliary Node:

- **Domain detection:** Your code is analyzed for domain signals — security patterns, machine learning constructs, infrastructure tooling, financial logic, medical terminology, graphics primitives, language processing, and hardware interfaces
- **Functional analysis:** The system extracts function signatures, class declarations, and module boundaries to understand what your code *does*
- **Sector assignment:** Based on the detected domain, your code is placed into the most relevant substrate sector (e.g., security code → DEFENSE sector, ML code → CORTEX sector)

This capability profile determines which substrate primitives your code will interact with most productively during discovery.

### 2.5 Persistence

Your candidate is registered in the artifact registry with full metadata. This registration is user-scoped — your candidates are never visible to other users.

### 2.6 Resilience

The ingest phase implements the **Ironclad v2.0.0** hardening standard:

- **Circuit breaker pattern:** Automatically trips after repeated failures, preventing cascade issues
- **Exponential backoff:** Recovery attempts increase spacing to avoid overwhelming the system
- **Dead-letter logging:** Failed ingests are recorded for debugging

### 2.7 Upload Quotas

Daily upload limits are enforced per subscription tier:

| Plan | Daily Uploads |
|------|--------------|
| Builder | 0 (upgrade required) |
| Studio | 3 |
| Creator | 6 |
| Architect | 12 |

---

## 3. Phase 2 — DISCOVERY (Ascension Cycle)

### 3.1 What Happens

Your code, now operating as the Auxiliary Node, undergoes **collision cycles** against the substrate's 40 permanent nodes across 4 categories. The engine explores how your code's capabilities combine with existing substrate capabilities to produce emergent behaviors.

### 3.2 Multi-Chain Exploration

The discovery engine explores chains of **2 to 6 nodes**, always including your code (the Auxiliary Node). Each chain represents a potential capability combination:

- **2-node chains:** Direct interactions between your code and a single substrate node
- **3-4 node chains:** Multi-hop capability compositions
- **5-6 node chains:** Deep emergent behaviors that only arise from complex interactions

Nodes in the same sector as your code are prioritized for exploration, as they tend to produce the highest-value synergies. Adjacent sectors are also weighted for cross-domain discovery.

### 3.3 Scoring — CJPI

Each discovered chain receives a **Crown Jewel Performance Index (CJPI)** score from 0 to 100, evaluating:

- **Utility** — How practically useful is the combined capability?
- **Novelty** — Has this combination been discovered before?
- **Complexity** — How sophisticated is the interaction?
- **Composability** — Can this capability be combined with other discoveries?
- **Sector coherence** — How well do the participating nodes complement each other?

### 3.4 Tier Classification

Discoveries are classified into tiers based on their CJPI score:

| Tier | Description |
|------|------------|
| **Apex** | Exceptional — rare, high-value emergent capabilities |
| **Mythic** | Outstanding — significant capability enhancements |
| **Relic** | Strong — solid utility with meaningful novelty |
| **Prime** | Good — reliable capability compositions |
| **Mint** | Baseline — simple but functional combinations |
| **Raw** | Below threshold — filtered from results |

### 3.5 Emergent Archetypes

Certain node combinations produce recognized emergent patterns with descriptive names:

- **Invisible Fortress** — Security + stealth capabilities
- **Cognitive Oracle** — Reasoning + prediction capabilities
- **Infinite Foundry** — Data processing + evolution capabilities
- **Neural Mesh** — Hardware + reflex capabilities
- **Ethical Engine** — Compliance + governance capabilities
- **Autonomous Factory** — Infrastructure + fabrication capabilities
- **Digital Sovereign** — Finance + treaty capabilities

These archetypes indicate that your code has activated a well-known synergy pattern within the substrate.

### 3.6 Discovery Pacing

The discovery interface uses cinematic pacing to build suspense as collisions are revealed. If an Apex-tier discovery is found (CJPI ≥ 90), the engine terminates early and announces the exceptional find immediately.

---

## 4. Phase 3 — CRYSTALLIZATION

### 4.1 What Happens

Top discoveries are refined into exportable capability artifacts through a three-stage memory chain.

### 4.2 Memory Chain Stages

1. **Sampling** — The top discoveries (up to 5 per cycle) are selected by CJPI score
2. **Condensing** — Overlapping capabilities are merged and deduplicated
3. **Crystallizing** — The final artifact payload is generated: enhanced code, documentation, and manifest

### 4.3 Quality Scoring

Each crystallized artifact receives a quality score based on:

- The original CJPI score (primary factor)
- Chain diversity — how many different substrate sectors contributed
- Capability density — the ratio of unique capabilities to chain length

---

## 5. Phase 4 — EXPORT

### 5.1 Language Lock

**Exports are locked to your imported source language.** If you ingested Python, you export Python. If you ingested Verilog, you export Verilog. This ensures the exported code integrates directly into your existing stack without translation artifacts.

There is no multi-language export option for Ascension artifacts. This is by design — the purpose of Ascension is to enhance *your* software, not to translate it.

### 5.2 Export Bundle Contents

Each exported ZIP contains:

```
ascended-memory-{name}/
├── manifest.json           — Score, tier, provenance, chain metadata
├── original/               — Your original ingested files (unchanged)
├── src/                    — Substrate-enhanced versions of your code
├── runtime/                — Mini substrate runtime for standalone execution
├── docs/
│   ├── MEMORY-DETAILS.html — Functional description of the capability
│   ├── README.html         — Usage guide
│   └── LICENSE.html        — Distribution license
├── tests/                  — Generated test scaffold
└── build/                  — Build configuration
```

The `original/` folder preserves your exact uploaded files. The `src/` folder contains the substrate-enhanced versions with discovered capabilities integrated.

### 5.3 Export Retirement

When you export a crystallized capability, it is retired from your active discovery pool. This encourages running new Ascension cycles to discover fresh capabilities rather than repeatedly exporting the same result.

### 5.4 Vault Management

You can discard unwanted crystallized artifacts from your vault at any time. Discarded artifacts are permanently removed from your registry.

---

## 6. Recursive Ingestion (The Ascension Loop)

Ascended Memories can be **re-ingested** into the substrate for further discovery:

```
Software → Ascension → Ascended Memory → Re-Ingest → Deeper Discovery → Higher-Tier Memory
```

### 6.1 How It Works

1. Upload the exported `src/` files from a previous Ascension cycle
2. The system detects the same source language and creates a new candidate
3. The substrate-enhanced code contains richer capability patterns, making it a stronger collision target
4. Discovery explores new chains — previously discovered combinations are de-prioritized via novelty scoring
5. Deeper interactions may yield higher-tier (Mythic or Apex) discoveries

### 6.2 Compounding Effect

Each Ascension cycle adds substrate capability patterns to your code. Over multiple cycles, your software accumulates increasingly sophisticated capability compositions:

```
Cycle 1: Raw code → Mint/Prime discoveries
Cycle 2: Enhanced code → Prime/Relic discoveries  
Cycle 3: Deeply enhanced → Relic/Mythic discoveries
Cycle N: Maximally enhanced → Mythic/Apex discoveries
```

The system's novelty scoring ensures that each cycle discovers genuinely new capabilities rather than repeating previous findings.

---

## 7. Security & Isolation

- All artifacts are **user-scoped** — your candidates, discoveries, and crystallized memories are never visible to other users
- Row-Level Security (RLS) is enforced at the database level
- Source code payloads are stored encrypted in the artifact registry
- The Ascension interface is access-gated via PIN authentication

---

## 8. Best Practices

### Maximize Discovery Quality

1. **Upload complete modules** — Partial files produce weaker capability profiles
2. **Include diverse functionality** — Code with multiple capability domains produces richer collisions
3. **Use descriptive function names** — The capability surface analysis extracts meaning from your identifiers

### Leverage the Ascension Loop

1. **Export your best discovery** from each cycle
2. **Re-ingest the enhanced version** to compound capabilities
3. **Track your tier progression** — aim for Mythic/Apex over multiple cycles

### Organize Your Vault

1. **Discard low-tier artifacts** you don't plan to export
2. **Export before re-ingesting** — retirement clears the discovery pool for fresh results
3. **Review manifest.json** for detailed provenance of each artifact

---

## 8.1 Runtime Binding Layer

Every exported capability pack includes a **language-native Runtime Bridge** that makes your capability executable — not just a metadata file.

### How It Works

1. Your capability class loads the manifest and primitive chain
2. It delegates to the **Runtime Bridge** (`runtime-bridge.php`, `runtime_bridge.py`, or `runtime-bridge.ts`)
3. The bridge executes the primitive chain as a **sequential memory chain**
4. Each module transforms the execution context and records trace data
5. You get back a structured result: `{ success, output, trace, metadata }`

### What You Get

- **Real execution** — every module handler modifies the context, not just annotates it
- **Full trace** — per-stage timing, status, and signal data for observability
- **Error recovery** — exceptions are caught per-stage with error details in the trace
- **Deterministic** — same inputs always produce the same outputs

### Example (PHP)

```php
require_once 'src/runtime-bridge.php';
require_once 'src/my-capability.php';

$cap = new CMPSBLCapability();
$result = $cap->execute(['key' => 'value']);

// $result['success']  → true
// $result['output']   → your transformed data
// $result['trace']    → per-stage execution trace
// $result['metadata'] → capability identity + timing
```

### Honest Limitations

- This is a **v1 execution model** — sequential memory chain only
- The runtime bridge is a **portable wrapper**, not the full substrate
- Module handlers implement minimal behavioral contracts
- For the full cognitive runtime, use the CMPSBL substrate directly



| Term | Definition |
|------|-----------|
| **Auxiliary Node** | Your uploaded code operating as a candidate node in the substrate |
| **CJPI** | Crown Jewel Performance Index — the 0–100 scoring metric for discoveries |
| **Capability Surface** | The detected functional profile of your code |
| **Collision Cycle** | A single exploration pass testing your code against substrate primitives |
| **Ascended Memory** | A crystallized, exportable capability artifact |
| **Archetype** | A recognized emergent pattern from specific node combinations |
| **Ascension Loop** | Re-ingesting exported code for deeper capability discovery |

---

## Related Documents

- [Ascension Overview](20-ascension.md)
- [Crystallized Memories](19-crystallized-memories.md)
- [Capability Export System](05-capability-export-system.md)
- [How CMPSBL Works](02-how-cmpsbl-works.md)
- [Developer Guide](03-developer-guide.md)

---

© 2025–2026 CMPSBL®. All rights reserved.
