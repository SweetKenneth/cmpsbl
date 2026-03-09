# INCLUSIVE — Accessibility & Human Compatibility

> **Node ID:** `inclusive` · **Sector:** Execution · **Generation:** 1 · **Node #19 of 40**
> **Codename:** *Guardian* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

INCLUSIVE is the substrate's accessibility engine. It owns WCAG scanning, automated repair, coverage tracking, regression detection, and accessibility compliance reporting. INCLUSIVE ensures every interface the substrate generates or manages meets human accessibility standards.

---

## Architecture

### WCAG Scanning

INCLUSIVE supports three scan depths across three WCAG levels:

| Depth | Description | Typical Issues Found |
|---|---|---|
| `quick` | Surface-level check | 0–5 issues |
| `standard` | Full-page analysis | 2–17 issues |
| `deep` | Component-level audit | Comprehensive |

WCAG levels: `A` (minimum), `AA` (standard), `AAA` (maximum).

### Issue Classification

| Severity | Impact | Example |
|---|---|---|
| `minor` | Low impact, cosmetic | Missing alt text on decorative image |
| `moderate` | Usable but degraded | Low color contrast ratio |
| `serious` | Significant barrier | Missing form labels |
| `critical` | Complete blocker | Keyboard trap, no screen reader access |

### Auto-Repair Engine

```
repair(scanId):
  1. Retrieve scan results
  2. Filter issues where autoFixable === true
  3. Apply fixes (70-100% success rate per attempt):
     - Add missing alt attributes
     - Fix ARIA roles and labels
     - Correct heading hierarchy
     - Add focus indicators
  4. Return { fixesApplied, fixesFailed }
```

### Regression Detection

```
regression_check(newScan, target):
  previousScan = last scan for same target
  if newScan.score < previousScan.score - 5:
    state.regressionCount++
    alert: "Accessibility regression detected on {target}"
```

### Health Calculation

```
inclusiveHealth:
  avgScore = mean of last 30 scans
  clamped to [0, 100], default 85
  if hardening.isDegraded() → cap at 40
```

---

## Resilience Infrastructure

INCLUSIVE uses the substrate's standard resilience pattern:

- **Circuit Breaker**: Trips after 5 consecutive failures, 30s recovery
- **Module Engine**: Hot-swappable execution engine with version tracking
- **Module Hardening**: Max 8 concurrent operations, 60/min rate limit, health threshold 35%
- **Auto-Restore**: 30s interval health check with automatic state restoration
- **Snapshot System**: State snapshots before engine upgrades for rollback

---

## Trade Secrets

### 1. Coverage Metric

Coverage percent is calculated as `min(100, uniqueTargets × 10)`. This simplified metric incentivizes breadth — scanning 10 unique targets achieves 100% coverage. The metric drives the substrate to scan widely rather than deeply on a single target.

### 2. Auto-Repair Success Rate

The repair engine achieves 70-100% fix rate per attempt because it only attempts fixes classified as `autoFixable` during scanning. Complex issues requiring human judgment are excluded from auto-repair and flagged for manual intervention.

### 3. Regression as First-Class Metric

Regression count is a top-level state metric, not a derived calculation. This ensures accessibility regressions are immediately visible in health dashboards and trigger alerts at the MEDIC level.

---

## CLM Learning Priorities

1. **Fix Pattern Improvement** — Learning which auto-fix strategies have the highest success rate per issue type
2. **Regression Root Cause Analysis** — Identifying which code changes most frequently cause accessibility regressions

---

*CMPSBL® Substrate — INCLUSIVE Node Deep Dive · Founder Eyes Only*
