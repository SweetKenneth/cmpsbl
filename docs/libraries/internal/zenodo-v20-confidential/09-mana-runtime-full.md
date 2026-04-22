# 09 — Mana runtime — full disclosure

**Audience:** Senior engineer
**Posture:** Full disclosure.

---

## Engine state

`src/lib/mana/engine.ts`

```
detached → scanning → attaching → symbiotic → detaching → detached
```

Globals (in V2, scoped via `createSession()` to avoid multi-module collisions):
- `config: ManaConfig` — telemetry, maxTelemetryEvents (10000), dreamSynthesis, lexMode (`permissive` | `strict`)
- `hostSourceHash: string` — SHA-256 of the host source at attach time
- `layerDepth: number` — recursive composition depth (0 = raw host)
- `parentLayerHash: string | null` — SHA-256 of parent layer for recursive wraps
- `attachmentPoints: Map<key, AttachmentPoint>` — key is `${functionName}:${capability}`
- `originals: Map<string, AnyFn>` — for clean detach
- `telemetry: ManaTelemetryEvent[]` — capped circular buffer

## SHA-256 proof-of-non-modification

```typescript
async function computeHash(source: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const data = new TextEncoder().encode(source);
    const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(source).digest('hex');
}
```

Computed at attach-time, embedded in the wrapper, re-verified at every wrap operation. Drift → attach refuses.

## The 92 capabilities × 5 phases

**Phase enum (frozen):**

| Phase | Number | Role |
|---|---|---|
| `GATE` | 0 | Block before anything runs |
| `VALIDATE` | 1 | Clean inputs |
| `FAILSAFE` | 2 | Circuit breaker, retry, timeout |
| *(original execution)* | — | Implicit, between FAILSAFE and OBSERVE |
| `OBSERVE` | 3 | Telemetry, audit |
| `ANALYZE` | 4 | Post-processing, anomaly, memory |

**Composition rule:** when N capabilities attach to the same function, wrappers nest in phase order. Within a phase, sort by capability name (alphabetical) for determinism. The original function executes once, between FAILSAFE and OBSERVE.

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

Full table: `src/lib/mana/types.ts:321+`.

**Family counts:**
| Family | Count | Phase distribution |
|---|---|---|
| GATE-phase | 21 | All blocking, mixed deny semantics |
| VALIDATE-phase | 10 | Mixed blocking |
| FAILSAFE-phase | 12 | Mostly blocking |
| OBSERVE-phase | 44 | All non-blocking, all `swallow` |
| ANALYZE-phase | 10 | Non-blocking |
| **Total** | **97 contract entries**, 92 unique capabilities (5 share `lexKey`) |

**`lexKey` sharing:** `access_rbac_gate`, `access_api_key_check`, `identity_auth_gate`, `sovereign_tenant_isolate` all evaluate against `access_controller`. `threat_scorer` evaluates against `defense_gate`. This collapses common rules — one Lex rule on `access_controller` blocks all four.

## Wrapper factory pattern

Each capability has a factory `wrapWithX(originalFn, functionName, point) → wrappedFn`. Pattern:

```typescript
return function manaX(this: unknown, ...args: unknown[]) {
  point.invocations++;
  emitTelemetry('X', functionName, 'invoked', { args: args.length });

  const { verdict, rule } = evaluate('X', functionName, config.lexMode);
  if (verdict === 'deny') {
    point.blocked++;
    emitTelemetry('X', functionName, 'blocked', { ruleId: rule?.id });
    // contract-defined: throw | return undefined | return message | swallow
  }
  if (verdict === 'observe') {
    point.observed++;
    emitTelemetry('X', functionName, 'observed', { ruleId: rule?.id });
  }

  const result = originalFn.apply(this, args);
  return withAsyncSafety(result, onSync, onError);
};
```

`withAsyncSafety` (engine.ts:89) preserves async semantics — sync stays sync, thenables stay thenables, rejection still fires `onError`.

## Detach safety

`src/lib/mana/detach-safe.ts` — controlled detach that preserves verbatim source and emits per-function `DetachEntryReport` with `outcome ∈ {'restored', 'in_use', 'not_attached', 'verify_fail'}`. `markEnter`/`markExit` track in-flight invocations so detach refuses to remove a wrapper while it's executing.

## Lex registry — at the engine

`src/lib/mana/lex.ts` — see chapter 10 for the math. Every wrapper calls `evaluate(lexKey, functionName, config.lexMode)`. The verdict drives the wrapper's behavior per its contract's `denySemantic`.

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
