# 06 — Hardening Registry

**Classification:** 🔒 INTERNAL

---

## 1. Purpose

This document inventories every hardened module in the substrate, its hardening version, key features, and health grading methodology. The observability suite monitors all 22 hardened modules with 500+ terminal commands.

## 2. Hardened Module Inventory

### Tier 1 — Core Infrastructure

| Module | Hardening Version | Codename | Key Features |
|--------|------------------|----------|--------------|
| CORE | v2.0.0 | Foundation | Boot integrity seals (SHA), timing profiler, shutdown deadline, DLQ, bulkhead isolation, module quarantine, request deduplication, priority queuing, adaptive timeouts, Core Watchdog |
| SYSTEM | v2.0.0 | Bastion | Boot integrity seals (hash-chained), lifecycle state machine, module dependency validation, shutdown coordinator, resource quota enforcement, diagnostic snapshot engine |
| MEMORY | v2.0.0 | Vault | Content hash seals (tamper detection), WAL for crash recovery, retrieval latency (P95) monitoring, SM-2 health monitoring |
| DREAM | v2.0.0 | Nocturne | Hallucination guards, energy budgets, latent pattern caching, insight promotion memory chains |

### Tier 2 — Security & Governance

| Module | Hardening Version | Codename | Key Features |
|--------|------------------|----------|--------------|
| DEFENSE | v2.0.0 | Fortress | Geo-velocity detection, request fingerprinting (FNV-1a), session binding, honeypot registry (15 decoy paths), progressive challenge escalation, replay attack guard, PII egress filtering, header cloaking, payload entropy analysis, threat feed ingestion, defense posture score (A-F), attack surface mapping, tamper-evident audit trail signer |
| GOVERNANCE | v2.0.0 | Arbiter | Quorum consensus engine, decision audit chain, consent verification, policy version control, conflict resolver, policy simulation, separation of duties, escalation ladder, delegation chains, governance cooldowns, decision impact scorer, emergency override protocols, decision entropy monitor, governance health composite, governance integrity seal |

### Tier 3 — Operational

| Module | Hardening Version | Features |
|--------|------------------|----------|
| BRAIN | v2.0.0 | Embedding integrity, classifier health, drift detection, maintenance scheduling |
| CORTEX | v2.0.0 | Pipeline orchestration, capability composition, multi-step execution |
| ENCODE | v2.0.0 | Output format validation, response shaping, encoding error recovery |
| DECODE | v2.0.0 | Input sanitization, command parsing, terminology enforcement |
| VISION | v2.0.0 | Z-score anomaly detection, cross-module correlation clustering, performance profiling |
| ECONOMY | v2.0.0 | Cost tracking, ROI computation, budget enforcement |
| NEXUS | v3.0.0 | Fleet intelligence (see doc 05), consensus routing, cost ledger |
| IMMUNITY | v2.0.0 | Self-healing, OCG capability gates, threat correlation |
| EVOLUTION | v2.0.0 | Mutation pipeline, receipt chain, promotion gates |
| INTENT | v2.0.0 | User intent classification, context routing, goal tracking |
| ENGINEER | v2.0.0 | Autonomous maintenance proposals, signal aggregation |
| ATLAS | v2.0.0 | Capability gating, feature flags, marketplace |
| AUDIT | v2.0.0 | Immutable trail, tamper-evident hashing, compliance scoring |
| RELAY | v2.0.0 | Webhook delivery, content-hash dedup, health-weighted failover |
| RIPPLE | v2.0.0 | Event bus, DLQ, cascade detection |
| INCLUSIVE | v2.0.0 | WCAG compliance, accessibility scoring |
| SANDBOX | v2.0.0 | Isolated execution, resource limits |

## 3. Health Grading System

### Grade Scale

| Grade | Score | Color | Action |
|-------|-------|-------|--------|
| A | 90–100 | Green | No action needed |
| B | 75–89 | Blue | Minor items, monitor |
| C | 60–74 | Yellow | Monitor closely |
| D | 40–59 | Orange | Active investigation required |
| F | 0–39 | Red | Auto-heal triggers |

### Composite Score Formula

Each module's health score is computed from weighted factors:

```
score = Σ(factorᵢ × weightᵢ) where Σweightᵢ = 1.0

Factors:
  - uptime_24h      (weight: 0.25)
  - error_rate_1h    (weight: 0.25)
  - circuit_state    (weight: 0.20)
  - p95_latency      (weight: 0.15)
  - quarantine_state (weight: 0.15)
```

### Dashboard Layout

The Hardening Dashboard renders a 3×5 grid (+ additional rows as needed) showing:
- Module name
- Health grade (A–F)
- Numeric score (0–100)
- Trend indicator (↑ improving, → stable, ↓ degrading)

Data is provided by the `useHardeningHealth` hook.

## 4. Terminal Commands per Module

Each hardened module exposes diagnostic terminal commands following a consistent pattern:

```
{module}.status      — Current health and state
{module}.health      — Detailed health breakdown
{module}.config      — Runtime configuration
{module}.metrics     — Performance metrics
{module}.diagnose    — Run diagnostic sweep
{module}.reset       — Reset module state (admin only)
```

Total available commands: **500+** across all modules.

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial hardening registry |

---

© 2025–2026 CMPSBL®. Confidential.
