# 08 — Research Appendix

**Zenodo v19 · SYMBIOTIC Epoch**

---

This appendix documents the public structural claims about CJPI scoring and primitive fingerprinting. It is intended for academic reviewers, policy analysts, and patent examiners. Internals are deliberately withheld; the **shape** of the system is disclosed so reviewers can evaluate plausibility.

---

## A1. Crown Jewel Pipeline Index (CJPI)

CJPI is a four-factor weighted score in the range [0, 100]. The four factors are:

| Factor | What It Measures (Public) |
|---|---|
| **Novelty** | Structural distance of the discovered capability from the input source |
| **Utility** | Estimated downstream applicability across the primitive matrix |
| **Complexity** | Compositional depth required to express the capability |
| **Composability** | Compatibility with other capabilities in the discovery pool |

The structure is **four factors**, normalized, weighted, summed. The specific weight distribution is not public. Common implementations of similar indices (e.g., NIST CWE risk scoring) use weights tuned empirically against a labeled corpus; CJPI is similar in approach.

A discovery is **publishable** if its CJPI exceeds an internal floor. Sub-floor discoveries enter the DREAM pool (see document 06).

---

## A2. Primitive Identity Fingerprinting

Discovered capabilities receive a stable identity that is:

- **Deterministic** — same input, same substrate state, same fingerprint.
- **Compact** — fixed-width regardless of capability size.
- **Collision-rare** — the namespace of 40 primitives admits a hash function with no observed collisions in production.
- **Epoch-rotated** — the fingerprint salt rotates on epoch boundaries (epoch names: SPARTA → ATHENA → TITAN → CONTRACT → CONTACT → MINDGAMES → IRONCLAD → BELIEVER → REVIVAL → CONVERGENCE → SYMBIOTIC). The rotation **fact** is public; the salt values are not.

The hash family used is from the FNV-1a lineage, which provides:

- O(n) hashing with a small constant.
- Acceptable distribution for a 40-element namespace.
- No cryptographic security claims (fingerprints are identity, not authentication).

---

## A3. Reproducibility

A reviewer can independently verify:

1. That the four-factor structure of CJPI is consistent across discoveries published by the substrate.
2. That fingerprints are stable across re-runs of identical inputs against an unchanged substrate.
3. That fingerprint distribution across the 40-primitive namespace is approximately uniform.
4. That epoch transitions invalidate prior fingerprints (epoch names appear in the public pipeline configuration).

A reviewer cannot independently:

- Recompute CJPI scores from first principles.
- Predict fingerprints for a given input without access to the salts.
- Reproduce DREAM outputs without the scoring weights.

This is by design. The substrate is published as a system, not as a recipe.

---

## A4. Open Questions for Reviewers

The author welcomes correspondence on:

- The choice of FNV-1a over alternative hash families for primitive identity.
- The four-factor CJPI structure versus alternative formulations (e.g., five-factor or principal-component-derived).
- The absence of LLM involvement in DREAM as a deliberate design choice.
- The trade-off between sealed processing (Convex Core™) and customer auditability.

---

© 2025–2026 CMPSBL® · CC BY 4.0
