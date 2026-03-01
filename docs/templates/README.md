# Drop-In Engine Templates

> Six production-grade, zero-dependency TypeScript engines distilled from the highest-value Crown Jewel artifacts. Each is a standalone `.ts` file you can drop into any project.

## The Engines

| # | Engine | What It Does | Best For |
|---|--------|-------------|----------|
| 1 | [AI Fleet Router](./01-ai-fleet-router.md) | Multi-provider AI routing with cost controls, health tracking, circuit breaking, and learned task affinity | Any app using multiple AI providers |
| 2 | [Resilience Engine](./02-resilience-engine.md) | Triage + heartbeat + self-healing in one package with pattern-matching diagnostics and auto-repair | Microservices, distributed systems |
| 3 | [Audit Chain](./03-audit-chain.md) | Tamper-evident logging + WAL durability with Merkle roots and transactional replay | Compliance, financial systems |
| 4 | [Service Registry](./04-service-registry.md) | Dependency-aware service discovery with topological boot ordering and health monitoring | Plugin systems, service meshes |
| 5 | [Command Interpreter](./05-command-interpreter.md) | Multi-modal input parser — NL, terminal, slash, JSON, code — with intent classification | Chatbots, CLIs, developer tools |
| 6 | [Anomaly Intelligence](./06-anomaly-intelligence.md) | Incident correlation with causal chain tracing through dependency graphs | Observability, SRE automation |

## How to Use

1. Open any engine doc
2. Copy the **Full Source** code block
3. Paste into your project (e.g. `src/lib/ai-fleet-router.ts`)
4. Import and use — zero dependencies, zero config

## Design Principles

- **Zero dependencies** — No npm packages, no framework lock-in
- **Pure TypeScript** — Works in Node, Deno, Bun, browsers
- **Factory pattern** — `createX()` returns a self-contained instance
- **No global state** — Multiple instances with independent state
- **Self-learning** — Engines that improve from recorded outcomes
- **Strong typing** — Full TypeScript interfaces for everything
