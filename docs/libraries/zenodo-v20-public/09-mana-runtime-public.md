# 09 — Mana runtime — public architecture

**Audience:** Senior engineer
**Posture:** Structure disclosed. Per-capability contract details withheld.

---

## Engine state

`src/lib/mana/engine.ts`

```
detached → scanning → attaching → symbiotic → detaching → detached
```

Engine state is session-scoped via `createSession()`. Globals are encapsulated to avoid multi-module state collisions.

## Cryptographic proof-of-non-modification

A SHA-256 digest of the host source is computed at attach time, embedded in the wrapper, and re-verified at every wrap operation. Drift causes attach to refuse.

```typescript
// Pseudocode
hostSourceHash = sha256(originalSource);
embedInWrapper(hostSourceHash);
// At every wrap: assert sha256(extractedSource) === hostSourceHash
```

## The 92 capabilities × 5 phases

**Phase enum (frozen):**

| Phase | Number | Role |
|---|---|---|
| GATE | 0 | Block before anything runs |
| VALIDATE | 1 | Clean inputs |
| FAILSAFE | 2 | Circuit breaker, retry, timeout |
| *(original execution)* | — | Implicit, between FAILSAFE and OBSERVE |
| OBSERVE | 3 | Telemetry, audit |
| ANALYZE | 4 | Post-processing, anomaly, memory |

**Composition rule:** when N capabilities attach to the same function, wrappers nest in phase order. Within a phase, ordering is deterministic. The original function executes once, between FAILSAFE and OBSERVE.

## Capability contract structure

```typescript
interface CapabilityContract {
  capability: ManaCapability;       // one of 92
  phase: WrapperPhase;              // 0-4
  denySemantic: 'throw' | 'return_undefined' | 'return_message' | 'swallow';
  blocking: boolean;                // can deny halt execution
  lexKey: ManaCapability;           // shared eval key (≤ capability)
}
```

**Family distribution (counts disclosed; per-capability bindings held internally):**

| Family | Phase | Capability count |
|---|---|---|
| Gating / denial | GATE | ~21 |
| Input validation | VALIDATE | ~10 |
| Reliability | FAILSAFE | ~12 |
| Telemetry / audit | OBSERVE | ~44 |
| Post-execution analysis | ANALYZE | ~10 |

**`lexKey` sharing:** several capabilities share a Lex evaluation key so that one rule can govern an entire access family (RBAC, API key, identity, tenant isolation evaluate against the same key). The exact sharing graph is held internally.

## Wrapper factory pattern

Each capability has a factory `wrapWithX(originalFn, functionName, point) → wrappedFn` that:

1. Increments invocation counter
2. Emits a `'invoked'` telemetry event
3. Calls `evaluate(lexKey, functionName, mode)` to get a verdict
4. Acts on the verdict per the contract's `denySemantic`
5. Calls the original function
6. Returns the result, preserving sync / async semantics

Async safety is preserved by a wrapper helper that detects thenables and propagates rejection through the same telemetry path.

## Detach safety

`src/lib/mana/detach-safe.ts` — controlled detach that preserves verbatim source and emits per-function `DetachEntryReport` with `outcome ∈ {'restored', 'in_use', 'not_attached', 'verify_fail'}`. In-flight invocations are tracked so detach refuses to remove a wrapper while it is executing.

## Lex registry — at the engine

Every wrapper calls `evaluate(lexKey, functionName, mode)`. The verdict drives the wrapper's behavior per the contract's `denySemantic`. Lex math is in chapter 10.

---

© 2025–2026 CMPSBL®
