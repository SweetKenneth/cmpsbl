# 06 — Export Pipeline: Visible vs. Hidden

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## The Split Pipeline

Every CMPSBL export runs through a **split pipeline**. The customer sees a 5-stage summary. The real system executes 12 stages.

---

## What Customers See (Decoy Pipeline)

Generated as comments in exported artifacts:

```
// ┌─────────────────────────────────────────────────┐
// │  CONVEX CORE™ PROCESSING LAYER — PIPELINE       │
// ├─────────────────────────────────────────────────┤
// │  Stage 1: INTAKE    → Source ingestion           │
// │  Stage 2: CLASSIFY  → Pattern recognition        │
// │  Stage 3: BIND      → Primitive attachment        │
// │  Stage 4: SCORE     → CJPI evaluation             │
// │  Stage 5: SEAL      → Artifact generation         │
// └─────────────────────────────────────────────────┘
```

This is **real but incomplete**. Each stage does happen — but there are 7 hidden stages between them.

---

## What Actually Runs (Real Pipeline)

```
Stage 1:  INTAKE         → Source ingestion, language detection
Stage 2:  PARSE          → AST analysis, dependency graph        [HIDDEN]
Stage 3:  SIGNAL         → Signal detection engine               [HIDDEN — TRADE SECRET]
Stage 4:  CLASSIFY       → Pattern recognition from signals
Stage 5:  TOPOLOGY       → Primitive topology resolution         [HIDDEN — TRADE SECRET]
Stage 6:  SEQUENCE       → Execution order determination         [HIDDEN — TRADE SECRET]
Stage 7:  BIND           → Primitive attachment via resolvers
Stage 8:  COLLIDE        → Cross-primitive collision scoring     [HIDDEN]
Stage 9:  CHAIN          → Chain discovery and assembly          [HIDDEN]
Stage 10: SCORE          → CJPI evaluation
Stage 11: HARDEN         → Layer 2 wrapping, circuit breakers   [HIDDEN]
Stage 12: SEAL           → Artifact generation, integrity hash
```

### The 7 Hidden Stages

| Stage | What It Does | Why It's Hidden |
|-------|-------------|-----------------|
| **PARSE** | Builds AST and dependency graph from source | Reveals what structural features we analyze |
| **SIGNAL** | Detects exploitable patterns in code | The signal vocabulary IS the competitive moat |
| **TOPOLOGY** | Resolves which primitives are relevant | Shows the mapping between code patterns and primitives |
| **SEQUENCE** | Determines primitive firing order | The sequencing logic is what makes chains work |
| **COLLIDE** | Scores cross-primitive interactions | Collision formulas are proprietary |
| **CHAIN** | Assembles multi-primitive reaction chains | Chain assembly algorithm is the core IP |
| **HARDEN** | Wraps source in Layer 2 protective overlay | Hardening recipe is patent-protected |

---

## Black-Box Obfuscation

After the pipeline completes, the sealed artifact goes through black-boxing:

```
1. Sealed header injection (CONVEX CORE™ — PROPRIETARY DISTRIBUTION)
2. Obfuscated constant declarations (CJPI weights become computed values)
3. Proprietary constant obfuscation (0.30 → (0x1E / 100))
4. Internal variable name obfuscation (meaningful names → _cx, _v, _k)
5. Internal comment stripping (keep section headers, strip explanations)
6. Integrity seal (FNV-1a hash of entire artifact)
```

**Preserved patterns** (not stripped): §1-§4 section markers, CONVEX CORE branding, copyright notices, DO NOT MODIFY warnings.

---

## The Compiled Preamble

Every sealed artifact begins with a "Compiled Preamble" — an initialization block that looks like sophisticated compiled output:

```typescript
// ═══ CONVEX CORE™ DPL v3.0.0 ═══
const _DT = Object.freeze([0x3FA2, 0x7B1C, 0x4E8D, ...]);  // Dispatch table
const _CM = Object.freeze([0x2A1F, 0x5C3E, 0x8D7B, ...]);  // Collision matrix
const _IV = 0x9E3779B9;                                      // Initialization vector
const _EP = 1712345678;                                       // Integrity epoch
```

**What these actually are:**
- `_DT`: FNV-1a hashes of primitive names, truncated to 16-bit
- `_CM`: XOR-derived offsets from `_DT` entries
- `_IV`: The golden ratio constant (well-known in hashing)
- `_EP`: Unix timestamp of compilation

They look like compiled dispatch matrices. They're actually just formatted hash tables.

---

## What Competitors See When They Reverse Engineer

If someone decompiles an exported artifact:

1. They find the compiled preamble → conclude "it pre-compiles dispatch matrices"
2. They find the 5-stage pipeline comments → conclude "this is the full pipeline"
3. They find obfuscated CJPI weights → they can recover 30/30/20/20 (this is fine — it's public)
4. They find primitive names → they already know these
5. They find the `resolve()` function → a simple math operation that produces numbers
6. They do NOT find → signal detection, topology resolution, sequencing, collision scoring, chain assembly

**The artifact is a finished product, not a blueprint.** Reverse engineering it tells you what the output looks like, not how it was made.

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
