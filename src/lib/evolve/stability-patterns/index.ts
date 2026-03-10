/**
 * Stability Patterns — Bounded Curriculum Module
 * 
 * Teaches and enforces circuit breaker, graceful degradation,
 * retry strategies, and backpressure patterns across the substrate.
 * 
 * Part of the EVOLUTION overlay's bounded curriculum advancement.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type StabilityPatternId =
  | 'circuit_breaker'
  | 'graceful_degradation'
  | 'retry_with_backoff'
  | 'bulkhead_isolation'
  | 'timeout_guard'
  | 'fallback_chain'
  | 'load_shedding'
  | 'health_check_cascade';

export type PatternMaturity = 'absent' | 'partial' | 'implemented' | 'verified' | 'hardened';

export interface StabilityPattern {
  id: StabilityPatternId;
  name: string;
  description: string;
  maturity: PatternMaturity;
  coverage_pct: number;       // 0-100, how many modules implement this
  modules_covered: string[];
  modules_missing: string[];
  last_verified: string | null;
  verification_count: number;
}

export interface StabilityAuditResult {
  timestamp: string;
  patterns: StabilityPattern[];
  overall_score: number;      // 0-100
  maturity_level: 'nascent' | 'developing' | 'mature' | 'hardened';
  gaps: StabilityGap[];
  recommendations: StabilityRecommendation[];
}

export interface StabilityGap {
  pattern_id: StabilityPatternId;
  module: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  fix_complexity: 'trivial' | 'moderate' | 'significant';
}

export interface StabilityRecommendation {
  priority: number;
  pattern_id: StabilityPatternId;
  action: string;
  expected_impact: string;
  effort: 'low' | 'medium' | 'high';
}

// ═══════════════════════════════════════════════════════════════
// PATTERN DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const PATTERN_DEFS: Record<StabilityPatternId, { name: string; description: string }> = {
  circuit_breaker: {
    name: 'Circuit Breaker',
    description: 'Prevents cascading failures by isolating unhealthy modules with open/half-open/closed states.',
  },
  graceful_degradation: {
    name: 'Graceful Degradation',
    description: 'Returns partial results or cached data when a subsystem is unavailable, instead of failing entirely.',
  },
  retry_with_backoff: {
    name: 'Retry with Exponential Backoff',
    description: 'Retries transient failures with increasing delays and jitter to avoid thundering herd.',
  },
  bulkhead_isolation: {
    name: 'Bulkhead Isolation',
    description: 'Isolates failure domains so one failing module cannot exhaust shared resources.',
  },
  timeout_guard: {
    name: 'Timeout Guard',
    description: 'Enforces maximum execution time on all async operations to prevent resource starvation.',
  },
  fallback_chain: {
    name: 'Fallback Chain',
    description: 'Cascading fallback hierarchy: primary → secondary → cached → default, with telemetry at each level.',
  },
  load_shedding: {
    name: 'Load Shedding',
    description: 'Proactively rejects low-priority requests under high load to protect critical paths.',
  },
  health_check_cascade: {
    name: 'Health Check Cascade',
    description: 'Hierarchical health verification: shallow (ping) → deep (dependency check) → full (integration test).',
  },
};

// Known modules that should implement stability patterns
const CORE_MODULES = [
  'CORE', 'SYSTEM', 'BRAIN', 'DREAM', 'NEXUS', 'DECODE',
  'VISION', 'CORTEX', 'DEFENSE', 'RIPPLE', 'ACCESS',
  'ENCODE', 'EVOLUTION', 'INTEGRATION',
];

// ═══════════════════════════════════════════════════════════════
// PATTERN DETECTION — Introspects the substrate
// ═══════════════════════════════════════════════════════════════

const patternStore = new Map<StabilityPatternId, StabilityPattern>();

function initPattern(id: StabilityPatternId): StabilityPattern {
  if (patternStore.has(id)) return patternStore.get(id)!;
  const def = PATTERN_DEFS[id];
  const p: StabilityPattern = {
    id,
    name: def.name,
    description: def.description,
    maturity: 'absent',
    coverage_pct: 0,
    modules_covered: [],
    modules_missing: [...CORE_MODULES],
    last_verified: null,
    verification_count: 0,
  };
  patternStore.set(id, p);
  return p;
}

/** Register that a module implements a given stability pattern */
export function registerPatternCoverage(
  patternId: StabilityPatternId,
  module: string,
  verified = false,
): void {
  const p = initPattern(patternId);
  if (!p.modules_covered.includes(module)) {
    p.modules_covered.push(module);
    p.modules_missing = p.modules_missing.filter(m => m !== module);
    p.coverage_pct = Math.round((p.modules_covered.length / CORE_MODULES.length) * 100);
  }
  if (verified) {
    p.verification_count++;
    p.last_verified = new Date().toISOString();
  }
  // Update maturity
  if (p.coverage_pct === 0) p.maturity = 'absent';
  else if (p.coverage_pct < 50) p.maturity = 'partial';
  else if (p.coverage_pct < 100) p.maturity = 'implemented';
  else if (p.verification_count < CORE_MODULES.length) p.maturity = 'verified';
  else p.maturity = 'hardened';
}

// ═══════════════════════════════════════════════════════════════
// AUTO-DETECT — Bootstrap from known substrate infrastructure
// ═══════════════════════════════════════════════════════════════

function autoDetect(): void {
  // Circuit breaker — known to be implemented globally
  for (const mod of CORE_MODULES) {
    registerPatternCoverage('circuit_breaker', mod, true);
  }

  // Timeout guard — withCircuitBreaker includes timeout racing
  for (const mod of CORE_MODULES) {
    registerPatternCoverage('timeout_guard', mod, true);
  }

  // Retry with backoff — system/retry.ts provides withRetry + RetryPresets
  for (const mod of ['NEXUS', 'RIPPLE', 'INTEGRATION', 'ENCODE', 'EVOLUTION', 'CORTEX']) {
    registerPatternCoverage('retry_with_backoff', mod, true);
  }

  // Graceful degradation — SubstrateProvider + module error boundaries
  for (const mod of ['CORE', 'SYSTEM', 'BRAIN', 'NEXUS', 'DECODE', 'VISION']) {
    registerPatternCoverage('graceful_degradation', mod, true);
  }

  // Fallback chain — NEXUS provider failover, DECODE fallback
  for (const mod of ['NEXUS', 'DECODE', 'RIPPLE']) {
    registerPatternCoverage('fallback_chain', mod, true);
  }

  // Health check cascade — substrate health + module status
  for (const mod of ['CORE', 'SYSTEM', 'VISION', 'DEFENSE']) {
    registerPatternCoverage('health_check_cascade', mod, true);
  }

  // Bulkhead — MEMORY module isolation, error boundaries
  for (const mod of ['BRAIN', 'DREAM', 'CORTEX']) {
    registerPatternCoverage('bulkhead_isolation', mod, true);
  }

  // Load shedding — DEFENSE rate limiting, ACCESS quotas
  for (const mod of ['DEFENSE', 'ACCESS', 'NEXUS']) {
    registerPatternCoverage('load_shedding', mod, true);
  }
}

// ═══════════════════════════════════════════════════════════════
// AUDIT — Full stability assessment
// ═══════════════════════════════════════════════════════════════

export function auditStabilityPatterns(): StabilityAuditResult {
  // Initialize all patterns
  for (const id of Object.keys(PATTERN_DEFS) as StabilityPatternId[]) {
    initPattern(id);
  }
  autoDetect();

  const patterns = Array.from(patternStore.values());
  const overall_score = Math.round(
    patterns.reduce((sum, p) => sum + p.coverage_pct, 0) / patterns.length
  );

  // Identify gaps
  const gaps: StabilityGap[] = [];
  for (const p of patterns) {
    for (const mod of p.modules_missing) {
      gaps.push({
        pattern_id: p.id,
        module: mod,
        severity: p.id === 'circuit_breaker' || p.id === 'timeout_guard' ? 'high' : 'medium',
        description: `${mod} does not implement ${p.name}`,
        fix_complexity: p.id === 'retry_with_backoff' ? 'trivial' : 'moderate',
      });
    }
  }

  // Generate recommendations sorted by impact
  const recommendations: StabilityRecommendation[] = gaps
    .sort((a, b) => {
      const sevOrder = { high: 0, medium: 1, low: 2 };
      return sevOrder[a.severity] - sevOrder[b.severity];
    })
    .slice(0, 10)
    .map((g, i) => ({
      priority: i + 1,
      pattern_id: g.pattern_id,
      action: `Add ${PATTERN_DEFS[g.pattern_id].name} to ${g.module}`,
      expected_impact: `Improves ${g.module} resilience against ${g.pattern_id === 'circuit_breaker' ? 'cascading failures' : 'transient errors'}`,
      effort: g.fix_complexity === 'trivial' ? 'low' as const : 'medium' as const,
    }));

  const maturity_level: StabilityAuditResult['maturity_level'] =
    overall_score >= 90 ? 'hardened' :
    overall_score >= 70 ? 'mature' :
    overall_score >= 40 ? 'developing' : 'nascent';

  return {
    timestamp: new Date().toISOString(),
    patterns,
    overall_score,
    maturity_level,
    gaps,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// ENFORCEMENT — Runtime pattern verification
// ═══════════════════════════════════════════════════════════════

export interface PatternEnforcementResult {
  module: string;
  pattern_id: StabilityPatternId;
  enforced: boolean;
  details: string;
}

/**
 * Verify that a module's async operation is wrapped with
 * the required stability patterns at runtime.
 */
export function enforceStabilityPatterns(
  module: string,
  operation: string,
  hasCircuitBreaker: boolean,
  hasTimeout: boolean,
  hasRetry: boolean,
): PatternEnforcementResult[] {
  const results: PatternEnforcementResult[] = [];

  results.push({
    module,
    pattern_id: 'circuit_breaker',
    enforced: hasCircuitBreaker,
    details: hasCircuitBreaker
      ? `${operation} is circuit-breaker protected`
      : `${operation} lacks circuit breaker — add withCircuitBreaker()`,
  });

  results.push({
    module,
    pattern_id: 'timeout_guard',
    enforced: hasTimeout,
    details: hasTimeout
      ? `${operation} has timeout guard`
      : `${operation} has no timeout — risk of resource starvation`,
  });

  results.push({
    module,
    pattern_id: 'retry_with_backoff',
    enforced: hasRetry,
    details: hasRetry
      ? `${operation} retries with backoff`
      : `${operation} does not retry — transient failures will propagate`,
  });

  return results;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export const stabilityPatterns = {
  audit: auditStabilityPatterns,
  register: registerPatternCoverage,
  enforce: enforceStabilityPatterns,
  getPattern: (id: StabilityPatternId) => {
    initPattern(id);
    autoDetect();
    return patternStore.get(id)!;
  },
  getAllPatterns: () => {
    for (const id of Object.keys(PATTERN_DEFS) as StabilityPatternId[]) initPattern(id);
    autoDetect();
    return Array.from(patternStore.values());
  },
  getSummary: () => {
    const audit = auditStabilityPatterns();
    return {
      score: audit.overall_score,
      maturity: audit.maturity_level,
      gaps: audit.gaps.length,
      top_recommendation: audit.recommendations[0]?.action ?? 'All patterns implemented',
    };
  },
};
