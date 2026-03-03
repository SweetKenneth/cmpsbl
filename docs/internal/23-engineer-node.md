# 23 — ENGINEER Node (Mechanist)

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

ENGINEER (codename "Mechanist") is the substrate's internal maintenance node. It has no user-facing UI — it operates entirely behind the scenes, polling system health, generating findings and proposals, and dispatching everything to INTEL for governor review.

## 2. Architecture

### 2.1 Position in Control Plane

```
ENGINEER ──→ INTEL ──→ ATLAS (Node Inbox)
    ↑                      ↓
  System Health      Governor Approval/Rejection
```

ENGINEER is a Control Plane first-class citizen alongside INTEL, DECODE, AUDIT, and the NEXUS-CLM Bridge.

### 2.2 Core Implementation

**File:** `src/lib/control-plane/engineer/maintenance.ts`

ENGINEER uses session-scoped in-memory persistence for findings and proposals. All data is emitted to INTEL as `IntelSignal` objects.

## 3. Responsibilities

### 3.1 Health Monitoring

ENGINEER monitors the health of:

| Target | Count | Method |
|--------|-------|--------|
| Engines | 76 | Health score polling, breaker state checks |
| Meta-Engines | 24 | Aggregate health computation |
| Circuit breakers | All modules | State checks (closed/open/half-open) |
| Fallback coverage | All modules | Verifies fallback paths exist and are functional |

### 3.2 Finding Generation

ENGINEER produces `EngineerFinding` objects:

| Field | Description |
|-------|-------------|
| `id` | Auto-generated unique ID |
| `source_node` | Which module/engine triggered the finding |
| `category` | health, performance, debt, regression, security |
| `severity` | info, warning, error, critical |
| `title` | Human-readable headline |
| `description` | Detailed explanation |
| `evidence` | Supporting data (metrics, logs, comparisons) |
| `timestamp` | When the finding was generated |
| `resolved` | Whether the finding has been addressed |

### 3.3 Proposal Generation

When a finding warrants action, ENGINEER generates `EngineerProposal` objects:

| Field | Description |
|-------|-------------|
| `id` | Auto-generated unique ID |
| `finding_id` | Reference to the originating finding |
| `title` | Proposed action headline |
| `description` | Detailed remediation plan |
| `impact` | Estimated impact assessment |
| `risk` | Risk level of the proposed change |
| `status` | pending → approved/rejected → executed |

### 3.4 CLM Integration

ENGINEER uses Constant Learning Mode (CLM) to dynamically prioritize:
- Focus shifts based on engine health degradation
- Topics are generated from findings and dispatched through the NEXUS-CLM Bridge
- CLM cycles run through NEXUS for AI-assisted analysis when needed

## 4. INTEL Dispatch

Every finding is immediately dispatched to INTEL via `intelAggregator.ingest()`:

```typescript
intelAggregator.ingest({
  source: `ENGINEER/${finding.source_node}`,
  category: mapFindingCategory(finding.category),
  severity: mapFindingSeverity(finding.severity),
  headline: finding.title,
  detail: finding.description,
  suggested_action: 'Review ENGINEER finding in INTEL Panel.',
  data: finding.evidence,
  fingerprint: `engineer:${finding.category}:${finding.title}`,
});
```

Fingerprinting enables deduplication — repeated findings for the same issue are coalesced in INTEL.

## 5. INTENT Hub Integration

All ENGINEER proposals are also dispatched to the INTENT Hub for translation into human-readable governance requests in ATLAS. The INTENT Hub:
- Translates technical findings into business-impact language
- Assigns urgency levels
- Routes to the appropriate ATLAS tab (Inbox for proposals, Audit for compliance)

## 6. Safety Constraints

- ENGINEER **never** directly modifies production behavior
- All proposals require human approval through ATLAS
- Findings are read-only observations
- The `auto_training_enabled` flag gates automated proposal execution

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial ENGINEER internal documentation — v13.1.0 |

---

© 2025–2026 PromptFluid®. Confidential.
