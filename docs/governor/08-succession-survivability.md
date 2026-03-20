# 08 — Succession & Survivability

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. Credential Transfer Plan

| Category | Storage | Transfer Method | Authority |
|----------|---------|----------------|-----------|
| Infrastructure access | Hardware security module / vault | In-person or notarized | Founder or legal designee |
| Database credentials | Encrypted vault + dead-man switch | Sealed envelope + digital backup | Founder |
| AI provider keys | Per-operator vault | Operator retains (BYOK) | Operator |
| Admin credentials | Encrypted cold storage | Multi-party recovery (2-of-3) | Key holders |
| Domain / DNS | Registrar account | Account transfer protocol | Legal entity |
| Code repository | Version control platform | Ownership transfer | Legal entity |
| Stripe / payment keys | Encrypted vault | Sealed transfer protocol | Founder |
| Agent JWT secrets | Per-agent scoped vault | Rotated on transfer | Successor |

---

## 2. Dead-Man Switch

If the primary credential holder is unreachable for **30 consecutive days**:

1. Designated successor receives sealed credential package
2. Successor authenticates via pre-registered identity verification
3. All credential access logged in AUDIT
4. Governance continuity procedures activate

---

## 3. Succession of Authority

```
Founder (current)
    ↓ (incapacity or departure)
Designated Technical Successor
    ↓ (if unavailable)
Legal Entity Representative
    ↓ (if entity dissolved)
Open Source Stewardship (if applicable)
```

---

## 4. System Self-Sufficiency During Transitions

These systems continue operating without governor input:

| System | Continuity Guarantee |
|--------|---------------------|
| CLM (Learning) | Continues cycling topics autonomously |
| ENGINEER | Continues health scans and proposal generation |
| INTEL | Continues signal aggregation and IntelCard generation |
| Ironclad | Auto-restore loop runs every 30 seconds |
| NEXUS | Provider failover operates independently |
| AutoBlog | Publish governor manages cadence autonomously |
| Scanner | Regression detection continues automatically |
| SHADOW | Shadow runs for queued proposals continue |

**Decisions requiring governor approval are queued, not rejected.** The system waits for authority.

---

## 5. Governance Continuity

- GOVERNANCE module logic is immutable and survives personnel changes
- Policies stored in version-controlled configuration, not operator memory
- Policy changes require SEBA shadow runs and GOVERNANCE approval
- No single individual can modify governance unilaterally
- ATLAS defaults to ACTIVE mode during transitions

---

## 6. Ownership Continuity

- Substrate IP held by legal entity (PromptFluid®), not individuals
- Founder Intent document survives ownership changes — architectural constraint, not policy
- New owners must acknowledge and preserve non-negotiables (SEBA, CLM, agent sealing)

---

## 7. Minimum Viable Operation

The substrate operates with:
- One PostgreSQL instance
- One Deno edge runtime
- One AI provider API key
- One operator with admin credentials
- CLM, ENGINEER, and Ironclad continue automated operations

No external dependencies beyond the above.

---

## 8. Survival Scenarios

| Scenario | Survival Method |
|----------|----------------|
| Founder incapacity | Dead-man switch + designated successor |
| Team turnover | Documentation-driven ops (34-page internal library), immutable governance |
| Infrastructure change | BYOK, standard PostgreSQL + Deno |
| AI provider shutdown | NEXUS multi-provider routing |
| Legal entity change | Founder Intent preserved as architectural constraint |
| Internet disruption | Self-hosted deployments operate independently |
| Economic downturn | Self-hosted perpetual license |
| Knowledge loss | CLM preserves and compounds knowledge; internal library documents all trade secrets |

---

© 2025–2026 PromptFluid®. Governor Eyes Only.
