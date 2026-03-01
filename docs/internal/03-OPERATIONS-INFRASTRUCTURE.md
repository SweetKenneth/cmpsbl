# INTERNAL — 03 Operations & Infrastructure

## Operational Backbone

- Circuit breakers per module
- Cascade detection across modules
- Telemetry event capture
- Persistence leader lease
- Snapshot + WAL durability

---

## Persistence Expectations

- Writes are staged and committed atomically.
- Leader instance owns periodic flush.
- Non-leaders can request manual flush but do not run schedule loops.

---

## Incident Classes

1. **Module Failure** — isolate module, preserve system continuity
2. **Cascade Chain** — detect origin, arrest propagation
3. **Persistence Failure** — continue runtime, recover durable state path
4. **Governance Conflict** — evaluate, veto/approve, log to AUDIT

---

## Build-On Notes

Operational runbook procedures should be extended in `docs/operations-manual/` for printable workflows.