# CMPSBL OS Substrate — SEBA Safety & Governance v2.0.0

**Version 10.1.0 (SEBA 2.0.0) | Full Spectrum Autonomous Evolution**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-076 |
| **Module** | SEBA |
| **Layer** | Administrative |
| **Version** | v10.1.0 (SEBA 2.0.0) |
| **Status** | ACTIVE - Safety Controls Enforced |

---

## 1. SEBA Safety Architecture

### 1.1 Core Safety Principle

**ALL proposals require human approval.** SEBA is designed to PROPOSE improvements, not autonomously apply them.

### 1.2 Safety Controls (v2.1.0)

| Control | Setting | Purpose |
|---------|---------|---------|
| `AUTO_APPROVE_ENABLED` | `false` | All proposals go to `pending` status |
| `MAX_CYCLES_PER_DAY` | 12 | Prevents runaway scanning |
| `MAX_PROPOSALS_PER_DAY` | 20 | Limits proposal generation |
| `COOLDOWN_HOURS` | 2 | Enforces gap between cycles |
| `NEXUS_BUDGET_THRESHOLD` | 50% | Halts if AI budget exceeded |

### 1.3 Cron Status

The automatic hourly cron job (`seba-hourly-cycle`) is **DISABLED by default**. SEBA must be triggered manually.

---

## 2. Governance Modes

| Mode | Behavior | Auto-Apply |
|------|----------|------------|
| `off` | SEBA disabled. No scanning or proposals. | ❌ |
| `observe` | SEBA scans but generates no proposals. | ❌ |
| `advisory` | SEBA generates proposals for review. **DEFAULT** | ❌ |
| `governed` | SEBA can auto-approve LOW-RISK proposals only. | ⚠️ Restricted |

### 2.1 Governed Mode Restrictions

Even in `governed` mode, auto-approval ONLY applies when ALL conditions are met:

| Condition | Requirement |
|-----------|-------------|
| Confidence | `confidence >= 0.85` |
| Risk | `risk_level === 'low' OR 'minimal'` |
| Auto-approve flag | `AUTO_APPROVE_ENABLED === true` |
| No circuit breaker | Circuit must be `closed` |

---

## 3. Proposal Lifecycle

```
INSIGHT → PROPOSAL (pending) → HUMAN REVIEW → approved/rejected
                                    ↓
                               [If approved]
                                    ↓
                              EXECUTE → applied
                                    ↓
                              [If error]
                                    ↓
                              ROLLBACK → rolled_back
```

### 3.1 Proposal Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting human review (default) |
| `approved` | Human approved, ready to execute |
| `rejected` | Human rejected, will not execute |
| `applied` | Successfully executed |
| `rolled_back` | Reverted after error |

---

## 4. Terminal Commands

### 4.1 SEBA Control

| Command | Description |
|---------|-------------|
| `seba.status` | View SEBA health and pending proposals |
| `seba.mode <mode>` | Set mode (off/observe/advisory/governed) |
| `seba.enable` | Enable SEBA in advisory mode |
| `seba.disable` | Disable SEBA completely |

### 4.2 Proposal Management

| Command | Description |
|---------|-------------|
| `seba.review` | List pending proposals with impact previews |
| `seba.approve <id>` | Approve a proposal for execution |
| `seba.reject <id>` | Reject a proposal |
| `seba.execute <id>` | Execute an approved proposal |
| `seba.rollback <id>` | Rollback an applied proposal |

### 4.3 Cycle Control

| Command | Description |
|---------|-------------|
| `seba.cycle` | Trigger a manual SEBA scan cycle |
| `seba.propose` | Generate proposals from current insights |
| `seba.history <limit>` | View recent cycle receipts |

---

## 5. Rollback System

### 5.1 How Rollbacks Work

Every applied proposal creates a `system_updates` record containing:
- `prev_config`: The state before the change
- `new_config`: The state after the change
- `applied_by`: Who approved the change

Rollback restores `prev_config` and marks the proposal as `rolled_back`.

### 5.2 Rollback Limitations

| Scenario | Rollback Support |
|----------|-----------------|
| Config changes | ✅ Full rollback |
| Database schema changes | ⚠️ Requires manual intervention |
| Code changes | ❌ Use git revert instead |

---

## 6. Receipts & Audit Trail

### 6.1 Receipt Contents

Every SEBA cycle generates a receipt stored in `brain_events`:

| Field | Description |
|-------|-------------|
| `cycle_id` | Unique identifier |
| `insights_found` | Number of issues detected |
| `proposals_generated` | Number of proposals created |
| `proposals_pending_review` | Awaiting human approval |
| `scan_summary` | Categories scanned, issues by type |
| `duration_ms` | Cycle execution time |

### 6.2 Viewing Receipts

```
seba.history 10    # Last 10 cycle receipts
seba.receipts      # Detailed receipt view
```

---

## 7. Emergency Procedures

### 7.1 Stop All SEBA Activity

```bash
# Via Terminal
seba.disable

# Via Database (emergency)
UPDATE atlas_capabilities SET enabled = false WHERE key = 'seba_enabled';
UPDATE evolution_proposals SET status = 'rejected' WHERE status IN ('pending', 'approved');
SELECT cron.unschedule('seba-hourly-cycle');
```

### 7.2 Rollback All Applied Changes

```sql
-- Find applied proposals from today
SELECT id, title, created_at FROM evolution_proposals 
WHERE status = 'applied' AND created_at > CURRENT_DATE;

-- Rollback each via terminal
seba.rollback <proposal_id>
```

---

## 8. Changelog

### v2.0.0 (Current)

- 🔬 **9 Analysis Engines** — Extended from 4 to 9 (added Security, Telemetry, Governance, Resources, Architecture)
- 📊 **10 Improvement Categories** — Full spectrum coverage including security hardening, architecture evolution
- 🎯 **Enhanced Insight Types** — Added vulnerability, bottleneck, drift detection
- 📝 **Richer Proposals** — More detailed action mappings for all categories

### v1.1.0

- 🔒 **DISABLED auto-approval by default** (`AUTO_APPROVE_ENABLED = false`)
- 🔒 **Disabled cron job** — SEBA requires manual trigger
- 📉 Reduced daily limits (12 cycles, 20 proposals)
- ⏱️ Increased cooldown to 2 hours
- 📝 All proposals now go to `pending` for human review

### v1.0.0

- ✅ Full cognitive-evolution pipeline
- ✅ 4 core scan engines (Memory, Learning, Imagination, Reasoning)
- ✅ Predicted impact metrics
- ✅ Receipt logging

---

*CMPSBL OS Substrate v10.1.0 — Full Spectrum Autonomous Evolution*
*© 2025-2026 PromptFluid®. All rights reserved.*
