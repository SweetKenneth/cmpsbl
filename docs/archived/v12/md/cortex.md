# CORTEX — Autonomous Orchestrator Node

## Purpose
CORTEX handles multi-agent coordination, task decomposition, goal alignment validation, execution priority balancing, and autonomous workflow orchestration.

## Namespace
`cortex.*`

## Command Examples
```
cortex.orchestrate <goal>  # Decompose and orchestrate a goal
cortex.agents              # Active agent status
cortex.tasks               # Task queue overview
cortex.priorities          # Current priority rankings
cortex.delegate <task>     # Delegate task to optimal agent
```

## Response Shape
```typescript
interface OrchestrationResult {
  success: boolean;
  tasks: DecomposedTask[];
  delegations: Delegation[];
  completionEstimate: number;
  governanceApproval: boolean;
}
```

## Failure Modes
- **Decomposition failure**: Goal too ambiguous to decompose → clarification request
- **Agent contention**: Multiple tasks compete for same agent → priority-based resolution
- **Goal misalignment**: Decomposed tasks drift from original goal → alignment validation rejects

## Governance Implications
- Autonomous task execution requires governance pre-approval for high-risk operations
- Agent delegations are audited with full context
- CORTEX cannot bypass governance for any external-facing operation
