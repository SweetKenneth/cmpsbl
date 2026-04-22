# 11 — Correctness arguments

**Audience:** Skeptical engineer
**Posture:** Arguments rather than full proofs; the proofs (with secret constants substituted in) live in the internal case-study.

---

## Argument 1 — Source fingerprint determinism

**Claim.** For any source string `s` and language `L`, `computeFingerprint(s, L).hash` is constant across any two invocations.

**Argument.** `normalizeSource` is a pure function of `s` (each regex is locally constructed; no `lastIndex` state leaks). FNV-1a is a pure function of input bytes; the offset basis and prime are constants. JavaScript's `Math.imul` produces identical 32-bit results across V8, JavaScriptCore, and SpiderMonkey. The output formatting (`padStart(8, '0')`, `>>> 0`) is deterministic. ∴ `hash` is a pure function of `s`.

**Corollary.** `computeMultiFileFingerprint` sorts by name with `localeCompare` (default ordering — stable across runs in the same engine), then joins with a deterministic delimiter.

## Argument 2 — Audit chain tamper-evidence

**Claim.** Modifying any field of any audit entry without recomputing all subsequent `hash` values causes `verifyChain()` to return `false`.

**Argument.** Let entry `i` have fields `{index, timestamp, action, detail, prevHash, hash}`. Modify field `f` of entry `i`:

- **`f === 'hash'`:** verifier recomputes `hash` from the other fields; recomputed ≠ stored → false.
- **`f ∈ {index, timestamp, action, detail, prevHash}`:** recomputed `hash` ≠ stored `hash` → false at entry `i`. Even if the attacker also patches `hash` to match, then for entry `i+1`, `prevHash !== expectedPrev` → false at entry `i+1`. Cascading failure.

The cascading property is the headline guarantee: a single byte change anywhere in the chain breaks every subsequent verification.

## Argument 3 — Lex determinism (formalized)

**Claim.** For any registry state `R` and tuple `(c, t, m, x)`, `evaluate(c, t, m, x)` returns the same `(verdict, ruleId)` across runs.

**Argument.** The comparator `(a, b) => a.priority !== b.priority ? a.priority - b.priority : a.createdAt - b.createdAt` is a total order on rules with distinct `(priority, createdAt)`. Tie at both keys is statistically negligible (createdAt is ms-resolution; rule IDs include a monotonic counter). Iteration returns the same first match deterministically. Mode-based default is a constant. ∴ output is a function of input.

## Argument 4 — Seeded shuffle reproducibility

**Claim.** `seededShuffle(arr, seed)` returns the same permutation for the same `(arr, seed)` across runs.

**Argument.** A linear-congruential generator (LCG) with frozen multiplier, increment, and mask is deterministic given seed. Each iteration mutates a single pair indexed by `s_n % (i+1)`. Same seed → same sequence of `s_n` → same sequence of pair swaps → same final permutation. (Specific LCG constants held internally.)

## Argument 5 — Wrapper composition phase ordering

**Claim.** When N capabilities attach to function `f`, wrappers compose in deterministic phase order with deterministic intra-phase tiebreak.

**Argument.** Composition uses `byPhaseThenName` — primary key `CAPABILITY_PHASE[cap]` (frozen), secondary key alphabetical by capability name. Sort is stable. Same input set → same composition.

## Argument 6 — Source preservation under wrap

**Claim.** For wrapped function `f` with original source `s`, the SHA-256 of the embedded source equals `hostSourceHash` computed at attach time.

**Argument.** `hostSourceHash = sha256(s)` at attach. Pre-Export Harness check #3 verifies the verbatim string `s` appears as a contiguous substring of the emitted artifact (with a documented line-presence fallback for cases where the host language requires escaping). If neither, harness fails. ∴ on successful export, `s` is byte-perfect inside the artifact, and `sha256(extracted_s) === hostSourceHash`.

## Argument 7 — Pipeline determinism (composite)

**Claim.** Same input source + same matrix state + same scoring weights + same registry + same kernel version → same `artifactFingerprint.hash` across runs.

**Argument.** All four components of `computeArtifactFingerprint` (source fingerprint, manifest hash, phase order hash, kernel version) are deterministic functions of inputs. FNV-1a of a deterministic concatenation is deterministic.

## Limits we acknowledge

- **FNV-1a is non-cryptographic.** We use it for structural identity, not adversarial integrity. SHA-256 anchors are the cryptographic backstop.
- **Lex assumes single-threaded mutation per session.** `createSession()` enforces session scoping.
- **Floating-point determinism in CJPI scoring** is bounded by IEEE 754 behavior of the host JS engine; cross-engine variance is minor and disclosed in the public roadmap.

---

© 2025–2026 CMPSBL®
