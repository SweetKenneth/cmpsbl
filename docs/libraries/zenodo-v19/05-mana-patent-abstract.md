# 05 — Mana™ Patent Abstract

**Zenodo v19 · SYMBIOTIC Epoch**
**U.S. Provisional Application No. 64/031,637**

---

## Public Abstract

Mana™ is a symbiotic attachment runtime that binds governance contracts to arbitrary code at distribution time. The runtime travels with the wrapped code and enforces a Lex governance registry over every invocation, producing tamper-evident receipts anchored to a Merkle audit chain.

---

## What Is Claimed (Public)

1. **A wrapping method** — original source is embedded inline within a generated wrapper file, not referenced as a sibling module. The wrapped artifact is self-contained.
2. **Governance attachment** — a Lex priority-ordered rule registry is bound to the wrapper at compile time. Rules are evaluated against every invocation.
3. **Receipt emission** — every governed invocation produces a structured receipt that chains into a Merkle log.
4. **Polyglot emitters** — the wrapping method is implemented across 34 native languages and 53 bridge environments. The same governance contract applies regardless of host language.
5. **Safe detach** — the wrapper supports a controlled detach operation that removes Mana while preserving the original source untouched.

---

## What Mana™ Is Not

- It is not a sandbox. It does not isolate execution; it observes and gates.
- It is not a static analyzer. Decisions happen at invocation time.
- It is not a runtime modification system. The wrapped source is unchanged from the original byte sequence.

---

## Why This Is Defensible

The novelty is **governance that travels with code**. Most policy systems live at the platform layer (firewall, gateway, host). Mana lives **inside** the artifact, so the governance contract cannot be stripped by changing deployment environment. Combined with the Merkle receipt chain, this produces an audit posture that survives redistribution.

The combination — inline embedding plus Lex evaluation plus Merkle anchoring plus polyglot emission — is the patentable surface.

---

© 2025–2026 CMPSBL® · CC BY 4.0
