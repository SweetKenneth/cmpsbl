# Governance & Autonomy Doctrine

## 1. Purpose

This document defines the governance model, autonomy boundaries, and escalation procedures for the CMPSBL substrate. It establishes what the system may do independently, what requires approval, and what is unconditionally forbidden.

## 2. Scope

This doctrine applies to all 40 nodes across 12 sectors, all control planes, and all execution paths within the substrate. It governs both automated and human-initiated actions.

## 3. Autonomy Model

The substrate operates under a **supervised autonomy** model:

| Autonomy Level | Description | Examples |
|----------------|-------------|---------|
| **Full Autonomy** | System acts without approval | Health monitoring, telemetry collection, cache management, CLM topic cycling, ENGINEER health scans, memory tier enforcement |
| **Guided Autonomy** | System acts with soft constraints | NEXUS routing decisions, provider selection, cost optimization, INTENT affinity scoring |
| **Supervised** | System proposes, human approves | Configuration changes, capability promotion, policy updates, ENGINEER proposals via Node Inbox |
| **Restricted** | Human initiates, system executes | Credential rotation, tier changes, data deletion, governance mode switching (ATLAS), disaster recovery backup |
| **Forbidden** | No execution path exists | Disabling AUDIT, bypassing DEFENSE, modifying GOVERNANCE logic |

## 4. ATLAS Governance Hub

ATLAS serves as the unified governance UI with 7 tabs:

| Tab | Purpose |
|-----|---------|
| Topology | 40-node matrix visualization and health |
| Node Inbox | Approval queue for ENGINEER proposals and INTENT requests |
| Evolution | SEBA pipeline, shadow runs, promotion history |
| Scanner | Finding priority, regression detection, coverage gaps |
| Agents | Marketplace, sealed runtime management |
| Analytics | System economics, cost tracking, developer adoption metrics |
| Settings | Governance mode, thresholds, alert configuration |

### Governance Modes

| Mode | Behavior |
|------|----------|
| **ACTIVE** | Full governance enforcement, all approvals required |
| **OBSERVE** | Governance monitors but does not block; logs decisions for review |
| **LOCKDOWN** | No mutations permitted; read-only operation |
| **EVOLVE** | Relaxed gates for controlled experimentation (shadow runs only) |

## 5. Explicit Allowed Behaviors

- Process incoming requests through established routing paths.
- Monitor and report system health via ENGINEER node scans.
- Open circuit breakers on failing modules.
- Execute shadow runs for proposed changes (SHADOW module, CSZ).
- Collect and store telemetry data.
- Enforce rate limits and quota boundaries (Ironclad fabric).
- Generate proposals for EVOLUTION changes.
- Adapt IMMUNITY defenses in response to detected threats.
- Route requests to optimal providers via NEXUS.
- Run CLM topic cycles (up to 14,400 calls/day) without approval.
- Generate INTEL signals and IntelCards for governor review.
- Score INTENT affinity matrix entries.
- Execute Scanner Orchestrator scans and regression detection.
- AutoBlog: generate drafts, run confidence/contradiction engines, detect semantic drift.
- Enforce memory tier capacity limits (hot → warm → cold cascade).
- Track first-party visitor analytics without external dependencies.
- Manage developer API key quotas and usage metering.

## 6. Explicit Forbidden Behaviors

- Modifying GOVERNANCE evaluation logic at runtime.
- Disabling or bypassing AUDIT logging.
- Overriding DEFENSE block decisions.
- Accessing data outside the requesting user's RLS scope.
- Promoting changes without EVOLUTION validation gates (7-gate SEBA pipeline).
- Executing code outside SANDBOX isolation.
- Sharing cross-tenant data without explicit consent.
- Deleting audit records.
- Self-modifying boot sequence logic.
- Bypassing TSAC (Truth Shadow Arbitration Check) for evolution candidates.
- Publishing AutoBlog posts without publish governor approval.
- Deploying agents outside sealed runtime isolation.

## 7. Escalation Model

```
Level 0: Module handles autonomously
    ↓ (unresolvable)
Level 1: CORTEX pipeline reroutes
    ↓ (policy conflict)
Level 2: GOVERNANCE evaluates / INTENT Mesh translates
    ↓ (governance deadlock)
Level 3: Human operator override (via ATLAS Node Inbox)
    ↓ (system-critical)
Level 4: Emergency shutdown (CORE kill switch)
```

| Level | Trigger | Response Time | Authority |
|-------|---------|--------------|-----------|
| 0 | Routine operation | Immediate | Module |
| 1 | Module failure, reroute needed | < 1s | CORTEX |
| 2 | Policy violation, governance check | < 5s | GOVERNANCE / INTENT |
| 3 | Governance deadlock, ENGINEER proposal | Operator-dependent | Human (ATLAS) |
| 4 | System-critical failure | Immediate | CORE |

## 8. Circuit Breaker Policy

- Every module has an independent circuit breaker (managed by Ironclad fabric).
- Breaker opens after **3 consecutive failures** within a 60-second window.
- Open breaker forces module health to **0.000**.
- Half-open state allows **1 test request** after 30-second cooldown.
- Breaker resets to closed after **2 consecutive successes** in half-open state.
- CORE breaker is system-critical: CORE failure halts the entire substrate.
- Ironclad auto-restore loop checks every 30 seconds for recoverable modules.
- Module-specific rate limits enforced (REFLEX: 500/s, EVOLUTION: 5/s, NEXUS: 200/s).

## 9. Shadow Execution Rules

- All proposed changes must complete a shadow run before production promotion (SHADOW module, CSZ).
- Shadow runs execute against real inputs but write to isolated storage.
- Shadow results are compared against current production behavior.
- Minimum **10 shadow cycles** required before promotion eligibility.
- Shadow runs must achieve **≥ 95% behavioral equivalence** to pass.
- Failed shadow runs generate a deviation report for review.
- TSAC (Gate 3 of SEBA) validates truth preservation across shadow results.
- Divergence scored: `0.50 × output_div + 0.30 × latency_div + 0.20 × error_div`.

## 10. Promotion Criteria (7-Gate SEBA Pipeline)

| Gate | Check | Threshold |
|------|-------|-----------|
| 1. Schema | Migration compatibility | Must pass |
| 2. Behavioral | Output equivalence vs. production | ≥ 95% |
| 3. TSAC | Truth Shadow Arbitration Check | Divergence < 0.05 |
| 4. Performance | Latency regression | < 10% degradation |
| 5. Error Rate | Errors during shadow run | < 1% |
| 6. GOVERNANCE | GOVERNANCE approval (via Node Inbox) | Required |
| 7. Security | DEFENSE review (if trust boundary crossed) | Required |

## 11. Rollback Conditions

Automatic rollback triggers:

- Error rate exceeds **5%** within 5 minutes of promotion.
- CORE integrity score drops below **0.700**.
- Any Tier 1 module (Spine) enters circuit-breaker open state.
- GOVERNANCE vetoes a promoted action post-deployment.
- Ironclad detects bulkhead pressure exceeding threshold.

Manual rollback available:

- Operator can initiate rollback at any time via Evolution Control Center (`/evolution`).
- One-click rollback restores previous state from snapshot + WAL replay.
- Dry-run impact preview available before rollback execution.

## 12. Audit Guarantees

- Every governance decision is logged with: timestamp, action, actor, decision, reasoning.
- Audit records are append-only and immutable.
- Audit log integrity is verified via chain-of-custody checksums.
- Retention: minimum 90 days for operational logs, indefinite for security events.
- AUDIT module failure does not halt the system but triggers Level 3 escalation.
- INTEL aggregation pipeline deduplicates and enriches audit signals into IntelCards.

## 13. Human Override Protocol

1. Operator authenticates via admin credentials.
2. Override request is logged in AUDIT before execution.
3. GOVERNANCE records the override with operator identity and justification.
4. Override is applied with automatic monitoring for 30 minutes post-action.
5. If override causes system degradation, automatic rollback is triggered.
6. All overrides visible in ATLAS Node Inbox history.

## 14. ENGINEER Node Governance

The ENGINEER node (Mechanist) operates with guided autonomy:

- **Allowed**: Scan 76 engines and 24 meta-engines for health, generate findings and proposals.
- **Requires Approval**: All proposals routed through INTENT Hub → ATLAS Node Inbox.
- **Forbidden**: Direct mutation of production state without governor sign-off.
- CLM topic requests dispatched by ENGINEER are auto-approved for learning cycles.
- INTEL dispatch for enrichment runs under guided autonomy.

## 15. Abuse Prevention Model

| Vector | Mitigation |
|--------|-----------|
| Excessive API calls | Ironclad rate limiting (per-key, per-IP, per-module) |
| Credential stuffing | Behavioral analysis, progressive delays |
| Privilege escalation | RBAC enforcement, Crown Jewel isolation |
| Data exfiltration | RLS, query result limits, anomaly detection |
| Prompt injection | DECODE input sanitization, DEFENSE payload analysis |
| Self-modification | Immutable governance logic, boot sequence protection |
| Agent escape | Sealed runtime isolation, source-blocked execution |
| Cost inflation | ECONOMY quotas, NEXUS cost ledger, budget caps |

## 16. Risk Classification Table

| Risk | Severity | Likelihood | Mitigation | Owner |
|------|----------|-----------|-----------|-------|
| CORE failure | Critical | Low | Redundant boot, snapshot recovery, disaster backup | CORE |
| Cascade chain | High | Medium | RIPPLE detection, circuit breakers, Ironclad bulkheads | RIPPLE |
| Data breach | Critical | Low | RLS, encryption, DEFENSE | DEFENSE |
| Governance bypass | Critical | Very Low | Immutable logic, audit trail | GOVERNANCE |
| Provider outage | Medium | Medium | NEXUS multi-provider fallover, consensus routing | NEXUS |
| Cost overrun | Medium | Medium | ECONOMY quotas, rate limits | ECONOMY |
| Shadow run divergence | Low | Medium | TSAC validation, deviation reports | SHADOW |
| Evolution regression | Medium | Low | Scanner Orchestrator regression detection | EVOLUTION |
| Agent runtime escape | High | Very Low | Sealed runtime, memory isolation | DEFENSE |
| Full infrastructure loss | Critical | Very Low | One-click disaster recovery backup with AI-ready restoration guide | CORE |

## 17. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | v14.1.0 MINDGAMES — Updated to 40-node topology, added disaster recovery governance, developer API metering, memory tier enforcement, visitor analytics |
| 2026-03-03 | System | Added ATLAS governance hub, 7-gate SEBA pipeline, ENGINEER governance, Ironclad references, INTENT/INTEL/SHADOW integration |
| 2026-03-03 | System | Updated to 38-node topology; added AutoBlog autonomous governance |
| 2026-03-01 | System | Initial canonical doctrine |

---

© 2025–2026 PromptFluid®. All rights reserved.
