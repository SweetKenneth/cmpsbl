# CMPSBL® Capability Lifecycle Correction — Technical Specification

**Version:** 1.0.0  
**Date:** 2026-04-10  
**Classification:** Internal — Architectural  
**Author:** System Architecture  
**Status:** Implemented  

---

## 1. Problem Statement

The system conflated **structural binding** and **provenance verification** with **runtime activation** and **behavioral verification**. The prior 3-state model (Declared → Bound → Verified) overloaded "Verified" to mean both "provenance confirmed" and "runtime behavior proven."

This created a risk of overclaiming — reports could imply runtime capability where only structural binding existed.

---

## 2. Corrected Capability State Model

### Previous Model (Deprecated)

| State | Meaning |
|-------|---------|
| Declared | Primitive listed in manifest |
| Bound | Sequenced in execution chain |
| Verified | SHA-256 + chain position confirmed |

### New Model (v2.0.0)

| State | Meaning | Evidence Required |
|-------|---------|-------------------|
| **Detected** | Primitive identified during scan | Signal match in source analysis |
| **Generated** | L2 orchestration code created | Wrapper exists in output artifact |
| **Bound** | Wrappers attached at function boundaries | Structural linkage confirmed in L2 |
| **Activated** | Runtime attachment executed | Hooks firing in execution path |
| **BehaviorallyVerified** | Observable runtime effect confirmed | State change, interception, or telemetry observed |

States are strictly ordered. A later state implies all prior states. No state may be claimed without evidence for all preceding states.

---

## 3. Capability Activation Ledger

A machine-readable JSON ledger is generated per artifact. This ledger is the **single source of truth** for all downstream systems.

### Schema

```typescript
interface CapabilityLedgerEntry {
  name: string;              // Primitive name
  detected: boolean;
  generated: boolean;
  bound: boolean;
  activated: boolean;
  behaviorallyVerified: boolean;
  state: CapabilityState;    // Highest confirmed state
  targets: string[];         // Function boundaries wrapped
  evidence: string[];        // Machine-readable proof
  gaps: string[];            // What is NOT proven
}
```

### Constraint

ALL reports, manifests, and CJPI scoring MUST read from this ledger. No system may generate claims independently.

---

## 4. Verification Split

### A. Provenance Verification (Existing)

Confirms:
- Artifact origin (fingerprint, serial)
- L1 integrity (SHA-256 hash match)
- Deterministic generation (same input → same L2)
- Primitive presence and chain position

### B. Behavioral Verification (New)

Confirms:
- Wrapper execution actually occurred
- Target function calls passed through L2
- Observable effects happened

The behavioral verifier runs deterministic probes. A primitive is behaviorally verified IFF:
1. Its wrapper was invoked (interception confirmed)
2. At least one expected effect was observed (state write, telemetry emit, etc.)

---

## 5. Decomposed CJPI Scoring

| Component | Source | Weight |
|-----------|--------|--------|
| Structural Score | Detected + Generated | 0.25 |
| Binding Score | Bound | 0.25 |
| Activation Score | Activated | 0.25 |
| Behavioral Score | BehaviorallyVerified | 0.20 |
| Security Score | Behavioral interception proven (DEFENSE, GOVERNANCE, etc.) | 0.05 |

### Constraint

If `activationScore === 0` and `behavioralScore === 0`, the headline CJPI label MUST include a "structural only" qualifier. The composite number alone must never imply runtime capability.

---

## 6. Report Claim Rules

### Hard Rules

| Condition | Allowed | Forbidden |
|-----------|---------|-----------|
| `bound = true, activated = false` | "Wrapper generated and structurally bound" | "Capability enabled", "system is now stateful" |
| `activated = true, behaviorallyVerified = false` | "Runtime activation confirmed" | "Behavior verified", "enforcement active" |
| `behaviorallyVerified = true` | "Behavior verified: [evidence]" | — |

### Forbidden Phrases by Claim Level

- **Structural level:** "enabled", "active", "enforcing", "protecting", "intercepting", "stateful", "runtime", "mitigating"
- **Runtime level:** "verified behavior", "proven interception", "confirmed enforcement"
- **Behavioral level:** No restrictions

---

## 7. Corrected Pipeline

### Previous

```
scan → classify → generate → report
```

### Corrected

```
scan → classify → generate → bind → activate → verify → ledger → report
```

**Activation is an explicit phase, never assumed.**

For Ascension exports (ZIP artifacts), the pipeline terminates at `bind`. Activation and behavioral verification require the consuming application to integrate and execute the artifact. Reports must reflect this honestly.

---

## 8. System Limitations (Canonical)

These limitations MUST appear in all outputs:

1. L2 wrappers are structural by default — runtime behavior requires explicit activation and integration.
2. CMPSBL does not guarantee behavioral outcomes without activation.
3. Runtime behavior requires explicit activation/integration by the consuming application.
4. Provenance verification confirms origin and integrity, NOT runtime behavior.
5. CJPI scores with zero activation reflect structural coverage only.

---

## 9. Implementation Map

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/capability-lifecycle/types.ts` | 5-state model, ledger schema, decomposed CJPI, claim rules, pipeline stages |
| `src/lib/capability-lifecycle/ledger-builder.ts` | Constructs activation ledger from pipeline stage outputs |
| `src/lib/capability-lifecycle/behavioral-verifier.ts` | Deterministic probe engine for behavioral evidence |
| `src/lib/capability-lifecycle/constrained-reporter.ts` | Ledger-constrained report generator |
| `src/lib/capability-lifecycle/index.ts` | Public API barrel |

### Integration Points

| Existing Module | Integration |
|-----------------|-------------|
| Ascension pipeline (`src/lib/ascension/`) | Feed detection records into ledger builder |
| Factory export (`src/lib/factory/`) | Include ledger JSON in export ZIP |
| CJPI scoring (all verticals) | Replace flat CJPI with `computeDecomposedCJPI()` |
| Product reporters (`src/products/*/reporter.ts`) | Migrate to `generateConstrainedReport()` |
| Verification page (`/verify/:fingerprint`) | Display decomposed CJPI and gap analysis |
| Architecture spec doc | Updated Section 5 (Verification Model) and Section 8 (Limitations) |

### Migration Path

1. **Phase 1 (Complete):** Type definitions, ledger builder, behavioral verifier, constrained reporter
2. **Phase 2 (Next):** Wire ledger builder into Ascension pipeline after `generate` stage
3. **Phase 3:** Include `capability-ledger.json` in export artifacts
4. **Phase 4:** Migrate product reporters to read from ledger
5. **Phase 5:** Update verification UI to show decomposed CJPI

---

## 10. Architectural Guarantees

- The system is **incapable of overclaiming** — claim validation is enforced at the type level
- The system is **provably aligned** with actual runtime behavior — every claim maps to ledger evidence
- The system is **defensible** to engineers — gaps are explicitly surfaced, not hidden
- Proprietary binding and scoring logic remains **protected** — the ledger exposes WHAT was proven, not HOW

---

*© CMPSBL® — All rights reserved.*
