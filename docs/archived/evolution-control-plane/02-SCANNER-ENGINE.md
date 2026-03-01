# Evolution Control Plane — 02 Scanner Engine

**Classification:** Internal  
**Date:** 2026-03

---

## 1. Purpose

The Scanner is the substrate's continuous assessment layer. It inspects the live state of all modules, policies, and data flows to surface findings — potential issues, regressions, or optimization opportunities that the Evolution engine can act on.

---

## 2. Scan Types

| Type | Tier | Depth | Duration | Description |
|------|------|-------|----------|-------------|
| **Quick Scan** | Free+ | Surface | Seconds | Checks module health, basic policy violations, known patterns |
| **Deep Scan** | Creator+ | Structural | Minutes | Cross-module dependency analysis, performance profiling, drift detection |
| **Forensic Scan** | Architect | Full | Extended | Complete state reconstruction, causal chain analysis, historical regression tracing |

---

## 3. Finding Schema

Each scanner finding contains:

| Field | Type | Description |
|-------|------|-------------|
| `fingerprint` | `string` | Unique hash of the finding (module + rule + context) |
| `title` | `string` | Human-readable finding title |
| `severity` | `'info' \| 'warning' \| 'error' \| 'critical'` | Impact level |
| `module` | `string` | Which substrate module produced or is affected by the finding |
| `rule` | `string` | The scanner rule that triggered |
| `description` | `string` | Detailed explanation |
| `suggested_action` | `string` | What the Evolution engine would do to resolve it |
| `first_seen` | `timestamp` | When the finding first appeared |
| `last_seen` | `timestamp` | Most recent detection |
| `occurrences` | `number` | How many times detected |
| `suppressed` | `boolean` | Whether a false-positive verdict has suppressed it |

---

## 4. Finding Lifecycle

```
Detection ──▶ New Finding ──▶ Dashboard Display
                                    │
                          ┌─────────┼─────────┐
                          ▼         ▼         ▼
                     Auto-Fix   Human      Suppress
                     (Evolve)   Review     (False +)
                          │         │         │
                          ▼         ▼         ▼
                     Resolved   Confirmed  Suppressed
                                    │
                                    ▼
                              Evolution Run
                              (if approved)
```

---

## 5. Fingerprinting

Findings are deduplicated by fingerprint — a deterministic hash of:

- Module identifier
- Rule identifier
- Contextual key (e.g., specific table, policy, or function)

This ensures the same issue doesn't flood the dashboard across scans. Occurrence count increments instead.

---

## 6. Scanner Rules Categories

| Category | Examples |
|----------|---------|
| **Health** | Module heartbeat missing, circuit breaker tripped |
| **Security** | Missing RLS policy, exposed endpoint, weak auth config |
| **Performance** | Slow query pattern, excessive API calls, memory pressure |
| **Drift** | Configuration divergence from baseline, unexpected state mutation |
| **Compliance** | Audit gap, missing receipt, governance violation |
| **Optimization** | Unused module, redundant routing, cache miss pattern |

---

© 2025–2026 PromptFluid®. All rights reserved.
