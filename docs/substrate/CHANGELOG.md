# promptfluid® Substrate Changelog

> ⟨Entries on this page are recorded in the Decode interpreter's epistemic voice. They describe observed behavior of the substrate, not guarantees. No imperatives, no identity claims, no agency assertions.⟩

---

## 2026-01-17 · v3.10.0

⟨This entry describes the homepage rewrite for substrate OS positioning with updated SEO metadata.⟩

### Homepage Rewrite

- Rewrote homepage body content for substrate OS positioning.
- Hero: "The Cognitive Substrate OS" with subhead "Compose cognition as software. Modules, memory, agents, governance, execution."
- Added sections: Substrate Explanation, Composition Model, Modules Surface, Code Surface, Developer Ingress.
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

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-CHANGELOG-001 |
| Voice | Decode Interpreter (Epistemic) |
| Status | PUBLIC |
| Last Updated | 2026-01-16 |
| Substrate Version | 3.6.0 |

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
