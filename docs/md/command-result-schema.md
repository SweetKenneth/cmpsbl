# Command Result Schema

Every command executed through the Clockless Engine Bus returns a standardized `CommandResult` object.

## Schema

```typescript
interface CommandResult {
  /** Whether the command executed successfully */
  success: boolean;

  /** Result payload (shape varies by command) */
  data?: unknown;

  /** Error message if success is false */
  error?: string;

  /** Error code for programmatic handling */
  errorCode?: string;

  /** Execution duration in milliseconds */
  duration: number;

  /** Source module that handled the command */
  source: string;

  /** Unique trace identifier for this execution */
  traceId: string;

  /** Timestamp of execution */
  timestamp: string;

  /** Whether a fallback handler was used */
  fallbackUsed?: boolean;

  /** Governance evaluation result (if applicable) */
  governanceResult?: {
    approved: boolean;
    reason?: string;
    policyId?: string;
  };
}
```

## Conventions

1. **`success: true`** — Command completed as expected. `data` contains the result.
2. **`success: false`** — Command failed. `error` and optionally `errorCode` describe the failure.
3. **`duration`** — Always populated. Measured from Engine Bus dispatch to handler return.
4. **`traceId`** — Always populated. Used for correlation across RIPPLE events and AUDIT entries.
5. **`source`** — The module namespace that handled the command (e.g., `"memory"`, `"nexus"`).

## Error Codes

| Code | Meaning |
|------|---------|
| `HANDLER_NOT_FOUND` | No handler registered for this command |
| `GOVERNANCE_REJECTED` | Command blocked by governance policy |
| `BREAKER_OPEN` | Target node circuit breaker is open |
| `QUOTA_EXCEEDED` | Usage quota exceeded |
| `TIMEOUT` | Handler execution exceeded time budget |
| `VALIDATION_FAILED` | Input validation failed |
| `UNAUTHORIZED` | Insufficient entitlements |
