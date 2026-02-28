# SCANNER — Technical Debt Elimination Pipeline

## Purpose
The Scanner is a 5-phase forensic auditing pipeline that discovers, understands, secures, quantifies, and evolves unknown codebases. It integrates with NEXUS (routing), VISION (telemetry), and EVOLUTION (proposal tracking) to autonomously target and eliminate technical debt.

## Architecture

### Pipeline Phases

| Phase | Name | Modules | Purpose |
|---|---|---|---|
| 0 | Discovery | 5 | Fingerprint repo, schema, deps, env, self-assessment |
| 1 | Understanding | 5 | Routes, auth flows, data flows, dead code, config drift |
| 2 | Security | 5 | RLS, privilege escalation, secrets, CORS, rate limits |
| 3 | Tech Debt | 5 | Complexity, migrations, test coverage, performance, a11y |
| 4 | Evolution | 5 | Suggestions, priority ranking, cross-scan learning, tripwires, reports |

### Core Infrastructure

| Module | Path | Purpose |
|---|---|---|
| Orchestrator | `scanner-orchestrator.ts` | Master pipeline sequencer, type hub, re-exports |
| Auto-Escalate | `auto-escalate.ts` | Dynamic depth increase on risk detection |
| Correlation | `correlation-scoring.ts` | Multi-source weighted confidence scoring |
| False Positive Suppression | `false-positive-suppression.ts` | Fingerprint/pattern/category suppression |
| Scan Cache | `scan-cache.ts` | TTL-based result caching, LRU eviction |
| Scan Diff | `scan-diff.ts` | Before/after comparison, regression tracking |

### Substrate Integrations

| # | Integration | Module | Path |
|---|---|---|---|
| 7 | Scan-Aware Routing | NEXUS | `integrations/nexus-scan-routing.ts` |
| 9 | Cost-Optimized Scanning | NEXUS | `integrations/nexus-cost-optimized.ts` |
| 10 | Failover-Resilient Scanning | NEXUS | `integrations/nexus-failover-scanning.ts` |
| 18 | Performance-Correlated Debt | VISION | `integrations/vision-performance-debt.ts` |
| 19 | Error Hotspot Mapping | VISION | `integrations/vision-error-hotspots.ts` |
| 22 | Regression Detection Loop | VISION | `integrations/vision-regression-loop.ts` |
| 23 | Proposal Chain Dependency | EVOLUTION | `integrations/evolution-proposal-chain.ts` |
| 27 | Auto-Regression Testing | EVOLUTION | `integrations/evolution-auto-regression.ts` |

## Phase 0: Discovery

### Repo Fingerprint (`discovery/repo-fingerprint.ts`)
15+ framework/stack probes — detects React, Vue, Next.js, Supabase, Prisma, etc. from file patterns and config files. Outputs `RepoFingerprint` with detected frameworks, languages, and confidence scores.

### Schema Introspection (`discovery/schema-introspection.ts`)
Automated database modeling — parses migration files, Prisma schemas, and SQL definitions to build `SchemaMap` with tables, columns, relationships, and indexes.

### Dependency Graph (`discovery/dependency-graph.ts`)
Parses package manifests, enriches with vulnerability data. Outputs `DependencyGraph` with direct/transitive deps and known CVEs.

### Self-Assessment (`discovery/self-assessment.ts`)
Generates prompts for the system to evaluate its own capabilities against the discovered repo. Outputs `SelfAssessmentPrompt` with gap analysis.

### Environment Detection (`discovery/environment-detection.ts`)
Topology mapping, hardcoded secret detection, env var analysis. Outputs `EnvironmentProfile` with services, secrets exposure risk, and deployment topology.

## Phase 1: Understanding

### Route/Endpoint Mapper (`understanding/route-endpoint-mapper.ts`)
Attack surface mapping — extracts all route definitions, API endpoints, and their auth requirements. Outputs `RouteMap`.

### Auth Flow Tracer (`understanding/auth-flow-tracer.ts`)
Lifecycle analysis — traces signup → login → session → logout flows, identifies gaps. Outputs `AuthFlowAnalysis`.

### Data Flow Analyzer (`understanding/data-flow-analyzer.ts`)
Tracks untrusted input from entry to exit — form submissions, API params, query strings. Outputs `DataFlowAnalysis` with taint paths.

### Dead Code Detector (`understanding/dead-code-detector.ts`)
AST-level import/export tree analysis. Identifies unused exports, unreachable code paths. Outputs `DeadCodeReport`.

### Config Drift Scanner (`understanding/config-drift-scanner.ts`)
Compares expected vs actual configuration states across environments. Outputs `ConfigDriftReport`.

## Phase 2: Security

### RLS Completeness (`security/rls-completeness.ts`)
Table-level policy audit — checks every public table for SELECT/INSERT/UPDATE/DELETE policies. Outputs `RLSCompletenessReport`.

### Privilege Escalation (`security/privilege-escalation.ts`)
Role bypass testing — identifies paths where lower-privilege users could access higher-privilege resources. Outputs `PrivilegeEscalationReport`.

### Secret Exposure (`security/secret-exposure.ts`)
Scans git history, client bundles, and source code for leaked API keys, tokens, and credentials. Outputs `SecretExposureReport`.

### CORS Header Auditor (`security/cors-header-auditor.ts`)
Validates CORS configuration against security best practices. Outputs `HeaderAuditReport`.

### Rate Limit Tester (`security/rate-limit-tester.ts`)
Analyzes rate limiting configuration and identifies unprotected endpoints. Outputs `RateLimitReport`.

## Phase 3: Tech Debt Quantification

### Complexity Scoring (`debt/complexity-scoring.ts`)
Cyclomatic and cognitive complexity metrics per file/function. Outputs `ComplexityReport` with hotspot identification.

### Migration Health (`debt/migration-health.ts`)
SQL schema evolution pattern analysis — detects drift, missing indexes, deprecated patterns. Outputs `MigrationHealthReport`.

### Test Coverage Estimator (`debt/test-coverage-estimator.ts`)
Estimates coverage via AST patterns — test file proximity, assertion density, path coverage. Outputs `TestCoverageEstimate`.

### Performance Predictor (`debt/performance-predictor.ts`)
Detects N+1 queries, waterfall patterns, missing pagination, large payload risks. Outputs `PerformanceReport`.

### Accessibility Scanner (`debt/accessibility-scanner.ts`)
WCAG compliance checking — semantic HTML, ARIA attributes, contrast ratios. Outputs `AccessibilityReport`.

## Phase 4: Evolution

### Suggestion Pairing (`evolution/suggestion-pairing.ts`)
Generates precise before/after code diffs for each finding. Outputs `SuggestionReport` with applicable patches.

### Priority Ranking (`evolution/priority-ranking.ts`)
Impact vs Effort matrix — ranks all findings by ROI. Outputs `PriorityRanking` with quadrant assignments.

### Cross-Scan Learning (`evolution/cross-scan-learning.ts`)
Distills heuristics from scan history — stack-specific hints, recurring patterns. Outputs `LearningCorpus`.

### Regression Tripwire (`evolution/regression-tripwire.ts`)
Generates verification checks that fire if a resolved finding reappears. Outputs `TripwireReport`.

### Progressive Disclosure (`evolution/progressive-disclosure.ts`)
Tiered reporting — Executive summary, Technical deep-dive, Raw telemetry. Outputs `ProgressiveReport`.

## Auto-Escalation Engine
Dynamic depth system: `shallow` → `standard` → `deep` → `forensic`

| Trigger | Threshold | Escalates To |
|---|---|---|
| Fatal finding | 1 | forensic |
| Error count | 5 | deep |
| Error count | 2 | standard |
| Severity ratio | 30%+ | deep |
| Category cluster | 3+ in one category | deep |

## Correlation Scoring
Multi-source weighted confidence:
```
score = sourceCorrelation × 0.4 + severityWeight × 0.35 + trustWeight × 0.25
```
Source trust weights: security (1.0), supabase (0.95), branding (0.95), seo (0.9), runtime (0.9), routes/hooks (0.85), modules/performance (0.8), a11y (0.75), ui (0.7).

## Scan Diffing
Compares consecutive scan results:
- **New findings** — appeared since last scan
- **Resolved findings** — disappeared since last scan
- **Regressions** — severity worsened
- **Improvements** — severity decreased
- **Net change** — new − resolved

## Scan Caching
TTL-based with LRU eviction (max 50 entries):
- `full` scan: 2 min TTL
- `seo`: 3 min TTL
- `branding`: 5 min TTL
- `quick`: 30s TTL

## False Positive Suppression
Auditable suppression by fingerprint, category, source, or regex pattern. Time-expiring rules with hit count tracking.

## Failure Modes
- **Phase failure**: Individual module crashes → skip with null result, continue pipeline
- **Budget exhaustion**: NEXUS budget depleted → defer low-priority, triage-only remaining
- **Provider failure mid-scan**: NEXUS failover reroutes to healthy provider
- **Regression detected**: VISION gate blocks promotion, recommends rollback
- **Cycle detected in proposals**: EVOLUTION DAG reports cycles, blocks circular dependencies

## Governance Implications
- All scan results are persisted as evolution receipts
- Proposal chains enforce ordered application to prevent partial breakage
- Auto-generated regression tests create persistent verification coverage
- Scan cost is metered through ACCESS per category and depth tier
- False positive suppressions are fully auditable with creator, reason, and expiry
