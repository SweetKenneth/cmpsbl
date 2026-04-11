# 20 — Capability Lifecycle System: End-to-End Internal Reference

**Classification:** 🔒 GOVERNOR EYES ONLY  
**Version:** v2.1.0  
**Date:** April 11, 2026  
**Author:** Kenneth E. Sweet Jr. / Lov

---

## 1. Purpose

This document is Kenneth's personal reference for how the Capability Lifecycle system works from end to end — every module, every gate, every data flow. Nothing is hidden or simplified.

---

## 2. System Overview

The Capability Lifecycle is a **post-Ascension integrity pipeline** that ensures every claim CMPSBL makes about an artifact is provably backed by evidence. It sits between the Ascension export engine and all downstream consumers (reports, verification pages, CJPI scores, activation guides).

### Architecture

```
src/lib/capability-lifecycle/
├── types.ts                  — 5-state model, ledger schema, CJPI weights, claim rules
├── ledger-builder.ts         — Constructs the Capability Activation Ledger from pipeline data
├── behavioral-verifier.ts    — Deterministic probe engine for runtime evidence (specialized + generic)
├── generic-activation.ts     — Generic Primitive Activation Engine (auto-activation + generic probes)
├── constrained-reporter.ts   — Generates reports constrained to what the ledger can prove
├── activation-guide.ts       — Generates step-by-step activation instructions for developers
├── mana-bridge.ts            — Generates Mana-specific activation artifacts
├── export-bridge.ts          — Universal lifecycle injection for all export pipelines
└── index.ts                  — Public API barrel

packages/runtime/src/
└── generic-wrapper.ts        — Universal runtime wrapper (observe + emit, never alter L1)
```

---

## 3. The 5-State Lifecycle Model

Every primitive in every artifact exists in exactly one of these states. States are strictly ordered — a later state implies all prior states.

| # | State | Evidence Required | What It Proves |
|---|-------|-------------------|----------------|
| 1 | **Detected** | Signal match in source analysis | The scanner saw something relevant |
| 2 | **Generated** | L2 wrapper code exists in output | Code was produced, not just detected |
| 3 | **Bound** | Structural linkage confirmed at function boundaries | L2 is attached to L1 — not floating |
| 4 | **Activated** | Runtime hooks observed firing | Code is actually executing, not just present |
| 5 | **BehaviorallyVerified** | Observable state change, interception, or telemetry | The capability DOES something measurable |

### State Ordinal Map (from `types.ts`)

```typescript
CAPABILITY_STATE_ORDINAL = {
  Detected: 0,
  Generated: 1,
  Bound: 2,
  Activated: 3,
  BehaviorallyVerified: 4,
}
```

### Why This Matters

The old 3-state model (Declared → Bound → Verified) conflated structural binding with runtime behavior. "Verified" could mean either "SHA-256 checks out" or "the wrapper actually intercepted a function call." That ambiguity enabled overclaiming — reports could say "capability enabled" when all that existed was generated code that nobody had executed.

The 5-state model makes it structurally impossible to overclaim. The type system enforces it.

---

## 4. The Capability Activation Ledger

### What It Is

A machine-readable JSON structure generated per artifact. It is the **single source of truth** for all downstream systems. Nothing — reports, CJPI scores, verification pages — may generate claims independently of this ledger.

### Schema (from `types.ts`)

```typescript
interface CapabilityLedgerEntry {
  name: string;              // Primitive name
  state: CapabilityState;    // Highest confirmed state
  detected: boolean;
  generated: boolean;
  bound: boolean;
  activated: boolean;
  behaviorallyVerified: boolean;
  targets: string[];         // Function boundaries wrapped
  evidence: string[];        // Machine-readable proof strings
  gaps: string[];            // What is NOT proven — explicitly surfaced
}

interface CapabilityActivationLedger {
  entries: CapabilityLedgerEntry[];
  summary: LedgerSummary;
  generatedAt: string;
  artifactFingerprint: string;
}
```

### How It's Built (`ledger-builder.ts`)

The `buildLedger()` function takes four inputs from the Ascension pipeline:

1. **DetectionRecord[]** — From the scanner (which primitives were detected, with what confidence)
2. **GenerationRecord[]** — From the code generator (which L2 wrappers were produced)
3. **BindingRecord[]** — From the execution binder (which wrappers are structurally attached to L1 functions)
4. **ActivationRecord[]** — From runtime integration (which wrappers have actually fired)

It walks each primitive through the state ladder, computing the highest provable state and collecting evidence/gaps at each level.

---

## 5. Decomposed CJPI Scoring

CJPI is no longer a single opaque number. It's decomposed into 5 weighted components that directly map to lifecycle states:

| Component | Weight | Source |
|-----------|--------|--------|
| Structural | 0.25 | Detected + Generated |
| Binding | 0.25 | Bound |
| Activation | 0.25 | Activated |
| Behavioral | 0.20 | BehaviorallyVerified |
| Security | 0.05 | Behavioral interception proven for security primitives |

### Critical Rule

If `activationScore === 0` AND `behavioralScore === 0`, the CJPI label **must** include a "structural only" qualifier. The composite number alone must never imply runtime capability.

### Computation (`computeDecomposedCJPI()` in `types.ts`)

Takes a `CapabilityActivationLedger` and returns:

```typescript
interface DecomposedCJPI {
  structural: number;   // 0-1
  binding: number;      // 0-1
  activation: number;   // 0-1
  behavioral: number;   // 0-1
  security: number;     // 0-1
  composite: number;    // Weighted sum
  isStructuralOnly: boolean;
}
```

---

## 6. Behavioral Verification (`behavioral-verifier.ts`)

### What It Does

Runs deterministic probes against an artifact to confirm that L2 wrappers are actually producing observable effects — not just present in code.

### How It Works

1. Takes a list of `ProbableArtifact` entries (primitive name + wrapper reference + target functions)
2. For each artifact, constructs `BehavioralProbe` objects — deterministic test cases
3. Executes probes and captures `BehavioralEffect` results (state changes, interception events, telemetry emissions)
4. A primitive is **behaviorally verified** IFF:
   - Its wrapper was invoked (interception confirmed)
   - At least one expected effect was observed

### Probe Types (`BehavioralEffectKind`)

- `stateChange` — A mutable state was modified
- `interception` — A function call was intercepted by L2
- `telemetryEmit` — A telemetry/audit event was emitted
- `errorHandling` — An error was caught and handled by L2

### Two Entry Points

- `runBehavioralVerification()` — Full behavioral verification (requires runtime)
- `runStructuralOnlyProbes()` — Lightweight structural-only checks (no runtime needed)

---

## 7. Constrained Reporter (`constrained-reporter.ts`)

### The Problem It Solves

Before this system, reports could make whatever claims the template author wrote. There was no enforcement that claims matched evidence.

### How It Works

`generateConstrainedReport()` takes a `CapabilityActivationLedger` and generates a `ConstrainedReport` where:

- Every claim string is **validated** against the ledger state using `validateClaim()` from `types.ts`
- Forbidden phrases (like "enabled" or "enforcing" for structural-only capabilities) are rejected at the type level
- Gaps are explicitly surfaced — never hidden

### Claim Level Rules

| Ledger State | Allowed Claims | Forbidden |
|---|---|---|
| Bound, not Activated | "Wrapper generated and structurally bound" | "enabled", "active", "protecting" |
| Activated, not Verified | "Runtime activation confirmed" | "verified behavior", "proven interception" |
| BehaviorallyVerified | "Behavior verified: [evidence]" | — (no restrictions) |

---

## 8. Activation Guide (`activation-guide.ts`)

### What It Is

A standalone HTML document included in export artifacts that tells the developer exactly how to transition capabilities from "Generated/Bound" to "Activated."

### Three Activation Modes

| Mode | Description | Developer Effort |
|---|---|---|
| **Automatic** | No action required — hooks fire by default | None |
| **Assisted** | Minimal L1 hooks required | Copy-paste a few lines |
| **Manual** | Explicit architectural binding required | Integration work |

### What Each Entry Contains

- `primitiveName` — Which primitive
- `currentState` — Where it is now in the lifecycle
- `targetState` — Where it needs to get to
- `activationMode` — Automatic / Assisted / Manual
- `steps[]` — Ordered integration steps with code snippets, target files, and verification instructions
- `behaviorDelta` — Before vs. after behavior comparison
- `safetyNotes` — Rollback instructions and risk assessment

### HTML Rendering

`renderActivationGuideHtml()` produces a self-contained, light-theme HTML document with Inter/JetBrains Mono fonts, responsive layout, and professional branding.

---

## 9. Mana Bridge (`mana-bridge.ts`)

### What It Does

Generates Mana-specific activation artifacts — the bridge between the capability lifecycle and the Mana attachment engine (Patent App. No. 64/031,637).

`generateManaActivationArtifacts()` takes a ledger and produces artifacts that tell the Mana engine which capabilities need runtime attachment and what governance rules apply.

---

## 10. Export Bridge (`export-bridge.ts`)

### What It Does

The universal injection point for all export pipelines. Every export artifact (Ascension, Product, Scanner) gets lifecycle data injected through this bridge.

### Functions

| Function | Purpose |
|---|---|
| `buildAscensionLifecycleArtifacts()` | Full lifecycle artifacts for Ascension exports |
| `buildProductLifecycleArtifacts()` | Lifecycle data for product-level exports |
| `buildScannerDetectionRecords()` | Converts scanner results to lifecycle detection records |
| `buildReporterLifecycleSummary()` | Summary data for report generators |
| `generateVerificationScript()` | Produces the `RUN_VERIFICATION.ts` runtime script |

### The Verification Script — Full Integrity Chain

The generated `RUN_VERIFICATION.ts` enforces a 4-gate verification:

1. **Fingerprint binding** — `results.fingerprint` must match `ARTIFACT_FINGERPRINT`. If not → throw. This binds execution to identity.

2. **Fail-closed primitive coverage** — Every entry in `EXPECTED_PRIMITIVES` must have a corresponding probe result. Missing primitives → throw. This prevents silent omission attacks.

3. **Tamper detection** — Probes that appear but aren't in `EXPECTED_PRIMITIVES` are logged as warnings. This detects injected/rogue primitives without blocking execution.

4. **Probe delta context** — Logs expected count, observed count, and extra count for instant interpretability in logs and demos.

---

## 11. Data Flow — Complete Pipeline

```
[L1 Source Code]
       │
       ▼
   SCANNER (Ascension)
       │ DetectionRecord[]
       ▼
   CODE GENERATOR (Factory)
       │ GenerationRecord[]
       ▼
   EXECUTION BINDER
       │ BindingRecord[]
       ▼
   LEDGER BUILDER ──────────────────────────┐
       │ CapabilityActivationLedger         │
       ├──────────────────────┐             │
       ▼                     ▼             ▼
   CONSTRAINED          ACTIVATION     EXPORT BRIDGE
   REPORTER             GUIDE          (injects into ZIPs)
       │                     │             │
       ▼                     ▼             ▼
   [Reports with         [HTML guide    [RUN_VERIFICATION.ts
    claim validation]     for devs]      with 4-gate integrity]
                                           │
                                           ▼
                                      BEHAVIORAL VERIFIER
                                      (runtime, post-export)
                                           │
                                           ▼
                                      [BehaviorallyVerified
                                       or gaps surfaced]
```

---

## 12. Integration Points with Existing Substrate

| Existing System | How It Connects |
|---|---|
| **Ascension pipeline** (`src/lib/ascension/`) | Feeds DetectionRecord[] into ledger builder via `buildScannerDetectionRecords()` |
| **Factory export** (`src/lib/factory/`) | Calls `buildAscensionLifecycleArtifacts()` to inject ledger JSON into ZIP |
| **CJPI scoring** (all verticals) | Replaced flat CJPI with `computeDecomposedCJPI()` from ledger |
| **Product reporters** | Migrating to `generateConstrainedReport()` |
| **Verification page** (`/verify/:fingerprint`) | Will display decomposed CJPI and gap analysis from ledger |
| **Mana engine** | `generateManaActivationArtifacts()` bridges lifecycle → attachment |

---

## 13. Security Properties

1. **Overclaiming is structurally impossible** — `validateClaim()` enforces claim ↔ state mapping at the type level
2. **Silent omission is impossible** — Fail-closed verification rejects runs where expected primitives lack probes
3. **Injection is detectable** — Unexpected probes are logged as tamper signals
4. **Identity is bound** — Fingerprint verification ties execution to artifact identity
5. **Gaps are visible** — Every ledger entry explicitly lists what is NOT proven
6. **Proprietary logic remains protected** — The ledger exposes WHAT was proven, not HOW

---

## 14. Generic Primitive Activation Engine (v2.0.0)

Prior to this upgrade, primitives without hand-written activation logic terminated at "bound." The Generic Primitive Activation Engine removes this bottleneck.

### How It Works

1. **Generic Runtime Wrapper** (`packages/runtime/src/generic-wrapper.ts`):
   - Accepts `(primitiveName, targetFn)` → wraps with pre-call (interception) and post-call (telemetry) hooks
   - Emits `call_interception` and `telemetry_emit` effects
   - Safety: NEVER alters L1 behavior, NEVER blocks execution, only observes + emits

2. **Auto-Activation Pass** (`generic-activation.ts`):
   - Runs after bind stage for every bound primitive
   - Skips 12 specialized primitives (DEFENSE, GOVERNANCE, MEMORY, etc.)
   - All other bound primitives receive generic activation: `hooksFiring = true`, `executionPathConfirmed = true`

3. **Generic Behavioral Probe** (extended `behavioral-verifier.ts`):
   - If no `ProbeSpec` exists, runs a generic probe: confirm interception + at least one effect emitted
   - If both true → `behaviorallyVerified = true`

4. **Activation Guide Fallback** (updated `activation-guide.ts`):
   - Primitives not in `ACTIVATION_KNOWLEDGE` receive 3-step generic instructions:
     1. Import `@cmpsbl/runtime/generic-wrapper`
     2. Initialize wrapper on target function
     3. Run `RUN_VERIFICATION.ts`

### Result

| Before | After |
|---|---|
| 12 primitives could reach Activated | ALL primitives can reach Activated |
| Unknown primitives stuck at "bound" | Generic baseline for every primitive |
| Specialized overrides required | Specialized overrides still take priority |

---

## 15. Behavior Engine Layer (v1.0.0 — April 11, 2026)

The runtime Behavior Engine Layer provides 5 specialized engines that bridge the gap between structural activation and real-world runtime behavior:

| Engine | Primitive | Purpose | Key Mechanics |
|--------|-----------|---------|---------------|
| **Interception** | DEFENSE | Input enforcement + structured violations | Schema validation, violation audit trail, configurable strictness |
| **Execution** | FAILSAFE | Policy-driven retry + circuit breaker | Exponential backoff, half-open recovery, per-operation policies |
| **State** | MEMORY | Namespace-aware storage + TTL + snapshots | Bounded capacity, automatic eviction, snapshot/restore, event emissions |
| **Analysis** | BEACON | Rolling baseline + anomaly detection | Sliding window stats, configurable σ threshold (default 2.5), deviation scoring |
| **Orchestration** | CORTEX | Cross-engine signal routing | Deterministic rule matching, 4 signal types, 3 action types, priority-sorted |

### Cross-Engine Integration (Phase 1)

CORTEX routes signals between engines via deterministic rules:
- Analysis Engine → `anomaly_detected` → CORTEX (on deviation ≥ 2.5σ)
- Execution Engine → `execution_failed` / `execution_retried` → CORTEX
- State Engine → `state_written` → CORTEX (after every write)

Phase 1 is routing + proof only (no cross-engine mutation). Phase 2 will add dynamic adaptation.

---

## 16. Migration Status

| Phase | Status | Description |
|---|---|---|
| 1 — Type system + core modules | ✅ Complete | types, ledger-builder, behavioral-verifier, constrained-reporter |
| 2 — Activation guide + Mana bridge | ✅ Complete | activation-guide, mana-bridge |
| 3 — Export bridge + verification script | ✅ Complete | export-bridge with 4-gate verification |
| 4 — Generic Activation Engine | ✅ Complete | generic-activation, generic-wrapper, auto-activation in export-bridge |
| 5 — Behavior Engine Layer | ✅ Complete | 5 engines: Interception, Execution, State, Analysis, Orchestration |
| 6 — Wire into Ascension pipeline | 🔲 Next | Feed real pipeline data into ledger builder |
| 7 — Include ledger JSON in export ZIPs | 🔲 Pending | Add `capability-ledger.json` to artifact package |
| 8 — Migrate product reporters | 🔲 Pending | Replace ad-hoc report generation with constrained reporter |
| 9 — Update verification UI | 🔲 Pending | Show decomposed CJPI on `/verify/:fingerprint` |
| 10 — Export uniformity audit | 🔲 Pending | Ensure all scanners (Prime, Cyber, Ultimate, etc.) produce identical artifact structure |

---

*© 2025–2026 CMPSBL®. Governor Eyes Only.*
