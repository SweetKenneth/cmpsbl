/**
 * #19 — Performance Bottleneck Predictor
 * Identify N+1 queries, missing indexes, unbounded SELECTs,
 * and client-side data fetching waterfalls.
 */

export interface PerformanceReport {
  bottlenecks: PerformanceBottleneck[];
  queryIssues: QueryIssue[];
  bundleIssues: BundleIssue[];
  renderIssues: RenderIssue[];
  totalIssues: number;
  estimatedImpact: 'minimal' | 'moderate' | 'severe';
  recommendations: string[];
  scanTimestamp: string;
}

export interface PerformanceBottleneck {
  type: 'n_plus_1' | 'missing_index' | 'unbounded_query' | 'waterfall' | 'expensive_render' | 'large_payload' | 'sync_blocking';
  file: string;
  line: number | null;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fix: string;
}

export interface QueryIssue {
  type: 'select_star' | 'no_limit' | 'no_index_hint' | 'n_plus_1' | 'sequential_queries';
  file: string;
  code: string;
  recommendation: string;
}

export interface BundleIssue {
  type: 'no_lazy_loading' | 'large_import' | 'no_tree_shaking' | 'duplicate_dep';
  file: string;
  description: string;
  estimatedSizeKB: number;
}

export interface RenderIssue {
  type: 'missing_key' | 'inline_object' | 'missing_memo' | 'effect_dep' | 'large_list';
  file: string;
  description: string;
  recommendation: string;
}

// N+1 query patterns (fetching in a loop)
const N_PLUS_1_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /for\s*\([^)]+\)\s*\{[^}]*(?:\.select|\.find|\.get|\.query|\.fetch|supabase)\s*\(/s, description: 'Database query inside a loop — classic N+1 pattern' },
  { pattern: /\.map\s*\([^)]*=>[^}]*(?:await|\.then)[^}]*(?:\.select|\.find|\.get|\.query|fetch)\s*\(/s, description: 'Async database call inside .map() — sequential N+1' },
  { pattern: /forEach\s*\([^)]*=>[^}]*(?:await)[^}]*(?:\.select|\.find|\.from|fetch)\s*\(/s, description: 'Await inside forEach — sequential execution pattern' },
];

// Unbounded query patterns
const UNBOUNDED_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /\.select\s*\(\s*['"`]\*['"`]\s*\)(?!.*\.limit)/s, description: 'SELECT * without LIMIT — unbounded result set' },
  { pattern: /\.from\s*\(\s*['"`]\w+['"`]\s*\)(?!.*\.limit|.*\.range)/s, description: 'Query without pagination or limit' },
  { pattern: /SELECT\s+\*\s+FROM\s+\w+(?!\s+(?:LIMIT|WHERE|JOIN))/gi, description: 'Raw SELECT * without LIMIT clause' },
];

// Waterfall patterns (sequential data fetching)
const WATERFALL_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /const\s+\w+\s*=\s*await\s+\w+[^;]+;\s*\n\s*const\s+\w+\s*=\s*await\s+\w+/g, description: 'Sequential awaits — could be parallelized with Promise.all()' },
  { pattern: /useEffect\s*\([^}]*useEffect/s, description: 'Nested useEffect hooks — potential render waterfall' },
  { pattern: /useState.*\n.*useState.*\n.*useEffect.*\n.*useEffect/s, description: 'Multiple sequential data-fetching effects' },
];

// Render performance patterns
const RENDER_PATTERNS: Array<{ type: RenderIssue['type']; pattern: RegExp; description: string; recommendation: string }> = [
  { type: 'inline_object', pattern: /style\s*=\s*\{\s*\{/g, description: 'Inline style objects cause re-renders — extract to constant', recommendation: 'Extract style objects outside the component or use useMemo()' },
  { type: 'missing_key', pattern: /\.map\s*\([^)]*\)\s*=>\s*(?:<\w+(?!\s+key))/g, description: 'Array .map() rendering without key prop', recommendation: 'Add a unique key prop to each mapped element' },
  { type: 'effect_dep', pattern: /useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]+\},\s*\[\s*\]\s*\)/g, description: 'useEffect with empty deps but references state/props', recommendation: 'Review dependency array — missing deps cause stale closures' },
  { type: 'large_list', pattern: /\.map\s*\([^)]*\).*(?:length|count)\s*>\s*(?:100|500|1000)/g, description: 'Large list rendering without virtualization', recommendation: 'Use react-window or react-virtuoso for lists over 100 items' },
];

// Bundle size patterns
const BUNDLE_PATTERNS: Array<{ type: BundleIssue['type']; pattern: RegExp; description: string; sizeKB: number }> = [
  { type: 'large_import', pattern: /import\s+(?:moment|dayjs)\s/g, description: 'moment.js imported — consider date-fns for tree-shaking', sizeKB: 290 },
  { type: 'large_import', pattern: /import\s+_\s+from\s+['"`]lodash['"`]/g, description: 'Full lodash imported — use lodash-es or specific imports', sizeKB: 530 },
  { type: 'no_lazy_loading', pattern: /import\s+\w+\s+from\s+['"`].*(?:chart|editor|markdown|pdf|xlsx)/gi, description: 'Heavy library imported eagerly — use React.lazy()', sizeKB: 200 },
  { type: 'no_tree_shaking', pattern: /import\s+\*\s+as\s+\w+\s+from/g, description: 'Namespace import prevents tree-shaking', sizeKB: 0 },
];

/**
 * Predict performance bottlenecks from source code analysis
 */
export function predictPerformanceBottlenecks(
  files: Array<{ path: string; content: string }>
): PerformanceReport {
  const bottlenecks: PerformanceBottleneck[] = [];
  const queryIssues: QueryIssue[] = [];
  const bundleIssues: BundleIssue[] = [];
  const renderIssues: RenderIssue[] = [];
  const recommendations: string[] = [];

  for (const file of files) {
    if (/node_modules|\.test\.|\.spec\.|\.d\.ts$/i.test(file.path)) continue;

    // N+1 detection
    for (const { pattern, description } of N_PLUS_1_PATTERNS) {
      if (pattern.test(file.content)) {
        bottlenecks.push({
          type: 'n_plus_1',
          file: file.path,
          line: null,
          description,
          severity: 'critical',
          fix: 'Batch queries using .in() or JOIN, or prefetch all data before the loop',
        });
        queryIssues.push({
          type: 'n_plus_1', file: file.path,
          code: file.content.match(pattern)?.[0]?.slice(0, 80) || '',
          recommendation: 'Replace loop queries with batch query or JOIN',
        });
      }
    }

    // Unbounded queries
    for (const { pattern, description } of UNBOUNDED_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      if (regex.test(file.content)) {
        bottlenecks.push({
          type: 'unbounded_query', file: file.path, line: null,
          description, severity: 'high',
          fix: 'Add .limit() or pagination to prevent loading entire tables',
        });
        queryIssues.push({
          type: 'no_limit', file: file.path,
          code: file.content.match(regex)?.[0]?.slice(0, 80) || '',
          recommendation: 'Add LIMIT clause or use cursor-based pagination',
        });
      }
    }

    // Waterfall detection
    for (const { pattern, description } of WATERFALL_PATTERNS) {
      if (pattern.test(file.content)) {
        bottlenecks.push({
          type: 'waterfall', file: file.path, line: null,
          description, severity: 'medium',
          fix: 'Use Promise.all() or Promise.allSettled() for independent async operations',
        });
      }
    }

    // Render issues (React-specific)
    if (/\.[jt]sx$/.test(file.path)) {
      for (const { type, pattern, description, recommendation } of RENDER_PATTERNS) {
        if (pattern.test(file.content)) {
          renderIssues.push({ type, file: file.path, description, recommendation });
        }
      }
    }

    // Bundle issues
    for (const { type, pattern, description, sizeKB } of BUNDLE_PATTERNS) {
      if (pattern.test(file.content)) {
        bundleIssues.push({ type, file: file.path, description, estimatedSizeKB: sizeKB });
      }
    }
  }

  // Summary
  const totalIssues = bottlenecks.length + queryIssues.length + bundleIssues.length + renderIssues.length;
  const criticalCount = bottlenecks.filter(b => b.severity === 'critical').length;
  const highCount = bottlenecks.filter(b => b.severity === 'high').length;

  const estimatedImpact: PerformanceReport['estimatedImpact'] =
    criticalCount > 0 ? 'severe' :
    highCount > 2 ? 'moderate' : 'minimal';

  if (criticalCount > 0) recommendations.push(`Fix ${criticalCount} critical performance bottleneck(s) — N+1 queries and unbounded SELECTs`);
  if (bundleIssues.length > 0) {
    const totalSizeKB = bundleIssues.reduce((s, b) => s + b.estimatedSizeKB, 0);
    recommendations.push(`${bundleIssues.length} bundle optimization(s) could save ~${totalSizeKB}KB`);
  }
  if (renderIssues.length > 0) recommendations.push(`${renderIssues.length} render optimization(s) available`);

  return {
    bottlenecks,
    queryIssues,
    bundleIssues,
    renderIssues,
    totalIssues,
    estimatedImpact,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}
