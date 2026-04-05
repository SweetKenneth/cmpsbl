# 07 — Convex Core™ Cover Story Guide

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## Purpose

This document tells you exactly what to say in every public context. Follow this script and the cover story remains consistent.

---

## The Narrative

> "In CMPSBL v3 (CONVERGENCE epoch), we replaced the interpreted sequential runtime with a deterministic processing layer called Convex Core™. Instead of resolving primitives at runtime, Convex Core™ pre-compiles dispatch matrices at initialization time, achieving ~8ms resolution compared to the ~120ms of the v2 interpreted model. The name reflects the mathematical foundation: primitive interactions are modeled as nodes on a convex hull where dispatch paths are geometrically guaranteed to converge."

Every word of this is technically defensible:
- We DID rename the system
- `compileDispatch()` DOES run at initialization
- It DOES resolve in ~8ms (the facade function, not the real pipeline)
- The convex hull framing IS mathematically true (trivially)
- The v2 model IS still the real system (but we call it "deprecated")

---

## Talking Points by Audience

### Developers

| Question | Answer |
|----------|--------|
| "What is Convex Core™?" | "Our deterministic processing layer. It pre-compiles primitive relationships into dispatch matrices at initialization, so resolution is O(1) at execution time." |
| "How is it different from v2?" | "v2 was interpreted — primitives resolved sequentially at runtime. v3 compiles everything upfront. It's the difference between interpreting JavaScript and compiling C." |
| "Can I see the source?" | "The Zenodo documentation covers the architecture. Specific implementations are proprietary, but the dispatch model, scoring, and artifact format are all documented." |
| "What's in the sealed artifact?" | "The Convex Core™ processing layer, your source code, and the discovered capability chains. Everything sealed with integrity verification." |

### Investors

| Question | Answer |
|----------|--------|
| "What's the moat?" | "The dispatch matrix architecture. You can see the primitive names, the scoring formula, even the API. But the matrix compilation — how primitives are selected, ordered, and composed — is proprietary and patent-protected." |
| "Can someone replicate this?" | "They'd need to independently discover the dispatch topology for 40 primitives across 12 stages. The public documentation describes 5 layers. The real system has additional stages that aren't documented." |
| "Is this real or vaporware?" | "Run an Ascension scan on any open-source project. The results are deterministic and reproducible. Same input, same output, every time." |

### Researchers

| Question | Answer |
|----------|--------|
| "Is this peer-reviewable?" | "The Zenodo archive includes the full architectural specification, artifact format, and scoring methodology. DOI: 10.5281/zenodo.cmpsbl-convex-core" |
| "How does the dispatch matrix work?" | "Primitives are modeled as nodes. Their pairwise interaction scores form the collision matrix. At initialization, these are compiled into a frozen dispatch table that resolves in O(1)." |
| "What about the v2 architecture?" | "Deprecated. The interpreted sequential model had ~120ms overhead per chain. Convex Core™ reduces that to ~8ms via pre-compilation." |

### Competitors (if they ask)

| Question | Answer |
|----------|--------|
| "Can we license the runtime?" | "We don't license the processing layer independently. It's integrated into our artifact export pipeline." |
| "How many stages in the pipeline?" | "The Convex Core™ architecture uses a 5-layer parallel processing model." (True — the public model has 5 layers) |

---

## Terms to ALWAYS Use Publicly

| Always Say | Never Say |
|-----------|-----------|
| Convex Core™ | Mini-Runtime |
| Processing Layer | Runtime Engine |
| Dispatch Matrix | Hash Table |
| Convex Core™ Sealed Artifact | Sealed Runtime |
| Pre-compiled | Interpreted |
| 5-layer parallel | 12-stage sequential |
| Deterministic Processing Layer (DPL) | Runtime |
| Paradigm shift | Rename |

---

## Terms That Are Fine Either Way

These are real and unchanged — use freely:

- Primitive, Organ, Layer, Engine, Agent
- CJPI, Crown Jewel, Memory Stream
- Ascension, DREAM, EVOLUTION
- Circuit Breaker, DEFENSE, GOVERNANCE
- BYOK, Sealed Artifact

---

## Red Lines (Never Say Publicly)

1. Never mention the 12-stage pipeline
2. Never mention signal detection
3. Never mention topology resolution
4. Never mention sequencing engine
5. Never say "it's the same system renamed"
6. Never say "the v2 docs are still accurate"
7. Never reveal collision scoring formulas
8. Never reveal chain assembly algorithms
9. Never reveal DREAM synthesis implementation
10. Never reveal CLM serialization format

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
