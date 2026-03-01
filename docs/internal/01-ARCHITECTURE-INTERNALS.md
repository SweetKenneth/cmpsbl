# INTERNAL — 01 Architecture Internals

## Scope

This page defines the internal architectural frame used across the substrate:

1. **Spine:** CORE → SYSTEM → CCR
2. **Grid (OCG):** RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT
3. **Execution:** DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, INTEGRATION
4. **Fields:** EVOLUTION, IMMUNITY, INTENT
5. **Plane:** GOVERNANCE
6. **Shell:** DEFENSE

---

## Non-Negotiables

- Module boot is dependency-ordered.
- Module names are always written in all caps.
- GOVERNANCE supervises action legitimacy.
- DEFENSE is terminal boundary enforcement.
- NEXUS is the primary routing authority.

---

## Architecture Invariants

- Weighted matrix must sum to `1.000`.
- CORE failure is system-critical.
- Execution remains isolated by circuit-breaker boundaries.
- Field modules permeate all sectors rather than acting as stacked layers.

---

## Build-On Notes

Use this page as the stable architecture contract; place evolving implementation details in page 02–04.