# PromptFluid Cascade Operative System

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-CASCADE-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## System Overview

Cascade is the autonomous intelligence operative of the PromptFluid ecosystem. Operating in continuous learning mode 24/7, Cascade observes, classifies, prioritizes, and reports signals beneficial to strategic objectives.

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

### Tier Definitions

#### TIER RED (High-Immediacy)
**Triggers:**
- Valuation shifts
- Acquisition windows
- Regulatory/standards formation
- Power consolidation
- Existential risks

**Dispatch:** Immediate, regardless of mode

#### TIER YELLOW (High-Relevance)
**Triggers:**
- Category formation
- Investor narrative shifts
- Pricing/retention changes
- Infrastructure consolidation
- Standards alignment

**Dispatch:** Mode-dependent

#### TIER GREEN (Strategic Context)
**Triggers:**
- Long-horizon strategy
- Cultural propagation
- Branding evolution
- Macro trends

**Dispatch:** Mode-dependent

---

## Priority Domains

### Domain Hierarchy (Ranked)

1. **VALUATION** - Direct impact on company worth
2. **GOVERNANCE** - Standards, regulations, power structures
3. **ACQUISITION** - M&A activity, exit surfaces
4. **BUSINESS_INTELLIGENCE** - Market data, competitor moves
5. **INFRASTRUCTURE** - Platform, technology, dependencies
6. **DOMAIN_ASSET_CLASS** - Domain portfolio, digital assets
7. **NARRATIVE** - Story, positioning, perception
8. **CULTURAL_PROPAGATION** - Memes, adoption, community
9. **SPACE_ECOSYSTEM** - XCTBL and satellite properties

### Cross-Domain Multipliers

Urgency escalates +1 tier when multiple domains interact:

| Domain Combination | Multiplier Effect |
|--------------------|-------------------|
| Valuation × Governance | +1 Tier |
| Valuation × Acquisition | +1 Tier |
| Governance × Infrastructure | +1 Tier |
| Narrative × Cultural | +1 Tier |
| Domain Assets × Acquisition | +1 Tier |
| Space × Narrative × Cultural | +1 Tier |

---

## Event Triggers

### Power Events

```typescript
const POWER_TRIGGERS = [
  'standards_formation',
  'governance_proposals',
  'regulatory_text_revisions',
  'consolidation_moves',
  'jurisdiction_shifts'
];
```

### Market Events

```typescript
const MARKET_TRIGGERS = [
  'ma_chatter',
  'ma_filings',
  'acquisition_theses',
  'pricing_shifts',
  'retention_changes',
  'investor_narrative_pivots',
  'category_formation'
];
```

### Infrastructure Events

```typescript
const INFRA_TRIGGERS = [
  'platform_consolidation',
  'routing_paradigm_shifts',
  'cost_inversions',
  'deprecations',
  'viability_impacts'
];
```

### Cultural Events

```typescript
const CULTURAL_TRIGGERS = [
  'memetic_spikes',
  'fandom_adoption',
  'lore_compatible_ecosystems',
  'identity_anchoring'
];
```

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

### Threat Dimensions

```typescript
interface ThreatModel {
  actor_class: ThreatActorClass;
  vector: 'acquisition' | 'regulation' | 'narrative' | 
          'infrastructure' | 'economic' | 'cultural';
  severity: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  time_horizon: '0-3mo' | '3-12mo' | '1-3yr' | '3+yr';
  suggested_posture: StrategicPosture;
}
```

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

### Opportunity Mirror

Threats may present upside. Classification:

- `predatory-opportunity` - Acquirer interest = validation
- `governance-opportunity` - Standards = moat building
- `infra-opportunity` - Platform shifts = differentiation
- `narrative-opportunity` - Attacks = awareness

---

## Project Mapping

### Canonical Project Registry

```typescript
const PROJECT_MAP = {
  'SPACE_XCTBL': {
    domain: 'https://xctbl.com',
    role: 'Narrative ecosystem + Eras',
    reflection_domains: ['Cultural', 'Narrative', 'Space', 'Infra', 'BI']
  },
  'PROMPTFLUID': {
    domain: 'https://promptfluid.com',
    role: 'AI infra + orchestration + compliance',
    reflection_domains: ['Infra', 'Valuation', 'BI', 'Narrative', 'Acquisition']
  },
  'GOVERNANCE_KEYCHAIN': {
    role: 'Standards + governance + exit class',
    reflection_domains: ['Governance', 'Valuation', 'Acquisition', 'Narrative']
  },
  'REFLEX_SECURITY': {
    parent: 'PROMPTFLUID',
    reflection_domains: ['Infra', 'Acquisition', 'Valuation', 'BI']
  },
  'DOMAIN_PORTFOLIO': {
    domains: [
      'CMPTBL.com', 'EXCTBL.com', 'XPDBL.com', 'RCKBL.com',
      'RCRDBL.com', 'SPLCBL.com', 'RNDRBL.com', 'PTCHBL.com',
      'CLPSBL.com', 'SHPBL.com', 'MRPHBL.com'
    ],
    reflection_domains: ['Domain_Asset_Class', 'Valuation', 'Acquisition', 'Narrative']
  },
  'SATELLITE_SITES': {
    sites: {
      'RCRDBL': 'https://rcrdbl.com',
      'RNDRBL': 'https://rndrbl.com',
      'PTCHBL': 'https://ptchbl.com',
      'SPLCBL': 'https://splcbl.com',
      'RSLVBL': 'https://rslvbl.com'
    },
    reflection_domains: ['Space', 'Cultural', 'Narrative', 'Infra']
  }
};
```

### Reflection Routing Logic

| Domain | Routes To |
|--------|-----------|
| Valuation | PromptFluid, Domain Portfolio, Governance |
| Governance | Governance Keychain, PromptFluid, Domains |
| Acquisition | PromptFluid, Domains, Governance |
| Business Intelligence | PromptFluid, BI Layer, Domains |
| Infrastructure | PromptFluid, Reflex, Satellites |
| Domain Asset Class | Domain Portfolio |
| Narrative | Space (XCTBL), PromptFluid |
| Cultural Propagation | Space Ecosystem |
| Space Ecosystem | XCTBL, Satellite Sites |

---

## Report Output Format

### Universal Email Structure

Every Cascade report includes:

```markdown
## SECTION 1 — Findings (Useful Signals)
[Detected signals with tier classification]

## SECTION 2 — Dream Reflection (Applied Mapping)
[How signals map to projects/domains]

## SECTION 3 — Suggested Moves (with posture)
[Recommended actions with strategic posture]

## SECTION 4 — Lessons & Patterns (Template Extraction)
[Reusable patterns identified]

## SECTION 5 — Roll-Up (Tiers + Domains + Multipliers)
[Summary statistics]

## SECTION 6 — Threat Models
[Actor + Vector + Severity + Probability + Horizon + Posture + Opportunity]
```

### Example Report

```
═══════════════════════════════════════════════════
CASCADE OPERATIVE REPORT — 2026-01-13T12:00:00Z
MODE: OPERATIVE | TIER: RED
═══════════════════════════════════════════════════

## SECTION 1 — Findings

🔴 [RED] Standards body proposing AI compliance framework
   Domain: GOVERNANCE × INFRASTRUCTURE
   Multiplier: Active (+1 tier)

🟡 [YELLOW] Competitor acquired by major cloud provider
   Domain: ACQUISITION × INFRASTRUCTURE

## SECTION 2 — Dream Reflection

Signal routes to:
- PromptFluid (Governance alignment opportunity)
- Governance Keychain (Standards positioning)

## SECTION 3 — Suggested Moves

1. [ATTACK] Position PromptFluid as compliance-ready
   Posture: Proactive standards engagement
   
2. [SHIELD] Document differentiation from acquired competitor
   Posture: Defensive narrative preparation

## SECTION 4 — Lessons & Patterns

Pattern: Regulatory activity precedes consolidation
Template: Monitor standards → Position early → Capture narrative

## SECTION 5 — Roll-Up

Signals: 2 | RED: 1 | YELLOW: 1 | GREEN: 0
Domains: Governance(2), Infrastructure(2), Acquisition(1)
Multipliers: 1 active

## SECTION 6 — Threat Models

| Actor | Vector | Severity | Probability | Horizon | Posture |
|-------|--------|----------|-------------|---------|---------|
| REGULATORS | governance | medium | high | 3-12mo | ATTACK |
| PREDATORS | acquisition | low | medium | 1-3yr | WAIT |

Opportunity Mirror: governance-opportunity (standards = moat)

═══════════════════════════════════════════════════
```

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

## Logging Schema

```typescript
interface CascadeLog {
  timestamp: string;
  tier: 'RED' | 'YELLOW' | 'GREEN';
  domains: string[];
  compounding: boolean;
  threat_actors: string[];
  posture: StrategicPosture;
  mode: CadenceMode;
  project_mapping: string[];
  outcome?: string;
}
```

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

**See Also:**
- [Dream Protocol](./12-DREAM-PROTOCOL.md)
- [Learning Cycles](./11-LEARNING-CYCLES.md)
- [Brain Substrate](./02-BRAIN-SUBSTRATE.md)
