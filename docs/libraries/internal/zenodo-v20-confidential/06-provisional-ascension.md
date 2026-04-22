# 06 — Provisional Spec Draft: Ascension™ (USPTO 64/029,678)

**Filing-style draft.** This mirrors the structure of the actual filed provisional held by counsel. Use as continuation-drafting input or diligence reference. Not a substitute for the filed document.

---

## TITLE

DETERMINISTIC METHOD FOR DISCOVERING AND CERTIFYING LATENT ARCHITECTURAL CAPABILITIES IN ARBITRARY SOURCE CODE VIA STRUCTURAL COLLISION AGAINST A FIXED PRIMITIVE MATRIX

## FIELD OF THE INVENTION

Software analysis; deterministic capability discovery; computational architecture certification; structural fingerprinting of source code.

## BACKGROUND

Conventional code-analysis systems (static analyzers, AI classifiers, linting frameworks) suffer from one or more of: (a) non-determinism — outputs vary across runs against identical inputs; (b) black-box reasoning — outputs cannot be re-derived from the inputs without re-invoking opaque models; (c) limited reproducibility — outputs depend on tool versions, model checkpoints, or environmental state. There is no prior method that takes arbitrary source code and produces a certified, fingerprinted, deterministic report of the architectural capabilities the code exhibits.

## SUMMARY

Disclosed is a method comprising: receiving source code; computing a structural fingerprint of the code via a normalization-then-FNV-1a pipeline; colliding the code against a fixed matrix of forty (40) primitives organized into four taxonomic categories (twelve Organs, twelve Layers, eight Engines, eight Agents); scoring each emergent capability via a four-factor index (Novelty, Utility, Complexity, Composability) hereinafter the Crown Jewel Pipeline Index™ (CJPI™); deduplicating raw discoveries via normalized Levenshtein similarity; appending each pipeline event to a Merkle-linked audit chain with FNV-1a per-entry hashing and SHA-256 anchoring; sealing the resulting artifact with a second fingerprint that combines source fingerprint, manifest hash, phase order hash, and kernel version.

## DETAILED DESCRIPTION

### Pipeline overview

```
Upload → Pre-Ascension Gate → Source Fingerprint → Discovery (collision)
       → Scoring (CJPI) → Dedup → Lock → Pre-Export Harness
       → Artifact Fingerprint → Export
```

Each transition is appended to an immutable audit chain. The pipeline is a state machine with phases `idle | uploading | analyzing | locking | exporting | done | error`.

### Pre-Ascension Gate

Before fingerprinting, every uploaded file is passed through a parser-driven gate. Tier-1 languages (TypeScript, JavaScript, Python) receive language-aware structural validation including: bracket/quote balancing with template-literal substitution awareness, regex-vs-division disambiguation via preceding-token heuristic, PostgreSQL dollar-quoted string handling, Python triple-quoted docstring masking, Python 2 idiom rejection (`except X, e`, `raise X, msg`, `print` statement), and incomplete `try` block detection. Non-Tier-1 languages receive structural balance checking. Failures emit structured `GateError` records with file, line, column, code, message, suggestion, and snippet.

### Source Fingerprint

Source is normalized by stripping comments (single-line, block, and Python `#`), collapsing whitespace, and removing spaces around punctuation. The normalized output is hashed with FNV-1a 32-bit using offset basis `0x811c9dc5` and prime `0x01000193`. The result is an 8-character hex fingerprint that is invariant across cosmetic reformatting but variant across structural change. For multi-file uploads, files are sorted by name, joined with a `// FILE: <name>\n` delimiter, and hashed as a single normalized stream.

### The 40-primitive matrix

A fixed array of 40 primitive identifiers, decomposed as `[...12 Organs, ...12 Layers, ...8 Engines, ...8 Agents]`. The matrix is encoded as a frozen build-time constant with a runtime length assertion (`length === 40`) that fails the build on drift.

### Collision and scoring

For each primitive in the matrix, the discovery engine evaluates whether the input source structurally exhibits that primitive's signature. Emergent capabilities are scored along four factors:

- **Novelty** — degree to which the capability is non-obvious from the surface declarations
- **Utility** — degree to which the capability composes with other discovered capabilities
- **Complexity** — depth of the structural chain required to surface the capability
- **Composability** — degree to which the capability is wrappable by Mana governance

The four-factor structure is disclosed; the weighting distribution is held as trade secret and rotated on an epoch schedule.

### Deduplication

Raw discoveries are reduced to between four and seven unique capabilities by: (1) normalizing capability names (lowercase, strip non-alphanumerics, strip the substrings `capability|engine|layer|primitive|agent|module|system`); (2) computing pairwise normalized Levenshtein distance; (3) grouping discoveries with similarity below threshold `0.55`; (4) keeping the highest-scoring representative per group; (5) sorting groups by representative score descending; (6) capping at `MAX_CAPS = 7`. The MIN floor (`4`) is informational only and never inflates discoveries beyond what the input produced.

### Audit chain

Each pipeline event is appended as an entry containing `{ index, timestamp, action, detail, prevHash, hash }`. The per-entry hash is FNV-1a of `${index}:${timestamp}:${action}:${detail}:${prevHash}`. The chain originates from a literal genesis hash `ascension-v2-genesis-0000`. Chain integrity is verified by re-computing every entry hash and confirming the link from genesis is unbroken. A SHA-256 anchor of the joined entry hashes is computed for forensic-grade verification.

### Pre-Export Harness

Before artifact emission, six deterministic checks gate the export: (1) syntax/AST validity, (2) Layer-2 ↔ Layer-1 linkage, (3) Layer-1 fingerprint integrity (byte-perfect verbatim embed), (4) layer auto-wire presence, (5) execution smoke test with at least one handler, (6) per-layer proof-of-firing verification. Any critical failure aborts export.

### Artifact Fingerprint

After harness pass, a second fingerprint seals the executed chain: `fnv1a(sourceFp : manifestHash : phaseOrderHash : kernelVersion)`. This second fingerprint resolves at `/verify/:fingerprint` to prove the artifact corresponds to an unmodified source + manifest + phase order + kernel combination.

### Determinism guarantees

- Same source + same matrix state = same fingerprint
- Same fingerprint = same seeded shuffle (LCG with multiplier `1664525`, increment `1013904223`, mask `0x7fffffff`, seed = first 8 hex chars of fingerprint)
- Same shuffle = same node ordering = same discovery sequence
- Same discovery sequence + same scoring weights = same CJPI ranking
- Same ranking + same dedup threshold = same final capability set

## CLAIMS

1. A computer-implemented method for deterministic discovery of latent architectural capabilities in source code, comprising: receiving source code in any supported language; structurally normalizing the source by stripping comments and collapsing whitespace; computing a Fowler-Noll-Vo (FNV-1a) hash of the normalized source as a structural fingerprint; colliding the source against a fixed matrix of exactly forty (40) primitives; scoring each emergent capability on four orthogonal factors; deduplicating discoveries via normalized Levenshtein grouping; appending each pipeline event to a Merkle-linked audit chain.

2. The method of claim 1, wherein the forty primitives are organized into four taxonomic categories of twelve Organs, twelve Layers, eight Engines, and eight Agents.

3. The method of claim 1, wherein the four scoring factors are Novelty, Utility, Complexity, and Composability.

4. The method of claim 1, wherein the audit chain genesis is a literal string identifier and each entry's hash includes the previous entry's hash.

5. The method of claim 1, further comprising computing a second fingerprint after artifact assembly that combines source fingerprint, manifest hash, phase-order hash, and kernel version.

6. The method of claim 1, wherein the deduplication similarity threshold is held constant across runs and the maximum capability count is capped at seven (7).

7. The method of claim 1, further comprising a Pre-Ascension Gate that hard-fails on parse-invalid source before fingerprinting.

8. The method of claim 7, wherein the Pre-Ascension Gate detects and rejects Python 2 idioms incompatible with Python 3 execution.

9. The method of claim 1, further comprising a Pre-Export Harness that verifies syntax validity, Layer-1 byte-perfect preservation, and per-layer proof-of-firing prior to artifact emission.

10. The method of claim 1, wherein deterministic node ordering is achieved via a linear-congruential pseudo-random generator seeded from the source fingerprint.

11. The method of claim 1, wherein the audit chain is dual-hashed: per-entry FNV-1a for live ordering, and periodic SHA-256 of joined entry hashes for forensic anchoring.

12. The method of claim 1, wherein the matrix size of exactly forty is enforced by a build-time runtime assertion that prevents drift.

13. A non-transitory computer-readable medium storing instructions that when executed perform the method of claim 1.

14. A system comprising at least one processor configured to perform the method of claim 1.

15. The method of claim 1, wherein the same input source produces the same fingerprint, the same dedup result, and the same artifact fingerprint across independent runs.

16. The method of claim 1, wherein the structural normalization preserves identifier sequence and operator sequence while collapsing all forms of whitespace and comments.

17. The method of claim 1, wherein the multi-file fingerprint is computed by deterministic name-sorted concatenation prior to normalization.

18. The method of claim 1, further comprising emitting the certified capability set as a self-contained artifact in any of thirty-four native programming languages.

19. The method of claim 1, wherein the emitted artifact contains the original source byte-perfect within the wrapper file rather than as a sibling import.

20. The method of claim 1, performed without invocation of any large language model or external machine-learning inference.

## ABSTRACT

A deterministic method for discovering, scoring, fingerprinting, and certifying latent architectural capabilities in arbitrary source code. The method collides input source against a fixed matrix of forty primitives, scores emergent capabilities on a four-factor index, deduplicates via normalized Levenshtein grouping, and seals the result with a Merkle-linked audit chain. Same input plus same matrix state plus same registry produces the same output, byte-for-byte, across independent runs. No machine learning is invoked.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL · DRAFT — counsel review required before any modification to filed claims
