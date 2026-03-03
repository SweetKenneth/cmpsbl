# Testing & Validation Matrix

## 1. Purpose

This document defines the testing strategy, coverage expectations, and validation gates for the CMPSBL substrate.

## 2. Unit Coverage Expectations

| Layer | Coverage Target | Focus Areas |
|-------|----------------|-------------|
| Core utilities | ≥ 90% | State calculations, integrity checks, weighted sums |
| Module logic | ≥ 80% | Input validation, output formatting, error handling |
| Engine executors | ≥ 85% | 76 engines, 24 meta-engines, capability orchestration |
| UI components | ≥ 70% | Rendering, user interactions, accessibility |
| Integration adapters | ≥ 60% | API contract compliance, error mapping |
| Control plane | ≥ 90% | WAL, persistence, snapshot hashing, rehydration |

## 3. Integration Testing Layers

| Layer | Scope | Method |
|-------|-------|--------|
| Module-to-Module | Cross-module communication via RELAY | Contract tests |
| Module-to-Database | Data persistence and RLS | Integration tests with test database |
| Module-to-Provider | AI provider interaction via NEXUS | Mock provider + contract verification |
| SEBA Pipeline | Evolution shadow runs through 7 gates | End-to-end pipeline tests |
| INTEL Pipeline | Signal ingestion → deduplication → IntelCard generation | Pipeline integration tests |
| Agency Workflow | Task creation → execution → deliverable | Full workflow tests |
| End-to-End | Full request lifecycle | Automated browser tests |

## 4. Regression Policy

- Every bug fix must include a regression test.
- Regression suite runs on every PR and before every deployment.
- Regression failures block deployment.
- Regression tests are never deleted — only deprecated with documentation.
- Scanner Orchestrator performs automated regression detection post-promotion.

## 5. Load Testing Thresholds

| Metric | Acceptable | Warning | Failure |
|--------|-----------|---------|---------|
| Throughput | ≥ 100 req/s | < 80 req/s | < 50 req/s |
| Latency p95 | < 2s | < 5s | ≥ 5s |
| Error rate | < 0.1% | < 1% | ≥ 1% |
| Memory usage | < 70% | < 85% | ≥ 85% |
| CPU usage | < 60% | < 80% | ≥ 80% |
| NEXUS routing | < 50ms | < 200ms | ≥ 200ms |
| CLM throughput | ≥ 10 calls/min | < 8 calls/min | < 5 calls/min |

## 6. Shadow Run Testing (SHADOW Module)

The SHADOW module in CSZ provides production-grade testing:

| Aspect | Specification |
|--------|--------------|
| Isolation | Dedicated shadow namespace; no production writes |
| Input Source | Real production inputs (read-only) |
| Minimum Cycles | 10 per proposal |
| Divergence Formula | `0.50 × output + 0.30 × latency + 0.20 × error` |
| Pass Threshold | Divergence < 0.05, confidence ≥ 0.95 |
| TSAC Gate | Truth Shadow Arbitration Check — semantic equivalence validation |

Shadow runs serve as the substrate's primary production-safety testing mechanism.

## 7. Chaos Testing

| Scenario | Method | Expected Outcome |
|----------|--------|-----------------|
| Module crash | Kill module process | Circuit breaker opens, Ironclad isolates, system degrades gracefully |
| Database latency | Inject 500ms delay | Timeout handling, degraded response |
| Provider timeout | Block outbound requests | NEXUS failover to alternate provider |
| Network partition | Drop inter-module traffic | RIPPLE detects cascade, isolates affected modules |
| Memory pressure | Allocate 90% memory | Graceful degradation, no OOM crash |
| Ironclad bulkhead breach | Exceed rate limits on single module | Bulkhead isolates; other modules unaffected |
| CSZ isolation failure | Simulate shadow write to production | Write rejected; integrity seal verified |
| Agent runtime escape | Attempt cross-agency data access | RLS blocks; sealed runtime prevents access |

## 8. Failure Injection Scenarios

| Scenario | Injection Point | Validation |
|----------|----------------|-----------|
| CORE boot failure | CORE initialization | System does not start, clear error message |
| GOVERNANCE timeout | GOVERNANCE evaluation | Action queued, not silently approved |
| AUDIT write failure | AUDIT storage | Level 3 escalation triggered, system continues |
| DEFENSE overload | DEFENSE throughput | Ironclad rate limiting activates, no bypass |
| MEMORY corruption | MEMORY read path | Integrity check fails, fallback to cold tier |
| NEXUS provider cascade | All providers fail | Graceful degradation message, no hang |
| EVOLUTION TSAC failure | TSAC validation | Proposal blocked, deviation report generated |
| ENGINEER scan failure | Engine health scan | Partial findings reported, scan retried |

## 9. Scanner Orchestrator Validation

The Scanner Orchestrator provides continuous quality validation:

| Check | Trigger | Action |
|-------|---------|--------|
| Regression detection | Post-promotion | Compare metrics against baseline, alert on regression |
| Coverage gaps | Weekly scan | Identify modules without recent shadow runs |
| Finding priority | Per-scan | Composite score ranks technical debt |
| Trend analysis | Rolling 30-day window | Flag increasing finding density |

## 10. Acceptance Gates

| Gate | Required For | Criteria |
|------|-------------|---------|
| Unit tests pass | All PRs | 100% pass rate |
| Integration tests pass | All PRs | 100% pass rate |
| Regression suite pass | Deployment | 100% pass rate |
| Load test pass | Minor+ releases | All metrics within acceptable range |
| Chaos test pass | Epoch releases | All scenarios handled gracefully |
| Security scan pass | All deployments | No critical or high vulnerabilities |
| Accessibility audit | All UI changes | WCAG 2.2 AA compliance |
| SEBA pipeline pass | All evolution proposals | 7 gates cleared |
| Scanner baseline | Post-promotion | No regression detected |

## 11. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Added SHADOW testing, SEBA pipeline gates, Scanner Orchestrator validation, chaos testing for Ironclad/CSZ/agents, engine coverage targets |
| 2026-03-03 | System | Verified testing matrix for v13.1.0 |
| 2026-03-01 | System | Initial canonical testing matrix |

---

© 2025–2026 PromptFluid®. All rights reserved.
