# Ascension v2 — Pipeline Overview

> **U.S. Patent App. No. 64/029,678** — collision-based code restoration and layer attachment.
> The flagship product. The reason customers come.

## Phase Order (Immutable)

```
init → upload → discovery → locking → ascension → complete
```

Phase order is enforced by an immutable orchestrator state machine. No phase can be skipped, reordered, or repeated mid-run.

## Pre-Ascension Gate

Before any pipeline phase runs, source is validated by a **hard-fail gate**:
- Structural integrity check
- Language detection + syntax sanity
- Size and shape bounds
- Failed runs surface forensics (which check failed, how to fix)

If the gate fails, no audit chain is created. No state is mutated.

## Phase 1 — Upload
Source is staged, fingerprinted (FNV-1a), and registered with the orchestrator.
Both single-file and multi-file (repo) inputs are supported.

## Phase 2 — Discovery
The Discovery Engine (internal, gated) collides the input against the 40-primitive matrix.
Raw discoveries are deduplicated to the **top 4–7 unique capabilities**.
Each discovery carries a confidence band and evidence trail.
> Discovery internals (heuristics, vertical bias, federated 159-primitive pool) remain proprietary.

## Phase 3 — Locking
Capability set is frozen. Contracts are extracted. Collision scores are computed.
This is the point where the artifact identity is sealed.

## Phase 4 — Ascension (Step 2 — Enhance)
**This is where customers attach layers.**
- Crown Jewel layers (purchased in /store) auto-merge into Layer 2
- SDK-built layers (coming soon) attach via SDK
- Mana wrapping is applied at export boundaries (no source modification)
- Lex governance evaluates each layer's compatibility and resolves conflicts

## Phase 5 — Pre-Export Harness
Final gate before assembly:
- Verify all layers merged cleanly
- Verify polyglot emission readiness
- Verify Merkle audit chain integrity
- **Verify proof-of-firing** — every selected layer is referenced in the runtime envelope; silent layers fail export
- **Seal the artifact** — compute end-of-flow fingerprint over (source ⊕ canonical layer manifest ⊕ phase order ⊕ kernel version)

## Phase 6 — Export
Sealed artifact emitted. Contains:
- Wrapped source (inline-embedded — no sibling requires)
- All attached layers
- Activation guide
- Documentation
- Merkle-linked receipt
- 9-language polyglot variants
- **Artifact fingerprint** — what `/verify/:fingerprint` resolves against

## Runtime Envelope Contract

Every chain invocation in the exported artifact runs through `cmpsbl_chain(input, preLayers, execute, postLayers)`. Layers share a single typed context:

```ts
CmpsblRuntimeCtx { input, output, blocked, override, error, blockReason,
                   metadata: { phase, layerId, startTime, actionsTaken[] }, receipts[] }
```

**Short-circuit semantics:**
- Phase 0 hardening sets `ctx.blocked` → skip ALL downstream phases
- Phase 1–5 sets `ctx.blocked` → skip execution + remaining pre-layers
- Phase 1–5 sets `ctx.override` → skip Layer 1, still run post-layer observers
- Phase 6 (Layer 1) error → ctx.error set; Phase 7 layers can recover via override

**Proof-of-firing:** every layer must call `cmpsbl_record_action(ctx, layerId, action)` exactly once per pass. The pre-export harness rejects any silent layer.

## Determinism Guarantee

Same input + same layer set + same Lex policy = **byte-identical output**.
This is verifiable publicly via `/verify/:fingerprint`.

## Audit Chain

Every phase emits an audit entry. Entries are Merkle-linked. The chain head is periodically anchored to a Cloud audit table (and, in future phases, to external SBOM-compatible attestation).

## What's Not Disclosed Here

- CJPI scoring formula
- Discovery heuristics
- Lex priority table
- FNV salt values
- Layer 2 runtime engine source

These are the patent moat. See doc 10.

---

*© CMPSBL® · PromptFluid™ · 2026 · U.S. Patent App. No. 64/029,678*
