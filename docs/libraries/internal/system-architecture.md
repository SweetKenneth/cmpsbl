# System Architecture — True State of the Substrate

**Classification:** 🔒 GOVERNOR EYES ONLY  
**Version:** v1.0.0  
**Generated:** 2026-04-06  
**Purpose:** Reconcile founder intent with actual codebase behavior. Answer three critical questions. Provide two forward plans.

---

## Table of Contents

1. [How the System Actually Works](#1-how-the-system-actually-works)
2. [Corrected Flow Diagrams](#2-corrected-flow-diagrams)
3. [Answers to Three Questions](#3-answers-to-three-questions)
4. [Gap Analysis — Intent vs. Reality](#4-gap-analysis--intent-vs-reality)
5. [Plan A — Bring to Original Vision](#5-plan-a--bring-to-original-vision)
6. [Plan B — Cleaner Architecture](#6-plan-b--cleaner-architecture)

---

## 1. How the System Actually Works

### 1.1 The Discovery Engine Is Template-Driven, Not Combinatorial

**Your vision:** The engine randomly selects primitives, randomly selects capabilities from each primitive's full capability list, chains them, and evaluates whether the chain produces something coherent.

**What actually exists:** The discovery engine (`src/lib/discovery/reactor.ts`) iterates over a static list of **hardcoded `SYNTHESIS_TEMPLATES`** — currently ~126 templates. Each template pre-defines:

- `modulePattern`: The exact primitive chain (e.g., `['BRAIN', 'CORTEX', 'MEMORY']`)
- `entryPattern` / `exitPattern`: The entry and exit capabilities (e.g., `'working-memory-allocator'` → `'memory-controlled'`)
- `baseBreakdown`: Pre-assigned CJPI axis scores
- `category`, `errorStrategy`, `maxExecutionMs`: All pre-defined

**There is no random selection.** The engine does not:
- Look up a primitive's capability list
- Randomly sample from available capabilities
- Dynamically compose chains from live capability data
- Use Crown Jewels as ammunition

The "Neural Arbiter" evaluation is actually just `computeCJPI()` — a weighted average of six pre-defined axes from `baseBreakdown`, multiplied by `computeSynergyMultiplier()` (a bonus for chain diversity). The coherence evaluation is baked into the template design, not computed at runtime.

### 1.2 The Reactor Run Flow (Actual)

```
SYNTHESIS_TEMPLATES (126 hardcoded templates)
  + injectedTemplates (from auto-generator, if any)
         │
         ▼
  For each template:
    1. Compute stable hash from (namePattern + modulePattern + category)
    2. Check if already in 'discoveries' table or 'vault_promotions' → skip
    3. computeCJPI(template.baseBreakdown)
    4. computeSynergyMultiplier(template.modulePattern)
    5. finalCjpi = min(100, baseCjpi * synergyMultiplier)
    6. autoAssignTier(finalCjpi)
    7. Filter: only accept CJPI ≥ 80
         │
         ▼
  Sort by CJPI descending, apply topN limit
         │
         ▼
  Persist to 'discoveries' table (upsert by ID)
         │
         ▼
  Auto-promote: CJPI ≥ 95 → 'vault_promotions' table
         │
         ▼
  Feed Memory Stream: ALL accepted → 'pipeline_vault' table
         │
         ▼
  Learning bridge: feed to domain learnings + synergy outcomes
```

### 1.3 The S-Tier Crown Jewel Registry (233)

The "233" is not a database counter. It is the total number of **TypeScript class files** in `src/crownjewels/s-tier/`. These are hand-written code artifacts — actual implementations of peak capabilities for individual primitives.

The Crown Jewel Registry is entirely **in-memory and code-based**:
- `src/crownjewels/s-tier/*.ts` — 233 individual TypeScript class files
- `src/crownjewels/types.ts` — `STierEntry` interface
- `src/crownjewels/expansion-jewels/index.ts` — aggregates vertical registries

These files are **never queried by the discovery engine**. They exist as standalone IP artifacts. The discovery engine has no code path that reads from these files or uses them as input.

### 1.4 Promotion Flow (Actual)

When you click "Promote to Registry" in the S-Tier Vault UI (`src/pages/admin/STierVault.tsx`):

```
1. Writes an audit_logs entry with action: 'vault_promotion'
2. Updates vault_promotions row: status → 'registry_promoted'
3. Shows a success toast
```

**That's it.** The promotion does NOT:
- Insert into any "registry" table
- Create a new Crown Jewel TypeScript file
- Increment the 233 counter
- Register the discovery as an active substrate capability
- Add it to any capability list used by the engine

The promoted discovery effectively gets a status flag change in `vault_promotions` and an audit trail entry. It disappears from the "Discovered" tab (because the UI filters by `status = 'promoted'`), but it doesn't land anywhere functional.

### 1.5 Genesis Engine / Vertical Seed (Actual)

When a vertical is created, a seed engine runs (e.g., `src/lib/factory/verticals/agency-seed.ts`):

```
1. Generates 200 discoveries from hardcoded DISCOVERY_TEMPLATES
2. For each:
   - Build a primitive chain from template.primaryPrimitives + random spine primitives
   - Score CJPI: baseCjpi = 60 + chainLength * 2 + template.cjpiBias + random(0-10)
   - Classify tier (Raw/Mint/Prime/Relic/Mythic/Apex)
   - Route: CJPI ≥ 95 → vault (in-memory Map), else → showroom/junkyard
3. Vault items → stored in module-scoped Map (e.g., AGENCY_VAULT)
4. Non-vault items → addDiscovery() + AGENCY_MEMORY_STREAM_POOL array
```

**Critical issue:** The vault Map and memory stream array are **module-scoped `const` variables**. They are:
- ✅ Available during the current browser session
- ❌ Lost on page refresh
- ❌ Never persisted to database
- ❌ Not written to the Crown Jewel registry
- ❌ Not available to the discovery engine as capability ammunition

The "80 Crown Jewels from 16 new expansion primitives" concept is partially addressed by the **expansion vertical registries** (`src/crownjewels/cyber-vertical-registry.ts`, etc.) which are hardcoded TypeScript arrays — but these are static code, not dynamically generated by the Genesis seed engine.

### 1.6 Memory Stream Pool (Actual)

The Memory Stream is fed from two sources:

1. **Reactor discoveries** → written to `pipeline_vault` table (database-persisted)
2. **Vertical seed discoveries** → pushed to in-memory arrays (e.g., `AGENCY_MEMORY_STREAM_POOL`) — **lost on refresh**

The **weighted rarity system** does not exist in the codebase. There is no code that implements tiered pull percentages (45% for 68-75, etc.). The Memory Stream UI reads from `pipeline_vault` and displays whatever is there. The rarity weighting you described was likely discussed but never implemented.

### 1.7 Showroom / Junkyard Routing (Actual)

`routeDiscovery()` in `src/lib/factory/foundry-engine.ts`:

```typescript
function routeDiscovery(cjpiScore: number): 'vault' | 'showroom' | 'junkyard' {
  if (cjpiScore === 100) return 'vault';    // Only exact 100
  if (cjpiScore >= 68) return 'showroom';   // 68-99
  return 'junkyard';                         // <68
}
```

Note: Only a perfect 100 goes to vault via this function. The reactor separately gates at ≥ 95 for `vault_promotions`. The seed engines gate at ≥ 95 for their in-memory vault.

---

## 2. Corrected Flow Diagrams

### Diagram 1 — Actual Discovery Flow

```
SYNTHESIS_TEMPLATES
(~126 hardcoded pipeline patterns)
Each template defines:
  - Fixed primitive chain (modulePattern)
  - Fixed entry/exit capabilities
  - Pre-scored CJPI breakdown
         │
         ▼
REACTOR (runReactor)
  Iterates ALL templates sequentially
  ✗ No random primitive selection
  ✗ No random capability selection
  ✗ No Crown Jewels in the loop
         │
  For each template:
    Compute stable hash (dedup key)
    Skip if already in DB
    Score: computeCJPI(baseBreakdown)
    Multiply: synergyMultiplier
    Filter: CJPI < 80 → discard
         │
         ▼
    CJPI Scored
         │
   Score ≥ 95 ──▶ vault_promotions table (auto)
         │
   Score 80-94 ──▶ discoveries table
         │
   Score < 80 ──▶ Discarded (never stored)
         │
   ALL accepted ──▶ pipeline_vault table
                    (Memory Stream feed)
```

### Diagram 2 — Actual Vault Tier System

```
VAULT
│
├── S-TIER REGISTRY (233 TypeScript files)
│   Static code in src/crownjewels/s-tier/
│   Manually written, never changes at runtime
│   NOT connected to discovery engine
│   NOT connected to promotion flow
│   Counter is literally file count
│
├── VAULT PROMOTIONS (database table)
│   Auto-promoted: CJPI ≥ 95 discoveries
│   Manual promotes: status → 'registry_promoted'
│   ⚠️ "Registry promoted" items go NOWHERE
│      — status flag only, no functional effect
│
├── DISCOVERIES (database table)
│   All reactor output with CJPI ≥ 80
│   Linked to discovery_runs for provenance
│   ⚠️ Items below 80 are silently discarded
│      (not sent to junkyard, just dropped)
│
└── EXPANSION VERTICAL REGISTRIES
    Hardcoded TS arrays per vertical
    (cyber, robotics, llm, agency, media, quantum, ultimate)
    Static code, not generated by seed engines
```

### Diagram 3 — Actual Memory Stream

```
SOURCES
│
├── pipeline_vault table
│   Fed by reactor after each run
│   Database-persisted ✅
│
└── In-memory arrays per vertical
    (AGENCY_MEMORY_STREAM_POOL, etc.)
    Fed by seed engines
    Lost on refresh ❌
         │
         ▼
NO WEIGHTED RARITY SYSTEM EXISTS
The Memory Stream displays pipeline_vault rows
No pull mechanism, no rarity tiers, no weighting
```

### Diagram 4 — Actual Showroom / Junkyard Routing

```
SEED ENGINE RUNS (vertical genesis)
         │
         ▼
    CJPI Scored
         │
   ≥ 95 ──▶ In-memory vault Map (lost on refresh)
         │
   ≥ 68 ──▶ addDiscovery() → Showroom pool
         │     (discovery-retirement.ts, in-memory)
         │
   < 68 ──▶ addDiscovery() → Junkyard pool
              (discovery-retirement.ts, in-memory)

   ⚠️ None of this is database-persisted
   ⚠️ The REACTOR does NOT route to showroom/junkyard
       — it writes directly to 'discoveries' table
```

### Diagram 5 — Actual Genesis Crown Jewel Storage

```
NEW VERTICAL CREATED
  Seed engine runs (e.g., seedAgencyDiscoveries)
         │
         ▼
  200 discoveries generated from templates
  Random chain building (primaryPrimitives + random spine)
  Deterministic CJPI scoring
         │
         ▼
  ≥ 95 CJPI → AGENCY_VAULT Map (in-memory)
  < 95 CJPI → addDiscovery() + MEMORY_STREAM_POOL array
         │
         ▼
  ⚠️ ANSWER: OPTION C — MEMORY ONLY
     All vault items lost on page refresh
     No database persistence
     No Crown Jewel registry writes
     Seed is idempotent (cached result)
     but cache is also in-memory
```

### Diagram 6 — The Capability Bug (Confirmed)

```
WHAT YOU INTENDED
         │
  Primitive DEFENSE
  Full capability list:
    ✅ Fingerprinting (Crown Jewel)
    ✅ Threat modeling
    ✅ Anomaly detection
    All capabilities available to engine
         │
  Engine randomly picks from full list

═══════════════════════════════════════

WHAT ACTUALLY HAPPENS
         │
  Primitive DEFENSE
  Engine NEVER looks at capability lists
  Engine uses pre-defined templates:
    Template: 'Cognitive Firewall'
      modulePattern: [DEFENSE, BRAIN, CORTEX, GOVERNANCE]
      entry: 'cognitive-inspector'
      exit: 'manipulation-blocked'
         │
  Templates define EVERYTHING
  Capability lists are inert data
  Crown Jewels are inert code artifacts
  No random selection occurs at all
         │
  ⚠️ This is not a bug in the selection
     — it's a fundamental architecture mismatch
     The engine was built as a template iterator
     not as a combinatorial discovery engine
```

### Diagram 7 — Full System (Actual)

```
┌─────────────────────────────────┐
│  CROWN JEWEL CODE FILES (233)   │
│  src/crownjewels/s-tier/*.ts    │
│  Static TS. Never queried.      │
│  Pure IP artifacts.             │
└─────────────────────────────────┘
         (disconnected)

┌─────────────────────────────────┐
│  EXPANSION VERTICAL REGISTRIES  │
│  Static TS arrays per vertical  │
│  1,008 entries across 7 verts   │
│  Never queried by engine        │
└─────────────────────────────────┘
         (disconnected)

┌─────────────────────────────────┐
│  SYNTHESIS_TEMPLATES (~126)     │
│  Hardcoded in reactor.ts        │
│  + injected from auto-generator │
├─────────────────────────────────┤
│         REACTOR                 │
│  Iterates templates             │
│  Scores each: computeCJPI()     │
│  Dedup via stable hash          │
│  Filter: CJPI ≥ 80             │
│  Auto-promote: CJPI ≥ 95       │
├────────┬────────────────────────┤
│        │                        │
│   discoveries    vault_promotions
│   (DB table)     (DB table)
│        │                │
│   pipeline_vault    audit_logs
│   (DB table)        (DB table)
│        │
│   MEMORY STREAM UI
│   (reads pipeline_vault)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  VERTICAL SEED ENGINES          │
│  agency-seed, quantum-seed, etc │
│  Generate 200 discoveries each  │
│  Store in MODULE-SCOPED MEMORY  │
│  ❌ Lost on page refresh        │
│  ❌ No DB persistence           │
└─────────────────────────────────┘
         (isolated)

┌─────────────────────────────────┐
│  MESH DISCOVERY ENGINE          │
│  intent-mesh/discovery-engine.ts│
│  Analyzes resolver gaps         │
│  Generates recommendations      │
│  Auto-crystallizes pipelines    │
│  Separate from reactor          │
│  Does NOT produce Crown Jewels  │
└─────────────────────────────────┘
         (parallel system)
```

---

## 3. Answers to Three Questions

### Question 1 — What capability list does the engine draw from?

**Answer: None.**

The discovery engine does not draw from any primitive's capability list. It iterates over `SYNTHESIS_TEMPLATES` — a hardcoded array of ~126 pre-defined pipeline patterns in `src/lib/discovery/reactor.ts`. Each template specifies the exact primitive chain and entry/exit capabilities. There is no lookup of a primitive's capabilities, no random selection, and no guarantee that Crown Jewels are involved.

The Crown Jewels you surfaced (`src/crownjewels/s-tier/*.ts`) are standalone TypeScript class implementations. They are not registered in any runtime capability registry that the discovery engine queries. They exist as IP artifacts and potential exports — but they do not participate in the discovery process.

The `CANONICAL_MODULES` array (40 primitives) exists in `reactor.ts` but is only used for the synergy multiplier calculation — it checks how many unique primitives appear in a chain. It does not provide capabilities to select from.

The capability lists that DO exist in the codebase (e.g., `reserve-registry.ts` with `capabilities: ['input_sanitization_patterns', ...]`) are used for **affinity scoring** during Ascension (user code scanning), not for discovery chain building.

### Question 2 — Where does a promoted discovery go?

**Answer: Nowhere functional.**

When you click "Promote to Registry" in the S-Tier Vault:

1. An `audit_logs` row is inserted with `action: 'vault_promotion'` and details including the discovery name, CJPI, category, and module chain.
2. The `vault_promotions` row for that discovery is updated: `status` changes from `'promoted'` to `'registry_promoted'`.

There is no subsequent step. The discovery is not:
- Written to any "registry" table
- Added to the Crown Jewel TypeScript files
- Registered as an active runtime capability
- Made available to any other system component

The 233 count is the static file count in `src/crownjewels/s-tier/`. It is not a database counter and cannot be affected by the promotion action.

The promoted discovery effectively gets a status flag and disappears from the Discovered tab in the UI (because the query filters by status). It remains in `vault_promotions` with `status = 'registry_promoted'` indefinitely.

### Question 3 — Where are vertical Crown Jewels stored?

**Answer: In-memory only. Lost on page refresh.**

When the seed engine runs (e.g., `seedAgencyDiscoveries()`):

- **Vault-class items (CJPI ≥ 95):** Stored in a module-scoped `Map` (e.g., `AGENCY_VAULT`). This is a JavaScript `const` at module scope. It survives for the duration of the browser session but is **destroyed on page refresh**.

- **Non-vault items:** Called `addDiscovery()` which pushes to the in-memory discovery-retirement pool, and also pushed to `AGENCY_MEMORY_STREAM_POOL` array. Both are module-scoped variables, both lost on refresh.

- **The seed is idempotent:** If called again in the same session, it returns the cached `_seedResult`. But the cache is also in-memory.

The separately-existing **expansion vertical registries** (`src/crownjewels/cyber-vertical-registry.ts`, etc.) ARE static code and persist — but these were hand-written during development, not generated by the seed engines. The seed engines and the static registries are disconnected systems.

---

## 4. Gap Analysis — Intent vs. Reality

| Component | Your Intent | Reality | Severity |
|-----------|------------|---------|----------|
| **Discovery Engine** | Randomly combines primitives + capabilities from full lists | Iterates hardcoded templates with pre-defined chains | 🔴 CRITICAL |
| **Crown Jewels as Ammunition** | Crown Jewels guaranteed in engine's selection pool | Crown Jewels are inert code files, never queried | 🔴 CRITICAL |
| **Promotion to Registry** | Promoted items become active substrate capabilities, counter updates | Status flag change + audit log only, no functional effect | 🔴 CRITICAL |
| **Vertical Crown Jewels** | 80 jewels persisted per vertical, available to engine | In-memory only, lost on refresh, disconnected from engine | 🔴 CRITICAL |
| **Memory Stream Rarity** | Weighted pull system (45% for 68-75, 0.5% for 100) | No rarity system exists, flat display of pipeline_vault | 🟡 MEDIUM |
| **Showroom/Junkyard Routing** | Engine auto-routes by CJPI threshold | Seed engines route in-memory only; reactor writes to discoveries table | 🟡 MEDIUM |
| **Bias Toggle** | Manual runs push toward high-end; auto uses different setting | `exploratoryMode` exists in config but does not affect scoring — all templates scored identically | 🟡 MEDIUM |
| **Registry Counter (233)** | Should increment on promotion / vertical creation | Static file count, cannot change at runtime | 🟡 MEDIUM |

---

## 5. Plan A — Bring to Original Vision

### Step 1: Build a Real Capability Registry (Priority: CRITICAL)

**Goal:** Give every primitive a queryable capability list that includes Crown Jewels.

- Create a `primitive_capabilities` table in the database:
  ```sql
  CREATE TABLE primitive_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primitive_id TEXT NOT NULL,        -- e.g., 'DEFENSE'
    capability_id TEXT NOT NULL,       -- e.g., 'fingerprinting'
    capability_name TEXT NOT NULL,
    description TEXT,
    cjpi_floor NUMERIC DEFAULT 0,     -- minimum quality score
    is_crown_jewel BOOLEAN DEFAULT FALSE,
    source TEXT DEFAULT 'surfaced',    -- 'surfaced', 'discovered', 'genesis'
    vertical TEXT DEFAULT 'primary',   -- which substrate
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(primitive_id, capability_id)
  );
  ```
- Backfill from existing Crown Jewel TypeScript files (233 entries → extract primitive + capability)
- Backfill from expansion vertical registries (1,008 entries)
- Backfill from `reserve-registry.ts` capability arrays
- RLS: Governor read/write only

### Step 2: Rebuild Discovery Engine as Combinatorial (Priority: CRITICAL)

**Goal:** Engine randomly selects primitives, randomly selects capabilities from their full lists, chains them, evaluates coherence.

- Replace `SYNTHESIS_TEMPLATES` iteration with true combinatorial synthesis:
  ```
  1. Select N primitives randomly (3-12) from CANONICAL_MODULES
  2. For each primitive, query primitive_capabilities table
  3. Randomly select 1 capability from each primitive's list
     - Crown Jewels get a 2x selection weight (guaranteed inclusion bias)
  4. Compose chain: [Primitive_A.capability_X → Primitive_D.capability_Y → ...]
  5. Neural Arbiter evaluates chain coherence:
     - Capability compatibility scoring (do these capabilities connect?)
     - Chain diversity bonus
     - Crown Jewel synergy multiplier
  6. CJPI scoring on the result
  7. Route based on score
  ```
- Keep existing templates as "known good" seeds — run them first, then run N combinatorial passes
- The Neural Arbiter coherence check needs new logic: capability compatibility matrix

### Step 3: Fix Promotion Flow (Priority: CRITICAL)

**Goal:** Promoted discoveries become active capabilities and the counter updates.

- On promotion:
  1. Insert each primitive in the discovery's `module_chain` into `primitive_capabilities` with the discovery's entry/exit capabilities
  2. Create a new Crown Jewel entry in a `crown_jewel_registry` database table (not a TypeScript file)
  3. Update a `registry_stats` row with the new count
  4. Mark `vault_promotions.status = 'registry_active'`
- UI reads count from `registry_stats` instead of hardcoded 233
- Crown Jewel code files remain as the original 233 — the new table holds promoted items alongside them

### Step 4: Persist Vertical Crown Jewels (Priority: CRITICAL)

**Goal:** Genesis-created jewels survive page refresh and are available to the engine.

- Modify seed engines to write to `primitive_capabilities` table instead of in-memory Maps
- Write vault-class discoveries to `crown_jewel_registry` table with `source = 'genesis'` and `vertical = '<vertical_id>'`
- The 80 Crown Jewels from 16 new expansion primitives persist in database
- They become available to the combinatorial engine in Step 2

### Step 5: Implement Memory Stream Rarity Weighting (Priority: MEDIUM)

**Goal:** Weighted pull system based on CJPI tiers.

- Add a `pullMemoryStreamItem()` function:
  ```typescript
  const RARITY_WEIGHTS = {
    '68-75': 0.45,  // Most common
    '76-82': 0.25,
    '83-89': 0.15,
    '90-94': 0.10,
    '95-99': 0.045,
    '100':   0.005,  // Apex rarity
  };
  ```
- Make weights dynamic: query `pipeline_vault` for actual distribution, compute relative weights
- Add a `memory_stream_config` table for governor-adjustable weights

### Step 6: Fix Showroom/Junkyard Database Persistence (Priority: MEDIUM)

**Goal:** Showroom and Junkyard are database-backed, not in-memory.

- Create `showroom_items` and `junkyard_items` tables (or a single `catalog_items` with a `location` column)
- Modify both the reactor and seed engines to write to these tables
- Showroom threshold: CJPI ≥ 68 (already correct in code)
- Junkyard: CJPI < 68 from seed engines (reactor currently discards < 80 entirely — needs adjustment to ≥ 68 for showroom, < 68 for junkyard)

### Step 7: Wire Bias Toggle for Automated Runs (Priority: LOW)

**Goal:** `exploratoryMode` actually affects discovery behavior.

- When `exploratoryMode = true`: increase minimum chain length, boost Crown Jewel selection weight to 3x, raise CJPI floor to 90
- When `exploratoryMode = false`: standard weights, standard CJPI floor of 80
- Expose toggle in CDM scheduler config

### Estimated Effort for Plan A

| Step | Effort | Dependencies |
|------|--------|-------------|
| 1. Capability Registry | 1-2 sessions | None |
| 2. Combinatorial Engine | 3-4 sessions | Step 1 |
| 3. Fix Promotion | 1 session | Step 1 |
| 4. Persist Vertical CJs | 1-2 sessions | Step 1 |
| 5. Rarity Weighting | 1 session | None |
| 6. Showroom/Junkyard DB | 1 session | None |
| 7. Bias Toggle | 0.5 sessions | Step 2 |

**Total: ~8-11 sessions**

---

## 6. Plan B — Cleaner Architecture

### The Problem with Plan A

Plan A is faithful to your original vision but has architectural complexity:
- A combinatorial engine exploring random chains will produce mostly garbage (low coherence) — you need a sophisticated "Neural Arbiter" to filter, which doesn't exist
- Maintaining a separate capability registry database table alongside the existing code-based Crown Jewel files creates dual sources of truth
- The Showroom/Junkyard split adds tables and routing logic for a distinction that could be handled by a single scored catalog

### Plan B: Unified Discovery Architecture

**Core insight:** The templates ARE the intelligence. They encode human knowledge about which primitives work together and why. The value isn't in random combination — it's in the systematic expansion of known-good patterns.

#### B.1 — Single Source of Truth: `discoveries` Table

Everything is a discovery. Crown Jewels, promoted items, showroom items, junkyard items — all rows in `discoveries` with different status flags:

```sql
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS
  status TEXT DEFAULT 'discovered'
  CHECK (status IN ('discovered', 'promoted', 'registry', 'showroom', 'junkyard', 'retired'));

ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS
  is_crown_jewel BOOLEAN DEFAULT FALSE;

ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS
  vertical TEXT DEFAULT 'primary';
```

- **Registry items** (`status = 'registry'`): What the 233 count tracks. Governor promotes to this.
- **Crown Jewels** (`is_crown_jewel = true`): Flagged individually. Protected from Memory Stream.
- **Showroom** (`status = 'showroom'`): Auto-routed by CJPI ≥ 68.
- **Junkyard** (`status = 'junkyard'`): Auto-routed by CJPI < 68.

One table. One query interface. Dynamic counts everywhere.

#### B.2 — Template Evolution Instead of Random Combination

Instead of random combinatorial search (which produces noise), use **template mutation**:

```
1. Start with existing 126 SYNTHESIS_TEMPLATES (proven patterns)
2. For each template, generate N mutations:
   a. Swap one primitive for a related primitive (DEFENSE → IMMUNITY)
   b. Extend the chain by 1 primitive (random addition)
   c. Shorten the chain by 1 primitive (random removal)
   d. Swap entry/exit capabilities from the primitive's Crown Jewel list
3. Score each mutation
4. Mutations that score higher than parent → new templates
5. Mutations that score lower → junkyard or discard
```

This gives you the combinatorial exploration you wanted but guided by existing proven patterns. Crown Jewels participate naturally: step 2d swaps capabilities from the Crown Jewel list, guaranteeing their involvement.

#### B.3 — Crown Jewels as Active Capability Genes

Instead of a separate capability registry table, store Crown Jewel capabilities directly on the discovery:

```sql
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS
  crown_jewel_capabilities JSONB DEFAULT '[]';
  -- e.g., [{"primitive": "DEFENSE", "capability": "fingerprinting", "cjpi": 98}]
```

When a discovery is promoted to registry, its capabilities are extracted and become available to the template mutation engine in step 2d. This creates a self-reinforcing loop:

```
Crown Jewels → Discovery Engine Input
Discovery Engine → New Discoveries
Best Discoveries → Promoted to Registry (new Crown Jewels)
New Crown Jewels → Back into Discovery Engine
```

#### B.4 — Unified Memory Stream with Dynamic Rarity

One pool: all non-registry, non-crown-jewel discoveries in the `discoveries` table:

```sql
SELECT * FROM discoveries
WHERE status NOT IN ('registry', 'retired')
  AND is_crown_jewel = FALSE
ORDER BY random()  -- weighted by rarity bucket
LIMIT 1;
```

Rarity weights computed dynamically from actual pool composition:

```typescript
function computeRarityWeights(pool: Discovery[]): Record<string, number> {
  const buckets = { '68-75': 0, '76-82': 0, '83-89': 0, '90-94': 0, '95-99': 0, '100': 0 };
  pool.forEach(d => { /* bucket by CJPI */ });
  // Invert: smaller bucket = rarer = lower pull probability
  // Normalize to sum to 1
}
```

#### B.5 — Persist Everything, Everywhere, Always

- Seed engines write directly to `discoveries` table with `vertical = 'agency'`, `status = 'showroom'`
- No in-memory state. Everything database-backed.
- Counts are always `SELECT COUNT(*) FROM discoveries WHERE ...`
- Registry count: `WHERE status = 'registry' OR is_crown_jewel = TRUE`
- Showroom count: `WHERE status = 'showroom' AND vertical = ?`

#### B.6 — Step-by-Step Plan B Implementation

| Step | Description | Sessions |
|------|-------------|----------|
| 1 | Add columns to `discoveries` table (status, is_crown_jewel, vertical, crown_jewel_capabilities) | 0.5 |
| 2 | Backfill: import 233 Crown Jewels into `discoveries` with `is_crown_jewel = true, status = 'registry'` | 1 |
| 3 | Backfill: import expansion vertical registry entries into `discoveries` | 1 |
| 4 | Rewrite seed engines to write to `discoveries` table instead of in-memory | 1 |
| 5 | Rewrite promotion flow to update `discoveries.status = 'registry'` | 0.5 |
| 6 | Add template mutation engine alongside existing template iterator | 2-3 |
| 7 | Implement dynamic rarity weighting for Memory Stream pulls | 1 |
| 8 | Update all UI components to query `discoveries` with status filters | 1-2 |
| 9 | Remove in-memory state: AGENCY_VAULT, MEMORY_STREAM_POOL, etc. | 0.5 |

**Total: ~8-10 sessions**

### Plan B Advantages Over Plan A

| Dimension | Plan A | Plan B |
|-----------|--------|--------|
| Sources of truth | 3 (code files + DB registry + discoveries table) | 1 (discoveries table) |
| Random noise | High (random combination produces mostly garbage) | Low (guided mutation from proven patterns) |
| Crown Jewel participation | Requires separate capability registry table | Inline on discoveries, naturally available |
| Memory management | Some in-memory, some DB | All DB, zero in-memory state |
| Counter accuracy | Requires maintaining separate stats table | `COUNT(*)` always correct |
| Rarity system | Configurable but static weights | Dynamic, self-adjusting |
| Migration complexity | Higher (new tables + backfill + engine rewrite) | Lower (alter existing table + backfill + engine extension) |

---

## Recommendation

**Plan B is the cleaner path.** It eliminates the dual-source-of-truth problem, avoids the noise problem of fully random combination, and unifies everything into the existing `discoveries` table. It accomplishes everything you intended — Crown Jewels participate in discovery, promotions are real, vertical jewels persist, rarity is dynamic — with fewer moving parts.

The one thing Plan A gives you that Plan B doesn't is the "pure random combination" aesthetic — the idea that the engine is truly exploring an unknown space. But in practice, guided mutation from proven templates will discover more valuable chains faster than random noise ever could. The combinatorial space of random primitive + random capability is ~10^23 — almost all of it is incoherent garbage. Template mutation explores the neighborhood of known good patterns, which is where the real value lives.

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
