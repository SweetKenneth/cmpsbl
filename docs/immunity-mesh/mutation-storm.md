# Immunity Mesh — Mutation Storm

## Overview

The Mutation Storm is a **shadow-only** adversarial stress test that fires crafted malicious payloads across executors to validate defense resilience.

## Categories

| Category | Description |
|----------|-------------|
| `schema_mismatch` | Wrong types for expected fields |
| `unicode_surrogate` | Malformed unicode, surrogate pairs |
| `missing_required` | Empty objects missing required fields |
| `rate_limit` | Oversized payloads, array flooding |
| `auth_edge` | Path traversal, prototype pollution |
| `injection` | XSS, SQL injection, template injection |
| `overflow` | MAX_SAFE_INTEGER, Infinity, negative values |
| `null_coercion` | null, undefined, NaN in various positions |

## How It Works

1. Toggle Immunity Mesh **ON** (hard requirement)
2. Click "Run Mutation Storm" in Controls tab
3. System generates adversarial payloads per category
4. Runs them against up to 20 executors via shadow probes
5. Records a `storm` run in `immunity_mesh_runs`
6. Results show: total events, safe fails, repaired, escalated
7. Category breakdown shows which attack vectors are weakest

## Safety Guarantees

- **NEVER** touches production data
- **NEVER** runs if Immunity Mesh is OFF
- All payloads are synthetic — no real user data involved
- Run records are traceable (run ID, executor, outcome)
