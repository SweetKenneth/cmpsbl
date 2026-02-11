# 02. Evolution Engine (MODERNIZER)

**CMPSBL OS Substrate — Internal Engineering Library**

---

## The Big Secret

The Evolution Engine's power comes from **5-phase safety** and **confidence gating**. The system can propose changes to itself, but it **cannot execute dangerous changes** without human approval.

---

## The 5-Phase Lifecycle

Every evolution follows these phases in exact order:

### Phase 1: SCAN
**Purpose:** Analyze current system state and identify improvement opportunities.

```
Inputs:
- Current health scores
- Recent error patterns
- Performance metrics
- Memory consolidation stats

Outputs:
- List of potential improvements
- Risk assessment for each
- Estimated confidence scores
```

### Phase 2: PLAN
**Purpose:** Create detailed execution plan with rollback strategy.

```
The Normalization Secret:
─────────────────────────
Every proposed action MUST be normalized to a standard format:
{
  action: "UPDATE" | "CREATE" | "DELETE" | "MODIFY",
  target: "table.column" | "config.key" | "module.setting",
  before: <current_value>,
  after: <proposed_value>,
  reversible: true | false
}

If an action cannot be normalized → REJECTED
This prevents ambiguous or dangerous operations.
```

### Phase 3: SHADOW
**Purpose:** Execute changes in isolated test environment.

```
Shadow Environment Rules:
1. Cloned from production state
2. No external API calls allowed
3. No persistent writes
4. Full test suite runs
5. Health delta measured

Success Criteria:
- All tests pass
- Health score >= baseline
- No new errors introduced
```

### Phase 4: APPLY (Production)
**Purpose:** Execute approved changes in production.

```
Apply Safeguards:
1. Backup created BEFORE any changes
2. Changes applied atomically (all or nothing)
3. Real-time health monitoring during apply
4. Automatic rollback if health drops >20 points
```

### Phase 5: VERIFY
**Purpose:** Confirm changes achieved intended outcome.

```
Verification Checks:
1. Health score comparison (before vs after)
2. Error rate comparison (should decrease or stay same)
3. Performance metrics (latency, throughput)
4. Specific goal achievement (what we tried to fix)
```

---

## Confidence Gating

**This is the most important safety mechanism.**

| Confidence Level | What Happens |
|------------------|--------------|
| < 60% | Proposal rejected outright |
| 60-79% | Human approval required (advisory mode) |
| ≥ 80% | Can auto-execute in governed mode |
| 100% | Only for trivial changes (config tweaks) |

### How Confidence Is Calculated

```
confidence = base_confidence 
           × test_pass_rate 
           × (1 - risk_factor)
           × historical_success_rate

Where:
- base_confidence: AI's initial assessment (0.5-0.9)
- test_pass_rate: shadow test results (0-1)
- risk_factor: potential blast radius (0-0.5)
- historical_success_rate: past evolutions (0-1)
```

---

## Autonomy Modes

| Mode | Behavior |
|------|----------|
| **off** | No evolution. System is frozen. |
| **advisory** | System proposes, human approves. |
| **governed** | Auto-execute if confidence ≥ 80% AND risk = low |

### Governed Mode Guardrails

Even in governed mode, these conditions MUST all be true:

1. ✅ `confidence_score >= 80%`
2. ✅ `risk_level === 'low'`
3. ✅ No other evolution currently running
4. ✅ Previous evolution succeeded
5. ✅ Not a fallback proposal
6. ✅ Daily auto-run limit not exceeded

If ANY condition fails → blocked, logged, human notified.

---

## Circuit Breaker

The Evolution Engine has its own circuit breaker:

```
CLOSED (normal) ──[failed production apply]──► OPEN (blocked)
                                                    │
                                            [60s or manual reset]
                                                    │
CLOSED ◄──[2 successes]── HALF-OPEN (testing) ◄────┘
```

When OPEN: **No evolutions can run.** Period.

---

## Evolution Receipts

Every evolution creates a permanent receipt:

```
Receipt Fields:
- run_id: Full UUID (never truncated)
- phase: Final phase reached
- confidence_score: Calculated confidence
- risk_level: low/medium/high
- tests_run: Number of tests executed
- tests_passed: Number passed
- health_before: Starting health
- health_after: Ending health
- backup_id: Pre-evolution backup reference
- timestamp: When completed
- initiated_by: system or human
```

**Security:** Receipts show WHAT happened, never HOW (no code diffs, no payloads).

---

## Proposal Persistence (SEBA Integration)

**The Secret:** Proposals are no longer ephemeral. They persist to database.

### Storage Flow

```
SEBA.propose() 
    │
    ▼
┌─────────────────────────────┐
│   ProposalStore.save()      │
│   → evolution_proposals     │
│   → status: 'pending'       │
└─────────────────────────────┘
    │
    ▼
Atlas / Terminal can query pending proposals
    │
    ▼
Human or auto-approval → status: 'approved'
    │
    ▼
Execution → status: 'executed'
    │
    ▼
Verification → status: 'verified'
```

### Why This Matters

- Proposals survive system restarts
- Atlas can display proposals for review
- Terminal `seba.review` shows real database data
- Full audit trail from insight → proposal → execution

---

## Evolution Stamps (Traceability)

**The Big Secret:** We can PROVE the substrate rewrites its own code.

### What Is A Stamp?

Every code change by SEBA generates a cryptographic stamp:

```typescript
{
  stamp_id: "SEBA-abc123-def456",  // Unique identifier
  proposal_id: "SEBA-001",         // Source proposal
  execution_id: "exec-789",        // Execution record
  files_modified: ["src/lib/substrate/brain/memory-core.ts"],
  change_hash: "sha256:abcd1234...",  // Cryptographic proof
  applied_at: "2026-02-02T12:00:00Z",
  applied_by: "seba"               // Not human
}
```

### Mandatory Code Comments

**THIS IS NOT OPTIONAL.** When SEBA modifies code, it MUST insert:

```typescript
// [SEBA-EVOLUTION] stamp_id: SEBA-abc123-def456 | proposal: SEBA-001 | applied: 2026-02-02T12:00:00Z
```

### Why Mandatory?

1. **Audit trail** — Every change is traceable
2. **Proof of self-modification** — The substrate isn't just optimizing, it's REWRITING
3. **Integrity verification** — Removing comments triggers alerts
4. **Investor demonstration** — Observable evidence of self-evolution

### Verification Chain

```
Code file contains [SEBA-EVOLUTION] comment
    │
    ▼
Parse stamp_id from comment
    │
    ▼
Query brain_events for matching stamp
    │
    ▼
Compare change_hash with actual file hash
    │
    ▼
If match → VERIFIED ✅
If mismatch → INTEGRITY ALERT 🚨
```

### Storage

Stamps are logged to `brain_events`:

```json
{
  "module": "seba",
  "event_type": "evolution_stamp",
  "data": { ...stamp },
  "outcome": "success"
}
```

### Terminal Commands

```bash
seba.stamps                    # List recent stamps
seba.stamp SEBA-abc123-def456  # View stamp details
seba.verify SEBA-abc123-def456 # Verify integrity
seba.stamps --file <path>      # Stamps for specific file
```

---

## v8.5.0 Infrastructure Integration

### Rollback Snapshots
- **Location:** `src/lib/substrate/rollback-snapshots/`
- **Purpose:** Full system state capture before evolutions — makes growth "trustworthy rather than scary"
- **Functions:** `captureSnapshot()`, `restoreSnapshot()`, `listSnapshots()`
- **Tier:** Enterprise (self-improvement)
- **Integration:** Automatically invoked before Phase 4 (APPLY) to enable instant rollback

### Evolution A/B Testing
- **Location:** `src/lib/substrate/evolution-ab/`
- **Purpose:** Parallel evolution variant testing with statistical comparison
- **Functions:** `createVariant()`, `compareVariants()`, `promoteWinner()`
- **Tier:** Enterprise (self-improvement)

---

*CMPSBL OS Substrate v8.5.0 — SYNERGY+ Epoch — Internal Engineering Library*
*© 2025-2026 PromptFluid®. All rights reserved.*
