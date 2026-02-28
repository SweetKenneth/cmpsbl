# CORE — Kernel Node

## Purpose
CORE is the kernel orchestrator and boot authority. It establishes the handler registry, manages the boot sequence, and serves as the root of the Spine topology.

## Namespace
`core.*`

## Command Examples
```
core.status          # Runtime status summary
core.boot            # Trigger cold boot sequence
core.health          # Matrix integrity check
core.breaker <node>  # Query breaker state for a node
core.dispatch <cmd>  # Manual command dispatch via Engine Bus
```

## Response Shape
```typescript
interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
  source: string;       // "core"
  traceId: string;
}
```

## Failure Modes
- **Boot failure**: Handler registry cannot initialize → system enters CRITICAL state
- **Weight drift**: Node weight sum deviates from 1.0 → structural integrity warning
- **Dispatch timeout**: Engine Bus dispatch exceeds timeout threshold → circuit breaker transition

## Governance Implications
- CORE breaker opening triggers system-wide CRITICAL status regardless of other node health
- CORE is the only node that cannot be rerouted — it has no backup handler
- All boot-time registrations are audited
