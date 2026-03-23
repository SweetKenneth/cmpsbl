# CMPSBL® Substrate Public Changelog

> What's new in the substrate. Updated with every release.

---

## v15.2.0 — 2026-03-23

**RIPPLE Ultimate — "Tsunami"**

- 🌊 RIPPLE upgraded to **v9.0.0** with 9 new Ultimate Form systems.
- ⚡ **Priority Preemption Engine** — 4-tier priority queue with sub-millisecond critical signal delivery. Lower-priority batches are preempted when critical signals arrive.
- 🎛️ **Per-Subscriber Adaptive Backpressure** — Independent throttling per subscriber with EMA-tracked processing speed, p95 latency, and health scores. Fast subscribers never blocked by slow ones.
- 🔬 **DLQ Forensics Engine** — Error fingerprinting, pattern analysis, auto-bypass routes after 10 recurring failures, and replay with payload mutation.
- 🔗 **Signal Correlation Engine** — Causal chain tracking with temporal windowing, live dependency graphs, and hot path detection across all 40 nodes.
- 🗺️ **Topic Topology Optimizer** — Detects dead topics (subscribed, never published), orphan topics (published, no subscribers), and suggests consolidations at 80%+ subscriber overlap.
- 📋 **Event Schema Registry** — Type-safe contracts with runtime validation, schema versioning, and backward-compatibility checks.
- 🌪️ **Cascade Storm Detection** — Monitors event velocity per topic. Auto-throttles at 10x baseline spike. 4-tier severity: watch → warning → storm → critical.
- 🔧 **Event Enrichment Pipeline** — Pre/post-delivery hooks for payload enrichment (trace IDs, timestamps, context). Sequential transform chains.
- 📊 **Live Telemetry Feed** — Real-time throughput (EMA), per-topic latency percentiles (p50/p95/p99), subscriber lag metrics, DLQ depth, and hot topic heatmap.

---

## v15.1.9 — 2026-03-23

**100 Primary Memory Chains + UI Refinements**

- 🧬 Primary Memory Chain registry expanded to **100 chains** across 9 categories including new **Cognitive Supremacy** category (chains 76–100).
- 🎨 Homepage layout refined — header text properly split across two lines for improved readability.
- 🔒 Analytics tab restricted to **admin-only** access with role-based gating.
- 🐛 BRAIN telemetry 500 error in analytics tab fixed — properly handling null/missing data.

---

## v15.1.8 — 2026-03-23

**Discovery-Taught Chain Intelligence**

- 🧠 NERVE now operates **75 Primary Memory Chains** — 25 new chains were autonomously derived from the discovery engine's highest-scoring vault memories (CJPI 100) and pipeline discoveries (CJPI 92–98).
- 📋 New chain categories include Bayesian Detection, Sovereign Lockdown, Compositional Firewall, Causal Synthesis, Adaptive Bridge, Emergent Orchestration, and 19 more.
- 📄 Governor documentation updated to reflect full 75-chain registry.

---

## v15.1.7 — 2026-03-23

**Chain Orchestrator Guard Layer**

- 🔒 **Node Lock Guard** — Prevents conflicting actions on the same node (e.g., double quarantine). Short-TTL locks with automatic expiration.
- 🔗 **Cascade Relationship Tracker** — Detects and blocks runaway chain reactions (depth limit: 3). Records chain→chain temporal relationships for analysis.
- 📊 **Activity Telemetry** — Per-chain execution tracking with hot/slow/failing chain detection via `getChainActivitySummary()`.

---

## v15.1.6 — 2026-03-23

**50 Primary Memory Chains**

- ⚡ Expanded from 8 to **50 chains** across 7 categories: Core Response, Security & Defense, Intelligence & Learning, Operations & Infrastructure, Governance & Compliance, Data & Processing, and Advanced Autonomous.
- 🛡️ Security chains cover identity theft, privilege escalation, session hijack, brute force, insider threat, zero-day response, DDoS mitigation, and data exfiltration blocking.

---

## v15.1.5 — 2026-03-23

**Primary Memory Chain Registry**

- 🧬 Introduced **Primary Memory Chains** — multi-node reaction workflows that fire automatically when trigger conditions are met.
- 🔄 8 core chains: Threat Response, Self-Heal, Data Breach, Cascade Containment, Compliance Alert, Performance Degradation, Memory Pressure, Discovery Validation.
- 📐 Declarative chain definitions with staged execution, payload transforms, cooldowns, and governance overrides.

---

## v15.1.4 — 2026-03-23

**AUDIT Ultimate — "Sentinel Ledger"**

- 🔐 Merkle audit chain with SHA-256 hash linking for tamper-evident receipts.
- 📜 Compliance policy engine with automated violation detection.
- 🔍 Forensic timeline reconstructor for incident response.
- 📈 Statistical anomaly detection for frequency, velocity, and timing.
- 🗂️ Retention policy manager with automated lifecycle transitions.

---

## v15.1.3 — 2026-03-23

**NERVE Ultimate — "Synapse Prime"**

- 📡 11 new capabilities: Signal Replay Journal, Adaptive Backpressure, Predictive Circuit Breaker, Signal Correlation Engine, Per-Edge Latency Tracker, Dead Letter Queue, Dynamic Priority Rebalancer, Heartbeat Fingerprinter, Cascade Failure Detector, Nerve Telemetry Nexus.
- 🧠 Causal chain reconstruction and Z-score trend analysis for pre-emptive failure prevention.

---

## v15.1.2 — 2026-03-23

**MEDIC & ENGINEER Ultimate**

- 🏥 MEDIC "Regenerator" — Predictive diagnostics, repair strategy optimizer, tissue regeneration, triage queue, post-mortem analyzer.
- 🔧 ENGINEER "Mechanist" — Maintenance window scheduler, capacity planner, dependency graph analyzer, hot-swap module manager, performance benchmark suite.

---

## v15.1.1 — 2026-03-23

**EVOLUTION & SYSTEM Ultimate**

- 🦅 EVOLUTION "Phoenix Prime" — 5-stage mutation pipeline, rollback orchestrator, fitness landscape tracker, lineage graph, shadow environments.
- 🏛️ SYSTEM "Sentinel" — Predictive failure engine, configuration state machine, lifecycle orchestrator for 40 nodes, resource budget manager with graceful degradation (L0–L4).

---

## v15.1.0 — 2026-03-23

**CORTEX & NEXUS Ultimate**

- 🧠 CORTEX — Pipeline DAG scheduler, weighted load balancer, orchestration replay journal, resource quota manager, pipeline template registry.
- 🌐 NEXUS — Semantic intent classifier, provider affinity engine, routing policy engine, circuit breaker mesh, request deduplication.

---

## v15.0.0 — 2026-03-22

**CONTACT Epoch — NPM Distribution & Developer Touchpoints**

- 📦 11 @cmpsbl NPM packages across Foundation, Core, Developer, and Ecosystem tiers.
- 🤝 First Contact System — unified initialization, CLI entry point (`npx cmpsbl init`), SDK client.
- 🔒 Live discovery mode enforced — simulated outputs architecturally blocked.

---

© 2025–2026 PromptFluid®. All rights reserved.
