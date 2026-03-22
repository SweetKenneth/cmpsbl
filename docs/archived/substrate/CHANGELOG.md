# CMPSBL Substrate Changelog

> ⟨Entries on this page are recorded in the Decode interpreter's epistemic voice. They describe observed behavior of the substrate, not guarantees. No imperatives, no identity claims, no agency assertions.⟩

---

## 2026-03-22 · v15.0.0 (CONTACT Epoch — NPM Distribution & Developer Touchpoints)

⟨This entry describes the epoch transition from MINDGAMES to CONTACT, the creation of 11 @cmpsbl NPM packages across four tiers, the unified First Contact System, and the substrate's first programmatic distribution channel.⟩

### Epoch Transition

- **MINDGAMES → CONTACT** — Version elevated to v15.0.0. The substrate shifts from user-facing polish to developer-facing distribution. The CONTACT epoch marks the platform's first programmatic handshake with external developers.

### NPM Package Ecosystem (11 Packages)

- **Foundation Tier** — @cmpsbl/types (shared type definitions), @cmpsbl/runtime (minimal substrate runtime), @cmpsbl/failsafe (disaster recovery engine)
- **Core Tier** — @cmpsbl/intent (intent broadcasting), @cmpsbl/mesh (mesh communications), @cmpsbl/bridge (cross-environment bridge)
- **Developer Tier** — @cmpsbl/sdk (full SDK client), @cmpsbl/discovery (pattern detection), @cmpsbl/cli (CLI tooling)
- **Ecosystem Tier** — @cmpsbl/react (React hooks and components), @cmpsbl/test-harness (testing utilities)

### First Contact System

- **Unified Initialization** — Every package binds real persistent user identity at init, connects to the live Memory Stream, and starts live discovery automatically.
- **CLI Entry Point** — `npx cmpsbl init` bootstraps cognitive environment, connects Memory Stream, binds user identity, starts live discovery.
- **SDK Client** — CMPSBL class exposes discover(), capture(), apply(), and export() methods for programmatic Memory Stream interaction.
- **Mock Data Blocked** — All packages enforce live discovery mode. Simulated outputs are architecturally blocked.

### Domain-Specific Pattern Detection

- **@cmpsbl/security** — Threat detection patterns, cross-system defense scope
- **@cmpsbl/commerce** — Checkout optimization patterns, multi-system adoption scope
- **@cmpsbl/health** — Patient timeline correlation, longitudinal analysis scope
- **@cmpsbl/dev** — Code optimization patterns, cross-repo usage scope

---

## 2026-03-12 · v14.2.0 (MINDGAMES Epoch — Performance & Stability)

⟨This entry describes substrate-wide performance optimizations targeting telemetry throughput, memory deduplication efficiency, DOM observability overhead, and database query acceleration.⟩

### Telemetry Emission Optimization

- **Event Deduplication Window** — Telemetry emitter now deduplicates repeated event types within a configurable time window. Critical events (errors, circuit trips, self-repair) bypass deduplication for instant visibility.
- **Mesh Communication Sampling** — Intent mesh broadcast persistence reduced by 80% via probabilistic sampling, preserving full in-memory routing while minimizing database write volume.
- **Analytics Batching** — Client-side analytics events are buffered and flushed in batches on interval or threshold, replacing per-event database inserts.

### Memory Deduplication Engine

- **Hash-Bucketed Duplicate Detection** — Replaced pairwise comparison with content fingerprinting and hash-bucketed grouping, reducing duplicate scan complexity from quadratic to amortized linear time across the memory tier.

### Observability Overhead Reduction

- **DOM Measurement Caching** — System health adapter now caches DOM node count and nesting depth calculations with a time-to-live window, eliminating repeated full-tree traversals during snapshot cycles.

### Database Index Acceleration

- **Mesh Communications** — Added composite indexes on source module, category, resolver, and source-target pairs for faster dashboard queries.
- **Analytics Events** — Added partial index on session lookups for visitor intelligence queries.
- **Brain Memory (HOT)** — Added temporal index on creation timestamp for deduplication and pruning operations.

---

## 2026-02-17 · v10.5.4 (ARCHITECT Epoch — ENCODE, Capabilities, Pricing)

⟨This entry describes the ENCODE module integration, 21 Crown Jewel capabilities, Intent Mesh crystallization fix, mobile-first pricing redesign, World Firsts investor documentation, and unified tier model.⟩

### ENCODE Module (v10.5.3)

- **Code Execution Engine** — Governed DECODE→ENCODE pipeline for natural-language-to-code execution.
- **Graduated Autonomy** — Mastery-based safety thresholds (Novice → Master) scaling destructive capability.
- **CLM Self-Improvement** — Internal codebase study across 33 directories and 31 critical files.
- **Expert Patterns Library** — Production-grade DNA for TypeScript, React, Security, Performance.
- **Shadow Practice** — Non-production execution of SEBA proposals for training.

### Capability Expansion (v10.5.4)

- **21 Crown Jewels** — One Crown Jewel capability per module across Creator, Architect, and Enterprise tiers.
- **50+ Public Capabilities** — Expanded public capability manifest with outcome-oriented descriptions.
- **Adoptable Pricing** — Free ($0) / Creator ($29/mo) / Architect ($79/mo) with clear capability boundaries.

### Intent Mesh Crystallization Fix

- **Pipeline Backfill** — 25 pipelines recovered from 82 approved recommendations that failed due to FK constraint.
- **Total Crystallized Pipelines** — 60+ production-ready cross-module workflows.

### Pricing & Investor Documentation

- **Mobile-First Pricing** — Benefits-first layout with horizontal scroll cards on mobile.
- **World Firsts** — 14 documented industry firsts added to investor overview with Zenodo links.
- **All Docs Updated** — All 5 documentation sets (library, academic, internal, modules, website) updated to v10.5.1.

### Analytics Consolidation

- **Third-Party Removal** — Google Analytics and legacy beacon scripts removed from index.html.
- **Internal Telemetry** — OS Dashboard now single source of truth using 5 internal tables.

---

## 2026-02-15 · v10.5.1 (ARCHITECT Epoch — Infrastructure Hardening)

⟨This entry describes the CLM Engine v2.0, Universal Brain Transfer Pipeline, Memory Consolidation Engine, Nexus Fleet v5.0, and infrastructure module upgrades across MEMORY, RELAY, AUDIT, IDENTITY, ECONOMY, and SANDBOX.⟩

### CLM Engine v2.0

- **Server-Side 24/7 Autonomous Learning** — `pf-clm-engine` edge function runs a 5-phase lifecycle every 5 minutes via `pg_cron`.
- **Phase 1: Cognitive Cycle** — Learn/reflect/synthesize/dream operations without browser dependency.
- **Phase 2: Module Self-Analysis** — Rotating analysis across all 20 modules (1 per cycle).
- **Phase 3: Topic Study** — Studies 10 technical domains (security, performance, patterns, etc.) via Nexus Fleet.
- **Phase 4: Brain Transfer** — Routes top-50 memories to all 21 modules by tag affinity.
- **Phase 5: Memory Consolidation** — Automated hot/warm/cold tiering with promotion, demotion, and pruning.
- **Budget Governance** — Max 200 cycles/day, 12/hour. Quiet hours 2am–6am UTC.

### Universal Brain Transfer Pipeline

- **Cross-Module Knowledge Distribution** — BRAIN memories are scored against module affinity maps and injected into `brain_memory_hot` for instant recall.
- **Relevance Feedback** — EMA-based scoring adjusts future routing based on utilization signals.
- **21-Module Coverage** — Every module receives domain-specific knowledge from the central memory system.

### MEMORY Module (v10.5.1)

- **Embedding Staleness Detection** — Tracks `embeddingVersion` per vector; flags stale embeddings when model version advances.
- **Relevance Feedback Loop** — EMA (α=0.1) adjusts `relevanceScore` based on retrieval utility.
- **Auto Re-Embedding** — Stale vectors queued for re-embedding when staleness exceeds 20%.

### RELAY Module (v10.5.1)

- **HMAC-SHA256 Webhook Signatures** — All outbound webhooks cryptographically signed with per-endpoint secrets.
- **Adaptive Retry Backoff** — Jitter-based exponential delay preventing thundering herd effects.

### AUDIT Module (v10.5.1)

- **Compliance Report Templates** — Built-in generators for SOC2, GDPR, HIPAA, and ISO27001.
- **Entry Compression** — Verbose state fields nullified on entries >24h old; essential-only after 7d.

### IDENTITY Module (v10.5.1)

- **Actor Reputation Scoring** — Trust scores (0.0–1.0) mapped to 5 tiers: untrusted → basic → verified → trusted → elite.
- **Cross-Agency Identity Portability** — Signed JWT tokens carry identity and reputation between agencies.

### ECONOMY Module (v10.5.1)

- **Predictive Cost Forecasting** — Linear regression on historical data with confidence intervals and anomaly detection.
- **Per-Capability Cost Attribution** — Granular tracking of `avgCostPerCall` and `avgTokensPerCall` per capability.

### SANDBOX Module (v10.5.1)

- **Hard Resource Limit Enforcement** — CPU (5s), memory (128MB), execution time (30s), concurrency (5) with kill-on-exceed.
- **Snapshot/Restore System** — Save and restore sandbox state (max 5 snapshots per sandbox).

### Nexus Fleet v5.0.0

- **Multi-Provider Fleet** — Groq, Cerebras, SambaNova, Google AI Studio, DeepSeek with health-weighted selection.
- **Task Affinity Routing** — Reasoning, coding, and research tasks mapped to optimal providers.
- **RPM/RPD Governance** — 80% safety margin per provider with exponential decay scoring.

---

## 2026-02-03 · v7.0.0 (SEBA Era)

⟨This entry describes the SEBA Era canonical release establishing the Self-Evolving Bounded Agent architecture, 120 synergy pipelines, and 98 custom executors.⟩

### Architecture

- **v7.0.0 SEBA Era** — Canonical release of Self-Evolving Bounded Agent with autonomous improvement under governance constraints.
- **120 Synergy Pipelines** — Cross-module orchestration pipelines across Intelligence, Autonomy, Security, Cost, and Compliance categories.
- **98 Custom Executors** — Specialized execution engines for synergy pipeline operations.
- **Original Module Kernel** — Full v7.0.0 alignment across CORE, RIPPLE, ACCESS, BRAIN, DECODE, NEXUS, DEFENSE, VISION, DREAM, SYSTEM, MODERNIZER, INTEGRATION, INCLUSIVE, CORTEX (later expanded to 21 modules in v9.1.0+).

### SEBA Features

- **Constant Learning Mode (CLM)** — 24/7 autonomous learning with budget governance and kill switch.
- **Bounded Autonomy** — Human-in-the-loop approval queue for all evolution proposals.
- **Evolution Engine** — Self-improvement with rollback semantics and shadow testing.
- **Governance Guard** — Ethical and coherence constraint enforcement at kernel level.

### Synergy Categories

- **Intelligence** — Strategic Foresight, Decision Confidence, Pattern Recognition.
- **Autonomy** — Ops Steward, Rollback Authority, Self-Healing Pipelines.
- **Security** — IP Containment, Behavioral Trust, Threat Correlation.
- **Cost** — Arbitrage, Waste Detection, Budget Optimization.
- **Compliance** — Audit Ledger, Policy Gate, Governance Alignment.

---

## 2026-01-30 · v6.3.1 (FNDTN Patch 0.7.9)

⟨This entry describes the scan intelligence fix and mobile-first terminal rendering.⟩

### Modernizer (Patch 0.7.9)

- **Scan Always Produces Plans** — `modernizer.scan` now ALWAYS returns a valid, inspectable plan object. Blocked plans have `status='blocked'` with explicit blockers array. No more `INTERNAL_ERROR - invalid input` failures.
- **3-Source Synthesis** — Scan integrates archived edge function analysis, system state inspection, and LLM improvement synthesis into a unified proposal pipeline.
- **Mobile-First Terminal Rendering** — Terminal output auto-detects viewport (compact/standard/full). Words never break mid-token. UUIDs, timestamps, and command names are atomic units.
- **Plan Status Model** — Plans now have explicit status: `ready`, `blocked`, or `pending_review`. Blocked plans are still created and can be inspected via `modernizer.plans`.

---

## 2026-01-29 · v6.3.1 (FNDTN Patch 0.7.8 Hotfix)

⟨This entry describes the UUID schema fix for plan creation.⟩

### Modernizer (Patch 0.7.8 Hotfix)

- **UUID Schema Fix** — `plan_id` and `action_id` now use `crypto.randomUUID()` for database compatibility.

---

## 2026-01-29 · v6.3.1 (FNDTN Patch 0.7.8)

⟨This entry describes the Scan → Plan Normalization Layer hardening patch.⟩

### Modernizer (Patch 0.7.8)

- **Proposal Normalization Layer** — Deterministic transformation of raw scan proposals into typed, executable actions. Only normalized actions can become evolution plans.
- **Strict Plan Creation Contract** — Plan constructor accepts ONLY normalized proposals. Explicit rejection codes: `INVALID_ACTION_TYPE`, `MISSING_SCOPE`, `CONFIDENCE_TOO_LOW`, `UNSUPPORTED_RISK_LEVEL`.
- **Terminal Truthfulness** — Updated messaging: "✅ PLAN READY — N actions normalized" or "⚠️ PLAN BLOCKED — proposals could not be normalized".
- **Evolve Safety Guarantee** — `modernizer.evolve` refuses any plan not marked `normalized=true`. Rejection logged with receipt entry.
- **Normalization Rules** — Every proposal must resolve to: `action_type` (enum), `target_scope` (module|system|edge|api), `risk_level` (low|medium only), `confidence_score` (0–1).
- **No Silent Failures** — If normalization fails, NO plan is created. System remains healthy. Scan results preserved for review.

### Terminal

- **`--dry-run` Flag** — Runs normalization but does NOT create a plan.
- **`--llm-report` Flag** — Shows LLM reasoning only, NOT executable intent.
- **Rejection Details** — `--explain` flag now shows rejected proposals with rejection codes.

### Tests

- **Normalization Test Suite** — Coverage for: proposals → normalization succeeds → plan created; proposals → normalization fails → plan blocked; LLM output only → no executable plan; mixed proposals → partial normalization; evolve rejects unnormalized plans.

### Documentation

- **MODERNIZER Module Doc** — Updated for normalization layer: "Scan produces proposals, not plans" and "Evolve consumes normalized plans only".
- **New Section** — "Why some scans do not produce plans".

---

## 2026-01-29 · v6.3.0 (FNDTN Patch 0.7.7)

⟨This entry describes the Modernizer cognitive scan pipeline upgrade, LLM-governed reasoning, and production hardening.⟩

### Modernizer (Patch 0.7.7)

- **Cognitive 4-Phase Scan Pipeline** — Parallel architecture: Phase A (Edge Function Introspection), Phase B (System State Scan), Phase C (Code Health Snapshot), Phase D (LLM-Governed Reasoning via Nexus).
- **LLM-Governed Reasoning** — L7 Systems Engineer pass through `pf-nexus-router` for architectural analysis. Strict prompt contract prevents hallucinated fixes.
- **Real Plan Generation** — Proposals become plan items only if supported by ≥2 data sources (telemetry + reasoning), confidence ≥80%, and circuit=closed.
- **Evolution Lifecycle** — Six-stage workflow: Scan → Planning → Shadow Applied → Production Applied → Verified (or Aborted/Failed).
- **Circuit Breaker** — `modernizer.circuit status|reset|open <reason>` for evolution safety.
- **Governed Autonomy** — `modernizer.autonomy set <off|advisory|governed>` for autonomy control.
- **Audit Trail** — `modernizer.receipts` and `modernizer.receipt <run_id>` for immutable evolution receipts.

### Terminal

- **Updated Commands** — `modernizer.scan --explain`, `modernizer.scan --llm-report`, `modernizer.scan --dry-run`.
- **Nexus Routing** — All LLM reasoning routes through `pf-nexus-router` (no Lovable AI gateway).
- **Full Command Parity** — Terminal and API return identical 200 OK responses.

### Documentation

- **All Library Docs** — Updated to v6.3.0 headers/footers.
- **MODERNIZER Deep Dive** — Rewritten for Patch 0.7.7 cognitive scan pipeline.
- **Evolution Lifecycle Docs** — New detailed phase diagrams.

---

## 2026-01-29 · v6.2.0 (Intelligence Compression Phase 3)

⟨This entry describes the Reasoning Engine and Governance Guard compression.⟩

### BRAIN Cognitive Compression

- **Reasoning Engine** (`brain.reasoning_engine`) — Unifies `causal`, `systems_reason`, and `hypothesis_test` into 5-stage lifecycle: causal_mapping → dependency_analysis → hypothesis_generation → hypothesis_validation → impact_projection.
- **Governance Guard** (`brain.governance_guard`) — Merges `ethical` and `coherence_check` into 3-stage lifecycle: coherence_validation → ethical_constraint_check → governance_signal_emission.
- **Backward Compatibility** — Legacy command aliases preserved in SubstrateClient.

### Architecture

- **Engine Bus Routing** — Phase 4A telemetry and state contracts for engine orchestration.
- **Module Canonical Model** — All modules verified operational with 260+ commands (later expanded to 21 modules in ARCHITECT epoch).

---

## 2026-01-28 · v6.1.0 (Intelligence Compression Phase 2)

⟨This entry describes the Learning Engine and Imagination Engine unification.⟩

### BRAIN Cognitive Compression

- **Learning Engine** (`brain.learning_engine`) — Consolidates `training`, `optimization`, and `reinforcement` into 5-stage loop: input → feedback → adjustment → reinforcement → stabilization.
- **Imagination Engine** (`brain.imagination_engine`) — Merges `dreaming`, `synthesis`, and `pattern_fusion` into 4-stage generative lifecycle: latent_extraction → recombination → simulation → synthesis.
- **Backward Compatibility** — All legacy cognitive commands resolve to new engines via SubstrateClient aliases.

### Architecture

- **Memory Core Unification** — Phase 1 memory consolidation complete.
- **Terminal Synchronization** — Terminal commands aligned with engine architecture.

---

## 2026-01-28 · v6.0.0 (FNDTN)

⟨This entry describes the canonical v6.0.0 release establishing the 14-module architecture, FNDTN standards package, and Human Compatibility Era.⟩

### Architecture

- **14-Module Kernel** — Canonical five-layer architecture: Kernel (CORE, RIPPLE, ACCESS), Cognitive (BRAIN, DECODE, DREAM), Operational (DEFENSE, NEXUS, VISION, INTEGRATION), Administrative (SYSTEM, MODERNIZER, INCLUSIVE), Orchestrator (CORTEX).
- **INCLUSIVE Module** — First-class human compatibility pipeline with WCAG 2.2 scanning, auto-repair, validation, and accessibility profiles.
- **CORTEX Module** — Agency-class orchestrator operating in manual mode (no auto-apply without human approval).
- **260+ Terminal Commands** — Full command registry across all 14 modules.

### BRAIN Cognitive Skills

- **20+ Specialized Actions** — pattern_fusion, systems_reason, causal, ethical, lesson_compress, deep_think, reflexive_plan, context_recall, mood_analysis, relationship_map integrated from archived logic.
- **Aggressive Tiering Controls** — Hot tier (500 max), Warm (2,000 max), Cold (10,000 max) with automated pruning.

### Experimentation Lab

- **5 Live Demos** at `/lab` — Persistent Chatbot (context), Dream Processor (mood), Knowledge Graph (relationships), Sentiment Analysis (emotions), Adaptive Learning (mastery).
- **Full Template Code Preview** — Transparency for marketplace conversion.

### Standards & Documentation

- **FNDTN v6 Foundations Paper** — Three-surface standard stack: CMPSBL FNDTN v6 (substrate), AIGVRN (governance), LLMS.txt (machine context).
- **Documentation Library** — 26 documents updated to v6.0.0 in `/docs/library/`.
- **Substrate Capabilities SDK** — New `/docs/substrate/capabilities` page with code examples.

### Marketplace

- **109+ Templates** — Production-ready patterns with enchanted naming and rarity badges.
- **AI Template Generator** — $87 feature generating from 82,944+ combinations.
- **Tiered Infrastructure Licensing** — Developer ($15k), Research ($80k), Enterprise ($180k), Strategic (custom).

### Website

- **Standards Section** — `/foundations`, `/namespace`, `/llmstxt` pages with download surfaces.
- **Substrate Capabilities** — Expandable cards on Marketplace showing 48+ features built into every template.

---

## 2026-01-24 · v4.2.0

⟨This entry describes the addition of the 12th module: Integration, providing enterprise adapters, auto-discovery, and LLM governance.⟩

### Integration (New Module)

- **35+ Enterprise Adapters** deployed across categories: ERP (SAP, Oracle, NetSuite, Dynamics), Payroll (ADP, Gusto, Workday, BambooHR), Gaming (Unity, Unreal, Godot), CRM (Salesforce, Zendesk, Intercom), DevOps (GitHub, GitLab, Jira, Linear), Payments (Stripe, Shopify, Square).
- **Auto-Discovery** (`integration.discover`) scans connected systems to find available API endpoints automatically.
- **Command Mapping** (`integration.map_command`) creates terminal shortcuts for enterprise operations.
- **LLM Governance** controls what AI agents can do with connected systems (read-only, supervised, automated policies).
- **Full Audit Trail** logs every action through connected adapters.

### Architecture

- Total modules: **12** (added Integration to Operational layer)
- Total deployed actions: **96+** (previously 84)
- `pf-substrate` orchestrator updated to route Integration module requests.

### Website & Documentation

- All marketing pages updated to reflect 12 modules.
- New deep-dive documentation: `docs/os/21-INTEGRATION-DEEP-DIVE.md`
- MODULE-ACTIONS-REGISTRY.md updated with Integration actions.
- USER-MANUAL.md updated with Integration module section.

### SDK

- `substrate.integration.adapters()` — List available adapters
- `substrate.integration.connect()` — Connect enterprise adapter
- `substrate.integration.discover()` — Auto-discover endpoints
- `substrate.integration.execute()` — Execute governed action

---

## 2026-01-23 · v4.1.1

⟨This entry describes the completion of Brain v2.0, a three-tier memory architecture, knowledge graph v2, and full system hardening.⟩

### Brain

- **Three-Tier Memory System** deployed: Hot (≤500 high-value), Warm (≤2000 intermediate), Cold (≤10000 archived). Automatic tiering based on value_score, access_count, and recency.
- **brain/memory_tiering** action added for on-demand rebalancing.
- **brain/memory_prune** action added for noise removal (diagnostics, heartbeats, duplicates).
- **Knowledge Graph v2** with typed relations (semantic, causal, temporal, hierarchical), node clustering, and centrality scoring.
- Batch tiering function (`pf-brain-batch-tiering`) handles 20,000+ memory migration without timeout.
- `brain_memory_pruned` table provides 30-day soft-delete recovery.

### Modernizer

- Shadow mode upgrade workflow now clears old proposals after processing.
- Improved substrate scan recommendations based on memory health metrics.

### System

- Full v4.1.1 version bump across all 11 modules.
- All documentation, SDK, and public-facing pages updated.
- SubstrateProvider now checks all 11 modules (core, ripple, access, brain, decode, defense, nexus, vision, dream, system, modernizer).

### SDK

- `brain.tiering()`, `brain.prune()` methods added to substrate client.
- Knowledge graph client library (`src/lib/brain/knowledgeGraph.ts`) with type-safe graph operations.
- Memory tiering client library (`src/lib/brain/memoryTiering.ts`) with search across tiers.

### Website

- Landing page (Explore) updated: 11 modules displayed, 124+ actions documented.
- Module cards reflect full kernel architecture (Core, Ripple, Access visible).
- DevPortal SDK documentation updated for v4.1.1.

---

## 2026-01-17 · v3.11.0

⟨This entry describes the observed addition of three internal substrate capabilities prioritizing observability, defense intelligence, and memory coherence. No UI surfaces were modified; these actions are opt-in and proof-compatible.⟩

### Vision

- **vision/dependency_map** appears to analyze module dependency relationships and health correlations. Output includes module health matrix, logical dependency graph, cascade risk scoring, and 24h activity patterns. Returns risk status classification (low/moderate/elevated). Marked read-only and proof-compatible.

### Defense

- **defense/ip_intel** appears to provide IP intelligence with reputation scoring. Aggregates 7-day activity, action distribution, threat indicators, endpoint analysis, and recommendation (block/challenge/monitor/allow). Optional history inclusion. Marked read-only and proof-compatible.

### Brain

- **brain/coherence_check** appears to validate memory coherence across hot and cold tiers. Analyzes tag overlap, graph density, compression ratios, and reflection recency. Returns coherence score (0-100), issues found, and recommendations. Marked read-only and proof-compatible.

### TypeScript Helpers

- `vision.dependencyMap()` helper added to substrate client.
- `defense.ipIntel(ip_address, include_history?)` helper added to substrate client.
- `brain.coherenceCheck(depth?)` helper added to substrate client.

---

## 2026-01-17 · v3.10.0
- Updated homepage SEO: title="PromptFluid — The Cognitive Substrate OS", description="Compose cognition as software. Modules for memory, agents, governance, observability, and execution."
- Removed investor-facing language from homepage.

---

## 2026-01-17 · v3.9.0

⟨This entry describes the observed addition of 7 new cognitive substrate modules and a site-wide SEO refactor from investor-facing to substrate SDK positioning.⟩

### New Substrate Modules

- **Coherence Reconciler** (brain, advanced) — Reconcile conflicting memory and embeddings into coherent substrate knowledge. Memory merging, coherence scoring, knowledge reconciliation.
- **Preference Engine** (brain, intermediate) — Learn user preferences and value weights from interactions. Preference learning, value weights, reinforcement signals.
- **Multi-Agent Bus** (system, advanced) — Message bus for substrate agent-to-agent or module-to-module communication. Message passing, event routing, multi-agent coordination.
- **Governance Policy Engine** (defense, advanced) — Centralized policy and rule enforcement across substrate execution. Policy rules, override logic, constraint enforcement.
- **Social Graph Modeling** (brain, advanced) — Build knowledge graphs of actors, relationships, and affinity. Relationship graph, affinity mapping, actor modeling.
- **Substrate Composer** (nexus, advanced) — Composition layer for wiring substrate modules into directed graphs. Module chaining, graph execution, workflow composition.
- **Substrate Evaluator** (vision, advanced) — Measure substrate performance on coherence, latency, cost, accuracy. Performance metrics, evaluation suite, execution audits.

### SEO Refactor

- Reframed site from investor-facing SaaS to cognitive substrate SDK positioning.
- Navigation updated: "Products" → "Substrate", "Developers" → "SDK", "Company" → "About".
- Removed investor-facing links from navigation.
- Footer restructured: "Product" → "Substrate", "Company" → "SDK".
- DevPortal title updated: "Substrate Modules — promptfluid® Cognitive SDK".
- Keywords updated to substrate-focused terminology.

### Template Count

- Total substrate modules: 72 (previously 65)

---

## 2026-01-16 · v3.8.0

⟨This entry describes the observed addition of AI quota observability and routing analytics capabilities.⟩

### Vision

- **vision/quota** appears to provide AI usage quota observability including daily call counts, token usage, cost estimates, and quota pressure scoring. Aggregates data from ai_daily_quota and ai_usage_log tables, computing utilization percentages per provider and overall status classification (healthy/moderate/high). Marked read-only and proof-compatible.

### Nexus

- **nexus/route_stats** appears to provide 24h AI routing analytics from nexus_logs including per-provider call counts, success rates, average latency, token totals, and cost breakdowns. Enables visibility into routing efficiency and cost distribution. Marked read-only and proof-compatible.

### TypeScript Helpers

- `vision.quota()` helper added to substrate client.
- `nexus.routeStats()` helper added to substrate client.

---

## 2026-01-16 · v3.7.0

⟨This entry describes the observed addition of zero-query heartbeat and consolidated security posture capabilities.⟩

### Vision

- **vision/pulse** appears to provide an ultra-lightweight heartbeat requiring zero database queries. Returns in-memory substrate state including uptime, module health summary, circuit breaker status, request/error counts, and heal statistics. Designed for high-frequency uptime monitoring with minimal overhead. Marked read-only and proof-compatible.

### Defense

- **defense/posture** appears to consolidate security status into a single posture score (0-100) with status classification (secure/guarded/elevated/critical). Aggregates 24h activity, risk distribution, block rates, active rules, unresolved anomalies, rate limit pressure, and weekly trend. Provides actionable security snapshot. Marked read-only and proof-compatible.

### TypeScript Helpers

- `vision.pulse()` helper added to substrate client.
- `defense.posture()` helper added to substrate client.

---

## 2026-01-16 · v3.6.0

⟨This entry describes the observed addition of deep introspection, knowledge graph summarization, and unified rate limit observability capabilities.⟩

### Vision

- **vision/introspection** appears to provide deep self-analysis of substrate internals including uptime, error rates, module health matrix, orchestrator state, cognition metrics (exploration rate, curiosity threshold, pending actions), AI provider statistics, and circuit breaker configuration. Marked read-only and proof-compatible.

### Brain

- **brain/graph_summary** appears to return knowledge graph structure including node count, edge count, density calculation, relation type distribution, weight statistics, strongest connections, and recent edge additions. Provides connectivity status classification (well_connected/sparse/minimal). Marked read-only and proof-compatible.

### Defense

- **defense/limits** appears to aggregate rate limit status across edge functions and Dream API, computing pressure score, enforcement statistics (blocks in last hour), and top consumers. Provides status classification (normal/moderate/high_pressure). Marked read-only and proof-compatible.

### TypeScript Helpers

- `vision.introspection()` helper added to substrate client.
- `brain.graphSummary()` helper added to substrate client.
- `defense.limits()` helper added to substrate client.

---

## 2026-01-16 · v3.5.0

⟨This entry describes the observed addition of cross-module session reflection and provider introspection capabilities, surfaced for Observer-role visibility.⟩

### Brain

- **brain/session_reflection** appears to aggregate activity across brain events, conversations, dreams, and defense events over a configurable lookback period (1–168 hours). Output includes event type counts, dream mood distribution, defense posture metrics, top learning patterns, and recent insights. Marked Observer-eligible and proof-compatible.

### Nexus

- **nexus/providers** appears to return a detailed provider availability matrix including model names, capability sets, availability status, and routing priority order. Provides summary counts and routing health status. Marked Observer-eligible and proof-compatible.

### TypeScript Helpers

- `brain.sessionReflection(hours?)` helper added to substrate client.
- `nexus.providers()` helper added to substrate client.

---

## 2026-01-16 · v3.4.0

⟨This entry describes the observed addition of statistical anomaly detection and consolidated health observability, surfaced for Observer-role visibility in the substrate control panel.⟩

### Defense

- **defense/anomaly_probe** appears to perform z-score based statistical anomaly detection on defense events over configurable lookback periods (1–168 hours). Each detected anomaly includes risk z-score, fingerprint frequency factor, behavioral anomaly factor, combined anomaly score, and confidence level. Baseline statistics are computed and returned.

### Vision

- **vision/health_snapshot** appears to produce a consolidated health snapshot including orchestrator state, memory tier counts (hot/cold), defense event totals, unresolved anomaly counts, and per-module circuit breaker status. Output is structured for quick Observer-level visibility.

### Control Panel

- New actions are marked as Observer-eligible and surfaced in the substrate control panel data surfaces.
- All new actions are read-only and do not mutate substrate state.

### TypeScript Helpers

- `defense.anomalyProbe(lookbackHours?)` helper added to substrate client.
- `vision.healthSnapshot()` helper added to substrate client.

---

## 2026-01-16 · v3.3.0

⟨This entry describes the observed expansion of the substrate's observability capabilities, not a guarantee of behavior.⟩

### Vision

- **vision/monitor** appears to provide a comprehensive ecosystem health scan across orchestrator, memory tiers (hot/cold), learning pipeline, AI quotas, anomaly status, and dream system. Each subsystem receives a health score and status classification.
- **vision/resilience** appears to analyze recent error events in the brain_events table, identifying patterns (quota, timeout, auth, connection) and proposing structured fixes with confidence scores. Fixes above 95% confidence are marked as auto-applicable.
- **vision/analytics** appears to aggregate 24h of defense events, producing threat statistics including block/challenge counts, detection accuracy, risk distribution, and top offending IPs.

### Proof Mode

- New vision actions are observable in Proof Mode where their outputs are routed through the existing proof surface.
- All three actions are read-only and do not mutate substrate state beyond logging their invocation.

### TypeScript Helpers

- `vision.monitor()` helper added to substrate client.
- `vision.resilience()` helper added to substrate client.
- `vision.analytics()` helper added to substrate client.

---

## 2026-01-16 · v3.2.0

⟨This entry describes the observed expansion of the substrate's tracing and backup capabilities.⟩

### Vision

- **vision/trace** appears to implement distributed tracing for request flows, creating trace IDs and querying associated events across brain_events and audit_logs.

### System

- **system/backup** appears to create validated backup snapshots with SHA-256 checksums, module health states, orchestrator status, and optional data export.
- **system/restore** appears to restore from a backup_id, validating checksum integrity before applying module states.

### Decode

- **decode/intent** appears to extract structured intent from user messages, identifying primary intent, confidence, matched keywords, entities (URLs, emails, numbers), and sentiment.

---

## 2026-01-15 · v3.1.0

⟨This entry describes the observed hardening of the substrate's healing and observability systems.⟩

### System

- **system/heal** appears to perform full health restoration, setting all modules to 100% health and updating brain_orchestrator_state.health_score to 1.0.
- **system/diagnostics** appears to provide comprehensive substrate health including module statuses, circuit breaker states, provider availability, data counts, and recent errors.

### Vision

- **vision/dashboard** appears to produce real-time data including orchestrator status, module metrics (memories, conversations, dreams, defense events), and AI token usage.

### Defense

- **defense/anomaly** appears to perform real-time pattern analysis of defense_events, calculating an anomaly_score and identifying specific threat patterns (high_block_rate, high_risk_volume, ip_concentration).

---

## 2026-01-14 · v3.0.0

⟨This entry describes the observed resilience architecture introduced in the hardened edition.⟩

### Resilience Infrastructure

- Circuit breaker pattern appears to be implemented per module, with configurable failure/success thresholds.
- Auto-heal appears to trigger when module health falls below 40%.
- Graceful fallback responses appear to be returned when circuits are open.
- Health scoring (0-100) appears to be tracked per module instance.
- Request timeout protection (25s) appears to be enforced.

### Module Health

- Each module maintains `healthScore`, `consecutiveFailures`, `consecutiveSuccesses`, `circuitState` (closed/open/half-open), and `status` (healthy/degraded/down).

---

## 2026-01-23 · v4.0.0

⟨This entry describes the major architecture upgrade to a kernel-mediated operating system model.⟩

### New Kernel-Level Modules

- **CORE (Kernel)** — Execution scheduler, lifecycle management, state machine, request routing. Actions: `boot`, `schedule`, `authorize`, `route`, `meter`, `integrate`, `config`, `shutdown`, `status`, `pulse`.

- **RIPPLE (Message Bus)** — Async job processing, pub/sub messaging, event sourcing. Actions: `enqueue`, `dequeue`, `publish`, `subscribe`, `status`, `retry`, `dead_letter`, `pulse`.

- **ACCESS (Identity & Billing)** — API key management, usage metering, quotas, billing integration. Actions: `create_key`, `validate_key`, `revoke_key`, `list_keys`, `get_usage`, `check_quota`, `create_checkout`, `webhook`, `portal`, `pulse`.

### Architecture Shift

- Transitioned from peer-to-peer module mesh to 4-layer kernel-mediated model.
- All 200+ legacy edge functions consolidated into single `pf-substrate` orchestrator.
- Legacy functions now return `410 Gone` with migration instructions.
- Database tables added: `core_jobs`, `core_state`, `ripple_jobs`, `ripple_events`, `access_usage`.

### Dashboard Integration

- New CORE tab displaying system state and job queues.
- New RIPPLE tab displaying message bus and event sourcing.
- New ACCESS tab displaying API key management and usage.
- Enhanced boot sequence animation with 11-module verification.

### Terminal Commands

- 30+ new commands for kernel operations (`core.*`, `ripple.*`, `access.*`).
- Updated `whoami` to display 4-layer architecture identity.
- `/help` supports module-specific queries (e.g., `/help core`).

### SDK Enhancements

- `substrate.core.schedule()`, `substrate.core.boot()`, `substrate.core.shutdown()`
- `substrate.ripple.publish()`, `substrate.ripple.enqueue()`, `substrate.ripple.subscribe()`
- `substrate.access.createKey()`, `substrate.access.validateKey()`, `substrate.access.getUsage()`

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-CHANGELOG-001 |
| Voice | Decode Interpreter (Epistemic) |
| Status | PUBLIC |
| Last Updated | 2026-02-15 |
| Substrate Version | 10.5.1 |

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
