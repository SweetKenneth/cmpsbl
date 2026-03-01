# GTM Strategy — 03 Evolution, Agents & Template Generator

**Classification:** Internal  
**Date:** 2026-03

---

## 1. Evolution Bundling

Evolution is **not** a standalone billing product. It is bundled into the core 3-tier substrate model to simplify the offering and reduce purchase friction.

### Tier Access Map

| Feature | Free / Builder | Creator ($29) | Architect ($79) |
|---------|---------------|---------------|-----------------|
| Quick Scans | ✓ | ✓ | ✓ |
| Dry-Run Preview | ✓ | ✓ | ✓ |
| Deep Scans | ✗ | ✓ | ✓ |
| Rollback / Snapshots | ✗ | ✓ | ✓ |
| Agent Connect | ✗ | ✓ | ✓ |
| False Positive Feedback | ✗ | ✓ | ✓ |
| Forensic Scans | ✗ | ✗ | ✓ |
| Autonomous Evolution | ✗ | ✗ | ✓ (unlimited) |
| Safe-Evolution Controls | ✗ | ✗ | ✓ |

### Active Interfaces

- `/evolution` — Evolution Control Center (dashboard for runs, snapshots, dry-runs, feedback)
- `/scanner` — Scanner Info page (public-facing scanner product description)

Both remain first-class citizen routes in Phase 1.

---

## 2. Agents (Composable Cognitives)

Agents are pre-configured cognitive assemblies that combine multiple substrate modules into task-specific units. They are sold as **one-time purchase packs** with activation slot management.

### Agent Architecture

- Each agent is a **template** defining which modules to activate and how to wire them
- Agents operate within the user's substrate instance (not separate infrastructure)
- Agent performance is governed by the user's subscription tier depth caps
- Agencies (groups of agents) support shared DREAM pools and collaborative learning

### Agent GTM Position

| Aspect | Strategy |
|--------|----------|
| Purchase model | One-time buy, not subscription |
| Slot management | Tier-based activation limits |
| Marketplace | Phase 2 — curated catalog of community + first-party agents |
| Custom agents | Creator+ tiers can configure custom agent assemblies |

---

## 3. Template Generator

The Template Generator is the substrate's **configuration-as-product** engine. It allows users to:

1. **Select a use case** from a curated catalog
2. **Auto-configure** the substrate modules, routing weights, and depth settings
3. **Generate a deployable template** that can be shared, sold, or forked

### Template Types

| Type | Description | Distribution |
|------|-------------|-------------|
| **Starter Templates** | Pre-built configurations for common use cases | Free with any tier |
| **Pro Templates** | Advanced multi-module orchestrations | Creator+ |
| **Community Templates** | User-created configurations shared via marketplace | Phase 2 |
| **Enterprise Templates** | Custom-built for specific organizational workflows | Enterprise tier |

### Template Revenue

- First-party templates: included in subscription
- Community templates: revenue-share marketplace (Phase 2)
- Enterprise templates: custom consulting engagement

---

## 4. Cross-Product Synergy

```
┌─────────────────────────────────────────────┐
│              SUBSTRATE (Tier)                │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Evolution│  │  Agents  │  │ Templates │  │
│  │ (bundled)│  │ (packs)  │  │ (configs) │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       │             │              │         │
│       ▼             ▼              ▼         │
│  ┌──────────────────────────────────────┐    │
│  │     Depth Caps (tier-governed)       │    │
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Standalone Clones      │
│  (NEXUS, ENCODE, etc.)  │
│  Independent products   │
└─────────────────────────┘
```

All three layers (Evolution, Agents, Templates) operate within the same depth-cap system. Upgrading your tier deepens everything simultaneously — no separate purchases for individual feature unlocks.

---

© 2025–2026 PromptFluid®. All rights reserved.
