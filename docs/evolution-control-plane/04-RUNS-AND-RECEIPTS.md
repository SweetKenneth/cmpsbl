# Evolution Control Plane — 04 Runs & Receipts

**Classification:** Internal  
**Date:** 2026-03

---

## 1. Evolution Run Lifecycle

```
Trigger ──▶ Pre-Scan ──▶ Dry-Run ──▶ Approval ──▶ Execution ──▶ Post-Scan ──▶ Receipt
   │            │            │           │             │              │            │
   │            ▼            ▼           ▼             ▼              ▼            ▼
   │        Snapshot      Preview     Gate/Auto    Mutations      Verify       Audit
   │        Created       Report     Decision     Applied        Health       Trail
```

### Run Statuses

| Status | Description |
|--------|-------------|
| `pending` | Run triggered, awaiting pre-scan |
| `scanning` | Pre-scan in progress |
| `preview` | Dry-run complete, awaiting approval |
| `approved` | Approved for execution (manual or auto) |
| `executing` | Mutations being applied |
| `verifying` | Post-execution health check |
| `completed` | Successfully finished |
| `failed` | Execution error — snapshot available for rollback |
| `rolled_back` | Reverted to pre-run snapshot |

---

## 2. Evolution Receipts

Every evolution run produces an immutable receipt for audit and trend analysis.

### Receipt Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Unique receipt identifier |
| `run_id` | `uuid` | Associated evolution run |
| `timestamp` | `timestamptz` | When the receipt was created |
| `mutations_applied` | `number` | Count of mutations committed |
| `mutations_rejected` | `number` | Count of mutations that failed safety checks |
| `modules_affected` | `string[]` | List of modules touched |
| `health_before` | `number` | Health score pre-run |
| `health_after` | `number` | Health score post-run |
| `delta` | `json` | Detailed diff of what changed |
| `duration_ms` | `number` | Total run duration |
| `triggered_by` | `string` | Who/what initiated the run |

---

## 3. Trend Analysis

The ECC uses receipt data to visualize evolution trends:

| Metric | Source | Visualization |
|--------|--------|---------------|
| Health Score Over Time | `health_after` per receipt | Line chart |
| Mutation Volume | `mutations_applied` per receipt | Bar chart |
| Error Rate | `analytics_snapshots.error_rate` | Area chart |
| Active Modules | `analytics_snapshots.active_modules` | Gauge |
| Run Frequency | Receipt timestamps | Histogram |

Receipts are queried via `useEvolutionReceipts()` with ascending timestamp order for correct trend rendering.

---

© 2025–2026 PromptFluid®. All rights reserved.
