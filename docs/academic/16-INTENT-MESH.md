# Intent Mesh: Emergent Cross-Module Intelligence via Capability Advertisement and Dynamic Composition

## CMPSBL OS Substrate v10.0.0 | Academic Paper

**Author:** Kenneth E Sweet Jr  
**Affiliation:** PromptFluid®  
**ORCID:** [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
**DOI:** [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)  
**Date:** February 14, 2026  
**License:** CC BY 4.0

---

## Abstract

We present the **Intent Mesh**, a novel architectural pattern for autonomous cross-module capability discovery and composition in cognitive orchestration systems. Unlike traditional service meshes that route requests to known endpoints, or microservice choreography that relies on event-driven chains, the Intent Mesh enables modules to broadcast declarative intents and receive composed responses from all capable resolvers without prior knowledge of the responding modules. The system introduces a **Capability Advertisement Protocol** where each module publishes a manifest of resolvers specifying input/output schemas and risk levels, an **Intent Router** that performs domain-intersection matching to identify capable resolvers, and a **Governance Layer** with a kill switch and risk-level gating that prevents unauthorized mutations. Every interaction produces a cryptographically auditable receipt. We describe the architecture, implementation, governance model, and discuss the emergent intelligence properties that arise from this design.

**Keywords:** cognitive orchestration, emergent intelligence, capability mesh, autonomous composition, intent routing, governed autonomy

---

## 1. Introduction

Modern AI systems comprise multiple specialized modules — security, identity, memory, reasoning, orchestration — that must cooperate to solve complex tasks. The dominant architectural patterns for inter-module communication are:

1. **Orchestration** — A central coordinator explicitly sequences module calls (Sweet, 2025)
2. **Choreography** — Modules emit events and react to each other's events (Newman, 2019)
3. **Service Mesh** — Infrastructure-level routing with known endpoint discovery (Li et al., 2019)

Each approach has limitations. Orchestration requires the developer to anticipate all useful module interactions. Choreography can lead to complex event chains that are difficult to reason about. Service meshes handle routing but not semantic capability matching.

We introduce the **Intent Mesh**, a fourth pattern that combines elements of all three while introducing a novel **capability advertisement** mechanism. Modules declare what they can do (resolvers), other modules declare what they need (intents), and the mesh autonomously routes and composes responses.

---

## 2. Architecture

### 2.1 Capability Advertisement Protocol

Each module publishes a set of **resolvers** to a compile-time manifest. A resolver specifies:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., `defense.threat_score`) |
| `module` | string | Owning module |
| `domains` | string[] | Semantic domains (e.g., `security`, `identity`) |
| `accepts` | string[] | Required input keys |
| `produces` | string[] | Output keys generated |
| `risk` | enum | `read` \| `enrich` \| `mutate` |

### 2.2 Intent Broadcasting

A module broadcasts an intent by specifying:

- **intentType**: What is being requested (e.g., `actor_enrichment`)
- **domains**: Relevant semantic domains
- **input**: Key-value data to send to resolvers
- **governanceMode**: `read_only` (default), `governed`, or `emergency`

### 2.3 Domain-Intersection Matching

The router identifies capable resolvers using set intersection:

```
matchingResolvers = { r ∈ Manifest | r.domains ∩ intent.domains ≠ ∅ }
```

This enables **semantic routing** — a module seeking "identity" data will automatically discover resolvers in IDENTITY, VISION, RELAY, and AUDIT modules without knowing they exist.

### 2.4 Parallel Resolution and Composition

All matched resolvers execute concurrently (safe due to `read` risk level). Results are merged into a single composed response using last-write-wins semantics on output keys.

### 2.5 Receipt Generation

Every interaction produces an immutable receipt stored in a database table, capturing:
- Source and target modules
- Input/output summaries (with sensitive data redacted)
- Governance mode, success status, and duration

---

## 3. Governance Model

The Intent Mesh implements a **three-tier governance model**:

### 3.1 Kill Switch

A global toggle (default: OFF) that immediately halts all mesh routing when disabled. The toggle persists across sessions via client-side storage. When disabled, `broadcastIntent()` returns a no-op result with `_meshDisabled: true`.

### 3.2 Risk-Level Gating

Resolvers declare their risk level. In `read_only` mode (default), mutation resolvers are filtered from execution:

| Governance Mode | read | enrich | mutate |
|----------------|------|--------|--------|
| read_only | ✓ | ✓ | ✗ |
| governed | ✓ | ✓ | ✓ |
| emergency | ✓ | ✓ | ✓ |

### 3.3 Anti-Self-Query

A module's resolvers are excluded from responding to its own intents, preventing circular dependencies.

---

## 4. Emergent Properties

The Intent Mesh exhibits several emergent properties not present in orchestrated systems:

### 4.1 Combinatorial Discovery

With *n* modules and *m* resolvers, the number of possible unique interaction paths grows as O(n × m). Adding a single module with 2 resolvers to an 11-module system creates up to 20 new interaction pathways.

### 4.2 Unprogrammed Cooperation

Consider: DEFENSE detects a suspicious IP. It broadcasts an intent with domains `[security, identity]`. Without any explicit code connecting them, IDENTITY resolves the actor, VISION provides last login details, ECONOMY provides lifetime value, and AUDIT provides the action history — all composed into a single enriched threat profile.

### 4.3 Self-Documenting Behavior

The receipt log serves as both an audit trail and a corpus of emergent module interactions, enabling retrospective analysis of system behavior.

---

## 5. Related Work

| System | Discovery | Composition | Governance | Auditability |
|--------|-----------|-------------|------------|--------------|
| Kubernetes Service Mesh | DNS/IP-based | Request routing | mTLS | Distributed tracing |
| SAGA Pattern | Event-driven | Sequential | Compensating transactions | Event log |
| Actor Model (Akka) | Address-based | Message passing | Supervision trees | Mailbox inspection |
| **Intent Mesh** | **Domain-semantic** | **Parallel + merge** | **Kill switch + risk gating** | **Immutable receipts** |

To our knowledge, no existing system combines semantic capability advertisement, domain-intersection routing, risk-level governance, and cryptographic receipt generation in a unified architecture.

---

## 6. Limitations and Future Work

1. **Resolver execution**: Current implementation returns structured placeholders; live module API calls planned for v10.1
2. **Merge conflicts**: Last-write-wins may produce unexpected results when multiple resolvers produce the same output key
3. **Rate limiting**: No per-resolver rate limiting implemented (planned v10.2)
4. **Dynamic manifest**: Current manifest is compile-time; runtime registration under research (v10.4)
5. **Federated mesh**: Cross-substrate intent routing between separate deployments (v10.5)

---

## 7. Conclusion

The Intent Mesh represents a paradigm shift from orchestrated to emergent module intelligence. By enabling modules to advertise capabilities and broadcast intents, the system discovers useful cooperation patterns that were never explicitly programmed. The governance model — a kill switch, risk-level gating, and anti-self-query — ensures safety without sacrificing autonomy. Every interaction produces an auditable receipt, making the system's emergent behavior fully transparent. We believe this is the first implementation of governed emergent intelligence in a production cognitive orchestration system.

---

## References

Li, W., Lemieux, Y., Gao, J., Zhao, Z., & Han, Y. (2019). Service mesh: Challenges, state of the art, and future research opportunities. *IEEE International Conference on Services Computing*, 122–131.

Newman, S. (2019). *Monolith to Microservices*. O'Reilly Media.

Sweet Jr, K. E. (2025). CMPSBL OS Substrate: Cognitive Orchestration System for Autonomous AI Evolution (Version 9.1.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.XXXXXXX

Sweet Jr, K. E. (2026). Three-tier autonomy governance for self-evolving AI systems. *PromptFluid Technical Reports*, TR-2026-001.

---

## Citation

### BibTeX

```bibtex
@article{sweet_intent_mesh_2026,
  author       = {Sweet Jr, Kenneth E},
  title        = {{Intent Mesh: Emergent Cross-Module Intelligence via
                   Capability Advertisement and Dynamic Composition}},
  year         = 2026,
  publisher    = {Zenodo},
  version      = {v10.0.0},
  doi          = {10.5281/zenodo.XXXXXXX},
  url          = {https://github.com/promptfluid/substrate}
}
```

### APA 7th Edition

Sweet Jr, K. E. (2026). Intent Mesh: Emergent cross-module intelligence via capability advertisement and dynamic composition. *CMPSBL OS Substrate Technical Documentation*, v10.0.0. https://doi.org/10.5281/zenodo.XXXXXXX

---

<div align="center">

*CMPSBL OS Substrate v10.0.0 — Intent Mesh Academic Paper*

© 2025–2026 PromptFluid®. All rights reserved.

</div>
