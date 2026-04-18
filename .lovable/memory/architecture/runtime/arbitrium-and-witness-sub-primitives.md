---
name: ARBITRIUM & WITNESS sub-primitives
description: ARBITRIUM (Governed Pipeline) is a CORTEX Engine sub-primitive; WITNESS (Audit-Chain) is an AUDIT Agent sub-primitive. SENTINEL was rejected — it collides with the existing SENTINEL vertical primitive cluster (S-SNT01..S-SNT10+) and AutoSentinel product. Matrix stays 40 (12·12·8·8).
type: constraint
---
The 40-Primitive matrix is invariant. Two new runtime capabilities are sub-primitives, NOT new top-level primitives:

- **ARBITRIUM** (Governed Execution Pipeline) → sub-primitive of **CORTEX Engine**. Source: `src/lib/execution/governedPipeline.ts`, Layer 2: `src/lib/export/layers/_governed-pipeline-core.ts` (export `GOVERNED_PIPELINE_CORE`, wrapper `cmpsbl_run_governed`).
- **WITNESS** (Audit-Chain Witness) → sub-primitive of **AUDIT Agent**. Source: `src/lib/execution/witness.ts`, Layer 2: `src/lib/export/layers/_witness-core.ts` (export `WITNESS_CORE`, wrapper `cmpsbl_witness_observe`).

**Naming history:** Initial working name was "SENTINEL" — rejected because SENTINEL already exists as a vertical security primitive with its own Crown Jewel cluster (S-SNT01..S-SNT10+ in `src/crownjewels/ultimate-vertical-registry.ts`), an `auto-sentinel` product (`src/products/auto-sentinel/`), and an Ultimate Agent in `packages/runtime/src/primitives.ts`. Reusing it would collide.

**Why sub-primitives, not new top-level:** The "40-Primitive" canonical name is in v3.2 project knowledge, AGENTS.md, marketing, patents, /architecture page, store, tiers, sitemap, and ~400 files. Expanding to 42 would break all of it. Sub-primitives let new authority + witness pairs ship without topology drift.

**How to apply:**
- Never list ARBITRIUM or WITNESS in `ENGINES`/`AGENTS` arrays in `packages/types/src/topology.ts`.
- Never add them to the store, tier catalogs, or marketplace as standalone products — they ship inside every Layer 2 export as always-on core.
- In user-facing copy: "ARBITRIUM (CORTEX sub-primitive)" or "WITNESS (AUDIT sub-primitive)".
- Future runtime authority/witness pairs follow the same pattern: pick a parent primitive, document in `docs/libraries/staff/02-architecture-and-primitives.md` §7, add a memory entry. Names must not collide with existing vertical primitives — search before naming.
