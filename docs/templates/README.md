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

## Standalone Engines

Individual engines for modular use. Pick what you need.

| # | Engine | What It Does | Best For |
|---|--------|-------------|----------|
| 1 | [AI Fleet Router](./01-ai-fleet-router.md) | Multi-provider AI routing with cost controls | Multi-model AI apps |
| 2 | [Resilience Engine](./02-resilience-engine.md) | Triage + heartbeat + self-healing | Microservices |
| 3 | [Audit Chain](./03-audit-chain.md) | Tamper-evident logging + WAL durability | Compliance |
| 4 | [Service Registry](./04-service-registry.md) | Dependency-aware service discovery | Plugin systems |
| 5 | [Command Interpreter](./05-command-interpreter.md) | Multi-modal input parser | Chatbots, CLIs |
| 6 | [Anomaly Intelligence](./06-anomaly-intelligence.md) | Incident correlation with causal tracing | Observability |

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
