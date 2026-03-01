# CMPSBL® Substrate Reconstruction Guide

**Classification:** 🔒 CONFIDENTIAL — Disaster Recovery / IP Preservation  
**Epoch:** CONTRACT (V13)  
**Author:** Kenneth E. Sweet Jr.  
**Date:** 2026-02  

> ⚠️ This document contains everything needed to rebuild the substrate from scratch. Treat as highest-classification trade secret.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Foundation Layer](#2-foundation-layer)
3. [Engine Bus](#3-engine-bus)
4. [Core Engines (5)](#4-core-engines)
5. [State & Telemetry](#5-state--telemetry)
6. [Orchestrator](#6-orchestrator)
7. [24-Node Matrix](#7-24-node-matrix)
8. [Circuit Breakers](#8-circuit-breakers)
9. [Feature Flags](#9-feature-flags)
10. [Memory Tiering](#10-memory-tiering)
11. [SEBA (Self-Evolution)](#11-seba)
12. [CLM (Constant Learning)](#12-clm)
13. [Governance Framework](#13-governance-framework)
14. [Control Plane Persistence](#14-control-plane-persistence)
15. [Infrastructure Systems](#15-infrastructure-systems)
16. [Capability Registry](#16-capability-registry)
17. [SEO & Public Surface](#17-seo--public-surface)
18. [Boot Sequence](#18-boot-sequence)
19. [Database Schema](#19-database-schema)
20. [Verification Checklist](#20-verification-checklist)

---

## 1. Prerequisites

```
Technology Stack:
  Runtime:     React 18+ / TypeScript / Vite
  State:       Zustand
  Backend:     Supabase (PostgreSQL + Edge Functions + Auth + Storage)
  Styling:     Tailwind CSS + shadcn/ui
  3D:          Three.js via React Three Fiber + Drei
  Animation:   Framer Motion
  Routing:     React Router DOM v7+
  Charts:      Recharts
  Testing:     Vitest + jsdom
```

## 2. Foundation Layer

### 2.1 Substrate Client (`src/lib/substrate.ts`)
Create a module map of all 24 nodes. Each module implements:
```typescript
interface SubstrateModule {
  invoke(request: SubstrateRequest): Promise<SubstrateResponse>;
}
interface SubstrateRequest { module: string; action: string; args?: Record<string, unknown>; }
interface SubstrateResponse { success: boolean; data?: unknown; error?: string; }
```

Module aliases: `core`, `brain`, `decode`, `defense`, `nexus`, `vision`, `dream`, `ripple`, `access`, `system`, `modernizer`, `integration`, `inclusive`, `cortex`, `seba`, `memoryMod`, `relayMod`, `auditMod`, `identityMod`, `economyMod`, `sandboxMod`, `encodeMod`

### 2.2 Zustand Store (`src/stores/publicMetricsStore.ts`)
Single source of truth for version, codename, epoch. All version references use `getMetric('version')` — never hardcoded.

## 3. Engine Bus

Build `src/lib/substrate/engine-bus.ts`:

```
ENGINE_ROUTING_MAP: Record<EngineName, string[]>
  memory_core:       [ingest, store, index, reflect, retrieve, remember, recall, query]
  learning_engine:   [input, feedback, adjustment, reinforcement, stabilization, train, optimize, reinforce]
  imagination_engine: [latent_extraction, recombination, simulation, synthesis, dream, synthesize, pattern_fusion]
  reasoning_engine:  [causal_mapping, dependency_analysis, hypothesis_generation, hypothesis_validation, impact_projection, causal, systems_reason, hypothesis_test]
  governance_guard:  [coherence_validation, ethical_constraint_check, governance_signal_emission, ethical, coherence_check]

COMMAND_TO_ENGINE: reverse lookup (command → engine)
```

**Cognitive Load Balancer:**
```
maxConcurrentDispatches: 8
maxQueueDepth: 20
shedThreshold: 6
cooldownMs: 200
backpressureEnabled: true
```

**Dispatch flow:**
1. Resolve engine from command
2. Load balancer gate (shed / backpressure / allow)
3. Record dispatch
4. Emit telemetry start
5. Execute with timeout
6. Retry loop (configurable)
7. Emit telemetry end
8. Update state (success/failure counts, avg duration)

## 4. Core Engines

Build five engines, each as a singleton class:

### 4.1 Memory Core (`memory-core.ts`)
- Tiers: hot / warm / cold
- States: short_term / long_term / latent
- Types: 11 memory types (doctrine, reflection, preference, conversation, dream, general, insight, template, heuristic, error_pattern, doctrine_integrated)
- Lifecycle: ingest → store → index → reflect → retrieve
- Retrieval: fulltext, semantic, pattern, hybrid
- Importance: `(confidence × 0.4) + (access_freq × 0.3) + (recency × 0.2) + (tag_relevance × 0.1)`

### 4.2 Learning Engine (`learning-engine.ts`)
- Stages: input → feedback → adjustment → reinforcement → stabilization
- State: short_term_gain, long_term_gain, decay_rate, reinforcement_weight
- Feedback: positive / negative / neutral with score

### 4.3 Imagination Engine (`imagination-engine.ts`)
- Stages: latent_extraction → recombination → simulation → synthesis
- Operates offline from live input
- Output types: dream, insight, fusion, pattern
- Creativity index tracking

### 4.4 Reasoning Engine (`reasoning-engine.ts`)
- Stages: causal_mapping → dependency_analysis → hypothesis_generation → hypothesis_validation → impact_projection
- CausalLink: { cause, effect, confidence, evidence_refs }
- Hypothesis: { statement, confidence, supporting_evidence, contradicting_evidence, status }

### 4.5 Governance Guard (`governance-guard.ts`)
- Stages: coherence_validation → ethical_constraint_check → governance_signal_emission
- CoherenceResult: issue types (contradiction, inconsistency, circular_reference, missing_context)
- EthicalResult: risk levels (none, low, medium, high, critical)
- GovernanceSignal: types (block, warn, audit, approve)

## 5. State & Telemetry

### 5.1 State Engine (`state-engine.ts`)
- Schema names: memory_state, learning_state, imagination_state, reasoning_state, governance_state, modernizer_state, inclusive_state, telemetry_state
- Field types: string, number, boolean, object, array
- Validation on every read/write
- Safe defaults for missing fields

### 5.2 Telemetry Engine (`telemetry-engine.ts`)
- Event types: engine_dispatch_start/end/error, governance_block/override, inclusive_scan/repair/validate, modernizer_scan/apply/verify/rollback, state_read/write/validation_warning, custom
- Severity: debug, info, warn, error, critical
- Queryable history with filtering

## 6. Orchestrator

Build `orchestrator-engine.ts`:
- Modes: sequential, parallel, adaptive
- Pipeline stages: ingest, learn, imagine, reason, govern, synthesize, output
- Preset pipelines for common workflows
- Cognitive cycle: full think → learn → imagine → reason → govern loop
- Depth levels: shallow, standard, deep

## 7. 24-Node Matrix

Implement each node with:
- Independent circuit breaker
- Health reporting (0-100)
- Weight assignment (see Trade Secrets doc §1.3)
- Boot dependency chain
- `pulse()` and `boot()` commands

**Weight table:**
```
CORE=0.200, SYSTEM=0.050, BRAIN=0.050, MEMORY=0.050, DREAM=0.050,
RIPPLE=0.040, ACCESS=0.040, IDENTITY=0.040, RELAY=0.040, AUDIT=0.040,
DECODE=0.028, ENCODE=0.028, VISION=0.028, CORTEX=0.028, NEXUS=0.028,
ECONOMY=0.027, SANDBOX=0.027, INCLUSIVE=0.028, INTEGRATION=0.028,
EVOLUTION=0.030, IMMUNITY=0.030, INTENT=0.030, GOVERNANCE=0.030, DEFENSE=0.030
```

**Integrity:** `I = Σ(hᵢ × wᵢ)` where Σwᵢ = 1.0

## 8. Circuit Breakers

Build `src/lib/substrate/circuit-breaker/index.ts`:

```
States: closed → open → half_open → closed
Defaults: failureThreshold=5, recoveryTimeout=30s, halfOpenMaxAttempts=3, windowSize=60s
Health impact: closed=raw, half_open=cap(50), open=0, rerouting=cap(85)
Auto-recovery: enabled, checks every 60s
```

## 9. Feature Flags

Build `src/lib/substrate/feature-flags.ts`:
- DJB2-based consistent hashing for percentage rollouts
- Local override support
- Listener subscriptions
- Bulk define API
- Default flags: warmup, dlq, canary, chaos, adaptive_polling, request_coalescing, cascade_detection, persistent_control_plane, cp_atomic_commit, cp_wal_enabled, cp_leader_lease

## 10. Memory Tiering

Auto-tiering algorithm:
```
hot → warm:   access_count < threshold AND age > 24h
warm → cold:  access_count == 0 AND age > 7d
cold → evict: age > 30d AND importance_score < 0.3
cold → warm:  any access triggers promotion
warm → hot:   3+ accesses in 24h
```

## 11. SEBA (Self-Evolution)

Build `src/lib/substrate/seba/`:
- `seba-agent.ts` — Main agent coordinator
- `cognitive-analyzer.ts` — 9 specialized analysis engines
- `proposal-generator.ts` — Structured improvement proposals
- `governance-gate.ts` — Safety controls and risk budgets
- `evolution-executor.ts` — Apply changes with rollback
- `types.ts` — All SEBA types
- `llm-analyzer.ts` — LLM-enhanced impact prediction
- `proposal-store.ts` — Persistence
- `receipt-store.ts` — Tamper-evident receipts
- `evolution-stamp.ts` — Cryptographic evolution stamps

Phases: idle → scanning → proposing → governing → executing → verifying

## 12. CLM (Constant Learning)

Build `src/lib/substrate/clm/`:
- `config.ts` — Budget, quiet hours, jittered delays
- `budget-governor.ts` — Daily token/call limits
- `topic-bank.ts` — Curriculum with spaced repetition (SM-2)
- `spaced-repetition.ts` — SM-2 algorithm implementation
- `orchestrator.ts` — Learning cycle coordination
- `tier-command.ts` — Tier-based learning commands
- `encoded-curriculum.ts` — Code-writing curriculum
- `encoded-learning-engine.ts` — 24/7 code improvement
- `module-hooks.ts` — Per-module learning hooks

## 13. Governance Framework

Build `src/lib/substrate/governance/`:
- Veto authority with escalation
- Epistemic discipline (claim tagging, provenance)
- Signal arbitration (multi-signal conflict resolution)
- Response policy enforcement
- Voice guardrails
- Transition validation (state machine for governance mode changes)
- Compliance auditing with trend tracking
- Drift detection and analysis

Scopes: `ALLOWED_SCOPES` array, `SCOPE_MATRIX` mapping modules to scopes.

## 14. Control Plane Persistence

Build `src/lib/control-plane/`:
- `persistence.ts` — 10 domain save functions, debounced, atomic commit via RPC
- `rehydrate.ts` — Boot-time state restoration from latest revision
- `persistence-scheduler.ts` — Leader-gated periodic snapshots (30s)
- `persistence-health.ts` — Durability health scoring
- `identity.ts` — Instance ID, env, tenant resolution
- `wal.ts` — Write-ahead log event buffer
- `hash.ts` — Canonical JSON + SHA-256
- `retry.ts` — Exponential backoff with jitter
- `restore.ts` — Point-in-time restore API

**Database tables (10 domain + 4 infrastructure):**
- substrate_flags, substrate_config, substrate_canaries, substrate_retry_buckets
- substrate_metrics_snapshot, substrate_cascade_history, substrate_idempotency
- substrate_schema_registry, substrate_queue_snapshot, substrate_chaos_rules
- substrate_cp_revisions, substrate_cp_snapshot_manifest, substrate_cp_wal, substrate_leases

## 15. Infrastructure Systems

Build these supporting systems:
- `backpressure.ts` — Queue/drop/throttle strategies
- `bloom-filter.ts` — O(1) event dedup
- `ring-buffer.ts` — Fixed-size telemetry buffer
- `priority-queue.ts` — Binary heap for task scheduling
- `state-machine.ts` — Formalized state transitions
- `semaphore.ts` — Concurrency control (AI: 3, DB: 10)
- `sla-monitor.ts` — P99 latency and availability tracking
- `merkle-audit-chain.ts` — Tamper-evident logging
- `saga-orchestrator.ts` — Multi-step transactions with compensation
- `cqrs-bus.ts` — Command/query separation
- `capability-router.ts` — Priority-based module routing
- `snapshot-diff.ts` — Delta scoring for evolution
- `cascade-detector.ts` — Failure propagation detection
- `tenant-isolator.ts` — Multi-tenant quota/rate limits
- `module-isolator.ts` — Sandboxed module execution

## 16. Capability Registry

Build `src/lib/substrate/capabilities/index.ts`:
- 269+ capabilities organized by module intersection
- 10 core synergies (original)
- 10 archived function integrations
- 56 high-value module capabilities
- 193 extended capabilities across engines

Each capability: `{ id, name, description, modules, layer, executor }`

## 17. SEO & Public Surface

Build `src/lib/seo/seoMap.ts`:
- Centralized SEO metadata registry (one entry per public route)
- Each entry: title (≤60 chars), description (140-160 chars), ogTitle, ogDescription, ogImage, keywords, schema type, intent, primaryKeyword
- No version numbers, no module counts, no metrics that change
- Unique primary keyword per page (no cannibalization)
- JSON-LD structured data by schema type

## 18. Boot Sequence

Build `src/lib/initializeSubstrate.ts`:

```
1. Triple-deferred scheduling (requestIdleCallback / load event)
2. Dynamic import substrate module
3. scheduler.yield() for main thread
4. Boot CORE (kernel)
5. Boot CCR (SYSTEM, BRAIN, MEMORY, DREAM)
6. Boot OCG (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT)
7. Boot 9 execution nodes (INTEGRATION last)
8. Activate mesh overlays (GOVERNANCE → INTENT → EVOLUTION → IMMUNITY → DEFENSE)
9. Initialize subsystem health registry
10. Initialize GOAL (Global Observability Access Layer)
11. Start auto circuit recovery
12. Rehydrate persistent control plane
13. Start leader-gated persistence scheduler
14. Register shutdown hooks
15. Set initialized = true
```

## 19. Database Schema

Essential tables (beyond control plane):
- `access_api_keys`, `access_developers`, `access_products`, `access_subscriptions`, `access_usage`, `access_quotas`
- `agencies`, `agency_members`, `agency_tasks`, `agency_task_logs`, `agency_dream_memory`, `agency_dream_pool`
- `audit_logs`, `analytics_events`, `analytics_snapshots`
- `ai_daily_quota`, `ai_usage_log`, `ai_learning_data`
- `auto_blog_posts`, `auto_blog_schedule`, `autoblog_queue`, `autoblog_drafts`
- `accessibility_scans`, `agent_competency`
- `atlas_capabilities`
- `brain_events` (and neural tables)
- `cognitive_registry`, `cognitive_orders`
- `evolution_runs`

All tables with user data must have RLS policies. Neural tables: authenticated reads, service_role writes.

## 20. Verification Checklist

```
□ 24 nodes boot successfully
□ Matrix integrity = 100% with all nodes healthy
□ Σ(weight) = 1.000
□ Circuit breakers operate independently
□ Engine Bus dispatches route correctly
□ Memory tiering promotes/demotes correctly
□ SEBA proposes and governance gates evaluate
□ CLM learning cycles execute within budget
□ Control plane persists and rehydrates across restarts
□ Leader election prevents dual writers
□ WAL events append and replay correctly
□ Cascade detector fires at 3+ module failures
□ Feature flags roll out by percentage correctly
□ SEO metadata resolves for all public routes
□ Health scorecard computes weighted average correctly
□ Governance veto blocks prohibited actions
□ Merkle audit chain verifies without tampering
```

---

© 2025–2026 PromptFluid®. All rights reserved. CONFIDENTIAL.
