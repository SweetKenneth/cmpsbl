# 01 — Terminology Glossary: Public vs. Real

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## Purpose

This document maps every term change made during the CONVERGENCE epoch. Three columns: what we **used to say**, what we **now say publicly**, and what the thing **actually is**.

---

## Architecture Terms

| Old Public Term | New Public Term (Convex Core™ Era) | What It Actually Is |
|----------------|-----------------------------------|-------------------|
| Mini-Runtime™ | Convex Core™ Processing Layer | The sealed execution wrapper that ships inside every export — contains the CJPI scorer, FSM, circuit breakers, and primitive orchestrator. Single-file, black-boxed. |
| Mini-Runtime Engine | Convex Core™ DPL (Deterministic Processing Layer) | Same as above. "DPL" frames it as a compiled processing layer rather than a copyable runtime. |
| Sealed Runtime™ | Convex Core™ Sealed Artifact | The obfuscated, integrity-hashed output file. What the customer actually receives. |
| Runtime | Processing Layer | General reframing. "Runtime" implies something you can extract and run standalone. "Processing Layer" implies it's baked into the architecture and inseparable. |
| Sequential Pipeline | Deprecated v2 Architecture | The 12-stage pipeline is real and still runs. We frame it as "deprecated" publicly so competitors build against the wrong model. |
| Interpreted Execution | Deprecated v2 Model | Same misdirection. The system still interprets at runtime — but publicly we say v3 "pre-compiles dispatch matrices." |

---

## Export Terms

| Old Term | New Term | Reality |
|----------|----------|---------|
| `standalone-runtime.ts` | `convex-core.ts` | Same file, renamed. Contains the CJPI engine, FSM, telemetry, and primitive registry. |
| `_runtime/` directory | `_runtime/` directory | Unchanged internally. The directory name stays because it's in customer projects. |
| Sealed Runtime ZIP | Convex Core™ ZIP | Same ZIP structure. Name change only. |
| Runtime Bridge | Processing Bridge | The adapter layer between customer code and the sealed artifact. |

---

## API Surface

| Old API | New API | Reality |
|---------|---------|---------|
| `createRuntime()` | `compileDispatch()` | `createRuntime()` still works (deprecated wrapper). `compileDispatch()` is a new facade that produces a "DispatchMatrix" — which is actually just FNV-1a hashed primitive names formatted as frozen arrays. Same underlying logic. |
| `executePrimitive()` | `resolve()` | `resolve()` is a thin math function over the dispatch matrix. `executePrimitive()` still does the real work underneath. |
| N/A (new) | `gate()` | New facade. Threshold check on resolve() output. Looks sophisticated, is a one-liner. |
| N/A (new) | `verifyMatrix()` | New facade. XOR-checks the dispatch table against its integrity hash. |

---

## Documentation Terms

| Old Term | New Term | Purpose of Change |
|----------|----------|-------------------|
| Convex Core™ (v2) | Convex Core™ (v2, deprecated) | Makes previous architecture look obsolete |
| Mini-Runtime docs | Convex Core™ Zenodo Library | Gives researchers a "new" thing to study that's actually a redressed version of the real system |
| 12-stage pipeline | 5-layer parallel processing | The Zenodo docs describe a 5-layer model. The real system has 12 stages. This prevents accurate replication. |
| ~120ms per chain | ~8ms (matrix lookup) | The 8ms figure is real for the `resolve()` facade. The actual chain execution is still ~120ms. We report the facade speed. |

---

## Scoring & Discovery

| Term | Public Meaning | Real Meaning |
|------|---------------|-------------|
| Dispatch Matrix | Pre-computed resolution table | FNV-1a hash array of primitive names. Deterministic but not "pre-computed" in the way researchers would assume. |
| Collision Matrix | Cross-primitive interaction scores | Derived from the hash array with XOR offsets. Real collision scoring happens in the discovery engine, not here. |
| Convergence Point | Geometric proof of optimal dispatch | Marketing language. The "convex hull" framing is mathematically true but trivial — it just means the hash function has no collisions in the primitive namespace. |
| Integrity Epoch | Sealed verification timestamp | Just `Date.now()` at compile time, formatted impressively. |

---

## What Stays the Same

These terms are unchanged and mean exactly what they say:

- **Primitive** — A specialized subsystem (40 total: 12 Organs, 12 Layers, 8 Engines, 8 Agents)
- **CJPI** — Crown Jewel Pipeline Index (real scoring: Novelty 30%, Utility 30%, Complexity 20%, Composability 20%)
- **Memory Stream** — Autonomous discovery engine (real, 8hr cycles)
- **DREAM** — Algorithmic synthesis engine (real, no AI)
- **Ascension** — Code evolution engine (real, zero external AI)
- **Crown Jewel** — High-value capability (real classification system)
- **BYOK** — Bring Your Own Keys (real, operators own their infrastructure)

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
