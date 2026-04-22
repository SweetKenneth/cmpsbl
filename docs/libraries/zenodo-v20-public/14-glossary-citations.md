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
| **Layer 1** | Original user source code, byte-perfect inside the artifact. |
| **Layer 2** | Mana wrapper around Layer 1. |
| **Fingerprint** | FNV-1a 32-bit hash of normalized source. |
| **Artifact fingerprint** | End-of-pipeline hash sealing source + manifest + phase order + kernel version. |
| **Audit chain** | Merkle-linked event log; FNV-1a per entry, SHA-256 anchors. |
| **Pre-Ascension Gate** | Parser-driven validity check before fingerprinting. |
| **Pre-Export Harness** | Six-check critical gate before artifact emission. |

## Citations

- Fowler, Noll, Vo. **FNV Hash Function.** 1991.
- Merkle, R. **Protocols for Public Key Cryptosystems.** 1980.
- NIST FIPS 180-4. **SHA-256.**
- Kiczales, G., et al. **Aspect-Oriented Programming.** ECOOP 1997.
- Open Policy Agent. **Rego language and runtime.** 2016+.
- USPTO. **Provisional Application No. 64/029,678** — Ascension. Filed January 2026.
- USPTO. **Provisional Application No. 64/031,637** — Mana. Filed January 2026.

## Source files cited in this bundle

```
src/lib/ascension-v2/
  canonical-primitives.ts     — 40-primitive matrix + build-time guard
  orchestrator.ts             — pipeline state machine, seeded shuffle
  fingerprint-gate.ts         — FNV-1a fingerprinting + artifact seal
  audit-chain.ts              — Merkle chain + SHA-256 anchor
  dedup.ts                    — Levenshtein grouping
  pre-ascension-gate.ts       — language-aware parse gate
  pre-export-harness.ts       — six-check critical gate

src/lib/mana/
  engine.ts                   — wrapper factory + composition + cryptographic verify
  lex.ts                      — priority-ordered rule registry
  types.ts                    — 92 capabilities + 5 phases + contract table
  detach-safe.ts              — controlled detach with verification
  lex-extended.ts             — predicate-rule overlay
```

## Reproducibility statement

Every structural claim in this bundle is sourced from the live codebase. To reproduce:

1. Clone the repository
2. `npm install`
3. `npm test` — green is the baseline
4. Run chapter 12 protocol — all 10 tests must pass
5. Inspect the source files cited above

Numerical constants (CJPI weights, FNV salts, dedup thresholds, LCG constants, audit-chain genesis literal) are intentionally withheld from this bundle. They are documented in an internal case-study held under NDA. A reviewer who needs to verify the constants for due-diligence purposes can request access through the founder under written agreement.

## Document control

| | |
|---|---|
| Version | v20.0-public |
| Date | 2026-04-22 |
| Classification | PUBLIC — safe for Zenodo, repository inclusion, citation |
| Internal counterpart | held under NDA |
| Author | Kenneth E. Sweet Jr., Founder, CMPSBL® |
| Storage | `docs/libraries/zenodo-v20-public/` |
| License | Documentation: CC BY 4.0 |

---

© 2025–2026 CMPSBL® · public release
