# 11 — Circuit Breaker & Resilience

**Classification:** 🔒 INTERNAL

---

## 1. Purpose

This document describes the substrate's resilience patterns: circuit breakers, dead letter queues, retry budgets, saga orchestration, chaos testing, and self-healing mechanisms.

## 2. Circuit Breaker System

### State Machine

```
CLOSED ──(failures ≥ 3)──▶ OPEN ──(60s timeout)──▶ HALF-OPEN ──(2 successes)──▶ CLOSED
                                                     HALF-OPEN ──(1 failure)──▶ OPEN
```

### Configuration Defaults

| Parameter | Value |
|-----------|-------|
| Failure threshold | 3 consecutive failures |
| Success threshold | 2 successes in half-open |
| Open duration | 60,000ms |
| Half-open max concurrent | 1 |

### Per-Module Isolation

Each module has its own circuit breaker instance. State is tracked per-service identifier. Breaker states are independent — NEXUS opening does not affect DECODE.

### Self-Healing Actions

When a circuit opens, the system automatically:
1. Logs the event with timestamp, module, and error details
2. Attempts a healing action (module-specific)
3. Records the healing action in the healing log
4. After `openDurationMs`, transitions to half-open for probe

### Manual Reset

```typescript
resetCircuit(service: string): void
// Resets consecutive failures, closes circuit, logs action
```

## 3. Dead Letter Queue (DLQ)

### Purpose

Failed deliveries (events, webhooks, messages) that exhaust retry budgets are moved to the DLQ for manual review.

### DLQ Entry Structure

| Field | Description |
|-------|-------------|
| `id` | Unique entry identifier |
| `original_event` | The failed event payload |
| `module` | Source module |
| `failure_reason` | Why delivery failed |
| `retry_count` | Number of attempts made |
| `created_at` | When the entry was created |
| `expires_at` | Auto-cleanup deadline |

### DLQ Operations

| Command | Action |
|---------|--------|
| `ripple.dlq` | List all DLQ items |
| `ripple.dlq.retry { id: "..." }` | Re-attempt delivery |
| `ripple.dlq.discard { id: "..." }` | Remove from DLQ |
| `ripple.dlq.purge` | Remove all expired items |

## 4. Retry Budgets (Token Bucket)

### Purpose

Prevents retry storms by enforcing a budget per module:

```
Each module starts with N tokens per period.
Each retry consumes 1 token.
When tokens = 0, retries are blocked until refill.
```

### Configuration

| Parameter | Default |
|-----------|---------|
| Tokens per period | 10 |
| Period duration | 60 seconds |
| Refill rate | Full refill at period boundary |

## 5. Exponential Backoff with Jitter

All retries use backoff with jitter to prevent thundering herd:

```
delay = min(baseDelay × 2^attempt + random(0, jitterRange), maxDelay)
```

| Parameter | Default |
|-----------|---------|
| Base delay | 1,000ms |
| Max delay | 30,000ms |
| Jitter range | 0–500ms |
| Max attempts | 3 |

## 6. Saga Orchestration

### Purpose

Multi-step transactions with rollback support. If any step fails, all completed steps are compensated.

### Structure

```typescript
interface SagaStep {
  name: string;
  execute: () => Promise<unknown>;
  compensate: () => Promise<void>;
}
```

### Execution Flow

```
Step 1: Execute → Success → Continue
Step 2: Execute → Success → Continue
Step 3: Execute → FAIL
  → Compensate Step 2
  → Compensate Step 1
  → Report failure
```

## 7. Request Coalescing

Deduplicates identical in-flight requests:

```
hash = hash(model + messages + parameters)
if inflight[hash] exists:
  return inflight[hash]  // Caller joins existing promise
else:
  inflight[hash] = execute()
  return inflight[hash]
```

Prevents redundant AI provider calls during burst traffic.

## 8. Tenant-Scoped Isolation

| Isolation Type | Mechanism |
|----------------|-----------|
| Circuit breakers | Per-tenant per-module |
| Rate limits | Per-tenant per-endpoint |
| Concurrency semaphores | Per-tenant caps |
| Failure isolation | Tenant A's failures don't affect Tenant B |

## 9. Chaos Testing

### Purpose

Proactively inject failures to verify resilience:

### Chaos Rules (stored in Control Plane)

| Rule Type | Description |
|-----------|-------------|
| `fail_random` | Random module returns error |
| `delay_response` | Inject latency |
| `drop_event` | RIPPLE drops events silently |
| `corrupt_state` | Inject invalid state values |
| `kill_leader` | Force leader lease expiry |

### Safety

- Chaos testing is disabled by default.
- Requires explicit governor activation.
- Never runs in production without explicit consent.
- All chaos events are logged in AUDIT.

## 10. Subsystem Health Recovery Engine

### Autonomous Recovery Strategies

| Subsystem | Recovery Function | Action |
|-----------|------------------|--------|
| CLM | `healCLM()` | Resets budgets and kill-switches |
| Evolution Mesh | `healEvolutionMesh()` | Flushes stale mutation pipelines |
| Immunity Mesh | `healImmunityMesh()` | Resets OCG capability gates |
| Module (any) | `system.heal { module }` | Module-specific recovery sequence |

### Recovery Sequence

```
1. Detect degraded health (below threshold)
2. Identify recovery strategy for module/subsystem
3. Execute recovery (may include circuit reset, state flush, restart)
4. Wait for health re-check
5. If improved: log recovery, resume normal
6. If not improved: escalate to governor
```

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial resilience documentation |

---

© 2025–2026 PromptFluid®. Confidential.
