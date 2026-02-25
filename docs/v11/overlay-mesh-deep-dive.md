# Overlay Mesh Deep Dive — CMPSBL v11.1

## Classification: Technical Reference

---

## Overview

The **Overlay Mesh** is a five-layer protective behavioral stack that wraps all other substrate layers. Overlays process every request in strict hierarchical order, from outermost (DEFENSE) to innermost (GOVERNANCE). They are the last entities to boot and the first to intercept incoming operations.

---

## Mesh Hierarchy

```
Incoming Request
  → DEFENSE (Layer 1 — Perimeter)
    → IMMUNITY (Layer 2 — Adversarial)
      → EVOLUTION (Layer 3 — Self-Improvement)
        → INTENT (Layer 4 — Capability Routing)
          → GOVERNANCE (Layer 5 — Policy)
            → Target Node (Execution)
          ← GOVERNANCE response
        ← INTENT response
      ← EVOLUTION response
    ← IMMUNITY response
  ← DEFENSE response
← Response to caller
```

---

## DEFENSE — Perimeter Protection

**Weight**: 0.030 | **Position**: Outermost | **Boot Order**: 1st overlay

### Responsibilities

| Function | Detail |
|----------|--------|
| Threat detection | Pattern-based anomaly identification |
| Rate limiting | Per-IP and per-key throttling |
| IP reputation | Behavioral scoring of request sources |
| Request validation | Structural integrity of incoming payloads |

### Hardened State

| Collection | Bound | Eviction |
|-----------|-------|----------|
| Threat signals | 2,000 | Tail truncation |
| Behavioral baselines | 5,000 | LRU |
| IP reputation cache | 10,000 | TTL (24h) |
| Rate limit counters | 50,000 | TTL (1min/1day) |

### Escalation Path

```
Anomaly detected → Signal logged → Risk score calculated
  If risk > 0.7: Block + emit RIPPLE alert
  If risk > 0.5: Challenge (CAPTCHA/proof-of-work)
  If risk ≤ 0.5: Allow + monitor
```

---

## IMMUNITY — Adversarial Probing & Self-Healing

**Weight**: 0.030 | **Position**: 2nd from outside | **Boot Order**: 2nd overlay

### Responsibilities

| Function | Detail |
|----------|--------|
| Shadow training | Test new behaviors against real system gaps |
| Adversarial probing | Simulated attacks to test DEFENSE effectiveness |
| Self-healing | Autonomous repair of detected vulnerabilities |
| Regression detection | Monitor for capability degradation |

### Shadow Training Loop

```
1. EVOLUTION identifies system gap
2. IMMUNITY creates shadow environment
3. Executor practices fix in isolation
4. Results compared against baseline
5. Success → promote to production
6. Failure → route to ENCODE for analysis
```

### Key Properties

- Shadow executions never affect production state
- Each probe has a timeout (default: 30s)
- Failed probes increment executor failure counter
- Success rates tracked per executor-gap pair
- Skill progression follows 6-tier model (Novice → Master)

---

## EVOLUTION — Bounded Self-Improvement

**Weight**: 0.030 | **Position**: Middle | **Boot Order**: 3rd overlay

### Responsibilities

| Function | Detail |
|----------|--------|
| Gap scanning | Identifies optimization opportunities across all nodes |
| Proposal generation | Creates structured improvement proposals |
| Risk assessment | Evaluates proposal impact and rollback difficulty |
| CLM integration | Feeds Constant Learning Mode with discovered patterns |

### SEBA Framework

**S**elf-**E**volution via **B**ounded **A**dversarial feedback:

```
Scan → Classify → Shadow Execute → Validate → Absorb → Escalate
```

| Phase | Bounded By |
|-------|-----------|
| Scan | Max 100 nodes per cycle |
| Classify | 6 fixed categories |
| Shadow Execute | 30s timeout per attempt |
| Validate | Deterministic baseline comparison |
| Absorb | Governance approval required |
| Escalate | ENCODE capacity limit |

### Gap Categories

| Category | Description | Priority |
|----------|-------------|----------|
| `security` | Vulnerability or exposure | Critical |
| `resilience` | Failure handling deficiency | High |
| `performance` | Latency or throughput issue | Medium |
| `config` | Suboptimal configuration | Medium |
| `cleanup` | Dead code or obsolete patterns | Low |
| `observability` | Monitoring or logging gap | Low |

### Circuit Breaker Protection

EVOLUTION has a dedicated circuit breaker:
- Trips on 3 consecutive failed proposals
- Auto-reset after 1 hour
- All evolution halts when tripped
- Manual reset available via `evolution.reset`

---

## INTENT — Capability Mesh & Action Routing

**Weight**: 0.030 | **Position**: 2nd from inside | **Boot Order**: 4th overlay

### Responsibilities

| Function | Detail |
|----------|--------|
| Capability discovery | Maps actions to available execution surfaces |
| Action routing | Directs operations to optimal handler |
| Self-discovery | Introspection of substrate capabilities |
| Fallback resolution | Identifies alternative handlers when primary unavailable |

### Capability Resolution

```typescript
interface CapabilityMatch {
  action: string;           // Requested action
  handler: string;          // Matched execution surface
  confidence: number;       // Match confidence (0–1)
  alternatives: string[];   // Fallback handlers
  constraints: string[];    // Required permissions/entitlements
}
```

### Routing Rules

1. **Exact match**: Action name maps directly to handler → confidence 1.0
2. **Semantic match**: NLP similarity matching → confidence 0.5–0.9
3. **Category match**: Action category maps to surface → confidence 0.3–0.5
4. **No match**: Action rejected with `CAPABILITY_NOT_FOUND`

---

## GOVERNANCE — Policy Enforcement (Innermost)

**Weight**: 0.030 | **Position**: Innermost | **Boot Order**: 5th overlay (last)

### Responsibilities

| Function | Detail |
|----------|--------|
| Policy enforcement | Validates operations against governance rules |
| Consent management | Tracks data sharing permissions |
| Audit oversight | Ensures all mutations are logged |
| Ethical constraints | Applies ethical guardrails to AI operations |
| Sounding board | Advisory system for operational decisions |

### Governance Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `ACTIVE` | Standard operations | Default |
| `OBSERVE` | CLM/Dream/Evolution disabled | Quiet observation |
| `LOCKDOWN` | Aggressive rate limiting, mutations blocked | Incident response |
| `EVOLVE` | Accelerated learning, canary rollouts | Controlled evolution |

### Mode Transition Safety

- Mode changes require explicit rationale (logged in governance audit)
- TTL-based auto-revert: non-ACTIVE modes revert after configurable timeout
- Mode transitions emit RIPPLE events for downstream awareness
- LOCKDOWN mode is the only mode that can be activated without TTL

### Ethical Constraint Check

Every mutation passes through `ethicalConstraintCheck()`:
- Content safety validation
- Bias detection
- Privacy impact assessment
- Output bounded to governance policy

---

## Overlay Health Aggregation

```
overlay_health = (DEFENSE + IMMUNITY + EVOLUTION + INTENT + GOVERNANCE) / 5
```

Overlay sector contributes 15% to global Matrix Integrity.

---

## Cross-Overlay Communication

Overlays communicate exclusively through RIPPLE events — no direct overlay-to-overlay calls:

| Event | Producer | Consumer |
|-------|----------|----------|
| `defense.threat_detected` | DEFENSE | IMMUNITY, AUDIT |
| `immunity.shadow_complete` | IMMUNITY | EVOLUTION |
| `evolution.proposal_approved` | EVOLUTION | INTENT, GOVERNANCE |
| `intent.capability_discovered` | INTENT | EVOLUTION |
| `governance.mode_changed` | GOVERNANCE | All overlays |

---

*Technical Reference — CMPSBL v11.1 — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
