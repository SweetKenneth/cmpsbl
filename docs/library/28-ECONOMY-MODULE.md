# ECONOMY Module

**CMPSBL® Substrate — Infrastructure Layer | v9.1.0 ARCHITECT Epoch**

---

## Overview

The **ECONOMY** module provides real-time cost attribution, budgeting, and marketplace signaling. It tracks compute, token, and API costs across all modules and agents, enabling fine-grained cost governance and ROI analysis.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| **Cost Tracking** | Per-request cost attribution | FREE |
| **Budget Alerts** | Threshold-based spend notifications | Builder |
| **Token Accounting** | LLM token usage tracking per actor | Builder |
| **Budget Governor** | Hard/soft spending limits | Pro |
| **ROI Analysis** | Cost-vs-value computation per pipeline | Pro |
| **Marketplace Signals** | Pricing signals for engine marketplace | Enterprise |

---

## Architecture

```
┌───────────────────────────────────┐
│         ECONOMY MODULE            │
├───────────────────────────────────┤
│  Cost Collector                   │
│  ├── Per-module cost hooks        │
│  ├── Provider rate cards          │
│  └── Real-time aggregation        │
├───────────────────────────────────┤
│  Budget Engine                    │
│  ├── Soft limits (warn)           │
│  ├── Hard limits (block)          │
│  └── Rollover / reset policies    │
├───────────────────────────────────┤
│  Analytics Engine                 │
│  ├── Cost breakdown dashboards    │
│  ├── Trend forecasting            │
│  └── ROI per pipeline/engine      │
└───────────────────────────────────┘
```

---

## SDK Usage

```typescript
import { substrate } from '@cmpsbl/sdk';

// Get current spend
const spend = await substrate.economy.currentSpend({
  period: 'today',
  groupBy: 'module'
});

// Set budget
await substrate.economy.setBudget({
  scope: 'agent:research-01',
  dailyLimit: 500, // cents
  action: 'warn' // or 'block'
});

// Get ROI for a pipeline
const roi = await substrate.economy.roi({
  pipeline: 'full-stack-evolution',
  period: '30d'
});
```

---

## Integration Points

| Module | Integration |
|--------|-------------|
| NEXUS | LLM provider cost tracking |
| CORTEX | Pipeline cost attribution |
| IDENTITY | Per-actor spend tracking |
| VISION | Cost dashboards and alerting |
| ACCESS | Subscription tier enforcement |

---

*CMPSBL® ECONOMY Module — v9.1.0 ARCHITECT Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
