# Release Process

## Release Gate

Every release passes through the automated release gate before deployment:

### Gate Checks

1. **TypeScript Compilation** — Zero type errors
2. **Diligence Harness** — Full battery passes (boot, parity, governance, smoke)
3. **Matrix Integrity** — Operational score ≥ 80
4. **Weight Validation** — Node weight sum within 1% of 1.0
5. **Handler Parity** — All registered commands have corresponding handlers
6. **Governance Coherence** — Policy engine evaluates correctly
7. **Deployment Pass** — Build artifacts valid, no unresolved dependencies

### Severity Thresholds

| Severity | Gate Behavior |
|----------|--------------|
| CRITICAL | Hard block — release cannot proceed |
| ERROR | Soft block — requires explicit override with justification |
| WARNING | Noted in release report, does not block |
| INFO | Logged only |

## Release Report

Each release produces a structured report containing:

- Release identifier and timestamp
- Gate check results (pass/fail for each)
- Matrix integrity snapshot
- Governance compliance score
- Known issues and their severities
- Changelog (auto-generated from SEBA audit trail)

## Deployment

Deployments are atomic — the entire release is deployed or rolled back as a unit. There are no partial deployments.

### Rollback

If post-deployment monitoring detects degradation:

1. Automatic rollback triggers if health drops below threshold within 15 minutes
2. Manual rollback available via `system.rollback` terminal command
3. All rollbacks are audited
