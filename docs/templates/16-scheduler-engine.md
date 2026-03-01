# 16 — Scheduler Engine

> **Module:** BRAIK | **Source:** `src/crownjewels/s-tier/019-scheduler-engine.ts`

Deferred execution engine with interval scheduling, retry with exponential backoff, dead-letter queue, priority ordering, concurrency control, and execution telemetry.

## Quick Start

```typescript
import { createScheduler } from './scheduler-engine';

const scheduler = createScheduler({
  maxConcurrency: 5,
  defaultMaxAttempts: 3,
  onDeadLetter: (job) => console.error(`Dead-lettered: ${job.name}`, job.lastError),
});

// Register handlers
scheduler.registerHandler('send_email', async (payload) => {
  await sendgrid.send(payload);
});

scheduler.registerHandler('generate_report', async (payload) => {
  return await buildReport(payload.reportId);
});

// Schedule jobs
scheduler.schedule('send_email', { to: 'user@example.com', subject: 'Welcome' });

// Delayed execution
scheduler.schedule('generate_report', { reportId: '42' }, { delay: 60_000 });

// Recurring job
scheduler.schedule('cleanup', {}, {
  recurring: { intervalMs: 3_600_000, maxRuns: 24 },
  priority: 1,
});

// Process queue (call in your event loop)
setInterval(() => scheduler.tick(), 1000);

// Retry dead-lettered jobs
scheduler.retryDeadLetter('job_123');
```

## API Reference

| Method | Description |
|--------|-------------|
| `registerHandler(name, fn)` | Register an executor for a job type |
| `schedule(name, payload, opts?)` | Queue a job (immediate, delayed, or recurring) |
| `cancel(jobId)` | Cancel a pending job |
| `tick()` | Process ready jobs (call periodically) |
| `retryDeadLetter(jobId)` | Re-queue a dead-lettered job |
| `getStats()` | Queue depth, completion rates, dead-letter count |
| `queue` | Read-only access to current queue |
| `deadLetter` | Read-only access to dead-letter queue |

## Use Cases

- **Background processing** — Offload heavy work from request handlers
- **Email campaigns** — Schedule and retry email delivery
- **Report generation** — Deferred compute with priority ordering
- **Recurring maintenance** — Periodic cleanup, health checks, sync tasks
