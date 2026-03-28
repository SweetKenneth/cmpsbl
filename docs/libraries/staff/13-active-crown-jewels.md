# CMPSBL® Active Crown Jewels — Operational Registry

**Classification:** 🔒 INTERNAL — Team Members Only  
**Version:** v17.0.0  
**Last Updated:** 2026-03-28

---

## Status Summary

| Metric | Count |
|--------|-------|
| **Total Crown Jewels** | 233 |
| **Active (approved)** | 222 |
| **Safety-Gated (disabled)** | 11 |
| **Architecture (substrate-only)** | 209 |
| **Experience (sealed, 4-tier)** | 24 |
| **Code files audited** | 229 ✅ |
| **Structural errors found** | 0 |
| **TypeScript fixes applied** | 5 (Map iterator compatibility) |

---

## Why Were Crown Jewels Off?

All 233 Crown Jewels were **not previously disabled for a safety reason** — they were in an `approved: false` default state because the activation pipeline required explicit governor approval per wave. Each wave of jewels was mined, scored (CJPI), and queued for activation. Until the governor explicitly approved each wave, they sat in a "discovered but dormant" state.

**The substrate could NOT use those capabilities while they were off.** They existed as registered entries in the S-Tier registry but were not loaded into the runtime capability graph. Turning them on made them available to all substrate primitives that reference them.

**No capabilities were turned off for danger reasons** — they were simply awaiting activation. The important ones (SEBA, Governance, Defense, Brain) were exactly the kind of capabilities that should have been activated earlier. The activation gap was procedural, not safety-driven.

---

## Safety-Gated Crown Jewels (11 Disabled)

These 11 Crown Jewels involve **ungated code-writing, architecture mutation, or autonomous self-modification** and are disabled until human-in-the-loop evolution gating is production-ready:

| Rank | ID | Name | Module | Risk |
|------|----|------|--------|------|
| 12 | S-123 | Mutation Proposal Engine | EVOLUTION | Generates system mutations autonomously |
| 72 | S-CJ72 | Recursive Self-Optimization Core | CORTEX | Self-modifying execution paths |
| 73 | S-CJ73 | Recursive Architecture Refactorer | SYSTEM | Rewrites architecture code |
| 78 | S-CJ78 | Autonomous Ops Steward | SYSTEM | Autonomous operations without oversight |
| 101 | S-CJ101 | Recursive Self-Improvement Pipeline | EVOLUTION | A/B tested self-improvement (code writes) |
| 102 | S-CJ102 | Evolution Engine | EVOLUTION | Core evolution — generates code mutations |
| 107 | S-CJ107 | Autonomous Operator | SYSTEM | Fully autonomous system operator |
| 119 | S-CJ119 | Autonomous Workflow Composer | CORTEX | Auto-creates executable workflows |
| 130 | S-CJ130 | Topology Mutation | SYSTEM | Runtime topology rewrite |
| 137 | S-CJ137 | Shadow Evolution | MODERNIZER | Shadow code mutations |
| 140 | S-CJ140 | Entropy Reversal | SYSTEM | Automated codebase cleanup |

**Re-activation criteria:** These will be re-enabled ONLY when:
1. The `pf-evolution-patch` edge function enforces Propose → Audit → Apply workflow
2. ENCODE's CLM curriculum gates all mutations through governor approval
3. No code is committed without human review

---

## Active Learning-Style Self-Improvement (Safe — ON)

These Crown Jewels involve **learning, observation, healing, and governance** — NOT code-writing:

| Rank | ID | Name | Module | Why Safe |
|------|----|------|--------|----------|
| 8 | S-126 | Self-Healing Orchestrator | IMMUNITY | Heals via circuit breakers, not code writes |
| 92 | S-CJ92 | Self-Scaling Intelligence Fabric | SYSTEM | Demand prediction (observational only) |
| 104 | S-CJ104 | Self-Documentation Engine | SYSTEM | Doc generation from runtime (read-only) |
| 108 | S-CJ108 | Self Governance | GOVERNANCE | Adaptive rule evolution (governance-gated) |
| 118 | S-CJ118 | Self-Repair Engine | MEDIC | Repair dispatch within bounded MEDIC protocols |

---

## Experience Crown Jewels — 4-Tier Mapping

Experience Crown Jewels are now mapped to the four subscription tiers:

### Builder (Free) — 8 Capabilities
Foundational sealed capabilities available to all users:
- Recursive Goal Optimizer
- Recursive Emergent Behavior Analyzer
- End-to-End Reasoning Pipeline
- Chaos Resilience Framework
- Event Dedup Intelligence
- Value Attribution Engine
- System Health Aggregation
- Terminal Command Parser

### Creator ($29/mo) — +20 Capabilities
Enhanced capabilities for shipping products:
- Self-Healing Mesh
- Creative Evolution Engine
- Creative Forge
- Behavioral Biometrics
- Mutation Testing
- Intent Evolution Tracker
- + 14 Wave 2-6 Creator capabilities

### Studio ($49/mo) — +40 Capabilities
Professional capabilities with full trace exports:
- All Creator capabilities
- Provider Trust Scoring
- Anomaly Precognition
- Knowledge Distillation
- Semantic Debt Detector
- + 36 Wave 2-6 Studio capabilities

### Architect ($79/mo) — All Experience CJs
Full access to all Experience Crown Jewels:
- All Studio capabilities
- Knowledge Graph Topology
- Emergent Threat Anticipator
- Audit-Grade Decision Ledger
- Decision Confidence Governor
- Friction Auto-Removal Engine
- Autonomous Evolution (bounded)
- + all remaining Architect-tier capabilities

---

## Architecture Crown Jewels — Substrate-Only (209)

**NEVER surfaced externally. No exceptions.**

These power the substrate's internal intelligence and are classified by module:

| Module | Count | Key Capabilities |
|--------|-------|-----------------|
| BRAIN | 13 | Semantic Knowledge Graph, Embedding Store, Meta-Learning, Cognitive Bootstrapping |
| CORTEX | 14 | Pipeline Composition, Self-Optimization*, Load Balancing, Strategic Foresight |
| GOVERNANCE | 11 | Veto Authority, Self-Audit Loop, Autonomy Budget, Intelligence Kernel |
| EVOLUTION | 7 | Mutation Proposal*, Shadow Run, Evolution A/B, Rollback, Sandbox |
| SYSTEM | 8 | Boot Resolver, Architecture Refactorer*, Topology Mutation*, Entropy Reversal* |
| DEFENSE | 5 | Honeypot Intelligence, Containment, Threat Anticipator, Adversarial Simulation |
| DREAM | 8 | Nocturne Consolidation, Pattern Extraction, Hallucination Guard |
| NERVE | 4 | Consensus Heartbeat, Partition Detection, Quorum Negotiator |
| NEXUS | 4 | Fleet Intelligence, Cost-Aware Routing, Multi-Model Consensus |
| MEDIC | 5 | Autonomous Triage, Predictive Failure, Self-Repair |
| + 18 more | 130 | Full coverage across all 40 primitives |

*Starred items are currently safety-gated (disabled)*

---

## Audit Results (2026-03-28)

### Code File Audit
- **229 implementation files** scanned in `src/crownjewels/s-tier/`
- **0 structural errors** (brace matching, empty files)
- **5 TypeScript fixes applied:** Map iterator spread operators (`[...map.values()]`) replaced with `Array.from()` for `downlevelIteration` compatibility
- Files fixed: 139, 143, 172, 222 (4 files, 5 fixes)

### Registry Audit
- All 233 entries in `s-tier.registry.json` validated
- 222 entries `approved: true`
- 11 entries `approved: false` with `safetyGate: 'human-in-the-loop-required'`
- No orphaned entries (all IDs match code files or `hasCode: false`)
- No duplicate IDs

### Tier Map Audit
- `EXPERIENCE_TIER_MAP` updated from 2-tier (creator/architect) to 4-tier (builder/creator/studio/architect)
- `getExperienceJewelTier()` return type updated
- All downstream consumers compile clean

---

## Non-Negotiable Rules

1. **Architecture jewels are NEVER exported** — no exception
2. **Experience jewels are SEALED ONLY** — black-boxed via `blackbox.ts`
3. **Safety-gated CJs remain off** until human-in-the-loop evolution is production-ready
4. **ENCODE may NOT auto-commit code** — learning only, no writes
5. **New jewels default to Architecture** — promotion requires governor approval
6. **The 4-tier gate must be enforced** — Builder gets 8, not all

---

© 2025–2026 CMPSBL®. Internal Use Only.
