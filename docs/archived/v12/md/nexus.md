# NEXUS — AI Provider Routing Node

## Purpose
NEXUS handles multi-provider AI routing, cost-quality optimization, fallback chains, latency prediction, health-based routing, provider circuit breakers, and **scan-aware model selection** for the technical debt elimination pipeline.

## Namespace
`nexus.*`

## Command Examples
```
nexus.route <prompt>        # Route to optimal provider
nexus.providers             # List available providers
nexus.health                # Provider health dashboard
nexus.costs                 # Cost estimation for providers
nexus.fallback              # Current fallback chain
nexus.batch <prompts>       # Batch routing
nexus.scan.route <category> # Route scanner finding to best model
nexus.scan.budget           # Scan budget allocation status
nexus.scan.failover         # Failover session health
```

## Response Shape
```typescript
interface NexusRouteResult {
  success: boolean;
  provider: string;
  model: string;
  response: string;
  latencyMs: number;
  costMillicents: number;
  fallbackUsed: boolean;
}
```

## Scanner Integration Capabilities

### (#7) Scan-Aware Routing
Routes scanner findings to the optimal AI model based on category affinity:

| Category | Task Type | Rationale |
|---|---|---|
| `security`, `rls_policy`, `secret_exposure` | `reasoning` | Deep logical analysis for attack vectors, SQL reasoning, env boundaries |
| `performance`, `complexity`, `dead_code`, `migration`, `test_coverage` | `code` / `generation` | Code-level optimization, refactoring, AST analysis |
| `accessibility` | `generation` | Semantic HTML and ARIA corrections |
| `config_drift` | `analysis` / `reasoning` | Expected vs actual state comparison |

**Key Functions:**
- `routeScanFinding(category)` → optimal provider + token estimate
- `routeScanBatch(categories[])` → parallel routing with deduplication
- `getScanRoutingPriority()` → severity-ordered category list

### (#9) Cost-Optimized Scanning
Four-tier depth system with budget gates:

| Depth | Max Tokens | Provider Preference | Use Case |
|---|---|---|---|
| `triage` | 500 | cheapest | Quick classification, free-tier models |
| `standard` | 2,000 | balanced | Standard analysis with fix suggestion |
| `deep` | 6,000 | best | Root cause + multiple fix paths |
| `forensic` | 12,000 | best | Full forensic trace with dependency impact |

Severity → starting depth: `critical` → deep, `high` → standard, `medium`/`low`/`info` → triage.
Auto-escalation requires budget check via `canSpend()` before promotion.

**Key Functions:**
- `planCostOptimizedScan(category, severity)` → depth plan with cost estimate
- `allocateScanBudget(categories[])` → budget allocation across all categories, defers low-priority if insufficient
- `recordScanCost(category, depth, tokens)` → post-execution metering

### (#10) Failover-Resilient Scanning
Session-scoped rerouting with circuit breaker integration:

- **Max attempts per task:** 3 (configurable)
- **Max reroutes per scan session:** 10 (configurable)
- **Circuit breaker integration:** Failed providers auto-excluded when circuit opens
- **Context preservation:** Completed tasks never re-executed; only pending/failed tasks reroute

**Key Functions:**
- `createFailoverSession(tasks[])` → managed scan session
- `selectScanProvider(state, taskId)` → provider avoiding known-failed
- `handleScanFailure(state, taskId, error)` → reroute or fail with reason
- `handleScanSuccess(state, taskId, result)` → record + update circuit
- `getSessionHealth(state)` → completion %, failed providers list

### (#42) Multi-Model Consensus
Routes ambiguous findings to multiple AI providers simultaneously for higher-confidence classification.

- **Model Selection:** Budget-aware greedy selection from category-specific model pools
- **Verdict Aggregation:** Weighted majority voting with configurable agreement threshold (default 70%)
- **Cost Control:** `maxBudgetMillicents` caps total spend per consensus request

**Key Functions:**
- `selectConsensusModels(category, config?)` → provider/model pairs within budget
- `aggregateVerdicts(findingId, verdicts, threshold?)` → confirmed/rejected/split verdict

## Core Modules
| Module | Path | Purpose |
|---|---|---|
| Router | `src/lib/nexus/router.ts` | Fleet management, provider outcomes |
| Health Router | `src/lib/nexus/healthRouter.ts` | Optimal provider selection |
| Circuit Breaker | `src/lib/nexus/circuitBreaker.ts` | Provider isolation on failure |
| Batch Routing | `src/lib/nexus/batchRouting.ts` | Multi-task routing strategies |
| Budget Governance | `src/lib/nexus/budgetGovernance.ts` | Spend limits, daily budgets |
| Cost Estimation | `src/lib/nexus/costEstimation.ts` | Pre-execution cost forecasting |
| Load Balancer | `src/lib/nexus/loadBalancer.ts` | Request distribution |
| Cache | `src/lib/nexus/cache.ts` | Response caching |
| Learning | `src/lib/nexus/learning.ts` | Provider performance learning |
| Metrics | `src/lib/nexus/metrics.ts` | Telemetry collection |
| Multi-Model Consensus | `src/lib/scan/integrations/nexus-multi-model-consensus.ts` | Scanner finding consensus |

## Failure Modes
- **Provider outage**: Primary provider unavailable → automatic fallback chain activation
- **All providers down**: Complete provider failure → graceful degradation with cached responses
- **Cost spike**: Estimated cost exceeds budget → downgrade to cheaper provider or reject
- **Mid-scan failure**: Provider fails during scan → reroute to next healthy provider without repeating completed work
- **Budget exhaustion**: Daily budget depleted → defer low-priority categories, triage-only for remaining

## Governance Implications
- Provider selection is governed by cost policies and compliance requirements
- Certain providers may be restricted by governance for specific data sensitivity levels
- All routed requests are metered through ACCESS for quota and billing
- Scan cost allocation is tracked per category and depth tier
- Failover reroute history is fully auditable
