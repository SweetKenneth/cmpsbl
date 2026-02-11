# Evolution Systems Demo Guide
**Internal Documentation v8.5.0**

This guide provides step-by-step instructions for demonstrating the SEBA (Self-Evolving Bounded Agent) and Modernizer evolution systems, including expected outputs at each stage.

---

## Table of Contents
1. [SEBA Demo Workflow](#seba-demo-workflow)
2. [Modernizer Demo Workflow](#modernizer-demo-workflow)
3. [Verification Checklist](#verification-checklist)
4. [Troubleshooting](#troubleshooting)

---

## SEBA Demo Workflow

SEBA is the substrate's autonomous evolution engine that analyzes the system across 9 cognitive engines and proposes improvements with human-in-the-loop governance.

### Step 1: Check SEBA Status

**Command:**
```
seba.status
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  SEBA v2.0.0 — Full Spectrum Autonomy                        ║
╠══════════════════════════════════════════════════════════════╣
║  Mode:        governed                                       ║
║  Phase:       idle                                           ║
║  Health:      98%                                            ║
║  Last Cycle:  2025-02-07T10:30:00Z                          ║
║  Proposals:   pending: 0 | approved: 3 | applied: 12        ║
╚══════════════════════════════════════════════════════════════╝
```

**Key Fields:**
- `Mode`: off | observe | advisory | governed | autonomous
- `Phase`: idle | scanning | analyzing | proposing | executing
- `Proposals`: Shows pipeline state

---

### Step 2: Run Evolution Cycle

**Command:**
```
seba.cycle
```

**Expected Output (During Scan):**
```
╔══════════════════════════════════════════════════════════════╗
║  🔄 SEBA EVOLUTION CYCLE                                     ║
╠══════════════════════════════════════════════════════════════╣
║  Phase: COGNITIVE ANALYSIS                                   ║
║                                                              ║
║  Engines Running:                                            ║
║  ✅ Memory Engine      — 3 insights                         ║
║  ✅ Learning Engine    — 1 insight                          ║
║  ✅ Imagination Engine — 0 insights                         ║
║  ✅ Reasoning Engine   — 2 insights                         ║
║  ✅ Security Engine    — 0 insights                         ║
║  ✅ Telemetry Engine   — 1 insight                          ║
║  ✅ Governance Engine  — 0 insights                         ║
║  ✅ Resources Engine   — 2 insights                         ║
║  ✅ Architecture Engine— 1 insight                          ║
║                                                              ║
║  Total Insights: 10                                          ║
║  After Dedup:    4 (6 filtered as recently addressed)       ║
╚══════════════════════════════════════════════════════════════╝
```

**Expected Output (Proposals Generated):**
```
╔══════════════════════════════════════════════════════════════╗
║  ✅ CYCLE COMPLETE                                           ║
╠══════════════════════════════════════════════════════════════╣
║  New Proposals: 4                                            ║
║                                                              ║
║  1. [Memory] Optimize hot tier capacity                     ║
║     Risk: low | Impact: +8% memory efficiency               ║
║     ID: prop_abc123                                          ║
║                                                              ║
║  2. [Learning] Consolidate stale patterns                   ║
║     Risk: low | Impact: +5% learning velocity               ║
║     ID: prop_def456                                          ║
║                                                              ║
║  3. [Resources] Rebalance compute allocation                ║
║     Risk: medium | Impact: +12% throughput                  ║
║     ID: prop_ghi789                                          ║
║                                                              ║
║  4. [Telemetry] Prune old metrics                           ║
║     Risk: low | Impact: -15% storage usage                  ║
║     ID: prop_jkl012                                          ║
║                                                              ║
║  Status: pending_review (awaiting governance)               ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 3: Review a Proposal

**Command:**
```
seba.review
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  📋 PENDING PROPOSALS                                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ID: prop_abc123                                             ║
║  Category: Memory Optimization                               ║
║  Title: Optimize hot tier capacity                          ║
║                                                              ║
║  Description:                                                ║
║  The hot memory tier is operating at 87% capacity.          ║
║  Recommend increasing threshold or migrating cold entries.  ║
║                                                              ║
║  Predicted Impact:                                           ║
║  • Memory efficiency: +8%                                   ║
║  • Query latency: -12ms avg                                 ║
║  • Cache hit rate: +3%                                      ║
║                                                              ║
║  Risk Assessment: LOW                                        ║
║  Confidence: 94%                                             ║
║                                                              ║
║  Proposed Actions:                                           ║
║  1. Migrate 234 entries to warm tier                        ║
║  2. Adjust hot_tier_threshold from 1000 to 1200            ║
║  3. Update eviction policy timing                           ║
║                                                              ║
║  Commands: seba.approve prop_abc123 | seba.reject prop_abc123║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 4: Approve or Reject

**Approve Command:**
```
seba.approve prop_abc123
```

**Expected Output:**
```
✅ Proposal prop_abc123 APPROVED
   Status: queued_for_execution
   Execution will begin on next cycle or via seba.execute prop_abc123
```

**Reject Command:**
```
seba.reject prop_abc123
```

**Expected Output:**
```
❌ Proposal prop_abc123 REJECTED
   Status: rejected
   Reason will be logged for future learning
```

---

### Step 5: Execute Approved Proposal (Shadow First)

SEBA follows a **shadow→production** flow. Execute first applies to shadow, then requires a second command for production.

**Step 5a: Shadow Apply**
```
seba.execute prop_abc123
```

**Expected Output:**
```
✅ Shadow applied for proposal prop_abc
   Full ID: prop_abc123-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Title: Optimize hot tier capacity
   
   Next: seba.execute prop_abc production  — to apply to production
         seba.rollback prop_abc            — to abort
```

**Step 5b: Production Apply**
```
seba.execute prop_abc123 production
```

**Expected Output:**
```
🚀 Production applied for proposal prop_abc
   Full ID: prop_abc123-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Title: Optimize hot tier capacity
   Stamp: SEBA-20260207-PRO
   
   Rollback: seba.rollback prop_abc
```

**Key Points:**
- First `seba.execute <id>` applies to **shadow** (validation phase)
- Second `seba.execute <id> production` applies to **production**
- This two-step flow matches Modernizer's `shadow → production` pipeline

---

### Step 6: View History

**Command:**
```
seba.history
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  📜 SEBA EVOLUTION HISTORY                                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  2025-02-07 10:45:00 | APPLIED                              ║
║  [Memory] Optimize hot tier capacity                        ║
║  Impact: +8% memory efficiency | Stamp: SEBA-2025-0207-001  ║
║                                                              ║
║  2025-02-06 14:30:00 | APPLIED                              ║
║  [Learning] Pattern consolidation                           ║
║  Impact: +5% learning velocity | Stamp: SEBA-2025-0206-003  ║
║                                                              ║
║  2025-02-06 09:15:00 | REJECTED                             ║
║  [Architecture] Restructure module dependencies             ║
║  Reason: Risk too high for current stability target         ║
║                                                              ║
║  Showing 3 of 15 entries. Use seba.history 15 for more.     ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Modernizer Demo Workflow

Modernizer is the self-upgrade system that scans the substrate for improvements, generates upgrade plans, and applies them through a shadow→production pipeline.

### Step 1: Check Modernizer Status

**Command:**
```
modernizer.status
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  MODERNIZER v7.0.0 — Self-Upgrade Engine                    ║
╠══════════════════════════════════════════════════════════════╣
║  State:       idle                                           ║
║  Last Scan:   2025-02-07T09:00:00Z                          ║
║  Active Plan: none                                           ║
║  Applied:     8 plans this month                            ║
║  Archived:    23 functions available                        ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 2: Run Evolution Scan

**Command:**
```
modernizer.evolve
```

**Expected Output (Scanning):**
```
╔══════════════════════════════════════════════════════════════╗
║  🔍 MODERNIZER EVOLUTION SCAN                                ║
╠══════════════════════════════════════════════════════════════╣
║  Phase: SCANNING                                             ║
║  Depth: standard                                             ║
║                                                              ║
║  Modules Scanned:                                            ║
║  ✅ Brain        — 2 opportunities                          ║
║  ✅ Nexus        — 1 opportunity                            ║
║  ✅ Decode       — 0 opportunities                          ║
║  ✅ Cortex       — 3 opportunities                          ║
║  ✅ Governance   — 0 opportunities                          ║
║  ... (scanning remaining modules)                            ║
╚══════════════════════════════════════════════════════════════╝
```

**Expected Output (Plan Generated):**
```
╔══════════════════════════════════════════════════════════════╗
║  ✅ PLAN READY — 6 actions normalized                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Short ID: d0774784                                          ║
║  Full ID:  d0774784-349a-43cc-ab59-0b4780728417             ║
║                                                              ║
║  Summary:                                                    ║
║  • Brain module: 2 optimizations                            ║
║  • Nexus module: 1 enhancement                              ║
║  • Cortex module: 3 refactors                               ║
║                                                              ║
║  Risk Level: LOW                                             ║
║  Confidence: 91%                                             ║
║                                                              ║
║  Next Steps:                                                 ║
║  • modernizer.review d0774784-349a-43cc-ab59-0b4780728417   ║
║  • modernizer.diff d0774784-349a-43cc-ab59-0b4780728417     ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 3: Review Plan Details

**Command:**
```
modernizer.review d0774784-349a-43cc-ab59-0b4780728417
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  📋 PLAN REVIEW                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Plan ID: d0774784-349a-43cc-ab59-0b4780728417              ║
║  Created: 2025-02-07T11:00:00Z                              ║
║  Status: pending                                             ║
║                                                              ║
║  PROPOSED CHANGES:                                           ║
║                                                              ║
║  1. [Brain] Optimize memory consolidation                   ║
║     File: src/lib/substrate/brain/consolidator.ts           ║
║     Change: Reduce consolidation interval from 5min to 3min ║
║     Impact: +15% memory throughput                          ║
║                                                              ║
║  2. [Brain] Add batch processing                            ║
║     File: src/lib/substrate/brain/processor.ts              ║
║     Change: Batch similar operations                        ║
║     Impact: -20% CPU usage                                  ║
║                                                              ║
║  3. [Nexus] Improve load balancing                          ║
║     File: src/lib/substrate/nexus/balancer.ts               ║
║     Change: Weighted round-robin algorithm                  ║
║     Impact: +10% request distribution                       ║
║                                                              ║
║  ... (3 more actions)                                        ║
║                                                              ║
║  PREDICTED METRICS:                                          ║
║  ┌─────────────────────┬──────────┬──────────┬─────────┐    ║
║  │ Metric              │ Before   │ After    │ Delta   │    ║
║  ├─────────────────────┼──────────┼──────────┼─────────┤    ║
║  │ Memory Efficiency   │ 78%      │ 89%      │ +11%    │    ║
║  │ CPU Usage           │ 65%      │ 52%      │ -13%    │    ║
║  │ Request Latency     │ 120ms    │ 95ms     │ -25ms   │    ║
║  │ Throughput          │ 1.2k/s   │ 1.5k/s   │ +25%    │    ║
║  └─────────────────────┴──────────┴──────────┴─────────┘    ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 4: View Diff

**Command:**
```
modernizer.diff d0774784-349a-43cc-ab59-0b4780728417
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  📝 PLAN DIFF                                                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  File: src/lib/substrate/brain/consolidator.ts              ║
║  ───────────────────────────────────────────────────────────║
║  @@ -45,7 +45,7 @@                                           ║
║   export const CONSOLIDATION_CONFIG = {                      ║
║  -  interval: 5 * 60 * 1000, // 5 minutes                   ║
║  +  interval: 3 * 60 * 1000, // 3 minutes (optimized)       ║
║     batchSize: 100,                                          ║
║     priority: 'high',                                        ║
║   };                                                         ║
║                                                              ║
║  File: src/lib/substrate/brain/processor.ts                 ║
║  ───────────────────────────────────────────────────────────║
║  @@ -78,6 +78,15 @@                                          ║
║   export async function processEvents(events: Event[]) {    ║
║  +  // Batch similar operations for efficiency              ║
║  +  const batched = batchByType(events);                    ║
║  +  for (const batch of batched) {                          ║
║  +    await processBatch(batch);                            ║
║  +  }                                                        ║
║     // ... existing code                                     ║
║   }                                                          ║
║                                                              ║
║  ... (more diffs)                                            ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 5: Apply to Shadow (Test Environment)

**Command:**
```
modernizer.evolve target=shadow
```
or
```
modernizer.applyShadow d0774784-349a-43cc-ab59-0b4780728417
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  🧪 APPLYING TO SHADOW                                       ║
╠══════════════════════════════════════════════════════════════╣
║  Plan ID: d0774784-349a-43cc-ab59-0b4780728417              ║
║                                                              ║
║  Progress:                                                   ║
║  [████████████████████████████████████████] 100%            ║
║                                                              ║
║  Changes Applied:                                            ║
║  ✅ brain/consolidator.ts — interval updated                ║
║  ✅ brain/processor.ts — batch processing added             ║
║  ✅ nexus/balancer.ts — algorithm updated                   ║
║  ✅ cortex/pipeline.ts — 3 optimizations                    ║
║                                                              ║
║  SHADOW VERIFICATION:                                        ║
║  ┌─────────────────────┬──────────┬──────────┬─────────┐    ║
║  │ Metric              │ Before   │ After    │ Status  │    ║
║  ├─────────────────────┼──────────┼──────────┼─────────┤    ║
║  │ Health Score        │ 94%      │ 97%      │ ✅ PASS │    ║
║  │ All Tests           │ 142/142  │ 142/142  │ ✅ PASS │    ║
║  │ Memory Efficiency   │ 78%      │ 88%      │ ✅ PASS │    ║
║  │ Error Rate          │ 0.02%    │ 0.01%    │ ✅ PASS │    ║
║  └─────────────────────┴──────────┴──────────┴─────────┘    ║
║                                                              ║
║  Status: SHADOW_APPLIED                                      ║
║  Next: modernizer.evolve target=production                  ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 6: Verify Shadow Results

**Command:**
```
modernizer.evolve target=verify
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  🔬 SHADOW VERIFICATION REPORT                               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Plan: d0774784-349a-43cc-ab59-0b4780728417                 ║
║  Shadow Duration: 15 minutes                                 ║
║                                                              ║
║  PERFORMANCE COMPARISON:                                     ║
║  ┌─────────────────────┬──────────┬──────────┬─────────┐    ║
║  │ Metric              │ Baseline │ Shadow   │ Change  │    ║
║  ├─────────────────────┼──────────┼──────────┼─────────┤    ║
║  │ Avg Response Time   │ 120ms    │ 94ms     │ -22%    │    ║
║  │ P95 Latency         │ 250ms    │ 180ms    │ -28%    │    ║
║  │ Memory Usage        │ 512MB    │ 445MB    │ -13%    │    ║
║  │ CPU Utilization     │ 65%      │ 51%      │ -14%    │    ║
║  │ Error Rate          │ 0.02%    │ 0.01%    │ -50%    │    ║
║  │ Throughput          │ 1.2k/s   │ 1.48k/s  │ +23%    │    ║
║  └─────────────────────┴──────────┴──────────┴─────────┘    ║
║                                                              ║
║  STABILITY:                                                  ║
║  • No crashes detected                                       ║
║  • No memory leaks detected                                  ║
║  • All integration tests passing                            ║
║                                                              ║
║  Recommendation: ✅ SAFE FOR PRODUCTION                      ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 7: Apply to Production

**Command:**
```
modernizer.evolve target=production
```
or
```
modernizer.applyProduction d0774784-349a-43cc-ab59-0b4780728417
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  🚀 APPLYING TO PRODUCTION                                   ║
╠══════════════════════════════════════════════════════════════╣
║  Plan ID: d0774784-349a-43cc-ab59-0b4780728417              ║
║                                                              ║
║  ⚠️  PRODUCTION DEPLOYMENT                                   ║
║  This will modify live system code.                         ║
║                                                              ║
║  Progress:                                                   ║
║  [████████████████████████████████████████] 100%            ║
║                                                              ║
║  APPLIED CHANGES:                                            ║
║  ✅ brain/consolidator.ts                                   ║
║     Stamp: MOD-2025-0207-001                                ║
║                                                              ║
║  ✅ brain/processor.ts                                      ║
║     Stamp: MOD-2025-0207-002                                ║
║                                                              ║
║  ✅ nexus/balancer.ts                                       ║
║     Stamp: MOD-2025-0207-003                                ║
║                                                              ║
║  ✅ cortex/pipeline.ts                                      ║
║     Stamp: MOD-2025-0207-004                                ║
║                                                              ║
║  ROLLBACK COMMAND:                                           ║
║  modernizer.rollback d0774784-349a-43cc-ab59-0b4780728417   ║
║                                                              ║
║  Status: PRODUCTION_APPLIED ✅                               ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 8: Check Evolution Status

**Command:**
```
modernizer.evolve target=status
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  📊 EVOLUTION STATUS                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Current Plan: d0774784-349a-43cc-ab59-0b4780728417         ║
║  Status: PRODUCTION_APPLIED                                  ║
║                                                              ║
║  Timeline:                                                   ║
║  • Scan Started:      2025-02-07 11:00:00                   ║
║  • Plan Generated:    2025-02-07 11:02:15                   ║
║  • Shadow Applied:    2025-02-07 11:05:30                   ║
║  • Verification:      2025-02-07 11:20:45                   ║
║  • Production Applied: 2025-02-07 11:25:00                  ║
║                                                              ║
║  BEFORE vs AFTER:                                            ║
║  ┌─────────────────────┬──────────┬──────────┬─────────┐    ║
║  │ Metric              │ Before   │ After    │ Delta   │    ║
║  ├─────────────────────┼──────────┼──────────┼─────────┤    ║
║  │ System Health       │ 94%      │ 97%      │ +3%     │    ║
║  │ Memory Efficiency   │ 78%      │ 88%      │ +10%    │    ║
║  │ CPU Usage           │ 65%      │ 51%      │ -14%    │    ║
║  │ Response Time       │ 120ms    │ 94ms     │ -26ms   │    ║
║  └─────────────────────┴──────────┴──────────┴─────────┘    ║
║                                                              ║
║  Stamps Generated: 4                                         ║
║  Rollback Available: Yes                                     ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Verification Checklist

### SEBA Demo Checklist

| Step | Command | What to Show | Verification |
|------|---------|--------------|--------------|
| 1 | `seba.status` | Current mode, phase, health | Mode shows "governed" |
| 2 | `seba.cycle` | 9 engines running, insights found | Shows engine names and insight counts |
| 3 | `seba.review` | Proposal details with predicted impact | Shows risk, confidence, actions |
| 4 | `seba.approve <id>` | Proposal approved | Status changes to "queued" |
| 5 | `seba.execute <id>` | Execution with progress bar | Shows before/after metrics |
| 6 | `seba.history` | Evolution history | Shows stamps and impacts |

### Modernizer Demo Checklist

| Step | Command | What to Show | Verification |
|------|---------|--------------|--------------|
| 1 | `modernizer.status` | Current state | Shows idle/active |
| 2 | `modernizer.evolve` | Scan + plan generation | Shows Short ID and Full ID |
| 3 | `modernizer.review <id>` | Detailed plan with predictions | Shows file changes and metrics |
| 4 | `modernizer.diff <id>` | Code diffs | Shows exact line changes |
| 5 | `modernizer.evolve target=shadow` | Apply to test env | Shows verification table |
| 6 | `modernizer.evolve target=verify` | Shadow metrics | Shows before/after comparison |
| 7 | `modernizer.evolve target=production` | Production deploy | Shows stamps for each file |
| 8 | `modernizer.evolve target=status` | Final status | Shows complete timeline |

---

## Troubleshooting

### SEBA Shows "0 insights found"

**Cause:** Deduplication filter is blocking insights that match pending/applied proposals.

**Solution:**
1. Check for stale pending proposals: `seba.review`
2. Reject outdated proposals: `seba.reject <proposal_id>`
3. Or check database directly for `evolution_proposals` with status `pending`

### Modernizer Plan ID Not Showing

**Cause:** Terminal was showing truncated IDs.

**Solution:** Updated in v7.5.4 - terminal now shows both:
- Short ID: `d0774784`
- Full ID: `d0774784-349a-43cc-ab59-0b4780728417`

Use the Full ID for all commands.

### Same Proposals Keep Appearing

**Cause:** Fuzzy matching threshold (60%) may not be catching similar proposals.

**Solution:**
1. Check `evolution_proposals` table for similar pending items
2. Either reject or approve the existing proposals
3. The 24-hour cooldown applies to applied proposals

### Shadow Apply Fails Verification

**Cause:** Changes caused regression in metrics.

**Solution:**
1. Run `modernizer.evolve target=status` to see failure reason
2. Run `modernizer.rollback <plan_id>` to revert shadow changes
3. Review the plan and exclude problematic actions

---

## Quick Reference

### SEBA Commands
```
seba.status                    # Check current state
seba.mode                      # Get/set mode (off|observe|advisory|governed)
seba.cycle                     # Run full evolution cycle
seba.review                    # Review pending proposals (shows Full IDs)
seba.approve <id>              # Approve a proposal
seba.reject <id>               # Reject a proposal
seba.execute <id>              # Apply to SHADOW (first step)
seba.execute <id> production   # Apply to PRODUCTION (second step)
seba.rollback <id>             # Rollback an execution
seba.history [limit]           # View evolution history
seba.config                    # View/update configuration
seba.thresholds                # View/update governance thresholds
```

### Modernizer Commands
```
modernizer.status                          # Check current state
modernizer.evolve                          # Run scan, generate plan
modernizer.evolve target=shadow            # Apply to shadow/test
modernizer.evolve target=verify            # Verify shadow results
modernizer.evolve target=production        # Apply to production
modernizer.evolve target=status            # Check evolution status
modernizer.evolve target=abort             # Abort current evolution
modernizer.review <plan_id>                # Review plan details
modernizer.diff <plan_id>                  # View code diffs
modernizer.validate <plan_id>              # Validate plan
modernizer.apply <plan_id>                 # Generic apply
modernizer.applyShadow <plan_id>           # Apply to shadow
modernizer.applyProduction <plan_id>       # Apply to production
modernizer.rollback <plan_id>              # Rollback changes
modernizer.jobs [limit]                    # List recent jobs
modernizer.job <job_id>                    # Get job details
modernizer.applied                         # List applied plans
modernizer.archived                        # List archived functions
```

---

*Document Version: 1.0.0*
*Last Updated: 2025-02-07*
*Author: Substrate Evolution Team*
