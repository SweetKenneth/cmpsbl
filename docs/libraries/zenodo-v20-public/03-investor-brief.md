# 03 — Investor brief

**Audience:** Sophisticated investor or partner doing diligence
**Length:** ~4 pages

---

## Thesis

CMPSBL® holds two filed U.S. provisional patents on a single architectural insight: **governance and discovery should be intrinsic properties of code, not external services attached to it**. Ascension™ (App. **64/029,678**) discovers what code can do. Mana™ (App. **64/031,637**) attaches enforceable rules to that code so the rules travel with it. Together they constitute a substrate for compliant, auditable software distribution with no functional equivalent in market.

## What we sell

| Surface | Customer value | Tier |
|---|---|---|
| **Ascension Pipeline** | Upload code → fingerprinted, deterministic capability report | Free + Pro $29/mo |
| **Mana Wrapper** | Self-contained, governance-bound version of customer code | Pro + Enterprise |
| **Audit Chain** | Cryptographically chained receipts of every governed invocation | Included |
| **Lex Registry** | Customer-defined rule sets that drive enforcement | Included |
| **Substrate API** | Programmatic access for integrators | Pro + Enterprise |

Two public plans (Free and Pro $29/mo). Enterprise by contract.

## Markets we touch (without needing to win any one of them)

| Adjacent market | Approx TAM | What we displace |
|---|---|---|
| Static code analysis | ~$3B | Capability-discovery slice |
| Runtime security / EDR | ~$8B | Inline policy-enforcement slice |
| Software supply chain | ~$2B | Governance layer above signing, below distribution |
| Compliance / audit tooling | ~$4B | Evidence-collection slice — our chain *is* the evidence |

We sit at the intersection. The wedge is the **receipt chain**: once an enterprise has a year of receipts, switching cost is operationally infinite.

## Defensibility

### Patent moat (disclosed)

Two filed provisionals (64/029,678 + 64/031,637). Coverage:

- **The collision pipeline as a method** — taking arbitrary input code, structurally evaluating it against a fixed governance matrix, scoring deterministically, fingerprinting, certifying. Method-claim territory.
- **The inline embedding mandate** — wrapped artifacts contain the original source verbatim within the wrapper file. Combined with cryptographic proof of non-modification, this is a structural claim competitors cannot work around without producing inferior artifacts.
- **Polyglot emission from a single contract** — the same governance contract produces equivalent wrappers across many host languages.

The provisionals disclose **structure** while withholding **secrets**. A competitor who reads them can build a measurably worse system. They cannot build the same one.

### Trade-secret moat (referenced, not exposed)

Beyond the patents, we hold trade secrets in: the CJPI™ weight distribution; the hash salts and epoch rotation schedule; the dedup threshold and normalizer policy; the wrapper composition tiebreakers; the Pre-Ascension Gate grammar; the internal benchmarking corpus. These are documented in an internal case-study held under NDA and are referenced — not reproduced — in this public bundle.

### Receipt-chain lock-in

After 6–12 months of production use, a customer's chain contains evidence that is operationally non-portable. Same lock-in shape as GitHub on commit history or Stripe on charge history — but applied to **execution history**.

## Why a senior engineer might dismiss this and why they're wrong

The most common skeptical reaction is in chapter **13**. Short version: AOP modifies the host; we preserve it byte-perfect. AOP has no audit chain; we have a Merkle-linked one. AOP has no discovery counterpart; Ascension is one. The pair is the contribution.

## Status snapshot

| | |
|---|---|
| Provisional patents | 2 filed, both pending |
| Production deployment | Live at https://cmpsbl.com and across the substrate |
| Polyglot coverage | Many native languages from a single contract |
| Capability matrix | 40 primitives × 92 governance capabilities |
| Audit chain | Active — every invocation appended |
| Founder | Solo. Kenneth E. Sweet Jr. |
| Funding | Bootstrapped |

## What an investor can validate in an afternoon

1. **Determinism** — Run Ascension twice on the same input. Fingerprints match. (Chapter 12, test 1.)
2. **Governance travel** — Wrap a function, move the wrapped file, invoke it. Rules still apply. (Chapter 12, test 4.)
3. **Audit integrity** — Modify a single byte of any audit entry. Chain detects the tamper. (Chapter 12, test 5.)
4. **Read the provisional summaries** — Chapters 06 and 07 mirror the filed claim structure.
5. **Inspect the source** — `src/lib/ascension-v2/` and `src/lib/mana/` are the disclosed implementations.

If those five check out, the rest of the bundle is depth.

---

© 2025–2026 CMPSBL®
