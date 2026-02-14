<div align="center">

# ⚙️ Engine & Meta-Engine Registry

### CONFIDENTIAL — Trade Secret

**v9.3.0 ARCHITECT Epoch**

</div>

---

## Engine Taxonomy

The substrate distinguishes between **Engines** (single-domain processors) and **Meta-Engines** (engines that compose or govern other engines).

---

## Engines (14 Total)

### Kernel Engines

| # | Engine | Module | Purpose | Crown Jewel? |
|---|--------|--------|---------|--------------|
| 1 | **Event Router** | RIPPLE | Fan-out events to subscribers | No |
| 2 | **Key Manager** | ACCESS | API key lifecycle | No |
| 3 | **Rate Limiter** | ACCESS | Token bucket rate limiting | No |

### Cognitive Engines

| # | Engine | Module | Purpose | Crown Jewel? |
|---|--------|--------|---------|--------------|
| 4 | **Memory Indexer** | BRAIN | Memory storage + retrieval | No |
| 5 | **Association Builder** | BRAIN | Graph-based memory linking | No |
| 6 | **Intent Parser** | DECODE | NL → structured intent | No |
| 7 | **Personality Engine** | DECODE | Adaptive response personality | No |
| 8 | **Dream Synthesizer** | DREAM | Autonomous knowledge creation | Yes — partial |
| 9 | **Pattern Detector** | DREAM | Cross-domain pattern discovery | Yes — partial |

### Operational Engines

| # | Engine | Module | Purpose | Crown Jewel? |
|---|--------|--------|---------|--------------|
| 10 | **Threat Classifier** | DEFENSE | Input threat detection | No |
| 11 | **Provider Selector** | NEXUS | AI provider routing | No |
| 12 | **Health Analyzer** | VISION | System health computation | No |
| 13 | **Adapter Executor** | INTEGRATION | External system connectivity | No |
| 14 | **Accessibility Scanner** | INCLUSIVE | WCAG compliance checking | No |

---

## Meta-Engines (12 Total)

Meta-engines compose, govern, or optimize other engines.

| # | Meta-Engine | Governs | Crown Jewel? |
|---|-------------|---------|--------------|
| 1 | **Recursive Self-Optimization** | All engines | 🔴 Yes |
| 2 | **Recursive Architecture Refactorer** | Module topology | 🔴 Yes |
| 3 | **Recursive Meta-Learning Accelerator** | Learning engines | 🔴 Yes |
| 4 | **Recursive Cognitive Bootstrapping** | Cognitive layer | 🔴 Yes |
| 5 | **Recursive Capability Discoverer** | Capability system | 🔴 Yes |
| 6 | **Knowledge Crystallization** | BRAIN + DREAM | 🔴 Yes |
| 7 | **Recursive Infinite Context** | Memory + context | 🔴 Yes |
| 8 | **Intelligence Governance Kernel** | All meta-engines | 🔴 Yes |
| 9 | **Self-Scaling Intelligence Fabric** | Infrastructure | 🔴 Yes |
| 10 | **Evolution Evaluator** | MODERNIZER | No |
| 11 | **Synergy Composer** | Cross-module workflows | No |
| 12 | **Proposal Gate** | Evolution proposals | No |

---

## Composition Rules

### Engine → Meta-Engine Dependencies

```
Meta-Engine can invoke any Engine in its governance scope.
Meta-Engines CANNOT invoke other Meta-Engines directly.
Exception: Intelligence Governance Kernel can invoke all Meta-Engines.
```

### Execution Priority

| Priority | Type | Behavior |
|----------|------|----------|
| 0 (highest) | Intelligence Governance | Pre-empts all |
| 1 | Safety meta-engines | Can interrupt lower priority |
| 2 | Optimization meta-engines | Queued execution |
| 3 | Regular engines | Standard execution |
| 4 (lowest) | Background engines | Idle-time only |

---

## Engine Health Monitoring

Each engine exposes:

```typescript
interface EngineHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'failed';
  uptime_seconds: number;
  invocation_count: number;
  error_rate: number;        // 0.0–1.0
  avg_latency_ms: number;
  circuit_state: 'closed' | 'open' | 'half-open';
  last_error?: string;
}
```

---

## Crown Jewel Engine Restrictions

All 9 crown jewel meta-engines are:
- **Excluded** from Enterprise and Pro tiers
- **Cannot be exported** via API
- **Cannot be described** in public documentation beyond name and general category
- **Execution logs** are stored in a separate, encrypted audit trail
- **Source code** is isolated from main codebase deployment

---

<div align="center">

*CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch — INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
