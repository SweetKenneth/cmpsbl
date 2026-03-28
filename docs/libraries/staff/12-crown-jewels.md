# CMPSBL® Crown Jewels — Active Registry & Classification Guide

**Classification:** 🔒 INTERNAL — Team Members Only  
**Version:** v16.7.0 — CONTACT Epoch  
**Last Updated:** 2026-03-28

---

## Purpose

This document is the single source of truth for the Crown Jewel system — the 233 S-Tier capabilities that form the substrate's most valuable IP. It covers:

1. What Crown Jewels are and how they're classified
2. Which are actively powering the substrate (all 233)
3. Which are **substrate-only** and must **NEVER** be surfaced externally
4. Why the classification exists and what the consequences of violation are

**Read this before touching any Crown Jewel code.**

---

## Overview

| Metric | Count |
|--------|-------|
| **Total Crown Jewels** | 233 |
| **Architecture (NEVER exported)** | 209 |
| **Experience (sealed black-box only)** | 24 (across 4 tiers) |
| **Active in substrate** | 222 (95%) |
| **Safety-gated (human-in-the-loop required)** | 11 |
| **Activation waves** | 14 |
| **Covered primitives** | All 40 + cross-primitive compounds |
| **Registry version** | v7.0.0 |

---

## The Two Classifications

### 🔴 ARCHITECTURE Crown Jewels — 209 Total

**Rule: NEVER released. NEVER exported. NEVER visible outside admin. Period.**

Architecture Crown Jewels enable:
- Recursive self-optimization and self-improvement
- Architecture mutation and topology reconfiguration
- Governance kernels and meta-governance
- Meta-learning and cognitive bootstrapping
- Compression algorithms and knowledge crystallization
- CLM internals and cognitive lifecycle management
- Evolution pipeline (SEBA) internals
- Autonomous decision authority internals

These are the **substrate's immune system, nervous system, and evolutionary engine**. Exposing them would:
- Allow competitors to replicate the substrate's self-improving architecture
- Enable adversaries to understand and circumvent defense mechanisms
- Compromise the autonomy and governance boundaries that make the system safe
- Destroy the 2-3 year rebuild moat that protects our IP

**Enforcement:**
- `ARCHITECTURE_CROWN_JEWEL_IDS` set in `crown-jewel-registry.ts`
- `isCrownJewelReleased()` returns `false` unconditionally for all Architecture IDs
- `isGatekept()` returns `true` unconditionally
- Admin-only visibility via S-Tier Vault (`/admin/s-tier-vault`)

### 🟢 EXPERIENCE Crown Jewels — 24 Total

**Rule: Released ONLY as sealed, black-boxed artifacts. 4-tier access: Builder (8 free), Creator ($29, +20), Studio ($49, +40), Architect ($79, all).**
- Execution-only (no source code visible)
- Black-box enforcement via `blackbox.ts` (hex-encoded weights, stripped comments)
- Tiered access: Creator ($49) and Architect ($149)
- Non-exportable — run ON the substrate, never AS the substrate

---

## Architecture Crown Jewels by Module

### CORE (5 jewels) — Substrate Foundation
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 1 | Substrate Registry | 98 | Single source of truth for all registered entities — exposes entire system topology |
| 13 | Substrate Registry (Core) | 95 | Minimal-footprint variant — same exposure risk |
| 25 | Circuit Breaker Fabric | 93 | Distributed breaker coordination — reveals failure handling internals |
| 125 | Cascade Prevention | 85 | Proactive cascade failure prevention — exposes failure detection heuristics |
| 136 | Homeostatic Regulator | 85 | Feedback loop regulation — reveals self-balancing algorithms |

### BRAIN (13 jewels) — Cognitive Core
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 16 | Semantic Knowledge Graph | 94 | Graph-based knowledge with relationship inference — core IP |
| 31 | Embedding Store | 92 | Vector embedding storage — reveals memory architecture |
| 52 | Embedding Similarity Engine | 90 | High-performance similarity search — proprietary algorithms |
| 74 | Recursive Meta-Learning Accelerator | 88 | Meta-learning through recursive pattern extraction — the learning-to-learn engine |
| 88 | Adaptive Product Brain | 87 | Autonomous product intelligence — reveals how substrate adapts |
| 97 | Recursive Cognitive Bootstrapping | 86 | Bootstraps new cognitive capabilities — self-creation engine |
| 103 | Metacognition Engine | 86 | Reasoning about reasoning — the substrate's consciousness |
| 126 | Meta-Reasoning | 85 | Optimal problem-solving strategy selection |
| 128 | Temporal Reasoning | 85 | Time-aware reasoning with temporal logic |
| 134 | Episodic Replay | 85 | Memory replay for reinforcement learning |
| 142 | Classifier Library | 85 | Extensible classification with pluggable strategies |
| + | Causal Inference Engine | 85 | First-principles causal reasoning |
| + | Knowledge Fusion Reactor | 85 | Multi-source knowledge synthesis |

### CORTEX (14 jewels) — Orchestration Core
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 11 | Pipeline Composition Engine | 95 | Composable pipeline builder — reveals orchestration internals |
| 51 | Adaptive Load Balancer | 90 | Real-time performance-based load balancing |
| 71 | Task Dependency Resolver | 88 | DAG-based task resolution — reveals execution model |
| 72 | Recursive Self-Optimization Core | 88 | Self-optimizing execution — the engine that improves itself |
| 75 | Strategic Foresight Engine | 88 | Cross-module strategic planning (CORTEX×BRAIN) |
| 90 | Cross-Pipeline Arbitration Engine | 87 | Resource conflict resolution across pipelines |
| 105 | Cortex Orchestration Engine | 86 | Central orchestration coordination |
| 119 | Autonomous Workflow Composer | 85 | Autonomous workflow creation from capability graph |
| 127 | Recursive Planning | 85 | Depth-limited recursive planning |
| 139 | Attention Allocation | 85 | Dynamic cognitive attention allocation |
| 141 | Dynamic Pipeline Optimizer | 85 | Workload-adaptive pipeline optimization |
| + | Cognitive Scheduling | 85 | Priority-aware cognitive task scheduling |
| + | Emergent Strategy | 85 | Strategy emergence from pattern analysis |
| + | Priority Landscape | 85 | Dynamic priority landscape modeling |

### EVOLUTION (7 jewels) — Self-Improvement Engine
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 12 | Mutation Proposal Engine | 95 | Generates and evaluates system mutations — the evolution core |
| 28 | Shadow Run Environment | 93 | Sandboxed mutation testing — SEBA internals |
| 101 | Recursive Self-Improvement Pipeline | 86 | Self-improvement with A/B testing and safety gates |
| 102 | Evolution Engine | 86 | Core evolution engine for system-wide capability evolution |
| 114 | Evolution A/B | 85 | A/B testing framework for evolution experiments |
| 115 | Evolution Rollback | 85 | Safe rollback for failed evolution operations |
| 116 | Evolution Sandbox | 85 | Isolated sandbox for evolutionary changes |

### GOVERNANCE (11 jewels) — Authority & Control
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 19 | Veto Authority Engine | 94 | Authority-gated veto with escalation — governance core |
| 33 | Self-Audit Loop | 92 | Continuous self-audit with drift reporting |
| 53 | Veto Cascade Protocol | 90 | Multi-level veto propagation |
| 76 | Decision Confidence Governor | 88 | Confidence-weighted decision gating |
| 79 | Autonomy Budget Manager | 87 | Budget allocation for autonomous operations |
| 80 | Autonomy Rollback Authority | 87 | Rollback authority for safety bounds |
| 93 | Regulatory Mode Switcher | 86 | Jurisdiction-based compliance mode switching |
| 95 | Policy-Aware Intelligence Gate | 86 | Policy-driven gating for intelligence operations |
| 96 | Intelligence Governance Kernel | 86 | Core governance kernel — meta-governance over all systems |
| 106 | Evolution Governance Engine | 86 | Safety constraints for evolution operations |
| 108 | Self Governance | 85 | Self-governing with adaptive rule evolution |

### DEFENSE (5 jewels) — Security Core
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 35 | Honeypot Intelligence Network | 92 | Decoy deployment for attacker profiling |
| 69 | Honeypot Intelligence (Advanced) | 88 | Adaptive deception with threat extraction |
| 81 | Intelligence Containment Engine | 87 | Containment for runaway intelligence processes |
| 82 | Emergent Threat Anticipator | 87 | Predictive threat modeling from emergent patterns |
| 132 | Adversarial Simulation | 85 | Attack simulation for defense hardening |

### NERVE (4 jewels) — Neural Signaling
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 5 | Consensus Heartbeat Protocol | 96 | Gossip-style Byzantine-fault-tolerant liveness detection |
| 21 | Partition Detection Oracle | 93 | Network partition detection via gossip divergence |
| 41 | Quorum Negotiator | 91 | Distributed quorum with split-brain prevention |
| 61 | State Synchronization Engine | 89 | CRDT-based distributed state sync |

### NEXUS (4 jewels) — AI Routing Core
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 2 | Fleet Intelligence Orchestrator | 98 | Real-time scoring matrix across all AI providers — core routing IP |
| 6 | Cost-Aware Routing Engine | 96 | Real-time budget tracking with progressive quality degradation |
| 14 | Multi-Model Consensus | 94 | Consensus protocol across multiple AI models |
| 85 | Value-Weighted Reasoning Router | 87 | Routes by expected value, not just speed |

### SYSTEM (8 jewels) — System Infrastructure
| Rank | Name | CJPI | Why It's Substrate-Only |
|------|------|------|------------------------|
| 24 | Boot Dependency Resolver | 93 | Topological sort boot sequencer — reveals boot internals |
| 73 | Recursive Architecture Refactorer | 88 | Automated architecture refactoring |
| 78 | Autonomous Ops Steward | 87 | Autonomous operations management |
| 92 | Self-Scaling Intelligence Fabric | 86 | Self-scaling compute with demand prediction |
| 104 | Self-Documentation Engine | 86 | Automated doc generation from runtime behavior |
| 107 | Autonomous Operator | 85 | Fully autonomous system operator |
| 130 | Topology Mutation | 85 | Runtime topology mutation with live reconfiguration |
| 140 | Entropy Reversal | 85 | Automated entropy cleanup and optimization |

### Additional Architecture Modules

| Module | Count | Key Jewels |
|--------|-------|------------|
| **MEDIC** | 5 | Autonomous Triage (CJPI 97), Predictive Failure Forecaster, Cascading Failure Isolator, Organ Transplant, Self-Repair Engine |
| **DREAM** | 8 | Nocturne Consolidation, Pattern Extraction, Hallucination Guard, Dream Pool Federation, Dream Lucidity Control, Counterfactual Engine, Generative Hypothesis, Dream Cross-Pollination |
| **MEMORY** | 5 | Write-Ahead Log (CJPI 95), SM-2 Spaced Repetition, Knowledge Compaction, Cross-Session Persistence, Recursive Infinite Context |
| **AUDIT** | 4 | Tamper-Evident Chain (CJPI 95), Compliance Attestation, Forensic Replay, Audit-Grade Decision Ledger |
| **IDENTITY** | 4 | Zero-Trust Session Binder, Behavioral Biometrics, Behavioral Trust Scoring, Federated Identity Resolver |
| **IMMUNITY** | 4 | Self-Healing Orchestrator (CJPI 96), Adaptive Threat Antibody, Immune Memory Persistence, Autoimmune Prevention |
| **RELAY** | 4 | Content-Hash Deduplicator, Priority-Aware Relay Fabric, Cross-Zone Bridge, Resilient Communication Backbone |
| **MESH** | 4 | Cognitive Mesh, Distributed Consensus Mesh, Mesh Topology Optimizer, Event-Driven Integration Mesh |
| **INTENT** | 4 | Goal Tracking, Intent Disambiguation, Intent Chaining, Conversational Intent Compiler |
| **ORACLE** | 4 | Predictive Oracle (CJPI 92), Multi-Horizon Prediction, Counterfactual Scenario, Confidence Calibration |
| **SOVEREIGN** | 4 | Sovereign Authority Kernel (CJPI 93), Data Sovereignty Partitioner, Regulatory Genome Mapper, Cross-Border Transfer Arbiter |
| **CONSCIENCE** | 4 | Ethical Constraint Engine, Moral Reasoning Graph, Stakeholder Impact Analyzer, Ethical Stealth Arbiter |
| **PHANTOM** | 4 | Stealth Operations Controller, Attribution Laundering Detector, Selective Amnesia Controller, Predictive Intent Preloader |
| **FORGE** | 4 | Capability Forge Engine, Blueprint Evolution Compiler, Artifact Hardening Foundry, Capability Genesis Reactor |
| **ECHO** | 4 | Distributed Echo Network, Temporal Regression Sandbox, Mutation Rehearsal, Adversarial Wargame |
| **REFLEX** | 4 | Reactive Reflex Controller, Learned Stimulus-Response, Reflex Accuracy Monitor, Predictive Reflex Arc |
| **COMPASS** | 4 | Strategic Navigation, Proximity Intelligence, Geofenced Policy, Jurisdiction-Aware Router |
| **LINGUA** | 4 | Polyglot Translation Matrix, Cultural Context Adapter, Domain Terminology Forge, Cross-Lingual Intelligence |
| **HARVEST** | 4 | Data Harvest Orchestrator, Adaptive Source Discovery, Freshness Arbitrage, Cross-Lingual Intelligence Miner |
| **TREATY** | 4 | Negotiation Protocol, Breach Penalty Calculator, Contract Evolution Mediator, Fair Negotiation Protocol |
| **INCLUSIVE** | 3 | Adaptive Accessibility, Universal Input Interpreter, Cognitive Load Accessibility Governor |
| **MODERNIZER** | 4 | MODERNIZER Engine, Shadow Evolution, Technical Debt Quantifier, Legacy Transcoding Bridge |
| **OBSERVABILITY** | 3 | Full-Stack Observability Fabric, Distributed Tracing Synthesizer, Cognitive Flame Graph |
| **ANALYTICS** | 3 | Real-Time Analytics Fusion, Predictive Trend Crystallizer, Cohort Intelligence |
| **RIPPLE** | 3 | Causal Event Propagation, Temporal Ripple Analyzer, Event Storm Dampener |
| **ENCODE** | 4 | SEBA Engine, Graduated Autonomy, Intent Compiler, Semantic Encoding Pipeline |

---

## Experience Crown Jewels — 24 Total (Sealed Export)

These are released to customers as **sealed, black-boxed** capabilities. They run through the substrate but are accessible via Artifact Packs with tier-gated access.

### Creator Tier ($49)
- Recursive Goal Optimizer
- Recursive Emergent Behavior Analyzer
- Recursive Self-Healing Mesh
- End-to-End Reasoning Pipeline
- Creative Evolution Engine
- Creative Forge
- Chaos Resilience Framework
- Defense Behavioral Biometrics
- Mutation Testing
- Intent Evolution Tracker
- Event Dedup Intelligence
- Value Attribution Engine

### Architect Tier ($149)
- Knowledge Graph Topology
- Emergent Threat Anticipator
- Audit-Grade Decision Ledger
- Decision Confidence Governor
- Friction Auto-Removal Engine
- Autonomous Evolution
- Self-Healing Synergy
- Cognitive Mesh Orchestrator
- Self-Healing Engine
- Attack Surface Engine
- Knowledge Retrieval Engine
- Delivery Orchestrator

**Protection mechanisms:**
1. `blackbox.ts` — hex-encodes CJPI weights (e.g., `[0x1E, 0x1E, 0x14, 0x14]`)
2. Internal comment stripping
3. Sealed Runtime™ wrapper — execution-only, no source access
4. Tier-gated entitlement resolution

---

## Why Architecture Jewels Can NEVER Be Exported

### 1. Competitive Moat Destruction
The 209 Architecture jewels represent 2-3 years of engineering that would take a funded team to replicate. Exposing them reduces our moat to zero.

### 2. Security Compromise
Jewels like Intelligence Containment, Adversarial Simulation, and Honeypot Intelligence reveal exactly how we detect and respond to threats. Exposing them is equivalent to publishing our defense playbook.

### 3. Evolution Pipeline Exposure
The SEBA pipeline (Mutation Proposal → Shadow Run → Evolution A/B → Rollback) is our autonomous self-improvement engine. Exposing it allows competitors to build self-evolving systems without the 490+ cycles of validation we've invested.

### 4. Governance Bypass Risk
Jewels like Veto Authority, Autonomy Budget Manager, and Policy-Aware Intelligence Gate enforce safety boundaries on autonomous decisions. Exposing their logic allows adversaries to craft inputs that bypass governance checks.

### 5. Builder Isolation Violation
Per the Builder Isolation Protocol: *"User projects run ON the CMPSBL Substrate, never AS the CMPSBL Substrate."* Architecture jewels ARE the substrate — exporting them violates this invariant.

---

## Non-Negotiable Rules

1. **Architecture jewels are PERMANENT GATEKEEP** — no exception, no override, no "special deal"
2. **Experience jewels are SEALED ONLY** — never raw source, never config exposure
3. **CJPI weights are ALWAYS hex-encoded** in any export context
4. **No Architecture jewel may appear in any public API, documentation, or marketing material**
5. **The release gate (`crown-jewel-release-gate.ts`) must be checked before ANY capability surfaces externally**
6. **New jewels default to Architecture classification** — promotion to Experience requires governor approval

---

## File References

| File | Purpose |
|------|---------|
| `src/crownjewels/s-tier.registry.json` | Canonical registry (233 entries) |
| `src/crownjewels/s-tier/*.ts` | Implementation files (229 files) |
| `src/crownjewels/canon.ts` | Module whitelist & drift enforcement |
| `src/crownjewels/types.ts` | Core type definitions |
| `src/lib/capabilities/crown-jewel-registry.ts` | Architecture vs Experience classification sets |
| `src/lib/capabilities/crown-jewel-release-gate.ts` | Release gate enforcement |

---

© 2025–2026 CMPSBL®. Internal Use Only.
