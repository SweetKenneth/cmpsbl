# Drop-In Engine Templates

> Production-grade, zero-dependency TypeScript engines distilled from the highest-value Crown Jewel artifacts. Each is a standalone `.ts` file you can drop into any project.

## Meta-Engines (Highest Value)

Meta-engines compose multiple standalone engines into complete vertical solutions. One import, fully wired.

| # | Meta-Engine | Composes | What It Solves |
|---|------------|----------|----------------|
| 1 | [AI Operations Platform](./meta-01-ai-ops-platform.md) | Fleet Router + Cost Router + Anomaly + Audit | Complete AI provider management — route, budget, monitor, audit |
| 2 | [Self-Healing Service Mesh](./meta-02-self-healing-mesh.md) | Registry + Heartbeat + Triage + Healer + Anomaly | Full infrastructure resilience — detect, diagnose, heal, learn |
| 3 | [Intelligent Task Processor](./meta-03-task-processor.md) | Interpreter + Triage + Fleet Router + WAL | Parse any input → classify → route → execute → recover |
| 4 | [Compliance & Governance Core](./meta-04-compliance-core.md) | Audit Chain + WAL + Registry + Anomaly | Tamper-evident compliance with anomaly detection on audit stream |
| 5 | [Autonomous Agent Runtime](./meta-05-agent-runtime.ts) | State Machine + Scheduler + Pipeline + WAL + Event Sourcing | Complete agent execution with lifecycle, skills, memory, and crash recovery |
| 6 | [Real-Time Threat Defense](./meta-06-threat-defense.ts) | Rate Limiter + Circuit Breaker + Anomaly + Audit Chain | Security operations — detect abuse, isolate threats, audit everything |
| 7 | [Intelligent API Gateway](./meta-07-api-gateway.ts) | Rate Limiter + Circuit Breaker + Cache + Feature Flags + Cost Router | Complete API management — throttle, cache, gate, budget, protect |
| 8 | [Distributed Workflow Engine](./meta-08-workflow-engine.ts) | State Machine + WAL + Event Sourcing + Scheduler + Circuit Breaker | Saga orchestration with compensation, durability, and step retries |
| 9 | [Data Pipeline Orchestrator](./meta-09-data-orchestrator.ts) | Pipeline + WAL + Event Sourcing + Scheduler + Anomaly | Enterprise ETL with lineage, quality monitoring, and crash recovery |
| 10 | [Multi-Model AI Tribunal](./meta-10-ai-tribunal.ts) | Consensus + Fleet Router + Cost Router + Cache + Audit Chain | AI decision governance — multi-model voting with cost and audit |
| 11 | [Progressive Delivery Platform](./meta-11-progressive-delivery.ts) | Feature Flags + State Machine + Event Sourcing + Anomaly + Pipeline | Release management — canary → limited → full with auto-rollback |
| 12 | [Resilient Integration Hub](./meta-12-integration-hub.ts) | Circuit Breaker + Rate Limiter + Cache + Pipeline + WAL + Scheduler | External service integration with durability and auto-retry |
| 13 | [Observability & Intelligence](./meta-13-observability.ts) | Anomaly Correlator + Audit Chain + Event Sourcing + Pipeline + Cache | Full-stack monitoring with dashboards, alerting, and incident correlation |
| 14 | [Knowledge & Learning Engine](./meta-14-knowledge-engine.ts) | Event Sourcing + Cache + Pipeline + Consensus + Anomaly | Self-improving knowledge system with contradiction detection |

## Standalone Engines

Individual engines for modular use. Pick what you need.

| # | Engine | Module | What It Does | Best For |
|---|--------|--------|-------------|----------|
| 1 | [AI Fleet Router](./01-ai-fleet-router.md) | NEXUS | Multi-provider AI routing with cost controls | Multi-model AI apps |
| 2 | [Resilience Engine](./02-resilience-engine.md) | IMMUNITY | Triage + heartbeat + self-healing | Microservices |
| 3 | [Audit Chain](./03-audit-chain.md) | AUDIT | Tamper-evident logging + WAL durability | Compliance |
| 4 | [Service Registry](./04-service-registry.md) | BRAIK | Dependency-aware service discovery | Plugin systems |
| 5 | [Command Interpreter](./05-command-interpreter.md) | DECODE | Multi-modal input parser | Chatbots, CLIs |
| 6 | [Anomaly Intelligence](./06-anomaly-intelligence.md) | VISION | Incident correlation with causal tracing | Observability |
| 7 | [Write-Ahead Log](./07-write-ahead-log.md) | MEMORY | Crash-recoverable operation journal | Durability, undo/redo |
| 8 | [Circuit Breaker](./08-circuit-breaker.md) | IMMUNITY | Three-state failure isolation with backoff | External API calls |
| 9 | [Rate Limiter](./09-rate-limiter.md) | DEFENSE | Multi-strategy rate limiting with penalties | API protection |
| 10 | [State Machine](./10-state-machine.md) | BRAIK | FSM with guards, effects, and snapshots | Workflows, agent lifecycles |
| 11 | [Event Sourcing](./11-event-sourcing.md) | MEMORY | Append-only event store with projections | CQRS, audit trails |
| 12 | [Feature Flags](./12-feature-flags.md) | DECODE | Runtime toggles with rollouts & A/B testing | Progressive delivery |
| 13 | [Cache Engine](./13-cache-engine.md) | MEMORY | Multi-tier LRU + TTL + stale-while-revalidate | Performance |
| 14 | [Pipeline Engine](./14-pipeline-engine.md) | DECODE | Composable async data transformations | ETL, data processing |
| 15 | [Consensus Engine](./15-consensus-engine.md) | NEXUS | Multi-source voting for critical decisions | AI consensus, approvals |
| 16 | [Scheduler Engine](./16-scheduler-engine.md) | BRAIK | Deferred execution with retry & dead-letter | Background jobs, cron |

## How to Use

1. Open any engine doc
2. Copy the **Full Source** code block
3. Paste into your project (e.g. `src/lib/ai-ops-platform.ts`)
4. Import and use — zero dependencies, zero config

## Design Principles

- **Zero dependencies** — No npm packages, no framework lock-in
- **Pure TypeScript** — Works in Node, Deno, Bun, browsers
- **Factory pattern** — `createX()` returns a self-contained instance
- **No global state** — Multiple instances with independent state
- **Self-learning** — Engines improve from recorded outcomes
- **Strong typing** — Full TypeScript interfaces for everything
- **Meta > Standalone** — Meta-engines are categorically more valuable because they solve entire domains, not individual problems
