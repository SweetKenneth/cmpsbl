# 04 — Non-Negotiables & Red Lines

**Classification:** INTERNAL — Team Members Only  
**Priority:** 🔴 MANDATORY — Memorize Before Writing Any Code or Making Any Decision

---

## 1. The 8 Architectural Invariants

These are permanent. They are not suggestions. They cannot be overridden by any team member, any deadline, or any customer request.

| # | Invariant | What It Means for You |
|---|-----------|----------------------|
| 1 | **AUDIT is immutable** | No code path may delete, modify, or suppress audit records. If you're tempted to "clean up" audit logs — stop. |
| 2 | **GOVERNANCE cannot be bypassed** | Every mutating action passes governance. No debug flags, no shortcuts, no "just this once" overrides. |
| 3 | **DEFENSE is terminal** | The outer boundary is enforced unconditionally. No primitive overrides a DEFENSE block. |
| 4 | **Data belongs to the operator** | BYOK (Bring Your Own Keys). No user data is ever sent to, stored by, or accessible to us as the platform provider. |
| 5 | **Primitive names are permanent** | The 40-primitive topology is an architectural invariant. They evolve internally but are never renamed, merged, or deleted. |
| 6 | **Evolution must be validated** | No change reaches production without passing the 7-gate SEBA pipeline with TSAC truth preservation. |
| 7 | **Learning is continuous** | CLM is a foundational property, not optional. The system must always be learning. |
| 8 | **Agents are sealed** | Cognitive agents run in isolated, source-blocked runtimes. No agent accesses data outside its Crown Jewel powers. |

---

## 2. The 10 Absolute Prohibitions

These are **unconditionally prohibited**. Violating any of these is a termination-level event.

1. ❌ Disabling AUDIT logging for any reason
2. ❌ Creating backdoor access that bypasses DEFENSE
3. ❌ Selling or sharing cross-tenant data
4. ❌ Removing governance checks from any execution path
5. ❌ Marketing with claims exceeding actual capabilities
6. ❌ Deploying without RLS on user data
7. ❌ Operating without at least one active SPINE module
8. ❌ Skipping TSAC validation for evolution candidates
9. ❌ Allowing agents to escape sealed runtime isolation
10. ❌ Disabling CLM learning cycles without governor authorization

---

## 3. Ethical Boundaries

These guide all product, marketing, and engineering decisions:

- **Never generate deceptive content** presented as human-authored
- **No surveillance** without explicit user consent
- **No discrimination** in service delivery based on identity
- **Accessibility (INCLUSIVE Agent)** is first-class, not an afterthought
- **Transparent** about capabilities and limitations — never oversell
- **AutoBlog content** clearly marked as AI-generated with epistemic status
- **DREAM pool sharing** requires explicit consent

---

## 4. Anti-Corruption Guardrails

These are engineered into the system — not just policy.

| Guardrail | Mechanism |
|-----------|-----------|
| Governance immutability | Logic cannot be modified at runtime |
| Audit tamper-evidence | Chain-of-custody checksums |
| Crown Jewel isolation | 54 capabilities excluded from all external access |
| Boot sequence protection | Self-modification of boot logic forbidden |
| Field permeation | IMMUNITY, EVOLUTION, INTENT cannot be disabled |
| Evolution validation | 7-gate SEBA with TSAC truth arbitration |
| Agent containment | Sealed, source-blocked, memory-isolated |
| Rate limit enforcement | Ironclad fabric — no bypass path |

---

## 5. When In Doubt

If you encounter a situation where you're unsure whether an action violates a non-negotiable:

1. **Stop.**
2. **Refer to this document.**
3. **Escalate to the governor (Kenneth E Sweet Jr) at founder@CMPSBL.com.**
4. **Do not proceed until you have explicit authorization.**

The default answer is always "no" when a non-negotiable might be at risk.

---

© 2025–2026 CMPSBL®. Internal Use Only.
