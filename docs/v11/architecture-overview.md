# Architecture Overview — SPARTA Epoch (v11.1)

## The Layered Cognitive Kernel

CMPSBL operates as a **layered cognitive kernel** — a production-ready AI operating system that persists, heals, and evolves autonomously without human intervention.

### Entity Hierarchy

| Layer | Entities | Role |
|-------|----------|------|
| **CORE** | 1 kernel | Standalone boot authority; initializes all layers |
| **CCR Zones** | 4 zones (SYSTEM, BRAIN, MEMORY, DREAM) | Hidden meta-engine — reasoning, synthesis, persistence |
| **CCL Zones** | 5 zones (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT) | Infrastructure convergence — events, auth, integrity |
| **Matrix Nodes** | 9 modules (DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, INTEGRATION) | Public-facing cognitive capabilities |
| **Overlays** | 5 meshes (DEFENSE → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE) | Protective behavioral mesh hierarchy |

**Total: 10 public entities + 5 mesh overlays + 9 hidden zones = 24 Matrix Nodes**

### Boot Sequence

```
CORE (Standalone Kernel)
  → CCR (Layer 0): SYSTEM + BRAIN + MEMORY + DREAM
  → CCL (Layer 1): RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT
  → 8 Matrix Nodes: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE
  → INTEGRATION (boots last — dependency resolver)
  ← 5 Overlays wrap all layers: DEFENSE (outermost) → GOVERNANCE (innermost)
```

### Health Model

Health is calculated using a **5-layer weighted aggregation** (20% each):

- **CORE health** — kernel availability
- **CCR aggregate** — zone cluster health
- **CCL aggregate** — infrastructure zone health
- **Matrix Nodes** — public module health
- **Overlays** — mesh integrity

A degraded zone reduces only its own layer score. Circuit breakers isolate failures per-zone, preventing cascading degradation.

### Key Properties

- **Hot-swappable zones**: CCR/CCL zones can be independently cycled without system restart
- **Circuit breaker isolation**: Every zone has independent failure tracking
- **Autonomous evolution**: The EVOLUTION overlay continuously improves system behavior
- **Shadow training**: Executors practice on real system gaps in shadow mode
- **Integrity surface**: GOAL telemetry validates cross-zone consistency

---

© 2025–2026 PromptFluid®. All rights reserved.
