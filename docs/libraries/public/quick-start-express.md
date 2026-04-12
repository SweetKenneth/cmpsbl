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

---

## What changed

- `handlers.getUsers` → `session.exports.getUsers` (no refactor required)
- `/health` now reflects real system state, not a static response
- `/status` returns `{ health, coverage, fingerprint }` in one call
- Every function call is verified against its behavioral contract

---

## /health response

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2026-04-12T08:30:00.000Z",
  "environment": "node",
  "activation": {
    "status": "healthy",
    "coverageRatio": 0.92,
    "coveragePct": 92
  },
  "runtime": {
    "status": "healthy",
    "anomalies": 0,
    "enforcements": 4,
    "totalEvents": 12
  },
  "fingerprint": "a3f8c1d2"
}
```

---

## /status response

```json
{
  "health": "healthy",
  "coverage": 0.92,
  "fingerprint": "a3f8c1d2"
}
```

---

## Verification Report

```
═══ CMPSBL® Verification Report ═══

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
| `health: healthy` | Coverage ≥ 80% and zero anomalies |

---

## Health states

| Status | Meaning | Action |
|--------|---------|--------|
| `healthy` | Coverage ≥ 80%, no anomalies | Ship |
| `partial` | Coverage 50–79% or low runtime signal | Investigate |
| `degraded` | Coverage < 50% or anomalies detected | Do not deploy |

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

© CMPSBL® — All rights reserved.
