# 03 — Convex Core™ Architecture

**Zenodo v19 · SYMBIOTIC Epoch**

---

## What Convex Core™ Is

Convex Core™ is the **sealed deterministic processing layer** that ships inside every CMPSBL artifact. It is the runtime that customer code interacts with after Ascension transforms source through the 40-primitive matrix.

Convex Core™ provides:

- A finite-state machine for primitive dispatch.
- Integrity verification of the dispatch surface.
- Threshold-based gating against scored output.
- Telemetry emission for governed observability.

---

## Public API Surface

| Function | Purpose |
|---|---|
| `compileDispatch()` | Produces a frozen dispatch matrix from a primitive set. |
| `resolve(input)` | Returns a scored resolution against the matrix. |
| `gate(score, threshold)` | Boolean threshold check against `resolve()` output. |
| `verifyMatrix()` | Integrity hash check of the dispatch table. |

These four functions are the entire public API. Everything else is sealed.

---

## What Is Sealed

- The construction algorithm for dispatch matrices.
- The hash function family used for primitive identity (the **fact** that hashing is used is public; the function and salts are not).
- The integrity epoch rotation schedule.
- The internal collision-resolution strategy.
- The relationship between dispatch matrices and the 40-primitive registry.

---

## Why It Is Sealed

Convex Core™ ships inside customer artifacts. The customer receives an obfuscated, integrity-hashed file. The seal is not security-through-obscurity — every artifact is also covered by the Mana™ governance contract (see `05-mana-patent-abstract.md`) — but the seal does prevent trivial extraction of the dispatch surface from a single artifact.

A researcher inspecting one artifact can verify it conforms to the public API. They cannot reconstruct the dispatch logic that another artifact uses, because each artifact's matrix is compiled against the substrate state at export time.

---

## Relationship to the 40-Primitive Matrix

Convex Core™ is the **runtime expression** of the 40-primitive matrix inside an exported artifact. The matrix is the architecture; Convex Core™ is the compiled processing layer that enforces it.

---

© 2025–2026 CMPSBL® · CC BY 4.0
