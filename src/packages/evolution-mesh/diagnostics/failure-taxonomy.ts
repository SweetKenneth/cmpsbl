/**
 * Evolution Mesh — Failure Taxonomy Engine
 * Categorizes and classifies all executor failures into a structured taxonomy.
 * Enables pattern recognition across failure types for targeted improvement.
 */

export type FailureCategory =
  | 'input_quality'
  | 'schema_mismatch'
  | 'repair_exhaustion'
  | 'timeout'
  | 'cascade_failure'
  | 'resource_limit'
  | 'governance_block'
  | 'regression_detected'
  | 'unknown';

export type FailureSeverity = 'minor' | 'moderate' | 'severe' | 'critical';

export interface ClassifiedFailure {
  id: string;
  executorId: string;
  category: FailureCategory;
  severity: FailureSeverity;
  errorMessage: string;
  archetype?: string;
  modulesAffected: string[];
  repairAttempted: boolean;
  repairStrategies: string[];
  rootCause: string;
  suggestedAction: string;
  timestamp: number;
  relatedFailureIds: string[];
}

export interface FailureTaxonomyReport {
  totalFailures: number;
  byCategory: Record<FailureCategory, number>;
  bySeverity: Record<FailureSeverity, number>;
  topRootCauses: Array<{ cause: string; count: number }>;
  repeatPatterns: Array<{ pattern: string; occurrences: number; lastSeen: number }>;
  trendDirection: 'improving' | 'stable' | 'degrading';
}

const classifiedFailures: ClassifiedFailure[] = [];
const MAX_FAILURES = 10_000;
let failureCounter = 0;

/**
 * Classify a failure into the taxonomy.
 */
export function classifyFailure(
  executorId: string,
  errorMessage: string,
  context: {
    archetype?: string;
    modulesAffected?: string[];
    repairAttempted?: boolean;
    repairStrategies?: string[];
    durationMs?: number;
    inputSize?: number;
  } = {},
): ClassifiedFailure {
  const category = detectCategory(errorMessage, context);
  const severity = detectSeverity(category, context);
  const rootCause = inferRootCause(category, errorMessage, context);
  const suggestedAction = suggestAction(category, severity, context);

  // Find related failures (same executor, same category, within 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const related = classifiedFailures
    .filter(f => f.executorId === executorId && f.category === category && f.timestamp > oneHourAgo)
    .map(f => f.id);

  const failure: ClassifiedFailure = {
    id: `fail_${++failureCounter}_${Date.now()}`,
    executorId,
    category,
    severity,
    errorMessage,
    archetype: context.archetype,
    modulesAffected: context.modulesAffected ?? [],
    repairAttempted: context.repairAttempted ?? false,
    repairStrategies: context.repairStrategies ?? [],
    rootCause,
    suggestedAction,
    timestamp: Date.now(),
    relatedFailureIds: related,
  };

  classifiedFailures.push(failure);
  if (classifiedFailures.length > MAX_FAILURES) classifiedFailures.splice(0, classifiedFailures.length - MAX_FAILURES);

  return failure;
}

function detectCategory(error: string, ctx: Record<string, unknown>): FailureCategory {
  const lower = error.toLowerCase();
  if (lower.includes('schema') || lower.includes('validation')) return 'schema_mismatch';
  if (lower.includes('safe-fail') || lower.includes('archetype')) return 'input_quality';
  if (lower.includes('no repair') || lower.includes('repair failed')) return 'repair_exhaustion';
  if (lower.includes('timeout') || lower.includes('timed out')) return 'timeout';
  if (lower.includes('cascade') || lower.includes('downstream')) return 'cascade_failure';
  if (lower.includes('limit') || lower.includes('quota') || lower.includes('memory')) return 'resource_limit';
  if (lower.includes('governance') || lower.includes('blocked') || lower.includes('denied')) return 'governance_block';
  if (lower.includes('regression') || lower.includes('degradation')) return 'regression_detected';
  return 'unknown';
}

function detectSeverity(category: FailureCategory, ctx: Record<string, unknown>): FailureSeverity {
  const modulesAffected = (ctx.modulesAffected as string[])?.length ?? 0;
  if (category === 'cascade_failure' || category === 'regression_detected') return 'critical';
  if (category === 'governance_block') return 'severe';
  if (modulesAffected > 3) return 'severe';
  if (category === 'repair_exhaustion' || category === 'timeout') return 'moderate';
  return 'minor';
}

function inferRootCause(category: FailureCategory, error: string, ctx: Record<string, unknown>): string {
  switch (category) {
    case 'input_quality': return 'Malformed or unrecognized input structure';
    case 'schema_mismatch': return 'Input does not conform to expected schema';
    case 'repair_exhaustion': return 'All deterministic repair strategies exhausted without success';
    case 'timeout': return 'Operation exceeded time budget';
    case 'cascade_failure': return 'Upstream failure propagated to downstream modules';
    case 'resource_limit': return 'System resource constraint encountered';
    case 'governance_block': return 'Operation blocked by governance rules';
    case 'regression_detected': return 'Change caused performance regression beyond threshold';
    default: return `Unclassified failure: ${error.slice(0, 100)}`;
  }
}

function suggestAction(category: FailureCategory, severity: FailureSeverity, ctx: Record<string, unknown>): string {
  switch (category) {
    case 'input_quality': return 'Review input source and add pre-validation at entry point';
    case 'schema_mismatch': return 'Update schema definition or add coercion rules';
    case 'repair_exhaustion': return 'Add new repair strategy for this pattern or escalate to manual review';
    case 'timeout': return 'Increase timeout budget or optimize operation pipeline';
    case 'cascade_failure': return 'Isolate failing module and apply circuit breaker pattern';
    case 'resource_limit': return 'Review resource allocation and implement backpressure';
    case 'governance_block': return 'Request governance review or adjust mutation scope';
    case 'regression_detected': return 'Initiate rollback and schedule regression root cause analysis';
    default: return 'Log for manual review and add to anti-pattern library';
  }
}

/**
 * Generate failure taxonomy report.
 */
export function getFailureTaxonomyReport(executorId?: string): FailureTaxonomyReport {
  const failures = executorId
    ? classifiedFailures.filter(f => f.executorId === executorId)
    : classifiedFailures;

  const byCategory = {} as Record<FailureCategory, number>;
  const bySeverity = {} as Record<FailureSeverity, number>;
  const rootCauseCounts = new Map<string, number>();

  for (const f of failures) {
    byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
    bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
    rootCauseCounts.set(f.rootCause, (rootCauseCounts.get(f.rootCause) ?? 0) + 1);
  }

  const topRootCauses = Array.from(rootCauseCounts.entries())
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Detect repeat patterns (same category + archetype within 24h)
  const patternMap = new Map<string, { count: number; lastSeen: number }>();
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const f of failures.filter(f => f.timestamp > dayAgo)) {
    const key = `${f.category}:${f.archetype ?? 'unknown'}`;
    const existing = patternMap.get(key) ?? { count: 0, lastSeen: 0 };
    existing.count++;
    existing.lastSeen = Math.max(existing.lastSeen, f.timestamp);
    patternMap.set(key, existing);
  }
  const repeatPatterns = Array.from(patternMap.entries())
    .filter(([, data]) => data.count >= 3)
    .map(([pattern, data]) => ({ pattern, occurrences: data.count, lastSeen: data.lastSeen }))
    .sort((a, b) => b.occurrences - a.occurrences);

  // Trend detection: compare first half vs second half
  const half = Math.floor(failures.length / 2);
  const firstHalf = failures.slice(0, half);
  const secondHalf = failures.slice(half);
  let trendDirection: FailureTaxonomyReport['trendDirection'] = 'stable';
  if (firstHalf.length > 5 && secondHalf.length > 5) {
    const firstRate = firstHalf.filter(f => f.severity === 'critical' || f.severity === 'severe').length / firstHalf.length;
    const secondRate = secondHalf.filter(f => f.severity === 'critical' || f.severity === 'severe').length / secondHalf.length;
    if (secondRate < firstRate - 0.1) trendDirection = 'improving';
    else if (secondRate > firstRate + 0.1) trendDirection = 'degrading';
  }

  return {
    totalFailures: failures.length,
    byCategory,
    bySeverity,
    topRootCauses,
    repeatPatterns,
    trendDirection,
  };
}
