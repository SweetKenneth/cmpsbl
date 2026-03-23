# 02 — How CMPSBL Works

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document explains how the CMPSBL cognitive substrate operates, from intent routing through discovery, crystallization, and export.

---

## 1. Overview

CMPSBL is a cognitive operating system composed of 40 autonomous primitives across 4 categories. It provides:

- **Intent-based execution** — All actions route through a central mesh
- **Persistent memory** — Vector search, contradiction detection, spaced repetition
- **Autonomous discovery** — The Memory Stream continuously finds new capabilities
- **Governed mutation** — System evolution requires consent and audit
- **Portable exports** — Capabilities export as standalone artifacts with a Mini Runtime

The system operates as infrastructure between AI models and applications, providing cognitive services that neither raw model APIs nor traditional frameworks offer.

---

## 2. Execution Model

Every action in CMPSBL flows through the intent routing protocol:

```
User or System Action
    ↓
broadcastIntent({
    intentType: "analysis",
    sourceModule: "BRAIN",
    input: { ... }
})
    ↓
Intent Router
    ↓
Resolver Selection & Execution
    ↓
Response Aggregation
    ↓
Mesh Communication Events
    ↓
Telemetry & Audit
```

### Intent Structure

An intent describes what should happen without specifying how. The router determines which node resolvers should execute and coordinates their responses.

### Resolver Execution

Resolvers are the only execution surface. Each resolver is owned by exactly one node and follows the naming convention `node.resolver_name`.

### Receipt Logging

Every intent execution produces a receipt — a tamper-evident audit record containing the intent, resolver responses, timing data, and outcome.

---

## 3. The Node Matrix

CMPSBL's 40 primitives are organized into 4 functional categories:

| Sector | Nodes | Function |
|---|---|---|
| Cognition | BRAIN, CORTEX, ORACLE | Reasoning, orchestration, prediction |
| Memory | MEMORY, ECHO | Storage, recall, replay |
| Security | DEFENSE, IMMUNITY, PHANTOM | Protection, anomaly detection, verification |
| Evolution | EVOLUTION, SHADOW | Mutation, shadow comparison |
| Communication | INTENT, MESH, LINGUA | Routing, signaling, language |
| Discovery | HARVEST, FOUNDRY | Collection, exploration |
| Fabrication | FORGE, ENGINEER | Synthesis, construction |
| Navigation | COMPASS, ATLAS | Mapping, capability indexing |
| Governance | GOVERNANCE, SOVEREIGN, TREATY | Rules, authority, agreements |
| Ethics | CONSCIENCE, OBSERVER | Ethical evaluation, monitoring |
| Adaptation | REFLEX, NERVE | Reactive behavior, sensing |
| Encoding | ENCODE, DECODE | Transformation, interpretation |

Each primitive operates autonomously. Primitives never call each other directly — all interaction flows through the intent mesh.

---

## 4. Memory Stream

The Memory Stream is CMPSBL's continuous discovery engine. It observes system behavior, identifies valuable execution patterns, and crystallizes them into reusable capabilities.

### Discovery Process

```
System Activity
    ↓
Behavior Signals
    ↓
Pattern Recognition
    ↓
CJPI Scoring
    ↓
Tier Classification (Raw → Apex)
    ↓
Crystallization (if score ≥ 68)
    ↓
Capability Pack Generation
```

### Scoring

Every discovery is scored via the CJPI across four dimensions: Novelty, Utility, Complexity, and Composability. The specific formula is a sealed mechanism.

### Tier System

Discoveries are classified into six tiers: Apex (96–100), Mythic (94–95), Relic (90–93), Prime (80–89), Mint (68–79), and Raw (below 68).

Only discoveries at Mint tier or above qualify for export.

---

## 5. Crystallization

Crystallization converts a discovery into a portable, deterministic artifact.

### Phases

1. **Sampling** — The discovery's execution path is isolated and its node interactions recorded
2. **Condensing** — Dependencies are resolved and the execution graph is compressed
3. **Crystallizing** — The final artifact is generated with all runtime requirements

### Output

A crystallized memory includes:

- Implementation code targeting up to 25 languages
- Mini Runtime™ Engine (zero-dependency TypeScript runtime)
- Technical documentation and dossier
- License file
- Test bench
- Build configuration
- Manifest with CJPI score and metadata

---

## 6. Ascension

Ascension is the lifecycle where external developer software enters the substrate and participates in discovery.

### Phases

1. **INGEST** — Developer software is introduced and analyzed
2. **ASCENSION** — The software runs as a Candidate Primitive through discovery cycles against the 40-primitive matrix
3. **CRYSTALLIZATION** — Successful interaction chains scoring ≥ 68 CJPI are crystallized
4. **ASCENDED MEMORY** — The resulting artifacts are available for export

Ascended Memories have structural dependencies on both the developer's code and the substrate, creating a mutual integration pattern.

### Recursive Ingestion

Ascended Memories can be re-ingested into the substrate for further discovery cycles, enabling compounding capability discovery.

---

## 7. Capability Export

Exported capabilities are fully standalone. Each export includes:

- The capability implementation in the target language
- A bundled Mini Runtime that reproduces required substrate contracts
- Full documentation suite
- Manifest tracking provenance and valuation

### Language Tiers

Export languages are gated by CJPI score:

| CJPI Score | Available Languages |
|---|---|
| 68+ (Mint) | PHP, Ruby, Lua, Elixir, Dart, Kotlin, Scala |
| 80+ (Prime) | TypeScript, JavaScript, Python, Go, Java, Swift, Haskell |
| 90+ (Relic) | Rust, C, C++, Zig |
| 94+ (Silicon) | Verilog, VHDL, SystemVerilog, Chisel, SpinalHDL, Amaranth, FIRRTL |

---

## 8. Governance

All system mutations operate under a mandatory consent protocol.

### Mutation Memory Chain

Proposals flow through a 7-gate promotion memory chain:

```
Lint → Test → Review → Stage → Consent → Deploy → Prod
```

Every gate must pass before a mutation reaches production. The consent gate requires explicit user approval.

### Audit Trail

All operations produce tamper-evident receipts stored in an audit chain. Receipts include timing, inputs, outputs, and hash-linked provenance.

---

## 9. Telemetry

The substrate generates telemetry through mesh communications. Telemetry is always non-blocking — it never interrupts system execution.

Key telemetry surfaces:

- **Intent Mesh** — Real-time visualization of intent routing
- **Primitive Health** — Status of all 40 primitives
- **Memory Stream** — Discovery activity feed
- **Resolver Activity** — Execution metrics per resolver

---

## Related Documents

- [Core Concepts](01-core-concepts.md)
- [Architecture Overview](07-architecture-overview.md)
- [Memory Stream](04-memory-stream.md)
- [Capability Export System](05-capability-export-system.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
