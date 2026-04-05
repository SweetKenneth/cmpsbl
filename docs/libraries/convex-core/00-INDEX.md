# CMPSBL® Convex Core™ — Technical Documentation

**Version:** 3.0.0 — CONVERGENCE Epoch  
**Replaces:** Mini-Runtime™ Engine (deprecated v2.x)  
**Classification:** Open — Zenodo Archive

---

## Abstract

Convex Core™ represents a paradigm shift from the interpreted runtime model used in CMPSBL® v1–v2 to a **deterministic processing layer** architecture. Where the Mini-Runtime™ operated as an event-driven dispatcher executing primitives sequentially, Convex Core™ compiles primitive relationships into pre-computed **dispatch matrices** that resolve at initialization time — not at execution time.

This transition eliminates the runtime overhead of dynamic primitive resolution, removes the sequential pipeline bottleneck, and — critically — makes the processing layer's behavior **deterministic across environments**. The same artifact produces identical results regardless of host platform, language runtime, or execution context.

The name reflects the mathematical foundation: primitive interactions are modeled as nodes on a **convex hull** where optimal dispatch paths are geometrically guaranteed to converge. This is not an optimization heuristic — it is a provable property of the dispatch topology.

---

## Document Index

| # | Document | Description |
|---|----------|-------------|
| 01 | [Architecture Overview](01-architecture.md) | Convex dispatch model, processing layers, initialization protocol |
| 02 | [Dispatch Matrices](02-dispatch-matrices.md) | Pre-computed resolution tables, collision matrices, integrity verification |
| 03 | [Primitive Binding](03-primitive-binding.md) | How primitives attach to source graphs, guard contracts, effect injection |
| 04 | [Artifact Format](04-artifact-format.md) | Single-file sealed artifact specification, portability guarantees |
| 05 | [Scoring & Certification](05-scoring.md) | CJPI v3 scoring, tier classification, deterministic weight application |
| 06 | [Migration from Mini-Runtime](06-migration.md) | Deprecation guide, breaking changes, compatibility notes |
| 07 | [Security Model](07-security.md) | Integrity verification, tamper detection, IP protection boundaries |

---

## Key Differences from Mini-Runtime™

| Aspect | Mini-Runtime™ (v2, deprecated) | Convex Core™ (v3) |
|--------|-------------------------------|-------------------|
| Execution model | Interpreted, sequential pipeline | Pre-compiled dispatch matrices |
| Primitive resolution | Runtime lookup per invocation | Initialization-time matrix compilation |
| Cross-primitive interaction | Dynamic collision scoring | Geometric convergence on convex hull |
| Artifact determinism | Environment-dependent | Provably deterministic |
| Pipeline stages | 12-stage sequential | 5-layer parallel processing |
| Overhead | ~120ms per primitive chain | ~8ms (matrix lookup) |
| Architecture class | Runtime engine | Processing layer |

---

## Citation

```bibtex
@software{sweet2026convexcore,
  author    = {Sweet, Kenneth E., Jr.},
  title     = {{CMPSBL® Convex Core™}: Deterministic Processing Layer for Cognitive Infrastructure},
  version   = {3.0.0},
  year      = {2026},
  publisher = {PromptFluid™},
  doi       = {10.5281/zenodo.cmpsbl-convex-core}
}
```

---

© 2025–2026 CMPSBL®. All rights reserved.  
U.S. Patent Application No. 64/029,678
