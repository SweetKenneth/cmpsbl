# 04 — Substrate Creation Engine (Ascension)

**Classification:** 🔒 GOVERNOR EYES ONLY  
**Patent:** U.S. Patent Application No. 64/029,678

---

## What Ascension Actually Is

Ascension is the **Substrate Creation Engine** — a deterministic, zero-external-AI process that takes developer source code, collides it against the 40-primitive matrix, discovers emergent capability chains, scores them via CJPI, and exports hardened artifacts.

**Zero external AI calls** — confirmed. The entire pipeline is algorithmic. DREAM synthesis, signal detection, capability matching, chain discovery — all pure code.

---

## The Real Pipeline

### Phase 1: Intake & Classification

```
Developer uploads source code
  → Language detection (file extension + AST analysis)
  → Structure analysis (imports, exports, functions, classes)
  → Dependency graph construction
  → Security surface scan (known vulnerability patterns)
  → Complexity metrics (cyclomatic, cognitive, Halstead)
```

**Output:** A structured representation of the source code's topology.

### Phase 2: Primitive Registration

```
40 primitives register their handlers:
  Each primitive exposes resolver functions
  Each resolver has:
    - Input contract (what signals it responds to)
    - Output contract (what it produces)
    - Confidence threshold (minimum confidence to fire)
    - Fallback behavior (what happens if it fails)
```

### Phase 3: Signal Detection (TRADE SECRET)

This is the core IP. The system analyzes the source code and generates **signals** — patterns, risks, opportunities, structural characteristics. Each signal maps to one or more primitives.

```
Source code → Signal Detection Engine → Signal Set
  Example signals:
    - "unvalidated_input" → triggers DEFENSE, SANDBOX
    - "recursive_structure" → triggers BRAIN, CORTEX
    - "external_api_call" → triggers NEXUS, RELAY, IMMUNITY
    - "state_mutation" → triggers MEMORY, AUDIT, GOVERNANCE
    - "cryptographic_operation" → triggers IDENTITY, ACCESS
```

**What's hidden:** The signal detection patterns — what the system actually looks for in code — are the primary trade secret. The primitive names are public. The signals are not.

### Phase 4: Collision Pass

```
For each signal in the signal set:
  For each of the 40 primitives:
    Calculate affinity score:
      base_affinity = primitive.resolver_match(signal)
      context_bonus = cross_signal_correlation(signal, other_signals)
      confidence = base_affinity × context_bonus

    If confidence ≥ primitive.threshold:
      Record collision: (signal, primitive, confidence)
```

In ULTIMATE mode: 120-candidate pool (40 spine + 80 vertical expansion primitives).

**Collision scoring uses FNV-1a seeded PRNG** for deterministic but non-obvious ordering. Same input always produces same collision set.

### Phase 5: Chain Discovery

```
Collisions are grouped into chains:
  A chain = a sequence of primitives that fire on related signals

Chain discovery algorithm:
  1. Seed: Start with highest-confidence collision
  2. Walk: Follow signal dependencies to find related collisions
  3. Score: Each chain gets a compound CJPI score
  4. Prune: Chains below CJPI 68 are discarded
  5. Rank: Remaining chains ordered by compound score
```

### Phase 6: CJPI Scoring

```
CJPI = (
  Novelty      × 0.30 +    // How unique is this chain?
  Utility      × 0.30 +    // How useful is the capability?
  Complexity   × 0.20 +    // How sophisticated is the interaction?
  Composability × 0.20     // Can this chain be combined with others?
)

Tier classification:
  96-100  → Apex
  90-95   → Mythic
  80-89   → Relic
  68-79   → Prime
  50-67   → Mint
  0-49    → Raw (discarded)
```

### Phase 7: Hardening (Dual-Layer Architecture)

```
Layer 1: Original source code (UNTOUCHED)
Layer 2: Convex Core™ Sealed Artifact (GENERATED)
  Contains:
    - Circuit breakers for each discovered primitive
    - DEFENSE gates at function boundaries
    - GOVERNANCE hooks on state mutations
    - BEACON health signals
    - Telemetry compression (~85% reduction)
    - Integrity verification (FNV-1a hash)
```

**Key principle:** The developer's source code is never modified. Layer 2 wraps it.

### Phase 8: Export

```
Final artifact package:
  ├── {source-file}.{ext}           ← Original code
  ├── _runtime/
  │   ├── convex-core.{ext}         ← Sealed artifact (black-boxed)
  │   ├── chain-executor.{ext}      ← Chain orchestrator
  │   └── discovery-engine.{ext}    ← Discovery logic
  ├── REPORT.html                   ← Premium HTML report
  ├── USER-GUIDE.html               ← Universal user guide
  ├── cmpsbl-manifest.json          ← Machine-readable metadata
  └── test/                         ← Test harness
```

---

## What Makes This Patentable

1. **Dual-Layer Architecture** — Code hardening without source modification
2. **Deterministic Primitive Collision** — Reproducible results from algorithmic analysis
3. **Zero-AI Discovery** — No external AI calls in the entire pipeline
4. **Signal-to-Primitive Mapping** — The resolver/handler pattern for capability discovery
5. **Self-Verifying Artifacts** — FNV-1a integrity chain from boot to export

---

## What the Public Sees vs. Reality

| Public (Convex Core™ Docs) | Reality |
|---------------------------|---------|
| "Pre-compiled dispatch matrices" | FNV-1a hash arrays generated at init |
| "Geometric convergence on convex hull" | Deterministic hash function with no collisions |
| "5-layer parallel processing" | 12-stage sequential pipeline |
| "~8ms matrix lookup" | Facade speed. Real chain: ~120ms |
| "Initialization-time matrix compilation" | Hashes computed once, but execution is still runtime |

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
