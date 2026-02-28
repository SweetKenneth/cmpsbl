# DEFENSE — Containment Shell Node

## Purpose
DEFENSE is the outermost containment boundary. It handles threat detection, behavioral analysis, site guarding, circuit breaker coordination, and incident response automation.

## Namespace
`defense.*`

## Command Examples
```
defense.scan              # Run threat surface scan
defense.threats           # Active threat summary
defense.breakers          # All circuit breaker states
defense.block <pattern>   # Block a request pattern
defense.incidents         # Recent incident log
defense.hardening         # Hardening posture report
```

## Response Shape
```typescript
interface ThreatScanResult {
  success: boolean;
  threats: ThreatEntry[];
  riskScore: number;
  recommendations: string[];
  scanDuration: number;
}
```

## Failure Modes
- **Scanner timeout**: Threat scan exceeds time budget → partial results returned
- **False positive flood**: Behavioral analysis over-triggers → threshold auto-adjustment
- **Breaker cascade**: Multiple nodes trip simultaneously → coordinated recovery via CORE

## Governance Implications
- DEFENSE wraps all outbound paths — it is the last layer before external communication
- Threat blocking is an immediately enforced operation (no governance delay)
- Incident response actions beyond blocking require governance approval
