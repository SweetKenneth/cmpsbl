# CMPSBL OS Substrate — Evolution Lifecycle v0.7.8

**Version 6.3.1 (Modernizer 0.7.8) | Scientific Publication**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-075 |
| **Module** | MODERNIZER |
| **Layer** | Administrative |
| **Version** | v6.3.1 (Modernizer 0.7.8) |

---

## 1. Evolution State — Single Source of Truth

### 1.1 Overview

All evolution state is unified into one authoritative record: `evolution_runs`. This eliminates shadow/phase flag fragmentation and ensures deterministic, auditable evolution execution.

### 1.2 Schema

| Field | Type | Description |
|-------|------|-------------|
| `run_id` | UUID (PK) | Unique run identifier |
| `plan_id` | UUID | Associated plan |
| `phase` | ENUM | Current lifecycle phase |
| `initiated_by` | ENUM | system \| human |
| `confidence_score` | FLOAT | 0-1 confidence |
| `risk_level` | ENUM | low \| medium \| high |
| `created_at` | TIMESTAMPTZ | Run creation time |
| `updated_at` | TIMESTAMPTZ | Last update |
| `completed_at` | TIMESTAMPTZ | Completion time (nullable) |
| `receipt_id` | UUID | Linked receipt (nullable) |
| `metadata` | JSONB | Additional data |

### 1.3 Phase Lifecycle

```
┌──────────┐    ┌────────────────┐    ┌─────────────────────┐    ┌──────────┐
│ planning │───►│ shadow_applied │───►│ production_applied  │───►│ verified │
└──────────┘    └────────────────┘    └─────────────────────┘    └──────────┘
      │                │                        │                      │
      └────────────────┴────────────────────────┴──────────────────────┘
                                    │
                              ┌─────┴─────┐
                              │  aborted  │
                              │  failed   │
                              └───────────┘
```

### 1.4 Phase Rules

| Rule | Enforcement |
|------|-------------|
| Single active run | Database trigger prevents concurrent runs |
| Linear progression | Cannot skip phases (1→2→3→4) |
| No backwards | Cannot revert to previous phases |
| Terminal states | `aborted` and `failed` can be reached from any phase |

---

## 2. Shadow Phase Idempotency

### 2.1 Problem Solved

Plans previously got stuck in `shadow_apply` due to duplicate or partial writes.

### 2.2 Solution

- `modernizer.evolve shadow` is now **idempotent**
- If `phase === shadow_applied` → returns SUCCESS (not error)
- If `phase > shadow_applied` → blocks with clear message
- No more fake "stuck in shadow" loops

### 2.3 Example

```typescript
// First call - executes shadow
await modernizerCommands.evolveShadow('plan-123');
// Result: { success: true, phase: 'shadow_applied' }

// Second call - idempotent success
await modernizerCommands.evolveShadow('plan-123');
// Result: { success: true, phase: 'shadow_applied', idempotent_hit: true }
```

---

## 3. Production Promotion Chain

### 3.1 Gates

| Gate | Requirement |
|------|-------------|
| Phase gate | Must be in `shadow_applied` phase |
| Verification | Shadow artifacts must exist and be valid |
| Backup | Failsafe backup created before apply |
| Atomicity | Phase transition is atomic |

### 3.2 Failure Mode

If ANY step fails → rollback + mark run as `failed`.

---

## 4. Receipts System 🔥

### 4.1 Overview

Every shadow + production apply generates an immutable receipt.

### 4.2 Receipt Schema

| Field | Type | Description |
|-------|------|-------------|
| `receipt_id` | UUID (PK) | Unique receipt ID |
| `run_id` | UUID | Associated run |
| `plan_id` | UUID | Associated plan |
| `phase` | ENUM | Phase when receipt was created |
| `changes_applied` | JSON | Array of file changes |
| `tests_run` | INT | Number of tests executed |
| `tests_passed` | INT | Number of tests passed |
| `health_before` | JSON | System health snapshot before |
| `health_after` | JSON | System health snapshot after |
| `backup_id` | UUID | Associated backup (nullable) |
| `timestamp` | TIMESTAMPTZ | Receipt creation time |

### 4.3 Commands

```
modernizer.receipts        # List recent receipts
modernizer.receipt <id>    # Get specific receipt details
```

---

## 5. Terminal Commands

### 5.1 Evolution Commands

| Command | Description |
|---------|-------------|
| `modernizer.status` | Get current evolution status |
| `modernizer.jobs` | List all evolution runs |
| `modernizer.evolve shadow` | Execute shadow apply |
| `modernizer.evolve production` | Execute production apply |
| `modernizer.evolve verify` | Verify and complete evolution |
| `modernizer.evolve abort` | Abort active evolution |
| `modernizer.receipts` | List recent receipts |
| `modernizer.receipt <run_id>` | Get receipt for run |

### 5.2 Example Session

```
> modernizer.status
✅ Modernizer idle — no active evolution

> modernizer.evolve shadow --plan plan-abc123
✅ Shadow applied: 3 changes | Receipt: rec-def456...

> modernizer.evolve production
✅ Production applied: 3 changes | Backup: bak-ghi789... | Receipt: rec-jkl012...

> modernizer.evolve verify
✅ Evolution verified and complete: run-mno345...
```

---

## 6. Decode Fallback Honesty

### 6.1 Problem

Silent garbage proposals entering evolution.

### 6.2 Solution

If `decode.propose` falls back:
- Proposal marked as `fallback: true`
- Auto-evolution blocked for fallback proposals
- Explicit human approval required

### 6.3 Detection Criteria

| Condition | Triggers Fallback |
|-----------|-------------------|
| Confidence < 0.3 | Yes |
| No changes proposed | Yes |
| Generic/vague title | Yes |

---

## 7. System Diagnostics

### 7.1 Guarantee

`system.diagnostics` NEVER returns non-2xx. On internal error:
- Returns structured diagnostic error payload
- Logs error to vision.logs with correlation_id

### 7.2 Response Structure

```json
{
  "success": true,
  "correlation_id": "uuid",
  "timestamp": "ISO8601",
  "status": "healthy|degraded|error",
  "components": [...],
  "evolution_state": {...},
  "errors": [...]
}
```

---

## 8. Changelog v0.7.5

- ✅ Unified evolution state into `evolution_runs` table
- ✅ Added `evolution_receipts` for immutable audit trail
- ✅ Fixed shadow phase idempotency
- ✅ Implemented promotion chain with backup gates
- ✅ Fixed `modernizer.jobs` command
- ✅ Added decode fallback honesty
- ✅ Made diagnostics always return structured response
- ✅ Added phase transition validation triggers
- ✅ Added single active run enforcement

---

## 9. Related Documentation

- [Evolution Autonomy v0.7.6](./76-EVOLUTION-AUTONOMY.md) — Governed autonomy, circuit breaker, self-repair

---

*CMPSBL OS Substrate v0.7.5 → v0.7.6 — Evolution Integrity Era*
*© 2025-2026 PromptFluid®. All rights reserved.*
