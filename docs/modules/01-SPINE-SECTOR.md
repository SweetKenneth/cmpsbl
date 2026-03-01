# MODULES — 01 SPINE Sector

## Modules

- CORE (Foundation) — weight 0.200
- SYSTEM (Production) — weight 0.050

## Responsibilities

- CORE: canonical kernel and registry authority
- SYSTEM: lifecycle, diagnostics, configuration, runtime status

## Boot Contract

`CORE` boots first, then `SYSTEM`, then CCR.

## Operational Signals

- CORE degradation materially impacts matrix score.
- SYSTEM degradation impacts orchestration continuity and diagnostics fidelity.

## Build-On Notes

Detailed function signatures belong in per-module files under `docs/library/10-CORE.md` and `docs/library/11-SYSTEM.md`.