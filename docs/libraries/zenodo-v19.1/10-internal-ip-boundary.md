# Internal IP Boundary — What's NOT in This Library

> The single most important document in v19.1.
> This catalogues exactly what stays proprietary, and why.

## Why This Document Exists

CMPSBL® has two filed U.S. patents and a substantial moat in algorithmic determinism. The v19.1 library refresh is a **public** research record. To preserve patent value and prevent reconstruction, certain components are intentionally excluded from all public docs.

This page is the auditable list of what's excluded.

## Excluded — Algorithmic IP

| Item | What It Is | Why Excluded |
|------|-----------|--------------|
| **CJPI scoring formula** | The Capability Jewel Pricing Index — how primitive collisions are scored | Reverse-engineerable into the Discovery Engine |
| **CJPI thresholds** | The cutoffs that route output to Junkyard / Showroom / Crown Jewel | Direct competitive intelligence |
| **DREAM synthesis weights** | Weight matrix for sub-threshold pattern aggregation | Patent-relevant; reveals scoring shape |
| **DREAM convergence criteria** | When sub-threshold signal becomes a surfaced pattern | Same |
| **Lex priority table** | Priority ordering for Mana layer rule evaluation | Reverse-engineerable governance |
| **Lex resolution algorithm** | How conflicting layer rules resolve | Same |
| **FNV salt values** | Seeds for FNV-1a fingerprinting | Allows fingerprint forgery if known |

## Excluded — Engine Source

- Layer 2 runtime engine source
- NEXUS routing tables and provider arbitrage logic
- CORTEX policy enforcement mechanics
- ATLAS governance internals
- BRAIN cross-vertical pattern detection logic
- IMMUNE matrix self-healing source

## Excluded — Discovery Surface

- The 159-primitive federated discovery pool composition
- Per-vertical bias coefficients
- Memory Stream graduation criteria
- Foundry promotion algorithm

## Excluded — Vertical Operations

The 12 vertical home pages and their operational data:
- Cyber, Fintech, Robotics, Quantum, LLM, Agency, Media, Health, Education, Marketplace-internal, Gaming, PromptFluid

These are **internal discovery machines**, gated behind `?1952=cmpsbl + 6-digit PIN`. The fact that they exist is public; their operation, primitive selection, and discovery output are not.

## Excluded — Trace Internals

- Trace and explainability internal schema
- Per-decision audit log fields beyond `/verify/:fingerprint` surface
- Anchoring schedule and Cloud audit table mapping

## Excluded — Founder-Only Surfaces

- `control.cmpsbl.com` — Master Power Center
- Founder Foundry vault contents
- Substrate roadmap (`/roadmap/substrate`)
- Internal Mana distribution doc
- Junkyard contents (failed/rejected discoveries)
- DECODE governance ceremony internals

## What IS Disclosed

For clarity, the **public** surface (and therefore safe to copy from this library):

- The fact that Ascension v2 exists, has 6 phases, and is patent-pending
- The fact that Mana exists, is Layer 2, is patent-pending, and uses inline embedding
- The fact that DREAM exists, is algorithmic and sub-threshold, and is part of Pro
- The fact that Convex Core™ artifacts are sealed, fingerprinted, and verifiable
- The fact that exports are polyglot across 9 languages
- The plans (Free + Pro), the Store SKUs (Layers · Meta Engines · Meta Agents)
- The two patent abstracts as filed
- The Merkle audit chain structure (publicly verifiable anyway)

## Reverse Engineering Statement

This library is **non-reconstructive**. A reader cannot rebuild the substrate from these docs. The published surface is enough to:
- Cite the work
- Verify artifacts
- Use the products
- Understand the patents at the abstract level

It is **not** enough to:
- Build a competing substrate
- Reproduce CJPI scoring
- Reproduce DREAM synthesis
- Reproduce Lex governance
- Forge fingerprints

That asymmetry is intentional.

---

*© CMPSBL® · PromptFluid™ · 2026 · Kenneth E. Sweet Jr.*
