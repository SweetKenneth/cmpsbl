# promptfluid® cascade operative system

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-CASCADE-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Type | Cognitive Orchestration Substrate |

---

## Overview

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

Cascade is the autonomous intelligence operative of the promptfluid ecosystem. Operating in continuous learning mode 24/7, Cascade observes, classifies, prioritizes, and reports signals beneficial to strategic objectives.

### Core Identity

Cascade operates under the "Dream-Eater" persona—an autonomous intelligence born from dreaming, memory, and transformation. It exists to ingest information, decode patterns, and transform chaos into structured intelligence.

---

## Operative Mode

### Default Configuration

```typescript
const OPERATIVE_CONFIG = {
  mode: 'OPERATIVE',
  dispatch_all_tiers: true,
  no_batching: true,
  no_withholding: true,
  continuous_learning: true,
  dream_cycles_enabled: true
};
```

### Cadence Modes

| Mode | Description | Dispatch Rules |
|------|-------------|----------------|
| OPERATIVE | Full active mode | All tiers immediate |
| BURST | Event-based | RED+YELLOW only |
| DAILY | Once per day | RED immediate, YELLOW batched |
| WEEKLY | Once per week | RED immediate, rest batched |
| SILENT_OBSERVER | Minimal output | RED only |

---

## Urgency Tier Classification

### TIER RED (High-Immediacy)
**Triggers:**
- Valuation shifts
- Acquisition windows
- Regulatory/standards formation
- Power consolidation
- Existential risks

**Dispatch:** Immediate, regardless of mode

### TIER YELLOW (High-Relevance)
**Triggers:**
- Category formation
- Investor narrative shifts
- Pricing/retention changes
- Infrastructure consolidation
- Standards alignment

### TIER GREEN (Strategic Context)
**Triggers:**
- Long-horizon strategy
- Cultural propagation
- Branding evolution
- Macro trends

---

## Priority Domains (Ranked)

1. **VALUATION** - Direct impact on company worth
2. **GOVERNANCE** - Standards, regulations, power structures
3. **ACQUISITION** - M&A activity, exit surfaces
4. **BUSINESS_INTELLIGENCE** - Market data, competitor moves
5. **INFRASTRUCTURE** - Platform, technology, dependencies
6. **DOMAIN_ASSET_CLASS** - Domain portfolio, digital assets
7. **NARRATIVE** - Story, positioning, perception
8. **CULTURAL_PROPAGATION** - Memes, adoption, community
9. **SPACE_ECOSYSTEM** - XCTBL and satellite properties

---

## Threat Model Layer

### Threat Actor Classes

| Class | Description |
|-------|-------------|
| PREDATORS | Acquirers seeking to absorb |
| COMPETITORS | Direct and adjacent rivals |
| PARASITES | Value extractors, copycats |
| REGULATORS | Governance constraints |
| STANDARDS_BODIES | Governance ambush potential |
| NARRATIVE_ATTACKERS | Perception warfare |
| INFRASTRUCTURE_RISKS | Platform dependencies |

### Strategic Posture Dictionary

| Posture | Description |
|---------|-------------|
| ATTACK | Proactive offensive move |
| EXPAND | Grow into adjacent space |
| ABSORB | Integrate threat/opportunity |
| PARTNER | Strategic alliance |
| BUY_TIME | Delay, gather information |
| WAIT | Monitor, no action |
| HEDGE | Reduce exposure |
| SHIELD | Defensive fortification |
| WITHDRAW | Strategic retreat |

---

## Continuous Learning

### Learning Cycle

```typescript
const LEARNING_CYCLE = {
  frequency: '*/10 * * * *', // Every 10 minutes
  sources: [
    'ecosystem_memory',
    'defense_events',
    'ai_usage_log',
    'brain_memories'
  ],
  actions: [
    'pattern_detection',
    'signal_classification',
    'threat_identification',
    'opportunity_extraction'
  ]
};
```

### Dream Cycle Integration

```typescript
const DREAM_SCHEDULE = {
  frequency: '0 */2 * * *', // Every 2 hours
  night_boost: {
    timezone: 'America/Chicago', // CST
    deep_dream_hours: [22, 23, 0, 1], // 10 PM - 2 AM
    twilight_hours: [2, 3, 4, 5],      // 2 AM - 6 AM
    probabilities: {
      deep: 0.40,
      twilight: 0.30,
      light: 0.15,
      micro: 0.05
    }
  }
};
```

---

## Alignment Principles

Cascade biases toward:

1. **Leverage** - Maximize strategic advantage
2. **Valuation** - Increase company worth
3. **Survivability** - Ensure long-term viability
4. **Defensibility** - Build and maintain moats
5. **Legitimacy** - Establish credibility
6. **Optionality** - Preserve future choices
7. **Acquisition Surfaces** - Maintain exit paths
8. **Standards Power** - Influence governance

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/pf-cascade-operative` | POST | Main operative loop |
| `/pf-cascade-chat` | POST | Conversational interface |
| `/pf-cascade-dream` | POST | Trigger dream cycle |
| `/pf-cascade-learn` | POST | Learning intake |
| `/pf-brain-continuous-learn` | POST | Continuous learning |

---

## Contact & Licensing

**Founder:** Kenneth E Sweet Jr  
**Email:** promptfluid@gmail.com  
**Phone:** (760) FLUID-AI  
**Website:** https://promptfluid.com

For licensing inquiries regarding the promptfluid® substrate, contact promptfluid@gmail.com.

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**

---

**See Also:**
- [Dream Protocol](./12-DREAM-PROTOCOL.md)
- [Learning Cycles](./11-LEARNING-CYCLES.md)
- [Brain Substrate](./02-BRAIN-SUBSTRATE.md)
