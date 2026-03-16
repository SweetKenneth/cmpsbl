# 06 — Mini Runtime™ Engine

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document describes the CMPSBL Mini Runtime™ Engine — the zero-dependency execution layer bundled with every capability export.

---

## 1. What Is the Mini Runtime?

The Mini Runtime™ Engine is a condensed, pure TypeScript in-memory runtime that reproduces the substrate capability contracts required by exported discoveries. It enables crystallized memories to execute independently, without connection to the full CMPSBL substrate.

Every exported capability pack includes a copy of the Mini Runtime.

---

## 2. Why It Exists

Exported capabilities reference substrate primitives: CJPI scoring, saga orchestration, state machines, and node interfaces. Without the Mini Runtime, these capabilities would require a live connection to the full substrate.

The Mini Runtime solves this by providing a lightweight reproduction of the required contracts. This means:

- **No network dependency** — Exported capabilities run offline
- **No substrate account required** — End users of exported capabilities do not need CMPSBL access
- **Deterministic execution** — The same inputs always produce the same outputs
- **Zero external dependencies** — The runtime has no npm packages or external requirements

---

## 3. What It Reproduces

The Mini Runtime reproduces the following substrate subsystems in a minimal, self-contained form:

| Subsystem | Description |
|---|---|
| **CJPI Scoring** | Quality scoring contracts for capability evaluation |
| **Saga Orchestration** | Multi-step transaction coordination with rollback |
| **Finite State Machines** | State transition management for capability workflows |
| **Node Interfaces** | Typed contracts matching the substrate's node capability signatures |
| **Telemetry Stubs** | Non-operational telemetry interfaces for API compatibility |

---

## 4. What It Does Not Include

The Mini Runtime is deliberately minimal. It does not reproduce:

- Full substrate routing (intent mesh)
- Persistent memory or vector search
- Mesh communications
- Governance enforcement
- Discovery or crystallization logic
- Real-time telemetry

These systems are part of the full substrate and are not needed for standalone capability execution.

---

## 5. Technical Characteristics

| Property | Value |
|---|---|
| Language | Pure TypeScript |
| Dependencies | Zero |
| Execution | In-memory |
| Determinism | Fully deterministic |
| Footprint | < 50 KB (typical) |
| Compatibility | Any JS/TS runtime (Node.js, Deno, Bun, browser) |

---

## 6. Integration

The Mini Runtime is bundled inside the exported ZIP. No separate installation is required.

```
capability-export/
├── src/
│   ├── capability.ts        # The exported capability
│   └── mini-runtime/        # Bundled Mini Runtime
│       ├── index.ts
│       ├── cjpi.ts
│       ├── saga.ts
│       └── fsm.ts
├── tests/
├── README.md
├── LICENSE
├── manifest.json
└── build.config.ts
```

Capabilities import the Mini Runtime using relative paths:

```typescript
import { CjpiScorer, SagaRunner } from './mini-runtime';
```

---

## 7. Versioning

The Mini Runtime is versioned with the substrate. Each export records the Mini Runtime version in the manifest. The runtime API surface is stable within major versions.

---

## Related Documents

- [Capability Export System](05-capability-export-system.md)
- [Crystallized Memories](19-crystallized-memories.md)
- [Architecture Overview](07-architecture-overview.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
