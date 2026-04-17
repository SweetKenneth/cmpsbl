# CMPSBL®

**Governed Cognitive Infrastructure**

40 Primitives · 4 Categories · Zero External AI in Ascension or DREAM

[![Web](https://img.shields.io/badge/web-cmpsbl.com-blue)](https://cmpsbl.com)
[![NPM](https://img.shields.io/badge/npm-@cmpsbl-CB3837)](https://www.npmjs.com/org/cmpsbl)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE)

---

CMPSBL® is a cognitive substrate — not a framework, not a wrapper, not an agent platform. It provides deterministic orchestration for AI systems: routing, memory, learning cycles, defense, and execution coordination. Model-agnostic. Provider-agnostic. Built by one person.

## Core Surfaces

| Surface | What it does |
|---------|--------------|
| **Memory Stream** | Autonomous 8-hour discovery cycles. Crystallizes real, scored software pipelines. Never triggered. Dynamic values only. |
| **Ascension** | Bring your code → classify → collide against the 40 Primitives → CJPI score → certify → export Dual-Layer artifact. Zero external AI. |
| **Mana** | Silent Layer 2 attachment. Wraps host software at function boundaries with no source modification. Governed by Lex. |
| **Shield** | LLM prompt defense, hallucination grounding, output sanitization, governance-gated audit receipts. |
| **NEXUS** | Multi-provider AI router across 14+ providers. Default routing layer — never Lovable AI. |
| **Crown Jewels** | Selectable Layer 2 capabilities that merge into Mana exports during Ascension Step 2 (Enhance). |
| **DREAM** | Pure-algorithmic synthesis engine. No AI inside — confirmed. Sub-threshold pattern emergence. |
| **Marketplace** | Showroom · Junkyard · Foundry — 4-hour alternating drop schedule. Composable Cognitives at $39. |

---

## Architecture — 40 Primitives, 4 Categories

CMPSBL enforces a strict **12·12·8·8** primitive matrix. Every primitive is independently deployable and composable. Primitives never call each other directly — all interaction routes through the Intent Router.

### Layers (12) — Ambient Protection
| Primitive | Purpose |
|-----------|---------|
| DEFENSE | Security perimeter, threat detection (6-layer Cognitive Security Matrix) |
| IMMUNITY | Behavioral anomaly response, autonomous self-healing |
| GOVERNANCE | Policy enforcement, constraint systems |
| TREATY | Inter-system trust contracts |
| EVOLUTION | Self-improvement, governed mutation |
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
| MEMORY | Four-tier persistent memory (Hot · Warm · Cold · Legacy) |
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
| DECODE | Conversational interaction, NLU, fingerprint lookup |
| AUDIT | Immutable compliance logging, hash-chained receipts |
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
- Primitives never call each other directly — every interaction routes through the Intent Router
- Mesh communications are real system signals, not simulated telemetry
- All Ascension and DREAM operations execute with **zero external AI calls** — confirmed

---

## NPM Packages

**13 packages** under the `@cmpsbl` scope. Tier 1 packages are zero-dependency and install in any order.

| Package | Tier | Description |
|---------|------|-------------|
| `@cmpsbl/types` | 1 | Shared TypeScript type definitions |
| `@cmpsbl/runtime` | 1 | CJPI scoring, manifests, pipeline orchestration |
| `@cmpsbl/sdk` | 1 | Authenticated client for all 54 hosted engines + Memory Stream |
| `@cmpsbl/intent` | 1 | Intent router + resolver dispatch |
| `@cmpsbl/mesh` | 1 | Mesh telemetry events |
| `@cmpsbl/bridge` | 1 | Polyglot bridge adapters (Python/Go/Rust) |
| `@cmpsbl/discovery` | 1 | Pipeline crystallization engine |
| `@cmpsbl/failsafe` | 1 | Disaster recovery & platform migration |
| `@cmpsbl/shield` | 1 | LLM prompt defense + governance (~27KB, zero deps) |
| `@cmpsbl/mana` | 1 | Silent software symbiosis engine (Layer 2 attachment) |
| `@cmpsbl/cli` | 2 | CLI with guided onboarding (bundles runtime) |
| `@cmpsbl/test-harness` | 2 | Pipeline & bridge validation |
| `@cmpsbl/react` | 2 | React hooks (`useIntent`, `useMesh`, `useRuntime`) |

### Install

```bash
# SDK
npm install @cmpsbl/sdk

# CLI
npm install -g @cmpsbl/cli

# Mana — Layer 2 attachment
npm install -g @cmpsbl/mana

# Shield — LLM defense
npm install @cmpsbl/shield
```

### SDK Quick Start

```typescript
import { CMPSBL } from '@cmpsbl/sdk';

const cmpsbl = new CMPSBL({ apiKey: 'your-api-key' });

// Discovery starts automatically on first contact
const discovery = await cmpsbl.discover({ input: 'track user behavior' });

if (discovery.detected) {
  await cmpsbl.capture(discovery.memory.id);
  await cmpsbl.apply(discovery.memory.id);
}
```

### Direct Engine Calls

```typescript
import { Engine } from '@cmpsbl/sdk';

const engine = new Engine('your-api-key');
const result = await engine.call('cortex', 'reason', 'Analyze market trends');
```

---

## Pricing & Tiers

| | **Builder** | **Studio** | **Creator** | **Architect** |
|---|---|---|---|---|
| **Price** | $0 | $29/mo | $49/mo | $79/mo |
| **Memory Stream pulls/day** | 3 | 6 | 9 | 12 |
| **Vault slots** | 5 | 25 | 75 | Unlimited |
| **Pipeline slots** | 3 | 6 | 12 | Unlimited |
| **Artifact export** | — | ✓ | ✓ | ✓ |
| **Ascension** | — | — | — | ✓ |
| **Mana export** | — | — | — | ✓ |
| **Persistent memory** | ✓ | ✓ | ✓ | ✓ |
| **Org workspaces** | — | — | — | ✓ |
| **Support SLA** | Community | 48h | Priority | SLA |

**Composable Cognitives** — $39 one-time, no subscription required. Standalone Sealed Engines crystallized from high-CJPI Memory Stream pipelines. Marketplace Showroom items range $10–$50.

Start free at [cmpsbl.com/auth](https://cmpsbl.com/auth) — no credit card.

---

## Key Systems

| System | What It Does |
|--------|-------------|
| **Memory Stream** | Runs autonomously on 8-hour cycles. Observes substrate behavior, crystallizes software pipelines. Dynamic values — never hardcoded. |
| **CJPI Scoring** | Discoveries scored on four axes: Novelty, Utility, Complexity, Composability. Minimum floor: 68. APEX/MYTHIC tiers trigger hardware-language emission (VHDL, Verilog, GLSL, WGSL). |
| **DREAM Engine** | Pure algorithmic synthesis. **No AI calls inside — confirmed.** Sub-threshold pre-conscious pattern emergence. Patentable. |
| **Ascension** | Code classification → collision against 40 Primitives → CJPI scored → FNV-1a fingerprint → Dual-Layer Mana export. Zero external AI calls — confirmed. |
| **Shield** | Prompt injection detection, hallucination grounding, output sanitization, governance-gated audit receipts. Cross-vertical primitive selection (LLM + Cyber + Spine pools). |
| **Mana + Lex** | Mana attaches silently to existing codebases at function boundaries. Lex governs what attaches via priority-ranked rule registry (allowlist/blocklist + custom rules). |
| **NEXUS Router** | Routes across 14+ AI providers (OpenAI, Anthropic, Google, Mistral, open-source). Decisions consider task type, cost, latency, availability. |
| **Memory** | Four-tier persistent: Hot (127 records / 7d) · Warm (2,000 / 30d) · Cold (200 / forever) · Legacy (unlimited / forever). Protected memory locks at 1.0 with zero decay. |
| **EVOLUTION** | Governed self-improvement. Confidence-gated proposals, human approval for significant changes, full audit trail. Plus the Immunity Matrix (Shadow → Simulation → Promotion). |
| **DEFENSE** | 6-layer Cognitive Security Matrix: Perimeter · Identity · Protocol · Execution · Audit · Response. RLS on all user data. SOC 2 / GDPR-ready patterns. |

---

## Verticals

12 operational substrate environments — internal discovery engines feeding the unified Marketplace:

Cyber · Fintech · Robotics · Gaming · Education · Health · Media · Quantum · LLM · Ultimate · Control · Mana

Each vertical operates its own 40-Primitive matrix and contributes Vertical Ascension records back to the substrate.

---

## Documentation

- **User guides:** `/documentation` and [docs/libraries/](docs/libraries/)
- **Roadmaps:** [docs/libraries/roadmaps/](docs/libraries/roadmaps/)
- **Plans & Pricing:** [docs/libraries/public/09-plans-and-pricing.md](docs/libraries/public/09-plans-and-pricing.md)
- **Evolution Log:** `/changelog`
- **Memory Stream:** `/memory-stream`
- **Ascension Center:** `/ascension`
- **Mana:** [mana.cmpsbl.com](https://mana.cmpsbl.com)
- **Marketplace:** [marketplace.cmpsbl.com](https://marketplace.cmpsbl.com)

---

## Technology

- **Frontend:** React 18, TypeScript (strict, ES2022), Vite, Tailwind CSS, shadcn/ui
- **Backend:** PostgreSQL with RLS, Edge Functions
- **AI Routing:** NEXUS — model-agnostic, provider-agnostic
- **Infrastructure:** Commodity cloud, any provider
- **Codebase:** 200k+ lines, pure TypeScript, zero `any`

---

## Patents & License

| | |
|---|---|
| **Ascension™** | U.S. App. No. 64/029,678 |
| **Mana™** | U.S. App. No. 64/031,637 |
| **Trademark** | CMPSBL® (registered) |
| **Parent** | PromptFluid™ (TX) |
| **Founder** | Kenneth E. Sweet Jr. (solo) |
| **License** | Apache License 2.0 |
| **Web** | [cmpsbl.com](https://cmpsbl.com) |
| **Packages** | [npmjs.com/org/cmpsbl](https://www.npmjs.com/org/cmpsbl) |

---

© 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
