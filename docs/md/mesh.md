# Mesh Overlays — EVOLUTION, IMMUNITY, INTENT

## Purpose
Mesh overlays are system-wide transformation fabrics that permeate the spine. They are not standalone nodes but field-level concerns that influence all operations.

## EVOLUTION Field
Manages the evolution lifecycle: proposal generation, impact analysis, migration risk scoring, deprecation path finding, and feature flag governance.

### Namespace: `evolution.*`
```
evolution.proposals        # List pending evolution proposals
evolution.impact <id>      # Impact analysis for a proposal
evolution.apply <id>       # Apply approved proposal
evolution.history          # Evolution history log
```

## IMMUNITY Field
Provides resilience orchestration: self-healing, fault boundary management, recovery coordination, and circuit breaker policy.

### Namespace: `immunity.*`
```
immunity.status            # Resilience posture
immunity.heal <node>       # Trigger self-healing for node
immunity.boundaries        # Fault boundary map
immunity.recovery          # Recovery history
```

## INTENT Field
Handles capability discovery, intent amplification, fuzzy command matching, and module-capability mapping.

### Namespace: `intent.*`
```
intent.discover <query>    # Discover capabilities matching query
intent.suggest <partial>   # Suggest commands from partial input
intent.map                 # Module-capability mapping
```

## Response Shape
All mesh overlays return standard `CommandResult` with field-specific data payloads.

## Failure Modes
- **Evolution conflict**: Competing proposals modify the same subsystem → conflict resolution queue
- **Immunity exhaustion**: Too many simultaneous recovery attempts → triage by severity
- **Intent ambiguity**: Query matches too many capabilities → ranked suggestion list

## Governance Implications
- Evolution proposals require governance approval before application
- Immunity self-healing operates within pre-approved boundaries
- Intent discovery is ungoverned (read-only capability mapping)
