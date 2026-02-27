# Kernel & Zones — CMPSBL v11.5

## CORE Kernel

The CORE kernel is the standalone boot authority. It initializes all downstream layers and maintains the canonical registry of all entities, zones, and overlays. CORE has no upstream dependencies — it is the root of the boot graph.

## SYSTEM (Elevated Spine Layer)

**SYSTEM** sits between CORE and CCR on the Vertical Spine. It was extracted from CCR to serve as an independent lifecycle management layer:

| Responsibility |
|---------------|
| Lifecycle management & configuration |
| Diagnostics & health reporting |
| Boot sequencing (CORE → SYSTEM → CCR) |

## CCR — Cognitive Reality Zones (Layer 0)

The **Clockless Cognitive Reality** layer is the hidden meta-engine powering reasoning, persistence, and synthesis. It contains three zones (SYSTEM extracted):

| Zone | Responsibility |
|------|---------------|
| **BRAIN** | Reasoning engine, reflection cycles, forecasting |
| **MEMORY** | Persistent tiered storage (SM-2 integration), recall |
| **DREAM** | Synthesis, creative combination, heuristic generation |

CCR zones are surgically hot-swappable with independent circuit breakers for fault isolation. Legacy terminal commands (e.g., `brain.status`, `dream.cycle`) continue to function via internal proxy shims.

## OCG — Operational Compliance Grid

The **Operational Compliance Grid (OCG)** provides high-performance infrastructure services, tapping off the right side of the Vertical Spine:

| Zone | Responsibility |
|------|---------------|
| **RIPPLE** | Signal/event bus, inter-zone communication |
| **ACCESS** | API entitlements, developer keys, rate limiting |
| **IDENTITY** | Session management, role resolution |
| **RELAY** | Webhook dispatch, external integrations |
| **AUDIT** | Integrity ledger, compliance logging |

OCG zones remain invisible in the public Matrix Node registry but are fully monitored via the System Integrity dashboard.

## Zone Isolation

Each zone operates with:
- Independent circuit breaker (closed/half-open/open states)
- Health cap based on breaker state (100% / 80% / 60%)
- Failure counter with sliding window
- Automatic recovery timeout

Degradation in one zone does not cascade to other zones or layers.

---

© 2025–2026 PromptFluid®. All rights reserved.
