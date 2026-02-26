# GTM v3 — Artifact Capacity Model

**Clockless® — A Cognitive Reality System · powered by the CMPSBL Substrate**

---

## Executive Summary

GTM v3 replaces feature-based monetization with an **Artifact Slot Capacity** model. The full substrate runtime is unified — every user runs every module. Plans differ only in:

1. **Artifact slot capacity** — how many structured packs can be activated
2. **Memory depth** — standard, expanded, or dedicated partitions
3. **Deployment rights** — cloud-only vs. self-hosted (LNCHBL)
4. **Governance scope** — basic, advanced, or full authority

No module gating. No capability counts. No feature fragmentation.

---

## Monetization Logic

### Core Principle

> "Plans scale capacity, not capability."

The runtime is the same for everyone. What changes is how much composed functionality a user can activate at once.

### Tier Structure

| Plan | Price | Artifact Slots | Memory | Deployment | Governance |
|------|-------|---------------|--------|------------|------------|
| **Base** | $0/mo | 3 | Standard | Cloud only | Basic |
| **Professional** | $19/mo | 8 | Expanded | Cloud only | Advanced |
| **Enterprise** | $99/mo | Unlimited | Dedicated | Self-hosted (LNCHBL) | Full |

**Enterprise Custom** (sales-led): Custom slot capacity, dedicated instances, SOC2 compliance.

---

## Artifact Pack Philosophy

### What Is an Artifact Pack?

A structured, versioned bundle of composed internal components that activates a specific capability domain. Packs are the **only purchasable unit** on the public surface.

### Pack Rules

1. Each pack is **versioned** (v1.0, v1.1, etc.)
2. Each pack contains **composed internal components** (never raw engines or capabilities)
3. Each pack has a **defined use-case positioning** and documentation
4. Each pack requires **N artifact slots** to activate
5. Internal taxonomy is **never exposed** — no "Crown Jewel," "Meta-Engine," "Resolver Swarm," etc.

### Current Pack Catalog (8-12 maximum on public surface)

| Pack | Slots | Min Tier | Use Case |
|------|-------|----------|----------|
| Advanced Memory | 1 | Base | Long-running project context retention |
| Agent Composer | 2 | Base | Multi-agent workflow construction |
| System Observability | 1 | Base | Runtime health & execution visibility |
| Premium Templates | 1 | Base | Production-ready project scaffolds |
| Workflow Automation | 1 | Professional | Scheduled & event-driven pipelines |
| Cross-System Orchestration | 2 | Professional | Multi-module coordination |
| Deep Research | 1 | Professional | Automated research & synthesis |
| Self-Hosted Deployment | 3 | Enterprise | LNCHBL on-premise operation |
| Governance & Compliance | 2 | Enterprise | Audit, RBAC, compliance exports |
| Dedicated Memory Partitions | 2 | Enterprise | Isolated per-project memory domains |

---

## Baseline Technology Layer

### Definition

Baseline technology is the set of engines, pipelines, capabilities, and templates that ship with every plan. These items:

- Remain **fully operational** for all users
- Are **not displayed** as purchasable items
- Are marked with `visibility: 'baseline'` in the Quarry
- Include standard engines, common pipelines, utility capabilities, and base templates

### What Moves to Baseline

- All standard engines (31+ items currently in Free tier)
- Common pipeline resolvers
- Utility capabilities (read, compose, basic analysis)
- Base project templates

### Why

Prevents the Quarry from being flooded with low-density items. Keeps the public surface clean and focused on high-value artifact packs only.

---

## Quarry Governance Rules

### Public Surface

The Quarry's public-facing output is limited to:

1. Structured Artifact Packs (8-12 maximum)
2. Deployment rights artifacts
3. Governance extensions
4. Advanced observability packs

### Internal Surface

The full Quarry (`/admin/quarry`) retains all assets with complete scoring, tier assignments, and visibility controls. Admin-only access.

### Visibility States

| State | Meaning |
|-------|---------|
| `hidden` | Internal only. Not shown anywhere. |
| `baseline` | Operational for all users. Not displayed as purchasable. |
| `tier_exposed` | Visible in admin context. May inform pack composition. |
| `public_curated` | Surfaced in artifact pack definitions on /upgrade. |

---

## Upgrade Triggers

### Base → Professional

- User needs more than 3 artifact packs active simultaneously
- User requires automation or orchestration capabilities
- User needs expanded memory depth for larger projects
- User needs advanced governance scope

### Professional → Enterprise

- User requires self-hosted deployment
- User needs dedicated memory partitions
- User requires compliance/audit exports
- User needs full governance authority
- Organization-level workspace management

---

## Enterprise Expansion Path

1. **Enterprise Standard** ($99/mo) — Unlimited slots, LNCHBL, full governance
2. **Enterprise Custom** (sales-led) — Dedicated instances, custom compliance, SOC2, white-glove onboarding
3. **Enterprise Volume** (future) — Multi-tenant workspace management, cross-organization orchestration

---

## Internal Terminology Firewall

### Removed from Public UI

The following terms must **never** appear on public-facing surfaces:

- Crown Jewel / Crown Jewel Pipeline
- Meta-Engine
- Resolver Swarm
- Immunity Mesh
- Crystallized Pipeline
- Value Density Score
- Strategic Weight

### Retained in Code

All internal naming conventions remain in:

- Source code and type definitions
- Admin interfaces (`/admin/*`)
- Internal documentation
- Quarry asset records

---

## Route Architecture (unchanged)

| Route | Purpose |
|-------|---------|
| `/upgrade` | Single pricing & artifact capacity page |
| `/pricing` | Redirects to `/upgrade` |
| `/store` | Redirects to `/upgrade` |
| `/marketplace` | Redirects to `/upgrade` |
| `/engines` | Redirects to `/upgrade` |
| `/capabilities` | Redirects to `/upgrade` |
| `/admin/quarry` | Internal asset registry (admin only) |

All engine/template pages preserved as files. No deletion.

---

## Validation Criteria

- [ ] Baseline items removed from Quarry cards (visibility = 'baseline')
- [ ] Packs limited to 8-12 on public surface
- [ ] Runtime unified — no module gating in code
- [ ] Artifact slots correctly control pack activation
- [ ] /upgrade route simplified with capacity model
- [ ] Internal terminology not visible publicly
- [ ] GTM v3 documentation generated (this document)

---

## Rollback

If artifact slot capacity logic fails:

- Revert to static tier definitions in `/upgrade`
- Quarry data persists independently
- All original asset/engine/template pages remain intact as files
- Baseline technology continues operating regardless of billing state

---

*Clockless® — A Cognitive Reality System · powered by the CMPSBL Substrate*
