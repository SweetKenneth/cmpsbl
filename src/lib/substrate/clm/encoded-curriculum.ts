/**
 * Encoded Code-Writing Curriculum
 * Exclusive curriculum for code-writing mastery
 * 
 * 24/7 learning focused ONLY on code-writing excellence.
 * Topics cover: patterns, anti-patterns, architecture, testing, refactoring,
 * performance, security, and language mastery.
 */

import type { Topic, TopicCategory } from './topic-bank';

// Re-export Topic type for use in learning engine
export type { Topic } from './topic-bank';

// ═══════════════════════════════════════════════════════════════════════════════
// ENCODED CODE-WRITING CURRICULUM
// 50+ Topics focused exclusively on code excellence
// ═══════════════════════════════════════════════════════════════════════════════

export const ENCODED_CODE_CURRICULUM: Omit<Topic, 'lastStudiedAt' | 'studyCount'>[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: CORE CODE PATTERNS (Priority 1-10)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'enc-clean-code-principles',
    name: 'Clean code principles and SOLID',
    category: 'core_curriculum',
    weight: 1.0,
    priority: 1,
    domainAnchors: ['clean-code', 'solid', 'maintainability'],
    moduleRefs: ['ENCODED'],
    kpis: ['code_readability_score', 'maintainability_index', 'cognitive_complexity'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-function-composition',
    name: 'Function composition and pure functions',
    category: 'core_curriculum',
    weight: 0.98,
    priority: 2,
    domainAnchors: ['functional', 'composition', 'pure-functions'],
    moduleRefs: ['ENCODED'],
    kpis: ['side_effect_count', 'function_purity', 'composability_score'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-typescript-mastery',
    name: 'TypeScript advanced patterns',
    category: 'core_curriculum',
    weight: 0.97,
    priority: 3,
    domainAnchors: ['typescript', 'type-safety', 'generics'],
    moduleRefs: ['ENCODED'],
    kpis: ['type_coverage', 'any_usage_count', 'generic_reuse_rate'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-error-handling',
    name: 'Error handling patterns',
    category: 'core_curriculum',
    weight: 0.96,
    priority: 4,
    domainAnchors: ['errors', 'exceptions', 'recovery'],
    moduleRefs: ['ENCODED'],
    kpis: ['unhandled_error_rate', 'error_recovery_success', 'error_message_quality'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-react-patterns',
    name: 'React component patterns',
    category: 'core_curriculum',
    weight: 0.95,
    priority: 5,
    domainAnchors: ['react', 'components', 'hooks'],
    moduleRefs: ['ENCODED'],
    kpis: ['component_reuse_rate', 'prop_drilling_depth', 'render_performance'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-api-design',
    name: 'API and interface design',
    category: 'core_curriculum',
    weight: 0.94,
    priority: 6,
    domainAnchors: ['api', 'interfaces', 'contracts'],
    moduleRefs: ['ENCODED'],
    kpis: ['api_consistency', 'breaking_change_rate', 'documentation_coverage'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-state-management',
    name: 'State management patterns',
    category: 'core_curriculum',
    weight: 0.93,
    priority: 7,
    domainAnchors: ['state', 'react-query', 'zustand'],
    moduleRefs: ['ENCODED'],
    kpis: ['state_complexity', 'update_efficiency', 'cache_hit_rate'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-async-patterns',
    name: 'Async/await and concurrency',
    category: 'core_curriculum',
    weight: 0.92,
    priority: 8,
    domainAnchors: ['async', 'promises', 'concurrency'],
    moduleRefs: ['ENCODED'],
    kpis: ['promise_rejection_handling', 'race_condition_prevention', 'parallelism_utilization'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-testing-strategies',
    name: 'Testing strategies and coverage',
    category: 'core_curriculum',
    weight: 0.91,
    priority: 9,
    domainAnchors: ['testing', 'vitest', 'coverage'],
    moduleRefs: ['ENCODED'],
    kpis: ['test_coverage_pct', 'test_reliability', 'assertion_quality'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-refactoring-techniques',
    name: 'Refactoring techniques',
    category: 'core_curriculum',
    weight: 0.90,
    priority: 10,
    domainAnchors: ['refactoring', 'code-smells', 'improvement'],
    moduleRefs: ['ENCODED'],
    kpis: ['refactoring_safety', 'behavior_preservation', 'complexity_reduction'],
    confidenceLevel: 0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: ARCHITECTURE & DESIGN (Priority 11-20)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'enc-module-boundaries',
    name: 'Module boundaries and cohesion',
    category: 'core_curriculum',
    weight: 0.89,
    priority: 11,
    domainAnchors: ['modules', 'cohesion', 'coupling'],
    moduleRefs: ['ENCODED'],
    kpis: ['module_cohesion_score', 'coupling_factor', 'import_depth'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-dependency-injection',
    name: 'Dependency injection patterns',
    category: 'core_curriculum',
    weight: 0.88,
    priority: 12,
    domainAnchors: ['di', 'inversion', 'testability'],
    moduleRefs: ['ENCODED'],
    kpis: ['testability_score', 'mock_complexity', 'dependency_count'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-design-patterns',
    name: 'Design patterns (Factory, Observer, Strategy)',
    category: 'core_curriculum',
    weight: 0.87,
    priority: 13,
    domainAnchors: ['patterns', 'factory', 'observer', 'strategy'],
    moduleRefs: ['ENCODED'],
    kpis: ['pattern_appropriateness', 'pattern_implementation_quality'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-code-organization',
    name: 'File and folder organization',
    category: 'core_curriculum',
    weight: 0.86,
    priority: 14,
    domainAnchors: ['organization', 'structure', 'navigation'],
    moduleRefs: ['ENCODED'],
    kpis: ['file_discoverability', 'import_path_simplicity', 'colocation_score'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-abstraction-levels',
    name: 'Abstraction levels and layering',
    category: 'core_curriculum',
    weight: 0.85,
    priority: 15,
    domainAnchors: ['abstraction', 'layers', 'separation'],
    moduleRefs: ['ENCODED'],
    kpis: ['layer_violation_count', 'abstraction_consistency'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-edge-function-patterns',
    name: 'Edge function best practices',
    category: 'core_curriculum',
    weight: 0.84,
    priority: 16,
    domainAnchors: ['edge-functions', 'deno', 'serverless'],
    moduleRefs: ['ENCODED'],
    kpis: ['cold_start_time', 'memory_efficiency', 'error_rate'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-database-patterns',
    name: 'Database query patterns',
    category: 'core_curriculum',
    weight: 0.83,
    priority: 17,
    domainAnchors: ['supabase', 'queries', 'rls'],
    moduleRefs: ['ENCODED'],
    kpis: ['query_efficiency', 'n_plus_one_avoidance', 'rls_correctness'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-performance-patterns',
    name: 'Performance optimization patterns',
    category: 'core_curriculum',
    weight: 0.82,
    priority: 18,
    domainAnchors: ['performance', 'optimization', 'profiling'],
    moduleRefs: ['ENCODED'],
    kpis: ['render_time_ms', 'bundle_size_kb', 'memory_usage'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-security-patterns',
    name: 'Security coding patterns',
    category: 'core_curriculum',
    weight: 0.81,
    priority: 19,
    domainAnchors: ['security', 'xss', 'injection'],
    moduleRefs: ['ENCODED', 'DEFENSE'],
    kpis: ['vulnerability_count', 'security_audit_score', 'secret_exposure_risk'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-accessibility-code',
    name: 'Accessibility in code',
    category: 'core_curriculum',
    weight: 0.80,
    priority: 20,
    domainAnchors: ['a11y', 'aria', 'semantic'],
    moduleRefs: ['ENCODED', 'INCLUSIVE'],
    kpis: ['a11y_violations', 'keyboard_navigability', 'screen_reader_score'],
    confidenceLevel: 0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: ADVANCED TECHNIQUES (Priority 21-30)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'enc-code-generation',
    name: 'Code generation strategies',
    category: 'core_curriculum',
    weight: 0.79,
    priority: 21,
    domainAnchors: ['codegen', 'templates', 'scaffolding'],
    moduleRefs: ['ENCODED'],
    kpis: ['generation_accuracy', 'template_reuse', 'customization_ease'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-incremental-changes',
    name: 'Incremental change strategies',
    category: 'core_curriculum',
    weight: 0.78,
    priority: 22,
    domainAnchors: ['incremental', 'diff', 'minimal-changes'],
    moduleRefs: ['ENCODED'],
    kpis: ['change_precision', 'regression_avoidance', 'surgical_edit_rate'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-context-awareness',
    name: 'Context-aware code writing',
    category: 'core_curriculum',
    weight: 0.77,
    priority: 23,
    domainAnchors: ['context', 'conventions', 'consistency'],
    moduleRefs: ['ENCODED'],
    kpis: ['style_consistency', 'convention_adherence', 'pattern_matching'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-debugging-techniques',
    name: 'Debugging and troubleshooting',
    category: 'core_curriculum',
    weight: 0.76,
    priority: 24,
    domainAnchors: ['debugging', 'logging', 'diagnostics'],
    moduleRefs: ['ENCODED'],
    kpis: ['bug_identification_speed', 'root_cause_accuracy', 'fix_quality'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-self-correction',
    name: 'Self-correction and validation',
    category: 'core_curriculum',
    weight: 0.75,
    priority: 25,
    domainAnchors: ['validation', 'self-review', 'correction'],
    moduleRefs: ['ENCODED'],
    kpis: ['self_fix_rate', 'validation_coverage', 'error_prevention'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-documentation-code',
    name: 'Code documentation patterns',
    category: 'core_curriculum',
    weight: 0.74,
    priority: 26,
    domainAnchors: ['jsdoc', 'comments', 'readme'],
    moduleRefs: ['ENCODED'],
    kpis: ['documentation_coverage', 'comment_quality', 'example_presence'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-naming-conventions',
    name: 'Naming conventions and semantics',
    category: 'core_curriculum',
    weight: 0.73,
    priority: 27,
    domainAnchors: ['naming', 'semantics', 'clarity'],
    moduleRefs: ['ENCODED'],
    kpis: ['name_clarity_score', 'abbreviation_avoidance', 'semantic_accuracy'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-imports-exports',
    name: 'Import/export optimization',
    category: 'core_curriculum',
    weight: 0.72,
    priority: 28,
    domainAnchors: ['imports', 'tree-shaking', 'bundling'],
    moduleRefs: ['ENCODED'],
    kpis: ['dead_code_elimination', 'bundle_efficiency', 'circular_dep_count'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-type-inference',
    name: 'Type inference optimization',
    category: 'core_curriculum',
    weight: 0.71,
    priority: 29,
    domainAnchors: ['inference', 'narrowing', 'guards'],
    moduleRefs: ['ENCODED'],
    kpis: ['inference_accuracy', 'explicit_type_reduction', 'guard_effectiveness'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-memory-efficiency',
    name: 'Memory-efficient coding',
    category: 'core_curriculum',
    weight: 0.70,
    priority: 30,
    domainAnchors: ['memory', 'gc', 'leaks'],
    moduleRefs: ['ENCODED'],
    kpis: ['memory_leak_count', 'allocation_efficiency', 'gc_pressure'],
    confidenceLevel: 0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 4: SPECIALIZATION (Priority 31-40)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'enc-react-hooks-deep',
    name: 'React hooks deep patterns',
    category: 'core_curriculum',
    weight: 0.69,
    priority: 31,
    domainAnchors: ['hooks', 'useEffect', 'useMemo', 'useCallback'],
    moduleRefs: ['ENCODED'],
    kpis: ['hook_dependency_accuracy', 'stale_closure_avoidance', 'memoization_effectiveness'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-tanstack-query',
    name: 'TanStack Query mastery',
    category: 'core_curriculum',
    weight: 0.68,
    priority: 32,
    domainAnchors: ['react-query', 'caching', 'mutations'],
    moduleRefs: ['ENCODED'],
    kpis: ['cache_strategy_quality', 'mutation_handling', 'optimistic_update_accuracy'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-tailwind-patterns',
    name: 'Tailwind CSS patterns',
    category: 'core_curriculum',
    weight: 0.67,
    priority: 33,
    domainAnchors: ['tailwind', 'css', 'responsive'],
    moduleRefs: ['ENCODED'],
    kpis: ['utility_reuse', 'responsive_coverage', 'custom_class_avoidance'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-shadcn-usage',
    name: 'shadcn/ui component patterns',
    category: 'core_curriculum',
    weight: 0.66,
    priority: 34,
    domainAnchors: ['shadcn', 'radix', 'components'],
    moduleRefs: ['ENCODED'],
    kpis: ['component_customization_quality', 'variant_consistency', 'composability'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-form-patterns',
    name: 'Form handling patterns',
    category: 'core_curriculum',
    weight: 0.65,
    priority: 35,
    domainAnchors: ['forms', 'react-hook-form', 'zod'],
    moduleRefs: ['ENCODED'],
    kpis: ['validation_coverage', 'error_ux_quality', 'submission_reliability'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-routing-patterns',
    name: 'Routing and navigation',
    category: 'core_curriculum',
    weight: 0.64,
    priority: 36,
    domainAnchors: ['routing', 'react-router', 'navigation'],
    moduleRefs: ['ENCODED'],
    kpis: ['route_organization', 'lazy_loading_coverage', 'navigation_ux'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-animation-patterns',
    name: 'Animation and motion',
    category: 'core_curriculum',
    weight: 0.63,
    priority: 37,
    domainAnchors: ['framer-motion', 'animation', 'transitions'],
    moduleRefs: ['ENCODED'],
    kpis: ['animation_performance', 'motion_consistency', 'accessibility_preservation'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-realtime-patterns',
    name: 'Realtime and subscriptions',
    category: 'core_curriculum',
    weight: 0.62,
    priority: 38,
    domainAnchors: ['realtime', 'subscriptions', 'websockets'],
    moduleRefs: ['ENCODED'],
    kpis: ['subscription_cleanup', 'reconnection_handling', 'state_sync_accuracy'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-file-handling',
    name: 'File upload and storage',
    category: 'core_curriculum',
    weight: 0.61,
    priority: 39,
    domainAnchors: ['files', 'storage', 'uploads'],
    moduleRefs: ['ENCODED'],
    kpis: ['upload_reliability', 'progress_tracking', 'error_recovery'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-auth-patterns',
    name: 'Authentication patterns',
    category: 'core_curriculum',
    weight: 0.60,
    priority: 40,
    domainAnchors: ['auth', 'sessions', 'tokens'],
    moduleRefs: ['ENCODED', 'DEFENSE'],
    kpis: ['auth_security_score', 'session_handling', 'token_management'],
    confidenceLevel: 0,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 5: MASTERY (Priority 41-50)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'enc-code-review-skills',
    name: 'Code review and critique',
    category: 'core_curriculum',
    weight: 0.59,
    priority: 41,
    domainAnchors: ['review', 'critique', 'improvement'],
    moduleRefs: ['ENCODED'],
    kpis: ['issue_detection_rate', 'suggestion_quality', 'false_positive_rate'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-migration-strategies',
    name: 'Code migration strategies',
    category: 'core_curriculum',
    weight: 0.58,
    priority: 42,
    domainAnchors: ['migration', 'upgrades', 'compatibility'],
    moduleRefs: ['ENCODED'],
    kpis: ['migration_success_rate', 'breaking_change_handling', 'rollback_capability'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-legacy-improvement',
    name: 'Legacy code improvement',
    category: 'core_curriculum',
    weight: 0.57,
    priority: 43,
    domainAnchors: ['legacy', 'modernization', 'technical-debt'],
    moduleRefs: ['ENCODED'],
    kpis: ['debt_reduction_rate', 'modernization_quality', 'backward_compatibility'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-bundle-optimization',
    name: 'Bundle and build optimization',
    category: 'core_curriculum',
    weight: 0.56,
    priority: 44,
    domainAnchors: ['vite', 'bundling', 'optimization'],
    moduleRefs: ['ENCODED'],
    kpis: ['bundle_size_reduction', 'build_speed', 'chunk_strategy'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-monorepo-patterns',
    name: 'Monorepo and workspace patterns',
    category: 'core_curriculum',
    weight: 0.55,
    priority: 45,
    domainAnchors: ['monorepo', 'workspaces', 'shared-code'],
    moduleRefs: ['ENCODED'],
    kpis: ['code_sharing_efficiency', 'dependency_management', 'build_isolation'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-ci-cd-awareness',
    name: 'CI/CD-aware coding',
    category: 'core_curriculum',
    weight: 0.54,
    priority: 46,
    domainAnchors: ['ci-cd', 'automation', 'pipelines'],
    moduleRefs: ['ENCODED'],
    kpis: ['pipeline_compatibility', 'test_determinism', 'deploy_readiness'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-internationalization',
    name: 'Internationalization patterns',
    category: 'core_curriculum',
    weight: 0.53,
    priority: 47,
    domainAnchors: ['i18n', 'localization', 'translations'],
    moduleRefs: ['ENCODED'],
    kpis: ['translation_coverage', 'locale_handling', 'rtl_support'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-pwa-patterns',
    name: 'PWA and offline patterns',
    category: 'core_curriculum',
    weight: 0.52,
    priority: 48,
    domainAnchors: ['pwa', 'service-worker', 'offline'],
    moduleRefs: ['ENCODED'],
    kpis: ['offline_capability', 'cache_strategy', 'install_experience'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-seo-code-patterns',
    name: 'SEO-friendly code patterns',
    category: 'core_curriculum',
    weight: 0.51,
    priority: 49,
    domainAnchors: ['seo', 'metadata', 'structured-data'],
    moduleRefs: ['ENCODED'],
    kpis: ['seo_score', 'metadata_completeness', 'crawlability'],
    confidenceLevel: 0,
  },
  {
    id: 'enc-ai-integration',
    name: 'AI integration patterns',
    category: 'core_curriculum',
    weight: 0.50,
    priority: 50,
    domainAnchors: ['ai', 'llm', 'streaming'],
    moduleRefs: ['ENCODED', 'NEXUS'],
    kpis: ['ai_call_efficiency', 'streaming_reliability', 'error_handling'],
    confidenceLevel: 0,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CURRICULUM UTILITIES — cached to avoid per-call object allocations
// ═══════════════════════════════════════════════════════════════════════════════

/** Pre-built immutable Topic[] — created once, returned by reference */
let _cachedCurriculum: Topic[] | null = null;

/** Pre-built id→Topic lookup for O(1) access */
let _topicIndex: Map<string, Topic> | null = null;

function ensureCurriculumCache(): Topic[] {
  if (_cachedCurriculum) return _cachedCurriculum;
  _cachedCurriculum = ENCODED_CODE_CURRICULUM.map(t => ({
    ...t,
    lastStudiedAt: undefined,
    studyCount: 0,
    mastery: t.confidenceLevel,
  }));
  _topicIndex = new Map(_cachedCurriculum.map(t => [t.id, t]));
  return _cachedCurriculum;
}

/**
 * Get all Encoded curriculum topics (cached — returns same array reference)
 */
export function getEncodedCurriculum(): Topic[] {
  return ensureCurriculumCache();
}

/**
 * Get topic by ID from Encoded curriculum (O(1) via index)
 */
export function getEncodedTopic(topicId: string): Topic | null {
  ensureCurriculumCache();
  return _topicIndex!.get(topicId) ?? null;
}

/** Pre-computed stats — computed once */
let _cachedStats: { totalTopics: number; byTier: Record<string, number>; avgWeight: number } | null = null;

/**
 * Get curriculum statistics (cached)
 */
export function getEncodedCurriculumStats(): {
  totalTopics: number;
  byTier: Record<string, number>;
  avgWeight: number;
} {
  if (_cachedStats) return _cachedStats;

  const topics = ENCODED_CODE_CURRICULUM;
  let t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0;
  let weightSum = 0;
  for (const t of topics) {
    weightSum += t.weight;
    if (t.priority <= 10) t1++;
    else if (t.priority <= 20) t2++;
    else if (t.priority <= 30) t3++;
    else if (t.priority <= 40) t4++;
    else t5++;
  }

  _cachedStats = {
    totalTopics: topics.length,
    byTier: {
      'Tier 1 (1-10)': t1,
      'Tier 2 (11-20)': t2,
      'Tier 3 (21-30)': t3,
      'Tier 4 (31-40)': t4,
      'Tier 5 (41-50)': t5,
    },
    avgWeight: weightSum / topics.length,
  };
  return _cachedStats;
}

export const ENCODED_CURRICULUM_VERSION = '7.5.4';
