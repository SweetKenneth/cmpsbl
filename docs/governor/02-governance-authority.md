# 02 — Governance & Authority

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. Your Role

You are the **single human authority** with ultimate decision-making power over the CMPSBL substrate. You:

- Approve or reject evolution proposals that exceed auto-promotion confidence
- Set system-wide policy via the GOVERNANCE plane
- Have override authority on all automated decisions
- Own the credential transfer and succession plan
- Bear responsibility for the system's ethical boundaries

---

## 2. Autonomy Levels

| Level | Description | Examples |
|-------|-------------|---------|
| **Full Autonomy** | System acts without approval | Health monitoring, telemetry, cache, CLM cycling, memory tier enforcement |
| **Guided Autonomy** | System acts with soft constraints | NEXUS routing, provider selection, cost optimization, INTENT scoring |
| **Supervised** | System proposes, you approve | Config changes, capability promotion, policy updates, ENGINEER proposals |
| **Restricted** | You initiate, system executes | Credential rotation, tier changes, data deletion, governance mode switching |
| **Forbidden** | No execution path exists | Disabling AUDIT, bypassing DEFENSE, modifying GOVERNANCE logic |

---

## 3. Decision Authority Matrix

| Decision | Auto | Governor Required |
|----------|------|------------------|
| Mutation with confidence ≥ 0.95 | ✅ | ❌ |
| Mutation with confidence 0.85–0.94 | ❌ | ✅ (review) |
| Mutation with confidence < 0.70 | ❌ Rejected | N/A |
| Circuit breaker open | ✅ | ❌ |
| Cascade arrest | ✅ | ❌ |
| Module quarantine | ✅ | Notified |
| Evolution pipeline reset | ❌ | ✅ |
| Governance policy change | ❌ | ✅ |
| Emergency shutdown | ✅ (if P0) | Notified |
| Secret rotation | ❌ | ✅ |
| Tier/pricing changes | ❌ | ✅ |
| IP protection override | ❌ | ✅ (red line) |
| Agent deployment | ❌ | ✅ |
| AutoBlog publish override | ❌ | ✅ |
| Disaster recovery backup | ❌ | ✅ (admin-initiated) |

---

## 4. Governance Modes

You can set the system operating mode via ATLAS:

| Mode | Description | When to Use |
|------|-------------|-------------|
| **ACTIVE** | Full governance enforcement, all approvals required | Default / normal operation |
| **OBSERVE** | Governance monitors but does not block; logs for review | Diagnostic assessment |
| **LOCKDOWN** | No mutations permitted; read-only operation | Security incident, emergency |
| **EVOLVE** | Relaxed gates for controlled experimentation (shadow only) | Accelerated evolution cycles |

### Mode Transitions
- ACTIVE → OBSERVE (manual)
- ACTIVE → LOCKDOWN (manual or automatic on critical alert)
- ACTIVE → EVOLVE (manual, requires your confirmation)
- LOCKDOWN → ACTIVE (manual, requires health verification)
- EVOLVE → ACTIVE (manual or automatic after target met)

---

## 5. Red Lines — Non-Negotiable Boundaries

These MUST NEVER be crossed, regardless of circumstances:

1. **No source code exposure** for sealed cognitives or crown jewel algorithms
2. **No governance self-modification** — SEBA cannot change its own constraints
3. **No user data leakage** — PII never leaves the tenant boundary
4. **No unauthorized environment deployment** — environment signature lock is absolute
5. **No audit trail tampering** — Merkle chain integrity is sacrosanct
6. **No bypass of promotion gates** — all 7 SEBA gates must pass
7. **No cross-tenant data access** — isolation is absolute
8. **No agent runtime escape** — sealed isolation is enforced
9. **No disabling CLM** — continuous learning is a system property
10. **No TSAC bypass** — truth preservation is mandatory for all evolution

---

## 6. Escalation Model

```
Level 0: Module handles autonomously
    ↓ (unresolvable)
Level 1: CORTEX pipeline reroutes
    ↓ (policy conflict)
Level 2: GOVERNANCE evaluates / INTENT Mesh translates
    ↓ (governance deadlock)
Level 3: Human override (via ATLAS Node Inbox) ← YOU
    ↓ (system-critical)
Level 4: Emergency shutdown (CORE kill switch)
```

| Level | Trigger | Response Time | Authority |
|-------|---------|--------------|-----------|
| 0 | Routine operation | Immediate | Module |
| 1 | Module failure | < 1s | CORTEX |
| 2 | Policy violation | < 5s | GOVERNANCE / INTENT |
| 3 | Governance deadlock | Operator-dependent | **Governor** |
| 4 | System-critical failure | Immediate | CORE |

---

## 7. Human Override Protocol

When you exercise override authority:

1. You authenticate via admin credentials
2. Override request is logged in AUDIT before execution
3. GOVERNANCE records the override with your identity and justification
4. Override is applied with automatic 30-minute monitoring
5. If override causes degradation, automatic rollback triggers
6. All overrides visible in ATLAS Node Inbox history

---

## 8. Abuse Prevention (What the System Guards Against)

| Vector | Mitigation |
|--------|-----------|
| Excessive API calls | Ironclad rate limiting (per-key, per-IP, per-module) |
| Credential stuffing | Behavioral analysis, progressive delays |
| Privilege escalation | RBAC enforcement, Crown Jewel isolation |
| Data exfiltration | RLS, query limits, anomaly detection |
| Prompt injection | DECODE sanitization, DEFENSE payload analysis |
| Self-modification | Immutable governance logic, boot protection |
| Agent escape | Sealed runtime, source-blocked execution |
| Cost inflation | ECONOMY quotas, NEXUS cost ledger, budget caps |

---

© 2025–2026 PromptFluid®. Governor Eyes Only.
