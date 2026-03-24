# CMPSBL®

**Cognitive Substrate for AI Systems**

v16.7.0 · CONTACT Epoch · 40 Primitives · 4 Categories

---

CMPSBL is a cognitive orchestration substrate — not a framework, not a wrapper. It's an operating system for AI that provides routing, memory, learning cycles, defense, and execution coordination. Model-agnostic. Provider-agnostic. Runs on commodity cloud.

## Quick Start

```bash
# Install the CLI
npm install -g @cmpsbl/cli

# Initialize (triggers First Contact ceremony + First Dream)
npx cmpsbl init

# Or use the SDK directly
npm install @cmpsbl/core
```

```typescript
import { substrate } from '@cmpsbl/core';

// Initialize with your API key from cmpsbl.com
await substrate.init({ apiKey: 'your-key' });

// Make your machine dream
const dream = await substrate.dream.cycle();
console.log(dream.heuristic);   // discovered pattern
console.log(dream.confidence);  // 0.87
```

Get your API key at **[cmpsbl.com/api-access](https://cmpsbl.com/api-access)**

---

## Architecture — 40 Primitives, 4 Categories

CMPSBL uses a strict **12·12·8·8** primitive matrix:

### Layers (12) — Ambient Protection
| Primitive | Role |
|-----------|------|
| DEFENSE | Security perimeter, threat detection |
| IMMUNITY | Behavioral immunity, anomaly response |
| GOVERNANCE | Policy enforcement, constraint systems |
| TREATY | Inter-system agreements, trust contracts |
| EVOLUTION | Self-improvement, adaptation engine |
| REFLEX | Reactive triggers, fast-path responses |
| COMPASS | Navigation, intent guidance |
| INTEGRATION | External adapters, connectors |
| INTENT | Intent resolution, routing mesh |
| ACCESS | Authentication, API keys, entitlements |
| VISION | Observability, metrics, tracing |
| SHADOW | Stealth operations, adversarial testing |

### Organs (12) — Vital Infrastructure
| Primitive | Role |
|-----------|------|
| CORE | Foundation primitives, lifecycle |
| SYSTEM | Runtime orchestration, health management |
| BRAIN | Reasoning, knowledge graphs, learning |
| MEMORY | Vector store, RAG, semantic retrieval |
| NERVE | Signal pathways, neural routing |
| NEXUS | Multi-provider AI fleet routing |
| IDENTITY | Actor attribution, reputation |
| SOVEREIGN | Data sovereignty, governance |
| ATLAS | Capability mapping, topology |
| MEDIC | Self-healing, diagnostics |
| RELAY | Webhooks, message delivery |
| CONSCIENCE | Ethical reasoning, bias detection |

### Engines (8) — Invoked Processing Power
| Primitive | Role |
|-----------|------|
| DREAM | Autonomous synthesis, creative learning |
| HARVEST | Data extraction, web intelligence |
| FORGE | Blueprint fabrication, pipeline discovery |
| LINGUA | Language processing, translation |
| ECHO | Reflection, pattern replay |
| PHANTOM | Speculative execution, hypothesis testing |
| SANDBOX | Safe code execution, isolation |
| RIPPLE | Event propagation, message bus |

### Agents (8) — Autonomous Actors
| Primitive | Role |
|-----------|------|
| ENCODE | Governed code generation |
| DECODE | NLU, conversational interaction |
| AUDIT | Immutable compliance logging |
| ECONOMY | Cost tracking, predictive forecasting |
| INCLUSIVE | Accessibility, WCAG compliance |
| CORTEX | Meta-orchestration, workflow engine |
| ORACLE | Prediction, forecasting |
| ENGINEER | Infrastructure automation |

---

## Execution Model

All system actions route through the **Intent Mesh**:

```
User Action → broadcastIntent() → Intent Router → Resolver Execution
    → Mesh Communications → Telemetry
```

- **Nodes** expose capabilities through **Resolvers** (`brain.reasoning_context`, `defense.threat_score`)
- **Nodes never call each other directly** — all interaction flows through the Intent Router
- **Mesh Communications** are real system signals, not simulated telemetry

---

## NPM Packages

| Package | Description |
|---------|-------------|
| `@cmpsbl/cli` | CLI tools with First Contact ceremony |
| `@cmpsbl/core` | Core substrate runtime |
| `@cmpsbl/runtime` | Manifest, CJPI scoring, memory chains |
| `@cmpsbl/types` | TypeScript type definitions |

All packages follow the **First Contact System** — live discovery, persistent identity, zero mock data.

---

## CLI Commands (42)

```bash
# ── Project ──
cmpsbl init              # Initialize project + First Contact + First Dream
cmpsbl dream             # Trigger a DREAM Engine cycle
cmpsbl config            # View/set configuration
cmpsbl login / logout    # Authenticate with CMPSBL API

# ── Cognitive ──
cmpsbl think <prompt>    # BRAIN deep reasoning cycle
cmpsbl reflect [topic]   # ECHO resonance & pattern replay
cmpsbl remember <input>  # MEMORY store & semantic retrieval
cmpsbl forget <chain-id> # MEMORY prune a chain

# ── Discovery ──
cmpsbl discover <input>  # Live discovery on an input
cmpsbl stream            # View Memory Stream
cmpsbl score <n> <u> <c> <m>  # CJPI scoring

# ── Engines ──
cmpsbl forge [topic]     # Signal Forge blueprint synthesis
cmpsbl harvest <url>     # HARVEST data extraction
cmpsbl translate <text>  # LINGUA language processing
cmpsbl sandbox <script>  # SANDBOX safe code execution

# ── Agents ──
cmpsbl scan <url>        # INCLUSIVE accessibility scan (WCAG 2.2)
cmpsbl predict <scenario># ORACLE forecasting & what-if
cmpsbl audit [scope]     # AUDIT compliance report
cmpsbl cost [period]     # ECONOMY usage & cost report

# ── Defense ──
cmpsbl threat <input>    # DEFENSE threat scoring
cmpsbl immune            # IMMUNITY health & anomalies

# ── Governance ──
cmpsbl govern            # GOVERNANCE policy check & mode
cmpsbl treaty            # TREATY trust contracts

# ── System ──
cmpsbl status            # Full substrate status
cmpsbl health            # Health check across all primitives
cmpsbl nodes [filter]    # List all 40 primitives
cmpsbl ping <node>       # Ping a specific primitive
cmpsbl inspect <node>    # Deep-inspect a primitive
cmpsbl topology          # Category topology map
cmpsbl route <intent>    # Trace intent routing path
cmpsbl benchmark         # Latency benchmark
cmpsbl doctor            # Full diagnostic suite
cmpsbl shell             # Interactive REPL
```

All commands support `--json` for CI/CD integration.

---

## Key Systems

| System | Description |
|--------|-------------|
| **Memory Stream** | Discovery engine that observes behavior and crystallizes software pipelines |
| **CJPI Scoring** | Novelty · Utility · Complexity · Composability scoring for discoveries |
| **Signal Forge** | One-button blueprint synthesis across the 40-primitive topology |
| **Dream Cycles** | Autonomous learning with semantic drift detection and heuristic building |
| **Mesh Communications** | Real-time node-to-node signaling with personality voice translation |
| **First Contact** | 7-phase boot ceremony binding persistent identity across all touchpoints |

---

## Developer Onboarding

1. Get your API key at [cmpsbl.com/api-access](https://cmpsbl.com/api-access)
2. Run `npx cmpsbl init` — authenticates, runs First Contact, scaffolds your first project
3. The **First Dream** guided experience walks you through triggering your first dream cycle
4. Use `cmpsbl discover` and `cmpsbl stream` to explore what the substrate learns

---

## Technology

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** PostgreSQL + Edge Functions
- **AI Routing:** Model-agnostic, provider-agnostic
- **Infrastructure:** Commodity cloud (any provider)

---

## Ownership & Licensing

CMPSBL® is a registered trademark.

**Core Platform:** Apache License 2.0

| Contact | Details |
|---------|---------|
| **Founder** | Kenneth E Sweet Jr |
| **Web** | [cmpsbl.com](https://cmpsbl.com) |

---

© 2025–2026 CMPSBL®. All rights reserved.
