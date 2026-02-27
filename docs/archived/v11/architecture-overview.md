# Architecture Overview — SPARTA Epoch (v11.5)

## Field-Based Topology

CMPSBL operates as a **layered cognitive kernel** organized into a field-based topology — replacing the legacy flat layer model with a Spine / Grid / Field / Plane / Shell structure.

### Topology Diagram

```
                 ┌───────────────────────────────────┐
                 │            DEFENSE SHELL          │
                 │                                   │
                 │   ┌───────────────────────────┐   │
                 │   │        OVERLAY PLANE      │   │
                 │   │  (Governance / Supervision)│   │
                 │   └───────────────────────────┘   │
                 │                                   │
                 │   ╔═══════════════════════════╗   │
                 │   ║   EVOLUTION / IMMUNITY    ║   │
                 │   ║        MESH FIELD         ║   │
                 │   ║                           ║   │
                 │   ║        CORE               ║   │
                 │   ║          │                ║   │
                 │   ║        SYSTEM             ║   │
                 │   ║          │                ║   │
                 │   ║  CLM ─── CCR ─── AUTOBLOG║   │
                 │   ║    │        │             ║   │
                 │   ║ MINDS       │ ─── OCG     ║   │
                 │   ║    │        │             ║   │
                 │   ║ RESOLVERS  MODULES        ║   │
                 │   ║                           ║   │
                 │   ╚═══════════════════════════╝   │
                 │                                   │
                 └───────────────────────────────────┘
```

### Topology Taxonomy

| Topology | Entity | Role |
|----------|--------|------|
| **Shell** | DEFENSE | Outer containment boundary — encloses entire substrate |
| **Plane** | GOVERNANCE | Supervisory blanket under the Shell |
| **Fields** | EVOLUTION, IMMUNITY, INTENT | System-wide transformation fabric — permeate the spine |
| **Spine** | CORE → SYSTEM → CCR → MODULES → RESOLVERS | Vertical deterministic flow |
| **Grid** | OCG (Operational Compliance Grid) | Boundary enforcement — right-side tap off spine |
| **Branch** | CLM | Lateral intelligence — left-side branch off spine |

### Vertical Spine (Boot Sequence)

```
CORE (Standalone Kernel)
  → SYSTEM (Standalone Layer — lifecycle, config, diagnostics)
  → CCR (Layer 0): BRAIN + MEMORY + DREAM
  → OCG (Grid): RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT
  → 8 Matrix Nodes: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE
  → INTEGRATION (boots last — dependency resolver)
  ← Fields permeate: EVOLUTION + IMMUNITY + INTENT
  ← Plane: GOVERNANCE (supervisory blanket)
  ← Shell: DEFENSE (outer containment)
```

### Key Changes from v11.1

- **SYSTEM extracted from CCR** — now a standalone layer between CORE and CCR
- **CCL renamed to OCG** (Operational Compliance Grid) — classified as a Grid
- **DEFENSE** elevated to Shell (outer containment boundary)
- **GOVERNANCE** reclassified as Overlay Plane (supervisory blanket)
- **EVOLUTION, IMMUNITY, INTENT** reclassified as Fields (system-wide transformation fabric)
- **CLM** repositioned as lateral Intelligence Branch

### Health Model

Health uses a **weighted topology aggregation**:

| Topology | Weight | Components |
|----------|--------|------------|
| CORE | 20% | Kernel availability |
| SYSTEM | 5% | Lifecycle management |
| CCR | 15% | BRAIN, MEMORY, DREAM |
| OCG | 20% | RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT |
| Execution | 25% | 9 public modules |
| Fields | 9% | EVOLUTION, IMMUNITY, INTENT |
| Plane | 3% | GOVERNANCE |
| Shell | 3% | DEFENSE |

Fields, Plane, and Shell are cross-cutting — they permeate the spine rather than sit as stacked layers.

---

© 2025–2026 PromptFluid®. All rights reserved.
