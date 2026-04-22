# 11 — Formal correctness proofs

**Audience:** Senior engineer / skeptical reviewer

---

## Proof 1 — Source fingerprint determinism

**Claim.** For any source string `s` and language `L`, `computeFingerprint(s, L).hash` is constant across any two invocations on any two machines with the same UTF-16 encoding.

**Proof.**
1. `normalizeSource` is a pure function of `s`: each regex replacement is deterministic (no `g` flag side effects, no `lastIndex` state because each call uses a fresh local `RegExp` literal in the source text).
2. FNV-1a is a pure function of its input bytes: the offset basis (`0x811c9dc5`) and prime (`0x01000193`) are constants; `Math.imul` is spec'd to produce identical 32-bit results across V8/JSCore/SpiderMonkey.
3. `padStart(8, '0')` and `>>> 0` are deterministic transformations.
∴ `hash` is a pure function of `s`. ∎

**Corollary (multi-file).** `computeMultiFileFingerprint` sorts by `name.localeCompare(b.name)` before joining. `localeCompare` without a locale arg uses Default Ordering — stable across runs in the same JS engine. ∎

## Proof 2 — Audit chain tamper-evidence

**Claim.** Modifying any field of any audit entry without recomputing all subsequent `hash` values causes `verifyChain()` to return `false`.

**Proof.** Let entry `i` have fields `{index, timestamp, action, detail, prevHash, hash}` where `hash = fnv1a(...)`. Modify field `f` of entry `i` to `f'`. Two cases:
- `f === 'hash'`: `verifyChain()` recomputes `hash` from the other fields; recomputed ≠ stored → false.
- `f ∈ {index, timestamp, action, detail, prevHash}`: recomputed `hash` ≠ stored `hash` → false at entry `i`. Even if attacker also updates `hash` to match modified `f`, then for entry `i+1`, `prevHash !== expectedPrev` (where `expectedPrev` was the original entry `i`'s hash) → false at entry `i+1`. Cascading failure. ∎

## Proof 3 — Lex determinism (formalized)

**Claim.** For any registry state `R` and tuple `(c, t, m, x)`, `evaluate(c, t, m, x)` returns the same `(verdict, ruleId)` across runs.

**Proof.**
1. The sort comparator `(a, b) => a.priority !== b.priority ? a.priority - b.priority : a.createdAt - b.createdAt` is a total order on rules with distinct `(priority, createdAt)`.
2. Tie at `(priority, createdAt)` is statistically negligible (createdAt is `Date.now()` ms-resolution; rule IDs include a monotonic counter that prevents identity collision).
3. Array iteration `for (const rule of sorted)` returns the same first match deterministically.
4. `mode`-based default is a constant lookup.
∴ Output is a function of input. ∎

## Proof 4 — Seeded shuffle reproducibility

**Claim.** `seededShuffle(arr, seed)` returns the same permutation for the same `(arr, seed)` across runs.

**Proof.** The LCG `s_{n+1} = (s_n * 1664525 + 1013904223) & 0x7fffffff` is deterministic given seed. Each iteration mutates a single pair indexed by `s_n % (i+1)`. Same seed → same sequence of `s_n` → same sequence of pair swaps → same final permutation. ∎

## Proof 5 — Wrapper composition phase ordering

**Claim.** When N capabilities attach to function `f`, wrappers compose in deterministic phase order (GATE → VALIDATE → FAILSAFE → OBSERVE → ANALYZE), with intra-phase alphabetical ordering.

**Proof.** Composition uses the comparator `byPhaseThenName` (engine.ts:109): primary key `CAPABILITY_PHASE[cap]` (frozen constant), secondary key `cap.localeCompare(b.cap)` (deterministic). Sort is stable. ∎

## Proof 6 — Source preservation under wrap

**Claim.** For wrapped function `f` with original source `s`, the SHA-256 of the embedded source equals `hostSourceHash` computed at attach time.

**Proof.** `hostSourceHash = sha256(s)` at attach (engine.ts:141). Pre-Export Harness check #3 (pre-export-harness.ts:164-218) verifies the verbatim string `s` appears as a contiguous substring of the emitted artifact, OR ≥ 95% of `s`'s non-empty lines are present. If neither, harness fails. ∴ on successful export, `s` is byte-perfect inside the artifact, and `sha256(extracted_s) === hostSourceHash`. ∎

## Proof 7 — Pipeline determinism (composite)

**Claim.** Same input source + same matrix state + same scoring weights + same registry + same kernel version → same `artifactFingerprint.hash` across runs.

**Proof.**
- `sourceFingerprint.hash` is deterministic (Proof 1).
- `manifestHash = fnv1a(orderedLayerIds.join('|'))` — input is the user-selected layer set; ordering is determined by phase + alphabetical (Proof 5).
- `phaseOrderHash = fnv1a(orderedPhases.join(','))` — derived from layer set.
- `kernelVersion` is a literal constant per build.
∴ All four components of `computeArtifactFingerprint` are deterministic functions of inputs. FNV-1a of a deterministic concatenation is deterministic. ∎

## What these proofs do NOT cover

- **Adversarial collision attacks on FNV-1a.** FNV is non-cryptographic. We use it for structural identity, not adversarial integrity. The SHA-256 anchor (audit chain, host source hash) is the cryptographic backstop.
- **Time-based race conditions in concurrent registration.** Lex assumes single-threaded mutation per session. The `createSession()` API enforces session scoping.
- **Floating-point determinism in CJPI scoring.** Scores are computed in IEEE 754 double; cross-engine determinism requires same JS implementation. We accept this; it's a known limitation documented in the public roadmap.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
