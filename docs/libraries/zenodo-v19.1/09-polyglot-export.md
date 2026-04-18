# Polyglot Export — 9 Languages

## What Ships in Every Ascension Export

Every Pro-tier Ascension v2 export emits the wrapped artifact in **9 languages**:

1. TypeScript
2. JavaScript
3. Python
4. Go
5. Rust
6. Java
7. C#
8. Ruby
9. PHP

## Native vs Bridge Emitters

- **34 native emitters** — first-class language support, idiomatic output
- **53 bridge emitters** — interop bridges for cross-language attachment

Customers do not need to choose. The export bundle contains all variants.

## How Layers Render Polyglot

The polyglot engine is **generic**: any `CmpsblLayerDefinition` auto-renders in all 9 languages without per-language branching.

This means a Layer purchased in /store works in every language target out of the box. The layer author writes one definition; the substrate handles emission.

## Hardware & Shader Targets

Beyond the 9 application languages, Ascension supports specialized synthesis targets:
- **VHDL · Verilog** — synthesizable hardware descriptions with functional intent preserved
- **GLSL · WGSL** — shader synthesis

These are ancillary targets and not included in every export by default; they are available when the source is appropriate (e.g., DSP, graphics, FPGA workflows).

## Determinism Across Languages

For a given source + layer set:
- Each language target is **independently deterministic** — re-emitting produces byte-identical output per language
- The cross-language equivalence is **functional**, not byte-level (Python ≠ Rust at the byte level)
- The fingerprint commits to the *bundle*, not to a single language

## Future Work

- **Parallel emission** — currently emitters can run sequentially; parallel emission planned for Phase 6 of the v2 roadmap
- **Streaming export** — large repos to process incrementally with progress (Phase 6)

## What's Not Disclosed

- Native vs bridge emitter implementations
- Per-language idiom mappings
- Emitter source

---

*© CMPSBL® · PromptFluid™ · 2026*
