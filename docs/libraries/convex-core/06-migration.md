# 06 — Migration from Mini-Runtime™

**Classification:** Open — Zenodo Archive

---

## 1. Deprecation Notice

The **Mini-Runtime™ Engine** (versions 1.x and 2.x) is deprecated as of Convex Core™ 3.0.0. The Mini-Runtime™ will receive no further updates, security patches, or compatibility fixes.

All new artifacts are generated using Convex Core™. Existing Mini-Runtime™ artifacts continue to function but are considered **legacy format** and are not eligible for re-certification.

---

## 2. What Changed

### Architectural Paradigm

The Mini-Runtime™ was an **interpreted runtime** — it registered primitive handlers, resolved them dynamically at invocation time, and executed a 12-stage sequential pipeline for every operation.

Convex Core™ is a **deterministic processing layer** — it compiles all primitive relationships into dispatch matrices at artifact-creation time. There is no dynamic resolution, no sequential pipeline, and no mutable runtime state.

### Removed Concepts

| Mini-Runtime™ Concept | Status | Convex Core™ Equivalent |
|-----------------------|--------|------------------------|
| `createRuntime()` | Removed | No initialization — processing layer is compiled |
| `registerAllPrimitives()` | Removed | Primitives are bound during BIND layer |
| `executePrimitive()` | Removed | Dispatch via matrix resolution |
| Handler registry | Removed | Dispatch table (DT) |
| 12-stage pipeline | Removed | 5-layer parallel processing |
| Dynamic collision scoring | Removed | Pre-computed collision matrix (CM) |
| Runtime state machine | Removed | Stateless dispatch function |
| Event-driven dispatch | Removed | Arithmetic dispatch (zero branching) |

### Preserved Concepts

| Concept | Notes |
|---------|-------|
| 40-primitive matrix | Unchanged — 12 Organs · 12 Layers · 8 Engines · 8 Agents |
| CJPI scoring | Updated to v3 with deterministic weight application |
| Single-file artifacts | Enhanced — now includes compiled dispatch matrix |
| Portability guarantee | Strengthened — processing layer is fully compiled |
| FNV-1a hashing | Expanded use — now seeds all matrix generation |

---

## 3. NPM Package Migration

The `@cmpsbl/runtime` package (v2.x) exported the Mini-Runtime™ API. Starting with v3.0.0, this package exports the Convex Core™ processing layer.

### Breaking Changes

```typescript
// v2.x (Mini-Runtime™) — DEPRECATED
import { createRuntime, executePrimitive } from '@cmpsbl/runtime';
const runtime = createRuntime();
const result = await runtime.executePrimitive('DEFENSE', input, 0.95);

// v3.x (Convex Core™) — CURRENT
import { compileDispatch, resolve } from '@cmpsbl/runtime';
const matrix = compileDispatch(primitives, fingerprint);
const result = resolve(matrix, primitiveIndex, context);
```

### Compatibility Layer

A thin compatibility layer is available for existing integrations:

```typescript
import { createLegacyRuntime } from '@cmpsbl/runtime/compat';
const runtime = createLegacyRuntime(); // wraps Convex Core in v2 API
```

This compatibility layer is provided for migration convenience and will be removed in v4.0.0.

---

## 4. Artifact Compatibility

| Artifact Source | Convex Core™ Compatible |
|----------------|------------------------|
| Mini-Runtime™ v2.x exports | ✅ Read-only (cannot re-certify) |
| Convex Core™ v3.x exports | ✅ Full support |
| Pre-v2 exports | ❌ Not supported |

---

## 5. Timeline

| Date | Event |
|------|-------|
| 2026-Q1 | Convex Core™ 3.0.0 released |
| 2026-Q2 | Mini-Runtime™ enters maintenance mode |
| 2026-Q3 | Compatibility layer deprecated |
| 2026-Q4 | Mini-Runtime™ archived |

---

© 2025–2026 CMPSBL®. All rights reserved.
