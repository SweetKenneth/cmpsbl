# MODULES — 10 NERVE & MEDIC (Recent Additions)

**Classification:** Internal  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## NERVE

**Codename:** Conductor  
**Boot Order:** 9  
**Dependencies:** CORE, RIPPLE  
**Layer:** OCG (Operational Compliance Grid)

### Sector Placement

NERVE was realigned to the OCG in v13.0.0. It IS the grid's signaling backbone — responsible for inter-node coordination that the OCG relies on for boundary enforcement.

### Responsibility

Inter-node signaling, consensus repair, distributed heartbeat coordination, and mesh health propagation. NERVE ensures all nodes can communicate state changes in real time.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| Distributed heartbeat | Coordinates health signals across all 38 nodes |
| Consensus repair | Detects and repairs split-brain conditions in distributed state |
| Signal bus | Low-latency event bus for inter-module coordination |
| Health propagation | Propagates health score changes across the weighted matrix |
| Partition detection | Identifies network partitions between module clusters |

### Architecture Notes

- NERVE depends on RIPPLE's event bus for message transport.
- NERVE feeds health signals to VISION for anomaly detection.
- During OCG degradation, NERVE loss means loss of real-time inter-node coordination.
- NERVE is distinct from RELAY — NERVE handles internal signals, RELAY handles external webhooks.

---

## MEDIC

**Codename:** Surgeon  
**Boot Order:** 19  
**Dependencies:** CORE, VISION  
**Layer:** Execution

### Sector Placement

MEDIC was introduced as a full execution-tier module in v12.x, responsible for autonomous diagnostics and self-repair coordination.

### Responsibility

Autonomous diagnostics, self-repair coordination, health scoring, and remediation planning. MEDIC is the substrate's doctor — it detects illness and prescribes treatment.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| Health scoring | Computes per-module and aggregate health scores |
| Anomaly diagnosis | Root-cause analysis of health degradations |
| Self-repair coordination | Orchestrates repair actions (circuit reset, cache flush, restart) |
| Repair verification | Validates that repair actions restored health |
| Incident correlation | Correlates multiple symptoms to single root causes |

### Architecture Notes

- MEDIC reads health telemetry from VISION.
- Repair actions are gated by GOVERNANCE for safety.
- MEDIC coordinates with IMMUNITY for threat-related health issues.
- Self-repair actions are logged to AUDIT for compliance.
- MEDIC can trigger circuit breaker resets and module restarts.

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial NERVE + MEDIC deep dive — v13.1.0 |

---

© 2025–2026 PromptFluid®. Internal use only.
