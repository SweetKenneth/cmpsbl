# Research Appendix

## Method Notes

### Determinism as a Design Principle
The substrate's correctness story rests on determinism: same input + same configuration = same output. This is enforced by:
- Immutable phase ordering
- Frozen Layer 2 engines
- Deterministic FNV-1a fingerprinting
- Algorithmic (non-AI) DREAM synthesis
- Merkle-linked audit chains for verification

Determinism is not a performance choice; it is the **trust substrate** for IP-protected, customer-owned artifacts.

### Why "Substrate" and Not "Platform"
"Platform" implies hostable services and a developer surface area to be exploited. "Substrate" denotes the underlying medium on which other software runs — closer to the actual architecture. The terminology is intentional and load-bearing for v19.1 messaging.

### The Internal/External Asymmetry
The v19.1 reframe formalizes an asymmetry:
- **Internal:** 12 verticals, Memory Stream, Discovery Engine, 39 of 40 primitives, DREAM weights, Lex priorities, CJPI scoring
- **External:** Ascension v2, /store, Free + Pro plans, DECODE, the two patent abstracts

This asymmetry is not a marketing failure to disclose — it is the **moat structure**. The factory is more valuable than the storefront, and the patents protect operations of the factory, not its existence.

## Reproducibility

For any Ascension v2 export, given:
1. Original source (byte-identical)
2. Same set of attached Layers (by version ID)
3. Same Lex policy version
4. Same substrate version

…the resulting artifact will produce a **byte-identical fingerprint**.

This is publicly verifiable at `/verify/:fingerprint`.

## References

- U.S. Patent App. No. 64/029,678 (Ascension)
- U.S. Patent App. (Mana)
- FNV-1a — Fowler-Noll-Vo hash function family
- Merkle, R.C. (1987). "A Digital Signature Based on a Conventional Encryption Function"
- SBOM (Software Bill of Materials) — NIST SP 800-218

## Glossary

| Term | Definition |
|------|------------|
| **Ascension v2** | The patented 6-phase code restoration pipeline (Patent #1) |
| **Mana** | The patented Layer 2 attachment runtime (Patent #2) |
| **Convex Core™** | The deterministic processing layer; sealed artifact boundary |
| **CJPI** | Capability Jewel Pricing Index; internal scoring (excluded from disclosure) |
| **DECODE** | The unified user-facing interface |
| **DREAM** | Algorithmic sub-threshold synthesis engine (Pro-tier feature) |
| **FNV-1a** | The hash function family used for substrate fingerprints |
| **Foundry** | Founder-only graduation vault |
| **Junkyard** | Public archive of rejected discoveries |
| **Layer** | A Mana wrapper purchased in /store, attached via Ascension Step 2 |
| **Lex** | Governance engine for Mana rule priority resolution |
| **Memory Stream** | The 8-hour autonomous discovery loop (internal) |
| **Meta Agent** | A premium CMPSBL Cognitive sold in /store |
| **Meta Engine** | A premium standalone engine sold in /store |
| **Polyglot** | The 9-language export capability |
| **Showroom** | Public capability showcase |
| **Substrate** | The whole CMPSBL system |
| **Vertical** | An internal discovery machine (one of 12, gated) |

## Limitations of This Library

- This library does **not** contain the technical specs needed to rebuild the substrate
- Patent claims are filed but pending; final claims may differ
- Terminology may continue to evolve; v19.1 is the current canonical set
- Some internal terms (e.g., NEXUS, CORTEX, ATLAS) are referenced but not specified — they are internal engines

## Acknowledgements

The v19.1 library is the result of a year of architectural hardening following the v13.5 publication. Thanks to the developers who pushed back, doubted, and demanded the substrate prove itself in code rather than claims.

---

*© CMPSBL® · PromptFluid™ · 2026 · Kenneth E. Sweet Jr.*
