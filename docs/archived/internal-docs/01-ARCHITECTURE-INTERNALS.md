# INTERNAL — 01 Architecture Internals

## Scope

This page defines the internal architectural frame used across the substrate:

1. **Spine:** CORE → SYSTEM → CCR (BRAIN, MEMORY, DREAM)
2. **Grid (OCG):** RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT
3. **Execution:** DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, NERVE, INTEGRATION
4. **ESZ (Expansion Sovereignty Zone):** SOVEREIGN, ORACLE, CONSCIENCE, TREATY
5. **EPZ (Expansion Perception Zone):** COMPASS, ECHO, REFLEX
6. **EMZ (Expansion Manufacturing Zone):** FORGE, LINGUA, PHANTOM, HARVEST
7. **Fields:** EVOLUTION, IMMUNITY, INTENT
8. **Plane:** GOVERNANCE
9. **Shell:** DEFENSE

**Total: 37 Matrix Nodes across 11 Sectors**

---

## Non-Negotiables

- Module boot is dependency-ordered.
- Module names are always written in all caps.
- GOVERNANCE supervises action legitimacy.
- DEFENSE is terminal boundary enforcement.
- NEXUS is the primary routing authority.
- Expansion zones (ESZ, EPZ, EMZ) are zone-shielded — they can degrade independently without affecting core operations.

---

## Architecture Invariants

- Weighted matrix must sum to `1.000`.
- CORE failure is system-critical.
- Execution remains isolated by circuit-breaker boundaries.
- Field modules permeate all sectors rather than acting as stacked layers.
- Zone shielding ensures expansion module failures do not cascade into the spine.

---

## Zone Shielding Model

| Zone | Purpose | Degradation Impact |
|------|---------|-------------------|
| CCR | Cognitive reality (reasoning, memory, dreaming) | Loss of cognitive depth |
| OCG | Operational compliance (events, auth, audit) | Loss of boundary enforcement |
| ESZ | Sovereignty, prediction, ethics, contracts | Reduced governance reach |
| EPZ | Perception, simulation, edge compute | Reduced foresight |
| EMZ | Manufacturing, translation, privacy, data | Reduced production capacity |

---

## Weight Distribution

| Sector | Weight | Node Count |
|--------|--------|------------|
| CORE | 0.120 | 1 |
| SYSTEM | 0.040 | 1 |
| CCR | 0.120 | 3 |
| OCG | 0.150 | 5 |
| Execution | 0.250 | 11 |
| ESZ | 0.080 | 4 |
| EPZ | 0.060 | 3 |
| EMZ | 0.060 | 4 |
| Fields | 0.060 | 3 |
| Plane | 0.030 | 1 |
| Shell | 0.030 | 1 |
| **Total** | **1.000** | **37** |

---

## Build-On Notes

Use this page as the stable architecture contract; place evolving implementation details in page 02–04.
