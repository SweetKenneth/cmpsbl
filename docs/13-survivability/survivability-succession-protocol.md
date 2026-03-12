# Survivability & Succession Protocol

## 1. Purpose

This document defines the procedures for ensuring the CMPSBL substrate survives founder incapacity, team changes, and organizational transitions. The system must remain operational, governed, and auditable regardless of personnel changes.

## 2. Credential Transfer Plan

| Credential Category | Storage | Transfer Method | Transfer Authority |
|--------------------|---------|----------------|-------------------|
| Infrastructure access | Hardware security module / vault | In-person or notarized transfer | Founder or legal designee |
| Database credentials | Encrypted vault with dead-man switch | Sealed envelope + digital backup | Founder |
| AI provider keys | Per-operator vault | Operator retains own keys (BYOK) | Operator |
| Admin credentials | Encrypted cold storage | Multi-party recovery | 2-of-3 key holders |
| Domain / DNS | Registrar account | Account transfer protocol | Legal entity |
| Code repository | Version control platform | Ownership transfer | Legal entity |
| Stripe / payment keys | Encrypted vault | Sealed transfer protocol | Founder |
| Agent JWT secrets | Per-agent scoped vault | Rotated on transfer | Successor |

### Dead-Man Switch

If the primary credential holder is unreachable for 30 consecutive days:

1. Designated successor receives sealed credential package.
2. Successor authenticates via pre-registered identity verification.
3. All credential access is logged in AUDIT.
4. Governance continuity procedures activate.

## 3. Ownership Continuity

- The substrate IP is held by the legal entity (PromptFluid®), not by individuals.
- Ownership transfer follows standard corporate asset transfer procedures.
- The Founder Intent document (doc 12) survives ownership changes — it is an architectural constraint, not a policy preference.
- Any new owner must acknowledge and preserve the non-negotiables (including SEBA validation, CLM continuity, and agent sealing).

## 4. Governance Continuity

- GOVERNANCE module logic is immutable and survives personnel changes.
- Governance policies are stored in version-controlled configuration, not in operator memory.
- Policy changes require EVOLUTION shadow runs and GOVERNANCE approval (7-gate SEBA).
- No single individual can modify governance unilaterally.
- ATLAS governance hub provides 4 modes (ACTIVE, OBSERVE, LOCKDOWN, EVOLVE) that persist across operator transitions.

### Succession of Authority

```
Founder (current)
    ↓ (incapacity or departure)
Designated Technical Successor
    ↓ (if unavailable)
Legal Entity Representative
    ↓ (if entity dissolved)
Open Source Stewardship (if applicable)
```

## 5. System Self-Sufficiency

The substrate is designed to operate autonomously during succession transitions:

| System | Continuity Guarantee |
|--------|---------------------|
| CLM (Constant Learning) | Continues cycling topics without operator input |
| ENGINEER | Continues health scans and proposal generation |
| INTEL | Continues signal aggregation and IntelCard generation |
| Ironclad | Auto-restore loop runs every 30 seconds |
| NEXUS | Provider failover operates independently |
| AutoBlog | Publish governor manages cadence autonomously |
| Scanner Orchestrator | Regression detection continues automatically |
| SHADOW | Shadow runs for queued proposals continue |

## 6. Emergency Procedures

### Founder Incapacity

1. Dead-man switch activates after 30 days of no contact.
2. Successor receives credentials and operational authority.
3. System continues operating — no manual intervention required for steady-state.
4. Successor reviews and acknowledges Founder Intent document.
5. ATLAS governance mode defaults to ACTIVE during transition.

### Key Person Loss (Non-Founder)

1. Credential rotation for all credentials accessible to the departed person.
2. AUDIT review of recent actions by the departed person.
3. Access revocation within 4 hours of confirmed departure.
4. Knowledge transfer documentation updated.
5. Agent JWT secrets rotated if person had agent access.

### Legal Entity Dissolution

1. All operator data remains with operators (BYOK model ensures this).
2. Self-hosted licensees retain perpetual rights per license agreement.
3. Source code disposition follows legal entity dissolution terms.
4. AUDIT records are preserved for compliance retention periods.
5. Agent marketplace purchases are perpetual — no ongoing dependency.

## 7. System Survival Guarantees

| Scenario | Survival Method |
|----------|----------------|
| Founder incapacity | Dead-man switch + designated successor |
| Team turnover | Documentation-driven operations (34-page internal library), immutable governance |
| Infrastructure provider change | BYOK model, standard PostgreSQL + Deno |
| AI provider shutdown | NEXUS multi-provider routing, operator swaps keys |
| Legal entity change | Founder Intent preserved as architectural constraint |
| Internet disruption | Self-hosted deployments operate independently |
| Economic downturn | Self-hosted perpetual license, no ongoing payments required |
| Knowledge loss | CLM preserves and compounds learned knowledge; 34-page internal library documents all trade secrets |

### Minimum Viable Operation

The substrate can operate with:

- One PostgreSQL instance.
- One Deno edge runtime.
- One AI provider API key.
- One operator with admin credentials.
- No external dependencies beyond the above.
- CLM, ENGINEER, and Ironclad continue automated operations.

## 8. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | v14.1.0 MINDGAMES — Updated to 40-node topology, added one-click disaster recovery backup as survival guarantee, memory tier self-enforcement |
| 2026-03-03 | System | Added system self-sufficiency guarantees, CLM/ENGINEER/INTEL/Ironclad continuity, agent JWT transfer, 34-page library reference, ATLAS governance mode default |
| 2026-03-03 | System | Verified succession protocol for v13.1.0 |
| 2026-03-01 | Kenneth E Sweet Jr | Initial survivability and succession protocol |

---

© 2025–2026 PromptFluid®. All rights reserved.
