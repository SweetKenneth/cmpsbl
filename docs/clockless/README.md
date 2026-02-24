# Clockless Documentation Library

Internal architecture reference for the CMPSBL Substrate.

## Documents

| # | Document | Description |
|---|----------|-------------|
| 01 | [Architecture](./01-ARCHITECTURE.html) | Full 10-entity + 5-mesh + 9-zone architecture overview, boot sequence, dependency graph |
| 02 | [CCR](./02-CCR.html) | Clockless Cognitive Reality — Layer 0 deep dive (4 zones) |
| 03 | [CCL](./03-CCL.html) | Clockless Cognitive Lucidity — Layer 1 deep dive (5 zones) |
| 04 | [Meshes](./04-MESHES.html) | DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE |
| 05 | [CORE](./05-CORE.html) | Standalone kernel reference |
| 06 | [Modules](./06-MODULES.html) | 9 public modules: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, INTEGRATION |

## Architecture Summary

```
CORE (Standalone Kernel)
  → CCR (Layer 0): SYSTEM + BRAIN + MEMORY + DREAM
  → CCL (Layer 1): RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT
  → 8 Matrix Nodes: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE
  → INTEGRATION (boots last)
  ← 5 Mesh Overlays: DEFENSE (outermost) → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE (innermost)
= 10 Public Entities + 5 Mesh Overlays + 9 Zones = 24 Execution Surfaces
```

© 2025–2026 PromptFluid®. All rights reserved.
