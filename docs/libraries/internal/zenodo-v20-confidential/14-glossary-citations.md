# 14 — Glossary, citations, reproducibility

---

## Glossary

| Term | Definition |
|---|---|
| **Ascension™** | Deterministic capability discovery method. USPTO 64/029,678. |
| **Mana™** | Symbiotic attachment runtime. USPTO 64/031,637. |
| **CJPI™** | Crown Jewel Pipeline Index. Four-factor scoring (Novelty, Utility, Complexity, Composability). |
| **Lex** | Mana's priority-ordered rule registry. |
| **Convex Core™** | The combined Ascension + Mana substrate. |
| **Primitive** | One of 40 architectural building blocks (12 Organs, 12 Layers, 8 Engines, 8 Agents). |
| **Capability** | One of 92 named Mana governance behaviors. |
| **Phase** | Wrapper execution band: GATE(0), VALIDATE(1), FAILSAFE(2), OBSERVE(3), ANALYZE(4). |
| **Layer 1** | Original user source code. Byte-perfect inside artifact. |
| **Layer 2** | Mana wrapper around Layer 1. |
| **Fingerprint** | FNV-1a 32-bit hash of normalized source. 8-char hex. |
| **Artifact fingerprint** | End-of-pipeline hash sealing source + manifest + phase order + kernel version. |
| **Audit chain** | Merkle-linked event log; FNV-1a per entry, SHA-256 anchors. |
| **Pre-Ascension Gate** | Parser-driven validity check before fingerprinting. |
| **Pre-Export Harness** | Six-check critical gate before artifact emission. |
| **Genesis hash** | Literal `'ascension-v2-genesis-0000'` — first prevHash in any chain. |

## Citations

- Fowler, Noll, Vo. **FNV Hash Function.** 1991. Used for structural fingerprinting.
- Merkle, R. **Protocols for Public Key Cryptosystems.** 1980. Source of hash-chain construction.
- Numerical Recipes. **LCG with multiplier 1664525, increment 1013904223.** Used for seeded shuffle.
- NIST FIPS 180-4. **SHA-256.** Used for forensic-grade chain anchoring.
- Kiczales, G., et al. **Aspect-Oriented Programming.** ECOOP 1997. Prior art for function-boundary wrapping.
- Open Policy Agent. **Rego.** 2016. Prior art for policy-as-code (external).
- USPTO. **Provisional Application No. 64/029,678** — Ascension. Filed January 2026.
- USPTO. **Provisional Application No. 64/031,637** — Mana. Filed January 2026.

## Source files cited in this document

```
src/lib/ascension-v2/
  canonical-primitives.ts     — 40-primitive matrix + build-time guard
  orchestrator.ts             — pipeline state machine, seeded shuffle
  fingerprint-gate.ts         — FNV-1a fingerprinting + artifact seal
  audit-chain.ts              — Merkle chain + SHA-256 anchor
  dedup.ts                    — Levenshtein grouping at threshold 0.55
  pre-ascension-gate.ts       — language-aware parse gate
  pre-export-harness.ts       — six-check critical gate

src/lib/mana/
  engine.ts                   — wrapper factory + composition + SHA-256 verify
  lex.ts                      — priority-ordered rule registry
  types.ts                    — 92 capabilities + 5 phases + contract table
  detach-safe.ts              — controlled detach with verification
  lex-extended.ts             — predicate-rule overlay
```

## Reproducibility statement

Every numerical constant, threshold, regex, and algorithm in this document is sourced from the live codebase at the project root. To reproduce:

1. Clone the repository at the commit hash on the cover page
2. `npm install`
3. `npm test` — all green is the baseline
4. Run chapter 12 protocol — all 10 tests must pass
5. Inspect the source files cited above

If a constant in this document does not match the source file, the source file is authoritative. Open an issue to reconcile.

## Document control

| | |
|---|---|
| Version | v20.0-internal |
| Date | 2026-04-22 |
| Classification | CONFIDENTIAL — author/counsel/NDA-engineer only |
| Public counterpart | `docs/libraries/zenodo-v19/` (redacted) |
| Author | Kenneth E. Sweet Jr., Founder, CMPSBL® |
| Storage | `docs/libraries/internal/zenodo-v20-confidential/` |

---

© 2025–2026 CMPSBL® · CONFIDENTIAL · NOT FOR PUBLIC RELEASE
