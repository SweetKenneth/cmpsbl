# 41 — CMPSBL® Mini-Runtime™ Engine

**Classification:** 🔒 INTERNAL — Trade Secret  
**Version:** v14.2.0 — MINDGAMES Epoch

---

## 1. Purpose

This document describes the CMPSBL® Mini-Runtime™ Engine — the portable, zero-dependency micro-substrate that ships with every discovery export and S-Tier Vault ZIP. The Mini-Runtime™ is the **only** substrate code that leaves the perimeter, and it provides everything needed to run, score, and orchestrate discovered capabilities independently.

## 2. Design Philosophy

The Mini-Runtime™ exists because exported discoveries must be **fully standalone**. Customers who purchase or download a capability must be able to:

1. Run it in any TypeScript/Node environment
2. Re-score discoveries using the same CJPI algorithm
3. Orchestrate multi-step memory chains without the substrate
4. Store and retrieve data using pluggable adapters

**Zero external dependencies. Pure TypeScript. Drop-in ready.**

## 3. Architecture

### 3.1 File: `src/lib/export/standalone-runtime.ts`

The Mini-Runtime™ is a single ~600-line TypeScript file containing 8 subsystems:

```
┌──────────────────────────────────────────┐
│       CMPSBL® Mini-Runtime™ Engine       │
├──────────────────────────────────────────┤
│  §1  Pluggable Storage Adapter          │
│  §2  Deterministic Hashing (SHA-256)    │
│  §3  CJPI Scoring Engine               │
│  §4  Auto-Tiering Thresholds           │
│  §5  Finite State Machine              │
│  §6  Dependency Graph (Topo Sort)       │
│  §7  Pipeline Composer                  │
│  §8  Saga Orchestrator                  │
└──────────────────────────────────────────┘
```

### 3.2 Subsystem Details

#### §1 — Pluggable Storage Adapter

```typescript
interface StorageAdapter {
  get<T>(collection: string, id: string): Promise<T | null>;
  list<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]>;
  put<T extends { id: string }>(collection: string, item: T): Promise<void>;
  putMany<T extends { id: string }>(collection: string, items: T[]): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  count(collection: string, filter?: Record<string, unknown>): Promise<number>;
}
```

- Default implementation: `InMemoryStorageAdapter` (uses `Map<string, Map<string, unknown>>`)
- Customers can swap in any database adapter (PostgreSQL, Redis, SQLite, etc.)
- All runtime subsystems use the adapter for persistence

#### §2 — Deterministic Hashing

- Primary: `SHA-256` via Web Crypto API (when available)
- Fallback: `djb2` hash (pure math, works everywhere)
- Used for: deduplication, manifest verification, content addressing

#### §3 — CJPI Scoring Engine

The full Crown Jewel Pipeline Index computation, identical to the substrate version:

```
CJPI = (0.25 × novelty + 0.30 × utility + 0.20 × complexity + 0.25 × composability) × 100
```

| Factor | Computation |
|--------|-------------|
| Novelty | `1 - max(cosine_similarity(candidate, existing_set))` |
| Utility | Heuristic based on module chain composition |
| Complexity | `chain_depth × dependency_diversity × integration_score` |
| Composability | `compatible_extensions / max_possible_extensions` |

**Utility heuristic bonuses:**
- NEXUS (routing) present → +0.15
- BRAIN/MEMORY (cognitive) present → +0.10
- DEFENSE (security) present → +0.10
- Cross-zone chains → +0.20

#### §4 — Auto-Tiering

| Tier | Threshold | Label |
|------|-----------|-------|
| S | ≥ 85 | Apex |
| A | ≥ 70 | Mythic |
| B | ≥ 55 | Relic |
| C | ≥ 40 | Prime |
| D | < 40 | Mint |

#### §5 — Finite State Machine

General-purpose FSM for workflow lifecycle management:
- States: `idle`, `running`, `paused`, `completed`, `failed`
- Transition validation (illegal transitions rejected)
- Event emission on state changes
- Used by the Pipeline Composer for stage management

#### §6 — Dependency Graph

- Topological sort for execution ordering
- Cycle detection (rejects circular dependencies)
- Used to validate pipeline stage ordering before execution

#### §7 — Pipeline Composer

- Stage registry with validation
- Sequential stage execution with input/output chaining
- Error propagation with stage-level granularity
- Supports `beforeStage` and `afterStage` hooks

#### §8 — Saga Orchestrator

- Compensating transactions for multi-step operations
- Automatic rollback on failure
- Step-level success/failure tracking
- Used for complex pipeline operations that need atomicity guarantees

## 4. What Ships vs. What Stays

| Component | Ships in Export? | Notes |
|-----------|-----------------|-------|
| Mini-Runtime™ (`standalone-runtime.ts`) | ✅ Yes | Full source, unobfuscated |
| Discovery Engine (`standalone-discovery-engine.ts`) | ✅ Yes | Portable scorer/re-ranker |
| Reactor source (`src/lib/discovery/reactor.ts`) | ❌ Never | Trade secret |
| Substrate modules (BRAIN, NEXUS, etc.) | ❌ Never | Internal only |
| Node resolver implementations | ❌ Never | Internal only |
| INTENT mesh routing | ❌ Never | Internal only |

## 5. Bundle Structure

Every export ZIP containing the Mini-Runtime™ follows this structure:

```
cmpsbl-export-{language}-{timestamp}/
├── src/                          — Generated source code
│   └── {discovery-name}.{ext}    — Primary implementation
├── test/                         — Auto-generated test harness
│   └── {discovery-name}_test.{ext}
├── _runtime/
│   ├── standalone-runtime.ts     — CMPSBL® Mini-Runtime™ Engine
│   └── standalone-discovery-engine.ts
├── Makefile                      — Build & test commands
├── {package-manifest}            — Language-specific manifest
├── LICENSE                       — CMPSBL® Proprietary License
└── README.md                     — Usage instructions + branding
```

## 6. Branding Requirements

All exports must include the following in generated README and LICENSE files:

```
Powered by CMPSBL® Mini-Runtime™ Engine
© CMPSBL® — All rights reserved.
```

The Mini-Runtime™ name must appear:
- In the file header comment of `standalone-runtime.ts`
- In the README.md of every export ZIP
- In the LICENSE file
- In the `runtime` field of `manifest.json` (value: `cmpsbl-mini-runtime-engine`)

## 7. Versioning

The Mini-Runtime™ version tracks the substrate version:
- Current: v14.2.0 (MINDGAMES Epoch)
- The runtime version is embedded in the `RUNTIME_VERSION` constant
- Exported manifests include the runtime version for compatibility tracking

## 8. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Algorithm exposure | CJPI formula is public (published in academic papers). Weights are the trade secret — but they ship in the runtime for functional correctness. Acceptable risk. |
| Reverse engineering | The runtime is functional code, not obfuscated. But it represents <1% of substrate value. The 40-primitive matrix, NEXUS routing, INTENT mesh, and CLM are the real moat. |
| Customer modification | Customers may modify the runtime. Modified runtimes lose CMPSBL® certification and warranty. |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | Initial CMPSBL® Mini-Runtime™ Engine documentation — v14.2.0 |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
