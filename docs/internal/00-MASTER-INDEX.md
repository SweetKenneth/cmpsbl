# CMPSBL OS Substrate — Internal Engineering Library

**Version 6.3.1 | FNDTN Release | CONFIDENTIAL**

---

## ⚠️ Classification

> **INTERNAL USE ONLY** — This documentation contains proprietary implementation details, trade secrets, and architectural decisions that provide competitive advantage. Do not distribute externally.

---

## Document Index

| # | Document | Description |
|---|----------|-------------|
| 01 | [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md) | 14-module isolation, RIPPLE event bus, boot sequence |
| 02 | [Evolution Engine](./02-EVOLUTION-ENGINE.md) | 5-phase lifecycle, confidence gating, shadow testing |
| 03 | [Cognitive Brain](./03-COGNITIVE-BRAIN.md) | 3-tier memory, value scoring, 5 cognitive engines |
| 04 | [Resilience & Circuits](./04-RESILIENCE-CIRCUITS.md) | Circuit breakers, auto-heal, health scoring |
| 05 | [Accessibility Pipeline](./05-ACCESSIBILITY-PIPELINE.md) | WCAG enforcement, weighted scoring, template blocking |
| 06 | [Dream-Eater Cycles](./06-DREAM-EATER.md) | Autonomous learning, doctrine extraction, sleep cycles |
| 07 | [Defense & Security](./07-DEFENSE-SECURITY.md) | Rate limiting, API key hashing, threat detection |
| 08 | [AI Router (Nexus)](./08-NEXUS-ROUTER.md) | Provider fallback, cost optimization, model selection |
| 09 | [Terminal Reference](./09-TERMINAL-REFERENCE.md) | All 260+ commands, module prefixes, output formats |
| 10 | [Integration Layer](./10-INTEGRATION-LAYER.md) | External APIs, webhook handling, adapter patterns |

---

## Quick Reference

### The 14 Modules (+ CLM)

```
KERNEL LAYER (Boot Order 1-3)
├── CORE ........... Configuration, constants, feature flags
├── RIPPLE ......... Event bus, pub/sub, cross-module messaging
└── ACCESS ......... API keys, rate limits, entitlements

COGNITIVE LAYER (Boot Order 4-6)
├── BRAIN .......... Memory storage, recall, consolidation
├── DECODE ......... NLP interpretation, intent parsing
└── DREAM .......... Dream-Eater, mutation cycles

OPERATIONS LAYER (Boot Order 7-9)
├── DEFENSE ........ Security, threat detection, rate limiting
├── NEXUS .......... AI provider routing, fallback chains
└── VISION ......... Observability, metrics, tracing

ADMIN LAYER (Boot Order 10-12)
├── SYSTEM ......... Health, diagnostics, backup/restore
├── MODERNIZER ..... Evolution engine, self-improvement
└── INCLUSIVE ...... Accessibility scanning, WCAG enforcement

ORCHESTRATOR LAYER (Boot Order 13-14)
├── CORTEX ......... Policy intent, PAAEL loop, manual mode
└── INTEGRATION .... External APIs, webhooks, adapters

LEARNING MODE (v6.7.0)
└── CLM ............ Constant Learning Mode, curriculum, spaced repetition
```

### Key Secrets Summary

| Secret | Location | Why It Matters |
|--------|----------|----------------|
| Confidence Gating | Evolution Engine | Only >80% confidence proposals auto-execute |
| Memory Value Score | Brain Module | `recency × frequency × confidence` determines retention |
| Circuit Isolation | Resilience | Each module fails independently |
| Weighted A11y Score | Inclusive | `100 - (critical×20) - (serious×10) - (moderate×5) - (minor×1)` |
| Provider Fallback | Nexus | 7-provider chain ensures 99.9% uptime |
| CLM Budget Governor | CLM | Daily token budget with kill switch for runaway learning |

### Version History

| Version | Codename | Key Features |
|---------|----------|--------------|
| 6.3.1 | FNDTN | CLM integration, mobile terminal, 260+ commands, Synergy Pipeline Registry, enriched proposal metadata, DREAM Nightmare Mode (simulation-only) |
| 6.0.0 | FNDTN | 14-module architecture, Evolution Cycle |
| 5.6.0 | — | Module registry, inventory system |
| 5.0.0 | — | Terminal v5: aliases, macros, watch mode |

### Recent Additions (v6.3.1 Patch)

| Addition | Location | Purpose |
|----------|----------|---------|
| Synergy Pipeline Registry | `docs/library/77-SYNERGY-PIPELINES.md`, `src/lib/registry/pipelines.ts` | Documents emergent cross-module capabilities (descriptive only) |
| Enriched Proposal Metadata | `src/lib/evolve/scan/types.ts` | `affected_modules`, `reversible`, `metadata_version` for traceability |
| DREAM Nightmare Mode | `src/lib/dream/nightmares.ts` | Hypothetical threat simulation artifacts (read-only, no feedback loops) |

---

*CMPSBL OS Substrate v6.3.1 — FNDTN Release*
*© 2025-2026 PromptFluid®. All rights reserved.*
