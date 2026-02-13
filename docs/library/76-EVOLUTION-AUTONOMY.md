# CMPSBL OS Substrate — Evolution Autonomy v9.1.0

**Version 9.1.0 (MODERNIZER) | Scientific Publication**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-076 |
| **Module** | MODERNIZER |
| **Layer** | Administrative |
| **Version** | v9.1.0 (ARCHITECT Epoch) |

---

## 1. Autonomy Modes

### 1.1 Overview

Evolution autonomy controls whether the system can self-evolve without human approval.

### 1.2 Modes

| Mode | Behavior |
|------|----------|
| `off` | No autonomous evolution. Human approval required for all changes. |
| `advisory` | System suggests evolutions but does not execute. Human decides. |
| `governed` | Autonomous execution with strict guardrails. See rules below. |

### 1.3 Governed Mode Rules

Autonomous evolution MAY run ONLY if ALL conditions are met:

| Condition | Requirement |
|-----------|-------------|
| Confidence | `confidence_score >= min_confidence_prod` (default 80%) |
| Risk | `risk_level === 'low'` |
| No Active Run | No other evolution run is active |
| Last Success | Previous run completed successfully |
| No Fallback | Proposal is NOT a fallback (requires human approval) |
| Daily Limit | `runs_today < max_auto_runs_per_day` |

If ANY condition fails → evolution blocked + logged.

---

## 2. Circuit Breaker

### 2.1 Purpose

Hard-stop protection against runaway evolution failures.

### 2.2 States

| State | Meaning |
|-------|---------|
| `closed` | Evolution allowed |
| `open` | Evolution blocked |

### 2.3 Trip Conditions

- Any failed production apply → OPEN circuit
- Manual admin action

### 2.4 Reset Conditions

- Manual admin reset
- Successful self-repair cycle
- Auto-reset timer expiration (if configured)

### 2.5 Commands

```
modernizer.circuit status    # View current state
modernizer.circuit reset     # Close circuit (admin only)
modernizer.circuit open      # Open circuit manually
```

---

## 3. Self-Repair Loop

### 3.1 Purpose

When evolution fails, the system stabilizes itself before allowing further attempts.

### 3.2 Safe Mode Actions

ONLY these actions are allowed during self-repair:

| Action | Purpose |
|--------|---------|
| `system.heal` | Diagnostic health check |
| `brain.optimize` | Memory optimization (read-only) |
| `vision.resilience` | Resilience assessment |
| `decode.explain` | Read-only failure analysis |

### 3.3 Forbidden During Repair

- Code mutation
- Production writes
- Schema changes
- External API calls

### 3.4 Outcome

| Result | Effect |
|--------|--------|
| `success` | Circuit closed, evolution allowed |
| `partial` | Circuit remains open, retry possible |
| `failed` | Circuit remains open, admin intervention needed |

---

## 4. Public Receipts

### 4.1 Endpoint

```
GET /evolution/receipts
GET /evolution/receipts?run_id=<uuid>
GET /evolution/receipts?page=1&page_size=20
```

### 4.2 Public Fields

| Field | Description |
|-------|-------------|
| `run_id` | Evolution run identifier |
| `phase` | Final phase (verified/failed/aborted) |
| `confidence_score` | Confidence percentage |
| `risk_level` | low/medium/high |
| `tests_run` | Number of tests executed |
| `tests_passed` | Number of tests passed |
| `health_before` | Health score before evolution |
| `health_after` | Health score after evolution |
| `timestamp` | Receipt creation time |
| `initiated_by` | system/human |

### 4.3 Security

**NOT EXPOSED:**
- Payload diffs
- Code changes
- Internal state
- Debug information

Receipts are **facts**, not **methods**.

---

## 5. Terminal Commands

### 5.1 Autonomy Commands

| Command | Description |
|---------|-------------|
| `modernizer.autonomy status` | View current autonomy mode |
| `modernizer.autonomy set <mode>` | Set mode (off/advisory/governed) |

### 5.2 Receipt Commands

| Command | Description |
|---------|-------------|
| `modernizer.receipts` | List recent receipts |
| `modernizer.receipt <run_id>` | View specific receipt |

### 5.3 Circuit Commands

| Command | Description |
|---------|-------------|
| `modernizer.circuit status` | View circuit state |
| `modernizer.circuit reset` | Reset (close) circuit |
| `modernizer.circuit open <reason>` | Open circuit manually |

---

## 6. Changelog

### v0.7.8

- ✅ Added Proposal Normalization Layer
- ✅ Strict plan creation contract (only normalized actions)
- ✅ Explicit rejection codes for normalization failures
- ✅ Terminal truthfulness ("N actions normalized" or "proposals could not be normalized")
- ✅ Evolve safety guarantee (rejects unnormalized plans)
- ✅ Normalization test suite

### v0.7.6/v0.7.7

- ✅ Added governed autonomy mode
- ✅ Implemented circuit breaker with auto-reset
- ✅ Added safe-mode self-repair loop
- ✅ Created public receipts endpoint
- ✅ Added admin receipts dashboard
- ✅ Added autonomy terminal commands
- ✅ Added circuit breaker terminal commands
- ✅ Created self-repair log table
- ✅ Documented all security constraints

---

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
