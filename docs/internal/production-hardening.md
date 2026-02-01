# Production Hardening Guide
## v7.0.0 — The "Don't Die in Prod" Layer

This document describes the production hardening infrastructure implemented across the substrate.

---

## 1. Error Handling

### AppError Shape
All errors in the substrate follow a standardized shape:

```typescript
interface AppError {
  code: ErrorCode;           // Machine-readable error type
  message: string;           // Developer-facing message
  safe_message: string;      // User-facing message (no secrets)
  trace_id: string;          // Correlation ID for debugging
  meta_redacted: Record<string, unknown>;  // Redacted metadata
  retryable: boolean;        // Whether retry is safe
  timestamp: string;         // ISO timestamp
}
```

### Error Codes
- `NETWORK_ERROR` - Connection failures
- `TIMEOUT_ERROR` - Request timeouts
- `AUTH_ERROR` - Authentication issues
- `VALIDATION_ERROR` - Invalid input
- `RATE_LIMITED` - Too many requests
- `CIRCUIT_OPEN` - Service degraded
- `GOVERNANCE_BLOCKED` - Policy blocked
- `MODULE_ERROR` - Module operation failed

### Usage
```typescript
import { createAppError, fromError, isRetryableError } from '@/lib/system/errors';

// Create a new error
const error = createAppError('VALIDATION_ERROR', 'Invalid email format', { field: 'email' });

// Convert unknown errors
const appError = fromError(caughtError, 'UNKNOWN_ERROR', traceId);

// Check if retryable
if (isRetryableError(error)) {
  // Safe to retry
}
```

---

## 2. Retry Policy

The substrate uses exponential backoff with jitter for transient failures.

### Configuration
```typescript
interface RetryConfig {
  maxAttempts: number;      // Default: 3
  baseDelayMs: number;      // Default: 1000ms
  maxDelayMs: number;       // Default: 30000ms
  jitterFactor: number;     // Default: 0.3
}
```

### Presets
- `RetryPresets.fast` - 2 attempts, 500ms base
- `RetryPresets.standard` - 3 attempts, 1s base
- `RetryPresets.patient` - 5 attempts, 2s base
- `RetryPresets.critical` - 10 attempts, 500ms base

### Usage
```typescript
import { withRetry, RetryPresets } from '@/lib/system/retry';

const result = await withRetry(
  () => fetchData(),
  RetryPresets.standard,
  traceId
);
```

---

## 3. Request Tracing

Every operation gets a unique trace ID for end-to-end debugging.

### Trace ID Format
```
pf-{timestamp_base36}-{random_hex}
Example: pf-2k3j4m5-a8b9c0d1
```

### Usage
```typescript
import { generateTraceId, withTrace } from '@/lib/system/trace';

const traceId = generateTraceId();

// Or use the wrapper
const result = await withTrace('brain', 'processMemory', async (ctx) => {
  console.log('Trace:', ctx.trace_id);
  return doWork();
});
```

---

## 4. Secret Redaction

All logs, errors, and UI outputs are automatically redacted.

### Redacted Patterns
- Environment keys: `OPENAI_*`, `GROQ_*`, `SUPABASE_*`, `STRIPE_*`, etc.
- JWT tokens
- API keys with prefixes: `sk-`, `pk-`, `clf-`, etc.
- Authorization headers
- Cookies and session data

### Usage
```typescript
import { redactSecrets, redactHeaders, redactUrl } from '@/lib/defense/redact';

const safeData = redactSecrets({ apiKey: 'sk-secret123', name: 'John' });
// { apiKey: '[REDACTED]', name: 'John' }

const safeHeaders = redactHeaders({ authorization: 'Bearer xyz' });
// { authorization: '[REDACTED]' }

const safeUrl = redactUrl('https://api.com?token=secret');
// https://api.com?token=[REDACTED]
```

---

## 5. Event Emission

All module actions emit events to `brain_events` for observability.

### Event Shape
```typescript
interface SubstrateEvent {
  module: string;            // Module name
  event_type: string;        // action.started / action.succeeded / action.failed
  outcome: EventOutcome;     // started | succeeded | failed | skipped
  message?: string;          // Optional message
  trace_id: string;          // Correlation ID
  data?: Record<string, unknown>;  // Redacted metadata
}
```

### Usage
```typescript
import { emitStarted, emitSucceeded, emitFailed } from '@/lib/substrate/events';

// Start of operation
await emitStarted('brain', 'processMemory', { memoryId: '123' }, traceId);

// On success
await emitSucceeded('brain', 'processMemory', { result: 'ok' }, traceId);

// On failure
await emitFailed('brain', 'processMemory', 'Connection timeout', {}, traceId);
```

---

## 6. Governance Gate

All actions pass through the capability gate for governance checks.

### Checks Performed
1. Module enabled status
2. Circuit breaker state
3. Rate limits
4. Approval requirements (in governed mode)

### Execution Modes
- `manual` - User-initiated, no automation
- `advisory` - Suggestions only, user confirms
- `governed` - Dry-run preview + confirm gate
- `emergency` - Bypass for critical operations

### Usage
```typescript
import { executeWithGate, checkGate } from '@/lib/atlas/capability-gate';

// Check if action would be allowed
const gateResult = await checkGate({
  module: 'brain',
  action: 'pruneMemories',
  dryRun: true,
});

// Execute with full governance
const result = await executeWithGate(
  { module: 'brain', action: 'pruneMemories', payload: { threshold: 0.5 } },
  async (traceId) => {
    return await brain.pruneMemories(0.5);
  }
);
```

---

## 7. Circuit Breakers

Per-module failure isolation prevents cascading failures.

### States
- `closed` - Normal operation
- `open` - Failing, requests rejected
- `half_open` - Trial period for recovery

### Configuration
```typescript
interface CircuitConfig {
  failureThreshold: number;     // Failures before opening (default: 5)
  successThreshold: number;     // Successes to close (default: 3)
  timeoutMs: number;            // Request timeout (default: 30s)
  resetTimeoutMs: number;       // Time before half-open (default: 60s)
}
```

### Usage
```typescript
import { circuitBreaker } from '@/lib/defense/circuit-breaker';

const result = await circuitBreaker.execute(
  'nexus',
  () => callNexusAPI(),
  () => fallbackResponse() // Optional fallback
);
```

---

## 8. Terminal Execution

All terminal commands go through the governed execution wrapper.

### Features
- Automatic trace ID generation
- Dry-run by default in governed mode
- Output redaction
- Uniform error handling
- Event emission

### Usage
```typescript
import { executeCommand, dryRunCommand } from '@/lib/terminal/execute';

// Dry run first
const preview = await dryRunCommand('brain.prune', { threshold: 0.5 });

// Then execute
const result = await executeCommand('brain.prune', { threshold: 0.5 }, { skipApproval: true });
```

---

## 9. Caching

Safe caching for read-heavy widgets with TTL and invalidation.

### TTL Presets
- `CacheTTL.SHORT` - 5 seconds
- `CacheTTL.MEDIUM` - 30 seconds
- `CacheTTL.LONG` - 2 minutes
- `CacheTTL.EXTENDED` - 5 minutes

### Usage
```typescript
import { cacheManager, withCache, CacheTTL } from '@/lib/system/cache';

// Direct cache access
cacheManager.set('key', data, CacheTTL.SHORT);
const cached = cacheManager.get<MyType>('key');

// Wrap async function
const cachedFetch = withCache(
  fetchData,
  (id) => `data:${id}`,
  CacheTTL.MEDIUM
);
```

---

## 10. Rate Limiting

Client-side rate limiting for sensitive operations.

### Presets
- `RateLimitPresets.GOVERNOR` - 10/minute
- `RateLimitPresets.ENCODED` - 5/minute
- `RateLimitPresets.SEBA` - 20/hour
- `RateLimitPresets.TERMINAL` - 30/minute

### Usage
```typescript
import { enforceRateLimit, RateLimitPresets } from '@/lib/system/rateLimit';

try {
  enforceRateLimit('encoded:generate', RateLimitPresets.ENCODED);
  // Proceed with operation
} catch (error) {
  // Rate limited, show user feedback
}
```

---

## Validation Checklist

Before deploying, verify:

- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds
- [ ] Audit widget shows live events within 5-10 seconds
- [ ] Terminal commands emit events
- [ ] No secrets appear in console logs
- [ ] Errors show safe_message + trace_id
- [ ] Circuit breakers recover after failures
- [ ] Rate limits are enforced
