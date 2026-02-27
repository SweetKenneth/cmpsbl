# Execute Command API

The primary API for executing commands through the Clockless substrate.

## `dispatch()`

```typescript
async function dispatch(
  command: string,          // "namespace.action" format
  args?: Record<string, unknown>,
  options?: DispatchOptions
): Promise<DispatchResult>
```

## Dispatch Options

```typescript
interface DispatchOptions {
  /** Unique trace ID (auto-generated if omitted) */
  traceId?: string;

  /** Timeout override in milliseconds */
  timeout?: number;

  /** Skip governance evaluation (internal calls only) */
  skipGovernance?: boolean;

  /** Execution priority (0 = highest) */
  priority?: number;

  /** Chain context for multi-step operations */
  chainContext?: ChainContext;
}
```

## Dispatch Result

```typescript
interface DispatchResult {
  success: boolean;
  data?: unknown;
  error?: string;
  errorCode?: DispatchErrorCode;
  duration: number;
  stage: DispatchStage;
  traceId: string;
}

type DispatchStage =
  | 'resolved'    // Handler found
  | 'governed'    // Governance evaluated
  | 'executed'    // Handler executed
  | 'failed'      // Execution failed
  | 'rejected';   // Governance rejected

type DispatchErrorCode =
  | 'HANDLER_NOT_FOUND'
  | 'GOVERNANCE_REJECTED'
  | 'BREAKER_OPEN'
  | 'TIMEOUT'
  | 'EXECUTION_ERROR';
```

## Execution Flow

```
1. Parse command → namespace + action
2. Resolve handler from registry
3. Check circuit breaker state
4. Evaluate governance (unless skipGovernance)
5. Execute handler with args and context
6. Record telemetry event
7. Emit RIPPLE event if listeners exist
8. Return DispatchResult
```

## Batch Dispatch

```typescript
async function batchDispatch(
  commands: { command: string; args?: Record<string, unknown> }[],
  options?: { parallel?: boolean; stopOnError?: boolean }
): Promise<DispatchResult[]>
```

Batch dispatch processes multiple commands in sequence (default) or parallel. When `stopOnError` is true, execution halts on the first failure.
