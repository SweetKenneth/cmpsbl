# Integrity & Governance — CMPSBL v11.1

## Global Observability Access Layer (GOAL)

The substrate's truth system is built on GOAL — a unified, telemetry-backed integrity layer:

- **Snapshot Engine**: Captures system-wide state every 10 minutes
- **Integrity Validator**: Detects numeric conflicts between zones
- **Health Attribution Engine (HAE)**: Ranks health drop causes deterministically
- **Event Store**: Append-only immutable log with UUID v4 correlation IDs

### Deterministic Health Caps

Circuit breaker states enforce fixed health ceilings:

| Breaker State | Health Cap | Meaning |
|---------------|-----------|---------|
| Closed | 100% | Fully healthy |
| Half-Open | 80% | Controlled degradation, recovery probing |
| Open | 60% | Hard degrade, traffic rejected |
| Rerouting | 85% | Migration in progress |

These caps ensure consistent health reporting across the OS Dashboard, Terminal, and all zone interfaces.

## GOVERNANCE Overlay

The innermost mesh overlay enforces organizational policy:

- **Consent Management**: Tracks data sharing permissions per agency
- **Policy Enforcement**: Validates operations against governance rules
- **Audit Oversight**: Ensures all mutations are logged and attributable
- **Sounding Board**: Advisory system for operational decisions

## Integrity Surface

The System Integrity dashboard provides a read-only view of:

- Per-zone health percentage
- Circuit breaker state (closed / half-open / open)
- Failure counts and recovery timelines
- Layer-level aggregate health (5-layer weighted model)
- Zone isolation status

**No mutation endpoints are exposed.** The integrity surface is purely observational.

## Audit Trail

Every significant system event is recorded in the brain_events table:
- Event type and originating zone
- Outcome (success / failure / partial)
- Timestamp with millisecond precision
- Structured metadata for forensic analysis

---

© 2025–2026 PromptFluid®. All rights reserved.
