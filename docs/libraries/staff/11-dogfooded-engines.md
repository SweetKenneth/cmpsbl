# CMPSBL® Dogfooded Engines Registry

**Classification:** INTERNAL — Team Members Only  
**Version:** v16.7.0 — CONTACT Epoch  
**Last Updated:** 2026-03-28

---

## Purpose

This document catalogs every CMPSBL store engine that is actively running inside the substrate itself. When we say "we eat our own dog food," we mean it — **35 of our ~54 store engines power the very infrastructure customers are buying.** This is our strongest trust signal: the engines are not theoretical products, they are the production runtime.

Every engine listed here carries the **"Powers CMPSBL"** badge on the Engines page.

---

## Summary

| Metric | Value |
|--------|-------|
| Total store engines | ~54 |
| Actively dogfooded | 35 |
| Substrate primitives powered | 100+ |
| Categories covered | 10 |
| Oldest activation | August 2025 (ARCHITECT) |

---

## Registry by Category

### 🔧 Kernel & Core Infrastructure

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **ARCHITECT** | APEX | $999/yr | CORE Kernel, Boot Sequencer, Module Lifecycle, Circuit Breaker Registry | The unified 8-stage pipeline (Parse → Route → Execute → Heal → Defend → Learn → Observe → Audit). ARCHITECT **is** the substrate. | Aug 2025 |
| **TITAN** | APEX | $999 | Circuit Breaker Fabric, Consensus Heartbeat, Distributed Consensus Mesh, Quorum Negotiator, Homeostatic Regulator | Powers the Self-Healing Consensus Meta-Engine — Byzantine fault tolerance, breaker coordination, quorum negotiation across all 40 primitives. | Jan 2026 |
| **BASTION** | CORE | FREE | Health-Aware Routing, RELAY Module, Load Distribution | Health-aware traffic routing and load distribution across substrate nodes. | Feb 2026 |

---

### 🛣️ Routing & Intent Mesh

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **NEXUS** | APEX | $599 | NEXUS Router, AI Provider Selection, Cost-Aware Routing | Routes ALL AI calls — model selection, failover, cost optimization, token budget enforcement. Every LLM call passes through NEXUS. | Sep 2025 |
| **CONDUCTOR** | ELITE | $399 | Intent Router, broadcastIntent(), Receipt Pipeline | The Intent Router **is** CONDUCTOR. All system actions flow through `broadcastIntent()`, which routes to resolvers and emits mesh communications. | Sep 2025 |
| **CATALYST** | CORE | $199 | Mesh Communications, mesh_comms table, Node Signaling | Powers the pub/sub Mesh Communications layer — every node signal, acknowledgement, heartbeat, and escalation flows through CATALYST. | Oct 2025 |
| **SYNAPSE** | APEX | $599 | NERVE Module, Cross-Primitive Signaling, Context Threading | NERVE uses SYNAPSE patterns for cross-primitive signaling and context threading across multi-hop resolver chains. | Feb 2026 |

---

### 🛡️ Defense & Security

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **SENTINEL** | APEX | $599 | DEFENSE Layer, Cognitive Threat Profiler, IMMUNITY Mesh | Powers the 6-layer Cognitive Security Mesh — perimeter defense, threat scoring, prompt injection shielding, anomaly detection. | Oct 2025 |
| **HARBINGER** | APEX | $999 | DEFENSE Predictive Layer, Anomaly Correlation, Cascade Prevention | Predictive threat detection — identifies emergent patterns before they materialize, correlates anomalies, halts cascades at origin. | Jan 2026 |
| **CERBERUS** | APEX | $599 | Prompt Injection Shield, Input Sanitization, Hallucination Guard, Veto Authority | Multi-gate defense — guards every substrate input with injection shielding, sanitization, output validation, and executive veto. | Jan 2026 |
| **AEGIS** | CORE | $199 | IDENTITY Module, TierGate, RBAC Engine, Session Attestation | Powers IDENTITY and TierGate — fine-grained RBAC, credential management, session attestation, zero-trust enforcement. | Feb 2026 |
| **WARDEN** | APEX | $599 | SANDBOX Module, Graduated Autonomy, Compliance Gate | Powers SANDBOX — sealed execution for untrusted code, graduated autonomy calibration for ADA, compliance gating. | Mar 2026 |
| **SERAPH** | APEX | $599 | CONSCIENCE Module, Ethical Constraint Engine, Value Alignment | Powers CONSCIENCE — ethical constraint reasoning for ADA decisions, bias detection, fairness auditing, harm prevention gating. | Mar 2026 |

---

### 🧬 Evolution & Self-Improvement

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **FORGE** | ELITE | $399 | ENCODE Systems Engineer, SEBA Evolution Engine, Patch Writer | SEBA uses FORGE's code generation to write, audit, and apply surgical patches. 262 validated patches at ~$0.11 total cost. | Nov 2025 |
| **PROMETHEUS** | APEX | $999 | SEBA 7-Gate Pipeline, Mutation Proposal Engine, Shadow Run Environment | The SEBA Evolution Engine **is** PROMETHEUS — 7-gate safety-bounded evolution, mutation proposal, shadow testing. | Jan 2026 |
| **CRUCIBLE** | APEX | $599 | TSAC Verification, Chaos Testing, Mutation Testing, Adversarial Simulation | Powers TSAC — automated stress testing of SEBA patches, chaos engineering for resilience verification, adversarial failure simulation. | Mar 2026 |
| **AXIOM** | APEX | $599 | Patch Correctness Verification, Constraint Satisfaction, Logical Validation | Formal verification gate in SEBA — validates patch correctness, ensures logical consistency, proves invariant preservation. | Mar 2026 |
| **PROGENITOR** | APEX | $599 | Pipeline Foundry, Capability Discovery, Artifact Hardening | Powers the Pipeline Foundry — capability genesis from resolver combinations, blueprint evolution, artifact hardening for exports. | Mar 2026 |

---

### 🔄 Resilience & Recovery

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **PHANTOM** | APEX | $599 | Self-Healing Consensus, Circuit Breakers, Graceful Degradation | The Self-Healing Consensus Meta-Engine **is** PHANTOM — Byzantine fault tolerance, automatic node recovery, zero-downtime healing. | Mar 2026 |
| **HYDRA** | APEX | $599 | IMMUNITY Mesh, Self-Repair Engine, Cascading Failure Isolation | Powers IMMUNITY mesh self-repair — autonomous repair, blast radius quarantine, multi-level fallback, subsystem regeneration. | Jan 2026 |
| **GENESIS** | APEX | $599 | Health Engine v2.0.0, Autonomous Triage, 7-Phase Heal All Pipeline | Powers Health Engine Vital Signs — 51-entity monitoring, failure classification, and the 7-phase Heal All pipeline. | Jan 2026 |
| **PHOENIX** | APEX | $599 | Organ Transplant, Root Cause Analysis, Health Aggregation | Autonomous recovery — hot-swaps failing subsystems, traces root causes, unified health scoring for the 12·12·8·8 matrix. | Feb 2026 |

---

### 👑 Governance & Audit

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **SOVEREIGN** | APEX | $999 | ADA (Autonomous Decision Authority), GOVERNANCE Module, Policy Gate | Powers ADA — 15-domain scoped autonomy, 7-gate pipeline, trust calibration, policy-aware governance. | Jan 2026 |
| **OBELISK** | APEX | $599 | AUDIT Chain, Tamper-Evident Logging, FNV-1a Integrity Hashing | Powers the immutable audit chain — 1000-entry tamper-evident logging with FNV-1a hashing and forensic replay. | Jan 2026 |

---

### ⚙️ Workflow & Agency

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **CORTEX** | ELITE | $399 | CORTEX Orchestrator, Agency Runtime, Agent Competency Tracking | Orchestrates multi-agent coordination — task delegation, cognitive load balancing, shared memory, competency-based routing. | Nov 2025 |
| **AUTOMATON** | CORE | $199 | Agency Scheduler, Scheduled Tasks, Event-Driven Workflows | Powers Agency scheduled tasks — conditional workflows, scheduled execution, event-driven automation, retry/error handling. | Feb 2026 |
| **GOLEM** | APEX | $599 | Agency Task DAG, Goal Decomposition, Pipeline Composition | Powers Agency task execution — DAG resolution, goal decomposition, dynamic pipeline composition for multi-step workflows. | Feb 2026 |

---

### 📡 Observability & Cost

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **BEACON** | CORE | FREE | Health Engine v2.0.0, Mesh Telemetry, Intent Receipts | Powers ALL substrate observability — 51-entity health monitoring, mesh dashboard, latency tracking, telemetry pipelines. | Sep 2025 |
| **DYNAMO** | APEX | $599 | AI Cost Optimizer, Token Budget Controller, ECONOMY Module | Powers the ECONOMY primitive — real-time AI cost tracking, per-model token budgets, resource arbitrage, waste detection. Maintains ≤$0.05/SEBA-run cost discipline. | Mar 2026 |

---

### 🧠 Intelligence & Prediction

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **ORACLE** | ELITE | $399 | ORACLE Prophetic Engine, Drift Detector, Confidence Classifier | Predictive modeling — drift detection, confidence gating before autonomous execution, pattern recognition across signals. | Dec 2025 |
| **ECHO** | APEX | $599 | ECHO Feedback Module, Drift Correction, Confidence Recalibration | Powers ECHO feedback loops — outcome tracking, reinforcement learning for SEBA, drift correction, confidence recalibration. | Feb 2026 |
| **CHIMERA** | APEX | $999 | CLM (Cognitive Lifecycle Manager), Intent Drift Tracker, Personality Adaptation | Powers CLM — adaptive product intelligence, intent drift tracking, friction auto-removal, personality adaptation. | Jan 2026 |
| **PRISM** | APEX | $599 | Memory Stream, Semantic Knowledge Graph, Pipeline Discovery | Powers the Memory Stream — semantic knowledge graph from behavior signals, entity-relationship mapping, RAG-powered retrieval. | Mar 2026 |

---

### 💾 Memory & Data

| Engine | Tier | Price | Internal Primitives | Role | Since |
|--------|------|-------|---------------------|------|-------|
| **LEVIATHAN** | APEX | $999 | 4-Tier Memory (HOT/WARM/COLD/GLACIER), State Synchronization, Gossip Protocol | Powers the 4-tier memory architecture — context threading, immune memory persistence, predictive state pre-loading. | Jan 2026 |
| **CIPHER** | CORE | FREE | Memory HOT Tier, In-Memory Cache, TTL Eviction | Powers the HOT memory tier — distributed in-memory caching, intelligent invalidation, tiered storage for CLM. | Feb 2026 |

---

## Engines NOT Dogfooded (And Why)

The following engines have no current substrate equivalent and are sold purely as customer-facing products:

| Engine | Reason |
|--------|--------|
| **COLOSSUS** | Fleet-scale orchestration — substrate doesn't run multi-thousand agent fleets internally |
| **SPECTER** | Stealth intelligence grid — no internal covert ops requirement |
| **ATLAS** (engine) | Universal context weaver — substrate uses native primitives for context |
| **NEXUS PRIME** | Multi-model consensus — substrate uses single-model routing via NEXUS |
| **CHRONOS** | Temporal intelligence — no current temporal reasoning requirement |
| **PANDORA** | Recursive cognitive depth — substrate uses direct resolver chains |
| **VANGUARD** | Edge computing — substrate runs centralized, not edge-distributed |
| **ARBITER** | API gateway — substrate uses internal routing, not external API gateway |
| **MERIDIAN** | CDN — not applicable to substrate operations |
| **MIRAGE** | Fleet intelligence router — no internal fleet routing requirement |
| **WRAITH** | Shadow operations — substrate uses SEBA shadow runs directly |
| **APEX ONE** | Crown intelligence convergence — capabilities covered by individual engines |
| **OMNISCIENT** | Full-spectrum oracle — capabilities partially covered by ORACLE |
| **MONOLITH** | State management — substrate uses Zustand + database directly |
| **VORTEX** | Data fusion — no current multi-source fusion requirement |
| **FAILSAFE** | Disaster recovery — operates as a user-facing export tool |

---

## Meta-Engines

Meta-engines (GODMIND, FORTRESS, SINGULARITY, ETERNUS) are commercial superpipelines that chain 4 S-tier engines each. They are not directly dogfooded because they are compositions of engines that are individually dogfooded. The substrate runs the component engines natively rather than through the meta-engine wrapper.

---

## How to Verify

1. **Badge check**: Visit `/engines` — every dogfooded engine shows a "Powers CMPSBL" badge
2. **Registry source**: `src/lib/substrate/dogfood-registry.ts` is the single source of truth
3. **Internal mapping**: Each entry maps store slug → internal primitives → role description
4. **Active count**: `getDogfoodStats()` returns live counts

---

## Sales Implications

- **Trust signal**: 35/54 engines are in production use — this is not vaporware
- **Battle-tested**: ARCHITECT has been active since August 2025
- **Cost proof**: DYNAMO + NEXUS maintain ≤$0.05/SEBA-run — customers get the same cost discipline
- **Security proof**: SENTINEL + CERBERUS + AEGIS + WARDEN + SERAPH — 5-layer defense stack protecting real production data
- **Evolution proof**: FORGE + PROMETHEUS + CRUCIBLE + AXIOM — 4-engine evolution pipeline with 262 validated autonomous patches

---

© 2025–2026 CMPSBL®. Internal Use Only.
