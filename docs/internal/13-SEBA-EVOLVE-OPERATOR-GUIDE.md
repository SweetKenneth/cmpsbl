# SEBA & Modernizer.Evolve Operator Guide

**Version:** 7.1.0  
**Last Updated:** 2026-02-02  
**Audience:** Internal Engineers, Operators, Auditors

---

## Overview

This guide explains how to operate the two self-evolution systems in the Substrate OS:

1. **SEBA** (Self-Evolving Bounded Agent) — Cognitive-driven improvements
2. **Modernizer.Evolve** — Module health and gap-based improvements

Both systems generate **proposals** → require **approval** → apply **changes** → log **receipts**.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `seba.status` | View SEBA status, mode, and thresholds |
| `seba.cycle` | Run full cognitive analysis → proposal → governance cycle |
| `seba.propose` | Generate proposals only (persists to DB) |
| `seba.review` | View pending proposals awaiting approval |
| `seba.approve <id>` | Approve a proposal for execution |
| `seba.reject <id>` | Reject a proposal with reason |
| `seba.execute <id>` | Execute an approved proposal |
| `modernizer.evolve` | Scan and create evolution plan |
| `modernizer.evolve shadow` | Apply plan to shadow environment |
| `modernizer.evolve production` | Promote shadow to production |
| `modernizer.receipts` | View evolution receipt history |
| `modernizer.applied` | View all applied improvements |

---

## Part 1: SEBA Lifecycle

### Step 1: Check Status

```
seba.status
```

Output shows:
- **Mode**: off / observe / advisory / governed / autonomous
- **Phase**: Current activity (idle, cognizing, proposing, etc.)
- **Thresholds**: Auto-approve confidence level and risk tolerance

### Step 2: Generate Proposals

```
seba.propose
```

This runs cognitive analysis and generates improvement proposals with **predicted impact metrics**:

```
┌─ 6e0c677f ─────────────────────────────
│  [Memory Optimization] Hot Memory Tier Overflow
│  Category:   memory_optimization
│  Confidence: 90%
│  Risk:       LOW
│  ─────────────────────────────────────
│  PREDICTED IMPACT:
│  • memory:  +13% efficiency
│  • speed:   +4% faster retrieval
└─────────────────────────────────────────
```

**CRITICAL**: Proposals are now persisted to the `evolution_proposals` table so they can be reviewed.

### Step 3: Review Pending Proposals

```
seba.review
```

Displays all proposals with `status = 'pending'` from the database. Each proposal shows:
- Proposal ID (use this for approve/reject)
- Title and target system
- Confidence score
- Created timestamp

### Step 4: Approve or Reject

```
seba.approve 6e0c677f-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Or reject with optional reason:
```
seba.reject 6e0c677f-xxxx-xxxx-xxxx-xxxxxxxxxxxx "Risk too high for current load"
```

### Step 5: Execute Approved Proposal

```
seba.execute 6e0c677f-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Execution flow:
1. Shadow apply (if enabled)
2. Verification tests
3. Production apply
4. Evolution stamp created
5. Receipt logged

### Step 6: Verify Evolution Stamp

Query brain_events to verify the stamp was created:

```sql
SELECT data->>'stamp_id', data->>'change_hash', data->>'applied_at'
FROM brain_events 
WHERE event_type = 'evolution_stamp'
ORDER BY created_at DESC
LIMIT 5;
```

---

## Part 2: Modernizer.Evolve Lifecycle

### Step 1: Initiate Evolution Scan

```
modernizer.evolve
```

Output shows:
- **Plan ID**: Unique identifier for this evolution
- **Modules scanned**: Number of modules analyzed
- **Improvements found**: Gap count
- **Risk level**: Overall risk assessment
- **Health before**: Current system health

### Step 2: Apply to Shadow

```
modernizer.evolve shadow
```

This applies changes to the shadow environment for testing. No production impact.

### Step 3: Promote to Production

```
modernizer.evolve production
```

This:
1. Copies shadow changes to production
2. Runs verification tests
3. Updates health metrics
4. Creates evolution receipt

### Step 4: Verify Results

```
modernizer.receipts
```

Shows receipt history with:
- Run ID and Plan ID
- Phase (verified, aborted, failed)
- Actions count
- Confidence and risk levels
- Created/completed timestamps

### Step 5: View Applied Improvements

```
modernizer.applied
```

Shows all historically applied improvements with:
- Module and change type (fix, feature, enhancement, optimization)
- Description
- Applied date and mode
- Rollback status

---

## Understanding Predicted Impact Metrics

Each proposal includes predicted impact based on category and confidence:

| Category | Metrics Shown |
|----------|--------------|
| `memory_optimization` | memory efficiency %, retrieval speed % |
| `learning_enhancement` | convergence %, prediction accuracy % |
| `performance_boost` | speed %, latency reduction ms |
| `error_recovery` | uptime %, recovery time reduction % |
| `resource_optimization` | CPU %, memory footprint % |

**Formula**: `impact = confidence_score × category_base_rate`

Example: 90% confidence on memory_optimization → +13% memory efficiency

---

## Verification: Proving Code Was Rewritten

Both SEBA and `modernizer.evolve` create **evolution stamps** in the `brain_events` table.

### Method 1: Evolution Stamps in Database

Query for ALL evolution stamps (both SEBA and Modernizer):

```sql
SELECT 
  data->>'stamp_id' as stamp,
  data->>'proposal_id' as proposal,
  data->>'change_type' as type,
  data->>'target' as target,
  data->>'change_hash' as hash,
  data->>'initiator' as initiator,
  created_at
FROM brain_events 
WHERE event_type = 'evolution_stamp'
ORDER BY created_at DESC;
```

**Stamp Initiator Types:**
- `seba_auto` — SEBA autonomous mode (high confidence)
- `seba_governed` — SEBA with human approval
- `human_approved` — Manual approval
- `modernizer_governed` — Modernizer.evolve cycle ← **NEW**

### Method 2: Code Comments (SEBA Only)

SEBA-applied changes include mandatory comments:

```typescript
// [SEBA-EVOLUTION] stamp_id: SEBA-M2ABC123-X4Y5Z6 | proposal: 6e0c677f | applied: 2026-02-02T12:00:00Z
```

**Note**: Modernizer cycles create stamps but don't modify source files directly (they're applied by the platform).

### Method 3: Change Hash Verification

The `change_hash` in the stamp can be verified against the actual change:

```typescript
import { EvolutionStampStore, EvolutionStampGenerator } from './evolution-stamp';

const stamp = await EvolutionStampStore.getRecent(1);
const isValid = EvolutionStampStore.verifyStamp(stamp[0]);
// Returns true if hash matches recorded before/after state
```

### Method 4: Evolution Receipts

```
modernizer.receipts
```

Each receipt shows:
- Health before/after delta
- Test pass rate  
- Timestamp chain
- Associated stamp IDs

---

## Mode Reference

| Mode | Behavior |
|------|----------|
| `off` | SEBA disabled entirely |
| `observe` | Generates proposals, logs only, no execution |
| `advisory` | Generates proposals, requires human approval |
| `governed` | Auto-executes if confidence ≥ threshold AND risk ≤ tolerance |
| `autonomous` | Full auto-execution (requires explicit unlock) |

Change mode:
```
seba.mode advisory
```

---

## Common Issues & Solutions

### Issue: `seba.review` shows "No proposals pending"

**Cause**: Proposals weren't persisted to database.

**Solution**: Use `seba.propose` (now fixed) or `seba.cycle` to generate AND persist proposals.

### Issue: No evolution stamps in brain_events

**Cause**: In `advisory` mode, evolutions require manual execution. Stamps are only created when changes are actually applied.

**Solution**: 
1. Run `seba.propose` to generate proposals
2. Run `seba.review` to see pending
3. Run `seba.approve <id>` then `seba.execute <id>`

### Issue: Health delta shows +0%

**Cause**: No measurable health change from the improvements applied.

**Solution**: This is normal for small optimizations. Check specific metrics in `modernizer.applied`.

### Issue: Evolution cycle aborted

**Cause**: Shadow verification failed or risk threshold exceeded.

**Solution**: Check `modernizer.receipts` for the aborted run's details, then investigate the specific failure reason.

---

## Audit Trail Summary

For investors/auditors, the complete verification chain is:

1. **Proposal** → `evolution_proposals` table (status, confidence, suggested_change)
2. **Approval** → `brain_events` where `event_type = 'manual_approval'`
3. **Execution** → `evolution_runs` table (phases, timestamps)
4. **Stamp** → `brain_events` where `event_type = 'evolution_stamp'` (hash, before/after)
5. **Code Comment** → `// [SEBA-EVOLUTION] stamp_id: ...` in modified files
6. **Receipt** → `evolution_receipts` table (health delta, tests)

This chain is cryptographically verifiable without exposing source code.

---

## Quick Verification Checklist

- [ ] Run `seba.propose` — generates proposals with impact predictions
- [ ] Run `seba.review` — shows pending proposals from database
- [ ] Run `seba.approve <id>` — approves specific proposal
- [ ] Run `seba.execute <id>` — applies changes, creates stamp
- [ ] Query `brain_events` for `event_type = 'evolution_stamp'`
- [ ] Verify `change_hash` matches actual change
- [ ] Confirm mandatory comment exists in modified code

---

*This document is for internal engineering use. For investor-facing observability, see `/docs/library/79-EVOLUTION-OBSERVABILITY.md`.*
