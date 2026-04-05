# 04 — Artifact Format

**Classification:** Open — Zenodo Archive

---

## 1. Single-File Sealed Artifact

Every Convex Core™ export produces a **single-file sealed artifact** — a self-contained code file with embedded processing layer, dispatch matrices, and primitive effects. The artifact has zero external dependencies and functions in any environment that supports its target language.

### Structure

```
┌─────────────────────────────────────────────┐
│ § Sealed Orchestration Matrix               │
│   Dispatch table (DT)                       │
│   Collision matrix (CM)                     │
│   Initialization vector (IV)                │
│   Epoch threshold (EP)                      │
│   Resolution function (_R)                  │
│   Gate function (_G)                        │
│   Verification function (_V)               │
├─────────────────────────────────────────────┤
│ § Processing Pipeline                       │
│   5-layer execution summary                 │
│   Bound primitive chain                     │
├─────────────────────────────────────────────┤
│ § Source Code                               │
│   Original code with embedded effects       │
│   Inline guards, annotations, interceptions │
├─────────────────────────────────────────────┤
│ § Integrity Footer                          │
│   Artifact fingerprint                      │
│   Chain hash                                │
│   CJPI score and tier                       │
│   Certification timestamp                   │
└─────────────────────────────────────────────┘
```

---

## 2. Portability Guarantee

If CMPSBL® ceased to exist, every sealed artifact would continue to function. The Convex Core™ processing layer is compiled into the artifact — it is not a reference to a cloud service, an API endpoint, or a package registry.

This is the portability guarantee: **the export is a self-contained software product**.

### Network Modes

The embedded processing layer is network-aware but network-independent:

| Mode | Description |
|------|-------------|
| **Standalone** | Full execution without network access |
| **Connected** | Optional telemetry reporting to CMPSBL® infrastructure |
| **Hybrid** | Standalone with periodic sync when connectivity is available |

The default mode is **Standalone**. Connected features (telemetry, CLM sync, discovery stream) are opt-in and degrade gracefully when unavailable.

---

## 3. Language Support

Convex Core™ generates sealed artifacts in 25 target languages:

| Category | Languages |
|----------|-----------|
| **Software** | TypeScript, JavaScript, Python, Rust, Go, Java, C#, Swift, Kotlin, Dart, Ruby, PHP, Scala, Elixir, Perl, R, Julia |
| **HDL** | VHDL, Verilog, SystemVerilog |
| **GPU** | CUDA, OpenCL |
| **Systems** | C, C++ |
| **Functional** | Haskell |

Each language receives a native implementation of the dispatch matrix and resolution function, using language-appropriate syntax, types, and conventions. The mathematical operations are identical across all targets.

---

## 4. Bundle Format

Sealed artifacts are delivered in a ZIP bundle:

```
cmpsbl-{artifact-name}-{tier}.zip
├── src/{artifact}.{ext}          # Sealed single-file artifact
├── _runtime/
│   ├── convex-core.{ext}         # Processing layer (black-boxed)
│   ├── chain-executor.{ext}      # Portable chain executor
│   └── discovery-engine.{ext}    # Sealed discovery engine
├── manifest.json                 # CMPSBL® software manifest
├── REPORT.html                   # Certification report
├── USER-GUIDE.html               # Universal deployment guide
├── test/                         # Auto-generated test harness
├── docs/                         # Integration documentation
├── LICENSE                       # Proprietary license
└── README.md                     # Quick-start guide
```

---

## 5. Manifest Schema

```json
{
  "name": "artifact-name",
  "version": "1.0.0",
  "tier": "MYTHIC",
  "cjpi": 94,
  "processing_layer": "convex-core-3.0.0",
  "primitives": ["DEFENSE", "GOVERNANCE", "BRAIN", ...],
  "dispatch_matrix": {
    "dt_length": 15,
    "cm_dimensions": "15x4",
    "integrity_hash": "a3f2c1"
  },
  "fingerprint": "cmpsbl-xxxxxxxxxxxx",
  "certified_at": "2026-04-05T00:00:00Z",
  "targets": ["typescript"],
  "portable": true
}
```

---

© 2025–2026 CMPSBL®. All rights reserved.
