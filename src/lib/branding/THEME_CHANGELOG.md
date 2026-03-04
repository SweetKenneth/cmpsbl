# CMPSBL Memory Stream — Theme Changelog

> **Purpose**: Track every theming change so you can understand what was modified, 
> revert specific changes, or re-theme the site with a different identity later.
>
> **How to re-theme**: Modify `src/lib/branding/theme-registry.ts` (visual + narrative tokens)
> and `src/lib/branding/memory-stream.ts` (copy constants). Components import from these files.

---

## Architecture Overview

### Centralized Theme Files
| File | Purpose |
|------|---------|
| `src/lib/branding/theme-registry.ts` | **Master theme registry** — all visual tokens, gradients, animations, terminal config, dashboard labels, marketing copy |
| `src/lib/branding/memory-stream.ts` | **Branding copy constants** — event names, CTAs, phase labels, pack descriptions |
| `src/index.css` | **CSS design tokens** — HSL color variables, font imports, base styles |
| `tailwind.config.ts` | **Tailwind tokens** — semantic color mappings, animations, font families |

### Terminology Rules
| Old Term | New Term | Context |
|----------|----------|---------|
| Module | System / Engine / Capability | All public surfaces |
| Artifact | Crystallized Pipeline | User-facing references |
| Foundry | Memory Stream | The discovery/crystallization experience |
| Mining | Crystallization | The action of producing pipelines |
| Crown Jewel | Apex Discovery | Highest-tier results |
| Artifact Pack | Pipeline Pack | Capability bundles |
| Artifact Slot | Pipeline Slot | Capacity units |

---

## Change Log

### Wave 1 — Initial Memory Stream Theming
**Date**: 2026-03-04  
**Scope**: Core identity + dashboard + terminal

#### Files Modified:
- `src/components/substrate-os/OSHeader.tsx` — Brand name → "Memory Stream", subtitle → "Signal → Silicon"
- `src/components/substrate-os/terminal/TerminalBootScreen.ts` — Boot ASCII → "CMPSBL® MEMORY STREAM", stats → "Memory Stream Active"
- `src/components/substrate-os/EnhancedTerminal.tsx` — Prompt paths → `stream://memory.crystallize` and `stream://memory-terminal`
- `src/components/substrate-os/dashboard/DashboardMetricsHero.tsx` — Labels → "Memory Stream Constellation", status → "STREAM ACTIVE"
- `src/pages/SubstrateOS.tsx` — Sidebar brand, SEO metadata → "Memory Stream — Command Center"
- `src/pages/Upgrade.tsx` — "Artifact Capacity" → "Memory Stream Capacity", "Artifact Packs" → "Pipeline Packs"

### Wave 2 — Dashboard Panels + Home Sections
**Date**: 2026-03-04  
**Scope**: Remaining dashboard panels + homepage marketing sections

#### Files Modified:
- `src/components/substrate-os/panels/SecurityPanel.tsx` — "Security Center" → "Stream Security"
- `src/components/substrate-os/dashboard/MatrixIntegrityPanel.tsx` — "Matrix Integrity" → "Stream Integrity"
- `src/components/substrate-os/dashboard/BudgetGovernancePanel.tsx` — → "Stream Budget Governance"
- `src/components/substrate-os/dashboard/SlotCapacityMeter.tsx` — "Artifact Slots" → "Pipeline Slots", "ALL SLOTS CRYSTALLIZED"
- `src/components/substrate-os/dashboard/ModuleControlCard.tsx` — Label updates
- `src/components/home/LiveStatsBar.tsx` — "Brain Events" → "Stream Events", "Memories Stored" → "Crystallized"
- `src/components/home/EnginesCTA.tsx` — "Sealed runtimes crystallized from the Memory Stream"
- `src/components/home/SocialProof.tsx` — Stream-focused testimonials
- `src/components/home/BuiltForSection.tsx` — "Crystallize Your Signal", "packages" → "pipeline packs"
- `src/components/substrate-os/terminal/TerminalTypes.ts` — All personality messages → stream terminology
- `src/pages/StartHere.tsx` — Narrative → Memory Stream continuous substrate
- `src/pages/Status.tsx` — "Memory Stream Status", SEO metadata

### Wave 3 — Documentation + Investor Materials
**Date**: 2026-03-04  
**Scope**: Downloadable docs, dev docs, investor deck

#### Files Created:
- `src/lib/user-guide-generator.ts` — Themed HTML user guide covering crystallization, CJPI scoring, 38-node architecture

#### Files Modified:
- `src/lib/investor-deck-generator.ts` — "Signal → Silicon" narrative, 14 world firsts, Silicon Endgame
- `src/pages/InvestorsPublic.tsx` — "Download User Guide" action, stream metrics
- `src/pages/Documentation.tsx` — "Memory Stream Docs", BYOK model emphasis

### Wave 4 — Theme Registry + Continued Theming
**Date**: 2026-03-04  
**Scope**: Centralized theme system, remaining components

#### Files Created:
- `src/lib/branding/theme-registry.ts` — **Master theme registry** with 6 sections: Narrative, Visual, Animation, Terminal, Dashboard, Marketing
- `src/lib/branding/THEME_CHANGELOG.md` — This changelog document

#### Files Modified:
- `src/components/substrate-os/panels/GovernorPanel.tsx` — Stream-themed header copy
- `src/components/substrate-os/panels/IntentPanel.tsx` — "INTENT Stream" branding
- `src/components/substrate-os/dashboard/QuickActionsPanel.tsx` — Already themed (stream controls)
- `src/components/substrate-os/dashboard/NexusOptimizerWidget.tsx` — Already uses stream language
- `src/components/substrate-os/dashboard/MatrixBreakerMap.tsx` — "Stream Integrity Map"
- `src/components/substrate-os/dashboard/OnboardingFlow.tsx` — "Pipeline Slots" terminology
- `src/components/home/WhySubstrate.tsx` — "9 Systems" badge, "The Stream" title
- `src/components/home/DifferentiationSection.tsx` — "Intelligence That Crystallizes"
- `src/components/home/GovernanceSignal.tsx` — "Stream Governance"
- `src/components/home/UseCaseShowcase.tsx` — "Memory Stream Substrate" references
- `src/components/home/EvolutionCTA.tsx` — Already uses stream language
- `src/components/home/IndustryShowcase.tsx` — "One Substrate" section
- `src/components/home/AgentsSection.tsx` — Already uses sealed runtime language
- `src/components/home/ArtifactPacksSection.tsx` — Already imports from memory-stream.ts constants

---

## How to Re-Theme

### Quick Theme Change (copy only)
1. Edit `src/lib/branding/memory-stream.ts` — change event names, CTAs, descriptions
2. Edit `src/lib/branding/theme-registry.ts` → `NARRATIVE` section — change brand name, tagline, terminology

### Full Visual Re-Theme
1. Edit `src/lib/branding/theme-registry.ts` → `VISUAL` section — change gradients, status colors, tier colors
2. Edit `src/index.css` — change HSL color variables for `--primary`, `--neon-*`, etc.
3. Edit `tailwind.config.ts` — update animation keyframes if needed

### Terminal Re-Theme
1. Edit `src/lib/branding/theme-registry.ts` → `TERMINAL` section
2. Edit `src/components/substrate-os/terminal/TerminalBootScreen.ts` — ASCII art
3. Edit `src/components/substrate-os/terminal/TerminalTypes.ts` — personality messages

### Dashboard Re-Theme
1. Edit `src/lib/branding/theme-registry.ts` → `DASHBOARD` section — panel headers, KPI labels
2. Individual panel files in `src/components/substrate-os/dashboard/` and `src/components/substrate-os/panels/`

---

## Components Still Using Hardcoded Copy (candidates for registry migration)
- `src/components/home/TechShowcase.tsx` — Code examples use hardcoded `cmpsbl.*` API calls
- `src/components/home/AgentsSection.tsx` — Agent names/descriptions from separate agent data file
- `src/components/home/IntegrationBadges.tsx` — Provider names (OpenAI, Anthropic, etc.) — these are factual, not themed
- `src/pages/` — Many pages have inline copy that could be centralized if full re-theming is planned
