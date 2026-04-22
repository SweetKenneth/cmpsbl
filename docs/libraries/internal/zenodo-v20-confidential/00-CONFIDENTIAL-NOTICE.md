# 🔒 CONFIDENTIAL — INTERNAL CASE STUDY

**Document:** Ascension V2 + Mana — Complete Internal Reference
**Classification:** ATTORNEY/AUTHOR/DEVELOPER EYES ONLY
**Companion to:** USPTO Provisional Apps **64/029,678** (Ascension) and **64/031,637** (Mana)
**Author:** Kenneth E. Sweet Jr., Founder, CMPSBL®
**Version:** v20.0-internal · 2026-04-22

---

## ⚠️ DO NOT PUBLISH

This document is the **opposite** of the public Zenodo v19 disclosure bundle.

The public bundle (`/docs/libraries/zenodo-v19/`) deliberately discloses:
- The four-factor structure of CJPI™
- The fact that FNV-1a-family hashing is used for fingerprints
- The 40-primitive matrix shape (12 Organs · 12 Layers · 8 Engines · 8 Agents)
- The Lex priority-ordered registry concept

…but **withholds** the weights, the salts, the epoch rotation, the dedup thresholds, and the internal scoring logic. That is the moat.

**This document withholds nothing.** It contains:

1. The CJPI™ scoring weights (currently unrotated — shown verbatim from `dedup.ts` and `v1-bridge.ts`)
2. The FNV-1a constants in use (offset basis `0x811c9dc5`, prime `0x01000193`) and the structural normalizer recipe
3. The deduplication similarity threshold (`0.55`), MIN/MAX caps (`4` / `7`), and the normalizer regex
4. The seeded-shuffle LCG constants (`1664525`, `1013904223`, mask `0x7fffffff`)
5. The audit chain genesis hash literal (`ascension-v2-genesis-0000`) and entry-hash payload format
6. The full 92-capability Mana contract table with phase, deny-semantic, and Lex-key bindings
7. The wrapper phase enum (`GATE=0` → `VALIDATE=1` → `FAILSAFE=2` → original execution → `OBSERVE=3` → `ANALYZE=4`)
8. The Pre-Ascension Gate full grammar — bracket balancer, dollar-quote handler, regex-vs-division heuristic, Python-2 idiom catcher, structural Python checker
9. The Pre-Export Harness checks 1–6 verbatim (syntax, linkage, fingerprint, layer auto-wire, execution smoke, proof-of-firing)
10. Filing-style provisional drafts for both patents (Field, Background, Summary, Detailed Description, Claims 1-20, Abstract)
11. Reproducible test protocols a senior dev can run against the live codebase
12. Formal correctness proofs (determinism, tamper-evidence, fingerprint stability, Lex priority correctness)

## Distribution rules

- **Storage:** `docs/libraries/internal/zenodo-v20-confidential/` — `internal/` is the conventional CMPSBL® folder for non-public reference material
- **Sharing:** With patent counsel, with the founder, with senior engineers under written NDA — never on Zenodo, never in a public repo, never in marketing
- **Derivatives:** Public Zenodo bundles MUST keep the v19 redaction posture (structure-disclosed, secrets-withheld). Anything derived from this document must be re-redacted before public release
- **If leaked:** Patent claim scope is unaffected (the provisionals are filed). Trade-secret protection on the salts/weights/thresholds is lost; rotate them

## Standing IP policy reference

`mem://security/ip-and-data-protection-policy` — discovery heuristics, CJPI weights, FNV salts, epoch rotation, and internal orchestration are NEVER disclosed publicly. This document is the explicit, controlled exception.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL · NOT FOR PUBLIC RELEASE
