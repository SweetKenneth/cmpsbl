# INTERNAL — 02 Engine & Capability Registry

## Core Engine Families

- MEMORY CORE
- LEARNING ENGINE
- IMAGINATION ENGINE
- REASONING ENGINE
- GOVERNANCE GUARD

## Orchestration Layer

- ENGINE BUS handles command-to-engine resolution.
- CORTEX composes pipelines.
- NEXUS performs provider/model routing.

## Capability Registry Policy

Each capability entry should include:

- `id`
- `name`
- `description`
- `modules` (all caps)
- `layer`
- `executor`

---

## Registry Controls

- No duplicate capability IDs.
- Every capability maps to at least one owning module.
- Capabilities that mutate production paths require GOVERNANCE gateability.
- Capabilities that cross trust boundaries require DEFENSE review.

---

## Build-On Notes

Add new capabilities by module intersection, not by feature marketing label.