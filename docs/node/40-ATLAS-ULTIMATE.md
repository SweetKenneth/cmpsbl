# ATLAS — Ultimate Architecture (v9.0.0 "Cartographer")

**Primitive:** #40 — ATLAS  
**Category:** PLANE (Engineering Plane)  
**Weight:** 0.020  
**Classification:** 🔒 INTERNAL  
**Last Updated:** 2026-03-23

---

## 1. Purpose

ATLAS is the substrate's **governance hub, capability map, and system navigator**. It provides a unified view of all capabilities, their states, dependencies, and health — serving as the "control tower" for governors and the "GPS" for system navigation.

---

## 2. Core Engines

### 2.1 Capability Registry
- Maintains the canonical list of all substrate capabilities (675+)
- Tracks state: active, deprecated, experimental, sealed
- Version-aligned with the capability hash chain

### 2.2 Dependency Graph Visualizer
- Computes and caches the full inter-node dependency graph
- Identifies critical paths, single points of failure, and circular dependencies
- Powers the Modules Hub architectural diagram

### 2.3 System Navigator
- Semantic resolution engine mapping ~90 natural language intents to node IDs and tables
- Enables agents and governors to find implementation targets without path guessing
- 7-strategy resolution cascade for maximum accuracy

### 2.4 Governance Dashboard Backend
- Aggregates telemetry from all 40 primitives into governor-facing summaries
- Health scores, boot status, degradation levels, and governance mode
- Real-time sync with the OS Dashboard

### 2.5 Capability Analytics Engine
- Tracks usage frequency, success rates, and cost per capability
- Identifies underutilized and over-stressed capabilities
- Recommends optimization targets to ENGINEER

---

## 3. ADA Integration

ATLAS operates within the `operational` domain:
- **Autonomy threshold:** 75%
- **Rate limit:** 80 decisions/hr
- **DREAM allowed:** ✓
- **Allowed actions:** orchestrate-task, assign-capability, map-dependency, seal-artifact, navigate-intent, prioritize-queue, calibrate-compass, index-capability, resolve-conflict

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-23 | System | Ultimate architecture documentation |

---

© 2025–2026 CMPSBL®. Confidential.
