# CMPSBL Substrate — System Architecture

**v10.5.4 ARCHITECT Epoch** · Updated February 19, 2026

---

## Overview

The CMPSBL Substrate is a 21-module, 6-layer cognitive orchestration system. Every module registers capabilities, reports health, and communicates via the Engine Bus. The system self-evolves under governance constraints through SEBA (Self-Evolving Bounded Agent).

---

## Layer Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  LAYER 6 — INFRASTRUCTURE                                    │
│  Memory · Relay · Audit · Identity · Economy · Sandbox        │
├──────────────────────────────────────────────────────────────┤
│  LAYER 5 — ORCHESTRATOR                                      │
│  Cortex · Encode                                             │
├──────────────────────────────────────────────────────────────┤
│  LAYER 4 — ADMINISTRATIVE                                    │
│  System · Modernizer · Inclusive                             │
├──────────────────────────────────────────────────────────────┤
│  LAYER 3 — OPERATIONAL                                       │
│  Defense · Nexus · Vision · Integration                      │
├──────────────────────────────────────────────────────────────┤
│  LAYER 2 — COGNITIVE                                         │
│  Brain · Decode · Dream                                      │
├──────────────────────────────────────────────────────────────┤
│  LAYER 1 — KERNEL                                            │
│  Core · Ripple · Access                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Module Registry (21 Modules)

| # | Module | Layer | Purpose |
|---|--------|-------|---------|
| 1 | **CORE** | Kernel | Foundation primitives, lifecycle, health aggregation |
| 2 | **RIPPLE** | Kernel | Event bus, message routing, dead-letter queues |
| 3 | **ACCESS** | Kernel | API keys, entitlements, usage metering, Stripe billing |
| 4 | **BRAIN** | Cognitive | Four-tier memory (hot/warm/cold/archived), knowledge graphs |
| 5 | **DECODE** | Cognitive | NL → structured intent, epistemic translation |
| 6 | **DREAM** | Cognitive | Autonomous dream cycles, creative synthesis |
| 7 | **DEFENSE** | Operational | Bot detection, threat intelligence, behavioral analysis |
| 8 | **NEXUS** | Operational | Multi-provider AI fleet routing (v5.0), cost optimization |
| 9 | **VISION** | Operational | Observability, distributed tracing, SLA monitoring |
| 10 | **INTEGRATION** | Operational | 35+ enterprise adapters with LLM governance |
| 11 | **SYSTEM** | Administrative | Backup/restore, diagnostics, predictive healing |
| 12 | **MODERNIZER** | Administrative | Evolution engine, SEBA, scan→plan→evolve lifecycle |
| 13 | **INCLUSIVE** | Administrative | WCAG compliance, accessibility scanning, adaptive UI |
| 14 | **CORTEX** | Orchestrator | Meta-orchestration, proposal evaluation, workflow engine |
| 15 | **ENCODE** | Orchestrator | Governed code execution, DECODE→ENCODE pipeline, CLM |
| 16 | **MEMORY** | Infrastructure | Vector store, RAG, embedding staleness, relevance feedback |
| 17 | **RELAY** | Infrastructure | HMAC webhook signatures, adaptive retry with jitter |
| 18 | **AUDIT** | Infrastructure | Immutable logs, SOC2/GDPR/HIPAA/ISO27001 compliance |
| 19 | **IDENTITY** | Infrastructure | Actor reputation (5 tiers), cross-agency portability |
| 20 | **ECONOMY** | Infrastructure | Cost forecasting, per-capability cost attribution |
| 21 | **SANDBOX** | Infrastructure | Safe execution, resource limits, snapshot/restore |

---

## Engine Architecture

The substrate operates a 3-tier engine model:

| Tier | Count | Description |
|------|-------|-------------|
| **Capabilities** | 269 | Atomic operations registered in the Capability Registry |
| **Engines** | 62 | Grouped capability executors across 16 categories |
| **Meta-Engines** | 20 | Cross-engine orchestrators producing 2x–8x synergy |

### Engine Categories (16)

Cognitive (4), Operational (4), Intelligence (4), Governance (3), Security (3), Evolution (2), Communication, Integration, Analytics, Experience, Knowledge, Autonomy, Creativity, Perception, Resource, Workflow.

---

## Cross-Cutting Systems

### CLM Engine v2.0
Server-side 24/7 autonomous learning via `pf-clm-engine` edge function. 5-phase lifecycle every 5 minutes: Cognitive Cycle → Module Self-Analysis → Topic Study → Brain Transfer → Memory Consolidation.

### Intent Mesh
12-layer emergent intelligence architecture. All 21 modules autonomously discover and compose capabilities. Successful routes crystallize into permanent pipelines. 60+ crystallized pipelines in production.

### SEBA (Self-Evolving Bounded Agent)
Autonomous improvement under governance constraints. Phases: Analyze → Propose → Gate → Execute → Verify. Human-in-the-loop approval for all evolution proposals.

### Governance Guard
Ethical and coherence constraint enforcement. Veto authority, epistemic discipline, signal arbitration. Global kill switch for all autonomous systems.

### Truth Verification
Automated parity checks between OS Dashboard metrics, Terminal output, and the Central Health Registry. Integrity events emitted on mismatch.

### Telemetry Aggregator
Unified observability layer syncing `ai_usage_log`, `access_usage`, and `brain_events` into the Central Health Registry.

---

## Data Flow

```
User Request
  → Decode (intent extraction)
    → Core (routing + authorization)
      → Target Module (execution)
        → Vision (telemetry + tracing)
          → Audit (immutable logging)
            → Economy (cost attribution)
              → Response
```

---

## Security Model

| Layer | Mechanism |
|-------|-----------|
| **Edge** | JWT validation on critical paths, HMAC webhook signatures |
| **RLS** | Row-level security on all user data tables |
| **Rate Limiting** | Per-endpoint rate limits with adaptive backoff |
| **Governance** | Veto authority on destructive operations |
| **Audit** | Immutable compliance logging with retention policies |
| **Identity** | Actor reputation scoring (untrusted → elite) |

---

## Deployment

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **AI Routing** | Model-agnostic, provider-agnostic via Nexus Fleet |
| **Hosting** | Commodity cloud (any provider) |
| **CI/CD** | Canary deploy with hot-swap for zero-downtime updates |

---

*CMPSBL OS Substrate v10.5.4 — ARCHITECT Epoch*  
*© 2025–2026 PromptFluid®. All rights reserved.*
