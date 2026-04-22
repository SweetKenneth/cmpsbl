# 06 — Provisional Spec Summary: Ascension™ (USPTO 64/029,678)

**Public summary.** Mirrors the structure of the filed provisional held by counsel. The full claim language and the internal scoring constants are held with counsel.

---

## TITLE

Deterministic method for discovering and certifying latent architectural capabilities in arbitrary source code via structural collision against a fixed primitive matrix.

## FIELD

Software analysis; deterministic capability discovery; computational architecture certification; structural fingerprinting of source code.

## BACKGROUND

Conventional code-analysis systems (static analyzers, AI classifiers, linting frameworks) suffer from one or more of: (a) non-determinism — outputs vary across runs against identical inputs; (b) black-box reasoning — outputs cannot be re-derived from the inputs without re-invoking opaque models; (c) limited reproducibility — outputs depend on tool versions, model checkpoints, or environmental state. There is no prior method that takes arbitrary source code and produces a certified, fingerprinted, deterministic report of the architectural capabilities the code exhibits.

## SUMMARY

Disclosed is a method comprising: receiving source code; computing a structural fingerprint of the code via a normalization-then-FNV-1a pipeline; colliding the code against a fixed matrix of forty (40) primitives organized into four taxonomic categories (twelve Organs, twelve Layers, eight Engines, eight Agents); scoring each emergent capability via a four-factor index (Novelty, Utility, Complexity, Composability) hereinafter the Crown Jewel Pipeline Index™ (CJPI™); deduplicating raw discoveries via normalized Levenshtein similarity; appending each pipeline event to a Merkle-linked audit chain with FNV-1a per-entry hashing and SHA-256 anchoring; sealing the resulting artifact with a second fingerprint that combines source fingerprint, manifest hash, phase order hash, and kernel version.

## DETAILED DESCRIPTION (overview)

The pipeline is a state machine: `idle → uploading → analyzing → locking → exporting → done` with `error` reachable from any state. Each transition is appended to an immutable audit chain.

A **Pre-Ascension Gate** rejects parse-invalid source before fingerprinting. Tier-1 languages (TypeScript, JavaScript, Python) receive language-aware structural validation; other languages receive structural balance checks.

The **source fingerprint** is computed by a normalize-then-hash pipeline using the FNV-1a family of structural hashes. The normalizer strips comments, collapses whitespace, and removes spaces around punctuation. Multi-file inputs are sorted by name and concatenated with a deterministic delimiter prior to normalization.

The **40-primitive matrix** is encoded as a frozen build-time constant; a runtime length assertion enforces the count.

**Discoveries** are scored along four orthogonal factors. The four-factor structure is disclosed; the weighting distribution is held as trade secret and rotated on an epoch schedule. **Deduplication** uses normalized Levenshtein grouping with a fixed similarity threshold and a hard ceiling on the final capability count.

The **audit chain** uses a literal genesis hash and per-entry hashes that include the previous entry's hash. A SHA-256 anchor of the joined entry hashes provides forensic-grade verification. Genesis literals and salts are held internally.

A **Pre-Export Harness** runs six deterministic checks: syntax validity, layer-linkage, fingerprint integrity, layer auto-wire presence, execution smoke test, and per-layer proof-of-firing. Any critical failure aborts export.

## CLAIMS (twenty)

1. A computer-implemented method for deterministic discovery of latent architectural capabilities in source code, comprising: receiving source code; structurally normalizing the source; computing a structural fingerprint of the normalized source via a Fowler-Noll-Vo (FNV-1a) family hash; colliding the source against a fixed matrix of exactly forty (40) primitives; scoring each emergent capability on four orthogonal factors; deduplicating discoveries via normalized Levenshtein grouping; appending each pipeline event to a Merkle-linked audit chain.

2. The method of claim 1, wherein the forty primitives are organized into four taxonomic categories of twelve Organs, twelve Layers, eight Engines, and eight Agents.

3. The method of claim 1, wherein the four scoring factors are Novelty, Utility, Complexity, and Composability.

4. The method of claim 1, wherein the audit chain genesis is a literal string identifier and each entry's hash includes the previous entry's hash.

5. The method of claim 1, further comprising computing a second fingerprint after artifact assembly that combines source fingerprint, manifest hash, phase-order hash, and kernel version.

6. The method of claim 1, wherein the deduplication similarity threshold is held constant across runs and the maximum capability count is bounded by a fixed ceiling.

7. The method of claim 1, further comprising a Pre-Ascension Gate that hard-fails on parse-invalid source before fingerprinting.

8. The method of claim 7, wherein the Pre-Ascension Gate detects and rejects language-version idioms incompatible with the declared target runtime.

9. The method of claim 1, further comprising a Pre-Export Harness that verifies syntax validity, byte-perfect Layer-1 preservation, and per-layer proof-of-firing prior to artifact emission.

10. The method of claim 1, wherein deterministic node ordering is achieved via a pseudo-random generator seeded from the source fingerprint.

11. The method of claim 1, wherein the audit chain is dual-hashed: per-entry FNV-1a for live ordering, and periodic cryptographic anchors of the joined entry hashes for forensic anchoring.

12. The method of claim 1, wherein the matrix size of exactly forty is enforced by a build-time runtime assertion that prevents drift.

13. A non-transitory computer-readable medium storing instructions that when executed perform the method of claim 1.

14. A system comprising at least one processor configured to perform the method of claim 1.

15. The method of claim 1, wherein the same input source produces the same fingerprint, the same dedup result, and the same artifact fingerprint across independent runs.

16. The method of claim 1, wherein the structural normalization preserves identifier sequence and operator sequence while collapsing all forms of whitespace and comments.

17. The method of claim 1, wherein the multi-file fingerprint is computed by deterministic name-sorted concatenation prior to normalization.

18. The method of claim 1, further comprising emitting the certified capability set as a self-contained artifact in any of multiple supported programming languages from a single specification.

19. The method of claim 1, wherein the emitted artifact contains the original source byte-perfect within the wrapper file rather than as a sibling import.

20. The method of claim 1, performed without invocation of any large language model or external machine-learning inference.

## ABSTRACT

A deterministic method for discovering, scoring, fingerprinting, and certifying latent architectural capabilities in arbitrary source code. The method collides input source against a fixed matrix of forty primitives, scores emergent capabilities on a four-factor index, deduplicates via normalized Levenshtein grouping, and seals the result with a Merkle-linked audit chain. Same input plus same matrix state produces the same output, byte-for-byte, across independent runs. No machine learning is invoked.

---

© 2025–2026 CMPSBL® · public summary
