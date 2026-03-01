# Evolution Control Plane — 01 Control Center Architecture

**Classification:** Internal  
**Date:** 2026-03

---

## 1. Purpose

The Evolution Control Center (ECC) is the operational dashboard for monitoring, previewing, and governing all evolution activity across the substrate. It is the single pane of glass for:

- Viewing evolution run history and status
- Previewing dry-run mutations before they apply
- Managing rollback snapshots
- Reviewing scanner findings and submitting feedback
- Tracking scan trends over time

---

## 2. Dashboard Panels

| Panel | Data Source | Description |
|-------|-----------|-------------|
| **Run History** | `evolution_runs` table | Chronological list of all evolution runs with status, duration, and delta metrics |
| **Scan Trends** | `analytics_snapshots` (type=system) | Time-series visualization of health score, error rate, active modules |
| **Dry-Run Preview** | In-memory simulation | Configure and preview what a proposed evolution would change before committing |
| **Snapshot Manager** | `evolution_snapshots` (lib) | List, inspect, and restore previous evolution states |
| **Finding Feedback** | In-memory store | Submit verdicts (true positive / false positive / needs review) on scanner findings |
| **Receipt Timeline** | `evolution_receipts` table | Ordered receipt log for audit trail and trend analysis |

---

## 3. Data Flow

```
Scanner ──▶ Findings ──▶ ECC Dashboard
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              Dry-Run    Feedback    Snapshot
              Preview    Verdicts    Restore
                    │         │         │
                    ▼         ▼         ▼
              Evolution   Suppression  Rollback
              Engine      System       Engine
                    │         │         │
                    └─────────┼─────────┘
                              ▼
                        evolution_runs
                        (committed state)
```

---

## 4. Access by Tier

| Feature | Free | Creator | Architect |
|---------|------|---------|-----------|
| View Run History | ✓ | ✓ | ✓ |
| Quick Scan Trends | ✓ | ✓ | ✓ |
| Dry-Run Preview | ✓ | ✓ | ✓ |
| Deep Scan Trends | ✗ | ✓ | ✓ |
| Snapshot Restore | ✗ | ✓ | ✓ |
| Finding Feedback | ✗ | ✓ | ✓ |
| Forensic Analysis | ✗ | ✗ | ✓ |
| Autonomous Runs | ✗ | ✗ | ✓ |

---

## 5. Hook Architecture

The ECC is powered by `useEvolutionControlCenter.ts` which exposes:

| Hook | Purpose |
|------|---------|
| `useEvolutionRuns(limit)` | Fetch recent evolution runs |
| `useEvolutionReceipts(limit)` | Fetch receipts for trend visualization |
| `useEvolutionSnapshots(tenantId, limit)` | List available snapshots |
| `useRestoreSnapshot()` | Mutation to restore a snapshot |
| `useDryRunPreview()` | Mutation to run a dry-run simulation |
| `useSubmitFindingFeedback()` | Mutation to submit finding verdicts |
| `useFindingFeedback()` | Query all submitted feedback |
| `useScanHistory(limit)` | Fetch scan trend data from analytics |

---

© 2025–2026 PromptFluid®. All rights reserved.
