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
- Result payloads (`runtime_mode` field)

---

## 5. Export Mode Matrix

| Export Type | TypeScript | Other Languages |
|---|---|---|
| **Portable** | Includes real canonical Mini Runtime | Bridge adapter + metadata |
| **Sealed** | Sealed (obfuscated) canonical runtime | Bridge adapter + metadata |
| **Product ZIP** | Sealed canonical runtime | Bridge adapter + metadata |

---

## 6. Anti-Drift Rules

Enforced by architecture tests in `src/lib/export/__tests__/anti-drift.test.ts`:

1. No runtime logic duplication across language generators
2. No duplicated CJPI weights/thresholds outside canonical TS runtime
3. No duplicated saga/graph/FSM logic outside canonical TS runtime
4. Language generators may only mirror the **public contract**, not reimplement core intelligence
5. All generated bridges must identify themselves with `bridge_type` metadata

---

## 7. Compatibility

Existing capability packs remain compatible:
- Bridge adapters accept the same manifest/meta shape
- Chain arrays are preserved
- `executePipeline`-style responses are normalized to the canonical result format
- Old bridge outputs are accepted and wrapped

---

## Related Documents

- [Mini Runtime™ Engine](06-mini-runtime.md)
- [Capability Export System](05-capability-export-system.md)
- [Architecture Overview](07-architecture-overview.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
