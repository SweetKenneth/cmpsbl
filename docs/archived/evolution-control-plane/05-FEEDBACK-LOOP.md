# Evolution Control Plane — 05 Feedback Loop

**Classification:** Internal  
**Date:** 2026-03

---

## 1. Purpose

The feedback loop lets operators classify scanner findings as true positives, false positives, or items needing further review. This creates a learning signal that improves scanner accuracy over time and prevents alert fatigue.

---

## 2. Verdict Types

| Verdict | Effect |
|---------|--------|
| `true_positive` | Finding confirmed — prioritized for evolution action |
| `false_positive` | Finding suppressed — excluded from future scans with matching fingerprint |
| `needs_review` | Finding flagged — kept visible but not auto-actioned |

---

## 3. Feedback Schema

| Field | Type | Description |
|-------|------|-------------|
| `finding_fingerprint` | `string` | Links feedback to the specific finding |
| `finding_title` | `string` | Human-readable title for display |
| `verdict` | `enum` | One of the three verdict types |
| `reason` | `string?` | Optional explanation for the verdict |
| `submitted_at` | `timestamp` | When the feedback was submitted |

---

## 4. Suppression System

When a finding is marked `false_positive`:

1. The fingerprint is added to the suppression index
2. Future scans check the index before surfacing findings
3. Suppressed findings are hidden from the main dashboard but visible in a "suppressed" filter
4. Suppression can be reversed by re-submitting a `true_positive` or `needs_review` verdict

---

## 5. Learning Integration

```
Operator Feedback ──▶ Suppression Index
                           │
                           ▼
                    Scanner Rule Tuning
                           │
                           ▼
                    Reduced False Positives
                           │
                           ▼
                    Higher Signal-to-Noise
                           │
                           ▼
                    Better Evolution Decisions
```

### Future Enhancements (Architect Tier)

- **Auto-classification** — CORTEX analyzes findings and suggests verdicts
- **Cross-tenant learning** — anonymized verdict patterns improve global scanner rules
- **Confidence scoring** — scanner includes a confidence score per finding, informed by historical verdicts

---

## 6. Current Implementation

The feedback system currently uses an in-memory store (`Map<string, FindingFeedback>`) scoped to the browser session. This is intentional for Phase 1:

- Zero database overhead
- Instant responsiveness
- Persists via the scan-run-identity suppression system

Phase 2 will migrate to persistent storage for cross-session and multi-user feedback.

---

© 2025–2026 PromptFluid®. All rights reserved.
