# CMPSBL Documentation — Start Here

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Welcome

CMPSBL (pronounced "composable") is a cognitive substrate — a runtime operating system that sits between AI models and applications. It provides persistent memory, autonomous discovery, governed mutation, and capability export.

This documentation library is the canonical reference for the CMPSBL platform. It covers architecture, developer workflows, product surfaces, API access, and the conceptual foundations of the system.

---

## Who This Documentation Is For

| Audience | Start With |
|---|---|
| **Developers** | [Developer Guide](03-developer-guide.md), [API Reference](15-api-reference.md) |
| **Users** | [How CMPSBL Works](02-how-cmpsbl-works.md), [Core Concepts](01-core-concepts.md) |
| **Investors** | [Architecture Overview](07-architecture-overview.md), [Use Cases](10-use-cases.md) |
| **Researchers** | [Research & Prior Art](11-research-and-prior-art.md), [Core Concepts](01-core-concepts.md) |

---

## Documentation Map

### Foundations

| # | Document | Description |
|---|---|---|
| 00 | [Start Here](00-start-here.md) | This document |
| 01 | [Core Concepts](01-core-concepts.md) | Vocabulary and mental model |
| 02 | [How CMPSBL Works](02-how-cmpsbl-works.md) | System operation walkthrough |

### Developer Guides

| # | Document | Description |
|---|---|---|
| 03 | [Developer Guide](03-developer-guide.md) | Quickstart and integration paths |
| 13 | [Substrate Development](13-substrate-development.md) | Building directly on the substrate |
| 14 | [Building Agents & Apps](14-building-agents-and-apps.md) | Apps, chatbots, copilots, agents |
| 15 | [API Reference](15-api-reference.md) | Endpoint documentation |

### System Deep Dives

| # | Document | Description |
|---|---|---|
| 04 | [Memory Stream](04-memory-stream.md) | Continuous discovery engine |
| 05 | [Capability Export System](05-capability-export-system.md) | How capabilities become portable |
| 06 | [Mini Runtime](06-mini-runtime.md) | Condensed execution layer |
| 07 | [Architecture Overview](07-architecture-overview.md) | Full system architecture |
| 08 | [Governance & Trust](08-governance-and-trust.md) | Safety, auditability, trust model |
| 09 | [SDK & API](09-sdk-and-api.md) | Integration surface |

### Product Surfaces

| # | Document | Description |
|---|---|---|
| 16 | [CodeLab](16-codelab.md) | Interactive development environment |
| 17 | [Dev Academy](17-dev-academy.md) | Education and onboarding |
| 18 | [Signal Forge](18-signal-forge.md) | Blueprint synthesis engine |

### Reference

| # | Document | Description |
|---|---|---|
| 10 | [Use Cases](10-use-cases.md) | Practical applications |
| 11 | [Research & Prior Art](11-research-and-prior-art.md) | Academic lineage |
| 12 | [FAQ](12-faq.md) | Common questions |

### Supplementary

| # | Document | Description |
|---|---|---|
| 19 | [Crystallized Memories](19-crystallized-memories.md) | Deterministic capability artifacts |
| 20 | [Ascension](20-ascension.md) | Software evolution lifecycle |
| 21 | [Glossary](21-glossary.md) | Complete terminology reference |

---

## Quick Orientation

**What is CMPSBL?**  
A cognitive substrate that provides AI-native infrastructure: persistent memory, autonomous capability discovery, governed evolution, and portable runtime exports.

**What is the Memory Stream?**  
The system's continuous discovery engine. It observes behavior, scores findings, and crystallizes reusable capabilities.

**What is a Crystallized Memory?**  
A deterministic, portable capability artifact produced by the crystallization process. It runs independently via the Mini Runtime.

**What is Ascension?**  
The process where external developer software enters the substrate, participates in discovery cycles, and produces Ascended Memories — a class of crystallized memory tied to the developer's original code.

---

## Conventions Used in This Library

- **ALL CAPS** names refer to system primitives (e.g., BRAIN, DEFENSE, MEMORY)
- Code examples use TypeScript unless otherwise noted
- API endpoints reference the unified substrate gateway
- Architecture diagrams use Mermaid syntax
- Sealed mechanisms are noted but not exposed

---

## Publication Information

| Field | Value |
|---|---|
| Publisher | PromptFluid® |
| System Version | v14.2.0 — MINDGAMES Epoch |
| Documentation Epoch | 041 |
| License | © 2025–2026 PromptFluid®. All rights reserved. |

---

© 2025–2026 PromptFluid®. All rights reserved.
