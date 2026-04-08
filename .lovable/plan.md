
# Ascension ↔ Mana Convergence Plan

## Problem
Ascension currently does two jobs: scanning code AND generating Layer 2 wrappers. But its wrappers are **generic templates** (`DefenseLayer.activate(...)`) that don't target specific functions. Mana already has the surgical wrapping engine that targets individual function boundaries. These systems should converge.

## New Architecture

```
Upload → Ascension (SCAN + DIAGNOSE) → Mana (DEPLOY wrappers) → Export
```

### What Changes

#### 1. Ascension gains: Function Boundary Detection → `AscensionFindings`
**File:** `src/lib/factory/generate-refurbished-code.ts`

Currently Ascension knows *which primitives* the code needs but NOT *which functions* need wrapping. We add a lightweight function boundary scanner (similar to Mana's `scan()`) that produces a **findings manifest**:

```typescript
interface AscensionFinding {
  functionName: string;           // e.g. "processPayment"
  capability: ManaCapability;     // e.g. "defense_gate"
  reason: string;                 // e.g. "Handles untrusted input"
  primitive: string;              // e.g. "DEFENSE"
  confidence: number;             // 0-1 from scanner signals
}
```

This maps scanner signals to specific function names in the source:
- Functions with `input`, `request`, `parse`, `validate` → DEFENSE gate
- Functions with `save`, `update`, `delete`, `write` → GOVERNANCE hook
- Functions with `log`, `track`, `emit` → AUDIT trail
- Functions with `fetch`, `call`, `request` → CIRCUIT BREAKER
- All exported functions → BEACON telemetry

#### 2. `generateRefurbishedCode` replaces generic templates with Mana attachment config
**File:** `src/lib/factory/generate-refurbished-code.ts`

Instead of the current `PRIMITIVE_WRAPPERS` (generic `.activate()` calls), Layer 2 now emits a **Mana Attachment Manifest** — a serialized configuration that tells the Mana runtime exactly which functions to wrap with which capabilities:

```python
# Layer 2 — Mana Attachment Manifest
MANA_ATTACHMENTS = [
    {"function": "processPayment", "capability": "defense_gate"},
    {"function": "saveUser", "capability": "governance_hook"},
    {"function": "fetchData", "capability": "circuit_breaker"},
    {"function": "handleRequest", "capability": "defense_gate"},
]
```

The generic `DefenseLayer.activate()` / `GovernancePolicy.enforce()` templates are replaced with this targeted manifest + Mana's actual wrapper factories serialized in the target language.

#### 3. New file: `src/lib/mana/findings-bridge.ts`
Bridge between Ascension's scan results and Mana's attachment API:

```typescript
export function buildAttachmentPlan(
  findings: AscensionFinding[],
  primitives: PrimitiveRecommendation[],
): ManaAttachmentConfig[]
```

Takes Ascension's findings and produces the exact `{ functionName, capability, rulePayload }` array that Mana's `attach()` expects.

#### 4. Layer 2 code generation uses Mana wrapper factories
Instead of generating custom template classes per primitive, the generator serializes Mana's actual wrapper logic (`wrapWithDefenseGate`, `wrapWithCircuitBreaker`, etc.) into the target language. This means the exported code does what Mana does at runtime — Lex checks, invocation counting, circuit breaker thresholds — but as static, standalone code.

### What Stays the Same
- Layer 1 remains verbatim/untouched (patent compliance)
- SHA-256 proof chain unchanged
- Export ZIP format unchanged (18 files)
- Mana Lab (`/mana`) workflow unchanged — it already does this for runtime
- Polyglot adapters stay — they translate the Mana wrappers into target language syntax
- PROOF.txt, manifest.json, INTEGRATION.md unchanged

### Files Modified
1. `src/lib/factory/generate-refurbished-code.ts` — Replace `PRIMITIVE_WRAPPERS` with Mana-based wrapper generation; add function boundary detection
2. `src/lib/mana/findings-bridge.ts` — NEW: Bridge Ascension findings → Mana config
3. `src/lib/mana/engine.ts` — Export wrapper factory signatures for static serialization (no logic changes)
4. `src/lib/mana/types.ts` — Add `AscensionFinding` type

### Risk Assessment
- **Medium risk**: The polyglot adapters need to serialize Mana's JS wrapper logic into 90+ languages. The current adapter system already handles JS→Python/Rust/etc. transforms, but Mana's wrappers are more complex than the current templates.
- **Low risk**: No changes to Mana's runtime engine — only adding export-friendly serialization.
- **Zero risk**: Layer 1 untouched — patent compliance preserved.

### Estimated Scope
~300-400 lines changed across 4 files. The biggest change is replacing `PRIMITIVE_WRAPPERS` in `generate-refurbished-code.ts` with the findings-driven generation.
