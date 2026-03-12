# 20 — Autonomous Software Foundry

**Classification:** 🔒 INTERNAL — Trade Secret  
**Version:** v14.2.0 — MINDGAMES Epoch

---

## 1. Purpose

This document describes the Autonomous Software Foundry — the substrate's recursive capability discovery and manufacturing system. The Foundry is a Crown Jewel and a publicly documented innovation. The DOI is published and the `/foundry` page presents proof metrics, tier distributions, and live discovery streams. Internal details (reactor source, CJPI weights, scoring formula internals) remain trade secrets, but the Foundry's existence, output metrics, and high-level architecture are public knowledge for investors and evaluators.

## 2. What the Foundry Does

The Foundry is a closed-loop reactor that:

1. **Discovers** latent capabilities by combinatorially exploring the 38-node topology
2. **Scores** each discovered capability using CJPI (Crown Jewel Pipeline Index)
3. **Tiers** discoveries into S/A/B/C/D quality bands
4. **Ranks** discoveries within each tier by composite score
5. **Deduplicates** semantically equivalent discoveries
6. **Persists** validated discoveries to the S-Tier Vault (admin-only)

The Foundry operates autonomously — once triggered, it runs without human intervention until the exploration space is exhausted or the time budget expires.

## 3. Architecture

### 3.1 Discovery Reactor (`src/lib/discovery/reactor.ts`)

The reactor is the core loop:

```
while (budget_remaining && candidates_exist) {
  candidate = generate_candidate(topology, module_combinations)
  score = cjpi_score(candidate)
  tier = auto_tier(score)
  if (!is_duplicate(candidate, existing_discoveries)) {
    persist(candidate, score, tier)
  }
}
```

Key parameters:
- **Exploration breadth:** All 38 nodes × combinatorial module chains
- **Scoring:** CJPI composite (novelty, utility, complexity, composability)
- **Deduplication:** Semantic similarity threshold (cosine > 0.92 = duplicate)
- **Time budget:** Configurable, typically 8–12 hours for full sweep

### 3.2 CJPI Scoring Model

The Crown Jewel Pipeline Index is a 0–100 composite score:

| Factor | Weight | Description |
|--------|--------|-------------|
| Novelty | 0.25 | How different from existing capabilities |
| Utility | 0.30 | Practical value for end users |
| Complexity | 0.20 | Sophistication of the module chain |
| Composability | 0.25 | How well it chains with other capabilities |

**Tier thresholds:**
- S-Tier: CJPI ≥ 85
- A-Tier: CJPI ≥ 70
- B-Tier: CJPI ≥ 55
- C-Tier: CJPI ≥ 40
- D-Tier: CJPI < 40

### 3.3 Module Discovery Engine (`src/lib/substrate/intent-mesh/module-discovery.ts`)

Each module autonomously discovers its own latent capabilities through introspection:
- Enumerates all registered actions
- Tests action combinations for emergent behavior
- Reports discovered capabilities back to the reactor

## 4. S-Tier Vault (`/admin/s-tier-vault`)

The S-Tier Vault is the admin-only repository of validated Crown Jewel discoveries.

### 4.1 Features

- **Registry view:** All promoted discoveries with CJPI scores, tier badges, and module chains
- **Filtering:** By tier, module, category, and score range
- **Export:** ZIP download containing:
  - Full discovery manifest (JSON)
  - Standalone discovery engine (portable)
  - Standalone runtime (portable)
  - Universal export adapter (25 language targets)
- **Verification panel:** Independently verifiable proof of discovery counts and scores

### 4.2 Data Model

Discoveries are stored in the `crown_jewel_discoveries` table:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | text | Discovery name |
| description | text | Human-readable description |
| module_chain | text[] | Ordered list of modules involved |
| cjpi_score | numeric | 0–100 composite score |
| tier | text | S/A/B/C/D |
| category | text | Functional category |
| discovered_at | timestamptz | Discovery timestamp |
| promoted | boolean | Whether promoted to production |

### 4.3 Export Adapter

The Universal Export Adapter can export any discovery to 25 target languages:
- 18 software languages (TypeScript, Python, Rust, Go, Java, C#, etc.)
- 7 hardware/HDL targets (VHDL, Verilog, SystemVerilog, etc.)

## 5. Standalone Discovery Engine (`src/lib/export/standalone-discovery-engine.ts`)

A fully portable version of the discovery reactor that operates without the full substrate:

- Packaged as a single TypeScript file
- Pairs with `standalone-runtime.ts` for CJPI scoring
- Can re-score, re-tier, and re-rank any discovery manifest
- Included in every S-Tier Vault ZIP export

## 6. Production Metrics

| Metric | Value |
|--------|-------|
| Total discoveries (all time) | 1,143+ |
| S-Tier discoveries | ~120 |
| Discovery rate | ~130/hour at full throttle |
| Average CJPI (S-Tier) | 89.2 |
| Unique module chains | 400+ |

## 7. Security Classification

| Component | Classification |
|-----------|---------------|
| Reactor source code | Trade secret — never exposed |
| CJPI scoring formula | Trade secret — weights and thresholds are internal |
| S-Tier Vault | Admin-only — no public API |
| Discovery Engine | Included in exports but obfuscated |
| Foundry existence & output metrics | **Public** — DOI published, investor-visible |
| `/foundry` page | **Public** — proof metrics, tier distributions, live stream |
| Discovery counts & tier breakdowns | **Public** (proof metrics) |
| Individual discovery details | Internal only |

## 8. Relationship to Public Pages

The `/foundry` page is a cinematic presentation layer showing proof metrics only:
- Total discovery count
- Tier distribution percentages
- Live discovery stream (visual only)
- Verification panel (count + hash)

**No source code, algorithm details, or individual discovery data is exposed on the public page.**

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial foundry internal documentation — v13.1.0 |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
