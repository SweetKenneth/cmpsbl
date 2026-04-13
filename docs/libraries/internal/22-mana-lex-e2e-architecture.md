# Mana + Lex — End-to-End Architecture Reference

**Classification:** 🔒 GOVERNOR EYES ONLY  
**Version:** v2.0.0  
**Patent:** U.S. Patent App. No. 64/031,637  
**Last Updated:** April 2026  

---

## Purpose

This document is Kenneth's personal reference for how Mana and Lex work end-to-end — from raw host code to governed, proof-verified runtime symbiosis. No marketing narrative. Just how the system actually behaves.

---

## 1. What Mana Is

Mana is a **Silent Software Symbiosis Engine**. It wraps third-party (or first-party) code at function boundaries without modifying the host source. The host never knows it's there.

**What it is NOT:**
- Not a framework (no opinion on how the host is structured)
- Not a transpiler (no AST rewriting, no build step)
- Not an agent (no autonomous decision-making at the wrapper level)

**What it actually does:**
1. Takes a JavaScript/TypeScript module (the "host")
2. Identifies exported functions
3. Wraps each function with one or more **capability wrappers**
4. Produces a **cryptographic proof** that the host source was not modified
5. Runs the wrapped module in production — silently, governed, auditable

---

## 2. What Lex Is

Lex is the **governance conscience** of Mana. Every wrapper attachment and every runtime invocation passes through Lex evaluation before anything happens.

**Lex answers two questions:**
1. **Attachment-time:** "May this capability wrapper be applied to this function?"
2. **Runtime:** "May this invocation proceed right now?"

**Lex does NOT:**
- Make probabilistic decisions (no AI, no ML)
- Self-modify (rules are externally registered, not auto-generated)
- Override the host's behavior (it only gates Mana's wrappers)

---

## 3. The Execution Model

### 3.1 Five Wrapper Phases

Every capability maps to exactly one phase. Phases execute in strict order:

```
GATE (0) → VALIDATE (1) → FAILSAFE (2) → [ORIGINAL FUNCTION] → OBSERVE (3) → ANALYZE (4)
```

| Phase | Purpose | Blocking? | Examples |
|-------|---------|-----------|---------|
| **GATE** | Access control, policy enforcement | Yes — can reject | `defense_gate`, `access_controller`, `consent_gate` |
| **VALIDATE** | Input cleaning, sanitization | Yes — can throw | `input_sanitizer`, `injection_guard`, `rate_limiter` |
| **FAILSAFE** | Resilience: retries, circuit breakers | Yes — can interrupt | `circuit_breaker`, `retry_handler`, `timeout_guard` |
| **OBSERVE** | Telemetry, audit, logging | No — never blocks | `beacon_telemetry`, `audit_trail`, `call_logger` |
| **ANALYZE** | Post-processing, memory, dreams | No — never blocks | `dream_synthesis`, `anomaly_detector`, `memory_cache` |

### 3.2 Wrapper Composition

When multiple capabilities target the same function, they **compose** — they don't overwrite.

**Sort order:**
1. Sort by phase (ascending)
2. Sort by capability name (alphabetical) — deterministic tiebreaker
3. **Reverse** — so ANALYZE wraps first (innermost), GATE wraps last (outermost)

**Result:** When the function is called, execution flows:
```
GATE wrapper (outermost)
  → VALIDATE wrapper
    → FAILSAFE wrapper
      → [original function executes]
    → OBSERVE wrapper
  → ANALYZE wrapper (innermost)
```

Each wrapper wraps the **result of the previous wrapper**, not the original function. This was a critical bug fix — the old code was wrapping `originalFn` every time, which meant only the last wrapper actually ran.

### 3.3 The Composition Loop (Actual Code Logic)

```
// Group capabilities by function name
// For each function:
let wrapped = rawOriginal;
for (const cap of sortedReversedCaps) {
  // Lex check (attachment-time)
  // Create attachment point
  wrapped = wrapFunction(wrapped, ...);  // ← composes, not overwrites
  wrapped[MANA_LAYER_TAG] = true;        // ← symbol tag for detection
}
hostModule[functionName] = wrapped;       // ← assign ONCE at end
```

---

## 4. The Lex Governance Pipeline

### 4.1 Rule Structure

```typescript
interface LexRule {
  id: string;
  capability: ManaCapabilityOrWildcard;  // specific cap or '*'
  target: string;                         // function name or '*'
  verdict: 'allow' | 'deny' | 'observe';
  reason: string;
  priority: number;                       // 0–1000, lower = higher priority
}
```

### 4.2 Evaluation Logic

When Lex evaluates a capability against a target:

1. Sort all rules by priority (ascending), then creation order
2. For each rule:
   - `capability === requested` OR `capability === '*'` → capability matches
   - `target === functionName` OR `target === '*'` → target matches
   - First match wins → return verdict
3. No match → fall back to mode:
   - `permissive` → allow
   - `strict` → deny

### 4.3 Wildcard Semantics

- **`capability: '*'`** — matches ANY capability (used by registry bridge for package-level governance)
- **`target: '*'`** — matches ANY function name
- Both are proper types (`ManaCapabilityOrWildcard`), not cast hacks

### 4.4 Priority Normalization

All priorities are clamped to `[0, 1000]` via `normalizePriority()`. This prevents:
- Negative priorities gaming the sort
- Absurdly high priorities that could shadow everything
- Unpredictable ordering in multi-source rule environments

---

## 5. Session Isolation

### 5.1 Why Sessions Exist

The original engine used global mutable state. This made it unsafe for:
- Multi-module attachment (two packages at once)
- Concurrent testing
- Any environment where isolation matters

### 5.2 What a Session Owns

Each `ManaSession` has its own:
- Lex rules (session-scoped, not global)
- Attachment points map
- Telemetry buffer
- Originals map (for detach)
- Proof state
- Layer depth tracking
- Trace log

### 5.3 Session vs Global Engine

| Feature | Global Engine | Session |
|---------|--------------|---------|
| State | Module-level variables | Instance-scoped |
| Lex rules | Shared global `Map` | Per-session `Map` |
| Use case | Single-package convenience | Multi-package safety |
| Registry bridge | Uses global Lex | Uses session Lex (if passed) |

---

## 6. The Registry Bridge

### 6.1 What It Does

Connects the **Lex Registry** (backend database) to **runtime Lex rules**. When you look up a package in the registry, its status determines what rules are hydrated:

| Registry Status | Lex Verdict | Priority | Effect |
|----------------|-------------|----------|--------|
| `protected` | `deny` | 10 | Blocks ALL Mana attachment — IP governance |
| `licensed` | `observe` | 50 | Allows attachment with full audit trail |
| `unregistered` | `allow` | 200 | No restrictions (default) |

### 6.2 Session Awareness

The registry bridge accepts an optional `ManaSession`. When provided:
- Rules are registered via `session.registerRule()` (not global Lex)
- Revocation uses `session.revokeRule()`
- Isolation is maintained

When no session is passed, it falls back to global Lex. This is the legacy path.

---

## 7. Proof System

### 7.1 What a Proof Contains

```typescript
interface ManaProof {
  hostHashBefore: string;     // SHA-256 of host source at attachment time
  hostHashAfter: string;      // SHA-256 of host source at proof generation
  verified: boolean;          // hostHashBefore === hostHashAfter
  timestamp: number;
  hostPackage: string;
  hostVersion: string;
  attachmentPointCount: number;
  capabilities: ManaCapability[];
  fingerprintId: string;      // Unique runtime ID (e.g., "MANA-X8K2D1-...")
  layerDepth: number;         // 0 = raw host, 1 = first Mana layer
  parentLayerHash: string | null;
  manifestHash: string;       // SHA-256 of sorted manifest snapshot
  telemetryEventCount: number;
}
```

### 7.2 Deterministic Hashing

The manifest hash is computed from a **sorted** snapshot:
1. Attachment points sorted by `functionName`, then `capability` (alphabetical)
2. Capabilities array sorted alphabetically
3. JSON stringified → SHA-256

This guarantees: same attachments → same hash, regardless of insertion order.

### 7.3 What "Verified" Means

`verified: true` means:
> "The host source code has not been modified between attachment and proof generation."

This is the core patent claim — Layer 2 capabilities are added **without** modifying Layer 1 source.

---

## 8. Layer Detection + Recursive Stacking

### 8.1 The Problem

Mana can wrap already-wrapped code (V2 wraps V1). But how do you detect if something is already a Mana wrapper?

### 8.2 Old Approach (Broken)

```typescript
// ❌ Fragile — depends on function naming convention
if (val.name?.startsWith('mana')) { ... }
```

### 8.3 Current Approach (Symbol-Based)

```typescript
export const MANA_LAYER_TAG: unique symbol = Symbol('MANA_LAYER');

// After wrapping:
(wrapped as any)[MANA_LAYER_TAG] = true;

// Detection:
if (typeof val === 'function' && val[MANA_LAYER_TAG] === true) {
  layerDepth++;
}
```

**Why this works:**
- Symbols are unique — no naming collisions
- Cannot be accidentally triggered by host code
- Survives minification (symbols don't rename)
- Explicit — no inference, no guessing

---

## 9. Contract System

### 9.1 What a Contract Defines

Every one of the 92 capabilities has a formal contract:

```typescript
interface CapabilityContract {
  capability: ManaCapability;
  phase: WrapperPhase;
  denySemantic: 'throw' | 'return_undefined' | 'return_message' | 'swallow';
  blocking: boolean;
  lexKey: ManaCapability;  // may differ from capability (e.g., access_rbac_gate → access_controller)
}
```

### 9.2 Immutability Guarantees

Three layers, all frozen at runtime:

| Artifact | Type Safety | Runtime Safety |
|----------|-------------|----------------|
| `CAPABILITY_PHASE` | `Readonly<Record<...>>` | `Object.freeze()` |
| `CAPABILITY_CONTRACTS` | `ReadonlyArray<...>` | `Object.freeze()` |
| `CONTRACT_MAP` | `Readonly<Record<...>>` | `Object.freeze()` |

### 9.3 Coverage Enforcement

**Runtime:** `assertContractMapComplete()` — throws if any capability in `CAPABILITY_PHASE` is missing from `CONTRACT_MAP`. Runs once on first `configure()` call.

**Compile-time:**
```typescript
type _MissingContracts = Exclude<ManaCapability, (typeof CAPABILITY_CONTRACTS)[number]['capability']>;
type _AssertAllCapabilitiesMapped = _MissingContracts extends never ? true : never;
```
If a capability is added to `ManaCapability` without a corresponding contract, TypeScript will refuse to compile.

---

## 10. Telemetry Model

### 10.1 Event Shape

Every telemetry event has a guaranteed minimum shape:

```typescript
{
  timestamp: number,
  capability: ManaCapability,
  functionName: string,
  action: 'invoked' | 'blocked' | 'observed' | 'mutated',
  evalContext?: 'attachment' | 'runtime',
  metadata: {
    phase: number,    // always present (defaults to -1)
    position: number, // always present (defaults to -1)
    ...rest           // action-specific metadata
  }
}
```

### 10.2 Why Defaults Before Spread

```typescript
const enriched = {
  phase: point?.phase ?? CAPABILITY_PHASE[capability] ?? -1,
  position: point?.position ?? -1,
  ...metadata,  // caller can override, but defaults always exist
};
```

This guarantees audit-chain consumers can rely on `phase` and `position` existing in every event, regardless of edge cases.

### 10.3 Trace Mode

When enabled (`enableTrace()`), every telemetry event also produces a human-readable log line:
```
[2026-04-13T05:30:00.000Z] INVOKED defense_gate::processPayment (attachment) phase=0 pos=0 {"action":"attached"}
```

---

## 11. Async Safety

### 11.1 The Problem

Host functions can be sync or async. Wrappers must handle both without:
- Converting sync to async (adding unnecessary promise overhead)
- Silently swallowing async rejections
- Breaking promise chains

### 11.2 The Solution

```typescript
function isThenable(val: unknown): val is Promise<unknown> {
  return val != null && typeof val === 'object' && typeof val.then === 'function';
}

function withAsyncSafety(result, onSync, onError) {
  if (isThenable(result)) {
    return result.then(
      (resolved) => { onSync(resolved); return resolved; },
      (err) => { onError(err); throw err; },
    );
  }
  onSync(result);
  return result;
}
```

**Rule:** ALL wrappers (except GATE, which blocks before execution) use `withAsyncSafety`. No manual `.then` checks.

---

## 12. Full E2E Flow

Here's what actually happens when you attach Mana to a package:

### Step 1: Scan
```
session.scan(hostModule, 'my-package', '1.0.0')
→ Returns list of exported function names
```

### Step 2: Registry Check (Optional)
```
enforceRegistryStatus(session, packageHash)
→ Looks up package in Lex Registry
→ Hydrates session Lex rules based on status (protected/licensed/unregistered)
```

### Step 3: Attach
```
session.attach(hostModule, capabilities, sourceCode)
```
Internally:
1. Detect existing Mana layers (symbol check) → increment `layerDepth`
2. Hash host source → store as `hostSourceHash`
3. Sort capabilities by phase (ascending) then name → reverse
4. Group by function name
5. For each function:
   - Store original (once)
   - Loop through caps:
     - Lex evaluation (attachment-time) → deny → skip
     - Create attachment point
     - Compose wrapper (wraps previous, not original)
     - Tag with `MANA_LAYER_TAG`
     - Emit telemetry
   - Assign composed wrapper to host module
6. Set state → `symbiotic`

### Step 4: Runtime
```
hostModule.processPayment(data)
```
Execution flows through wrapper stack:
1. GATE wrapper → Lex runtime check → allow/deny/observe
2. VALIDATE wrapper → input sanitization
3. FAILSAFE wrapper → circuit breaker / retry
4. **Original function executes**
5. OBSERVE wrapper → telemetry emitted
6. ANALYZE wrapper → anomaly detection, memory

### Step 5: Proof
```
session.generateProof(sourceCode)
→ Hashes current source
→ Compares to attachment-time hash
→ verified: true = source unchanged
→ manifestHash = deterministic snapshot hash
```

### Step 6: Detach
```
session.detach(hostModule)
→ Restores all original functions from originals map
→ Returns final manifest with all telemetry
→ Decrements layerDepth
```

---

## 13. Invariants (Things That Must Always Be True)

| # | Invariant | Enforced By |
|---|-----------|------------|
| 1 | Every capability has a contract | `assertContractMapComplete()` + compile-time type check |
| 2 | Every capability has a phase mapping | `assertAllPhasesMapped()` |
| 3 | Contract mappings are immutable | `Object.freeze()` on all three artifacts |
| 4 | Wrapper execution order is deterministic | `byPhaseThenName().reverse()` sort |
| 5 | Wrappers compose, not overwrite | `wrapped = wrap(wrapped, ...)` loop |
| 6 | Host source is never modified | SHA-256 proof verification |
| 7 | Lex wildcards are type-safe | `ManaCapabilityOrWildcard` type (not cast) |
| 8 | Priority is bounded | `normalizePriority()` clamps to [0, 1000] |
| 9 | Telemetry always has phase + position | Defaults before metadata spread |
| 10 | Layer detection is explicit | `MANA_LAYER_TAG` symbol, not name heuristic |

---

## 14. Known Limitations (Honest Assessment)

| Area | Status | Notes |
|------|--------|-------|
| Rate limiting | In-memory | Not production-safe for distributed systems — needs Redis/KV |
| Layer depth detection | Symbol-based | Correct but single-process only — no cross-process detection |
| Session lifecycle | One-per-process | Global verification ledger limits concurrent sessions |
| Async retry | Fixed backoff | `10 * (attempt + 1)` ms — simple but not jittered |
| Telemetry retention | Bounded array | `splice()` on overflow — loses oldest events |

---

## 15. File Map

| File | Purpose |
|------|---------|
| `src/lib/mana/types.ts` | All types, 92 capabilities, phase map, contracts, CONTRACT_MAP, MANA_LAYER_TAG, invariant assertions |
| `src/lib/mana/engine.ts` | Global engine — scan, attach, detach, proof, telemetry, wrapper factories |
| `src/lib/mana/session.ts` | Session-scoped engine — isolated state, session Lex, same wrapper model |
| `src/lib/mana/lex.ts` | Global Lex governor — rule registration, evaluation, wildcard handling |
| `src/lib/mana/registry-bridge.ts` | Lex Registry → runtime Lex rule hydration (session-aware) |
| `src/lib/mana/findings-bridge.ts` | Ascension findings → Mana attachment plan converter |
| `src/lib/mana/config.ts` | Declarative deployment configuration (Phase 1) |
| `src/lib/mana/manifest-consumer.ts` | Ascension manifest → Mana config auto-deploy bridge |
| `src/lib/mana/index.ts` | Public API surface — all exports |

---

*This document reflects the system as of April 13, 2026, after the deterministic core lock patch series.*

© CMPSBL® — All rights reserved.
