# CMPSBL® Quick Start — Express API Example

> From zero to governed in 4 lines.

---

## Before (unprotected)

```ts
import express from 'express';
import * as handlers from './handlers';

const app = express();

app.get('/users', handlers.getUsers);
app.post('/users', handlers.createUser);
app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(3000);
```

**What you have:** a working API.

**What you don't have:**
- Runtime verification
- Activation coverage
- Behavioral enforcement
- Proof your code is doing what it claims

---

## After (governed)

```ts
import express from 'express';
import { init } from '@cmpsbl/runtime';
import * as handlers from './handlers';
import { readFileSync } from 'fs';

const app = express();
const source = readFileSync('./handlers.ts', 'utf-8');

// One call — Ascension wraps every export with verification
const session = init(handlers, source, { name: 'api-handlers' });

// Drop-in replacement — same signatures
app.get('/users', session.exports.getUsers);
app.post('/users', session.exports.createUser);

// Authoritative system health (activation + runtime)
app.get('/health', (_, res) => res.json(session.healthCheck()));

// Quick-glance status for dashboards
app.get('/status', (_, res) => res.json(session.status()));

app.listen(3000);
```

> No changes to your original code. Same behavior, now governed.
> No framework changes. No rewrites. No lock-in.

---

## What changed

- `handlers.getUsers` → `session.exports.getUsers` (drop-in, no refactor)
- `/health` becomes authoritative — reflects real activation + runtime state
- `/status` returns `{ health, coverage, fingerprint }` in one call
- Every function call is evaluated and enforced against its behavioral contract

---

## /health response

`session.healthCheck()` is **session-scoped** — it reads from this artifact's data, not global state. Safe for any deployment pattern. This endpoint is safe to use in multi-instance or multi-tenant environments.

```json
{
  "status": "healthy",
  "artifact": "a3f8c1d2",
  "fingerprint": "a3f8c1d2",
  "environment": "node",
  "uptime": 12345,
  "verification": {
    "artifactFingerprint": "a3f8c1d2",
    "totalEvents": 12,
    "byKind": {
      "attachment_applied": 4,
      "activation_wrapped": 4,
      "proof_generated": 1,
      "integrity_check": 1,
      "fingerprint_bound": 1,
      "scan_completed": 1
    },
    "enforcements": 4,
    "anomalies": 0
  },
  "timestamp": "2026-04-12T08:30:00.000Z"
}
```

> → This is not a heartbeat — it's a live report of what your system is actually doing.

---

## /status response

```json
{
  "health": "healthy",
  "coverage": 0.92,
  "fingerprint": "a3f8c1d2",
  "identity": {
    "manifestHash": 2918437651,
    "attachmentHash": 1047293821,
    "composite": "a3f8c1d2",
    "computedAt": 1744444200000
  }
}
```

> `identity` gives advanced users full traceability without extra calls. `fingerprint` is always a string — never null.

Use `/status` for dashboards, alerts, or deployment gates.

---

## Verification Report

```
═══ CMPSBL® Verification Report (Runtime Proof) ═══

Artifact: a3f8c1d2
Events:   12 total

  attachment_applied   4
  activation_wrapped   4
  proof_generated      1
  integrity_check      1
  fingerprint_bound    1
  scan_completed       1

Enforcements: 4
Anomalies:    0

Status: HEALTHY
═══════════════════════════════════════
```

---

## What each signal means

| Signal | Meaning |
|--------|---------|
| `coverage: 0.92` | 92% of detected function boundaries are wrapped and verified |
| `anomalies: 0` | No runtime contract violations detected |
| `enforcements: 4` | 4 behaviors actively enforcing (not just observing) |
| `fingerprint` | Identity hash — proves artifact integrity |
| `identity` | Full traceability: manifest hash, attachment hash, composite, timestamp |
| `health: healthy` | Coverage ≥ 80% and zero anomalies |

---

## Health states

| Status | Meaning | Action |
|--------|---------|--------|
| `healthy` | Coverage ≥ 80%, no anomalies | Ship |
| `partial` | Coverage 50–79% or low runtime signal | Investigate |
| `degraded` | Coverage < 50% or anomalies detected | Do not deploy |

---

## API Reference

| Method | Returns | Purpose |
|--------|---------|---------|
| `session.health()` | `HealthStatus` | Unified health verdict |
| `session.status()` | `SessionStatus` | Quick-glance: health + coverage + fingerprint + identity |
| `session.healthCheck()` | `HealthCheckResponse` | Full /health payload (session-scoped) |
| `session.summary()` | `string` | Human-readable pipeline summary |
| `session.verificationReport()` | `string` | Full verification audit trail |
| `session.destroy()` | `void` | Teardown (resets global state) |

---

## Teardown

```ts
process.on('SIGTERM', () => {
  session.destroy();
  process.exit(0);
});
```

> ⚠ Single active session per process. `destroy()` resets global verification state.

---

## Standalone (no session)

If you don't need session management, use `getGlobalHealthCheck()`:

```ts
import { getGlobalHealthCheck } from '@cmpsbl/runtime';

app.get('/health', (_, res) => res.json(getGlobalHealthCheck()));
```

> This reads from the global latched pipeline state. Use `session.healthCheck()` when a session is available.

---

© CMPSBL® — All rights reserved.
