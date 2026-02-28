# SEBA — Self-Evolving Bounded Agent

## Purpose
SEBA is the autonomous evolution engine. It analyzes the substrate, generates improvement proposals, validates them through governance, and executes approved changes — all within bounded safety constraints.

## Namespace
`seba.*`

## Command Examples
```
seba.status               # Current SEBA state and mode
seba.analyze              # Run cognitive analysis
seba.proposals            # List generated proposals
seba.approve <id>         # Approve a proposal
seba.execute <id>         # Execute approved proposal
seba.audit                # SEBA audit trail
seba.config               # SEBA configuration
```

## Phases
| Phase | Description |
|-------|-------------|
| `idle` | Waiting for trigger or schedule |
| `analyzing` | Scanning substrate for improvement opportunities |
| `proposing` | Generating improvement proposals |
| `validating` | Running proposals through governance gate |
| `executing` | Applying approved changes |
| `verifying` | Confirming changes produce expected results |

## Response Shape
```typescript
interface SEBACycleResult {
  phase: SEBAPhase;
  proposals: ImprovementProposal[];
  decisions: GovernanceDecision[];
  executions: EvolutionExecution[];
  auditEntries: SEBAAuditEntry[];
  duration: number;
}
```

## Failure Modes
- **Governance rejection**: Proposal fails governance gate → logged and deferred
- **Execution rollback**: Applied change produces negative results → automatic rollback
- **Safety boundary breach**: SEBA attempts operation outside its bounded scope → hard stop

## Governance Implications
- SEBA is the most heavily governed subsystem in the substrate
- Every proposal, decision, and execution is immutably audited
- Risk levels (low/medium/high) determine required approval thresholds
- SEBA cannot modify its own governance constraints
