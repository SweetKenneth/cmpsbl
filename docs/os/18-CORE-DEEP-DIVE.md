# 18: CORE Deep Dive — The Kernel

**The Scheduler, Lifecycle Manager, and Circuit Breaker**

---

## What is Core?

Think of Core as the **operating system kernel** for the substrate. Just like Windows or macOS manages when programs run and what resources they get, Core manages:

- **When things run** (scheduling)
- **In what order** (lifecycle)
- **What happens when things break** (circuit breakers)

**Plain English:** Core is the traffic cop that makes sure everything runs smoothly and nothing crashes the whole system.

---

## Core Responsibilities

### 1. Boot Sequence

When the substrate starts up, Core ensures modules load in the correct order:

```
Boot Sequence:
1. core://     ← Must be first (it controls everything)
2. ripple://   ← Message bus (others need to communicate)
3. access://   ← Identity (authenticate requests)
4. defense://  ← Security (protect the system)
5. brain://    ← Memory (load knowledge)
6. decode://   ← Interface (accept requests)
7. nexus://    ← AI routing (connect to providers)
8. vision://   ← Monitoring (start observing)
9. dream://    ← Evolution (background processing)
10. system://  ← Administration (final controls)
11. modernizer:// ← Self-upgrade (ready for improvements)
```

**Why This Order Matters:** You can't process AI requests (Nexus) until you can authenticate them (Access). You can't authenticate until the message bus is running (Ripple). And nothing works until the kernel is up (Core).

---

### 2. Job Scheduling

Core lets you schedule jobs to run later:

```typescript
// Run a brain reflection in 5 minutes
await substrate.core.schedule({
  module: 'brain',
  action: 'reflect',
  delay: '5m'
});

// Run a dream cycle at midnight
await substrate.core.schedule({
  module: 'dream',
  action: 'cycle',
  cron: '0 0 * * *'  // Every day at midnight
});
```

**Plain English:** Instead of running everything immediately, you can queue up jobs to run when it makes sense.

---

### 3. Lifecycle Management

Core tracks the state of every module:

| State | Meaning |
|-------|---------|
| `booting` | Starting up |
| `ready` | Fully operational |
| `degraded` | Working but impaired |
| `failed` | Not working |
| `shutdown` | Gracefully stopped |

**Why This Matters:** If Brain is still booting, Decode shouldn't try to query memories yet. Core enforces these dependencies.

---

### 4. Circuit Breakers

When a module fails repeatedly, Core "opens the circuit" to prevent cascading failures:

```
Normal Operation:
Request → Brain → Response ✓

Brain Failing:
Request → Brain → Error ✗
Request → Brain → Error ✗
Request → Brain → Error ✗
                ↓
        [Circuit Opens]
                ↓
Request → [Blocked] → Graceful Fallback

After Recovery:
        [Circuit Closes]
                ↓
Request → Brain → Response ✓
```

**Plain English:** If Brain keeps failing, Core stops sending requests to it (to let it recover) and returns a safe fallback response instead. This prevents one broken module from crashing everything.

---

## Key Actions

### `boot`

Start the substrate. This is called automatically on first request.

```typescript
await substrate.core.boot();
// Returns: { success: true, boot_time_ms: 234, modules_started: 11 }
```

---

### `schedule`

Queue a job to run later.

```typescript
await substrate.core.schedule({
  module: 'brain',
  action: 'dream',
  delay: '1h',           // Run in 1 hour
  payload: { depth: 3 }  // Optional parameters
});
```

Delay formats:
- `30s` — 30 seconds
- `5m` — 5 minutes
- `2h` — 2 hours
- `1d` — 1 day

---

### `lifecycle`

Check or update module lifecycle state.

```typescript
// Check module state
const state = await substrate.core.lifecycle({ module: 'brain' });
// Returns: { module: 'brain', state: 'ready', uptime_ms: 3600000 }

// Force module restart
await substrate.core.lifecycle({ module: 'brain', action: 'restart' });
```

---

### `circuit_open`

Manually open a circuit breaker (block requests to a module).

```typescript
await substrate.core.circuit_open({ 
  module: 'nexus',
  reason: 'Provider API is down for maintenance'
});
```

---

### `circuit_close`

Manually close a circuit breaker (allow requests again).

```typescript
await substrate.core.circuit_close({ module: 'nexus' });
```

---

### `pulse`

Quick health check for the kernel.

```typescript
const pulse = await substrate.core.pulse();
// Returns: { alive: true, version: '4.1.1', uptime_ms: 7200000 }
```

---

## Database Tables

Core uses these tables:

### `core_jobs`
Stores scheduled jobs waiting to run.

| Column | Purpose |
|--------|---------|
| `id` | Job ID |
| `module` | Target module |
| `action` | Action to run |
| `payload` | Parameters |
| `scheduled_for` | When to run |
| `status` | pending/running/completed/failed |

### `core_state`
Tracks module lifecycle states.

| Column | Purpose |
|--------|---------|
| `module` | Module name |
| `state` | Current state |
| `circuit_open` | Is circuit breaker active? |
| `last_heartbeat` | When module last reported healthy |

---

## Circuit Breaker Settings

| Setting | Default | Meaning |
|---------|---------|---------|
| Failure threshold | 5 | Opens after 5 consecutive failures |
| Recovery timeout | 30s | How long to wait before trying again |
| Half-open requests | 1 | Test requests before fully closing |

---

## Terminal Commands

```bash
# Check kernel status
core.pulse

# View scheduled jobs
core.jobs

# Schedule a job
core.schedule brain reflect 5m

# View module lifecycle
core.lifecycle brain

# Open circuit breaker
core.circuit_open nexus "API maintenance"

# Close circuit breaker
core.circuit_close nexus
```

---

## Best Practices

1. **Let Core boot automatically** — Don't call `boot()` manually unless debugging
2. **Use scheduling for expensive operations** — Don't run dream cycles during peak traffic
3. **Trust the circuit breakers** — They protect system stability
4. **Monitor lifecycle states** — A module stuck in "degraded" needs attention

---

## Next Document

→ [19-RIPPLE-DEEP-DIVE.md](./19-RIPPLE-DEEP-DIVE.md) — The Message Bus
