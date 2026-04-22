# 08 — Ascension V2 pipeline — full disclosure

**Audience:** Senior engineer
**Posture:** Full disclosure of secrets. No redaction.

---

## The state machine

`src/lib/ascension-v2/orchestrator.ts`

```
idle ─[initRun]─▶ idle ─[commitUpload]─▶ uploading ─auto─▶ analyzing
       ─[registerDiscovery × N]─▶ analyzing
       ─[beginLocking]─▶ locking
       ─[commitAscension]─▶ exporting
       ─[completeRun]─▶ done

  any state ─[failRun]─▶ error
```

Phase guards reject illegal transitions with explicit errors (e.g., `"Cannot upload in phase: analyzing"`).

## Pre-Ascension Gate

`src/lib/ascension-v2/pre-ascension-gate.ts`

Hard-fails before fingerprinting. Tier-1 (TS/JS/Python) gets language-aware checks; everything else gets balance scanning.

**Bracket balancer state machine handles:**
- Single/double/backtick strings with escape awareness
- Template-literal `${...}` substitutions (push template stack on `${`, pop on `}`)
- Block comments `/* */` and line comments `//`, `#`, `--`
- Python triple-quoted strings (`"""` and `'''`)
- PostgreSQL dollar-quoted strings (`$$...$$` and `$tag$...$tag$`)
- Regex literals via preceding-token heuristic: `/` is regex when prev non-space matches `[\(,=:!&|?{};]\s*$` or keyword `\b(return|typeof|in|of|new|throw|delete|void|await|yield)\s*$`
- Rust lifetime ticks (`'a`, `'static`) — `'` followed by identifier and not closed within ~16 chars

**Python-specific:** triple-quoted-docstring masking precedes structural checks so docstring prose doesn't false-positive. Block-opener detection requires `:` or implicit-continuation-open. Bare `try:` with no matching `except`/`finally` at same indent fails.

**Python 2 idiom rejection:** `except X, e:`, `raise X, "msg"`, `print x` (no parens).

## Source fingerprint

`src/lib/ascension-v2/fingerprint-gate.ts`

**FNV-1a 32-bit constants (DISCLOSED):**
- Offset basis: `0x811c9dc5`
- Prime: `0x01000193`

**Normalizer recipe (DISCLOSED):**
1. `/\/\/[^\n]*/g → ''` (line comments)
2. `/\/\*[\s\S]*?\*\//g → ''` (block comments)
3. `/#[^\n]*/g → ''` (Python/Ruby comments)
4. `/\s+/g → ' '` (collapse whitespace)
5. `/\s*([\(\)\[\]{};,:.<>+\-*/%=!?&|^~])\s*/g → '$1'` (strip spaces around punctuation)
6. `.trim()`

Result: 8-char hex fingerprint invariant under cosmetic reformatting, variant under structural change.

**Multi-file:** sort files by name, join with `// FILE: <name>\n` delimiter, hash as one stream.

**Artifact fingerprint (end of pipeline):**
```
fnv1a(sourceFp.hash : fnv1a(orderedLayerIds.join('|')) : fnv1a(orderedPhases.join(',')) : kernelVersion)
```

## Deterministic node ordering — LCG

`orchestrator.ts:125-138` — secret constants disclosed:

```typescript
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function fingerprintToSeed(fp: SourceFingerprint): number {
  return parseInt(fp.hash.slice(0, 8), 16) || 42;
}
```

**Numerical Recipes LCG** — multiplier `1664525`, increment `1013904223`, mask `0x7fffffff`. Seed = first 8 hex chars of source fingerprint, default `42`.

## Deduplication

`src/lib/ascension-v2/dedup.ts`

**Disclosed constants:**
- `MIN_CAPS = 4` (informational floor — never inflates beyond raw signal)
- `MAX_CAPS = 7` (hard ceiling)
- `SIMILARITY_THRESHOLD = 0.55` (below = same group)

**Normalizer regex:**
```
.toLowerCase()
.replace(/[^a-z0-9]/g, '')
.replace(/(capability|engine|layer|primitive|agent|module|system)/g, '')
```

**Algorithm:**
1. Sort raw discoveries by `cjpiScore` descending
2. For each cap: find existing group where `levenshtein(norm(name), norm(rep.name)) / max(len) < 0.55`; if none, new group
3. Within group, promote highest-scoring as representative
4. Sort groups by representative score descending
5. Take top `MAX_CAPS` (7)

The MIN floor never inflates output. Low-signal inputs may legitimately produce 1–3 capabilities.

## Audit chain

`src/lib/ascension-v2/audit-chain.ts`

**Genesis literal (DISCLOSED):** `'ascension-v2-genesis-0000'`

**Per-entry hash:** `fnv1a(${index}:${timestamp}:${action}:${detail}:${prevHash})`

**Chain verification:** walk from genesis, recompute every entry's hash, confirm each `prevHash === expectedPrev`. Any mismatch → `verifyChain() === false`.

**SHA-256 anchor (forensic):** `sha256(entries.map(e => e.hash).join(':'))` — written to `audit_chain_anchors` table at export.

Dual-hash design: FNV-1a for hot-path live ordering (fast), SHA-256 for trust-grade forensic anchoring (slow but unforgeable).

## CJPI™ — four-factor scoring

The four factors are public; the weight distribution is the trade secret being disclosed here.

**Current internal weights (HIGHLY CONFIDENTIAL — rotate if this leaks):**

| Factor | Weight | Drives |
|---|---|---|
| Novelty | 0.35 | How non-obvious the capability is from surface declarations |
| Utility | 0.25 | How well it composes with other discovered capabilities |
| Complexity | 0.20 | Depth of the structural chain to surface it |
| Composability | 0.20 | Wrappability by Mana governance |

Sum = 1.00. Score range `[0, 100]`. Threshold for "ascendable" = `≥ 65`.

**Epoch rotation:** weights are scheduled to rotate quarterly with each rotation logged to the audit chain. Current epoch: `2026-Q2`.

## Pre-Export Harness — six checks

`src/lib/ascension-v2/pre-export-harness.ts` — all six are CRITICAL; any failure aborts export.

| # | Check | Mechanism |
|---|---|---|
| 1 | Syntax/AST validity | `validateLayer2` + Python 2 idiom scanner on emitted code |
| 2 | L2 ↔ L1 linkage | Confirm every uploaded filename appears in emitted artifact |
| 3 | L1 fingerprint integrity | Confirm original source is verbatim substring of emitted artifact (≥ 95% line-presence fallback) |
| 4 | Layer auto-wire | Confirm wrapper symbol or layer name/id present in emitted artifact |
| 5 | Execution smoke | Confirm dispatch entry point + ≥ 1 handler regex match (per-language patterns including obfuscated `_h\d+` form) |
| 6 | Proof-of-firing | Per-layer: id present OR wrapper symbol present OR `cmpsbl_record_action('id')` call present; banner-only requires active call-site |

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
