# 03 — Investor brief

**Audience:** Sophisticated investor, partner, M&A diligence
**Length:** ~5 pages

---

## The thesis in one paragraph

CMPSBL® holds two filed U.S. provisional patents on a single architectural insight: **governance and discovery should be intrinsic properties of code, not external services attached to it**. Ascension™ (App. **64/029,678**) discovers what code can do; Mana™ (App. **64/031,637**) attaches enforceable rules to that code so the rules ride with it everywhere it runs. Together they constitute a substrate for compliant, auditable software distribution that has no functional equivalent in market. We are the only company shipping deterministic, fingerprint-anchored capability discovery combined with travel-with-the-code governance and Merkle-chained audit receipts. The combination is the moat.

---

## What we sell

| Product surface | What the customer gets | Tier |
|---|---|---|
| **Ascension Pipeline** | Upload code → receive a fingerprinted, deterministic capability report scored on the CJPI™ four-factor index | Free + Pro $29/mo |
| **Mana Wrapper** | A self-contained, governance-bound version of customer code, exportable in 34 native languages and 53 bridge environments | Pro + Enterprise |
| **Audit Chain** | Cryptographically chained receipts of every governed invocation, verifiable offline | Included |
| **Lex Registry** | Customer-defined or contract-defined rule sets that drive Mana enforcement | Included |
| **Substrate API** | Programmatic access to the full pipeline for integrators | Pro + Enterprise |

Two public plans (Free, Pro $29/mo). Enterprise is by contract. The Pro tier was deliberately priced to be the obvious upgrade — high free-tier ceiling, low Pro entry cost, retention driven by accumulated audit history (chapter 03 of the public roadmap).

---

## Market

**Adjacent markets we displace pieces of:**

| Adjacent | Annual TAM (rough) | What we replace |
|---|---|---|
| Static code analysis (SonarQube, Snyk) | ~$3B | Replaced for capability discovery; not for security scanning |
| Runtime security / EDR for code (Wiz, Aqua) | ~$8B | Replaced for the policy-enforcement piece |
| Software supply chain (Sigstore, Chainguard) | ~$2B | Complementary — we sit above signing, below distribution |
| Compliance / audit tooling (Drata, Vanta) | ~$4B | Replaced for the evidence-collection piece — our chain *is* the evidence |

We do not need to win any single market. We sit at the intersection. The wedge is **the receipt chain** — once an enterprise has a year of receipts, switching cost is near-infinite.

## Defensibility

### Patent moat

Two filed provisionals (64/029,678 + 64/031,637) cover:

- The **collision pipeline as a method** — taking arbitrary input code, structurally evaluating it against a fixed governance matrix, scoring the result deterministically, fingerprinting it, and certifying the artifact. This is method-claim territory.
- The **inline embedding mandate** — wrapped artifacts contain the original source verbatim within the wrapper file (not as a sibling import). Combined with the SHA-256 proof of non-modification, this is a structural patent claim that competitors cannot work around without producing inferior artifacts.
- **Polyglot emission** — 34 native + 53 bridge implementations of the same governance contract. The contract is the IP; the polyglot proves it generalizes.

The provisionals were drafted to disclose **structure** while withholding **secrets**. The four-factor scoring index (CJPI™) is disclosed; the weights are not. The hashing family (FNV-1a) is disclosed; the salts and epoch rotation are not. A competitor reading the provisionals can build a worse system. They cannot build the disclosed one.

### Trade-secret moat (the part this confidential document exposes)

Beyond the patents, we hold trade secrets in:

- The **CJPI™ weight distribution** across Novelty / Utility / Complexity / Composability
- The **FNV-1a salts and epoch rotation schedule** for the primitive identity fingerprint
- The **deduplication similarity threshold** (0.55), normalizer regex, and MIN/MAX cap policy
- The **wrapper phase ordering** for the 92 Mana capabilities (GATE → VALIDATE → FAILSAFE → OBSERVE → ANALYZE)
- The **Pre-Ascension Gate grammar** — bracket balancer, dollar-quote handler, regex-vs-division heuristic, Python-2 idiom catcher
- The **Lex priority math** — sorted ascending, ties broken by creation order, default verdict driven by mode

All disclosed in this document — see chapters 08, 09, 10. None of these are in the public Zenodo bundle.

### Receipt-chain lock-in

Every Mana invocation appends to a customer-scoped audit chain. After 6–12 months of production use, a customer's chain contains evidence that is operationally non-portable — they cannot move to a competitor without losing the verifiable history. This is the same lock-in that GitHub has on commit history, that Stripe has on charge history, and that we have on **execution history**.

---

## Why a senior engineer might dismiss this and why they're wrong

The most common skeptical reaction:

> "This is just AOP / aspect-oriented programming with a marketing layer. Spring AOP, AspectJ, Python decorators, JS proxies have done this for 20 years."

This is wrong on three axes, covered fully in chapter **13**. Short version:

1. **AOP modifies the host program.** Mana doesn't — the original source is byte-perfect inside the wrapper, verified with SHA-256 at every wrap. AOP weaves bytecode; Mana embeds verbatim source.
2. **AOP has no audit chain.** Spring AOP can call a logger. It cannot produce a tamper-evident chain of receipts that survives the host being compromised. Our audit chain is Merkle-linked from a genesis hash literal (`ascension-v2-genesis-0000`) and re-verifiable from any point.
3. **AOP has no discovery counterpart.** AOP is "I will wrap this method I picked manually." Ascension is "I will tell you which methods are worth wrapping, deterministically, and prove the choice was correct." There is no AOP framework that pairs with a deterministic capability discovery pipeline.

The full rebuttal lives in chapter 13.

---

## Status

| | |
|---|---|
| Provisional patents | 2 filed, both pending |
| Production deployment | Live at https://cmpsbl.com and 14 verticals |
| Polyglot coverage | 34 native languages + 53 bridge environments |
| Capability matrix | 40 primitives × 92 governance capabilities |
| Audit chain | Active — every invocation appended |
| Founder | Solo. Kenneth E. Sweet Jr. |
| Funding | Bootstrapped |

---

## What an investor needs to validate

A small list, runnable in an afternoon:

1. **Determinism** — Run the Ascension pipeline against the same input twice. Compare fingerprints. They will match. (Chapter 12, test 1.)
2. **Governance travel** — Wrap a function. Move the wrapped file. Run it. Confirm the rules still apply. (Chapter 12, test 4.)
3. **Audit integrity** — Generate a chain. Modify a single byte in any entry. Verify the chain detects the tamper. (Chapter 12, test 7.)
4. **Read the provisional drafts** — Chapters 06 and 07 are the filing-style drafts. The actual filed provisionals are with counsel and substantively match.
5. **Inspect the source** — `src/lib/ascension-v2/` and `src/lib/mana/` are the disclosed implementations. They run today.

If those five check out, the rest of this document is the depth.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
