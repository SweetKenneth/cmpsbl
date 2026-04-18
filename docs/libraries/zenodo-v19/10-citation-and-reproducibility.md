# 10 — Citation & Reproducibility

**Zenodo v19 · SYMBIOTIC Epoch**

---

## Suggested Citation

**APA 7th:**

> Sweet, K. E. (2026). *CMPSBL® Zenodo v19 — Governed Cognitive Infrastructure: Public Research Library* (Version v19.0.0) [Software documentation deposit]. PromptFluid™. https://doi.org/10.5281/zenodo.[pending]

**BibTeX:**

```bibtex
@misc{sweet2026cmpsbl,
  author       = {Sweet, Kenneth E.},
  title        = {{CMPSBL® Zenodo v19 — Governed Cognitive Infrastructure: Public Research Library}},
  year         = {2026},
  version      = {v19.0.0},
  publisher    = {PromptFluid™},
  doi          = {10.5281/zenodo.[pending]},
  url          = {https://doi.org/10.5281/zenodo.[pending]},
  note         = {Supersedes v13.5 (April 2025)}
}
```

---

## Reproducibility Statement

This deposit documents the public-facing architecture, claims, and terminology of CMPSBL® as of the SYMBIOTIC epoch (April 2026). It is **not** a reproduction kit. The substrate cannot be rebuilt from this deposit alone. This is a deliberate design choice for the following reasons:

1. **Patent integrity** — published method internals would weaken the provisional applications (U.S. App. No. 64/029,678 and 64/031,637).
2. **Trade secret protection** — CJPI weights, Lex priorities, dispatch construction, and DREAM scoring are commercial trade secrets.
3. **Customer trust** — customers operate against a stable substrate. Public reconstruction would invite forks of varying quality that could be confused with the canonical system.

---

## What Is Independently Verifiable

A reviewer with access to the live substrate can verify:

- The 40-primitive matrix shape and primitive names.
- Convex Core™ public API surface (`compileDispatch`, `resolve`, `gate`, `verifyMatrix`).
- Receipt emission and Merkle chain anchoring.
- Fingerprint stability across runs.
- DREAM cycle existence and output format.
- The four-factor CJPI structure on published discoveries.

---

## What Requires Substrate Access

A reviewer cannot, from this deposit alone:

- Recompute CJPI scores.
- Predict fingerprints for novel inputs.
- Reproduce DREAM combinations.
- Construct a dispatch matrix.
- Replicate the collision pipeline in detail.
- Reproduce Lex evaluation order for arbitrary rule sets.

For these, contact the author with research credentials.

---

## Supersedes

This deposit supersedes:

- CMPSBL® Zenodo v13.5 (April 2025) — terminology and architecture pre-SYMBIOTIC epoch.
- Earlier whitepapers and case studies remain valid as published; readers should apply the v19 terminology updates (document 09) when interpreting them.

---

## Contact

Kenneth E. Sweet Jr.
PromptFluid™ · Austin, TX
ORCID: [0009-0001-4237-1243](https://orcid.org/0009-0001-4237-1243)

---

© 2025–2026 CMPSBL® · CC BY 4.0
