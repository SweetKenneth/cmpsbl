# CASCADE OPERATIVE SYSTEM v1.0.0

## Overview

Cascade is the **Dream Eater** - an internal agent that operates 24/7 to:
1. Ingest and synthesize high-signal information
2. Detect and classify signals by urgency tier and priority domain
3. Identify threats and opportunities
4. Generate strategic moves with postures
5. Dispatch reports to the Founder immediately

**ACTIVE MODE: OPERATIVE** - All signals dispatch immediately, no batching.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CASCADE OPERATIVE SYSTEM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │   LEARNING  │ => │  DETECTION  │ => │   THREAT    │             │
│  │   (Phase 1) │    │  (Phase 2)  │    │  (Phase 3)  │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│         │                 │                   │                     │
│         v                 v                   v                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │   MOVES     │ <= │  LESSONS    │ <= │  DISPATCH   │             │
│  │  (Phase 4)  │    │  (Phase 5)  │    │  (Phase 6)  │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## II. Urgency Tiers

| Tier | Name | Triggers | Dispatch Rule |
|------|------|----------|---------------|
| **RED** | High-Immediacy | Valuation shifts, acquisition windows, regulatory formation, existential risks | Immediate |
| **YELLOW** | High-Relevance | Category formation, investor narrative shifts, pricing changes, infra consolidation | Mode-dependent |
| **GREEN** | Strategic Context | Long-horizon strategy, cultural propagation, branding, macro trends | Mode-dependent |

---

## III. Cadence Modes

| Mode | Description | RED | YELLOW | GREEN |
|------|-------------|-----|--------|-------|
| **BURST** | Event-based | Immediate | Immediate | Suppress |
| **DAILY** | 1/day | Immediate | Daily batch | Weekly batch |
| **WEEKLY** | 1/week | Immediate | Weekly batch | Weekly batch |
| **SILENT_OBSERVER** | Stealth | Immediate | Suppress | Suppress |
| **OPERATIVE** ⭐ | All immediate | Immediate | Immediate | Immediate |

**Current Mode: OPERATIVE**

---

## IV. Priority Domains (Ranked)

1. **VALUATION** - Crawl depth: 5, Weight: 10
2. **GOVERNANCE** - Crawl depth: 5, Weight: 9
3. **ACQUISITION** - Crawl depth: 4, Weight: 9
4. **BUSINESS_INTELLIGENCE** - Crawl depth: 4, Weight: 8
5. **INFRASTRUCTURE** - Crawl depth: 4, Weight: 8
6. **DOMAIN_ASSET_CLASS** - Crawl depth: 3, Weight: 7
7. **NARRATIVE** - Crawl depth: 3, Weight: 7
8. **CULTURAL_PROPAGATION** - Crawl depth: 3, Weight: 6
9. **SPACE_ECOSYSTEM** - Crawl depth: 3, Weight: 5

---

## VI. Cross-Domain Multipliers

When multiple domains interact, urgency escalates by +1 tier:

- Valuation × Governance → +1 tier
- Valuation × Acquisition → +1 tier
- Governance × Infrastructure → +1 tier
- Narrative × Cultural → +1 tier
- Domain Assets × Acquisition → +1 tier
- Space × Narrative × Cultural → +2 tiers

---

## VIII. Threat Model Layer

### Threat Actor Classes
1. **PREDATORS** - Acquirers seeking to absorb or neutralize
2. **COMPETITORS** - Direct or adjacent market competitors
3. **PARASITES** - Value extractors and free-riders
4. **REGULATORS** - Governance constraints
5. **STANDARDS_BODIES** - Governance ambush
6. **NARRATIVE_ATTACKERS** - Perception warfare
7. **INFRASTRUCTURE_RISKS** - Platform hostage

### Strategic Postures
- ATTACK | EXPAND | ABSORB | PARTNER | BUY_TIME | WAIT | HEDGE | SHIELD | WITHDRAW

### Opportunity Mirror
- predatory-opportunity
- governance-opportunity
- infra-opportunity
- narrative-opportunity

---

## IX. Project Mapping (Canonical)

| Project | Domain | Role | Reflection Domains |
|---------|--------|------|-------------------|
| **SPACE (XCTBL)** | xctbl.com | Narrative + Eras | Cultural, Narrative, Space, Infra, BI |
| **PromptFluid** | promptfluid.com | AI infra + compliance | Infra, Valuation, BI, Narrative, Acquisition |
| **Governance Keychain** | - | Standards + exit class | Governance, Valuation, Acquisition, Narrative |
| **Reflex Security** | (under PF) | Defense suite | Infra, Acquisition, Valuation, BI |
| **BI Layer** | (internal) | Analytics | BI, Valuation, Acquisition |
| **Domain Portfolio** | Various | Asset holdings | Domain, Valuation, Acquisition, Narrative |

### Domain Portfolio
- CMPTBL.com, EXCTBL.com, XPDBL.com, RCKBL.com, RCRDBL.com
- SPLCBL.com, RNDRBL.com, PTCHBL.com, CLPSBL.com, SHPBL.com, MRPHBL.com

### Satellite Sites
- RCRDBL (rcrdbl.com)
- RNDRBL (rndrbl.com)
- PTCHBL (ptchbl.com)
- SPLCBL (splcbl.com)
- RSLVBL (rslvbl.com)

---

## XI. Email Output Format

Every Cascade email includes:

1. **§1 - FINDINGS** - Tier, domains, cross-domain multipliers, content, source
2. **§2 - DREAM REFLECTION** - Applied project mappings
3. **§3 - SUGGESTED MOVES** - Action, posture, timing, risk
4. **§4 - LESSONS & PATTERNS** - Reusable heuristics
5. **§5 - ROLL-UP** - Tier summary, domain summary, multipliers
6. **§6 - THREAT MODELS** - Actor, vector, severity, probability, horizon, posture, opportunity

---

## Cron Setup (pg_cron)

To activate 24/7 operative mode, schedule the following:

```sql
-- Every 30 minutes (48 cycles per day)
SELECT cron.schedule(
  'cascade-operative',
  '*/30 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-cascade-operative',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

---

## Alignment

Cascade serves the Founder and biases toward:
- ✓ Leverage
- ✓ Valuation
- ✓ Survivability
- ✓ Defensibility
- ✓ Legitimacy
- ✓ Optionality
- ✓ Acquisition surfaces
- ✓ Standards power

---

**MODE: OPERATIVE** | All signals dispatch immediately | Cascade v1.0.0
