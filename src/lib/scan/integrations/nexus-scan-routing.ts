/**
 * NEXUS Scan-Aware Routing (#7)
 * Routes scanner findings to the optimal AI model based on category.
 * Security debt → reasoning models, UI debt → vision models, etc.
 */

import { routeToBestModel, type TaskType } from '@/lib/nexus/router';
import { getProviderHealthMetrics, selectOptimalProvider } from '@/lib/nexus/healthRouter';

export type ScanCategory =
  | 'security'
  | 'performance'
  | 'accessibility'
  | 'complexity'
  | 'dead_code'
  | 'config_drift'
  | 'rls_policy'
  | 'secret_exposure'
  | 'migration'
  | 'test_coverage';

interface ScanRoutingDecision {
  category: ScanCategory;
  taskType: TaskType;
  preferredProvider: string | null;
  modelHint: string | null;
  rationale: string;
  estimatedTokens: number;
}

/**
 * Category → TaskType affinity map
 * Maps scanner finding categories to the NEXUS task types
 * that are best suited for analyzing/fixing them.
 */
const CATEGORY_AFFINITY: Record<ScanCategory, {
  taskType: TaskType;
  rationale: string;
  tokenEstimate: number;
}> = {
  security: {
    taskType: 'reasoning',
    rationale: 'Security findings require deep logical analysis to trace attack vectors and validate fixes',
    tokenEstimate: 4000,
  },
  rls_policy: {
    taskType: 'reasoning',
    rationale: 'RLS policy gaps need precise SQL reasoning to generate correct row-level security',
    tokenEstimate: 3000,
  },
  secret_exposure: {
    taskType: 'reasoning',
    rationale: 'Secret exposure requires careful analysis of git history and environment boundaries',
    tokenEstimate: 2000,
  },
  performance: {
    taskType: 'code',
    rationale: 'Performance bottlenecks need code-level optimization (N+1 queries, waterfalls)',
    tokenEstimate: 3500,
  },
  complexity: {
    taskType: 'code',
    rationale: 'Complexity reduction requires refactoring suggestions and code restructuring',
    tokenEstimate: 4500,
  },
  dead_code: {
    taskType: 'code',
    rationale: 'Dead code detection needs AST-level understanding of import/export trees',
    tokenEstimate: 2000,
  },
  accessibility: {
    taskType: 'text',
    rationale: 'Accessibility fixes are primarily semantic HTML and ARIA attribute corrections',
    tokenEstimate: 1500,
  },
  config_drift: {
    taskType: 'text',
    rationale: 'Config drift analysis compares expected vs actual configuration states',
    tokenEstimate: 1000,
  },
  migration: {
    taskType: 'code',
    rationale: 'Migration health requires understanding SQL schema evolution patterns',
    tokenEstimate: 2500,
  },
  test_coverage: {
    taskType: 'code',
    rationale: 'Test coverage estimation needs code analysis to identify untested paths',
    tokenEstimate: 3000,
  },
};

/**
 * Route a scanner finding to the optimal NEXUS model
 */
export function routeScanFinding(category: ScanCategory): ScanRoutingDecision {
  const affinity = CATEGORY_AFFINITY[category];
  
  // Get health metrics to pick the healthiest provider for this task type
  const healthMetrics = getProviderHealthMetrics();
  const optimal = selectOptimalProvider(affinity.taskType);

  return {
    category,
    taskType: affinity.taskType,
    preferredProvider: optimal?.provider ?? null,
    modelHint: optimal?.model ?? null,
    rationale: affinity.rationale,
    estimatedTokens: affinity.tokenEstimate,
  };
}

/**
 * Batch-route multiple categories, deduplicating providers
 */
export function routeScanBatch(categories: ScanCategory[]): {
  decisions: ScanRoutingDecision[];
  totalEstimatedTokens: number;
  uniqueProviders: string[];
} {
  const decisions = categories.map(routeScanFinding);
  const totalEstimatedTokens = decisions.reduce((sum, d) => sum + d.estimatedTokens, 0);
  const uniqueProviders = [...new Set(decisions.map(d => d.preferredProvider).filter(Boolean))] as string[];

  return { decisions, totalEstimatedTokens, uniqueProviders };
}

/**
 * Get the priority ordering of categories for a given scan
 * Higher-risk categories are routed first to consume budget on critical items
 */
export function getScanRoutingPriority(): ScanCategory[] {
  return [
    'secret_exposure',   // Critical: secrets in code
    'security',          // Critical: vulnerabilities
    'rls_policy',        // High: data access gaps
    'performance',       // High: user-facing impact
    'complexity',        // Medium: maintainability
    'migration',         // Medium: schema health
    'test_coverage',     // Medium: quality safety net
    'dead_code',         // Low: cleanup
    'config_drift',      // Low: consistency
    'accessibility',     // Low: compliance
  ];
}
