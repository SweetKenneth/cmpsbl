---
name: Governed Pipeline & SENTINEL sub-primitives
description: Governed Execution Pipeline lives inside CORTEX Engine; SENTINEL Witness lives inside AUDIT Agent. Matrix stays 40 (12·12·8·8). Never count as new primitives.
type: constraint
---
The 40-Primitive matrix is invariant. Two new runtime capabilities are sub-primitives, NOT new top-level primitives:

- **Governed Execution Pipeline** → sub-primitive of **CORTEX Engine**. Source: `src/lib/execution/governedPipeline.ts`, Layer 2: `src/lib/export/layers/_governed-pipeline-core.ts`.
- **SENTINEL Witness** → sub-primitive of **AUDIT Agent**. Source: `src/lib/execution/sentinel.ts`, Layer 2: `src/lib/export/layers/_sentinel-core.ts`.

**Why:** The "40-Primitive" canonical name is in v3.2 project knowledge, AGENTS.md, marketing, patents, /architecture page, store, tiers, sitemap, and ~400 files. Expanding to 42 would break all of it. Sub-primitives let new authority + witness pairs ship without topology drift.

**How to apply:**
- Never list them in `ENGINES`/`AGENTS` arrays in `packages/types/src/topology.ts`.
- Never add them to the store, tier catalogs, or marketplace as standalone products.
- Always describe them as "the Governed Pipeline (CORTEX sub-primitive)" or "SENTINEL (AUDIT sub-primitive)" in user-facing copy.
- Future runtime capabilities follow the same pattern: pick a parent primitive, document in `docs/libraries/staff/02-architecture-and-primitives.md` §7.
