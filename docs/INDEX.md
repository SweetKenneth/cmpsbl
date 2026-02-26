# CMPSBL Substrate — Documentation Index

## Classification: Technical Reference Library

**Version:** SPARTA Epoch (v11.2.1)  
**Last Updated:** February 2026  
**Audience:** Investors, Technical Reviewers, System Architects

---

## Recommended Reading Order

### 1. Executive Overview
| Document | Location | Description |
|----------|----------|-------------|
| Investor Cheat Sheet | `docs/internal/19-INVESTOR-CHEAT-SHEET.html` | Business model, competitive moat, key metrics |
| Architecture Internals | `docs/internal/01-ARCHITECTURE-INTERNALS.html` | System-level architecture overview |
| Business Model | `docs/internal/18-BUSINESS-MODEL.html` | Revenue model, pricing tiers |

### 2. Architecture Deep Dives (docs/v11/)
| Document | Focus Area |
|----------|------------|
| `architecture-overview.md` | System-level architecture overview |
| `matrix-overview.md` | 24-node Matrix topology |
| `sector-architecture.md` | 5-sector organization (1/4/5/9/5 model) |
| `kernel-and-zones.md` | CORE kernel, CCR/CCL zone structure |
| `weighted-integrity-model.md` | Deterministic health scoring |
| `breaker-isolation-model.md` | Circuit breaker state machine |

### 3. Layer Deep Dives (docs/v11/)
| Document | Layer |
|----------|-------|
| `ccr-deep-dive.md` | Layer 0 — Cognitive Core Runtime (SYSTEM, BRAIN, MEMORY, DREAM) |
| `ccl-deep-dive.md` | Layer 1 — Clockless Cognitive Lucidity (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT) |
| `execution-surfaces.md` | Layer 2 — Execution modules (DECODE, ENCODE, NEXUS, CORTEX, etc.) |
| `overlay-mesh-deep-dive.md` | Layer 3 — Overlay mesh (DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE) |

### 4. Resilience & Security
| Document | Location | Focus |
|----------|----------|-------|
| Hardening Report | `docs/internal/25-HARDENING-REPORT.html` | 20/24 node hardening coverage |
| Security Architecture | `docs/internal/26-SECURITY-ARCHITECTURE.html` | Threat model, RLS, invariants |
| Hardening & Memory Safety | `docs/v11/hardening-and-memory-safety.md` | Hardening primitives, coverage matrix |
| Hot-Swap & Recovery | `docs/v11/hot-swap-and-recovery.md` | Zero-downtime recovery protocol |
| Matrix Resilience Suite | `docs/v11/matrix-resilience-suite.md` | 10 resilience engines |

### 5. Observability & Governance
| Document | Location | Focus |
|----------|----------|-------|
| Telemetry & Observability | `docs/v11/telemetry-and-observability.md` | GOAL, HAE, snapshot engine |
| Integrity & Governance | `docs/v11/integrity-and-governance.md` | GOAL, health caps, audit trail |
| Boot Sequence | `docs/v11/boot-sequence-and-dependencies.md` | DAG-ordered initialization |

### 6. Module Internals (docs/internal/)
| Document | Module |
|----------|--------|
| `27-ECONOMY-AND-METERING.html` | ECONOMY — Cost attribution, millicent tracking |
| `28-MEMORY-TIERING-INTERNALS.html` | MEMORY — Hot/warm/cold/archive with SM-2 |
| `29-NEXUS-ROUTING-INTERNALS.html` | NEXUS — AI provider routing, fallback chains |
| `30-CORTEX-ORCHESTRATION.html` | CORTEX — Task orchestration, concurrency |
| `31-DECODE-ENCODE-PIPELINE.html` | DECODE/ENCODE — NLP-to-code pipeline |
| `32-SANDBOX-EXECUTION.html` | SANDBOX — Resource-bounded code execution |

### 7. Evolution & Self-Improvement
| Document | Location | Focus |
|----------|----------|-------|
| Evolution & Shadow | `docs/v11/evolution-and-shadow.md` | Shadow A/B testing, canary deployment |
| Evolution Mesh Internals | `docs/internal/24-EVOLUTION-MESH-INTERNALS.html` | Full evolution lifecycle |
| SEBA Internals | `docs/internal/23-EVLVBL-INTERNALS.html` | Self-evolving behavior agent |

### 8. Release & Deployment
| Document | Location | Focus |
|----------|----------|-------|
| Release Gate | `docs/RELEASE-GATE.md` | 10-pass pre-release validation framework |
| Rollback Plan | `docs/ROLLBACK.md` | Deployment recovery procedures |
| Operational Runbook | `docs/internal/14-OPERATIONAL-RUNBOOK.html` | Incident response, maintenance |
| Database Schema | `docs/internal/16-DATABASE-SCHEMA.html` | Complete table reference |
| Deployment Guide | `docs/internal/17-DEPLOYMENT.html` | CI/CD, environment configuration |
| Defense Playbook | `docs/internal/08-DEFENSE-PLAYBOOK.html` | Threat detection, response |
| Executor Evolution | `docs/internal/36-EXECUTOR-EVOLUTION-TRAINING.html` | 13 executor performance optimizations |
| Matrix Node Optimizations | `docs/internal/37-MATRIX-NODE-OPTIMIZATIONS.html` | 48 substrate-level node optimizations |

---

## Documentation by Audience

### For Investors
1. Start with `19-INVESTOR-CHEAT-SHEET.html`
2. Skim `01-ARCHITECTURE-INTERNALS.html`
3. Review `25-HARDENING-REPORT.html` + `26-SECURITY-ARCHITECTURE.html`
4. Check `18-BUSINESS-MODEL.html`

### For Technical Reviewers / Pentesters
1. Start with `docs/v11/architecture-overview.md`
2. Deep dive into `26-SECURITY-ARCHITECTURE.html`
3. Review `docs/v11/hardening-and-memory-safety.md`
4. Check RLS policies via database schema
5. Review edge function authentication patterns

### For System Architects
1. Full `docs/v11/` library in order
2. All internal docs `01` through `32`
3. Evolution mesh and self-improvement system
4. Boot sequence and dependency graph

---

## Directory Structure

```
docs/
├── INDEX.md              ← You are here
├── v11/                  ← SPARTA Epoch technical library (18 files)
├── internal/             ← Internal reference guides (38 files)
├── academic/             ← Research papers and theoretical foundations
├── advances/             ← R&D documentation
├── ceo/                  ← Executive communications
├── clockless/            ← Clockless architecture specifications
├── evolution-mesh/       ← Evolution system documentation
├── library/              ← Reference material
├── modules/              ← Per-module documentation
├── patches/              ← Patch notes and changelogs
├── substrate/            ← Core substrate documentation
├── website/              ← Public website content
├── whitepaper/           ← Technical whitepaper
└── archive/              ← Historical documentation (v10 and earlier)
```

---

*CMPSBL Substrate — SPARTA Epoch v11.2.1*  
*© 2025–2026 PromptFluid®. All rights reserved.*
