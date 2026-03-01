# 03 — Trade Secrets & Competitive Moat

**Classification:** 🔒 INTERNAL — Trade Secret

---

## 1. Purpose

This document enumerates the strategic differentiators that constitute the substrate's competitive moat. These are the technical proof points — not marketing language — that make the system difficult to replicate.

## 2. Crown Jewels

### 2.1 Architectural Crown Jewels

| Secret | Description | Why It Matters |
|--------|-------------|----------------|
| Clockless execution model | Event-driven, demand-pulled, no timers | Eliminates idle compute, prevents false health signals |
| Triple-deferred boot | Three-stage initialization ensuring dependency correctness | Prevents cascade failures during cold start |
| Weighted Matrix Integrity | `I = Σ(hᵢ × wᵢ)` with enforced weight sum = 1.000 | Single-number system health that is mathematically deterministic |
| 24-module topology coherence | Six-zone architecture with field permeation | No competitor has this topological completeness |
| Governance-gated self-evolution | SEBA with 7-gate promotion pipeline | Autonomous improvement without human bottleneck, with safety |

### 2.2 Experience Crown Jewels

| Secret | Protection Level |
|--------|-----------------|
| Composable Cognitives reasoning prompts | Black-boxed, sealed runtime |
| SEBA/CORTEX recursive self-improvement | Permanently hidden from all tiers |
| Memory graph embedding strategies | Service-role write only, authenticated read |
| Artifact Pack construction logic | Source visibility disabled |

## 3. Competitive Moat Components

### 3.1 Constant Learning Compounding

The system compounds learning over time through:

1. **SM-2 spaced repetition** — knowledge retention improves with usage
2. **DREAM cycle optimization** — offline learning discovers patterns humans miss
3. **Evolution receipt chain** — every improvement is cryptographically linked to its predecessor
4. **No reset boundary** — unlike session-based AI, learning persists across all interactions

**Compounding formula:**
```
Knowledge_value(t) = K₀ × (1 + learning_rate)^t - decay_losses(t)
```

This creates an exponential advantage: the longer the system runs, the more valuable it becomes.

### 3.2 Governance-Gated Autonomy

Most AI systems are either fully autonomous (dangerous) or fully manual (slow). The substrate occupies a unique position:

- Proposals are generated autonomously (SEBA)
- Validation is deterministic (7-gate pipeline)
- Promotion requires confidence ≥ 0.80
- Rollback is automatic if post-deployment health drops
- All decisions are immutably audited

### 3.3 Leader-Gated Persistence

- Only the leader instance writes periodic snapshots
- Non-leaders can request manual flush but do not run schedule loops
- Prevents write conflicts in multi-instance deployments
- Provides cluster-safe state management without external coordination services

## 4. IP Protection Enforcement

### 4.1 Black-Box Protocol

All high-value artifacts follow a 10-point enforcement interface:

1. ❌ Source code visibility
2. ❌ Prompt/memory leakage
3. ❌ Internal configuration exposure
4. ❌ System graph visibility
5. ❌ Cross-project bleed
6. ❌ Exports of sealed items
7. ❌ Duplication
8. ❌ Cloning
9. ❌ Composition into discovery engines
10. ❌ Reverse engineering via API probing

### 4.2 Environment Signature Lock

Substrate modules validate the deployment environment ID on initialization. Modules will not boot in unauthorized projects.

### 4.3 Distribution Tiers

| Tier | Access Level |
|------|-------------|
| Free | Read-only exploration, limited capabilities |
| Creator | Standard capabilities, no sealed runtime access |
| Architect | Advanced capabilities, limited sealed access |
| Enterprise | Full capability access, dedicated support |

## 5. Internal Threshold Defaults (DO NOT EXTERNALIZE)

| Parameter | Value | Module |
|-----------|-------|--------|
| Circuit breaker failure threshold | 3 | ALL |
| Circuit breaker open duration | 60s | ALL |
| SM-2 minimum ease factor | 1.3 | MEMORY |
| Memory confidence gate | 0.30 | BRAIN |
| Evolution promotion confidence | 0.80 | EVOLUTION |
| Integrity health minimum for evolution | 60% | SYSTEM |
| Cascade detection window | 30s | RIPPLE |
| Cascade module threshold | 3 | RIPPLE |
| WAL buffer flush interval | 30s (leader) | CONTROL PLANE |
| Snapshot commit interval | 5min (leader) | CONTROL PLANE |
| Cache TTL (chat) | 5min | NEXUS |
| Cache TTL (system) | 2h | NEXUS |
| LRU eviction threshold | 1000 entries | NEXUS |

## 6. Strategic Differentiators vs. Competitors

| Differentiator | CMPSBL | Typical AI Platforms |
|---------------|--------|---------------------|
| Persistent memory | ✅ SM-2 tiered, no resets | ❌ Session-scoped |
| Self-evolution | ✅ Governed, audited | ❌ Manual updates only |
| Multi-provider routing | ✅ 14-provider fleet | ❌ Single provider |
| Cryptographic audit | ✅ Merkle chain | ❌ Plain text logs |
| Offline optimization | ✅ DREAM cycles | ❌ None |
| Circuit isolation | ✅ Per-module breakers | ❌ Global or none |
| Governance plane | ✅ Self-referential | ❌ Manual review |

## 7. Handling Policy

- **Record** strategic differentiators with technical proof points, not marketing language.
- **Promote** to non-secret docs only after explicit governor review.
- **Preserve** deterministic examples and constraints for reproducibility.
- **Rotate** any threshold that becomes externally known.

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial trade secrets consolidation |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
