# GTM Strategy — 02 Standalone Product Clones

**Classification:** Internal  
**Date:** 2026-03

---

## 1. Strategy

Clone individual substrate nodes into standalone, independently marketable products. Each clone extracts the node's core logic, wraps it in its own SDK/API surface, and ships with its own branding, pricing, and distribution channel — while the parent substrate retains the integrated version.

---

## 2. Candidates for Standalone Extraction

### Tier 1 — Highest Standalone Value

| Node | Standalone Name | What It Does Solo | Target Market |
|------|----------------|-------------------|---------------|
| **NEXUS** | NEXUS Router | AI model routing, fallback chains, cost optimization, load balancing | Any team using multiple LLMs |
| **ENCODE** | ENCODE Engine | Autonomous code generation, validation, safe-execution sandbox | AI-assisted dev tools |
| **DECODE** | DECODE Interpreter | Natural language → structured intent parsing | Chatbot/NLP product teams |
| **EVOLUTION** | EVLVBL | Self-evolution engine, mutation testing, safe rollback | DevOps, CI/CD, reliability engineering |
| **VISION** | VISION Analyzer | Multimodal analysis, image-to-insight pipelines | Computer vision products |

### Tier 2 — Strong Niche Value

| Node | Standalone Name | What It Does Solo | Target Market |
|------|----------------|-------------------|---------------|
| **CORTEX** | CORTEX Reasoner | Multi-step reasoning, causal mapping, inference chains | Research, analytics platforms |
| **DREAM** | Dream Engine | Background optimization, pattern consolidation, creative synthesis | Content generation, optimization |
| **MEMORY** | Persistent Memory | Namespace-isolated persistent context, temporal decay, consolidation | Any stateful AI application |
| **BRAIN** | Brain Orchestrator | Central cognitive routing, module coordination | Multi-agent orchestration |
| **DEFENSE** | Defense Shield | Threat detection, anomaly isolation, immune response | Security products |

### Tier 3 — Utility / Infrastructure Value

| Node | Standalone Name | What It Does Solo | Target Market |
|------|----------------|-------------------|---------------|
| **IMMUNITY** | Immunity Mesh | Self-healing repair strategies, circuit breakers | Resilience engineering |
| **SANDBOX** | Sandbox Runtime | Isolated execution environments, resource limits | Code execution platforms |
| **RELAY** | Relay Bus | Event routing, pub/sub, cross-module messaging | Microservice architectures |
| **ACCESS** | Access Gateway | API key management, quota enforcement, rate limiting | API monetization |
| **ECONOMY** | Economy Engine | Cost tracking, value attribution, ROI calculation | FinOps, usage-based billing |
| **INCLUSIVE** | Inclusive Engine | Accessibility scanning, WCAG compliance, remediation | Accessibility tooling |
| **AUDIT** | Audit Trail | Immutable event logging, compliance receipts | Compliance, regulated industries |
| **INTEGRATION** | Integration Bridge | External API connectors, protocol adapters | iPaaS / integration platforms |

---

## 3. Clone Architecture

Each standalone clone follows the same pattern:

```
standalone-{name}/
├── sdk/                  # MIT-licensed client SDK
│   ├── src/
│   │   ├── index.ts      # Public API surface
│   │   ├── core/         # Extracted node logic
│   │   └── types/        # Public type definitions
│   └── package.json
├── server/               # Private server-side engine (proprietary)
│   ├── engine.ts         # Core processing
│   └── api.ts            # REST/gRPC endpoints
├── docs/                 # Standalone documentation
└── examples/             # Usage examples
```

### Key Principles

1. **SDK is MIT-licensed** — low friction adoption
2. **Server engine is proprietary** — protects the moat
3. **Vibe-coder install manifests** — optimized for AI coding assistants
4. **Independent versioning** — clones version independently from substrate
5. **Back-port improvements** — learnings from standalone usage feed back into substrate

---

## 4. Revenue Model Per Clone

| Component | Model |
|-----------|-------|
| SDK | Free (MIT) |
| Hosted API | Usage-based (per call / per token) |
| Self-hosted license | Annual seat license |
| Premium features | Tier-gated (mirrors substrate depth caps) |

---

## 5. Priority Extraction Order

1. **NEXUS** — broadest market, simplest extraction, immediate demand
2. **EVOLUTION (EVLVBL)** — already partially extracted, SDK exists
3. **DECODE** — high demand in chatbot/NLP space
4. **ENCODE** — differentiated autonomous code gen
5. **MEMORY** — growing demand for persistent AI context
6. Remaining nodes as market signals dictate

---

© 2025–2026 PromptFluid®. All rights reserved.
