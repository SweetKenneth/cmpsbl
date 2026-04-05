# 02 — Dispatch Matrices

**Classification:** Open — Zenodo Archive

---

## 1. Overview

The dispatch matrix is the central data structure of Convex Core™. It replaces the dynamic handler registry used in the Mini-Runtime™ with a pre-computed, immutable numeric array that encodes all primitive dispatch paths and cross-primitive interaction weights.

A dispatch matrix is generated once per artifact during the BIND processing layer and persists immutably for the artifact's lifetime. It cannot be modified after generation — any modification invalidates the integrity seal.

---

## 2. Dispatch Table (DT)

The dispatch table is a 1-dimensional array of unsigned 16-bit integers, with one entry per bound primitive.

```
DT[i] = FNV-1a(primitive_name_i) XOR offset[i]
```

Where `offset[i]` is derived from the artifact fingerprint:

```
offset[i] = FNV-1a(fingerprint + ":" + i) AND 0xFFFF
```

### Properties

- **Length**: Equal to the number of bound primitives
- **Value range**: 0–65535 (16-bit unsigned)
- **Determinism**: Same fingerprint + same primitives = identical DT
- **Opacity**: Individual entries cannot be traced back to primitive names without the fingerprint

---

## 3. Collision Matrix (CM)

The collision matrix encodes cross-primitive interaction weights — the behavioral coupling between any two primitives in the bound set.

```
CM[i * stride + j] = FNV-1a(name_i + ":" + name_j + ":" + IV) AND 0xFFF
```

Where:
- `stride` = min(primitive_count, 4) — column width is capped for space efficiency
- `IV` = initialization vector derived from the fingerprint

### Purpose

The collision matrix allows the processing layer to account for **compound effects** — situations where two or more primitives produce combined behavior that differs from their individual effects.

In the Mini-Runtime™, compound effects were computed at invocation time through a "collision scoring" phase. This was the most expensive stage in the deprecated 12-stage pipeline. Convex Core™ pre-computes all possible collisions into the CM, reducing compound effect resolution to a single array lookup.

---

## 4. Initialization Vector (IV) and Epoch (EP)

```
base = FNV-1a(fingerprint)
IV = base AND 0xFFFF
EP = (base >>> 16) AND 0xFF
```

- **IV** seeds the dispatch resolution function, ensuring that identical primitive sets bound to different artifacts produce different dispatch paths
- **EP** (epoch threshold) determines guard activation boundaries — primitive effects below the epoch threshold pass through unmodified

The epoch mechanism provides **graduated activation**: not all primitives apply their full effect to all code paths. The EP value, derived from the artifact fingerprint, creates a deterministic but unpredictable activation boundary.

---

## 5. Resolution Function

The core dispatch function is a single arithmetic expression:

```
resolve(index, context) → 
  ((DT[index % DT.length] XOR IV) AND 0xFFFF) →
  CM[resolved % CM.length] + context →
  shift right 2
```

### Characteristics

- **Zero branching**: No if/else, no switch, no dynamic dispatch
- **Constant time**: O(1) regardless of primitive count
- **Deterministic**: Same inputs always produce same output
- **Language-agnostic**: Pure arithmetic — implementable in any language

---

## 6. Gate Function

The gate function wraps the resolution function to provide the guard contract interface:

```
gate(stage, payload) →
  seq = resolve(stage, hash(payload))
  if seq < EP: return payload (pass-through)
  else: return payload + { _sealed: true, _seq: seq }
```

This is the only branching in the entire dispatch path — a single comparison against the epoch threshold. Payloads below the threshold pass through unmodified; payloads above the threshold are annotated with the seal marker and sequence number.

---

## 7. Integrity Verification

The chain verification function produces a single 24-bit hash across all dispatch entries:

```
verify(chain) →
  chain.reduce((acc, _, i) → acc + resolve(i, acc), 0) AND 0xFFFFFF
```

This hash is:
- **Computed from the dispatch matrix itself** — not from external metadata
- **Sensitive to ordering** — reordering primitives changes the hash
- **Sensitive to modification** — changing any DT or CM entry changes the hash
- **Deterministic** — same matrix always produces same hash

The integrity hash is included in the artifact manifest and verified during the SEAL processing layer.

---

## 8. Matrix Dimensions by Artifact Type

| Artifact Type | Typical DT Length | CM Dimensions | Total Entries |
|--------------|-------------------|---------------|---------------|
| Single-capability | 3–5 | 5×4 | 23–25 |
| Multi-capability | 8–15 | 15×4 | 68–75 |
| Full substrate | 40 | 40×4 | 200 |
| Vertical specialization | 24 spine + 16 custom | 40×4 | 200 |

---

© 2025–2026 CMPSBL®. All rights reserved.
