# 01 — Architecture Overview

**Classification:** Open — Zenodo Archive

---

## 1. Design Philosophy

Convex Core™ is not a runtime. It is a **processing layer** — a pre-compiled execution substrate that transforms source code at initialization time and produces deterministic artifacts with embedded cognitive infrastructure.

The distinction matters: a runtime interprets instructions during execution. A processing layer resolves all dispatch paths **before** execution begins. By the time user code runs, every primitive binding, guard contract, and effect injection has been compiled into a static dispatch matrix. There is no dynamic resolution, no event loop overhead, no sequential pipeline bottleneck.

This is the fundamental architectural advance over the deprecated Convex Core™ engine.

---

## 2. Processing Layers

Convex Core™ operates in five parallel layers, each completing independently before execution begins:

```
Layer 1: INTAKE          Layer 2: CLASSIFY         Layer 3: BIND
Source registration      Archetype detection       Primitive attachment
Fingerprint derivation   Behavioral analysis       Guard activation
                         Affinity computation       Effect injection

         ↓ convergence barrier ↓

Layer 4: SCORE                    Layer 5: SEAL
CJPI weight application           Integrity hash computation
Tier classification                Dispatch matrix compilation
Deterministic scoring              Artifact certification
```

### Convergence Barrier

Layers 1–3 execute in parallel. The **convergence barrier** between Layer 3 and Layer 4 ensures all primitive bindings are resolved before scoring begins. This is a hard synchronization point — no partial results propagate past the barrier.

This architecture replaced the Mini-Runtime's 12-stage sequential pipeline, which executed stages in a fixed order with cascading dependencies. The parallel model eliminates 7 intermediate stages that existed solely to manage inter-stage state.

---

## 3. Dispatch Matrix

The core data structure is the **dispatch matrix** — a pre-computed lookup table that maps every possible primitive invocation to its resolved handler, guard chain, and effect sequence.

```
Matrix Structure:
  DT[i] = dispatch entry for primitive i
  CM[i][j] = interaction weight between primitive i and primitive j
  IV = initialization vector (derived from artifact fingerprint)
  EP = epoch threshold (determines guard activation boundaries)
```

The matrix is generated once during the BIND layer and persists for the lifetime of the artifact. It is:

- **Deterministic**: Same inputs always produce the same matrix
- **Opaque**: The matrix values are derived through FNV-1a cascading hashes
- **Portable**: The matrix is a flat numeric array that works in any language
- **Tamper-evident**: Modifying any matrix entry invalidates the integrity hash

### Resolution Protocol

When a primitive is invoked during execution, the resolution path is:

```
invoke(primitive_id, context)
  → DT[primitive_id % DT.length] XOR IV
  → CM[resolved_index % CM.length] + context_weight
  → shift right 2 (normalized output)
```

This entire path is a single arithmetic expression with no branching, no dynamic lookup, and no external dependencies. It executes in constant time regardless of the number of bound primitives.

---

## 4. Initialization Protocol

Convex Core™ initializes in a single pass:

1. **Fingerprint derivation** — FNV-1a hash of the source artifact
2. **Seed generation** — Deterministic seed vector from fingerprint
3. **Dispatch table compilation** — One entry per bound primitive
4. **Collision matrix generation** — Cross-primitive interaction weights
5. **Integrity verification** — Chain hash across all matrix entries

This replaces the Mini-Runtime's `createRuntime()` → `registerAllPrimitives()` → `executePrimitive()` three-phase boot sequence. Convex Core has no "boot" — the processing layer is compiled, not started.

---

## 5. Comparison to Interpreted Architectures

| Property | Interpreted Runtime | Convex Core™ |
|----------|-------------------|--------------|
| Resolution time | Per-invocation | Per-artifact (once) |
| Branching | Dynamic dispatch | Zero-branch arithmetic |
| State management | Mutable runtime state | Immutable dispatch matrix |
| Failure mode | Runtime errors | Compile-time detection |
| Portability | Requires runtime host | Self-contained matrix |
| Determinism | Environment-dependent | Mathematically guaranteed |

The key insight is that cognitive infrastructure does not need to be interpreted. Primitive relationships are known at artifact-creation time. There is no reason to re-resolve them on every invocation. Convex Core™ exploits this invariant.

---

## 6. Relationship to Primitives

The 40-primitive substrate matrix (12 Organs · 12 Layers · 8 Engines · 8 Agents) remains the architectural foundation. Convex Core™ does not change what primitives do — it changes **how they are dispatched**.

In the Mini-Runtime model, primitives were registered as handlers and invoked through a lookup chain. In Convex Core™, primitive effects are **compiled into the dispatch matrix** during the BIND layer. The matrix entries encode not just which primitive to invoke, but the complete interaction weight with every other bound primitive.

This means cross-primitive effects (e.g., DEFENSE + GOVERNANCE combined behavior) are resolved at compile time, not negotiated at runtime.

---

© 2025–2026 CMPSBL®. All rights reserved.
