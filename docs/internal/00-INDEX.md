# Internal Library — CMPSBL Substrate

**Classification:** 🔒 INTERNAL — Governor and Operator Eyes Only  
**Maintainer:** Kenneth E Sweet Jr · PromptFluid®  
**ORCID:** [0009-0001-4237-1243](https://orcid.org/0009-0001-4237-1243)

---

## Purpose

This library is the single source of truth for all internal knowledge required to operate, maintain, and govern the CMPSBL Substrate. It covers every algorithm, every trade secret, every maintenance procedure, and every governance protocol that a system governor must know.

## Library Pages

| Page | Document | Scope |
|------|----------|-------|
| 01 | [Topology & Module Registry](./01-topology-and-module-registry.md) | 38-node / 12-sector architecture, layer definitions, boot order, dependency graph |
| 02 | [Proprietary Algorithms](./02-proprietary-algorithms.md) | All scoring, routing, integrity, and learning algorithms |
| 03 | [Trade Secrets & Competitive Moat](./03-trade-secrets-and-moat.md) | Crown jewels, strategic differentiators, IP protection |
| 04 | [Control Plane & Persistence](./04-control-plane-and-persistence.md) | Durability layer, WAL, snapshots, leader election, rehydration |
| 05 | [NEXUS Routing Engine](./05-nexus-routing-engine.md) | Provider fleet, routing modes, cost ledger, failover |
| 06 | [Hardening Registry](./06-hardening-registry.md) | All 22 hardened modules, grading, feature inventory |
| 07 | [Evolution & Mutation Pipeline](./07-evolution-and-mutation-pipeline.md) | SEBA, mutation loop, promotion gates, receipt chain |
| 08 | [Security Internals](./08-security-internals.md) | DEFENSE shell, threat model, IP reputation, honeypots |
| 09 | [Governor Knowledge Base](./09-governor-knowledge-base.md) | What the governor must know, decision authority, red lines |
| 10 | [Maintenance Runbook](./10-maintenance-runbook.md) | Daily, weekly, monthly checklists, incident response |
| 11 | [Circuit Breaker & Resilience](./11-circuit-breaker-and-resilience.md) | Failure isolation, DLQ, retry budgets, chaos testing |
| 12 | [Memory & Learning Internals](./12-memory-and-learning-internals.md) | SM-2 engine, tiering, decay, dream cycles, knowledge compounding |
| 13–19 | Crown Jewel Mining Reports (Waves 1–6 + Master Ranking) | Discovery mining run results and master rankings |
| 20 | [Autonomous Software Foundry](./20-autonomous-foundry.md) | Reactor architecture, CJPI scoring, production metrics |
| 21 | [Discovery Engine Internals](./21-discovery-engine-internals.md) | Recursive reactor, candidate generation, semantic dedup, self-discovery |
| 22 | [S-Tier Vault Internals](./22-s-tier-vault-internals.md) | Vault data model, export adapter, verification, access control |
| 23 | [ENGINEER Node (Mechanist)](./23-engineer-node.md) | Health monitoring, findings, proposals, CLM integration, INTEL dispatch |
| 24 | [INTEL Aggregation Pipeline](./24-intel-aggregation-pipeline.md) | Signal ingestion, deduplication, IntelCards, NEXUS-CLM Bridge |
| 25 | [INTENT Mesh & Hub](./25-intent-mesh-and-hub.md) | Affinity matrix, pattern recognition, module discovery, governance translation |
| 26 | [SHADOW Module](./26-shadow-module.md) | Shadow runs, divergence detection, TSAC, SEBA integration |

## Classification Policy

- These documents are **never** exposed to end users, public documentation, or marketing materials.
- Content may only be promoted to external docs after explicit governor review.
- All algorithm formulas, thresholds, and scoring models remain internal.

## Terminology

- Module names are always written in ALL CAPS (e.g., NEXUS, CORE, DEFENSE).
- The system is called "Clockless" — a Cognitive Reality System powered by the CMPSBL Substrate.

---

© 2025–2026 PromptFluid®. Confidential — Internal use only.
