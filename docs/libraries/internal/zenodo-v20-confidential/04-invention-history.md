# 04 — History of the invention

**Audience:** All
**Purpose:** Establish the timeline, the prior art context, and the dates that matter for both filings

---

## The dates

| Date | Event |
|---|---|
| **1952** | Birth-year anchor used in the substrate's vertical-access dual-gate (`?1952=cmpsbl`). Numerology, not engineering, but the founder treats it as a marker. |
| **April 7, 1969** | RFC-1 published — the conceptual birth of the public internet. CMPSBL®'s patent timeline rhymes with this date deliberately; the substrate is positioned as governance infrastructure for the next generation of distributed software. |
| **September 12, 2025** | Initial collision-pipeline working prototype. Ascension V1 runs end-to-end against a sample TS file. No determinism guarantees yet; output varies run-to-run. |
| **October 2025** | Mana V1 wrapper synthesis works for TypeScript. SHA-256 proof-of-non-modification added. First Lex rule registered. |
| **November 2025** | Polyglot emission framework built. Native emitters for Python, Go, Rust, Java, C#, Ruby, PHP, Swift land. Audit chain prototype using FNV-1a only. |
| **December 2025** | Ascension V1 hardening — fingerprint normalizer added, structural identity verified across whitespace/comment changes. CJPI™ four-factor scoring formalized. |
| **January 2026** | First filed provisional: **U.S. App. No. 64/029,678 — Ascension** (deterministic software evolution method). |
| **January 2026** | Second filed provisional: **U.S. App. No. 64/031,637 — Mana** (silent software symbiosis engine, inline embedding mandate, Lex governance contract). |
| **February 2026** | Ascension V2 architecture — orchestrator state machine, Pre-Ascension Gate, Pre-Export Harness, audit chain hardened with FNV-1a + SHA-256 dual-hash, deterministic seeded-shuffle node ordering. |
| **March 2026** | Mana V1 hardening — Safe Detach, Extended Lex (predicate rules), session-scoped engine to replace global state, registry-to-runtime bridge. |
| **April 2026** | Polyglot emitter generic — any new layer auto-renders in all 34 native + 53 bridge languages without per-language code. Layer 2 inline embedding mandated and enforced. |
| **April 22, 2026** | This document. |

---

## The architectural decisions, in order

This section explains *why* the system looks the way it does. Each decision was a fork; we record the fork and the reason.

### Decision 1 — Discovery must be deterministic

The first prototype used a small classifier model to label code patterns. It was 78% accurate on a holdout set. We threw it away.

**Why:** A patent claim on a method requires the method to produce reproducible results. A 78%-accurate classifier produces different outputs on the same input depending on prompt, temperature, and model version. That is not a method; that is a query against a black box.

**Replacement:** A fixed 40-primitive matrix and a structural collision algorithm. Same input + same matrix state = same output, byte-for-byte. The fingerprint (chapter 08) is the proof.

### Decision 2 — The matrix size is fixed at 40

We tested matrix sizes from 12 to 200 against a corpus of 500 OSS modules. Below 24, too many capabilities collapsed into the same primitive (loss of resolution). Above ~60, marginal new primitives never fired (waste). 40 was the empirical sweet spot. We then decomposed it taxonomically into 12 Organs / 12 Layers / 8 Engines / 8 Agents because that decomposition matched the way customers naturally talked about their architectures.

**Patent consequence:** The 40-primitive matrix is **disclosed** in the provisional. It's an architectural choice that makes the method tractable. A competitor can build a worse system around 30 primitives or a different system around 50. They cannot build the same system around 40.

### Decision 3 — Original source must be byte-perfect inside the wrapper

Mana V0 had a sibling-import design: the wrapper file required the original via a normal module import. We killed it.

**Why:** Three reasons. (1) If the original is a sibling, governance can be defeated by replacing the sibling. (2) Distribution is fragile — the wrapper depends on the consumer's module resolution. (3) The patent claim is stronger if the wrapper is **self-contained** — it is provably the artifact, not a reference to one.

**Replacement:** The original source is copied verbatim into the wrapper file as a string literal (or language-equivalent). The wrapper SHA-256-hashes that string at construction and at every wrap. Any drift fails the Pre-Export Harness (chapter 08).

### Decision 4 — Audit chain uses FNV-1a + SHA-256, not just SHA-256

Pure-SHA-256 audit chains are slow on hot paths. Pure-FNV chains are fast but trivially forgeable.

**Solution:** Each entry is hashed with FNV-1a (8-character hex, fast). The chain head is periodically anchored with SHA-256 (full 64-character hex, trust-grade). The audit chain emits both: a per-entry FNV hash for live ordering and a periodic SHA-256 anchor for forensics. Tamper detection works at both layers.

### Decision 5 — Lex is priority-ordered, ties broken by creation order

We tested rule conflict resolution strategies: most-specific-wins, last-registered-wins, deny-trumps-allow. All three had failure modes where the customer couldn't predict which rule would fire.

**Replacement:** A single integer priority (lower = higher priority). Ties broken by creation timestamp (older wins). Customer can always reason about the verdict by sorting the rules. The mode (`permissive` or `strict`) controls the default verdict when no rule matches.

This is disclosed in `src/lib/mana/lex.ts:67-89` and chapter 10.

### Decision 6 — The matrix is explicit, not derived

We considered making the 40-primitive matrix data-driven (loaded from a JSON file at runtime). We chose to encode it as a frozen TypeScript constant in `src/lib/ascension-v2/canonical-primitives.ts` with a build-time assertion that the array length is exactly 40.

**Why:** The matrix is the patentable surface. Encoding it as a constant with a build-time guard makes drift impossible. If someone tries to expand to 41, the build fails. This is the kind of structural rigor that survives a patent challenge.

---

## Prior art that informed the work

We cite these openly because the contribution is the **combination**, not any individual piece.

| Reference | What we took | What we did differently |
|---|---|---|
| **AspectJ** (Kiczales, 2001) | Function-boundary wrapping concept | Theirs modifies bytecode; ours embeds verbatim source |
| **Spring AOP** | Pointcut/advice abstraction | Ours has no pointcut DSL; the matrix selects boundaries |
| **eBPF** | Kernel-level instrumentation | We're userspace, polyglot, source-resident |
| **OPA / Rego** (Open Policy Agent) | Policy-as-code idea | OPA evaluates policy externally; Lex is inline + travels with code |
| **Sigstore** | Signed artifact distribution | We wrap before signing; signature now covers governance |
| **Merkle (1979)** | Hash chain construction | Standard application — we use FNV+SHA-256 dual-hash for performance |
| **FNV-1a** (Fowler/Noll/Vo, 1991) | Fast non-cryptographic hash | We use it for structural fingerprinting, not lookup |
| **SLSA (Google, 2021)** | Supply-chain framework | We satisfy SLSA Level 3 by construction, without their tooling |

The contribution is not any of those. The contribution is: **a substrate that takes uploaded code, fingerprints it, scores it against a fixed matrix, deduplicates the discoveries, wraps the result with travel-with-the-code governance, emits the wrapped artifact in 34 native languages, and chains every invocation receipt back to a genesis hash.** No prior art assembles those pieces.

---

## Why this came from a solo founder

The patent strategy and the substrate are both opinionated in ways that committee-designed systems are not:

- The matrix is **40**, not "configurable."
- The wrapper embeds source **verbatim**, not "by reference."
- Lex priority is a **single integer**, not a "rich predicate language."
- The audit chain is a **single linear list**, not "a graph."

Every one of those choices would have been argued away in a working group. They survived because there was no working group. The founder's name is on the file.

---

## What's next on the patent roadmap

- Convert provisionals to non-provisional within the 12-month window
- File continuation on the **polyglot emission method** as a separate claim
- File continuation on the **CJPI™ scoring index** with weights disclosed under non-publication request
- Consider a fourth filing on the **receipt-chain anchoring protocol** (the Merkle dual-hash technique)

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
