# Boot Sequence & Dependency Graph — CMPSBL v11.1

## Classification: Technical Reference

---

## Overview

The CMPSBL substrate follows a **strict deterministic boot sequence** that ensures dependency safety across all 24 Matrix Nodes. No entity boots until all of its upstream dependencies are verified healthy.

---

## Boot Order

```
Phase 1: KERNEL
  └── CORE (standalone — no upstream dependencies)

Phase 2: CCR (Layer 0 — Cognitive Reality)
  ├── SYSTEM  (depends: CORE)
  ├── BRAIN   (depends: CORE, SYSTEM)
  ├── MEMORY  (depends: CORE, SYSTEM)
  └── DREAM   (depends: CORE, SYSTEM, BRAIN, MEMORY)

Phase 3: CCL (Layer 1 — Cognitive Lucidity)
  ├── RIPPLE   (depends: CORE, SYSTEM)
  ├── ACCESS   (depends: CORE, SYSTEM, RIPPLE)
  ├── IDENTITY (depends: CORE, SYSTEM, RIPPLE)
  ├── RELAY    (depends: CORE, SYSTEM, RIPPLE)
  └── AUDIT    (depends: CORE, SYSTEM, RIPPLE)

Phase 4: EXECUTION (8 public modules)
  ├── DECODE    (depends: CORE, RIPPLE)
  ├── ENCODE    (depends: CORE, RIPPLE, BRAIN)
  ├── VISION    (depends: CORE, RIPPLE, AUDIT)
  ├── CORTEX    (depends: CORE, RIPPLE, all execution surfaces)
  ├── NEXUS     (depends: CORE, RIPPLE, ACCESS)
  ├── ECONOMY   (depends: CORE, RIPPLE)
  ├── SANDBOX   (depends: CORE, RIPPLE)
  └── INCLUSIVE (depends: CORE, RIPPLE)

Phase 5: INTEGRATION (standalone wrapper — boots last in execution)
  └── INTEGRATION (depends: all Phase 4 modules)

Phase 6: OVERLAYS (wraps all layers — boot outermost first)
  ├── DEFENSE    (depends: CORE, RIPPLE, IDENTITY)
  ├── IMMUNITY   (depends: DEFENSE, RIPPLE)
  ├── EVOLUTION  (depends: IMMUNITY, BRAIN, MEMORY)
  ├── INTENT     (depends: EVOLUTION, RIPPLE)
  └── GOVERNANCE (depends: INTENT, AUDIT, IDENTITY)
```

---

## Dependency Graph

```
                    ┌──────────┐
                    │   CORE   │
                    └────┬─────┘
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │ SYSTEM │ │ RIPPLE │ │  ...   │
         └───┬────┘ └───┬────┘ └────────┘
     ┌───────┼──────────┼───────────┐
     ▼       ▼          ▼           ▼
  ┌──────┐┌──────┐ ┌────────┐ ┌────────┐
  │BRAIN ││MEMORY│ │ ACCESS │ │IDENTITY│
  └──┬───┘└──┬───┘ └───┬────┘ └───┬────┘
     ▼       ▼         ▼          ▼
  ┌──────┐   │    ┌────────┐ ┌────────┐
  │DREAM │   │    │ NEXUS  │ │DEFENSE │
  └──────┘   │    └────────┘ └───┬────┘
             ▼                   ▼
      ┌────────────┐      ┌──────────┐
      │ EVOLUTION  │◄─────│ IMMUNITY │
      └─────┬──────┘      └──────────┘
            ▼
      ┌──────────┐
      │  INTENT  │
      └─────┬────┘
            ▼
      ┌────────────┐
      │ GOVERNANCE │
      └────────────┘
```

---

## Health Gating

Each phase waits for the previous phase to reach **STABLE** before proceeding:

| Phase | Gate Condition | Timeout |
|-------|---------------|---------|
| Phase 1 → 2 | CORE health ≥ 80% | 10s |
| Phase 2 → 3 | CCR aggregate ≥ 60% | 15s |
| Phase 3 → 4 | CCL aggregate ≥ 60% | 15s |
| Phase 4 → 5 | All 8 modules ≥ 50% | 20s |
| Phase 5 → 6 | INTEGRATION healthy | 10s |

**On timeout**: Boot continues in degraded mode with affected nodes' breakers set to `half-open`.

---

## Shutdown Sequence

Shutdown is the **reverse** of boot:

```
Phase 6 (Overlays) → graceful drain (5s)
Phase 5 (INTEGRATION) → unbind all cross-surface links
Phase 4 (Execution) → drain in-flight operations (10s)
Phase 3 (CCL) → flush event buffers, close audit chain
Phase 2 (CCR) → persist memory, finalize dream pool
Phase 1 (CORE) → final health snapshot, shutdown
```

### Shutdown Guarantees

- All in-flight operations complete or timeout before entity shutdown
- Memory tier contents are persisted to durable storage
- Audit hash chain is properly terminated
- Final GOAL snapshot captured for post-mortem

---

## Circular Dependency Prevention

The boot graph is a **directed acyclic graph (DAG)** enforced by:

1. **Compile-time validation**: Dependency declarations checked for cycles
2. **Runtime enforcement**: Boot phases are strictly sequential
3. **INTEGRATION exception**: Boots last precisely because it depends on all modules

No entity may depend on an entity in a later boot phase.

---

## Cold Start Performance

| Phase | Target Duration | Entities |
|-------|----------------|----------|
| Phase 1 | < 100ms | 1 |
| Phase 2 | < 500ms | 4 |
| Phase 3 | < 500ms | 5 |
| Phase 4 | < 1s | 8 |
| Phase 5 | < 200ms | 1 |
| Phase 6 | < 500ms | 5 |
| **Total** | **< 3s** | **24** |

---

*Technical Reference — CMPSBL v11.1 — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
