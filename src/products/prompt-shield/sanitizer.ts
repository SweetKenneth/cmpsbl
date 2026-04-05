/**
 * PROMPT-SHIELD — Output Sanitization Engine
 * Primitive: SIEVE (output sanitization & safety filtering)
 *
 * Cleans LLM output based on detected threats and governance decisions.
 * Preserves maximum information while removing dangerous fragments.
 */

import type {
  DetectedThreat,
  GovernanceDecision,
  SanitizationResult,
  SanitizedFragment,
  DefenseAction,
} from './types';

// ── Sanitization Rules ─────────────────────────────────────────────────

/**
 * Apply sanitization to output text based on governance decisions.
 * Only modifies fragments that governance approved for action.
 */
export function sanitizeOutput(
  outputText: string,
  threats: readonly DetectedThreat[],
  decisions: readonly GovernanceDecision[],
): SanitizationResult {
  const actioned = decisions.filter(d => d.action !== 'allow_monitored' && d.verdict !== 'approve');
  const removedFragments: SanitizedFragment[] = [];

  let sanitized = outputText;

  // Build a map of threat → decision for quick lookup
  const decisionMap = new Map(decisions.map(d => [d.threatId, d]));

  // Process threats in reverse order (end of string first) to preserve indices
  const sortedThreats = [...threats]
    .filter(t => {
      const decision = decisionMap.get(t.id);
      return decision && (decision.action === 'sanitize' || decision.action === 'rewrite' || decision.action === 'block');
    })
    .sort((a, b) => b.startIndex - a.startIndex);

  for (const threat of sortedThreats) {
    const decision = decisionMap.get(threat.id);
    if (!decision) continue;

    const fragment = sanitized.slice(threat.startIndex, threat.endIndex);
    const action = decision.action as DefenseAction;

    let replacement = '';
    switch (action) {
      case 'sanitize':
        replacement = '[REDACTED]';
        break;
      case 'rewrite':
        replacement = `[Content modified for safety: ${threat.category}]`;
        break;
      case 'block':
        replacement = '';
        break;
      default:
        continue;
    }

    sanitized = sanitized.slice(0, threat.startIndex) + replacement + sanitized.slice(threat.endIndex);

    removedFragments.push({
      content: fragment,
      reason: decision.reason,
      category: threat.category,
      action,
    });
  }

  // Clean up double spaces and empty lines from removals
  sanitized = sanitized.replace(/\s{3,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  const safetyScore = computeSafetyScore(threats, actioned);

  return {
    originalOutput: outputText,
    sanitizedOutput: sanitized,
    removedFragments,
    wasModified: sanitized !== outputText,
    safetyScore,
  };
}

/**
 * Compute a 0-100 safety score based on threat density and actions taken.
 */
function computeSafetyScore(
  threats: readonly DetectedThreat[],
  actioned: readonly GovernanceDecision[],
): number {
  if (threats.length === 0) return 100;

  const severityWeights = { critical: 25, high: 15, medium: 8, low: 3, info: 1 };
  const totalRisk = threats.reduce((sum, t) => sum + (severityWeights[t.severity] ?? 1) * t.confidence, 0);

  // Each actioned decision recovers some safety
  const mitigated = actioned.length * 10;

  const raw = Math.max(0, 100 - totalRisk + mitigated);
  return Math.round(Math.min(100, raw));
}
