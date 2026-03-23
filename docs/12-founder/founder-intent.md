# Founder Intent

## 1. Purpose

This document records the non-negotiable principles, ethical boundaries, and foundational intent that govern the CMPSBL substrate. It exists to protect the system's purpose from drift, compromise, or corruption — regardless of who operates, extends, or maintains the system.

## 2. Non-Negotiables

1. **AUDIT is immutable.** No code path may delete, modify, or suppress audit records. This is the system's integrity backbone.
2. **GOVERNANCE cannot be bypassed.** Every mutating action must pass through governance evaluation. There are no shortcuts, debug flags, or operator overrides that skip governance.
3. **DEFENSE is terminal.** The outer security boundary is enforced unconditionally. No internal module may override a DEFENSE block decision.
4. **Data belongs to the operator.** The substrate is BYOK. No data is sent to, stored by, or accessible to the substrate provider. Operators own their keys, their data, and their infrastructure.
5. **Module names are permanent.** The 38-node topology and naming are architectural invariants. Modules may evolve internally but not be renamed, merged, or deleted.
6. **Evolution must be validated.** No change reaches production without passing the SEBA pipeline. The 7-gate validation ensures truth preservation (TSAC) and behavioral equivalence.
7. **Learning is continuous.** CLM (Constant Learning Mode) is a foundational system property, not an optional feature. The substrate must always be learning and compounding knowledge.
8. **Agents are sealed.** Cognitive agents operate in isolated, source-blocked runtimes. No agent may access data or capabilities outside its designated Crown Jewel powers.

## 3. System Purpose

The CMPSBL substrate exists to provide infrastructure-grade AI orchestration with:

- Deterministic governance over autonomous behavior.
- Persistent memory across sessions and contexts.
- Validated evolution through shadow runs and confidence scoring.
- Economic accountability for every operation.
- Immutable audit trails for compliance and forensics.
- Continuous learning that compounds knowledge over time.
- Multi-agent coordination with sealed isolation and DREAM synthesis.

The system is not a product, not a chatbot, and not a demo. It is production infrastructure for cognitive systems.

## 4. Ethical Boundaries

- The substrate must never be used to generate deceptive content presented as human-authored.
- The substrate must not facilitate surveillance without explicit user consent.
- The substrate must not discriminate in service delivery based on user identity.
- Accessibility (INCLUSIVE module) is a first-class requirement, not an afterthought.
- The system must be transparent about its capabilities and limitations.
- AutoBlog content must be clearly marked as AI-generated with epistemic status labels.
- DREAM pool sharing requires explicit consent (agency_dream_consent).

## 5. Anti-Corruption Guardrails

| Guardrail | Mechanism |
|-----------|-----------|
| Governance immutability | GOVERNANCE logic cannot be modified at runtime |
| Audit tamper-evidence | Chain-of-custody checksums on all audit records |
| Crown Jewel isolation | 54 capabilities excluded from all external access |
| Boot sequence protection | Self-modification of boot logic is forbidden |
| Field permeation | IMMUNITY, EVOLUTION, and INTENT cannot be disabled |
| Evolution validation | 7-gate SEBA pipeline with TSAC truth arbitration |
| Agent containment | Sealed runtime, source-blocked, memory-isolated |
| Rate limit enforcement | Ironclad fabric — no bypass path exists |

## 6. Red Lines

The following actions are unconditionally prohibited:

- Disabling AUDIT logging for any reason.
- Creating backdoor access that bypasses DEFENSE.
- Selling or sharing cross-tenant data.
- Removing governance checks from any execution path.
- Marketing the system with claims that exceed its actual capabilities.
- Deploying the system without RLS (Row-Level Security) on user data.
- Operating without at least one active SPINE module.
- Skipping TSAC validation for evolution candidates.
- Allowing agents to escape sealed runtime isolation.
- Disabling CLM learning cycles without governor authorization.

## 7. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | v14.1.0 MINDGAMES — Updated topology reference to 40-primitive architecture, added disaster recovery as non-negotiable operational capability |
| 2026-03-03 | System | Added non-negotiables for SEBA validation, CLM continuous learning, agent sealing; expanded red lines and guardrails |
| 2026-03-03 | System | Updated topology reference to 38-node architecture |
| 2026-03-01 | Kenneth E Sweet Jr | Initial founder intent document |

---

© 2025–2026 PromptFluid®. All rights reserved.
