# Node Reference — Clockless Substrate

Overview of all 24 production nodes in the Clockless runtime.

## Topology

| Sector | Nodes | Weight | Purpose |
|--------|-------|--------|---------|
| **Core** | CORE | 20.0% | Kernel orchestration & boot authority |
| **System** | SYSTEM | 5.0% | Lifecycle management, configuration, diagnostics |
| **CCR** | BRAIN, MEMORY, DREAM | 15.0% | Cognition, storage, synthesis |
| **OCG** | RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT | 20.0% | Event bus, entitlements, auth, webhooks, ledger |
| **Execution** | DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, INTEGRATION | 25.0% | Specialized processing |
| **Fields** | EVOLUTION, IMMUNITY, INTENT | 9.0% | Transformation fabric |
| **Plane** | GOVERNANCE | 3.0% | Policy enforcement overlay |
| **Shell** | DEFENSE | 3.0% | Outer containment boundary |

## Integrity Equation

```
matrixIntegrity = Σ(node.health × node.weight)
where Σ(weight) = 1.0
```

## Node Index

| Node | Sector | Weight | Spec File |
|------|--------|--------|-----------|
| CORE | core | 0.200 | [core.md](./core.md) |
| SYSTEM | system | 0.050 | [system.md](./system.md) |
| BRAIN | ccr | 0.050 | [brain.md](./brain.md) |
| MEMORY | ccr | 0.050 | — (covered in brain.md memory section) |
| DREAM | ccr | 0.050 | [dream.md](./dream.md) |
| RIPPLE | ocg | 0.040 | [ripple.md](./ripple.md) |
| ACCESS | ocg | 0.040 | [access.md](./access.md) |
| IDENTITY | ocg | 0.040 | — (covered in access.md identity section) |
| RELAY | ocg | 0.040 | [ripple.md](./ripple.md) |
| AUDIT | ocg | 0.040 | — (covered in gov.md audit section) |
| DECODE | execution | 0.028 | [decode.md](./decode.md) |
| ENCODE | execution | 0.028 | [encode.md](./encode.md) |
| VISION | execution | 0.028 | [vision.md](./vision.md) |
| CORTEX | execution | 0.028 | [cortex.md](./cortex.md) |
| NEXUS | execution | 0.028 | [nexus.md](./nexus.md) |
| ECONOMY | execution | 0.027 | — (covered in access.md economy section) |
| SANDBOX | execution | 0.027 | — (covered in encode.md sandbox section) |
| INCLUSIVE | execution | 0.028 | [inclusive.md](./inclusive.md) |
| INTEGRATION | execution | 0.028 | — (covered in system.md) |
| EVOLUTION | field | 0.030 | [seba.md](./seba.md) |
| IMMUNITY | field | 0.030 | [mesh.md](./mesh.md) |
| INTENT | field | 0.030 | [mesh.md](./mesh.md) |
| GOVERNANCE | plane | 0.030 | [gov.md](./gov.md) |
| DEFENSE | shell | 0.030 | [defense.md](./defense.md) |

## Breaker States

All nodes implement circuit breakers:

| State | Behavior | Health Impact |
|-------|----------|---------------|
| `closed` | Normal operation | Raw health value |
| `half-open` | Probe requests only | Capped at 50 |
| `open` | All requests rejected | Forced to 0 |
| `rerouting` | Failover to backup | Capped at 85 |
