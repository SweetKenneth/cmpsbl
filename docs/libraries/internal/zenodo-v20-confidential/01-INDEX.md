# Ascension V2 + Mana — Internal Case Study (v20)

**Companion to USPTO 64/029,678 and 64/031,637**
**CONFIDENTIAL · Author/Counsel/Senior-Eng-under-NDA only**

---

## Table of contents

| # | Chapter | Audience | Length |
|---|---------|----------|--------|
| 00 | [Confidential Notice](00-CONFIDENTIAL-NOTICE.md) | All readers | 1 pg |
| 01 | This index | All readers | 1 pg |
| 02 | [What this is, in plain English](02-plain-english.md) | Non-technical | 4 pg |
| 03 | [Investor brief — what we sell, why it's defensible](03-investor-brief.md) | Investor | 5 pg |
| 04 | [History of the invention — dates that matter](04-invention-history.md) | All | 4 pg |
| 05 | [The 40-primitive matrix — full enumeration](05-primitive-matrix.md) | Technical | 5 pg |
| 06 | [Provisional spec draft — Ascension (64/029,678)](06-provisional-ascension.md) | Counsel + Eng | 18 pg |
| 07 | [Provisional spec draft — Mana (64/031,637)](07-provisional-mana.md) | Counsel + Eng | 18 pg |
| 08 | [The Ascension V2 pipeline — full disclosure with secrets](08-ascension-pipeline-full.md) | Senior Eng | 14 pg |
| 09 | [The Mana runtime — full disclosure with secrets](09-mana-runtime-full.md) | Senior Eng | 14 pg |
| 10 | [Lex governance math — priority, wildcard, evaluation](10-lex-math.md) | Senior Eng | 6 pg |
| 11 | [Formal correctness proofs](11-formal-proofs.md) | Senior Eng + Skeptic | 8 pg |
| 12 | [Reproducible test protocol — step-by-step verification](12-test-protocol.md) | Senior Eng | 10 pg |
| 13 | [Why the senior dev who said "this is just AOP" is wrong](13-skeptic-rebuttal.md) | Skeptic | 6 pg |
| 14 | [Glossary + citations + reproducibility statement](14-glossary-citations.md) | All | 4 pg |

**Total: ~118 pages**

## How to read this

- **Non-technical reader (investor, counsel intake):** 02 → 03 → 04, then 14 for vocabulary
- **Investor / due diligence:** 02 → 03 → 06 (Ascension claims) → 07 (Mana claims) → 13
- **Founder / personal reference:** Read sequentially. 11 + 12 + 13 are the operating manual
- **Senior developer / skeptical engineer:** 05 → 08 → 09 → 10 → 11 → 12 → 13. 11 and 12 are the proof; 13 anticipates the rebuttal arguments
- **Patent counsel:** 04 → 06 → 07 → 14. The provisional drafts cite source files that were the basis for the actual filing

## Two patents, one substrate

| | Ascension™ | Mana™ |
|---|---|---|
| App # | **64/029,678** | **64/031,637** |
| What it does | Discovers latent capabilities in code | Attaches governance to code |
| Time of action | Compile / build time | Distribution + runtime |
| Output | A scored, fingerprinted capability set | A wrapped, governed artifact |
| Determinism | Same input → same fingerprint → same discovery | Same registry → same verdict on same call |
| Headline novelty | Collision pipeline as a method | Governance contract that travels with the code |

The two patents are **complementary, not redundant**. Ascension finds what's there. Mana governs what runs. Used together, you get the full Convex Core™ pipeline: scan → score → seal → wrap → ship → enforce → audit.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL

