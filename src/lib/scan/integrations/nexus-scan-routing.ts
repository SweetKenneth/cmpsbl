/**
 * NEXUS Scan-Aware Routing (#7)
 * Routes scanner findings to the optimal AI model based on category.
 * Security debt → reasoning models, UI debt → vision models, etc.
 */

import type { TaskType } from '@/lib/nexus/router';
import { selectOptimalProvider } from '@/lib/nexus/healthRouter';

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
  taskType: string;
  preferredProvider: string | null;
  rationale: string;
  estimatedTokens: number;
}

/**
 * Category → task type affinity map
 */
const CATEGORY_AFFINITY: Record<ScanCategory, {
  taskType: string;
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
    taskType: 'generation',
    rationale: 'Accessibility fixes are primarily semantic HTML and ARIA attribute corrections',
    tokenEstimate: 1500,
  },
  config_drift: {
    taskType: 'analysis',
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

/** Map scan task type to NEXUS-compatible task type */
function toNexusTaskType(taskType: string): 'text' | 'image' | 'video' | 'research' | 'reasoning' | 'generation' | 'refinement' {
  const validTypes = ['text', 'image', 'video', 'research', 'reasoning', 'generation', 'refinement'] as const;
  if (validTypes.includes(taskType as any)) return taskType as any;
  // Map non-standard types
  if (taskType === 'code') return 'generation';
  if (taskType === 'analysis') return 'reasoning';
  return 'text';
}

/**
 * Route a scanner finding to the optimal NEXUS model
 */
export async function routeScanFinding(category: ScanCategory): Promise<ScanRoutingDecision> {
  const affinity = CATEGORY_AFFINITY[category];
  const nexusType = toNexusTaskType(affinity.taskType);
  const optimal = await selectOptimalProvider(nexusType);

  return {
    category,
    taskType: affinity.taskType,
    preferredProvider: optimal?.selectedProvider ?? null,
    rationale: affinity.rationale,
    estimatedTokens: affinity.tokenEstimate,
  };
}

/**
 * Batch-route multiple categories
 */
export async function routeScanBatch(categories: ScanCategory[]): Promise<{
  decisions: ScanRoutingDecision[];
  totalEstimatedTokens: number;
  uniqueProviders: string[];
}> {
  const decisions = await Promise.all(categories.map(routeScanFinding));
  const totalEstimatedTokens = decisions.reduce((sum, d) => sum + d.estimatedTokens, 0);
  const uniqueProviders = [...new Set(decisions.map(d => d.preferredProvider).filter(Boolean))] as string[];

  return { decisions, totalEstimatedTokens, uniqueProviders };
}

/**
 * Get the priority ordering of categories for a given scan
 */
export function getScanRoutingPriority(): ScanCategory[] {
  return [
    'secret_exposure',
    'security',
    'rls_policy',
    'performance',
    'complexity',
    'migration',
    'test_coverage',
    'dead_code',
    'config_drift',
    'accessibility',
  ];
}
