# Patent Map

## The Two Patents

### Patent #1 — Ascension
- **Filing:** U.S. Patent App. No. 64/029,678
- **Subject matter:** Collision-based code restoration and capability discovery
- **What it covers:**
  - The phase-locked pipeline (init → upload → discovery → locking → ascension → complete)
  - The collision algorithm against the 40-primitive matrix
  - CJPI scoring of discovered capabilities
  - Deterministic structural fingerprinting
  - Pre-Ascension Gate hard-fail validation
  - Pre-Export Harness verification

### Patent #2 — Mana
- **Filing:** U.S. Patent App. (Mana)
- **Subject matter:** Runtime layer attachment and deployment loader
- **What it covers:**
  - Inline embedding mandate (self-contained wrapped files)
  - Layer 2 runtime attachment without source modification
  - Lex governance for layer rule resolution
  - Sealed-artifact distribution channel
  - Polyglot rendering of layer definitions

## Where They Converge

The **v19.1 export pipeline** is where both patents operate in the same artifact:

```
[ Source code ]
      ↓
   Ascension Pipeline (Patent #1)
      ↓
   Step 2 — Enhance: attach Mana layers (Patent #2)
      ↓
   Pre-Export Harness (Patent #1)
      ↓
   Polyglot Export (Patent #2 emission semantics)
      ↓
[ Sealed Convex Core™ artifact ]
```

This convergence — one pipeline that exercises both patents — is the **commercial moat**.

## Boundary Rules

| Surface | Patent |
|---------|--------|
| Phase order, collision detection, CJPI | #1 only |
| Fingerprinting, Merkle audit chain | #1 only |
| Layer attachment, Lex, inline embedding | #2 only |
| Polyglot emission of layers | #2 only |
| Convex Core™ sealed artifact | Both (sealing = #1, attachment runtime = #2) |
| /store SKU activation | #2 (attachment) |
| Pro-tier export bundle | Both |

## What's NOT Patented (And Why That's Fine)

- The 40-primitive matrix as a *list* — the patent is on the *collision algorithm*, not the names
- The fact that the substrate has 12 verticals — the value is in the discovery operation, not the count
- DECODE as an interface — it's the surface, not the patent
- The Merkle audit chain *structure* — standard crypto, but the *integration* with the pipeline phases is patent-relevant

## Trademarks

- **CMPSBL®** — registered
- **PromptFluid™** — common-law mark
- **Convex Core™** — common-law mark

## Patent Status Disclosure

Both patents are **filed, pending**. Customers and citing researchers should treat the IP as protected. Public disclosure in this library is bounded by doc 10 (Internal IP Boundary).

---

*© CMPSBL® · PromptFluid™ · 2026 · Kenneth E. Sweet Jr.*
