# CMPSBL OS Substrate — Glossary

**Version 6.3.0 | Scientific Publication**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-040 |
| **Version** | v6.3.0 |
| **Last Updated** | January 2026 |

---

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMPSBL OS SUBSTRATE                          │
├─────────────────────────────────────────────────────────────────┤
│  Created By:        Kenneth E Sweet Jr                          │
│  Organization:      PromptFluid®                                │
├─────────────────────────────────────────────────────────────────┤
│  For licensing or acquisition inquiries:                        │
│  Email: Dev@CMPSBL.com | Phone: (760) FLUID-AI           │
└─────────────────────────────────────────────────────────────────┘
```

---

## A

**ACCESS**
The identity and entitlement module responsible for API key management, rate limiting, and usage metering.

**Adapter**
A standardized connector interface that enables the substrate to communicate with external systems (databases, APIs, enterprise software).

**Agency-class**
A designation for modules capable of autonomous decision-making without constant human oversight. CORTEX is the only agency-class module.

**Auto-heal**
The substrate's ability to automatically recover from degraded states by resetting failure counters and boosting health scores.

---

## B

**Boot Order**
The sequence in which modules initialize during system startup. CORE boots first (order 1), CORTEX boots last (order 13).

**BRAIN**
The cognitive module responsible for persistent memory storage, tiered retrieval, and knowledge graph management.

---

## C

**Circuit Breaker**
A resilience pattern that isolates failing modules to prevent cascade failures. States: closed (healthy), open (isolated), half-open (testing).

**CMPSBL**
Pronounced "composable." The name of the substrate operating system.

**Cognitive Layer**
The intelligence layer comprising BRAIN, DECODE, and DREAM modules.

**Cold Tier**
The lowest memory tier for archival storage. Contains memories with scores between 0.1 and 0.35.

**CORE**
The kernel module providing job scheduling, request routing, and lifecycle management.

**CORTEX**
The agency-class orchestrator module managing autonomous evolution and system-wide coordination.

---

## D

**DAG (Directed Acyclic Graph)**
The module dependency structure that defines boot order and operational relationships.

**DECODE**
The human interface module that parses natural language input into structured intents.

**DEFENSE**
The security module providing threat detection, behavioral analysis, and access control.

**DREAM**
The evolution module responsible for pattern synthesis and autonomous learning integration.

**Dream Cycle**
A scheduled process where the substrate synthesizes patterns from accumulated memories.

---

## E

**Edge Function**
A serverless function that runs close to the user, providing low-latency execution for substrate operations.

**Entitlement**
A permission or capability granted to an API key or user.

**Evolution Sequence**
A structured plan for system improvement managed by CORTEX and MODERNIZER.

---

## G

**Graceful Degradation**
The substrate's ability to continue operating with reduced functionality when components fail.

---

## H

**Health Score**
A 0-100 metric indicating a module's operational status. Scores below 40 trigger auto-heal.

**Hot Tier**
The highest-priority memory tier for immediate recall. Contains memories with scores above 0.6.

---

## I

**INTEGRATION**
The module providing enterprise connectivity through the adapter framework.

**Intent**
A structured representation of user desire extracted from natural language by DECODE.

---

## K

**Kernel Layer**
The foundational infrastructure layer comprising CORE, RIPPLE, and ACCESS modules.

**Knowledge Graph**
A semantic network of relationships between memories, enabling associative retrieval.

---

## M

**Memory**
A unit of stored information in the BRAIN module, including content, type, and scoring metadata.

**Memory Tiering**
The automatic process of promoting and demoting memories between hot, warm, and cold tiers.

**MODERNIZER**
The self-improvement module that analyzes the codebase and proposes architectural upgrades.

**Module**
A discrete functional unit within the substrate. The system comprises 14 modules (v6.0.0).

**Mutation**
A learned improvement or adaptation generated through dream cycles.

---

## I (continued)

**INCLUSIVE**
The human compatibility module providing WCAG 2.2 accessibility scanning, repair, validation, and inclusive design enforcement. Introduced in v6.0.0 as a first-class module.

---

## N

**NEXUS**
The AI routing module that distributes requests across multiple providers with automatic fallback.

---

## O

**Observability**
The ability to understand system internal state through external outputs (metrics, logs, traces).

**Operational Layer**
The service layer comprising DEFENSE, NEXUS, VISION, and INTEGRATION modules.

---

## P

**PEARL Cycle**
The autonomous loop: Propose → Evaluate → Apply → Audit → Learn.

**Proof Mode**
A read-only operating mode where write operations are blocked.

**Proposal**
A structured suggestion for system improvement generated by MODERNIZER.

**Provider**
An external AI service that NEXUS can route requests to.

---

## R

**Rate Limiting**
Controls on request frequency to prevent abuse and ensure fair resource allocation.

**Reflection**
A cognitive process where BRAIN synthesizes learnings from accumulated memories.

**RIPPLE**
The message bus module providing pub/sub messaging and job queues.

---

## S

**Shadow Testing**
Executing proposed changes in a parallel environment before production deployment.

**Substrate**
The complete CMPSBL operating system providing cognitive orchestration services.

**SYSTEM**
The orchestrator and lifecycle manager module for boot graph, module coordination, backup, restore, diagnostics, configuration, and `system.heal` operations.

---

## T

**Telemetry**
Operational data collected by VISION for monitoring and analysis.

**Tier**
A memory storage level (hot, warm, cold) based on value scoring.

---

## V

**VISION (Vee)**
The observability module providing health monitoring, distributed tracing, and anomaly detection.

---

## W

**Warm Tier**
The middle memory tier for active reference. Contains memories with scores between 0.35 and 0.6.

**World Model**
CORTEX's comprehensive view of all 14 modules, their states, and relationships.

---

## Standards & Governance Terms

**FNDTN-v6.0.0**
The v6.0.0 release of CMPSBL Substrate OS, designated as the "Foundations" release. Presented as a reference standard for the substrate class, introducing CORTEX and INCLUSIVE as first-class modules.

**LLMS.txt**
A machine-readable context file placed at a domain root (e.g., `/llms.txt`) that describes AI capabilities, modules, endpoints, roles, and governance context. Originally designed by [llmstxt.org](https://llmstxt.org), adopted by CMPSBL as a standard for AI system discoverability.

**AI Governance Reference Namespace (AIGVRN)**
A governance standard for the substrate class providing 12 surfaces (Governance, Standards, Certification, Verification, Policy, Compliance, Security, Safety, Regulation, Sovereignty, Privacy, Control) with corresponding domain anchors. Root namespace: AIGVRN.com.

**Substrate Class**
A classification for AI systems characterized by: persistent state, self-improvement cycles, modular architecture, embedded governance, and real-time observability. CMPSBL FNDTN v6 is presented as a reference implementation.

**Three-Surface Standard Stack**
The unified standards package comprising: (1) CMPSBL FNDTN v6 as substrate standard, (2) AIGVRN as governance standard, (3) LLMS.txt as machine context standard.

---

*CMPSBL OS Substrate v6.0.0 — FNDTN: Human Compatibility Era*
*© 2025-2026 PromptFluid®. All rights reserved.*
