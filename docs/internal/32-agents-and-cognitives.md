# 32 — Agents & Cognitives Marketplace

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

The substrate provides a catalog of 20 Agents (Cognitives) — sealed AI runtime instances with fixed Crown Jewel power sets and autonomous improvement via DREAM Synthesis. Agents are sold through the marketplace with tiered pricing.

## 2. Agent Catalog (20 Agents)

### 2.1 Cognitive Synthesis

| Agent | Tier | Price | Powers |
|-------|------|-------|--------|
| HYBRID | Free | $0 | Multi-modal reasoning, adaptive context |
| EDUCATOR | Free | $0 | Curriculum design, knowledge scaffolding |
| MEMORY | Flagship | $129 | Persistent recall, knowledge graph, temporal memory |

### 2.2 Sovereign Defense

| Agent | Tier | Price | Powers |
|-------|------|-------|--------|
| GUARDIAN | Flagship | $129 | Threat detection, compliance gating, anomaly response |
| SECURITY | Elite | $159 | Full-spectrum security analysis, penetration testing, audit |

### 2.3 Structural Logic

| Agent | Tier | Price | Powers |
|-------|------|-------|--------|
| CODING | Elite | $159 | Code generation, refactoring, architecture analysis, test generation, debugging |
| ANALYST | Elite | $159 | Data analysis, pattern recognition, forecasting, visualization, reporting |
| ROUTER | Flagship | $129 | Request routing, load balancing, provider selection |

### 2.4 Creative Synthesis

| Agent | Tier | Price | Powers |
|-------|------|-------|--------|
| WRITER | Free | $0 | Content generation, editing, style adaptation |

### 2.5 Operational Logic

(Remaining agents across Starter ($79) and Professional ($129) tiers)

## 3. Sealed Runtime Architecture

### 3.1 What "Sealed" Means

Each agent operates as an isolated runtime:

| Property | Description |
|----------|-------------|
| Source-blocked | Agent source code is never exposed to users |
| Memory-isolated | Each agent has its own memory space — no cross-agent leakage |
| Version-minted | Unique version ID minted at purchase, capturing learned state |
| Power-locked | Crown Jewel powers are fixed at purchase — cannot be modified |
| DREAM-capable | Universal DREAM Synthesis ability for autonomous self-improvement |

### 3.2 Crown Jewel Powers

Each agent has 3–5 Crown Jewel powers:

```
Agent = {
  powers: [CrownJewel, CrownJewel, CrownJewel],  // 3-5 per agent
  dream: DREAMSynthesis,  // Universal — all agents have this
  memory: IsolatedMemorySpace,
  version: MintedVersionId,
}
```

Powers are drawn from the S-Tier vault but locked to the specific agent configuration.

### 3.3 DREAM Synthesis

All agents share the universal DREAM Synthesis capability:
- Runs during idle periods (nocturne cycle)
- Analyzes past interactions for improvement opportunities
- Proposes behavioral refinements
- Self-applies low-risk improvements (governed by SEBA constraints)
- High-risk improvements require governor approval

## 4. Pricing Model

| Tier | Price | Powers | Agents |
|------|-------|--------|--------|
| Free | $0 | 3 | HYBRID, EDUCATOR, WRITER |
| Starter | $79 | 3 | Various operational agents |
| Professional | $129 | 3–4 | MEMORY, GUARDIAN, ROUTER |
| Elite | $159 | 5 | CODING, ANALYST, SECURITY |

### 4.1 Purchase Flow

1. User selects agent in marketplace
2. Stripe checkout session created (`agency_purchases` table)
3. On payment confirmation:
   a. Unique version ID minted
   b. Agent runtime provisioned
   c. Memory space allocated
   d. Powers activated from S-Tier vault
   e. Onboarding flow initiated

### 4.2 Additional Cognitives

Users can purchase additional cognitives beyond the base team:
- `additional_cognitives` count tracked on purchase
- `additional_price_cents` per extra cognitive
- Team size scales agency capability

## 5. Marketplace UI

Agent cards in the marketplace display:
- 🔒 **SEALED** badge (source-blocked indicator)
- Power list with Crown Jewel badges
- Tier and pricing
- Agent category
- Purchase CTA

## 6. Data Model

| Table | Purpose |
|-------|---------|
| `cognitive_registry` | All available agent definitions |
| `agency_members` | Agent instances within agencies |
| `agent_competency` | Per-agent skill tracking and competency scores |
| `agency_purchases` | Purchase records with Stripe integration |
| `agency_templates` | Pre-configured agency team templates |

## 7. Security

- Agent source code is never exposed in any API response
- Memory isolation prevents cross-agent data access
- Version minting creates an immutable record of the agent's state at purchase
- All agent interactions are audit-logged

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial Agents & Cognitives documentation — v13.1.0 |

---

© 2025–2026 PromptFluid®. Confidential.
