# 03 — Primitive Binding

**Classification:** Open — Zenodo Archive

---

## 1. Overview

Primitive binding is the process by which Convex Core™ attaches primitive effects to source code during the BIND processing layer. Unlike the Mini-Runtime™'s handler registration model (where primitives were registered as callbacks and invoked dynamically), Convex Core™ compiles primitive effects directly into the source graph.

The result is source code with **embedded cognitive infrastructure** — guards, instrumentation, and effect markers that are part of the compiled output, not external runtime hooks.

---

## 2. Binding Model

Each primitive produces a **transform function** that modifies the source AST or text:

```
primitive_effect: (source: string) → string
```

Transforms are applied during the BIND layer in **parallel** — each primitive's transform is independent and commutative. The order of application does not affect the final result because transforms target non-overlapping source regions.

### Categories of Transforms

| Category | Primitives | Effect |
|----------|-----------|--------|
| **Boundary guards** | DEFENSE, ACCESS, IDENTITY | Inject validation at function entry points |
| **Audit hooks** | GOVERNANCE, AUDIT, TREATY | Wrap state mutations with observability |
| **Signal markers** | BEACON, SHADOW, VISION | Annotate functions with health/canary signals |
| **State interceptors** | MEMORY, BRAIN, ECHO | Wrap persistent state and error handling |
| **Topology markers** | NERVE, ATLAS, COMPASS | Annotate communication and import boundaries |

---

## 3. Guard Contracts

A guard contract is a binding agreement between a primitive and a source region. When a primitive binds to a function, it establishes a contract specifying:

- **Entry conditions**: What must be true when the function is invoked
- **Exit conditions**: What the function guarantees upon return
- **Effect scope**: Which source tokens the primitive may modify
- **Interaction weight**: How this binding affects other primitive bindings (encoded in CM)

Guard contracts are not enforced at runtime — they are **compiled into the dispatch matrix**. The gate function's epoch threshold determines which guards are active for a given artifact.

---

## 4. Effect Injection

Effect injection is the mechanism by which primitive transforms produce observable changes in the source code. Effects fall into three categories:

### 4.1 Inline Effects

Injected directly into the source text at transform time:

```
// Before binding
function processOrder(items) {
  // business logic
}

// After DEFENSE binding
function processOrder(items) {
  _G(0x01, { fn: 'processOrder', argc: 1 });
  // business logic
}
```

The `_G` call resolves through the dispatch matrix, producing a deterministic sequence number that gates further primitive effects downstream.

### 4.2 Annotation Effects

Non-invasive markers that provide observability without modifying execution:

```
// After BEACON binding
function processOrder(items) /* _V:a3f2c1 */ {
```

### 4.3 Interception Effects

Wrapping patterns that add behavior around existing operations:

```
// After GOVERNANCE binding
_G(0x03, { op: "dispatch" }), dispatch(action)
```

---

## 5. Commutativity Guarantee

Primitive transforms are designed to be **commutative** — applying DEFENSE before GOVERNANCE produces the same result as applying GOVERNANCE before DEFENSE. This is achieved through non-overlapping target selection:

- Boundary guards target function signatures
- Audit hooks target mutation calls
- Signal markers target function declarations
- State interceptors target storage APIs
- Topology markers target import statements

No two transform categories target the same source tokens. This allows parallel application during the BIND layer without coordination.

---

## 6. Binding Report

After the BIND layer completes, a binding report is generated:

```json
{
  "bound_primitives": 15,
  "transforms_applied": 42,
  "guard_contracts": 8,
  "effect_injections": {
    "inline": 23,
    "annotation": 12,
    "interception": 7
  },
  "matrix_entries": 75,
  "integrity_hash": "a3f2c1"
}
```

This report is included in the artifact's manifest for verification.

---

© 2025–2026 CMPSBL®. All rights reserved.
