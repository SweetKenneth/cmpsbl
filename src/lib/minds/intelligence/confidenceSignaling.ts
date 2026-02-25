/**
 * Minds Intelligence Layer — Confidence Signaling
 * Each output includes a confidence score.
 * Internal scoring rubric is NOT exposed.
 */

import { isFeatureActive } from './featureFlags';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain';

export interface ConfidenceSignal {
  /** Numeric score: 0-1 */
  score: number;
  /** Human-readable level */
  level: ConfidenceLevel;
  /** User-facing explanation (rubric-free) */
  explanation: string;
  /** Factors that influenced the score (generic, no rubric exposure) */
  factors: string[];
}

/** Internal rubric weights — NEVER exposed publicly */
const RUBRIC = {
  sourceQuality: 0.25,
  dataCompleteness: 0.20,
  reasoningDepth: 0.20,
  domainMatch: 0.15,
  contextRelevance: 0.10,
  recency: 0.10,
} as const;

/** Internal scoring inputs */
export interface ScoringInputs {
  /** How many verified sources support the output */
  sourceCount: number;
  /** Whether sources are primary/authoritative */
  sourcesAuthoritative: boolean;
  /** Percentage of required data points available */
  dataCompletenessPct: number;
  /** Number of reasoning steps applied */
  reasoningSteps: number;
  /** Whether the Mind's domain matches the task */
  domainMatch: boolean;
  /** Whether context from memory was available */
  hasContextFromMemory: boolean;
  /** Age of most recent source data in hours */
  sourceAgeHours: number;
}

/** Calculate confidence score (internal logic, never expose rubric) */
export function calculateConfidence(inputs: ScoringInputs): ConfidenceSignal {
  if (!isFeatureActive('confidence_signaling')) {
    return { score: 0.5, level: 'medium', explanation: '', factors: [] };
  }

  // Source quality: log-scaled, capped
  const sourceScore = Math.min(1, (Math.log2(Math.max(1, inputs.sourceCount)) / 4))
    * (inputs.sourcesAuthoritative ? 1 : 0.6);

  // Data completeness: linear
  const completenessScore = Math.min(1, inputs.dataCompletenessPct / 100);

  // Reasoning depth: log-scaled
  const reasoningScore = Math.min(1, Math.log2(Math.max(1, inputs.reasoningSteps)) / 3);

  // Domain match: binary boost
  const domainScore = inputs.domainMatch ? 1 : 0.4;

  // Context: binary
  const contextScore = inputs.hasContextFromMemory ? 1 : 0.5;

  // Recency: decay over 72 hours
  const recencyScore = Math.max(0.2, Math.exp(-inputs.sourceAgeHours / 72));

  // Weighted total
  const score = Math.min(1, Math.max(0,
    sourceScore * RUBRIC.sourceQuality +
    completenessScore * RUBRIC.dataCompleteness +
    reasoningScore * RUBRIC.reasoningDepth +
    domainScore * RUBRIC.domainMatch +
    contextScore * RUBRIC.contextRelevance +
    recencyScore * RUBRIC.recency
  ));

  const level = scoreToLevel(score);
  const { explanation, factors } = buildExplanation(score, level, inputs);

  return { score: Math.round(score * 100) / 100, level, explanation, factors };
}

/** Convert numeric score to level */
function scoreToLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) return 'high';
  if (score >= 0.55) return 'medium';
  if (score >= 0.3) return 'low';
  return 'uncertain';
}

/** Build user-facing explanation without exposing rubric */
function buildExplanation(
  score: number,
  level: ConfidenceLevel,
  inputs: ScoringInputs
): { explanation: string; factors: string[] } {
  const factors: string[] = [];

  // Generic factor descriptions (no weights, no rubric)
  if (inputs.sourceCount >= 3 && inputs.sourcesAuthoritative) {
    factors.push('Supported by multiple authoritative sources');
  } else if (inputs.sourceCount >= 1) {
    factors.push('Based on available sources');
  } else {
    factors.push('Limited source data available');
  }

  if (inputs.dataCompletenessPct >= 80) {
    factors.push('Comprehensive data coverage');
  } else if (inputs.dataCompletenessPct >= 50) {
    factors.push('Partial data coverage — some gaps noted');
  } else {
    factors.push('Significant data gaps — treat as preliminary');
  }

  if (inputs.domainMatch) {
    factors.push('Within specialized domain');
  } else {
    factors.push('Outside primary specialization');
  }

  if (inputs.hasContextFromMemory) {
    factors.push('Informed by session context');
  }

  if (inputs.sourceAgeHours > 48) {
    factors.push('Source data may not reflect latest information');
  }

  const explanations: Record<ConfidenceLevel, string> = {
    high: 'This response is well-supported by available evidence and analysis.',
    medium: 'This response is reasonably supported but may have gaps.',
    low: 'This response has limited supporting evidence. Verify independently.',
    uncertain: 'This response should be treated as preliminary. Independent verification recommended.',
  };

  return { explanation: explanations[level], factors };
}

/** Quick confidence for simple responses */
export function quickConfidence(domainMatch: boolean, hasContext: boolean): ConfidenceSignal {
  return calculateConfidence({
    sourceCount: hasContext ? 2 : 0,
    sourcesAuthoritative: domainMatch,
    dataCompletenessPct: hasContext ? 70 : 40,
    reasoningSteps: 2,
    domainMatch,
    hasContextFromMemory: hasContext,
    sourceAgeHours: 1,
  });
}
