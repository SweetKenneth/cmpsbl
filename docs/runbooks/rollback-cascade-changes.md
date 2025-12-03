# Rollback Runbook: Cascade Changes

## Quick Reference

**When to Use**: After applying a Cascade proposal that causes unexpected behavior or degrades system performance.

**Time to Rollback**: <5 minutes for single-system changes

**Prerequisites**: 
- Admin access to `/cascade-governance`
- Target system access
- Original `system_updates` record

## Step-by-Step Rollback

### 1. Identify the Change

Navigate to `/cascade-governance` → History tab

Look for the most recent applied proposal affecting the problematic system:
- Check `target_system` column
- Filter by `status='applied'`
- Sort by `created_at` descending

Note the `proposal_id` and `update_id`.

### 2. Verify Pre-Change State

Click on the update entry to view:
- `prev_config`: Configuration before change
- `new_config`: Configuration after change
- `applied_by`: Who approved/applied
- `created_at`: When change was applied

Confirm this is the change causing issues.

### 3. Execute Rollback

Option A: **UI Rollback** (Recommended)
1. Click "Rollback" button on the update entry
2. Confirm in dialog: "Restore previous configuration?"
3. System automatically:
   - Calls `/pf-cascade-apply` with `action='rollback'`
   - Restores `prev_config` to target system
   - Creates new audit entry
   - Marks original proposal as 'rolled_back'

Option B: **API Rollback**
```bash
curl -X POST https://[project-url]/functions/v1/pf-cascade-apply \
  -H "Authorization: Bearer [admin-jwt]" \
  -H "Content-Type: application/json" \
  -d '{
    "proposal_id": "[proposal-uuid]",
    "action": "rollback",
    "applied_by": "Kenneth Sweet"
  }'
```

### 4. Verify Restoration

Check target system health:

**For Clarity**:
- Run test scan on known domain
- Verify issue count matches pre-change baseline
- Check scan completion time

**For Verify**:
- Review active linting rules
- Test with sample codebase
- Confirm detection accuracy

**For Defense**:
- Check threat detection thresholds
- Review recent event logs
- Verify block/allow rates

**For Studio**:
- Test rebuild on sample project
- Verify build time
- Check artifact quality

### 5. Document & Notify

1. Add comment to the update record:
   - Reason for rollback
   - Observed symptoms
   - Verification results

2. Update governance log:
```markdown
## Rollback Event: [YYYY-MM-DD HH:MM UTC]

**Proposal**: [Title]  
**Target System**: [clarity|verify|defense|studio]  
**Applied At**: [timestamp]  
**Rolled Back At**: [timestamp]  
**Rolled Back By**: Kenneth Sweet

**Reason**: [Brief description of issue]

**Symptoms Observed**:
- [Issue 1]
- [Issue 2]

**Verification**:
- [x] System health restored
- [x] Metrics returned to baseline
- [x] No side effects detected

**Follow-up Actions**:
- [ ] Review proposal rationale
- [ ] Update learning patterns
- [ ] Add test case for this scenario
```

3. Notify Cascade:
```bash
curl -X POST https://[project-url]/functions/v1/pf-brain-learn \
  -H "Authorization: Bearer [service-role-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "observation": "Proposal [id] rolled back due to [issue]",
    "outcome": {
      "success": false,
      "reason": "[description]"
    },
    "context": {
      "proposal_id": "[uuid]",
      "target_system": "[system]",
      "rollback_time": "[timestamp]"
    }
  }'
```

This teaches Cascade to avoid similar proposals in the future.

## Troubleshooting

### Rollback Fails

**Symptom**: `/pf-cascade-apply` returns error  
**Cause**: Missing `prev_config` or invalid state

**Solution**:
1. Manually fetch last known-good config from backup
2. Apply directly to target system's config endpoint
3. Create manual audit entry:
```sql
INSERT INTO system_updates (
  proposal_id,
  target_system,
  action,
  new_config,
  prev_config,
  applied_by
) VALUES (
  '[proposal-uuid]',
  '[system]',
  'manual_rollback',
  '[current-broken-config]'::jsonb,
  '[restored-config]'::jsonb,
  'Kenneth Sweet (manual)'
);
```

### Partial Rollback Needed

**Symptom**: Only some changes need reverting  
**Cause**: Proposal contained multiple config updates

**Solution**:
1. Export `prev_config` JSON
2. Manually edit to create hybrid config
3. Apply via target system's endpoint
4. Document as "partial rollback" in governance log

### Rollback Causes New Issues

**Symptom**: System degrades after restoring previous config  
**Cause**: Environment changed since original config (dependencies, data, etc.)

**Solution**:
1. Immediately re-rollback (back to "broken" state)
2. Assess what changed in environment:
   - Data volume increase?
   - New dependencies?
   - Upstream API changes?
3. Create hybrid config addressing both issues
4. Test in staging before applying to production
5. Document as "environment drift incident"

## Prevention

To reduce rollback likelihood:

1. **Staged Rollout**: Apply proposals to canary instance first
2. **Monitoring Window**: Wait 24 hours before marking applied proposals as "stable"
3. **Confidence Threshold**: Only auto-generate proposals with confidence >0.8
4. **Human Review**: Flag proposals affecting >3 config parameters for extended review
5. **Test Suite**: Run automated tests against proposed config before approval

## Emergency Contacts

- **Kenneth Sweet**: kenneth@promptfluid.com (immediate escalation)
- **System Health Dashboard**: `/cascade-governance` (real-time metrics)
- **Audit Trail**: `system_updates` table (forensic analysis)

---

**Last Updated**: 2025-01-05  
**Runbook Owner**: Kenneth Sweet