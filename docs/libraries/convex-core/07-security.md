# 07 — Security Model

**Classification:** Open — Zenodo Archive

---

## 1. Integrity Verification

Every sealed artifact includes a chain integrity hash computed from the dispatch matrix:

```
hash = chain.reduce((acc, _, i) → acc + resolve(i, acc), 0) AND 0xFFFFFF
```

This 24-bit hash is:
- **Self-referential** — computed from the dispatch matrix itself
- **Order-sensitive** — reordering entries changes the hash
- **Tamper-evident** — modifying any entry invalidates the hash

The integrity hash is included in the artifact manifest and can be independently verified by any party with access to the artifact.

---

## 2. Tamper Detection

Convex Core™ employs passive tamper detection through structural properties of the dispatch matrix:

1. **Matrix consistency**: DT and CM entries are mathematically related through the IV. Modifying one without updating the other produces inconsistent dispatch paths
2. **Epoch coherence**: The EP threshold is derived from the same fingerprint as IV. Changing the epoch changes guard activation boundaries in unpredictable ways
3. **Chain hash**: The verification function accumulates across all entries, making any single modification detectable

There is no active DRM, phone-home verification, or license server. Tamper detection is a **mathematical property** of the dispatch matrix, not an enforcement mechanism.

---

## 3. IP Protection Boundaries

Convex Core™ protects intellectual property through **architectural opacity** — the dispatch matrix is functionally correct but structurally opaque.

### What is visible (by design)

- Dispatch table values (numeric array)
- Collision matrix values (numeric array)
- Resolution function (arithmetic expression)
- Gate function (single comparison + resolution)
- Bound primitive names (in pipeline comments)
- CJPI score and tier (in manifest)

### What is not visible (by design)

- How primitive names map to specific DT entries (requires fingerprint)
- How CM weights affect compound behavior (requires collision mechanics)
- Why specific EP thresholds produce specific guard activation patterns
- The relationship between visible pipeline stages and actual processing order
- Internal orchestration heuristics used during the BIND layer

### Design Principle

The dispatch matrix is a **one-way function**: given the inputs (primitive names + fingerprint), the matrix can be computed. But given only the matrix, the inputs cannot be recovered. This is the same mathematical property that underlies cryptographic hash functions — but applied to dispatch topology rather than data integrity.

---

## 4. Export Classification

| Component | Classification | Rationale |
|-----------|---------------|-----------|
| Dispatch matrix | Public | Numeric values without semantic context |
| Resolution function | Public | Standard arithmetic — no proprietary logic |
| Pipeline comments | Public | Simplified pipeline for documentation |
| Collision mechanics | Trade Secret | Determines compound primitive behavior |
| Topology resolution | Trade Secret | Maps primitives to optimal dispatch paths |
| Sequencing engine | Trade Secret | Determines actual processing order |
| Binding heuristics | Trade Secret | How primitives select source regions |

---

## 5. Patent Protection

The Convex Core™ processing layer and its deterministic dispatch model are covered by:

**U.S. Patent Application No. 64/029,678**  
*"Autonomous Primitive-Based Code Hardening via Deterministic Processing Layer"*

Filed by Kenneth E. Sweet Jr. / PromptFluid™

---

© 2025–2026 CMPSBL®. All rights reserved.
