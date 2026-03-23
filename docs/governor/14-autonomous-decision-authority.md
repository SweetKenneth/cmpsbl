# 14 — Autonomous Decision Authority (ADA)

**Version:** 1.0.0  
**Classification:** 🔒 GOVERNOR  
**Last Updated:** 2026-03-23

---

## 1. Purpose

The Autonomous Decision Authority (ADA) grants substrate nodes **scoped, enterprise-grade decision-making power** within their specialty domains. Instead of requiring every action to escalate through governance or governor approval, ADA enables nodes to act autonomously on routine and high-confidence decisions — while maintaining strict guardrails, audit trails, and trust calibration.

**Core Invariants:**
- Evolution is **ALWAYS blocked** — no node can self-modify through ADA
- DREAM synthesis is allowed on a per-domain basis
- All decisions produce tamper-evident FNV-1a audit hashes
- Trust calibrates over time via outcome feedback loops
- Governance can suspend/reinstate any node at any time

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│            AUTONOMOUS DECISION AUTHORITY             │
│                    ADA v1.0.0                        │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐    │
│  │ Decision  │──▶│ 7-Gate   │──▶│  Verdict     │    │
│  │ Request   │   │ Pipeline │   │  + Audit Hash│    │
│  └──────────┘   └──────────┘   └──────────────┘    │
│        │              │               │              │
│        ▼              ▼               ▼              │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐    │
│  │ Scope    │   │ Trust    │   │  Metrics     │    │
│  │ Registry │   │ Engine   │   │  Aggregator  │    │
│  └──────────┘   └──────────┘   └──────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Component Summary

| Component | Purpose |
|-----------|---------|
| **Decision Request** | Structured input from a node requesting autonomous action |
| **7-Gate Pipeline** | Sequential validation: suspension → domain → action → evolution-block → rate-limit → confidence → critical-bar |
| **Verdict** | Outcome (approved/denied/deferred/escalated) with reasoning and audit hash |
| **Scope Registry** | 15 decision domains with allowlists, blocklists, and rate limits |
| **Trust Engine** | Per-node trust score (0–100) that calibrates thresholds over time |
| **Metrics Aggregator** | Rolling statistics on decision patterns, domain activity, and hourly rates |

---

## 3. Decision Domains (15)

Each domain maps specific nodes to specific allowed actions:

| Domain | Authorized Nodes | Threshold | Rate Limit | DREAM |
|--------|-----------------|-----------|------------|-------|
| `threat-response` | DEFENSE, IMMUNITY | 75% | 120/hr | ✗ |
| `memory-management` | MEMORY, BRAIN | 70% | 60/hr | ✓ |
| `signal-routing` | NERVE, INTENT | 80% | 200/hr | ✗ |
| `resource-allocation` | SYSTEM, ENGINEER | 80% | 40/hr | ✗ |
| `data-synthesis` | DREAM, ORACLE | 65% | 30/hr | ✓ |
| `governance-enforcement` | GOVERNANCE, CONSCIENCE | 90% | 100/hr | ✗ |
| `access-control` | ACCESS, IDENTITY | 85% | 80/hr | ✗ |
| `code-quality` | ENCODE, SHADOW | 70% | 50/hr | ✓ |
| `pattern-detection` | HARVEST, OBSERVER | 65% | 60/hr | ✓ |
| `communication` | ECHO, LINGUA, RELAY | 75% | 100/hr | ✗ |
| `resilience` | IMMUNITY, REFLEX | 80% | 60/hr | ✗ |
| `operational` | CORTEX, FORGE, ATLAS, COMPASS | 75% | 80/hr | ✓ |
| `simulation` | SIMULATE, SANDBOX | 60% | 20/hr | ✓ |
| `diplomatic` | TREATY, SOVEREIGN | 85% | 30/hr | ✗ |
| `edge-compute` | EDGE, PHANTOM | 70% | 150/hr | ✗ |

### Threshold Explanation

The **autonomy threshold** is the minimum confidence a node must have in its decision before it can act autonomously. This threshold is further adjusted by the node's **trust score**:

```
effectiveThreshold = baseThreshold × (0.8 + trustScore/500)
```

A node with trust score 100 gets a slight threshold reduction (multiplier 1.0), while a node with trust score 0 faces a higher bar (multiplier 0.8).

---

## 4. The 7-Gate Pipeline

Every decision request passes through seven sequential gates. A failure at any gate produces an immediate verdict:

### Gate 1: Suspension Check
If the node is suspended (manually by governance or auto-suspended after repeated failures), the decision is **denied** immediately. Suspensions have an expiry time and automatically lift.

### Gate 2: Domain Authorization
The requesting node must be listed in the `authorizedNodes` array for the requested domain. DEFENSE cannot make memory-management decisions; BRAIN cannot make threat-response decisions.

### Gate 3: Action Allowlist/Blocklist
The requested action must appear in the domain's `allowedActions` list AND must NOT appear in `blockedActions`. Blocklist takes absolute precedence.

### Gate 4: Evolution Block (Absolute)
Any action containing `evolve`, `evolution`, `mutate-live`, or `self-modify` is **denied unconditionally**, regardless of confidence or trust score. This is a hard-coded invariant.

### Gate 5: Rate Limit
Each domain has a per-hour rate limit. If the node has exceeded its allocation, the decision is **deferred** with a cooldown timer.

### Gate 6: Confidence Threshold
The node's confidence in its decision is compared against the trust-adjusted threshold. Below threshold: **deferred** for routine requests, **escalated** for urgent/critical.

### Gate 7: Critical Urgency Bar
Critical-urgency decisions require ≥95% confidence for autonomous execution, regardless of trust score. This prevents high-impact mistakes even from highly trusted nodes.

---

## 5. Trust Calibration

Each node maintains a **trust score** (0–100) that adjusts based on decision outcomes:

| Event | Effect |
|-------|--------|
| Approved decision succeeds | Trust increases (growth rate: 1% of headroom) |
| Reported success via `reportOutcome()` | Trust increases (2× growth rate) |
| Denied decision | Trust decreases (decay rate: 2% of current score) |
| Reported failure | Trust decreases (2× decay rate) |
| >70% denial rate in an hour with >5 decisions | **Auto-suspension** (60s cooldown) |

### Trust Score Effects

| Trust Range | Behavior |
|-------------|----------|
| 80–100 | Slight threshold reduction; maximum autonomy |
| 50–79 | Neutral; standard thresholds apply |
| 20–49 | Higher effective thresholds; more decisions deferred |
| 0–19 | Near-total escalation; minimal autonomous capability |

All nodes start at trust score **50** (neutral). Trust must be earned through successful outcomes.

---

## 6. Audit Trail

Every decision produces a `DecisionVerdict` with a tamper-evident hash:

```typescript
{
  requestId: string;       // Unique request identifier
  outcome: 'approved' | 'denied' | 'deferred' | 'escalated';
  nodeId: string;          // Which node made the decision
  domain: string;          // Which domain it operated in
  action: string;          // What action was requested
  confidence: number;      // Node's confidence level
  reasoning: string;       // Human-readable explanation
  governanceCheck: boolean; // Whether governance gates were passed
  auditHash: string;       // FNV-1a hash for tamper evidence
  timestamp: number;       // Unix timestamp
  cooldownUntil?: number;  // If deferred, when it can retry
}
```

The audit log is maintained as a **ring buffer** (max 2,000 entries) to prevent unbounded memory growth.

---

## 7. Allowed Actions Per Domain

### Threat Response (DEFENSE, IMMUNITY)
`block-ip`, `throttle-actor`, `quarantine-request`, `escalate-threat`, `update-reputation`, `activate-honeypot`, `rotate-challenge`, `flag-anomaly`, `trigger-circuit-breaker`

### Memory Management (MEMORY, BRAIN)
`promote-tier`, `demote-tier`, `consolidate-memories`, `prune-expired`, `reindex-embeddings`, `compress-cold`, `strengthen-pathway`, `archive-glacier`, `defragment`

### Signal Routing (NERVE, INTENT)
`reroute-signal`, `adjust-priority`, `activate-backpressure`, `open-circuit`, `close-circuit`, `replay-dead-letter`, `rebalance-lanes`, `classify-intent`, `decompose-goal`

### Resource Allocation (SYSTEM, ENGINEER)
`scale-resource`, `tune-parameter`, `schedule-maintenance`, `activate-degradation`, `rebalance-budget`, `restart-service`, `adjust-heartbeat`, `resolve-contention`, `predict-failure`

### Data Synthesis (DREAM, ORACLE)
`synthesize-insight`, `generate-forecast`, `consolidate-dreams`, `detect-drift`, `propose-heuristic`, `score-coherence`, `run-lucid-session`, `build-timeline`, `correlate-signals`

### Governance Enforcement (GOVERNANCE, CONSCIENCE)
`enforce-policy`, `veto-action`, `flag-ethical-concern`, `adjust-threshold`, `audit-compliance`, `restrict-scope`, `approve-routine`, `deny-violation`, `log-decision`

### Access Control (ACCESS, IDENTITY)
`revoke-key`, `throttle-developer`, `enforce-quota`, `flag-abuse`, `validate-entitlement`, `rotate-token`, `suspend-account`, `score-reputation`, `cache-entitlement`

### Code Quality (ENCODE, SHADOW)
`lint-patch`, `score-quality`, `run-shadow-test`, `validate-ast`, `detect-antipattern`, `suggest-fix`, `measure-coverage`, `compare-verdicts`, `template-capture`

### Pattern Detection (HARVEST, OBSERVER)
`extract-pattern`, `classify-trend`, `emit-observation`, `score-novelty`, `index-discovery`, `correlate-events`, `track-regression`, `snapshot-state`, `alert-anomaly`

### Communication (ECHO, LINGUA, RELAY)
`translate-message`, `route-webhook`, `format-output`, `retry-delivery`, `adjust-voice`, `queue-notification`, `validate-payload`, `sign-message`, `buffer-broadcast`

### Resilience (IMMUNITY, REFLEX)
`trigger-reflex`, `isolate-failure`, `activate-fallback`, `heal-node`, `quarantine-module`, `restore-checkpoint`, `calibrate-threshold`, `run-diagnostic`, `patch-runtime`

### Operational (CORTEX, FORGE, ATLAS, COMPASS)
`orchestrate-task`, `assign-capability`, `map-dependency`, `seal-artifact`, `navigate-intent`, `prioritize-queue`, `calibrate-compass`, `index-capability`, `resolve-conflict`

### Simulation (SIMULATE, SANDBOX)
`run-simulation`, `snapshot-scenario`, `compare-outcomes`, `stress-test`, `model-failure`, `validate-hypothesis`, `sandbox-execute`, `measure-impact`, `replay-scenario`

### Diplomatic (TREATY, SOVEREIGN)
`negotiate-boundary`, `enforce-treaty`, `validate-sovereignty`, `mediate-conflict`, `establish-protocol`, `audit-compliance`, `propose-amendment`, `ratify-agreement`, `escalate-dispute`

### Edge Compute (EDGE, PHANTOM)
`cache-at-edge`, `route-to-nearest`, `compress-payload`, `prefetch-resource`, `shed-load`, `replicate-state`, `ghost-execute`, `measure-latency`, `failover-region`

---

## 8. Universally Blocked Actions

The following actions are blocked across **all** domains:

- `evolve` / `evolution` / `self-modify` / `mutate-live`
- `delete-all-*` (mass deletion)
- `bypass-governance` / `disable-governance`
- `bypass-auth` / `disable-auth`
- `grant-admin`
- `expose-secrets`
- `shutdown-system`

---

## 9. Governor Controls

### Suspend a Node
```typescript
import { suspendNode } from '@/lib/substrate/autonomous-decision';
suspendNode('DEFENSE', 300_000); // 5-minute suspension
```

### Reinstate a Node
```typescript
import { reinstateNode } from '@/lib/substrate/autonomous-decision';
reinstateNode('DEFENSE');
```

### View Metrics
```typescript
import { getADAMetrics } from '@/lib/substrate/autonomous-decision';
const metrics = getADAMetrics();
// { totalDecisions, approvedCount, deniedCount, avgConfidence, ... }
```

### View Audit Log
```typescript
import { getADAuditLog } from '@/lib/substrate/autonomous-decision';
const recent = getADAuditLog(100); // Last 100 verdicts
```

### Full Reset
```typescript
import { resetADA } from '@/lib/substrate/autonomous-decision';
resetADA(); // Clears all state, trust scores, audit log
```

---

## 10. Integration Points

| System | Integration |
|--------|-------------|
| **NERVE** | Signal routing decisions use ADA before rerouting |
| **DEFENSE** | Threat response actions evaluated through ADA pipeline |
| **GOVERNANCE** | Can suspend/reinstate any node; receives escalated decisions |
| **CORTEX** | Orchestration decisions flow through operational domain |
| **Enhancement Mesh** | Always-on amplifiers can trigger ADA evaluations |
| **CLM** | Learning cycles can improve node trust scores |
| **AUDIT** | All verdicts are available for forensic analysis |

---

## 11. Performance Characteristics

| Metric | Value |
|--------|-------|
| Decision evaluation | O(1) — all lookups pre-indexed |
| Scope lookup | O(1) — Map-based |
| Audit log | Ring buffer (2,000 max) — bounded memory |
| Autonomy entries | Max 80 nodes — LRU eviction |
| Trust calibration | In-line with decision — no async overhead |

---

## 12. Design Philosophy

ADA follows the principle of **minimal viable autonomy**: nodes should have exactly enough decision-making power to handle their specialty efficiently, but no more. The 7-gate pipeline ensures that:

1. **Competence is verified** — only domain experts decide within their domain
2. **Confidence is required** — uncertain decisions are escalated
3. **Trust is earned** — new nodes start neutral and build credibility
4. **Evolution is impossible** — the system cannot rewrite itself through ADA
5. **Accountability is total** — every decision is hashed and logged
6. **Recovery is instant** — any node can be suspended in one call

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-23 | System | Initial ADA v1.0.0 documentation |

---

© 2025–2026 PromptFluid®. Confidential.
