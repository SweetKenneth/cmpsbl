# 04 — Ascension: Complete Technical Deep Dive

**Classification:** 🔒 INTERNAL — Trade Secret  
**Version:** v14.2.0 — MINDGAMES Epoch

---

## 1. Purpose

This document is the exhaustive internal reference for the Ascension pipeline — the proprietary process where external developer software enters the CMPSBL cognitive substrate as a Candidate Node (Node 41), undergoes collision-based discovery against the 40-node matrix, and produces Ascended Memories exportable in the developer's original language.

---

## 2. Access Gate

Ascension is accessed via the `/x` route, protected by a 6-digit PIN: `041041`. This PIN is hardcoded in the client-side gate component and is not user-specific. The gate renders a cinematic orbital canvas upon successful entry.

---

## 3. Phase 1 — INGEST

### 3.1 Upload & Quota Enforcement

Daily upload limits are enforced at the ingest gate before any file processing begins:

| Plan | Daily Uploads |
|------|--------------|
| Builder | 0 (blocked) |
| Studio | 3 |
| Creator | 6 |
| Architect | 12 |

Quota is checked via the `useEvolutionLimits` hook, which queries `artifact_registry` filtered by `user_id` and `created_at >= today`.

### 3.2 File Reading — safeReadText

The `safeReadText` utility handles encoding detection:

1. Samples the first **64KB** of the file
2. Detects encoding: UTF-8 (default), UTF-16 LE/BE (via BOM detection)
3. For known source extensions (`.php`, `.rs`, `.zig`, `.v`, `.sv`, `.vhd`, etc.), uses `file.text()` directly — bypassing binary heuristics that produce false positives on HDL files
4. Parses up to **1MB** maximum; files beyond this are rejected
5. Per-file payload cap: **16,384 characters**
6. Total payload cap across all files: **81,920 characters**

### 3.3 Language Detection

The `detectLanguage()` function maps file extensions to normalized language keys:

```
.py → python          .rs → rust           .go → golang
.ts/.tsx → typescript  .js/.jsx → javascript .php → php
.rb → ruby            .swift → swift        .kt → kotlin
.java → java          .cs → csharp          .cpp/.cc → cpp
.c → c                .lua → lua            .dart → dart
.scala → scala        .ex/.exs → elixir     .hs → haskell
.zig → zig            .v → verilog          .sv → systemverilog
.vhd/.vhdl → vhdl     .bsv → bluespec       .chisel → chisel
.spice → spice        .amar → amaranth
```

The detected language is stored as `source_export_language` in the candidate's metadata. This value **permanently locks** the export language for all artifacts derived from this candidate.

### 3.4 Capability Surface Derivation — deriveCapabilitySurface()

This is the core IP of the ingest phase. The function scans all ingested source code to assign Node 41 a real capability profile.

**Domain signal detection** (substring matching on combined source):

| Signal Keywords | Assigned Domain |
|----------------|----------------|
| `encrypt`, `cipher`, `hmac`, `hash`, `auth`, `token`, `ssl`, `tls` | security |
| `neural`, `tensor`, `model`, `train`, `predict`, `inference`, `embedding` | intelligence |
| `complian`, `audit`, `regulat`, `gdpr`, `hipaa`, `sox`, `pci` | compliance |
| `deploy`, `container`, `docker`, `kubernetes`, `k8s`, `terraform`, `aws`, `gcp`, `azure` | infrastructure |
| `pipeline`, `transform`, `etl`, `stream`, `batch`, `queue`, `kafka` | synthesis |
| `trade`, `finance`, `ledger`, `payment`, `invoice`, `bank`, `stock`, `portfolio` | finance |
| `patient`, `diagnos`, `clinical`, `health`, `medical`, `pharma` | health |
| `graph`, `render`, `canvas`, `pixel`, `shader`, `webgl`, `svg` | graphics |
| `parse`, `compile`, `lexer`, `ast`, `grammar`, `syntax`, `interpreter` | language |
| `robot`, `sensor`, `actuator`, `pwm`, `gpio`, `firmware`, `embedded` | hardware |

**Functional verb extraction** (regex: common programming verbs in function/method signatures):

Scans for `function`, `def`, `fn`, `func`, `sub`, `proc`, `method`, `class`, `struct`, `trait`, `interface`, `module`, `package` declarations and extracts the identifiers as capability verbs.

**Sector assignment logic:**

```
if domain includes security OR compliance → DEFENSE sector
if domain includes intelligence          → CORTEX sector
if domain includes infrastructure        → PLANE sector
if domain includes finance OR health     → SOVEREIGN sector
if domain includes graphics OR language  → CREATIVE sector
if domain includes hardware              → NERVE sector
default                                  → SYNTHESIS sector
```

**Output structure:**

```json
{
  "capabilities": ["encrypt", "authenticate", "validate", ...],
  "domain": "security",
  "sector": "DEFENSE",
  "complexity": 0.73,
  "verb_count": 14,
  "source_export_language": "python"
}
```

The `complexity` score is calculated as:
```
complexity = min(1.0, (unique_verb_count / 20) * 0.5 + (domain_signal_count / 5) * 0.3 + (total_lines / 1000) * 0.2)
```

### 3.5 Artifact Registry Persistence

The candidate is written to `public.artifact_registry` with:

- `user_id` — from authenticated session
- `slug` — `candidate-node-41-{hash}` where hash = first 8 chars of SHA-256 of combined filenames
- `category` — `"ascension-candidate"`
- `tier` — `"candidate"`
- `metadata` — contains `source_files[]`, `capability_surface`, `source_export_language`, `total_chars`, `file_count`

Upsert uses the unique index on `(user_id, slug)`.

### 3.6 Circuit Breaker

The ingest phase implements a circuit breaker pattern (Ironclad v2.0.0):

- **Closed** → normal operation
- **Open** → trips after **3 consecutive failures**, blocks for exponential backoff starting at **1 second**, doubling each trip, max **32 seconds**
- **Half-open** → allows one probe request; success resets to closed, failure reopens

Failed ingests are logged to a dead-letter array in component state for debugging.

---

## 4. Phase 2 — DISCOVERY (Ascension Cycle)

### 4.1 Engine Architecture

Discovery is executed server-side in the `pf-proprietary-evolution` edge function, action `discover`.

**Input:** `candidate_id` (artifact_registry UUID)

**Process:**

1. Fetch candidate from `artifact_registry` by ID + user_id
2. Extract capability surface from metadata
3. Load the full 40-node matrix from `matrixNodeRegistry`
4. Execute multi-chain collision exploration

### 4.2 Multi-Chain Collision Algorithm

The discovery engine explores chains of **2 to 6 nodes**, always including Node 41 (the candidate).

**Chain generation:**

```
for chain_length in [2, 3, 4, 5, 6]:
    for each permutation of (chain_length - 1) substrate nodes:
        chain = [node_41, ...selected_substrate_nodes]
        score = evaluate_synergy(chain)
        if score >= threshold:
            results.append(chain)
```

**Permutation depth limits** (to prevent combinatorial explosion):

| Chain Length | Max Permutations Evaluated |
|-------------|---------------------------|
| 2 | 40 (all nodes) |
| 3 | 200 |
| 4 | 500 |
| 5 | 300 |
| 6 | 100 |

Permutations are selected using **weighted random sampling** — nodes in the same sector as Node 41 are 3x more likely to be selected, adjacent sectors 1.5x.

### 4.3 Synergy Scoring — CJPI (Crown Jewel Pipeline Index)

Each chain receives a CJPI score (0–100) computed as:

```
CJPI = (novelty × 0.25) + (utility × 0.30) + (complexity × 0.20) + (composability × 0.15) + (sector_coherence × 0.10)
```

**Weight sum: 1.00** (enforced by validation)

**Component calculations:**

- **Novelty** (0–100): Inversely proportional to how many times this exact node combination has appeared in previous discoveries for this user. `novelty = 100 × (1 - seen_count / 10)`, floor 0.
- **Utility** (0–100): Based on the combined capability verb count and domain overlap. `utility = min(100, combined_verbs × 5 + domain_overlap_bonus)` where `domain_overlap_bonus` = 20 if candidate domain matches any chain node's sector.
- **Complexity** (0–100): `candidate_complexity × 100 × (chain_length / 6)` — longer chains with complex candidates score higher.
- **Composability** (0–100): Number of unique inter-node capability pairings. `composability = min(100, unique_pairings × 15)`.
- **Sector coherence** (0–100): 100 if all nodes share a sector, decreases by 20 per distinct sector. `coherence = max(0, 100 - (distinct_sectors - 1) × 20)`.

### 4.4 Tier Classification

| Tier | CJPI Range | Rarity |
|------|-----------|--------|
| Apex | 90–100 | ~2% of discoveries |
| Mythic | 75–89 | ~8% |
| Relic | 60–74 | ~15% |
| Prime | 45–59 | ~25% |
| Mint | 25–44 | ~30% |
| Raw | 0–24 | ~20% (filtered from results) |

**Quality floor:** Only discoveries with CJPI ≥ `QUALITY_FLOOR` (currently `1`) are returned. Raw tier is included but may be filtered in the UI.

### 4.5 Emergent Archetype Detection

When specific node combinations appear in a chain, the engine assigns an **archetype label**:

| Nodes Present | Archetype |
|--------------|-----------|
| DEFENSE + PHANTOM + candidate(security) | Invisible Fortress |
| BRAIN + ORACLE + candidate(intelligence) | Cognitive Oracle |
| HARVEST + EVOLUTION + candidate(synthesis) | Infinite Foundry |
| NERVE + REFLEX + candidate(hardware) | Neural Mesh |
| CONSCIENCE + GOVERNANCE + candidate(compliance) | Ethical Engine |
| ENGINEER + FORGE + candidate(infrastructure) | Autonomous Factory |
| SOVEREIGN + TREATY + candidate(finance) | Digital Sovereign |

Archetypes are presentation metadata and do not affect scoring.

### 4.6 Pacing & Suspense

Discovery results are returned immediately from the edge function, but the **client-side UI** implements artificial pacing for cinematic effect:

- **Initial delay:** Random 5–14 seconds (loading animation with orbital canvas)
- **Inter-node reveal delay:** Random 6–11 seconds per collision result
- **Early termination:** If any result scores CJPI ≥ 90, the engine stops exploring and returns immediately with a "Apex Discovery" fanfare

### 4.7 Discovery Persistence

All discovered chains are written to `artifact_registry`:

- `slug` — `discovery-{candidate_slug}-{chain_hash}`
- `category` — `"ascension-discovery"`
- `tier` — computed tier string
- `metadata` — `{ chain_nodes[], cjpi_score, archetype, capability_surface, source_export_language }`

---

## 5. Phase 3 — CRYSTALLIZATION

### 5.1 Pipeline

Crystallization converts raw discoveries into exportable capability artifacts.

**Three-stage pipeline:**

1. **Sampling** — Select the top N discoveries (max 5) by CJPI score
2. **Condensing** — Merge overlapping capability verbs and deduplicate node references
3. **Crystallizing** — Generate the artifact payload: implementation code scaffold, documentation, manifest

### 5.2 Crystallization Scoring

Each crystallized artifact receives a **crystallization quality score**:

```
crystal_quality = (cjpi_score × 0.6) + (chain_diversity × 0.2) + (capability_density × 0.2)
```

Where:
- `chain_diversity` = number of distinct sectors in the chain / 12 × 100
- `capability_density` = unique verbs / total chain length × 25

### 5.3 Persistence

Crystallized artifacts are written to `artifact_registry`:

- `slug` — `crystal-{discovery_slug}-{quality_hash}`
- `category` — `"ascension-crystal"`
- `tier` — inherited from discovery tier
- `metadata` — includes full crystallization payload, quality score, and `source_export_language`

---

## 6. Phase 4 — EXPORT

### 6.1 Language Lock

**Critical constraint:** Exports are permanently locked to the `source_export_language` detected during ingest. The edge function validates this:

```typescript
if (target_language !== source_export_language) {
  return error(400, "Export language must match source language");
}
```

The UI removes the language picker entirely for Ascension artifacts, displaying a "Locked to {language}" badge instead.

### 6.2 ZIP Bundle Structure

```
ascended-memory-{slug}/
├── manifest.json           // CJPI score, tier, provenance, chain metadata
├── original/               // Developer's original ingested files (unchanged)
│   ├── main.py
│   └── utils.py
├── src/                    // Substrate-enhanced versions
│   ├── main.py             // Enhanced with discovered capabilities
│   └── substrate_bridge.py // Mini runtime bridge
├── runtime/
│   └── mini_substrate.py   // Standalone mini runtime
├── docs/
│   ├── MEMORY-DETAILS.html // Cinematic functional description
│   ├── README.html         // Usage guide
│   └── LICENSE.html        // Distribution license
├── tests/
│   └── test_bench.py       // Generated test scaffold
└── build/
    └── config.json         // Build configuration
```

### 6.3 File Extension & Comment Style Mapping

The `zip-generator.ts` maintains mappings for 25+ languages:

| Language | Extension | Comment Style |
|----------|-----------|--------------|
| python | .py | # |
| typescript | .ts | // |
| javascript | .js | // |
| rust | .rs | // |
| golang | .go | // |
| php | .php | // |
| ruby | .rb | # |
| swift | .swift | // |
| kotlin | .kt | // |
| java | .java | // |
| csharp | .cs | // |
| cpp | .cpp | // |
| c | .c | // |
| lua | .lua | -- |
| dart | .dart | // |
| scala | .scala | // |
| elixir | .ex | # |
| haskell | .hs | -- |
| zig | .zig | // |
| verilog | .v | // |
| systemverilog | .sv | // |
| vhdl | .vhd | -- |
| bluespec | .bsv | // |
| spice | .spice | * |
| chisel | .scala | // |
| amaranth | .py | # |

### 6.4 Export Retirement

When a capability is exported, it is marked as `tier: "exported"` in the artifact registry. This **retires it from the active discovery pool**, encouraging the user to run new Ascension cycles to discover fresh capabilities.

### 6.5 Vault Discard

Users can discard unwanted crystallized artifacts. The `handleDiscard` function deletes from `artifact_registry` with a `user_id` guard:

```typescript
.delete()
.eq('id', artifact.id)
.eq('user_id', user.id)
```

---

## 7. Recursive Ingestion (Ascension Loop)

Ascended Memories can be re-ingested into the substrate:

```
Software → Ascension → Ascended Memory → Re-Ingest → Deeper Discovery → Higher-Tier Memory
```

The re-ingest process:

1. User uploads the exported `src/` files (not the originals)
2. Ingest detects the same `source_export_language`
3. New candidate node is registered with higher baseline complexity (substrate-enhanced code has more capability verbs)
4. Discovery explores new chains — previous chains are de-prioritized via novelty scoring
5. Deeper interactions may yield higher-tier (Mythic/Apex) discoveries

**Compounding effect:** Each cycle adds substrate capability patterns to the code, making it a richer collision target for subsequent cycles.

---

## 8. Internal Threshold Defaults (DO NOT EXTERNALIZE)

| Parameter | Value | Phase |
|-----------|-------|-------|
| Max file size | 1MB | INGEST |
| Per-file char cap | 16,384 | INGEST |
| Total char cap | 81,920 | INGEST |
| Circuit breaker failure threshold | 3 | INGEST |
| Circuit breaker max backoff | 32s | INGEST |
| CJPI novelty weight | 0.25 | DISCOVERY |
| CJPI utility weight | 0.30 | DISCOVERY |
| CJPI complexity weight | 0.20 | DISCOVERY |
| CJPI composability weight | 0.15 | DISCOVERY |
| CJPI coherence weight | 0.10 | DISCOVERY |
| Apex early-termination threshold | 90 | DISCOVERY |
| Quality floor (QUALITY_FLOOR) | 1 | DISCOVERY |
| Max crystallized per cycle | 5 | CRYSTALLIZATION |
| Crystal quality CJPI weight | 0.60 | CRYSTALLIZATION |
| Crystal quality diversity weight | 0.20 | CRYSTALLIZATION |
| Crystal quality density weight | 0.20 | CRYSTALLIZATION |
| Initial suspense delay | 5–14s | UI |
| Inter-node reveal delay | 6–11s | UI |
| Fingerprint epoch salt | SPARTA | GLOBAL |

---

## 9. Security Considerations

- All database queries filter by `user_id` — no cross-user data access
- RLS enforced on `artifact_registry` with `auth.uid() = user_id`
- Edge function validates `Authorization` header and extracts user from JWT
- Capability surface derivation runs server-side; raw source code never leaves the edge function
- Export ZIPs are generated client-side from stored metadata (source code is in the registry)
- PIN gate (`041041`) prevents casual URL discovery but is not a security boundary

---

## 10. Handling Policy

- **Record** all algorithmic details with exact weights and thresholds
- **Rotate** CJPI weights if externally discovered (update this doc + edge function)
- **Never externalize** the synergy scoring formula, permutation depth limits, or capability surface derivation logic
- **Preserve** the fingerprint epoch salt rotation path: SPARTA → ATHENA → TITAN

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-17 | System | Initial Ascension deep dive — v14.2.0 |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
