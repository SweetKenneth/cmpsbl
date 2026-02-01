# CMPSBL Substrate OS v6.0.0 — FNDTN: Foundations for Cognitive Substrates, Governance, and Machine Context

**Author:** Kenneth E. Sweet Jr.  
**Affiliation:** PromptFluid®  
**ORCID:** [0009-0001-4237-1243](https://orcid.org/0009-0001-4237-1243)  
**Version:** v6.0.0 (FNDTN)  
**Date:** January 2026  

> This paper builds on prior v5.5.0 work archived at [OSF](https://osf.io/ah7nx/overview) and [Zenodo](https://zenodo.org/records/18379258).

---

## Abstract

This paper presents **CMPSBL Substrate OS v6.0.0 (FNDTN)** as a reference implementation and proposed standard for the emerging "substrate class" of AI systems—autonomous cognitive runtimes characterized by persistent memory, self-improvement cycles, and modular doctrine. Alongside the substrate, we introduce the **AI Governance Reference Namespace (AIGVRN)** as a governance standard for this class, providing a shared lexicon and domain structure across 12 governance surfaces. Finally, we present **LLMS.txt** as a machine-readable context standard that CMPSBL follows and recommends for adoption by web designers, SaaS builders, and system architects. Together, these three surfaces form a unified standards package: substrate mechanics, governance semantics, and machine context. CMPSBL FNDTN v6 is not a theoretical proposal—it is a running production system with real telemetry, users, and validated benchmarks.

---

## 1. Introduction: The Substrate Class

### 1.1 Defining the Substrate Class

A **substrate** is a persistent cognitive runtime that hosts AI capabilities across sessions, maintains memory tiers, evolves through self-improvement cycles, and operates under a governing doctrine. Unlike stateless API wrappers or ephemeral chatbot sessions, substrates are:

- **Persistent**: State survives restarts and sessions.
- **Self-improving**: Dream cycles, reflection, and modernization loops refine behavior autonomously.
- **Modular**: Capabilities are organized into discrete, replaceable modules.
- **Governed**: Doctrine and policy layers constrain and guide behavior.
- **Observable**: Real-time telemetry, health metrics, and audit logs are first-class citizens.

The substrate class represents the next evolution beyond "AI-as-a-service"—toward AI-as-infrastructure.

### 1.2 CMPSBL as Reference Substrate

CMPSBL Substrate OS v6.0.0 is presented not merely as a product, but as a **reference implementation** of the substrate class. It demonstrates:

- How persistent memory tiers (hot, warm, cold) can be implemented.
- How self-improvement cycles (DREAM, MODERNIZER) can operate safely.
- How governance (CORTEX, INCLUSIVE) can be embedded at the kernel level.
- How observability (VISION) and security (DEFENSE) integrate with cognitive operations.

This paper proposes CMPSBL FNDTN v6 as a substrate standard—a baseline against which other substrate implementations can be compared, validated, and interoperated.

---

## 2. CMPSBL v6 (FNDTN) as a Substrate Standard

### 2.1 The 14-Module Architecture

CMPSBL FNDTN v6 implements a five-layer, 14-module kernel architecture:

| Layer | Modules | Purpose |
|-------|---------|---------|
| **Kernel** | CORE, RIPPLE, ACCESS | Scheduling, events, identity |
| **Cognitive** | BRAIN, DECODE, DREAM | Memory, interpretation, synthesis |
| **Operational** | DEFENSE, NEXUS, VISION | Security, routing, observability |
| **Administrative** | SYSTEM, MODERNIZER, INTEGRATION, INCLUSIVE | Orchestration, self-upgrade, connectors, accessibility |
| **Orchestrator** | CORTEX | Policy intent, agency coordination |

#### Module Descriptions (ALL CAPS)

1. **CORE** — Kernel scheduling, boot sequencing, lifecycle management.
2. **RIPPLE** — Event bus, pub/sub messaging, webhook dispatch.
3. **ACCESS** — Identity, API keys, entitlements, permissions.
4. **BRAIN** — 3-tier persistent memory (hot/warm/cold), learning cycles.
5. **DECODE** — Intent parsing, entity extraction, natural language interface.
6. **DREAM** — Memory consolidation, pattern extraction, overnight synthesis.
7. **DEFENSE** — Threat detection, cognitive firewall, behavioral analysis.
8. **NEXUS** — Multi-provider AI routing, model selection, load balancing.
9. **VISION** — Observability, metrics, health monitoring, audit logging.
10. **SYSTEM** — Administrative orchestration, diagnostics, configuration.
11. **MODERNIZER** — Self-upgrade engine, proposal system, version management.
12. **INTEGRATION** — Enterprise adapters, 35+ connectors, external services.
13. **INCLUSIVE** — Accessibility, inclusive design, AI governance/ethics alignment.
14. **CORTEX** — Policy intent layer, agency orchestration (manual mode in v6.0.0).

### 2.2 Core Substrate Capabilities

**Memory Tiers:**
- Hot memory: Active session context.
- Warm memory: Recent cross-session patterns.
- Cold memory: Long-term knowledge archive.

**Doctrine:**
- Personality anchors, behavioral baselines, goal persistence.
- Deviation detection and recovery mechanisms.

**Dream Cycles:**
- Autonomous overnight processing for memory consolidation.
- Pattern extraction and insight synthesis.
- Self-correction without human intervention.

**Terminal Interface:**
- 260+ commands organized by module namespace.
- Observer, Operator, and Governor access levels.
- Full programmatic control over substrate operations.

### 2.3 Standard Proposal

> **We propose CMPSBL v6 (FNDTN) as a reference standard for the substrate class.**

Any implementation claiming substrate-class capabilities should be comparable against FNDTN v6's module taxonomy, memory architecture, governance hooks, and observability surfaces.

---

## 3. AI Governance Reference Namespace as Governance Standard

### 3.1 The Governance Gap

As AI substrates proliferate, a shared governance vocabulary becomes essential. Without standardized terminology for policy, compliance, security, and ethics, interoperability and regulatory alignment become intractable.

### 3.2 The AI Governance Reference Namespace (AIGVRN)

The AI Governance Reference Namespace provides 12 governance surfaces with corresponding domain anchors:

| Surface | Domain | Purpose |
|---------|--------|---------|
| Governance | AIGVRN.com | Root namespace, coordination |
| Standards | AISTNDRD.com | Technical and process standards |
| Certification | AICRTFY.com | Compliance certification |
| Verification | AIVRFY.com | Audit and validation |
| Policy | AIPLCY.com | Policy documentation |
| Compliance | AICMPLY.com | Regulatory compliance |
| Security | AISCRTY.com | Security posture |
| Safety | AISFTY.com | Safety constraints |
| Regulation | AIRGLTN.com | Regulatory mapping |
| Sovereignty | AISVRGN.com | Data and AI sovereignty |
| Privacy | AIPRVCY.com | Privacy protection |
| Control | AICNTRL.com | Human control mechanisms |

### 3.3 Relationship to CMPSBL

CMPSBL FNDTN v6:
- Aligns module naming and taxonomy with AIGVRN vocabulary.
- Structures the INCLUSIVE module to map to AIGVRN governance surfaces.
- Provides hooks for external governance systems to query substrate state.

The namespace is **independent** of CMPSBL—it could be adopted by any substrate implementation—but CMPSBL v6 is the first to formally integrate with it.

### 3.4 Standard Proposal

> **We propose the AI Governance Reference Namespace as a governance standard for the substrate class.**

It provides the shared lexicon and domain structure for policy, compliance, security, and regulatory documentation across substrate implementations.

---

## 4. LLMS.txt as a Machine-Readable Standard

### 4.1 The Machine Context Problem

AI systems increasingly interact with other AI systems. When an LLM agent visits a website or queries an API, it needs machine-readable context about:
- What capabilities are available.
- What constraints apply.
- What governance context exists.

### 4.2 The LLMS.txt Specification

LLMS.txt is a machine-readable context file placed at the root of a domain (e.g., `/llms.txt`). It defines:

- **Capabilities**: What the system can do.
- **Modules/Components**: Structural organization.
- **Endpoints**: API surfaces and interaction patterns.
- **Roles**: Access levels (Observer, Operator, Governor).
- **Governance**: Policy and compliance context.

### 4.3 CMPSBL Implementation

CMPSBL FNDTN v6 publishes a complete LLMS.txt file that:
- Lists all 14 modules with descriptions.
- Describes memory tiers and observability surfaces.
- Defines role-based access patterns.
- References the AI Governance Namespace.

### 4.4 Recommendation for Adoption

> **LLMS.txt was designed by [llmstxt.org](https://llmstxt.org). CMPSBL adopts this standard and recommends it for machine-readable AI context.**

**Recommended Adopters:**
- Web designers building AI-facing interfaces.
- SaaS platforms with AI capabilities.
- Enterprise systems integrating with AI agents.
- Any service that LLMs may query or interact with.

Including an LLMS.txt file at your domain root enables AI systems to understand your capabilities, constraints, and governance context without scraping or guessing.

---

## 5. The Three-Surface Standard Stack

### 5.1 Conceptual Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LLMS.txt                                 │
│              Machine Context Standard                       │
│         (Machine-readable binding layer)                    │
├─────────────────────────────────────────────────────────────┤
│              AI Governance Reference Namespace              │
│                Governance Standard                          │
│          (Policy, compliance, regulatory semantics)         │
├─────────────────────────────────────────────────────────────┤
│                CMPSBL FNDTN v6                              │
│                Substrate Standard                           │
│       (Runtime, memory, modules, self-improvement)          │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Layer Relationships

| Layer | Standard | Function |
|-------|----------|----------|
| **Surface 1** | CMPSBL FNDTN v6 | Substrate mechanics (what the system *does*) |
| **Surface 2** | AI Governance Reference Namespace | Governance semantics (what the system *should* do) |
| **Surface 3** | LLMS.txt | Machine context (how the system *communicates*) |

### 5.3 Extensibility

Any future substrate implementation could adopt:
- The governance namespace for policy alignment.
- The LLMS.txt pattern for machine discoverability.
- FNDTN v6 as a reference for architectural comparison.

CMPSBL FNDTN v6 is the **first fully documented instance** of this three-surface pattern.

---

## 6. Implementation Evidence

### 6.1 Live System Status

CMPSBL FNDTN v6 is not a specification document—it is a running production system:

- **Active runtime** with real user sessions.
- **Telemetry streams** with sub-100ms latency.
- **Marketplace** with 50+ templates and active transactions.
- **Terminal** with 260+ operational commands.

### 6.2 Performance Benchmarks

Key validated metrics:
- Response latency: < 100ms for most operations.
- Memory tier transitions: Automatic, policy-driven.
- Dream cycle duration: Configurable, typically overnight.
- Module isolation: Full namespace separation.

### 6.3 Validation Methodology

The substrate is validated through:
- Unit and integration tests across all modules.
- Live system monitoring with regression detection.
- External audit logs and compliance checks.
- User feedback loops integrated into MODERNIZER.

---

## 7. Prior Work and Lineage

### 7.1 Version History

| Version | Date | Record |
|---------|------|--------|
| v5.5.0 | 2025 | [OSF](https://osf.io/ah7nx/overview), [Zenodo](https://zenodo.org/records/18379258) |
| v6.0.0 (FNDTN) | 2026 | This paper |

### 7.2 AI Governance Namespace

The AI Governance Reference Namespace was registered separately:
- [Zenodo Record](https://zenodo.org/records/18393018)

### 7.3 Unification in FNDTN v6

FNDTN v6 unifies:
- The substrate architecture (from v5.5.0 lineage).
- The governance namespace (parallel artifact).
- The LLMS.txt standard (new in v6).

This creates a coherent standards package for acquisition, adoption, and extension.

---

## 8. Conclusion and Future Work

### 8.1 Summary

This paper presents:
1. **CMPSBL FNDTN v6** as a reference substrate standard.
2. **AI Governance Reference Namespace** as a governance standard for the substrate class.
3. **LLMS.txt** as a machine-readable context standard we follow and recommend.

Together, these form a three-surface standard stack that is already implemented, documented, and running in production.

### 8.2 Future Directions

Potential extensions in future versions may include:
- Enhanced agency orchestration (CORTEX auto mode).
- Federated substrate networks.
- Cross-substrate governance interoperability.
- Extended LLMS.txt schemas for specific domains.

---

## 9. References

1. Sweet Jr., K. E. (2025). *CMPSBL OS Substrate v5.5.0*. OSF. https://osf.io/ah7nx/overview

2. Sweet Jr., K. E. (2025). *CMPSBL OS Substrate v5.5.0*. Zenodo. https://zenodo.org/records/18379258

3. Sweet Jr., K. E. (2025). *AI Governance Reference Namespace*. Zenodo. https://zenodo.org/records/18393018

4. llmstxt.org. *LLMs.txt Specification*. https://llmstxt.org

5. PromptFluid. *CMPSBL Substrate OS Documentation*. https://cmpsbl.com/docs

---

## Appendix: Technical Library Reference

The complete v6 technical library (26 documents) is available at `/docs/library/`:

- 00-INDEX.md — Document index
- 01-EXECUTIVE-SUMMARY.md — Executive overview
- 02-SYSTEM-ARCHITECTURE.md — Architecture deep-dive
- 03-USERS-GUIDE.md — Operational guide
- 04-API-REFERENCE.md — API specification
- 10–23: Module documentation (CORE through INCLUSIVE)
- 30-VALIDATION-METHODOLOGY.md — Testing approach
- 31-PERFORMANCE-BENCHMARKS.md — Measured performance
- 32-LIVE-SYSTEM-EVIDENCE.md — Production evidence
- 40-GLOSSARY.md — Terminology
- 41-BIBLIOGRAPHY.md — References
- 42-LICENSING-INFO.md — Licensing terms
- 50-MARKETPLACE-REFERENCE.md — Commercial documentation

---

*CMPSBL Substrate OS v6.0.0 — FNDTN: Human Compatibility Era*  
*© 2025-2026 PromptFluid®. All rights reserved.*
