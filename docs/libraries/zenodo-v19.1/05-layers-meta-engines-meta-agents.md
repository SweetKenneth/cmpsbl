# Layers, Meta Engines & Meta Agents — The /store SKUs

`/store` sells exactly three SKU types. This document defines each.

## 1. Layers

**Definition:** A `CmpsblLayerDefinition` — a typed, governed behavioral wrapper that attaches to source code via Mana during Ascension v2 Step 2 (Enhance).

**Examples (illustrative, not exhaustive):**
- Observability layer — adds structured logging + tracing
- Security layer — adds input validation + injection guards
- Audit layer — adds Merkle-linked decision receipts
- Persistence layer — adds checkpointing + replay

**How they activate:**
1. Customer purchases the layer in /store
2. Layer is attached to their account
3. On their next Ascension v2 run, the layer is **selectable in Step 2**
4. On export, the layer is **auto-merged into Layer 2** of the wrapped artifact
5. The wrapped artifact contains the layer inline (no external requires)

**Polyglot:** Every layer auto-renders in all 9 supported languages.

**Pricing:** Tiered by complexity and capability. Customers may use Pro plan Store credits.

## 2. Meta Engines

**Definition:** Premium standalone engines that emerge from the internal Compiler graduating Memory Stream discoveries into enterprise-grade products.

**Where they run:** CLI, SDK, and standalone — not coupled to a specific Ascension run.

**Examples (illustrative):**
- A clockless workflow scheduler
- A federated query planner
- A deterministic state machine compiler

**How they reach /store:** internal pipeline:
```
Memory Stream (8h autonomous discovery)
  → DREAM synthesis (algorithmic scoring)
  → Foundry (founder-only graduation vault)
  → Compiler (packaging into standalone engine)
  → /store (customer-facing)
```

The customer sees the polished engine. They never see the discovery engine, the Memory Stream feed, or the Compiler's graduation criteria.

## 3. Meta Agents

**Definition:** Premium **CMPSBL Cognitives** — sealed, governed cognitive units. **Not generic agents.**

**Why the distinction matters:**
The world is saturated with agent frameworks. CMPSBL Cognitives are:
- Sealed in Convex Core™ artifacts (source-protected, memory-isolated)
- Each ships with a unique version ID
- Always-on learning even idle
- Encrypted owner-to-agent communication
- Backed by the substrate (not a wrapper around an LLM)

**Where they run:** CLI, SDK, standalone.

**Why this is the moat:** the Cognitive *is* the substrate's deterministic runtime applied to a single domain. It's not an LLM prompt. It's a sealed software artifact you own forever.

## What's NOT in /store (anymore)

| Removed | Why |
|---------|-----|
| Memory Packs | Folded into CLI/SDK standard capabilities |
| Tiered pricing ladder | Replaced by simple per-SKU pricing + Pro credits |
| Vertical-specific SKUs | Verticals are internal IP, not products |
| Templates | Folded into Layers and Meta Engines |
| Engine/Software Suites as a separate section | Collapsed into Meta Engines |

## How the Three Relate

```
┌─────────────────────────────────────────────┐
│              ASCENSION V2                    │
│   (the pipeline — Free + Pro plans)          │
└──────────────────┬──────────────────────────┘
                   │ attaches
        ┌──────────▼──────────┐
        │       LAYERS         │  ← /store
        │   (Mana wrappers)    │
        └─────────────────────┘
                   
┌─────────────────────────┐  ┌─────────────────────────┐
│     META ENGINES         │  │     META AGENTS          │  ← /store
│  (standalone, CLI/SDK)   │  │  (CMPSBL Cognitives)     │
└─────────────────────────┘  └─────────────────────────┘
```

Layers feed Ascension. Meta Engines and Meta Agents stand alone but interoperate via CLI/SDK.

---

*© CMPSBL® · PromptFluid™ · 2026*
