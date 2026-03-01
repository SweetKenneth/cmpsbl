# Evolution Control Plane — 03 Dry-Run & Rollback

**Classification:** Internal  
**Date:** 2026-03

---

## 1. Dry-Run Preview

The dry-run system lets operators preview what an evolution run **would** change before committing. No state is mutated during a dry-run.

### Dry-Run Config

| Field | Type | Description |
|-------|------|-------------|
| `targetModules` | `string[]` | Which modules to include in the simulation |
| `mutationTypes` | `string[]` | Which mutation categories to allow |
| `maxMutations` | `number` | Cap on total mutations to preview |
| `safetyThreshold` | `number` | Minimum confidence score to include a mutation |

### Dry-Run Result

| Field | Type | Description |
|-------|------|-------------|
| `proposedMutations` | `Mutation[]` | List of changes the engine would make |
| `impactScore` | `number` | Aggregate impact estimate (0–100) |
| `riskAssessment` | `string` | Overall risk level |
| `affectedModules` | `string[]` | Modules that would be touched |
| `estimatedDuration` | `number` | How long the real run would take (ms) |
| `rollbackSafe` | `boolean` | Whether all mutations are reversible |

---

## 2. Snapshot System

Snapshots capture the full evolution state at a point in time, enabling rollback if a committed evolution causes issues.

### Snapshot Operations

| Operation | Function | Description |
|-----------|----------|-------------|
| **Create** | Automatic on each evolution run | Captures pre-run state |
| **List** | `listSnapshots(tenantId, limit)` | Browse available snapshots |
| **Inspect** | View snapshot metadata and delta | See what changed since snapshot |
| **Restore** | `markRestored(snapshotId, restoredBy)` | Roll back to snapshot state |

### Snapshot Storage

Snapshots are stored in the `evolution_snapshots` system with:

- Tenant isolation (multi-tenant safe)
- Configurable retention (default: 20 most recent)
- Restore audit trail (who restored, when)

---

## 3. Rollback Safety

| Guarantee | Description |
|-----------|-------------|
| **Atomic restore** | Snapshot restore is all-or-nothing |
| **Audit logged** | Every restore creates an audit event |
| **Non-destructive** | Restoring doesn't delete the snapshot — you can restore the same snapshot multiple times |
| **Cascading** | Restoring a snapshot invalidates all runs that occurred after it |

---

© 2025–2026 PromptFluid®. All rights reserved.
