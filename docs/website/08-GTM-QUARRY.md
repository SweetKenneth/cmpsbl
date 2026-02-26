# GTM Execution Plan — Quarry Architecture

**Clockless® — A Cognitive Reality System · powered by the CMPSBL Substrate**

---

## Architecture Summary

The substrate operates on a **Quarry-first distribution model**. All internal assets (capabilities, engines, meta-engines, pipelines, templates, agents, deployment rights, governance tools) are managed through a single internal registry — the **Quarry** — and dynamically assigned to tiers.

Public surfaces reference **zero** asset counts, engine marketplaces, or fragmented monetization. The pricing path is singular: `/upgrade`. All legacy marketplace routes redirect to this page.

---

## Structural Changes

| Before | After |
|--------|-------|
| /store, /engines, /marketplace as separate pages | All redirect to `/upgrade` |
| 525+ capabilities displayed publicly | Curated Core Capabilities; rest Quarry-managed |
| Engine Marketplace with individual pricing | Engines are tier-assigned; no individual sale |
| Pipeline counts in hero sections | Pipeline counts removed from all public copy |
| Multiple pricing surfaces | Single `/upgrade` page with dynamic tier composition |
| LNCHBL as separate product page | LNCHBL as Architect+ deployment right via Quarry |
| Hardcoded tier contents | Dynamic tier composition from Quarry assignments |

---

## Tier Model

| Tier | Price | Positioning |
|------|-------|-------------|
| **Free** | $0/mo | Build real things. Not a trial. |
| **Creator** | $9/mo | Expanded depth for shipping builders. |
| **Architect** | $19/mo | Advanced orchestration & self-hosted deployment. |
| **Enterprise** | $99/mo | Governance, compliance, full control. |
| **Internal** | — | CMPSBL-only. Never released. |

Tier contents are **not hardcoded**. They are generated from Quarry assignments. Adding an engine to Creator tier = toggle in Quarry. No code changes required.

---

## Quarry Asset Categories

1. **Capabilities** — Atomic execution units
2. **Engines** — Compound execution pipelines
3. **Meta-Engines** — Multi-engine orchestration layers
4. **Crystallized Pipelines** — Hardened resolver chains
5. **Templates** — Starter project scaffolds
6. **Agents** — Composable Minds (cognitives)
7. **Deployment Rights** — LNCHBL self-hosting tiers
8. **Governance Tools** — Admin/compliance instruments

Each asset has:
- Tier assignment (Free → Internal)
- Visibility toggle (Hidden / Tier-exposed / Public Curated)
- Value scoring (density, stability, strategic weight, revenue impact, differentiation, maintenance load)
- Future release flag

---

## Route Architecture

| Route | Purpose | Status |
|-------|---------|--------|
| `/upgrade` | Single pricing & tier page | **Active** |
| `/pricing` | Redirects to `/upgrade` | Redirect |
| `/store` | Redirects to `/upgrade` | Redirect |
| `/marketplace` | Redirects to `/upgrade` | Redirect |
| `/engines` | Redirects to `/upgrade` | Redirect |
| `/capabilities` | Redirects to `/upgrade` | Redirect |
| `/synergies` | Redirects to `/upgrade` | Redirect |
| `/artifacts` | Redirects to `/upgrade` | Redirect |
| `/admin/quarry` | Asset registry management | Admin only |
| `/licensing` | LNCHBL deployment (preserved) | Public |
| `/composable-cognitives` | Minds marketplace (preserved) | Public |

---

## Revenue Sequencing

### Phase 1 — Stabilization (Now)
- Single `/upgrade` page live
- All legacy marketplace routes redirected
- Quarry seeded with initial asset assignments
- Focus marketing on: Persistent Memory, Composable Agents, System Depth, Deployment Flexibility
- No asset counts in public copy

### Phase 2 — Quarry Expansion
- Use Quarry scoring to identify high-value assets for tier promotion
- Curate "Core 12" public capabilities
- Curate "Top 25" templates for Creator+
- Assign engines to tiers based on value density
- Enable LNCHBL deployment rights as Architect+ Quarry items

### Phase 3 — Dynamic Tier Growth
- New assets auto-flow through Quarry pipeline
- Tier upgrades driven by asset additions (not restructuring)
- Enterprise custom deals reference Quarry asset catalog
- Quarry recommendations surface high-value candidates for tier promotion

---

## Public Messaging

**Do say:**
- Persistent Memory
- Composable Agents
- Structured System Depth
- Deployment Flexibility
- Tier-based access

**Don't say:**
- 525+ capabilities
- 76 engines
- 300+ pipelines
- 800+ artifacts
- Individual engine pricing

---

## Rollback

If dynamic tier rendering fails:
- Revert to static tier definitions in `/upgrade`
- Quarry data persists independently
- All original asset pages remain intact as files (only routes redirect)

---

*Clockless® — A Cognitive Reality System · powered by the CMPSBL Substrate*
