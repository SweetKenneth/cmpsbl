# CMPSBL®

**Governed Cognitive Infrastructure**

40 Primitives · 4 Categories · Zero External AI Dependencies

---

CMPSBL is a cognitive substrate — not a framework, not a wrapper, not an agent platform. It provides deterministic orchestration for AI systems: routing, memory, learning cycles, defense, and execution coordination. Model-agnostic. Provider-agnostic. Built by one person.

## What It Does

- **Intent Routing** — Every action flows through a governed intent mesh. Primitives never call each other directly.
- **Memory & Learning** — Persistent memory chains with semantic retrieval. Autonomous learning cycles that build heuristics from observed behavior.
- **Defense & Governance** — Security perimeter, threat detection, policy enforcement, and compliance logging baked into the substrate itself.
- **Discovery** — The Memory Stream observes system behavior and crystallizes reusable software pipelines, scored by CJPI (Novelty · Utility · Complexity · Composability).
- **Mana** — Silent Layer 2 attachment. One command to enhance and protect existing code without modifying it.

---

## Architecture — 40 Primitives, 4 Categories

CMPSBL enforces a strict **12·12·8·8** primitive matrix. Every primitive is independently deployable and composable.

### Layers (12) — Ambient Protection
| Primitive | Purpose |
|-----------|---------|
| DEFENSE | Security perimeter, threat detection |
| IMMUNITY | Behavioral anomaly response |
| GOVERNANCE | Policy enforcement, constraint systems |
| TREATY | Inter-system trust contracts |
| EVOLUTION | Self-improvement, adaptation |
| REFLEX | Fast-path reactive triggers |
| COMPASS | Intent guidance, navigation |
| INTEGRATION | External adapters, connectors |
| INTENT | Intent resolution, routing |
| ACCESS | Authentication, API keys, entitlements |
| VISION | Observability, metrics, tracing |
| SHADOW | Adversarial testing, stealth operations |

### Organs (12) — Vital Infrastructure
| Primitive | Purpose |
|-----------|---------|
| CORE | Foundation primitives, lifecycle management |
| SYSTEM | Runtime orchestration, health |
| BRAIN | Reasoning, knowledge graphs |
| MEMORY | Semantic retrieval, memory chains |
| NERVE | Signal pathways, neural routing |
| NEXUS | Multi-provider AI fleet routing |
| IDENTITY | Actor attribution, reputation |
| SOVEREIGN | Data sovereignty, governance |
| ATLAS | Capability mapping, topology |
| MEDIC | Self-healing, diagnostics |
| RELAY | Webhooks, message delivery |
| CONSCIENCE | Ethical reasoning, bias detection |

### Engines (8) — Invoked Processing
| Primitive | Purpose |
|-----------|---------|
| DREAM | Autonomous synthesis — pure algorithmic, no AI |
| HARVEST | Data extraction, web intelligence |
| FORGE | Blueprint fabrication, pipeline discovery |
| LINGUA | Language processing, translation |
| ECHO | Reflection, pattern replay |
| PHANTOM | Speculative execution, hypothesis testing |
| SANDBOX | Safe code execution, isolation |
| RIPPLE | Event propagation, message bus |

### Agents (8) — Autonomous Actors
| Primitive | Purpose |
|-----------|---------|
| ENCODE | Governed code generation |
| DECODE | Conversational interaction, NLU |
| AUDIT | Immutable compliance logging |
| ECONOMY | Cost tracking, predictive forecasting |
| INCLUSIVE | Accessibility scanning (WCAG 2.2) |
| CORTEX | Meta-orchestration, workflow engine |
| ORACLE | Prediction, forecasting |
| ENGINEER | Infrastructure automation |

---

## Execution Model

```
User Action → broadcastIntent() → Intent Router → Resolver Execution → Telemetry
```

- Primitives expose capabilities through **Resolvers** (e.g. `brain.reasoning_context`, `defense.threat_score`)
- Primitives never call each other directly — all interaction routes through the Intent Router
- Mesh communications are real system signals, not simulated telemetry

---

## NPM Packages

13 packages. Self-contained builds. One substrate.

| Package | Version | Description |
|---------|---------|-------------|
| `@cmpsbl/types` | 3.0.0 | Shared TypeScript type definitions |
| `@cmpsbl/runtime` | 4.0.0 | CJPI scoring, manifests, pipeline orchestration |
| `@cmpsbl/sdk` | 4.0.0 | Unified SubstrateClient for all surfaces |
| `@cmpsbl/intent` | 3.0.0 | Intent router + resolver dispatch |
| `@cmpsbl/mesh` | 3.0.0 | Mesh telemetry events |
| `@cmpsbl/bridge` | 3.0.0 | Polyglot bridge adapters (Python/Go/Rust) |
| `@cmpsbl/discovery` | 3.0.0 | Pipeline crystallization engine |
| `@cmpsbl/failsafe` | 5.0.0 | Disaster recovery & platform migration |
| `@cmpsbl/shield` | 3.0.0 | LLM prompt defense + governance |
| `@cmpsbl/mana` | 3.0.0 | Silent software symbiosis engine |
| `@cmpsbl/cli` | 4.0.0 | CLI with guided onboarding |
| `@cmpsbl/test-harness` | 3.0.0 | Pipeline & bridge validation |
| `@cmpsbl/react` | 3.0.0 | React hooks (useIntent, useMesh, useRuntime) |

### Install

```bash
# Just the SDK
npm install @cmpsbl/sdk

# CLI
npm install -g @cmpsbl/cli

# Mana (Layer 2 attachment)
npm install -g @cmpsbl/mana
```

---

## Key Systems

| System | What It Does |
|--------|-------------|
| **Memory Stream** | Runs autonomously on 8-hour cycles. Observes behavior, crystallizes software pipelines. Dynamic values — never hardcoded. |
| **CJPI Scoring** | Scores discoveries on four axes: Novelty, Utility, Complexity, Composability. |
| **DREAM Engine** | Pure algorithmic synthesis. No AI calls inside — confirmed. Sub-threshold pattern emergence. |
| **Ascension** | Code classification → collision against 40 Primitives → CJPI scored → certified. Zero external AI calls. |
| **Shield** | Prompt injection detection, hallucination grounding, output sanitization, governance-gated audit receipts. |
| **Mana + Lex** | Mana attaches silently to existing codebases. Lex governs what attaches via registry (allowlist/blocklist). |

---

## Technology

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** PostgreSQL, Edge Functions
- **AI Routing:** Model-agnostic via NEXUS — provider-agnostic fleet routing
- **Infrastructure:** Commodity cloud, any provider
- **Codebase:** 200k+ lines, pure TypeScript

---

## Ownership & License

CMPSBL® is a registered trademark. Parent entity: PromptFluid™ (TX).

**License:** Apache License 2.0

| | |
|---|---|
| **Founder** | Kenneth E. Sweet Jr. |
| **Web** | [cmpsbl.com](https://cmpsbl.com) |
| **Packages** | [npmjs.com/org/cmpsbl](https://www.npmjs.com/org/cmpsbl) |

---

© 2025–2026 CMPSBL®. All rights reserved.
