# 24 — INTEL Aggregation Pipeline

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

INTEL is the substrate's intelligence aggregation and explanation layer. It collects signals from across the entire system, normalizes them, deduplicates by fingerprint, and converts them into IntelCards for the Founder-only INTEL Panel. INTEL is the single pane of glass through which the governor sees everything.

## 2. Architecture

### 2.1 Position in Control Plane

```
ENGINEER ──→ INTEL ──→ ATLAS (Intel Tab)
VISION   ──→ INTEL
ECONOMY  ──→ INTEL
DEFENSE  ──→ INTEL
SEBA     ──→ INTEL
(any node)──→ INTEL
```

INTEL is a passive aggregator — it receives signals but does not initiate actions.

### 2.2 Core Implementation

**File:** `src/lib/control-plane/intel/aggregator.ts`

Session-scoped in-memory signal store with a 500-signal rolling window.

## 3. Signal Model

### 3.1 IntelSignal

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated unique ID |
| `source` | string | Emitting node (e.g., `ENGINEER/NEXUS`, `DEFENSE/honeypot`) |
| `category` | IntelCategory | health, security, performance, cost, governance, evolution |
| `severity` | string | info, warning, error, critical |
| `headline` | string | One-line summary |
| `detail` | string | Full explanation |
| `timestamp` | string | ISO 8601 |
| `suggested_action` | string | What the governor should do |
| `data` | any | Supporting evidence |
| `fingerprint` | string | Deduplication key |

### 3.2 IntelCard

IntelCards are the UI-facing representation of signals, displayed in the ATLAS Intel tab:

| Field | Description |
|-------|-------------|
| `title` | Headline from the signal |
| `body` | Rendered explanation with impact assessment |
| `urgency` | Computed from severity + recurrence |
| `source_badge` | Visual badge showing origin node |
| `action_buttons` | Contextual actions (approve, dismiss, investigate) |

## 4. Deduplication

Signals are deduplicated by fingerprint:

```typescript
fingerprint = `${signal.source}:${signal.category}:${signal.headline}`
```

When a duplicate is detected:
- `count` is incremented
- `last_seen` is updated
- The signal is NOT stored again (saves memory)
- The IntelCard shows occurrence count

## 5. Export & Reporting

INTEL can generate `IntelExportReport` objects containing:
- All active signals with counts
- Severity distribution
- Source distribution
- Top recurring issues
- CLM topic mastery highlights (`TopicMasteryHighlight`)

## 6. Supporting Components

### 6.1 NEXUS-CLM Bridge (`intel/nexus-clm-bridge.ts`)

Routes CLM (Constant Learning Mode) cycles through NEXUS:
- Topics generated from ENGINEER findings
- NEXUS routes to optimal AI provider for analysis
- Results fed back into INTEL as enriched signals

### 6.2 Proposal Generator (`intel/proposal-generator.ts`)

Generates governance proposals from high-severity signals:
- Auto-creates proposals when severity ≥ error and recurrence ≥ 3
- Proposals are dispatched to ATLAS Node Inbox for governor review

## 7. Access Control

| Level | Access |
|-------|--------|
| Public | None |
| Authenticated users | None |
| Admin (Governor) | Full access via ATLAS Intel tab and `/admin/intel` |
| System (Internal) | Write access from any node via `intelAggregator.ingest()` |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial INTEL internal documentation — v13.1.0 |

---

© 2025–2026 CMPSBL®. Confidential.
