# 08 — Ascension V2 pipeline — public architecture

**Audience:** Senior engineer
**Posture:** Structure disclosed. Constants, salts, weights, and thresholds withheld.

---

## State machine

`src/lib/ascension-v2/orchestrator.ts`

```
idle ─[initRun]─▶ idle ─[commitUpload]─▶ uploading ─auto─▶ analyzing
       ─[registerDiscovery × N]─▶ analyzing
       ─[beginLocking]─▶ locking
       ─[commitAscension]─▶ exporting
       ─[completeRun]─▶ done

  any state ─[failRun]─▶ error
```

Phase guards reject illegal transitions with explicit errors.

## Pre-Ascension Gate

`src/lib/ascension-v2/pre-ascension-gate.ts`

Hard-fails before fingerprinting. Tier-1 (TS / JS / Python) receives language-aware checks; everything else receives structural balance scanning.

**Categories handled** (specific grammar rules withheld):

- String / template literal / backtick handling with escape awareness
- Block / line / Python-style comments
- Triple-quoted Python strings
- PostgreSQL dollar-quoted strings
- Regex-vs-division disambiguation by preceding token
- Lifetime ticks in systems languages
- Python 2 idiom rejection (incompatible with Python 3 runtimes)
- Bare `try` with no matching handler

Failures emit structured `GateError` records with file, line, column, code, message, suggestion, and snippet.

## Source fingerprint

`src/lib/ascension-v2/fingerprint-gate.ts`

Uses the **FNV-1a 32-bit family** of structural hashes. The specific offset basis and prime in use are held internally.

**Normalizer recipe (categories disclosed):**

1. Strip line comments
2. Strip block comments
3. Strip script-style line comments (`#`)
4. Collapse whitespace runs to a single space
5. Strip whitespace around punctuation
6. Trim

Result: short hex fingerprint, invariant under cosmetic reformatting, variant under structural change.

**Multi-file:** sort by name, join with a deterministic delimiter, hash the joined stream.

**Artifact fingerprint (end of pipeline):** combines source fingerprint, manifest hash, phase order hash, and kernel version.

## Deterministic node ordering

A **linear-congruential generator** seeded from the source fingerprint provides reproducible permutation of node ordering. Same fingerprint → same permutation. The specific multiplier, increment, and mask are held internally.

## Deduplication

`src/lib/ascension-v2/dedup.ts`

**Algorithm shape (constants withheld):**

1. Sort raw discoveries by CJPI score descending
2. For each capability: find an existing group where normalized Levenshtein similarity is below the configured threshold; if none, start a new group
3. Promote the highest-scoring member as the group representative
4. Sort groups by representative score descending
5. Cap the final list at the configured maximum

The normalizer collapses case, removes punctuation, and strips taxonomy suffix words.

## Audit chain

`src/lib/ascension-v2/audit-chain.ts`

**Structure disclosed:** entries are `{ index, timestamp, action, detail, prevHash, hash }`. The per-entry hash uses FNV-1a over a deterministic concatenation of fields including the previous entry's hash. The chain originates from a literal genesis identifier (held internally).

**Chain verification:** walk from genesis, recompute every entry hash, confirm `prevHash === expectedPrev`. Any mismatch → `verifyChain() === false`.

**SHA-256 anchor (forensic):** SHA-256 of the joined entry hashes, persisted to `audit_chain_anchors` at export.

Dual-hash design: FNV-1a for hot-path live ordering; SHA-256 for trust-grade anchoring.

## CJPI™ — four-factor scoring

The four factors are public; the weights are trade secret.

| Factor | Drives |
|---|---|
| **Novelty** | How non-obvious the capability is from surface declarations |
| **Utility** | How well it composes with other discovered capabilities |
| **Complexity** | Depth of structural chain to surface it |
| **Composability** | Wrappability by Mana governance |

Weights sum to 1.00. Score range `[0, 100]`. The "ascendable" threshold is held internally and rotated on an epoch schedule.

## Pre-Export Harness — six checks

`src/lib/ascension-v2/pre-export-harness.ts` — all six are critical; any failure aborts export.

| # | Check | What it confirms |
|---|---|---|
| 1 | Syntax / AST validity | Emitted artifact parses in target runtime |
| 2 | Layer-2 ↔ Layer-1 linkage | Every uploaded filename is referenced |
| 3 | Layer-1 fingerprint integrity | Original source is verbatim within emitted artifact |
| 4 | Layer auto-wire | Wrapper symbol or layer identifier is present |
| 5 | Execution smoke | Dispatch entry point and at least one handler are present |
| 6 | Proof-of-firing | Per-layer evidence the wrapper actually runs |

---

© 2025–2026 CMPSBL®
