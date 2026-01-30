# CMPSBL OS Substrate — Internal Engineering Library

**Version 6.0.0 | FNDTN Release | CONFIDENTIAL**

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

### The 14 Modules

```
KERNEL LAYER (Boot Order 1-3)
├── CORE ........... Configuration, constants, feature flags
├── RIPPLE ......... Event bus, pub/sub, cross-module messaging
└── ACCESS ......... API keys, rate limits, entitlements

COGNITIVE LAYER (Boot Order 4-7)
├── BRAIN .......... Memory storage, recall, consolidation
├── VISION ......... Future state modeling, trend analysis
├── CORTEX ......... Orchestration, phase management
└── MODERNIZER ..... Evolution engine, self-improvement

INTERFACE LAYER (Boot Order 8-11)
├── DECODE ......... Natural language → structured commands
├── DEFENSE ........ Security, threat detection, rate limiting
├── NEXUS .......... AI provider routing, fallback chains
└── DREAM .......... Autonomous cycles, doctrine extraction

ADMINISTRATIVE LAYER (Boot Order 12-14)
├── INTEGRATION .... External APIs, webhooks, adapters
├── INCLUSIVE ...... Accessibility scanning, WCAG enforcement
└── SYSTEM ......... Health, diagnostics, backup/restore
```

### Key Secrets Summary

| Secret | Location | Why It Matters |
|--------|----------|----------------|
| Confidence Gating | Evolution Engine | Only >80% confidence proposals auto-execute |
| Memory Value Score | Brain Module | `recency × frequency × confidence` determines retention |
| Circuit Isolation | Resilience | Each module fails independently |
| Weighted A11y Score | Inclusive | `100 - (critical×20) - (serious×10) - (moderate×5) - (minor×1)` |
| Provider Fallback | Nexus | 7-provider chain ensures 99.9% uptime |

---

*CMPSBL OS Substrate v6.0.0 — FNDTN Release*
*© 2025-2026 PromptFluid®. All rights reserved.*
