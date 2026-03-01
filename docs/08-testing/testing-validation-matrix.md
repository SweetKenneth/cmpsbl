# Testing & Validation Matrix

## 1. Purpose

This document defines the testing strategy, coverage expectations, and validation gates for the CMPSBL substrate.

## 2. Unit Coverage Expectations

| Layer | Coverage Target | Focus Areas |
|-------|----------------|-------------|
| Core utilities | ≥ 90% | State calculations, integrity checks, weighted sums |
| Module logic | ≥ 80% | Input validation, output formatting, error handling |
| UI components | ≥ 70% | Rendering, user interactions, accessibility |
| Integration adapters | ≥ 60% | API contract compliance, error mapping |

## 3. Integration Testing Layers

| Layer | Scope | Method |
|-------|-------|--------|
| Module-to-Module | Cross-module communication via RELAY | Contract tests |
| Module-to-Database | Data persistence and RLS | Integration tests with test database |
| Module-to-Provider | AI provider interaction | Mock provider + contract verification |
| End-to-End | Full request lifecycle | Automated browser tests |

## 4. Regression Policy

- Every bug fix must include a regression test.
- Regression suite runs on every PR and before every deployment.
- Regression failures block deployment.
- Regression tests are never deleted — only deprecated with documentation.

## 5. Load Testing Thresholds

| Metric | Acceptable | Warning | Failure |
|--------|-----------|---------|---------|
| Throughput | ≥ 100 req/s | < 80 req/s | < 50 req/s |
| Latency p95 | < 2s | < 5s | ≥ 5s |
| Error rate | < 0.1% | < 1% | ≥ 1% |
| Memory usage | < 70% | < 85% | ≥ 85% |
| CPU usage | < 60% | < 80% | ≥ 80% |

## 6. Chaos Testing

| Scenario | Method | Expected Outcome |
|----------|--------|-----------------|
| Module crash | Kill module process | Circuit breaker opens, system degrades gracefully |
| Database latency | Inject 500ms delay | Timeout handling, degraded response |
| Provider timeout | Block outbound requests | NEXUS failover to alternate provider |
| Network partition | Drop inter-module traffic | RIPPLE detects cascade, isolates affected modules |
| Memory pressure | Allocate 90% memory | Graceful degradation, no OOM crash |

## 7. Failure Injection Scenarios

| Scenario | Injection Point | Validation |
|----------|----------------|-----------|
| CORE boot failure | CORE initialization | System does not start, clear error message |
| GOVERNANCE timeout | GOVERNANCE evaluation | Action queued, not silently approved |
| AUDIT write failure | AUDIT storage | Level 3 escalation triggered, system continues |
| DEFENSE overload | DEFENSE throughput | Rate limiting activates, no bypass |
| MEMORY corruption | MEMORY read path | Integrity check fails, fallback to cold tier |

## 8. Acceptance Gates

| Gate | Required For | Criteria |
|------|-------------|---------|
| Unit tests pass | All PRs | 100% pass rate |
| Integration tests pass | All PRs | 100% pass rate |
| Regression suite pass | Deployment | 100% pass rate |
| Load test pass | Minor+ releases | All metrics within acceptable range |
| Chaos test pass | Epoch releases | All scenarios handled gracefully |
| Security scan pass | All deployments | No critical or high vulnerabilities |
| Accessibility audit | All UI changes | WCAG 2.2 AA compliance |

## 9. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial canonical testing matrix |

---

© 2025–2026 PromptFluid®. All rights reserved.
