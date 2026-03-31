
# Roadmap: Vertical Ascension Packs (Agent-First)

## Architecture Decision: Hybrid Stacking

The 40-primitive Ascension stays untouched. **Vertical Packs** are additional 5-primitive passes that run *after* the main Ascension, discovering domain-specialized capabilities. First vertical: **Agent Forge**.

---

## Phase 1: Agent Forge Engine (Build)

**Goal:** Create the Reserve Primitive system and ship the first 5-primitive Agent vertical.

### 1A. Reserve Primitive Registry
- New file: `src/lib/ascension/reserve-registry.ts`
- Data model: `ReservePrimitive` (id, name, category, vertical, capabilities, affinity signals)
- Vertical registry: maps vertical slug → 5 reserve primitives
- First vertical `agent-forge` with 5 primitives:
  - **SENTINEL** — Behavioral threat detection, prompt injection defense
  - **SWARM** — Multi-agent coordination, task delegation
  - **THRIFT** — Cost-aware model routing, token budgets
  - **PERSONA** — Identity persistence, personality continuity across sessions
  - **ARBITER** — Conflict resolution between competing agent goals

### 1B. Vertical Collision Engine
- New file: `src/lib/ascension/vertical-collision.ts`
- Takes the main Ascension's 5 discoveries + runs them through the 5 reserve primitives
- Produces 5 *additional* specialized capabilities (stacked on top)
- Reuses existing CJPI scoring, chain-injection, and quality-gate infrastructure

### 1C. Ascension UI Integration
- Update `AscensionStepper.tsx` — add optional "Vertical Pack" step between Ascend and Export
- New component: `VerticalPackSelector.tsx` — shows available verticals with lock/unlock state
- Update `ExportPhase.tsx` — include vertical discoveries in export ZIP alongside base discoveries
- Update `CapabilityMarketplace.tsx` — separate section for vertical-specific bundles

### 1D. Export Augmentation
- Vertical discoveries get their own subfolder in the ZIP: `vertical/agent-forge/`
- Include vertical-specific README explaining what the 5 agent primitives discovered
- HTML docs generated for vertical discoveries using existing `html-artifact-generator.ts`

---

## Phase 2: Landing Page (Ship)

**Goal:** Dedicated conversion page for the Agent Forge vertical.

### 2A. Route & Page
- New page: `/agent-forge` — dedicated landing page
- Hero: "Turn Any Agent Into 5 Production Specialists"
- Sections:
  - The 5 agent primitives (SENTINEL, SWARM, THRIFT, PERSONA, ARBITER) with visual cards
  - Before/After comparison — generic agent → 5 specialized outputs
  - Live demo CTA → drives to Ascension flow with agent vertical pre-selected
  - Trust signals: link to `cmpsbl-daily-drop` repo, export verification instructions
  - Pricing: Architect tier includes Agent Forge

### 2B. Homepage Integration
- Add Agent Forge card to the existing Discovery section on `/explore`
- Route visitors from the dual-card CTA to `/agent-forge`

### 2C. SEO
- Update `sitemap.xml`, `robots.txt`, meta tags
- Add structured data for the product page

---

## Phase 3: Marketing ($250 Budget)

**Goal:** 10 paying customers from targeted developer ads.

### Budget Split
| Channel | Spend | Target |
|---------|-------|--------|
| Reddit (r/LocalLLaMA, r/AutoGPT) | $100 | Agent builders looking for defense + coordination |
| Twitter/X promoted posts | $100 | OpenClaw, LangChain, CrewAI communities |
| Dev.to sponsored post | $50 | Tutorial-style "I ran my agent through Ascension" |

### Ad Hook
> "Your agent does one thing. Ascension discovers five things it *could* do — defense, coordination, cost optimization, identity, arbitration. Zero AI. Pure structural discovery. Try it free at cmpsbl.com/agent-forge"

### Conversion Path
1. Ad → `/agent-forge` landing page (UTM tracked)
2. CTA → Ascension flow with Agent Forge pre-selected
3. Export → includes `cmpsbl-daily-drop` test instructions
4. Follow-up → support@cmpsbl.com in every export

### Tracking
- UTM parameters on all ad links
- Track landing page → Ascension start → export completion funnel

---

## Implementation Order

1. **Phase 1A-1B** — Reserve registry + vertical collision engine (core logic)
2. **Phase 1C-1D** — UI integration + export augmentation
3. **Phase 2** — Landing page + homepage integration + SEO
4. **Phase 3** — Ad copy, UTM links, launch

Estimated implementation: 3-4 turns for Phase 1, 1-2 turns for Phase 2, marketing copy in same turn as Phase 2.

---

## Future Verticals (After Agent Forge Proves the Model)

| Vertical | Primitives | Market |
|----------|-----------|--------|
| **DeFi Forge** | LEDGER, ORACLE, VAULT, COMPLIANCE, ARBITER | Smart contract / DeFi developers |
| **Security Forge** | SENTINEL, SHADOW, CLOAK, FORENSIC, HONEYPOT | AppSec teams |
| **IoT Forge** | PULSE, MESH, TELEMETRY, EDGE, FAILOVER | Embedded / edge developers |
| **Data Forge** | PIPELINE, SCHEMA, LINEAGE, QUALITY, ARCHIVE | Data engineers |

Each vertical is a new product line, new landing page, new ad campaign — all stacking on the same 40-primitive base.
