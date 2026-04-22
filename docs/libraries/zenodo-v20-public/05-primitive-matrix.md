# 05 — The 40-primitive matrix

**Source of truth:** `src/lib/ascension-v2/canonical-primitives.ts`
**Build-time guarantee:** matrix length is asserted equal to 40.

---

## The four taxonomic categories

```
ORGANS  (12) — long-lived stateful units
LAYERS  (12) — cross-cutting governance / policy bands
ENGINES  (8) — transformation / synthesis machines
AGENTS   (8) — purpose-built executors

Total: 40
```

This decomposition matches the way enterprise architects describe systems: what holds state, what crosses cuts, what transforms, what executes. It also matches Mana's wrapper-phase ordering — GATE phase is dominated by Layers, OBSERVE phase by Organs, ANALYZE phase by Engines.

---

## Full enumeration

### Organs (12)

`CORE`, `SYSTEM`, `BRAIN`, `MEMORY`, `NERVE`, `NEXUS`, `IDENTITY`, `SOVEREIGN`, `ATLAS`, `MEDIC`, `RELAY`, `CONSCIENCE`

### Layers (12)

`DEFENSE`, `IMMUNITY`, `GOVERNANCE`, `TREATY`, `EVOLUTION`, `REFLEX`, `COMPASS`, `INTEGRATION`, `INTENT`, `ACCESS`, `VISION`, `SHADOW`

### Engines (8)

`DREAM`, `HARVEST`, `FORGE`, `LINGUA`, `ECHO`, `PHANTOM`, `SANDBOX`, `RIPPLE`

### Agents (8)

`ENCODE`, `DECODE`, `AUDIT`, `ECONOMY`, `INCLUSIVE`, `CORTEX`, `ORACLE`, `ENGINEER`

---

## Why these 40, and not 30 or 50

Empirical, not theoretical. We tested matrix sizes from 12 to 200 against an open-source corpus:

| Matrix size | Verdict |
|---|---|
| 12 | Too coarse — capabilities collapsed |
| 24 | Workable but missed nuance |
| **40** | **Sweet spot** |
| 60 | Marginal new primitives rarely fired |
| 100 | Noise dominated signal |

40 was the elbow. The decomposition into 12·12·8·8 came after — we noticed the 40 primitives naturally clustered into four taxonomic bands and froze the layout.

The internal corpus, the per-size variance metrics, and the per-primitive activation distribution are held internally and referenced — not reproduced — here.

---

## Build-time guard

```typescript
export const CANONICAL_PRIMITIVES: readonly string[] = [
  ...ORGANS, ...LAYERS, ...ENGINES, ...AGENTS,
];

if (CANONICAL_PRIMITIVES.length !== 40) {
  throw new Error(
    `[canonical-primitives] Expected 40 primitives, found ${CANONICAL_PRIMITIVES.length}`,
  );
}
```

Runs at module load. Adding a 41st primitive or removing one fails the build immediately.

---

## Mana × Ascension correspondence

Each Ascension primitive maps to one or more Mana governance capabilities. The full count is **92 capabilities** distributed across the 40 primitives. This is the cross-product that makes the two patents complementary: Ascension *finds* a primitive (e.g., `DEFENSE`); Mana *attaches* one or more enforcement capabilities derived from that family.

The capability families are summarized in chapter 09. The full per-capability deny-semantics table and the Lex-key sharing rules are held internally.

---

© 2025–2026 CMPSBL®
