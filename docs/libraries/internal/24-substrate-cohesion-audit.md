# Substrate Cohesion Audit

**Classification:** 🔒 GOVERNOR EYES ONLY
**Last updated:** April 2026
**Purpose:** Single source of truth for what's alive, dormant, theater, or
slated for removal across the substrate's database surface (264 tables).
Pairs with the Ascension V2 roadmap (`docs/libraries/roadmaps/ascension-v2.md`).

---

## §1. Canonical Matrix (Frozen)

40 Primitives — 12 Organs · 12 Layers · 8 Engines · 8 Agents.
Authoritative list: `docs/libraries/internal/15-primitive-specifications.md`
and `src/lib/ascension-v2/canonical-primitives.ts`.

**Terminology corrections applied this audit:**
- Clarity ≠ IMMUNITY. **Clarity = CMPTBL = INCLUSIVE.**
- Cognitives ≠ Agents. **CMPSBL Cognitives** is the original term (pre-"Agent"
  era); used by the Forge / Agency subsystem.
- MODERNIZER → EVOLVE → **EVOLUTION** (current). Also briefly "EVOLUTION Mesh."
- "Modules" / "Module Registry" → legacy term for the **Primitive Matrix**.

---

## §1.5 Unclassified Inventory — Subsystem Sweep

The following 20 subsystems were surfaced by a full `information_schema` sweep
and classified row-by-row with the Governor. Status legend:

- 🟢 **alive** — actively writing/reading, owned, in production
- 🟡 **dormant** — exists, low/no activity, decision pending
- 🔴 **theater** — scaffolding, never mattered, slated for removal
- ⚙️ **migrate** — signal worth preserving, fold into a primitive
- ❓ **undecided** — Governor decision pending

### Group 1 — Big-data subsystems

| # | Subsystem | Owner | Status | Notes |
|---|-----------|-------|--------|-------|
| 1 | **VAULT** (`vault_promotions` 11,165 · `pipeline_vault` 214) | Discovery pipeline (no single primitive — it is the graduation table) | 🟢 alive | Original S-Tier vault / discovery engine output sink |
| 2 | **AUTOBLOG** (`autoblog_*`, `auto_blog_posts`) | Standalone subsystem (peer to primitives) | 🟢 alive | Live & publishing; one of the strongest auto-blog systems built — thinks about what it posts |
| 3 | **LEARNING** (`learning_cycles` 483, `learning_*`) | BRAIN (after migration) | ⚙️ migrate | Cascade-era debris. Migrate signal → BRAIN as edges / knowledge crystals, then deprecate tables |
| 4 | **COMPILER** (`compiler_weights` 129, `compiled_products` 10) | Standalone — Autonomous Product Compiler | 🟢 alive | Feeds marketplace.cmpsbl.com. Spec: `mem://architecture/product/autonomous-product-compiler-v1-0-0-spec` |
| 5 | **MUTATION** (`mutation_runs` 27) | EVOLUTION | ⚙️ migrate | Legacy MODERNIZER → EVOLVE → EVOLUTION. Same engine, old name. Fold in or rename |

### Group 2 — Governance & registry

| # | Subsystem | Owner | Status | Notes |
|---|-----------|-------|--------|-------|
| 6 | **LEX REGISTRY** (`lex_registry`) | LEX | 🟢 alive | Governs Mana = attachment/deploy portion of Ascension V2 (Patent #2). Ascension collision = Patent #1 |
| 7 | **GOVERNANCE TRANSITION** (`governance_transition_log`) | LEX (tentative) | 🟡 dormant | Likely belongs to LEX; verify on next pass |
| 8 | **MODULE REGISTRY** (`module_registry`) | n/a | 🔴 theater | Legacy term for the current Primitive Matrix. Rename or deprecate — not a separate subsystem |
| 9 | **INTEGRITY FINDINGS** (`integrity_findings`) | n/a | 🔴 theater | Old ecosystem module (~1yr old, possibly old INCLUSIVE). Remove |
| 10 | **STUDIO** (`studio_*` if any) | n/a | 🔴 theater | Old PromptFluid website-converter idea. Never mattered. Delete |

### Group 3 — Developer / marketplace / runtime

| # | Subsystem | Owner | Status | Notes |
|---|-----------|-------|--------|-------|
| 11 | **DEVELOPER stack** (`developer_skill_tree`, `developer_certifications`) | Developer Academy (CMPSBL learning hub) | ❓ undecided | Delete or resurface. Possibly precursor to XCTBL Dev Playground (`mem://architecture/xctbl/dev-playground-future`) |
| 12 | **MARKETPLACE** (`marketplace_*`) | Standalone subsystem | 🟢 alive | marketplace.cmpsbl.com is live |
| 13 | **COGNITIVE REGISTRY** (`cognitive_registry`, `agency_members.cognitive_id`) | Forge / Agency subsystem | 🟢 alive | **CMPSBL Cognitives** — pre-"Agent" terminology. Cognitives ≠ Agents. Keep terminology distinct in all docs |
| 14 | **CONTROL PLANE** (`control_plane_state`) | Governor control surface (standalone) | 🟢 alive | control.cmpsbl.com — central hub for monitoring vertical substrates |
| 15 | **RESILIENCE** (`resilience_ledger`, `restoration_sessions`) | n/a | 🔴 theater | Outdated. Deprecate / remove |

### Group 4 — Brain extensions / PF legacy / TSAC

| # | Subsystem | Owner | Status | Notes |
|---|-----------|-------|--------|-------|
| 16 | **BRAIN extensions** (`brain_persona*`, `brain_curiosity*`) | n/a | 🔴 theater | Cascade-era personalization experiments. Delete |
| 17 | **PF legacy** (`pf_brain_ml_*`, `pf_threat_*`) | n/a | 🔴 theater | `pf_threat_*` = pre-DEFENSE-primitive defense system. Delete |
| 18 | **GLOBAL / PRODUCTION** (`global_*`, `production_*` if present) | unknown | ❓ undecided | Governor unsure — re-investigate on next sweep |
| 19 | **TSAC** (`tsac_executor_stats`) | EVOLUTION (Shadow Mesh training) | 🟡 dormant | TSAC = Stats for Executors (Resolvers) used to train coding agents that wrote substrate patches. Old MODERNIZER/EVOLVE training surface; survives as Shadow Mesh training system. Revisit later |
| 20 | **MISC singletons** | — | 🟢 alive | Governor: "I think they're pretty good" — no further classification needed |

---

## §2. Action Queue (derived from §1.5)

**Migrate (signal → primitive):**
- LEARNING `learning_*` → BRAIN edges / crystals → drop tables
- MUTATION `mutation_*` → EVOLUTION (rename or fold) → drop legacy names

**Delete (theater):**
- `module_registry` (legacy term)
- `integrity_findings`
- `studio_*` (if any)
- `resilience_ledger`, `restoration_sessions`
- `brain_persona*`, `brain_curiosity*`
- `pf_brain_ml_*`, `pf_threat_*`

**Decide (Governor):**
- DEVELOPER stack — delete vs resurface as XCTBL Dev Playground
- GLOBAL / PRODUCTION — re-investigate
- GOVERNANCE TRANSITION — confirm LEX ownership

**Keep as standalone (peer to primitives):**
- AUTOBLOG · COMPILER · MARKETPLACE · CONTROL PLANE · VAULT (discovery sink)

---

## §3. Open Sweeps

Next audit passes should cover:
- Row-level access control verification on every alive subsystem
- RLS policy completeness on tables flagged "alive" but with sparse policies
- Cross-reference of Crown Jewel registry against the alive marketplace inventory
- Verification that Cognitives terminology is preserved in all UI surfaces

---

*© CMPSBL® · PromptFluid™ · 2026 · Governor Eyes Only*
