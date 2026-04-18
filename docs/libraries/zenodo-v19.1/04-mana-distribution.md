# Mana — Distribution & Layer 2

> **U.S. Patent App. (Mana)** — runtime attachment and deployment loader.
> The second patent. The distribution channel for all substrate software.

## What Mana Is

Mana is a deterministic, contract-driven runtime that **attaches behavioral wrappers at export boundaries without modifying source code**.

Where Ascension is the *pipeline*, Mana is the *attachment + execution* layer.

## The Inline Embedding Mandate

A Mana-wrapped file is **self-contained**:
- The original source is **copied into the wrapper**, not required as a sibling
- No external file dependencies at runtime
- The ZIP's separate copy of the source is for human reference only
- This is a non-negotiable architectural constraint (frozen since April 2026)

## Layer 2 Runtime

Mana operates as **Layer 2** of the substrate execution model:
- **Layer 1** — original source (untouched)
- **Layer 2** — Mana-attached behavioral wrappers (Crown Jewel + SDK layers)
- **Layer 3** — substrate runtime context

The Layer 2 engines are **frozen unless the founder approves changes**. This is part of the determinism guarantee.

## Lex Governance

Every Mana attachment is evaluated by the **Lex** governance engine:
- Priority-based rule evaluation
- Conflict resolution between layers
- Compatibility checks
- Audit logging of every decision

> Lex priority tables, rule resolution order, and decision algorithms are proprietary.

## Distribution Channel

**Mana is the distribution channel for all substrate software.**
When a customer buys a Layer in /store, they're buying Mana attachment rights for that layer in their Ascension exports.

## Patent Boundary

| Surface | Patent |
|---------|--------|
| Pipeline phase order, collision discovery, CJPI | Patent #1 (Ascension) |
| Layer attachment, deployment loader, inline embedding, Lex governance | Patent #2 (Mana) |
| The unified v19.1 export | **Both converge** |

## Polyglot Mana

Mana attachments render across all 9 supported languages via a generic polyglot engine. Any `CmpsblLayerDefinition` auto-emits in TypeScript, JavaScript, Python, Go, Rust, Java, C#, Ruby, and PHP without per-language branching.

## Security

Mana includes hardened security primitives:
- Command injection guards
- Path traversal protection
- Sealed execution boundaries
- Tamper-evident receipts on every attachment

## What's Not Disclosed

- Lex rule resolution algorithm
- Layer 2 engine source
- Attachment receipt signing scheme

---

*© CMPSBL® · PromptFluid™ · 2026 · U.S. Patent App. (Mana)*
