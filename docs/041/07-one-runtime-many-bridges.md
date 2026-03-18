# 07 — One Runtime, Many Bridges

**Version:** Documentation Epoch 041  
**Classification:** Internal Architecture  
**Last Updated:** 2026-03-18

---

## Purpose

This document explains the canonical runtime architecture: why CMPSBL has exactly one Mini Runtime (TypeScript) and why all other language exports are bridge adapters, not independent runtimes.

---

## 1. The Problem: Multi-Runtime Drift

Previously, every language export (Rust, Java, PHP, Python, Go, C#, Ruby, Swift, Kotlin, Elixir, Lua, C, C++, Dart, Zig, Scala, Haskell) contained a **full reimplementation** of:

- CJPI scoring weights and thresholds
- Tier assignment logic
- Pipeline composition and validation
- Saga orchestration with compensating transactions
- Dependency graph traversal
- State machine internals
- Module effect resolution

This created **25 copies** of core runtime intelligence, each with potential for divergence. Any change to CJPI weights, tier thresholds, or orchestration logic required updating all 25 implementations simultaneously — an impossible maintenance burden.

---

## 2. The Solution: One Runtime, Many Bridges

### Canonical Runtime (TypeScript)

The **single source of truth** is `src/lib/export/standalone-runtime.ts`. It owns:

| Concern | Location |
|---|---|
| CJPI scoring engine | §2 — standalone-runtime.ts |
| Auto-tiering thresholds | §3 — standalone-runtime.ts |
| Dependency graph | §6 — standalone-runtime.ts |
| Pipeline composer | §7 — standalone-runtime.ts |
| Saga orchestrator | §8 — standalone-runtime.ts |
| Finite state machine | §5 — standalone-runtime.ts |
| Synergy multiplier | §9 — standalone-runtime.ts |
| Chain executor | chain-executor.ts |
| Module effects | module-effects.ts |
| Primitive executor bridge | primitive-executor-bridge.ts |

### Bridge Adapters (All Other Languages)

Every non-TypeScript export is a **thin bridge adapter** that:

1. **Embeds capability metadata** (name, module chain, CJPI score, tier)
2. **Routes execution** to the canonical runtime when available (network/hybrid mode)
3. **Falls back** to deterministic local output when offline
4. **Preserves** the trace, output, and metadata contract shape
5. **Includes integrity payload** on every outbound request
6. **Tracks health** and switches modes automatically
7. **Marks degraded execution** explicitly, never silently

Bridge adapters **do NOT contain**:
- CJPI weight allocations
- Tier threshold values
- Saga orchestration logic
- Dependency graph internals
- Pipeline composition/validation
- Module effect resolution
- Finite state machine internals

---

## 3. Bridge Classifications

| Type | Description | Example Languages |
|---|---|---|
| **network** | Full canonical runtime available | TypeScript (native) |
| **hybrid** | Remote-first, local fallback | Java, C#, Ruby, PHP, Python, Go, Swift, Kotlin, Elixir, Dart, Scala, Rust, C++, Lua |
| **offline-fallback** | Deterministic local only | C, Zig, Haskell, HDL targets |

---

## 4. Execution Modes

All bridges operate in one of three modes:

```
network mode  = canonical runtime remote/central (5+ consecutive successes)
hybrid mode   = try canonical runtime first, then fallback (default when endpoint configured)
offline mode  = deterministic local fallback only (no endpoint or 3+ consecutive failures)
```

Mode is **explicit** in:
- Bridge metadata (`bridge_type` field)
- Execution telemetry (`mode` field)
- Result payloads (`runtimeMode` field)
- Execution envelope (`modeBeforeExecution`, `modeAfterExecution`)

### Automatic Mode Switching

Bridges maintain a rolling **health score** (0–100) that governs automatic transitions:

| Transition | Trigger | Priority |
|---|---|---|
| hybrid → network | 5+ consecutive valid remote successes | Normal recovery |
| network → hybrid | Any single failure | Immediate demotion |
| hybrid → offline | 3+ consecutive failures | Threshold breach |
| offline → hybrid | 2+ consecutive successes after recovery | Gradual recovery |

**Validation failures count 2× more** than transport failures. An endpoint that responds but fails validation is worse than a temporary timeout.

Mode transitions are **recorded and inspectable** via `getHealthSnapshot().modeTransitions`.

---

## 5. Execution Integrity Contract

### Outbound Payload (Bridge → Canonical Runtime)

Every bridge request includes:

| Field | Purpose |
|---|---|
| `canonicalVersion` | Version compatibility check |
| `bridgeType` | Bridge classification |
| `runtimeType` | Deployment context (substrate/portable/sealed) |
| `executionMode` | Current bridge mode |
| `capabilityHash` | Stable hash of (name + chain + category) |
| `moduleChainHash` | Independent chain tamper detection |
| `expectedCJPI` | Score consistency verification |
| `manifestFingerprint` | Optional manifest identity |
| `generatedAt` | Optional generation timestamp |

### Canonical Runtime Validation

On every request, the canonical runtime:

1. Validates `canonicalVersion` compatibility (major mismatch = error, minor = warning)
2. Recomputes `capabilityHash` and compares
3. Recomputes `moduleChainHash` and compares independently
4. Validates `expectedCJPI` range
5. Checks required metadata fields
6. Records validation result before execution begins

### Response

Every response includes:

| Field | Purpose |
|---|---|
| `validated` | Whether all checks passed |
| `validationErrors` | Hard errors (empty = clean) |
| `validationWarnings` | Non-fatal warnings |
| `executionId` | Unique request identifier |
| `degraded` | Whether result is integrity-compromised |
| `degradedReasons` | Why (empty if not degraded) |

### Degraded Execution

If validation fails, the bridge MUST NOT silently fall back. Instead:

- Mark result as `degraded: true`
- Include `degradedReasons` with specific errors
- Include `trustLevel` ('none' | 'low' | 'medium')
- Classify fallback as `degraded` (vs `normal` or `offline`)
- Preserve trace for debugging

---

## 6. Runtime Health Scoring

Each bridge maintains lightweight rolling state:

| Metric | Purpose |
|---|---|
| `consecutiveSuccesses` / `consecutiveFailures` | Mode transition triggers |
| `totalRemoteAttempts` / `totalRemoteSuccesses` | Success rate |
| `totalFallbacks` | Fallback frequency |
| `totalValidationFailures` | Integrity failure rate (weighted 2×) |
| `averageRemoteLatencyMs` | Latency stability |
| `lastRemoteSuccessAt` / `lastRemoteFailureAt` | Recency bias |
| `lastValidationFailureAt` | Integrity recency |

### Health Score Formula (0–100)

| Component | Weight | Description |
|---|---|---|
| Remote success rate | 35% | Percentage of successful remote executions |
| Validation integrity | 25% | Penalized by validation failure rate × 2 |
| Latency stability | 15% | Linear scale: 200ms=100, 10s=0 |
| Fallback avoidance | 10% | Lower score with more fallbacks |
| Recency penalty | 15% | Recent failures within 30s/60s penalized heavily |

### Public Health APIs

```typescript
getRuntimeMode(): RuntimeMode
getHealthScore(): number
getHealthSnapshot(): RuntimeHealthSnapshot
getExecutionTelemetry(): ReadonlyArray<ModeTransitionRecord>
resetHealthState(): void
configureEndpoint(url: string | null): void
forceMode(mode: RuntimeMode | null): void  // test/debug only
```

---

## 7. Fallback Classification

| Type | Condition | Trust Level |
|---|---|---|
| **normal** | Remote unavailable, metadata trusted | Medium |
| **degraded** | Remote validation/integrity mismatch | Low / None |
| **offline** | Endpoint intentionally unset | Medium (deterministic) |

All three produce results in the same normalized shape but are distinguishable via `fallbackReason` in the execution envelope.

---

## 8. Export Mode Matrix

| Export Type | TypeScript | Other Languages |
|---|---|---|
| **Portable** | Includes real canonical Mini Runtime | Bridge adapter + integrity metadata |
| **Sealed** | Sealed (obfuscated) canonical runtime | Bridge adapter + integrity metadata |
| **Product ZIP** | Sealed canonical runtime | Bridge adapter + integrity metadata |

---

## 9. Anti-Drift Rules

Enforced by architecture tests in `src/lib/export/__tests__/anti-drift.test.ts`:

1. No runtime logic duplication across language generators
2. No duplicated CJPI weights/thresholds outside canonical TS runtime
3. No duplicated saga/graph/FSM logic outside canonical TS runtime
4. Language generators may only mirror the **public contract**, not reimplement core intelligence
5. All generated bridges must identify themselves with `bridge_type` metadata
6. All bridge manifests must include `integrityContract` with `capabilityHash` and `moduleChainHash`
7. Result shapes must include `validated`, `validationErrors`, `degraded`, `executionId`, and `envelope`
8. Health tracker exports `RuntimeHealthTracker`, `getHealthScore()`, `getHealthSnapshot()`
9. Capability hash and module chain hash are deterministic and independently verifiable
10. Legacy results without integrity fields are normalized with warnings, not rejected

---

## 10. Backward Compatibility

Existing capability packs remain compatible:
- Bridge adapters accept the same manifest/meta shape
- Chain arrays are preserved
- `executePipeline`-style responses are normalized to the canonical result format
- Old bridge outputs are accepted and wrapped via `normalizeLegacyResult()`
- Missing integrity fields in older packs are treated as warnings, not fatal errors

---

## Related Documents

- [Mini Runtime™ Engine](06-mini-runtime.md)
- [Capability Export System](05-capability-export-system.md)
- [Architecture Overview](07-architecture-overview.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
