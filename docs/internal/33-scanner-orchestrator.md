# 33 — Scanner Orchestrator & Substrate Integration

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

The scanner orchestrator integrates deeply with the substrate's core modules to prioritize, verify, and remediate technical debt. It is not a standalone tool — it leverages NEXUS, VISION, MEMORY, DEFENSE, CORTEX, DREAM, and the Intent Mesh for intelligent debt management.

## 2. Module Integration Map

### 2.1 NEXUS Integration

| Capability | Description |
|------------|-------------|
| Scan-aware routing | Maps finding categories to optimal AI models |
| Cost-optimized triage | Budget-aware depth levels for analysis |
| Failover resilience | Automatic provider fallback during scanning |
| Multi-model consensus | 2-of-3 agreement for ambiguous findings |

### 2.2 VISION Integration

| Capability | Description |
|------------|-------------|
| Performance-correlated debt | Cross-references live metrics with findings |
| Error hotspot mapping | Identifies top error paths and boosts related finding priority |
| Regression detection loops | Post-fix metrics gate confirms improvement |
| Resource profiling | Translates debt into waste grades (A–F) |

**Impact Score Formula:**
```
impact = error_rate_weight × error_frequency + latency_weight × p95_impact + user_impact_weight × affected_users
```

**Coverage Gap Detection:** Paths with >5 errors but zero scanner findings are flagged as gaps.

### 2.3 MEMORY Integration

| Capability | Description |
|------------|-------------|
| Cross-session deduplication | Prevents re-reporting known findings |
| Semantic clustering | Groups related findings for batch remediation |
| Decay-weighted priority | Older unresolved findings get increasing urgency |

### 2.4 DEFENSE/IMMUNITY Integration

| Capability | Description |
|------------|-------------|
| Threat correlation | Calculates exploitability scores for findings |
| Attack surface mapping | Maps findings to potential attack vectors |
| Self-healing scanner | Automatic retries and fallbacks on scanner failures |

### 2.5 CORTEX/DREAM Integration

| Capability | Description |
|------------|-------------|
| Cognitive load estimation | Estimates developer effort for each finding |
| Dream cycle optimization | Offline pattern analysis for remediation strategies |

### 2.6 Intent Mesh Integration

| Capability | Description |
|------------|-------------|
| Cross-scanner resolution | Multi-module voting to resolve conflicting findings |
| Affinity-based routing | Routes findings to the module best equipped to fix them |

## 3. Scanning Pipeline

```
1. Trigger scan (manual, scheduled, or finding-driven)
2. NEXUS routes scan requests to optimal AI providers
3. Scan results collected and normalized
4. MEMORY deduplicates against known findings
5. VISION correlates with live telemetry
6. DEFENSE scores exploitability
7. CORTEX estimates remediation effort
8. Findings prioritized by composite score
9. Results surfaced in Evolution Control Center
10. False positive feedback fed back to scanner learning
```

## 4. Finding Prioritization

Composite priority score:

```
priority = (severity × 0.30) + (exploitability × 0.25) + (user_impact × 0.20) + (remediation_ease × 0.15) + (age_decay × 0.10)
```

| Priority Band | Score | Action |
|---------------|-------|--------|
| Critical | ≥ 85 | Immediate attention, blocks promotions |
| High | 70–84 | Next sprint, ENGINEER alert |
| Medium | 50–69 | Backlog, monitored |
| Low | < 50 | Tracked, no immediate action |

## 5. Regression Detection

Post-fix verification loop:

```
1. Capture pre-fix metrics (via VISION)
2. Apply fix
3. Wait for stabilization window
4. Capture post-fix metrics
5. Compare: if improvement → confirm fix, if regression → revert
```

Verdict logic:
- **Improved:** Post-fix metric > pre-fix metric by ≥ 5%
- **Neutral:** Within ±5% — fix accepted but monitored
- **Regressed:** Post-fix metric < pre-fix metric by > 5% — fix reverted

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial scanner orchestrator documentation — v13.1.0 |

---

© 2025–2026 PromptFluid®. Confidential.
