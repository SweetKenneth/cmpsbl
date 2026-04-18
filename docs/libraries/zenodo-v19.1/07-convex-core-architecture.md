# Convex Core™ Architecture

## What Convex Core™ Is

The **Deterministic Processing Layer (DPL)** of the substrate. Every CMPSBL artifact (Ascension export, Meta Engine, Meta Agent) runs inside a Convex Core™ sealed artifact.

## Properties

| Property | Meaning |
|----------|---------|
| **Source-protected** | Original source is sealed inside the artifact, not exposed at runtime |
| **Memory-isolated** | Each artifact has its own memory boundary; no cross-contamination |
| **Tamper-proof** | Modification breaks the fingerprint; verification fails |
| **Deterministic** | Same input + same artifact = same output, byte-identical |
| **Self-contained** | No external sibling requires; everything inline |
| **Versioned** | Each purchase creates an immutable version ID |

## Why "Convex"

The term refers to the **convex hull** of the substrate's deterministic operations — every output point is reachable as a deterministic combination of substrate primitives. There is no point inside the hull that requires non-deterministic execution.

## Topology

```
┌─────────────────────────────────────────┐
│         CUSTOMER ARTIFACT                │
│  ┌───────────────────────────────────┐  │
│  │       Layer 3 — Runtime Context    │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Layer 2 — Mana Wrappers     │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Layer 1 — Source     │  │  │  │
│  │  │  │  (original, sealed)   │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│       Convex Core™ DPL boundary           │
└─────────────────────────────────────────┘
```

## Sealed-Artifact Guarantees

When a Convex Core™ artifact is delivered:
1. Fingerprint is computed at seal time
2. Fingerprint is registered with the substrate
3. Public verification at `/verify/:fingerprint` confirms integrity
4. Any byte modification produces a different fingerprint → verification fails
5. No way to "patch" an artifact post-seal — only re-Ascend from updated source

## Why This Matters for Customers

- **Compliance:** sealed + fingerprinted artifacts pass SBOM and supply-chain attestation
- **IP protection:** customer source isn't visible to attackers who only have the artifact
- **Reproducibility:** reissued artifacts from same source are byte-identical
- **Trust:** the Convex Core™ boundary is the thing that makes "same code, new behavior" credible

## What's Not Disclosed

- Sealing algorithm internals
- Fingerprint salt values
- Memory isolation enforcement mechanics
- Layer 2 engine source

---

*© CMPSBL® · PromptFluid™ · 2026 · Convex Core™ is a trademark of CMPSBL®*
