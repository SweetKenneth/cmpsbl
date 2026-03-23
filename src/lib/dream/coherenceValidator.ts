/**
 * CMPSBL® DREAM — Coherence Validator
 * Validates that synthesized heuristics are logically consistent
 * with existing knowledge before committing to MEMORY.
 */

export interface CoherenceCheck {
  heuristicId: string;
  rule: string;
  checks: CoherenceResult[];
  overallScore: number; // 0-1
  isCoherent: boolean;
  recommendation: 'commit' | 'review' | 'reject';
  checkedAt: string;
}

export interface CoherenceResult {
  checkType: 'contradiction' | 'redundancy' | 'circular' | 'semantic_consistency' | 'confidence_floor';
  passed: boolean;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

const MIN_COHERENCE_SCORE = 0.6;
const MAX_CHECK_HISTORY = 500;
const checkHistory: CoherenceCheck[] = [];

/**
 * Validate a heuristic against existing knowledge
 */
export function validateCoherence(
  heuristicId: string,
  rule: string,
  existingRules: string[],
  parentConfidence: number,
  generation: number
): CoherenceCheck {
  const checks: CoherenceResult[] = [];

  // 1. Contradiction check: does this rule negate an existing rule?
  checks.push(checkContradiction(rule, existingRules));

  // 2. Redundancy check: is this rule already expressed?
  checks.push(checkRedundancy(rule, existingRules));

  // 3. Circular reference check
  checks.push(checkCircularity(rule));

  // 4. Semantic consistency: does the rule make structural sense?
  checks.push(checkSemanticConsistency(rule));

  // 5. Confidence floor: is parent confidence sufficient?
  checks.push(checkConfidenceFloor(parentConfidence, generation));

  // Calculate overall score
  const passedCount = checks.filter(c => c.passed).length;
  const criticalFails = checks.filter(c => !c.passed && c.severity === 'critical').length;
  const overallScore = criticalFails > 0 ? 0 : passedCount / checks.length;

  let recommendation: CoherenceCheck['recommendation'] = 'commit';
  if (overallScore < 0.4 || criticalFails > 0) recommendation = 'reject';
  else if (overallScore < MIN_COHERENCE_SCORE) recommendation = 'review';

  const check: CoherenceCheck = {
    heuristicId,
    rule,
    checks,
    overallScore: Math.round(overallScore * 1000) / 1000,
    isCoherent: overallScore >= MIN_COHERENCE_SCORE,
    recommendation,
    checkedAt: new Date().toISOString(),
  };

  checkHistory.push(check);
  if (checkHistory.length > MAX_CHECK_HISTORY) checkHistory.shift();

  return check;
}

function checkContradiction(rule: string, existingRules: string[]): CoherenceResult {
  const negationPatterns = ['not ', 'never ', 'avoid ', 'don\'t ', 'shouldn\'t ', 'opposite of '];
  const ruleLower = rule.toLowerCase();

  for (const existing of existingRules) {
    const existingLower = existing.toLowerCase();

    // Check if rule explicitly negates an existing one
    for (const neg of negationPatterns) {
      if (ruleLower.includes(neg)) {
        const withoutNeg = ruleLower.replace(neg, '').trim();
        // Simple overlap check
        const words = withoutNeg.split(/\s+/);
        const existingWords = new Set(existingLower.split(/\s+/));
        const overlap = words.filter(w => existingWords.has(w)).length;
        if (overlap > words.length * 0.5) {
          return {
            checkType: 'contradiction',
            passed: false,
            details: `Rule appears to contradict existing: "${existing.slice(0, 80)}..."`,
            severity: 'critical',
          };
        }
      }
    }
  }

  return {
    checkType: 'contradiction',
    passed: true,
    details: 'No contradictions detected',
    severity: 'info',
  };
}

function checkRedundancy(rule: string, existingRules: string[]): CoherenceResult {
  const ruleWords = new Set(rule.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  for (const existing of existingRules) {
    const existingWords = new Set(existing.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const intersection = [...ruleWords].filter(w => existingWords.has(w));
    const similarity = ruleWords.size > 0 ? intersection.length / ruleWords.size : 0;

    if (similarity > 0.8) {
      return {
        checkType: 'redundancy',
        passed: false,
        details: `${Math.round(similarity * 100)}% similar to existing rule`,
        severity: 'warning',
      };
    }
  }

  return {
    checkType: 'redundancy',
    passed: true,
    details: 'Rule is sufficiently novel',
    severity: 'info',
  };
}

function checkCircularity(rule: string): CoherenceResult {
  // Check for self-referential language
  const circularPatterns = ['because of itself', 'refers to itself', 'causes itself', 'is defined by'];
  const ruleLower = rule.toLowerCase();

  for (const pattern of circularPatterns) {
    if (ruleLower.includes(pattern)) {
      return {
        checkType: 'circular',
        passed: false,
        details: `Potential circular reference: "${pattern}"`,
        severity: 'warning',
      };
    }
  }

  return {
    checkType: 'circular',
    passed: true,
    details: 'No circular references detected',
    severity: 'info',
  };
}

function checkSemanticConsistency(rule: string): CoherenceResult {
  // Basic structural checks
  if (rule.length < 10) {
    return {
      checkType: 'semantic_consistency',
      passed: false,
      details: 'Rule too short to be meaningful',
      severity: 'warning',
    };
  }

  if (rule.length > 2000) {
    return {
      checkType: 'semantic_consistency',
      passed: false,
      details: 'Rule too long — may lack focus',
      severity: 'warning',
    };
  }

  // Check for actionable language
  const actionWords = ['when', 'if', 'expect', 'correlat', 'indicates', 'suggests', 'pattern', 'tend'];
  const hasAction = actionWords.some(w => rule.toLowerCase().includes(w));

  if (!hasAction) {
    return {
      checkType: 'semantic_consistency',
      passed: true,
      details: 'Rule lacks actionable language but is structurally valid',
      severity: 'info',
    };
  }

  return {
    checkType: 'semantic_consistency',
    passed: true,
    details: 'Rule is semantically consistent',
    severity: 'info',
  };
}

function checkConfidenceFloor(parentConfidence: number, generation: number): CoherenceResult {
  const minConfidence = 0.3;
  const effectiveConfidence = parentConfidence * Math.pow(0.85, generation);

  if (effectiveConfidence < minConfidence) {
    return {
      checkType: 'confidence_floor',
      passed: false,
      details: `Effective confidence ${effectiveConfidence.toFixed(3)} below minimum ${minConfidence}`,
      severity: 'critical',
    };
  }

  return {
    checkType: 'confidence_floor',
    passed: true,
    details: `Effective confidence ${effectiveConfidence.toFixed(3)} is sufficient`,
    severity: 'info',
  };
}

/**
 * Get recent coherence checks
 */
export function getCoherenceHistory(limit: number = 20): CoherenceCheck[] {
  return checkHistory.slice(-limit);
}

/**
 * Get coherence stats
 */
export function getCoherenceStats(): {
  totalChecks: number;
  passRate: number;
  rejectRate: number;
  avgScore: number;
} {
  if (checkHistory.length === 0) {
    return { totalChecks: 0, passRate: 1, rejectRate: 0, avgScore: 0 };
  }

  const passed = checkHistory.filter(c => c.isCoherent).length;
  const rejected = checkHistory.filter(c => c.recommendation === 'reject').length;
  const avgScore = checkHistory.reduce((sum, c) => sum + c.overallScore, 0) / checkHistory.length;

  return {
    totalChecks: checkHistory.length,
    passRate: Math.round((passed / checkHistory.length) * 100),
    rejectRate: Math.round((rejected / checkHistory.length) * 100),
    avgScore: Math.round(avgScore * 1000) / 1000,
  };
}
