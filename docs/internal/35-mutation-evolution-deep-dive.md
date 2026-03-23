# 35 — Mutation & Evolution Pipeline: Complete Execution Deep Dive

**Classification:** 🔒 INTERNAL — Engineering Reference

---

## 1. Executive Summary

The Mutation & Evolution Pipeline is the substrate's engine of continuous self-improvement. It governs how the system proposes, validates, tests, and applies changes to itself — and how it proves those changes were safe after the fact.

Every mutation — from a threshold adjustment to a schema migration — follows a deterministic, shadow-first lifecycle. No mutation touches production state without passing through a multi-gate gauntlet, a readiness assessment, an entropy check, and (for critical mutations) a two-person verification rule.

This document is the definitive engineering reference for the pipeline's internals.

---

## 2. The Pipeline at a Glance

```
 TRIGGER → ANALYZE → PROPOSE → SHADOW RUN → EVALUATE → STABILIZE → PROMOTE
     │         │          │          │             │           │           │
     │      Readiness   Entropy   SHADOW node    Gates      Governor    Receipt
     │      Index       Tracker   delegation    (3-gate)   Approval    Chain
     │                                                                    │
     └── Rejected proposals exit at any gate ──────────────────── Finalize & Archive
```

There are exactly **10 possible phases** a mutation can occupy:

| Phase | Description |
|---|---|
| `triggered` | Mutation created, risk classified, broadcast emitted |
| `analyzing` | Readiness Index computed, Entropy Tracker engaged |
| `proposed` | Analysis passed — mutation eligible for shadow execution |
| `shadow_running` | Delegated to SHADOW module for isolated execution |
| `evaluating` | Shadow results checked against stabilization gates |
| `stabilizing` | All gates passed — awaiting governor approval |
| `promoting` | Governor approved; dual executor running (if critical) |
| `promoted` | Successfully applied — receipt appended to chain |
| `rejected` | Failed at any gate — archived with reason |
| `rolled_back` | Previously promoted mutation reversed |

---

## 3. Step-by-Step Execution

### 3.1 — TRIGGER (Step 1)

**Source:** `triggerMutation()` in `matrix/mutation-pipeline.ts`

A mutation begins when any module calls `triggerMutation()` with:
- **source**: The originating module (e.g., `evolution`, `seba`, `cortex`)
- **title / description**: Human-readable summary
- **changes**: Array of `MutationChange` objects (typed as `config | threshold | capability | policy | schema`)
- **targetModules**: Which modules will be affected

**Risk Classification** happens immediately at trigger time:

```
CRITICAL  = targets core/system/governance/defense AND includes schema change
HIGH      = targets core/system/governance/defense OR includes schema change  
MEDIUM    = more than 5 changes
LOW       = everything else
```

The trigger emits a `MUTATION_PROPOSED` broadcast to the entire matrix via the Communication Bus, informing all 38 nodes that a mutation is in flight.

**State:** Proposal stored in `activeMutations` Map (in-memory).

### 3.2 — ANALYZE (Step 2)

**Source:** `analyzeMutation()` in `matrix/mutation-pipeline.ts`

Two subsystems engage simultaneously:

#### Readiness Index (MRI)

The **Mutation Readiness Index** (`readiness-index.ts`) computes a fitness score (0–1) using four weighted factors:

| Factor | Weight | What It Measures |
|---|---|---|
| Target Module Health | 0.30 | Average health (0–100) of all target modules |
| Error Rate | 0.25 | Inverse of average error rate (20%+ = score 0) |
| Dependency Stability | 0.25 | Percentage of target modules with all-healthy dependencies |
| Governance Status | 0.20 | Is the Governance control plane active? |

**Hard Gate:** MRI < **0.70** → mutation is **immediately rejected**. No shadow run occurs.

Blockers are also generated:
- Target health < 50%
- Error rate > 10%
- More than half of targets have unhealthy deps
- Governance plane suspended

#### Entropy Tracker

The **Entropy Tracker** (`entropy-tracker.ts`) computes a system complexity score (0–100) using four components:

| Component | Weight | Formula |
|---|---|---|
| Change Complexity | 0.25 | `min(100, changeCount × 10)` |
| System Instability | 0.30 | `100 - avgHealth` across all 38 nodes |
| Breaker Disorder | 0.20 | `(openBreakers / totalNodes) × 100` |
| Error Density | 0.25 | `min(100, (totalErrors / totalOps) × 500)` |

**Trend Detection:** After 3+ snapshots, the tracker classifies the trend:
- `improving` = current score < 3-snapshot average - 2
- `degrading` = current score > 3-snapshot average + 2
- `stable` = within ±2 of average

A degrading entropy trend is a signal (not a hard block) that the system is becoming less stable with successive mutations. SEBA uses this to avoid repeating failed patterns.

### 3.3 — SHADOW RUN (Step 3)

**Source:** `shadowRun()` in `matrix/mutation-pipeline.ts`

This is the most critical step. The pipeline does **not** simulate the mutation itself — it delegates to the real **SHADOW module** via the Communication Bus:

```typescript
const shadowSignal = await nodeSignal(
  proposal.source,
  'shadow',
  MATRIX_SIGNALS.MUTATION_SHADOW_EXECUTE,
  { mutation_id, changes, targets },
  { priority: 'high', persist: true }
);
```

**Why delegation?** The SHADOW module maintains its own isolated execution environment. By delegating via `nodeSignal`, the pipeline:
1. Validates the target node is reachable (breaker check)
2. Delivers the mutation to an isolated sandbox
3. Receives structured results back through the signal payload

**Fallback:** If the SHADOW module is unreachable (breaker open, timeout), the pipeline produces a conservative fallback result with a `divergenceScore` of 0 and a warning. This prevents a single-node failure from blocking all evolution.

**Shadow Result Structure:**

```typescript
interface ShadowRunResult {
  success: boolean;           // Did shadow execution complete?
  executionTimeMs: number;    // Wall-clock time
  metricsDeltas: Record<string, number>;  // Before/after metric changes
  errors: string[];           // Hard failures
  warnings: string[];         // Advisory (including schema migration notes)
  divergenceScore: number;    // 0 = identical to baseline, 1 = fully divergent
}
```

Schema changes automatically generate a warning: `"Schema change on {target} — requires migration verification"`.

### 3.4 — EVALUATE (Step 4)

**Source:** `evaluateMutation()` in `matrix/mutation-pipeline.ts`

Three sequential gates:

| Gate | Criterion | Result on Failure |
|---|---|---|
| Gate 1: Shadow Success | `shadowResult.success === true` | Rejected with error details |
| Gate 2: Divergence Bound | `divergenceScore ≤ 0.30` | Rejected — mutation diverges too much from baseline |
| Gate 3: Governance Approval | `governanceCheck()` passes | Rejected — governance plane blocked |

**Gate 3 Detail — Governance Check:**

The Governance control plane (`control-planes.ts`) applies three rules:
1. If Governance plane is `suspended` → **block everything**
2. If requestor is a Governance-plane owner (governance, audit, conscience, treaty) → **always allowed**
3. If Governance plane is `degraded` → **allowed with warning**
4. Otherwise → **allowed**

Only after all three gates pass does the mutation advance to `stabilizing`.

### 3.5 — PROMOTE (Step 5)

**Source:** `promoteMutation()` in `matrix/mutation-pipeline.ts`

Promotion requires explicit governor approval passed as a parameter:

```typescript
promoteMutation(mutationId, { approved: true, reason: 'Risk acceptable' })
```

#### Dual Executor — Two-Man Rule

For `critical` and `high` risk mutations, the **Dual Executor** (`dual-executor.ts`) engages. Both a Primary and Secondary executor independently verify every change:

| Check | What It Validates |
|---|---|
| Target Existence | Change target is non-empty |
| Forbidden Targets | Not `.env`, `config.toml`, `client.ts`, or `types.ts` |
| Path Safety | Config/schema changes must start with `src/`, `docs/`, `public/`, or `supabase/functions/` |
| Before/After Coherence | No-op changes are flagged (not blocked) |
| Description Present | Every change must have ≥3 char description |

**Both executors must agree** (`approved = true` with `checksFailed = 0` and `checksPassed > 0`). If either dissents, the mutation is rejected with a detailed explanation of which executor rejected and why.

#### Receipt Appended

On successful promotion, a **MutationReceipt** is appended to the Receipt Chain (see §4 below).

A `MUTATION_PROMOTED` broadcast is emitted to all 38 nodes, including the receipt's chain hash.

### 3.6 — ROLLBACK

**Source:** `rollbackMutation()` in `matrix/mutation-pipeline.ts`

Any promoted mutation can be rolled back by supplying its ID and a reason. The mutation's phase changes to `rolled_back` and a `MUTATION_ROLLED_BACK` broadcast is emitted.

Rollback is a state-level operation. The actual reversal of changes is handled by the module that initiated the mutation.

---

## 4. Receipt Chain — Tamper-Evident Audit Ledger

**Source:** `matrix/receipt-chain.ts`

Every completed mutation (promoted, rejected, or rolled back) produces a cryptographic receipt that is linked to the previous receipt, forming an immutable chain.

### 4.1 — Hash Construction

```
contentHash = SHA-256(canonicalize(payload))
chainHash   = SHA-256(prevHash + contentHash)
```

**Canonicalization (v1):** Recursive key-sorting of all JSON objects before serialization. This ensures identical payloads always produce identical hashes regardless of property insertion order.

**Genesis:** The first receipt uses `'0'.repeat(64)` as its `prevHash`.

### 4.2 — Receipt Fields

| Field | Description |
|---|---|
| `index` | Sequential position in chain |
| `mutationId` | Links back to the mutation proposal |
| `outcome` | `promoted`, `rejected`, or `rolled_back` |
| `metricsDeltas` | Before/after metric changes from shadow run |
| `approvalDecision` | Governor's `{ approved, reason }` |
| `executionLog` | Array of strings: shadow pass/fail, warnings, errors, dual executor result |
| `contentHash` | SHA-256 of canonicalized payload |
| `chainHash` | SHA-256(prevHash + contentHash) — the linking hash |
| `prevHash` | chainHash of previous receipt |
| `algo` | Always `'sha256'` |
| `canonicalizationVersion` | Always `'v1'` |

### 4.3 — Chain Verification

`verifyChain()` iterates from genesis through every receipt:
1. Check `receipt.prevHash === previous receipt's chainHash`
2. Recompute `contentHash` from payload fields
3. Recompute `chainHash` from `prevHash + contentHash`
4. Compare against stored values

**Any mismatch = tampering detected.** The function returns `{ valid: false, brokenAt: index }`.

### 4.4 — Anchor Heads

Every **100 receipts**, the chain head hash is written to redundant stores via `anchorHead()`. During verification, anchor consistency is checked via `verifyAnchors()`. This prevents long-range attacks where an adversary might replay an old chain segment.

### 4.5 — Bounded Growth

Chain length is capped at **5,000 receipts**. When exceeded, the oldest 1,000 are pruned. Anchored hashes preserve the integrity reference for the pruned segment.

---

## 5. SEBA — The Evolution Engine

**Source:** `src/lib/substrate/seba/`

SEBA (Self-Evolving Bounded Agent) is the autonomous agent that drives the mutation pipeline. It operates within strict safety constraints and **cannot modify its own governance rules**.

### 5.1 — Architecture

SEBA comprises four sub-modules:

| Component | Role |
|---|---|
| **CognitiveAnalyzer** | Scans the substrate for improvement opportunities using 9 specialized analysis engines |
| **ProposalGenerator** | Converts insights into structured `ImprovementProposal` objects with risk scoring |
| **GovernanceGate** | Validates proposals against policies, risk budgets (100 units/day), and cost ceilings |
| **EvolutionExecutor** | Applies approved changes through the shadow-to-production pipeline |

### 5.2 — Execution Mode

SEBA operates in **external-ai** mode: internal auto-application is forbidden. Proposals are exported as stamped JSON for external agent application. This ensures no autonomous mutation bypasses human review.

### 5.3 — Skill Progression

SEBA tracks its own competency:

| Tier | Name | Requirements |
|---|---|---|
| 1 | Novice | < 10 successful mutations |
| 2 | Apprentice | 10–50 successful, < 10% rollback rate |
| 3 | Journeyman | 50–200 successful, < 5% rollback rate |
| 4 | Expert | 200–500 successful, < 2% rollback rate |
| 5 | Master | 500+ successful, < 1% rollback rate |

Higher tiers unlock more aggressive mutation types and reduced oversight requirements.

### 5.4 — Cross-Validation & Proposal Chaining

SEBA v3.1.0 introduced:
- **Cross-Validation:** Post-execution verification that actual results match predicted outcomes, flagging deviations
- **Proposal Chaining:** DAG-based dependency sequencing where multi-step mutations are linked with prerequisite ordering

---

## 6. Data Flow Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │            SEBA / External Agent            │
                    │  CognitiveAnalyzer → ProposalGenerator →    │
                    │  GovernanceGate → EvolutionExecutor          │
                    └────────────┬────────────────────────────────┘
                                 │ triggerMutation()
                                 ▼
                    ┌────────────────────────┐
                    │     MUTATION PIPELINE   │
                    │  (matrix/mutation-      │
                    │   pipeline.ts)          │
                    └──┬─────────────────────┘
                       │
           ┌───────────┼───────────────────┐
           ▼           ▼                   ▼
    ┌────────────┐ ┌──────────┐   ┌──────────────┐
    │ READINESS  │ │ ENTROPY  │   │ SHADOW MODULE│
    │  INDEX     │ │ TRACKER  │   │ (isolated    │
    │ (4 factors)│ │(4 comps) │   │  execution)  │
    └─────┬──────┘ └────┬─────┘   └──────┬───────┘
          │              │                │
          └──────────────┼────────────────┘
                         ▼
              ┌──────────────────────┐
              │   EVALUATE (3 gates) │
              │   Shadow + Divergence│
              │   + Governance       │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │ PROMOTE              │
              │ Governor Approval    │
              │ + Dual Executor      │
              │   (if critical/high) │
              └──────────┬───────────┘
                         ▼
              ┌──────────────────────┐
              │ RECEIPT CHAIN        │
              │ SHA-256 linked       │
              │ Anchored every 100   │
              └──────────────────────┘
```

---

## 7. Configuration Constants

| Constant | Value | Location |
|---|---|---|
| `READINESS_THRESHOLD` | 0.70 | mutation-pipeline.ts |
| `MAX_DIVERGENCE` | 0.30 | mutation-pipeline.ts |
| `MAX_COMPLETED` | 200 | mutation-pipeline.ts (completed history) |
| `MAX_CHAIN_LENGTH` | 5,000 | receipt-chain.ts |
| `ANCHOR_INTERVAL` | 100 | receipt-chain.ts |
| `GENESIS_HASH` | `'0'.repeat(64)` | receipt-chain.ts |
| `MAX_HISTORY` (entropy) | 200 | entropy-tracker.ts |
| `SAFE_PREFIXES` | `src/`, `docs/`, `public/`, `supabase/functions/` | dual-executor.ts |

---

## 8. Bus Signals Emitted

| Signal | When | Payload |
|---|---|---|
| `MUTATION_PROPOSED` | Trigger | `mutation_id`, `title`, `risk`, `targets` |
| `MUTATION_SHADOW_START` | Shadow begins | `mutation_id`, `targets` |
| `MUTATION_SHADOW_EXECUTE` | Node-to-node to SHADOW | `mutation_id`, `changes`, `targets` |
| `MUTATION_SHADOW_RESULT` | Shadow completes | `mutation_id`, `success`, `divergence`, `errors` |
| `MUTATION_PROMOTED` | Promotion | `mutation_id`, `receipt_hash`, `title` |
| `MUTATION_REJECTED` | Rejection | `mutation_id`, `reason` |
| `MUTATION_ROLLED_BACK` | Rollback | `mutation_id`, `reason` |

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-06 | System | Complete execution deep dive — consolidated from source |

---

© 2025–2026 CMPSBL®. Confidential.
