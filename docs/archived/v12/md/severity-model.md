# Severity Model

Clockless uses a four-level severity model across all subsystems: diligence harness, governance, telemetry, and incident management.

## Severity Levels

| Level | Impact | Response | Auto-Remediation |
|-------|--------|----------|-----------------|
| **CRITICAL** | System cannot operate safely | Immediate halt + alert | No — requires manual intervention |
| **ERROR** | Functionality degraded | Breaker transition + remediation attempt | Yes — within bounded scope |
| **WARNING** | Potential issue detected | Log + monitor + threshold watch | No — monitoring only |
| **INFO** | Informational observation | Log only | N/A |

## CRITICAL Triggers

A CRITICAL severity is raised when:

- CORE node circuit breaker opens
- Matrix integrity operational score drops below 40
- Weight sum drifts more than 5% from 1.0
- Governance bypass detected (should be impossible)
- Multiple ERROR-level failures cascade within a time window

## ERROR Triggers

ERROR severity indicates degraded functionality:

- Node handler missing or unresponsive
- Cross-module dispatch failure
- State corruption detected
- Provider outage (all fallbacks exhausted)
- Governance evaluation timeout (default-deny applied)

## WARNING Triggers

WARNING severity indicates potential issues:

- Handler response time approaching timeout threshold
- Quota usage above 80% of allocation
- Minor governance drift detected
- Breaker in `half-open` state for extended period
- Memory tier approaching capacity

## Severity in Governance

Governance decisions carry severity metadata:

```typescript
interface GovernanceDecision {
  approved: boolean;
  severity: 'critical' | 'error' | 'warning' | 'info';
  reason: string;
  policyId: string;
  escalated: boolean;
}
```

When governance rejects an operation at CRITICAL severity, the rejection is:
1. Immutably logged in AUDIT
2. Broadcast via RIPPLE to all subscribers
3. Escalated to the veto authority for review
