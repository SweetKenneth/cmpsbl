# 12 — FAQ

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

Answers to frequently asked questions about the CMPSBL cognitive substrate.

---

## General

### What is CMPSBL?

CMPSBL (pronounced "composable") is a cognitive substrate — a runtime operating system that sits between AI models and applications. It provides persistent memory, autonomous discovery, governed evolution, and portable capability exports.

### Is CMPSBL a framework, a library, or a platform?

It is a platform. Specifically, it is an operating system for cognitive applications. It provides infrastructure (nodes, memory, routing, governance) that applications, agents, and workflows run on top of.

### What makes CMPSBL different from other AI platforms?

Three primary differentiators:

1. **Autonomous discovery** — The Memory Stream finds new capabilities without human prompting
2. **Crystallization** — Discoveries become deterministic, exportable software artifacts
3. **Governed evolution** — The system evolves under strict safety controls with mandatory consent

---

## Architecture

### What is a node?

An autonomous subsystem within the substrate. Each primitive specializes in a capability area (reasoning, memory, defense, evolution, etc.). There are 40 primitives organized into 4 categories.

### How do nodes communicate?

Primitives never communicate directly. All interaction flows through the INTENT routing protocol. An intent is broadcast, the router selects appropriate resolvers, and responses are aggregated.

### What is a resolver?

An executable capability owned by a primitive. Named as `node.resolver_name` (e.g., `brain.reasoning_context`). Resolvers are the only execution surface for primitives.

---

## Memory

### What is the Memory Stream?

The continuous discovery engine that observes system behavior, identifies valuable execution patterns, scores them via CJPI, and crystallizes qualifying discoveries into exportable capabilities.

### What is a Crystallized Memory?

A deterministic, portable capability artifact produced through the crystallization process. It includes implementation code, a Mini Runtime, documentation, and build configuration.

### What is an Ascended Memory?

A class of crystallized memory produced through Ascension — the process where developer software enters the substrate and participates in discovery cycles. Ascended Memories have structural dependencies on both the developer's code and the substrate.

### How is persistent memory different from a database?

CMPSBL persistent memory includes vector search, spaced repetition, contradiction detection, causal graphs, and tier management. It is a cognitive memory system, not a data store.

---

## Ascension

### What is Ascension?

The process where external developer software enters the CMPSBL substrate as a Candidate Primitive and participates in discovery cycles against the 40-primitive matrix.

### What happens to my code during Ascension?

Your code is analyzed and treated as a Candidate Primitive. The substrate tests interaction patterns between your code and its existing primitives. Successful chains are scored and potentially crystallized.

### Do I lose ownership of my code?

No. Your code remains your property. Ascended Memories — the discoveries produced from the interaction — have dual provenance.

### Can I re-ingest Ascended Memories?

Yes. Recursive ingestion is supported, enabling compounding discovery cycles.

---

## Exports

### What do I get when I export a capability?

A ZIP bundle containing: implementation code in your chosen target language, the Mini Runtime, documentation (README, technical dossier, license), test bench, build configuration, and manifest.

### What languages can I export to?

Up to 25 languages, gated by CJPI score tier. Mint (68+): PHP, Ruby, Lua, etc. Prime (80+): TypeScript, Python, Go, etc. Relic (90+): Rust, C, C++, Zig. Silicon (94+): Verilog, VHDL, and other HDLs.

### Can exported capabilities run without CMPSBL?

Yes. Every export includes the Mini Runtime, which reproduces required substrate contracts. No network connection to CMPSBL is needed after export.

---

## Security & Governance

### Are some implementations kept secret?

Yes. The Sealed Mechanisms Registry documents categories of implementation details that are intentionally withheld (scoring formulas, security thresholds, routing specifics). The architecture and concepts are public; specific implementations are not.

### Can the system change itself without permission?

No. The mandatory consent protocol requires explicit user approval for every mutation. No system change bypasses this gate.

### Is there an audit trail?

Yes. Every operation produces a hash-linked receipt. Receipts form a tamper-evident audit chain with periodic anchoring.

---

## Development

### How do I get started?

1. Create a CMPSBL account
2. Generate a developer API key from the API Access page
3. Use the unified gateway: `POST https://api.cmpsbl.com/v1/substrate`
4. See the [Developer Guide](03-developer-guide.md) for detailed instructions

### Do I need to install an SDK?

No. CMPSBL uses a dependency-free, direct-integration model. Standard `fetch` with JSON payloads and Bearer token authorization.

### Can I build applications directly on the substrate?

Yes. The substrate supports building apps, chatbots, copilots, agents, and workflows directly on its node capabilities and memory systems.

---

## Product Surfaces

### What is CodeLab?

An interactive development environment within the CMPSBL platform for exploring node capabilities, testing resolver interactions, and building on the substrate.

### What is Dev Academy?

A structured learning environment that provides guided exercises, warm-up sequences, and progression tracking for developers learning the substrate.

### What is Signal Forge?

A blueprint synthesis engine that produces production-grade architecture blueprints scored via CJPI and mapped to the 40-primitive matrix.

---

## Related Documents

- [Start Here](00-start-here.md)
- [Core Concepts](01-core-concepts.md)
- [Developer Guide](03-developer-guide.md)

---

© 2025–2026 CMPSBL®. All rights reserved.
