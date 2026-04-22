# 04 — History of the invention

**Audience:** All
**Purpose:** Establish timeline and prior-art context for both filings

---

## Dates

| Date | Event |
|---|---|
| **April 7, 1969** | RFC-1 published. The patent timeline rhymes with this date deliberately; the substrate is positioned as governance infrastructure for the next generation of distributed software. |
| **September 12, 2025** | First end-to-end Ascension prototype runs. No determinism guarantees yet. |
| **October 2025** | First Mana wrapper synthesis works. Cryptographic proof-of-non-modification added. First Lex rule registered. |
| **November 2025** | Polyglot emission framework. Audit chain prototype using FNV-1a only. |
| **December 2025** | Fingerprint normalizer added — structural identity verified across whitespace and comment changes. CJPI™ four-factor scoring formalized. |
| **January 2026** | First filed provisional: **U.S. App. No. 64/029,678 — Ascension**. |
| **January 2026** | Second filed provisional: **U.S. App. No. 64/031,637 — Mana**. |
| **February 2026** | Ascension V2 — orchestrator state machine, Pre-Ascension Gate, Pre-Export Harness, audit chain hardened with FNV-1a + SHA-256 dual-hash. |
| **March 2026** | Mana V1 hardening — Safe Detach, Extended Lex (predicate rules), session-scoped engine. |
| **April 2026** | Generic polyglot emitter — any new layer auto-renders across native and bridge languages. Layer-2 inline embedding mandated and enforced. |

---

## Architectural decisions, in order

### Decision 1 — Discovery must be deterministic

The first prototype used a small classifier model. It was 78% accurate on a holdout set. We threw it away.

**Why:** A patent claim on a method requires reproducible results. A classifier produces different outputs depending on prompt, temperature, and model version. That is not a method; it is a query against a black box.

**Replacement:** A fixed primitive matrix and a structural collision algorithm. Same input + same matrix state = same output.

### Decision 2 — The matrix size is fixed at 40

We tested matrix sizes from 12 to 200 against a corpus of open-source modules. Below ~24, capabilities collapsed into the same primitive (loss of resolution). Above ~60, marginal new primitives never fired (waste). 40 was empirical. We then decomposed it into 12 Organs / 12 Layers / 8 Engines / 8 Agents because that decomposition matched the way customers naturally talked about their architectures.

**Patent consequence:** The matrix size of 40 is disclosed as an architectural choice. A competitor can build a worse system around 30 or a different system around 50.

### Decision 3 — Original source must be byte-perfect inside the wrapper

An early Mana version used a sibling-import design. We killed it.

**Why:** (1) Governance can be defeated by replacing the sibling. (2) Distribution is fragile. (3) The patent claim is stronger when the wrapper is **self-contained**.

**Replacement:** Original source is copied verbatim into the wrapper file. The wrapper hashes it at construction and at every wrap. Drift fails the Pre-Export Harness.

### Decision 4 — Audit chain uses FNV-1a + SHA-256, not just one

Pure-SHA-256 is slow on hot paths. Pure-FNV is fast but trivially forgeable. **Solution:** per-entry FNV-1a (live ordering), periodic SHA-256 anchors of the joined hash sequence (forensic anchoring). Tamper detection works at both layers.

### Decision 5 — Lex is priority-ordered, ties broken by creation order

We tested most-specific-wins, last-registered-wins, deny-trumps-allow. All had failure modes where the customer couldn't predict the verdict.

**Replacement:** A single integer priority (lower = higher priority); tie broken by creation timestamp (older wins). Mode (`permissive` / `strict`) controls the default verdict when no rule matches.

### Decision 6 — The matrix is explicit, not derived

We considered loading the matrix from a JSON file at runtime. We chose to encode it as a frozen constant with a build-time assertion that the array length is exactly 40. Drift is impossible without a build failure.

---

## Prior art that informed the work

We cite openly because the contribution is the **combination**, not any individual piece.

| Reference | What we took | What we did differently |
|---|---|---|
| AspectJ (Kiczales, 2001) | Function-boundary wrapping concept | Theirs modifies bytecode; ours embeds verbatim source |
| Spring AOP | Pointcut/advice abstraction | Ours has no pointcut DSL; the matrix selects boundaries |
| eBPF | Kernel-level instrumentation | We're userspace, polyglot, source-resident |
| OPA / Rego | Policy-as-code | OPA evaluates externally; Lex is inline + travels with code |
| Sigstore | Signed artifact distribution | We wrap before signing; signature now covers governance |
| Merkle (1979) | Hash chain construction | Standard application — we use a dual-hash for performance |
| FNV-1a (Fowler/Noll/Vo, 1991) | Fast non-cryptographic hash | We use it for structural fingerprinting, not lookup |
| SLSA (Google, 2021) | Supply-chain framework | We satisfy SLSA Level 3 by construction |

The contribution is none of those individually. It is the assembly: a substrate that takes uploaded code, fingerprints it, scores it against a fixed matrix, deduplicates the discoveries, wraps the result with travel-with-the-code governance, emits the wrapped artifact in many languages, and chains every invocation receipt. No prior art assembles those pieces.

---

## Patent roadmap

- Convert provisionals to non-provisional within the 12-month window
- File continuation on the polyglot emission method
- File continuation on the CJPI™ scoring index (with weights under non-publication request)
- Consider a fourth filing on the receipt-chain anchoring protocol

---

© 2025–2026 CMPSBL®
