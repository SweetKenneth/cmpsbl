# 01 — Core Concepts

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document defines the foundational vocabulary and mental model for the CMPSBL cognitive substrate. Every term used throughout this documentation library is grounded here.

---

## 1. Substrate

The substrate is the foundational cognitive runtime beneath all CMPSBL operations. It is a self-evolving operating system layer between AI models and applications, managing memory, orchestration, governance, and capability execution.

The substrate is not a traditional application framework. It is an operating system composed of autonomous nodes, resolvers, routing protocols, and telemetry systems.

---

## 2. Nodes

A node is an autonomous subsystem inside the CMPSBL operating system. Each node represents a specialized system capability — reasoning, memory, defense, orchestration, evolution, and others.

CMPSBL operates a 40-node matrix across 12 sectors. Nodes do not call each other directly. All interaction occurs through resolvers and the intent routing protocol.

Examples of nodes:

| Node | Personality | Role |
|---|---|---|
| BRAIN | The Thinker | Reasoning and analysis |
| MEMORY | The Archivist | Persistent storage and recall |
| DEFENSE | The Guardian | Threat detection and response |
| CORTEX | The Orchestrator | Multi-node coordination |
| EVOLUTION | The Catalyst | System mutation and modernization |
| ORACLE | The Prophet | Predictive analysis |
| PHANTOM | The Ghost | Shadow verification |
| HARVEST | The Collector | Discovery aggregation |
| FORGE | The Smith | Blueprint synthesis |
| IMMUNITY | The Sentinel | Anomaly detection |

---

## 3. Resolvers

A resolver is an executable capability owned by a node. Resolvers are the only execution surface for nodes.

Resolvers follow a strict naming convention:

```
node.resolver_name
```

Examples:

- `brain.reasoning_context` — Contextual reasoning
- `memory.semantic_search` — Vector-based memory recall
- `defense.threat_score` — Threat evaluation
- `evolution.upgrade_readiness` — Mutation readiness check
- `forge.signal_forge` — Blueprint synthesis

---

## 4. INTENT Routing

The INTENT protocol is the routing system that coordinates all execution within the substrate. Every action is expressed as an intent, routed to the correct resolvers, and logged with a receipt.

```
User Action → broadcastIntent() → Intent Router → Resolver Execution → Response → Telemetry
```

No component bypasses the router. All system operations flow through the intent mesh.

---

## 5. Capabilities

A capability is a discrete, invocable function registered in the substrate's capability registry. The CMPSBL substrate maintains a pool of 940+ capabilities across its 40-node matrix.

Capabilities can be:

- Invoked via API
- Composed into chains
- Discovered through the Memory Stream
- Exported as standalone artifacts

---

## 6. Memory

In CMPSBL, "memory" has a specific technical meaning beyond simple data storage.

**Persistent Memory** — Long-term storage with vector search, spaced repetition, and contradiction detection.

**Memory Stream** — The continuous discovery engine that observes system behavior and generates new capabilities.

**Crystallized Memory** — A deterministic, exportable capability artifact produced through the crystallization process.

**Ascended Memory** — A class of crystallized memory produced through Ascension cycles involving developer software.

---

## 7. Discovery

A discovery is a high-value finding surfaced by the Memory Stream. Discoveries represent working execution paths through the substrate's node matrix.

Discoveries are scored via the CJPI (Composable Judgment & Performance Index) and classified into tiers:

| Tier | CJPI Range | Description |
|---|---|---|
| Apex | 96–100 | Rarest, highest-value discoveries |
| Mythic | 94–95 | Exceptional capability chains |
| Relic | 90–93 | Premium, production-grade |
| Prime | 80–89 | High-quality, broadly useful |
| Mint | 68–79 | Quality baseline for export |
| Raw | < 68 | Below export threshold |

---

## 8. Crystallization

Crystallization is the mechanism by which a discovery is converted into a portable, deterministic capability artifact.

The process:

```
Discovery → Sampling → Condensing → Crystallizing → Capability Pack
```

The result is a **Crystallized Memory**: a standalone artifact that includes implementation code, a Mini Runtime, documentation, license, test bench, and build configuration.

---

## 9. Ascension

Ascension is the process where external developer software enters the CMPSBL cognitive substrate and participates in discovery cycles.

During Ascension:

1. Developer software is introduced as a **Candidate Node**
2. Discovery cycles run across the substrate's 40-node matrix
3. Successful interaction chains are crystallized
4. Resulting capabilities become **Ascended Memories**

Ascended Memories are crystallized capabilities that have structural dependencies on both the developer's original code and the substrate, creating a mutual integration pattern.

---

## 10. Capability Packs

A Capability Pack is the complete export artifact produced by crystallization. It contains:

- Pipeline implementation
- Mini Runtime engine
- Documentation (README, technical dossier)
- License
- Test bench
- Build configuration
- Manifest with metadata and valuation

---

## 11. Mini Runtime

The Mini Runtime™ Engine is a zero-dependency, pure TypeScript in-memory runtime bundled with every capability export. It reproduces the node capability contracts needed for the exported capability to execute independently, without requiring the full substrate.

---

## 12. Universal Export Adapter

The Universal Export Adapter enables capability exports to target multiple execution environments:

**Software Languages (18):** TypeScript, JavaScript, Python, Go, Rust, C, C++, Java, Kotlin, Swift, Ruby, PHP, Lua, Elixir, Scala, Haskell, Zig, Dart

**Hardware Description Languages (7):** Verilog, VHDL, SystemVerilog, Chisel, SpinalHDL, Amaranth, FIRRTL

Language availability is gated by discovery score tier.

---

## 13. Mesh Communications

Mesh communications are node-to-node signals that power system observability. Signals are persisted and translated into readable dialogue for the UI.

Signal categories include acknowledgement, discovery, escalation, processing, completion, warning, and heartbeat.

Each node has a personality voice used for human-readable signal translation. These personalities are presentation-only and do not affect system logic.

---

## 14. Governance

Governance refers to the server-enforced rules that control system behavior. The substrate operates under a mandatory consent protocol — all mutations require explicit user approval.

Governance modes include ACTIVE, OBSERVE, LOCKDOWN, and EVOLVE.

---

## 15. CJPI Score

The Composable Judgment & Performance Index scores discoveries on four dimensions:

- **Novelty** — How unique is this capability?
- **Utility** — How broadly useful?
- **Complexity** — How sophisticated is the execution chain?
- **Composability** — How well does it integrate with other capabilities?

Score range: 0–100. Quality floor for export: 68+.

The specific formula and weight allocations are sealed as proprietary trade secrets.

---

## Related Documents

- [How CMPSBL Works](02-how-cmpsbl-works.md)
- [Crystallized Memories](19-crystallized-memories.md)
- [Ascension](20-ascension.md)
- [Glossary](21-glossary.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
