# 07 — Evolution & Mutation Pipeline

**Classification:** 🔒 INTERNAL

---

## 1. Purpose

This document describes the complete evolution pipeline: how the substrate generates, validates, promotes, and rolls back autonomous mutations. This is the engine of continuous self-improvement.

## 2. SEBA — Self-Evolving Bounded Agent

SEBA is the autonomous evolution engine. It operates within strict safety constraints and cannot modify its own governance rules.

### Phases

| Phase | Description |
|-------|-------------|
| `idle` | Waiting for trigger or schedule |
| `analyzing` | Scanning substrate for improvement opportunities |
| `proposing` | Generating improvement proposals |
| `validating` | Running proposals through governance gate |
| `executing` | Applying approved changes |
| `verifying` | Confirming changes produce expected results |

### Governance

- SEBA is the most heavily governed subsystem.
- Every proposal, decision, and execution is immutably audited.
- Risk levels (low/medium/high) determine required approval thresholds.
- SEBA **cannot** modify its own governance constraints.

## 3. The 13-Step Mutation Loop

```
 1. Detect trigger (integrity scan severity ≥ warning, or scheduled)
 2. Capture pre-metrics (integrity score, error rate, health grades)
 3. Generate proposal (SEBA analysis + AI-assisted recommendation)
 4. Score proposal confidence
 5. Check governance gate (policy compliance)
 6. Check mutation readiness index (MRI)
 7. Execute shadow run (isolated environment)
 8. Capture post-shadow metrics
 9. Compute delta (pre vs post)
10. Pass through stabilization gates (12 gates)
11. Promote or reject
12. If promoted: apply to production, verify
13. Persist receipt in Merkle chain
```

## 4. The 7-Gate Promotion Engine

```
Shadow → Simulation → Preflight → Canary → Production
```

| Gate | What It Checks |
|------|---------------|
| 1. Shadow Verdict | Did the shadow run produce positive metrics? |
| 2. TSAC Shadow Verdict | Independent shadow assessment agreement? |
| 3. Simulation | Does simulated load testing pass? |
| 4. Preflight | Are all dependencies healthy? |
| 5. Canary | Does partial rollout show improvement? |
| 6. Confidence Gate | Is confidence ≥ 0.80? |
| 7. Governor Approval | Does GOVERNANCE plane approve? |

## 5. 12 Stabilization Gates

| # | Gate | Threshold |
|---|------|-----------|
| 1 | Integrity health score | ≥ 60% |
| 2 | TSAC shadow verdict | Pass |
| 3 | Error rate delta | ≤ 0% (no increase) |
| 4 | Latency delta | ≤ 5% increase |
| 5 | Circuit breaker state | All closed |
| 6 | Cascade detection | No active cascades |
| 7 | Memory integrity | Hash seals valid |
| 8 | Governance compliance | No violations |
| 9 | Security assessment | No new threats |
| 10 | Cost impact | Within budget |
| 11 | Regression test | All passing |
| 12 | Rollback readiness | Verified |

## 6. Mutation Readiness Index (MRI)

A composite score that determines whether the system is ready to accept a mutation:

```
MRI = 0.30 × integrity_health
    + 0.25 × circuit_health (all closed = 1.0)
    + 0.20 × error_rate_inverse
    + 0.15 × cascade_free (1.0 if no cascades)
    + 0.10 × governance_compliance
```

MRI ≥ 0.70 required to proceed with any mutation.

## 7. Dual-Executor Pattern

| Executor | Role |
|----------|------|
| Writer | Applies the mutation to system state |
| Validator | Independently verifies the mutation produced expected results |

Both executors must agree for a mutation to be considered successful.

## 8. 5-Tier Skill Progression

The evolution engine tracks its own competency:

| Tier | Name | Requirements |
|------|------|-------------|
| 1 | Novice | < 10 successful mutations |
| 2 | Apprentice | 10–50 successful, < 10% rollback rate |
| 3 | Journeyman | 50–200 successful, < 5% rollback rate |
| 4 | Expert | 200–500 successful, < 2% rollback rate |
| 5 | Master | 500+ successful, < 1% rollback rate |

Higher tiers unlock more aggressive mutation types and reduced human oversight requirements.

## 9. Receipt Chain (Merkle-Style)

Every completed evolution cycle produces a receipt:

```typescript
interface ChainedReceipt {
  id: string;
  proposalId: string;
  tenantId: string;
  previousHash: string;     // Chain link to previous receipt
  contentHash: string;      // SHA-256 of payload
  chainHash: string;        // SHA-256(previousHash + contentHash)
  sequenceNumber: number;
  timestamp: number;
  payload: Record<string, unknown>;
}
```

The genesis receipt uses `'0'.repeat(64)` as its previousHash.

### Chain Verification

Iterate from genesis, recompute each chainHash, compare against stored values. Any mismatch = tampering detected.

## 10. Entropy Tracking

The system tracks mutation entropy over time:
- **Linear regression detection** blocks promotions on declining health trends.
- If entropy is increasing (system becoming less stable over successive mutations), evolution is paused.
- Entropy data feeds back into SEBA's proposal generation to avoid repeating failed patterns.

## 11. Reset Pipeline

Administrators can reset mutation telemetry:
- Wipes mutation count, rollback history, and skill progression
- **Preserves** accumulated knowledge and DREAM insights
- Used after major architectural changes that invalidate historical competency data

## 12. The Fossil Record

The Evolution Log is styled as a geological record:

| Term | Meaning |
|------|---------|
| Strata | Epochs (e.g., IRONCLAD) — major evolution phases |
| Specimen | Individual mutation event |
| Mutation Origin | What triggered the mutation (scan, scheduled, manual) |
| Stimulus | The pressure or fault that caused the adaptation |
| Adaptation | The systemic hardening applied |
| Phenotype | The emergent traits that resulted |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial evolution pipeline documentation |

---

© 2025–2026 CMPSBL®. Confidential.
