# Cascade Governance Policy (Manual-Only Control)

## Core Principles

**Scope**: Cascade may observe, analyze, and propose optimizations. It may NOT execute changes autonomously.

**Review Requirement**: ALL system modifications must pass through manual human approval via `/cascade-governance` admin interface.

**Audit Trail**: Every proposal, review, application, and rollback is logged with full timestamps, reviewer identity, and configuration snapshots.

**Rollback Capability**: One-click rollback restores exact previous configuration state from audit log.

## Governance Workflow

1. **Learning Phase**
   - Cascade observes ecosystem events (Clarity, Verify, Defense, Studio)
   - High-impact events (score ≥ 0.5) trigger pattern analysis
   - System stores observations in `ecosystem_memory` table

2. **Proposal Generation**
   - When significant patterns detected, Cascade drafts proposals
   - Each proposal includes:
     - Target system
     - Summary and rationale
     - Suggested configuration changes
     - Expected impact metrics
     - Confidence score
   - Proposals stored with status='pending'
   - NO automatic application occurs

3. **Manual Review**
   - Admin reviews proposals via `/cascade-governance`
   - Can view full diff, expected impact, and confidence
   - Actions available:
     - Approve: Marks ready for application
     - Reject: Permanently declines proposal
     - View Details: Inspect JSON diffs and rationale

4. **Application Phase**
   - Only APPROVED proposals can be applied
   - Admin clicks "Apply Now" to execute
   - System:
     - Captures current config snapshot (prev_config)
     - Writes audit entry to `system_updates`
     - Updates target system configuration
     - Marks proposal as 'applied'
   - All actions logged with admin identity

5. **Rollback**
   - Locate update in governance history
   - Click "Rollback" → restores prev_config
   - Creates new audit entry with action='rollback'
   - Original proposal marked as 'rolled_back'

## Security Guardrails

- **Manual-Only Flag**: Environment variable `CASCADE_MANUAL_ONLY=true` enforces human-in-loop
- **Rate Limit**: Max 25 proposals per day per system
- **Admin JWT Required**: All mutation endpoints require authenticated admin session
- **No Internal Automation**: Cascade CANNOT call update-config endpoints directly
- **Immutable Audit Log**: All `system_updates` rows are write-once, never deleted

## Data Tables

### ecosystem_memory
Stores all ecosystem events for learning:
- source_system (clarity|verify|defense|studio)
- event_type
- payload (JSON)
- impact_score (0-1)
- created_at

### evolution_proposals
Cascade's suggestions awaiting review:
- target_system
- title, summary
- suggested_change (JSON)
- expected_impact (JSON)
- confidence (0-1)
- status (pending|approved|rejected|applied|rolled_back)
- diffs (JSON preview)
- reviewer, reviewed_at

### system_updates
Audit trail of applied changes:
- proposal_id
- target_system
- action (apply|rollback)
- new_config (JSON)
- prev_config (JSON)
- applied_by (admin identity)
- created_at

## Access Control

- **Read Access**: Admin role required for all governance tables
- **Write Access**: 
  - Service role for `ecosystem_memory` inserts
  - Admin role for proposal reviews and applications
  - Cascade can ONLY insert proposals, never update/apply

## Compliance

- All changes logged with ISO 8601 timestamps
- Reviewer identity captured for accountability
- Configuration snapshots enable full forensic audit
- Rollback capability ensures reversibility within 90 days

## Emergency Procedures

**Disable Cascade Learning**:
```bash
# Set environment flag
CASCADE_MANUAL_ONLY=false

# Block learning endpoint
# Route /pf-cascade-learn returns 503
```

**Full System Rollback**:
1. Identify last known-good update in `system_updates`
2. Restore `prev_config` for each affected system
3. Mark all subsequent proposals as 'rolled_back'
4. Document incident in governance log

**Data Export**:
```sql
-- Export last 90 days of governance activity
COPY (
  SELECT * FROM evolution_proposals 
  WHERE created_at > NOW() - INTERVAL '90 days'
) TO '/exports/proposals.json' WITH (FORMAT json);

COPY (
  SELECT * FROM system_updates 
  WHERE created_at > NOW() - INTERVAL '90 days'
) TO '/exports/updates.json' WITH (FORMAT json);
```

## Monitoring

- Proposal generation rate (target: <25/day)
- Approval rate (track rejection reasons)
- Time-to-review (SLA: 24 hours)
- Rollback frequency (target: <1% of applies)
- System health post-apply (automated alerts)

---

**Policy Owner**: Kenneth Sweet  
**Last Updated**: 2025-01-05  
**Review Cadence**: Quarterly