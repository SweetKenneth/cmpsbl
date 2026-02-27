# GOVERNANCE — Policy Enforcement Plane

## Purpose
GOVERNANCE is the supervisory overlay plane that enforces policies, manages vetoes, validates state transitions, audits compliance, and detects governance drift across the entire substrate.

## Namespace
`governance.*`

## Command Examples
```
governance.audit           # Run compliance audit
governance.vetoes          # Active veto list
governance.transitions     # Pending transition approvals
governance.drift           # Drift analysis report
governance.compliance      # Compliance score and trend
governance.policy <action> # Evaluate action against policies
```

## Response Shape
```typescript
interface ComplianceReport {
  score: number;
  violations: ComplianceViolation[];
  trend: number[];
  driftSignals: DriftSignal[];
  timestamp: string;
}
```

## Failure Modes
- **Policy evaluation timeout**: Complex policy chain exceeds budget → default-deny
- **Quorum failure**: Insufficient approvals for transition → transition blocked indefinitely
- **Drift accumulation**: Gradual governance state changes undetected → window-based drift detector catches

## Governance Implications
- GOVERNANCE is self-referential — its own operations are subject to governance evaluation
- Policy changes require elevated approval (meta-governance)
- All governance decisions are immutably recorded in AUDIT
