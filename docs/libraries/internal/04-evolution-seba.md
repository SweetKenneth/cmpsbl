# 04 — Evolution & SEBA Pipeline

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. Evolution Philosophy

The substrate evolves through **validated, auditable transitions** — never ad-hoc changes. Every modification must pass the EVOLUTION module's shadow-run pipeline before production promotion. Evolution is a system property, not a deployment event.

---

## 2. CSZ Architecture (Covert Systems Zone)

| Node | Role |
|------|------|
| **EVOLUTION** | Proposal intake, SEBA pipeline orchestration, promotion execution |
| **SHADOW** | Isolated shadow runs, divergence scoring, behavioral comparison |
| **PHANTOM** | Decoy operations, threat detection, A/B variant testing |

The CSZ is zone-shielded — failures cannot propagate to production.

---

## 3. The 7-Gate SEBA Validation Pipeline

Every change must pass all 7 gates:

| Gate | Check | Threshold | Owner |
|------|-------|-----------|-------|
| 1. Schema | Migration compatibility | Must pass | EVOLUTION |
| 2. Behavioral | Output equivalence vs. production | ≥ 95% | SHADOW |
| 3. TSAC | Truth Shadow Arbitration Check | Divergence < 0.05 | SHADOW |
| 4. Performance | Latency regression | < 10% degradation | EVOLUTION |
| 5. Error Rate | Errors during shadow run | < 1% | EVOLUTION |
| 6. GOVERNANCE | Governor approval via Node Inbox | Required | **YOU** |
| 7. Security | DEFENSE review (if trust boundary crossed) | Required | DEFENSE |

### TSAC (Gate 3)

TSAC ensures evolution candidates preserve system truth:
- Compares shadow output semantic equivalence against production baseline
- Detects meaning drift even when syntactic output differs
- Flags candidates that subtly alter behavior without explicit intent
- TSAC failures trigger **mandatory governor review** with full divergence report

---

## 4. Shadow Run Model

Shadow runs execute proposed changes against real inputs, writing results to isolated storage.

```
Proposal → Validation → Shadow Execution → Comparison → Scoring → Report
                                                            ↓
                                              [Pass] → Promotion Eligible
                                              [Fail] → Deviation Report
```

**Divergence formula:** `0.50 × output_div + 0.30 × latency_div + 0.20 × error_div`

- < 0.05: Pass
- 0.05–0.15: Review required
- > 0.15: Fail

**Minimum 10 shadow cycles** required before promotion eligibility.

---

## 5. Confidence Scoring

```
confidence = 0.40 × behavioral_equivalence
           + 0.20 × error_rate_score
           + 0.15 × performance_score
           + 0.15 × resource_score
           + 0.10 × sample_size_score
```

| Score | Classification | Action |
|-------|---------------|--------|
| 0.95–1.00 | High confidence | Auto-eligible for promotion |
| 0.85–0.94 | Moderate | **Manual review required (you)** |
| 0.70–0.84 | Low | Additional shadow runs needed |
| < 0.70 | Insufficient | Proposal rejected |

---

## 6. Convergence Criteria

A change is converged when:
1. Minimum 10 shadow cycles completed
2. Confidence ≥ 0.95 for 3 consecutive cycles
3. No regression in any validation gate
4. GOVERNANCE has not vetoed
5. Rollback plan documented and tested
6. TSAC divergence < 0.05 for all cycles

---

## 7. Rollback

### Automatic Rollback Triggers
- Error rate > 5% within 5 minutes of promotion
- CORE integrity < 0.700
- Any Spine module enters circuit-breaker open
- GOVERNANCE post-promotion veto
- Ironclad detects bulkhead pressure exceeding threshold
- Scanner Orchestrator detects regression

### Manual Rollback
- One-click via Evolution Control Center (`/evolution`)
- Restores from snapshot + WAL replay
- Dry-run impact preview available before execution
- Logged in AUDIT with your identity and justification

---

## 8. Promotion Workflow

```
Change Proposal
  → EVOLUTION receives
  → SHADOW run initiated (min 10 cycles)
  → TSAC pass? → Confidence ≥ 0.95?
  → GOVERNANCE review (Node Inbox) ← YOU APPROVE HERE
  → Promotion to production
  → 30-min Ironclad monitoring
  → Stable? → Complete | Unstable? → Auto-rollback
```

---

## 9. ENGINEER Integration

ENGINEER generates proposals based on:
- Health scans across 76 engines and 24 meta-engines
- CLM topic mastery signals
- INTEL enriched signals flagging optimization opportunities

All ENGINEER proposals enter SEBA at Gate 1 — same pipeline as manual proposals.

---

## 10. Epoch History

| Epoch | Versions | Significance |
|-------|----------|-------------|
| INFRASTRUCTURE | v1.0–v12.x | The substrate grew organs |
| IRONCLAD | v13.0–v13.x | The substrate grew armor |
| MINDGAMES | v14.0–current | The substrate opened its eyes and saw users |

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
