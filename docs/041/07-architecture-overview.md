# 07 — Architecture Overview

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document provides a comprehensive architecture overview of the CMPSBL cognitive substrate, covering the system's structural design, execution model, and component relationships.

---

## 1. System Architecture

CMPSBL is a cognitive operating system organized into four structural layers:

```
┌─────────────────────────────────────────────┐
│             Application Layer               │
│   Apps, Agents, Chatbots, Copilots, APIs    │
├─────────────────────────────────────────────┤
│             Substrate Layer                 │
│   40-Node Matrix │ Intent Mesh │ Governance  │
├─────────────────────────────────────────────┤
│             Memory Layer                    │
│   Persistent Memory │ Vector Search │ Stream │
├─────────────────────────────────────────────┤
│            Infrastructure Layer             │
│   Telemetry │ Audit │ Storage │ Auth        │
└─────────────────────────────────────────────┘
```

### Application Layer

User-facing applications, agents, chatbots, copilots, and API consumers interact with the substrate through the unified gateway.

### Substrate Layer

The 40-primitive matrix, intent routing mesh, governance enforcement, and capability registry form the core cognitive runtime.

### Memory Layer

Persistent memory with vector search, spaced repetition, contradiction detection, and the Memory Stream discovery engine.

### Infrastructure Layer

Database storage, authentication, file storage, telemetry collection, and audit chain anchoring.

---

## 2. Node Matrix

The 40-primitive matrix is organized into 4 functional categories. Each primitive is an autonomous subsystem that exposes capabilities through resolvers.

### Node Interaction Model

```
Node A                    Node B
  │                         │
  └── resolver_x ───┐      │
                     ▼      │
              Intent Router │
                     │      │
                     └──── resolver_y
                              │
                              ▼
                         Response
```

Primitives never communicate directly. All interaction flows through the intent router, which:

1. Receives an intent from the source
2. Determines which resolvers should execute
3. Coordinates execution
4. Aggregates responses
5. Emits mesh communications
6. Logs receipts

---

## 3. Execution Flow

### Intent Lifecycle

```
1. Intent Created
   ↓
2. Router Receives Intent
   ↓
3. Resolver Selection (capability matching)
   ↓
4. Pre-execution Governance Check
   ↓
5. Resolver Execution (parallel where possible)
   ↓
6. Response Aggregation
   ↓
7. Receipt Generation (hash-linked)
   ↓
8. Mesh Communication Emission
   ↓
9. Telemetry Recording
```

### Governance Gates

Every mutation passes through a 7-gate promotion memory chain:

1. **Lint** — Structural validation
2. **Test** — Behavioral verification
3. **Review** — Automated analysis
4. **Stage** — Staging environment deployment
5. **Consent** — Mandatory user approval
6. **Deploy** — Production deployment
7. **Prod** — Post-deployment verification

---

## 4. Memory Architecture

### Persistent Memory

The substrate provides a full cognitive memory stack:

| Component | Function |
|---|---|
| Vector Store | Semantic similarity search across stored memories |
| Spaced Repetition | Importance-weighted recall scheduling |
| Contradiction Detection | Identifies conflicting stored information |
| Causal Graphs | Maps cause-effect relationships |
| User Fingerprinting | Contextual adaptation per user |
| Tier Management | RPS-based memory tier promotion/demotion |
| Audit Provenance | Complete history of memory modifications |

### Memory Stream

The continuous discovery engine operates independently of user-directed memory operations. It observes all system activity and identifies novel, valuable execution patterns.

### Local Tier Cache

A local caching layer provides fast access to frequently-used memories, with automatic eviction and maintenance.

---

## 5. Discovery Memory Chain

### Foundry

The Foundry explores combinations of primitives and resolvers to discover new capabilities. It operates using three composition strategies:

1. **Value Maximization** — Highest possible CJPI
2. **Cross-Category Synergy** — Novel cross-domain combinations
3. **Full-Spectrum Coverage** — Comprehensive category representation

### Crystallization Memory Chain

```
Discovery (CJPI ≥ 68)
    ↓
Sampling
    ↓
Condensing
    ↓
Crystallizing
    ↓
Capability Pack
    ↓
Universal Export Adapter
    ↓
Standalone Artifact (25 languages)
```

---

## 6. Capability System

The substrate maintains 940+ registered capabilities organized into registries:

| Registry | Count | Scope |
|---|---|---|
| Core Capabilities | ~270 | Base system functions |
| Infrastructure | Variable | Infrastructure primitives |
| Apex Capabilities | Variable | Premium, high-value |
| Expansion Layer | 275 | 11 expansion primitives × 25 |
| Synergies | 200 | Cross-primitive memory chains |

Capabilities can be invoked individually, composed into chains, or discovered through the Memory Stream.

---

## 7. Telemetry and Observability

### Mesh Communications

All node-to-node signals are persisted to the mesh communications table and displayed through the live dashboard. Each signal includes:

- Source and target modules
- Raw signal and translated voice
- Category and resolver ID
- Personality trait and icon
- Timestamp

### Audit Chain

Receipts are hash-linked into a tamper-evident audit chain. Periodic anchoring creates verifiable checkpoints.

### Health Monitoring

The system computes health scores through a 3-phase Reality Protocol:

1. **Real Reads** — Live data from 50+ system tables
2. **Governed Writes** — 6-gate write memory chain
3. **Computed Heartbeats** — Derived health metrics

---

## 8. Engine Catalog

The substrate includes 54 engines organized into four tiers:

| Tier | Count | Purpose |
|---|---|---|
| **META** | 4 | Recursive super-memories chaining multiple engines |
| **APEX** | 10 | High-capability specialized engines |
| **ELITE** | 20 | Professional-grade processing |
| **CORE** | 20 | Foundation-level execution |

S-tier engines (30 "Sealed Runtimes" + 4 Meta-Engines) are accessed through the unified engine-api gateway with X-Engine-Key authentication.

---

## 9. Security Architecture

### Defense Systems

- **DEFENSE node** — Threat detection and response
- **IMMUNITY node** — Anomaly signatures and drift baselines
- **PHANTOM node** — Shadow verification (TSAC)
- **GOVERNANCE node** — Rule enforcement

### Sealed Mechanisms

Certain implementation details are intentionally withheld as trade secrets:

- Scoring formulas and weight allocations
- Security threshold values
- Routing algorithm specifics
- Mutation evaluation criteria

These categories are documented in the Sealed Mechanisms Registry. The architecture and concepts are public; the specific implementations are not.

---

## Related Documents

- [How CMPSBL Works](02-how-cmpsbl-works.md)
- [Governance & Trust](08-governance-and-trust.md)
- [API Reference](15-api-reference.md)

---

© 2025–2026 CMPSBL®. All rights reserved.
