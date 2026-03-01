# GTM Strategy — 01 Phase Model & Tiered Access

**Classification:** Internal  
**Date:** 2026-03

---

## 1. The Four Phases

| Phase | Codename | Focus | Key Unlocks |
|-------|----------|-------|-------------|
| 1 | **The Proof** | Standalone products, free tier, core substrate | Public pages, free scans, DECODE, documentation |
| 2 | **Platform Whisper** | Marketplace, tiered subscriptions, licensing | Artifact Store, Capability Depot, Synergy Pipelines, Engine Marketplace, infrastructure licensing |
| 3 | **Ecosystem Flywheel** | Evolution API, Crown Jewel licensing, labs | Intent Mesh, Experimentation Lab, Clockless World Engine |
| 4 | **The OS** | Full ecosystem governance | System Intelligence Feed, System Integrity, full autonomous evolution |

---

## 2. Subscription Tiers

### Consumer Tiers (Substrate Access)

| Tier | Price | Product Tier | Depth Level |
|------|-------|-------------|-------------|
| **Free / Builder** | $0 | Builder | Standard — 1 namespace, no background optimization, low routing priority |
| **Creator** | $29/mo ($276/yr) | Operator | Expanded — 3 namespaces, background optimization, automation scheduling, normal routing |
| **Architect** | $79/mo ($756/yr) | Architect | Dedicated — 12 namespaces, highest routing priority, safe-evolution, export traces |
| **Enterprise** | Custom | Architect+ | Dedicated + custom SLAs, unlimited namespaces |

### Depth Caps (Not Feature Gates)

The unified runtime stays on for everyone. Tiers govern **how deep** subsystems operate, not which modules run. This creates natural upgrade pressure without disabling capabilities.

| Limit | Builder | Operator | Architect |
|-------|---------|----------|-----------|
| Memory Namespaces | 1 | 3 | 12 |
| Background Optimization | ✗ | ✓ | ✓ |
| Automation Scheduling | ✗ | ✓ | ✓ |
| NEXUS Routing Priority | Low | Normal | Highest |
| Safe-Evolution Access | ✗ | ✗ | ✓ |
| Export Trace Access | ✗ | ✗ | ✓ |
| Crystallized Asset Cap | 12 | 30 | 60 |
| Radio Minutes/Day | 5 | 30 | 60 |

---

## 3. Phase Gating Mechanism

Routes are gated via `src/config/gtm-phase.ts`. A single `CURRENT_PHASE` constant controls what's visible. Each gated route specifies:

- `unlocksAt` — the phase number required
- `waitlist` — whether to show a waitlist signup or just "coming soon"
- `teaser` — description shown on the gate page

Phase gate password for internal/beta access: configurable per deployment.

---

## 4. Phase 1 Live Routes

All proof-of-concept and standalone product routes are live in Phase 1, including:

- Landing, About, Contact, Privacy, Terms
- Auth, Pricing, Projects, OS Dashboard
- DECODE, Modules, Substrate, Documentation
- Blog, Changelog, Roadmap, Status
- Academy, Showcase, Use Cases
- Products (ENCODE, Composable Cognitives)
- Evolution Control Center, Scanner
- Dream Eater, Forge Catalog, Intelligence

---

© 2025–2026 PromptFluid®. All rights reserved.
