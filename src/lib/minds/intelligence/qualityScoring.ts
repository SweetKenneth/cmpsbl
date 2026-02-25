/**
 * Minds Intelligence Layer — Output Quality Scoring Engine
 * GATED: INTERNAL_ONLY
 * Internal rubric evaluation. Score outputs before returning.
 * Scoring UI NOT exposed publicly.
 */

import { isFeatureAvailable } from './featureFlags';

export interface QualityScore {
  overall: number; // 0-100
  dimensions: Record<string, number>;
  pass: boolean;
  /** Internal only — never send to client */
  internalNotes: string[];
}

export interface QualityDimension {
  name: string;
  weight: number;
  evaluator: (output: string, context: QualityContext) => number;
}

export interface QualityContext {
  mindSku: string;
  taskType: string;
  inputLength: number;
  hasMemoryContext: boolean;
  expectedFormat?: string;
}

/** Quality threshold — outputs below this get flagged */
const QUALITY_THRESHOLD = 60;

/** Domain-specific quality dimensions */
const BASE_DIMENSIONS: QualityDimension[] = [
  {
    name: 'completeness',
    weight: 0.25,
    evaluator: (output, ctx) => {
      const wordCount = output.split(/\s+/).length;
      const minWords = ctx.taskType === 'summary' ? 30 : 80;
      const maxWords = ctx.taskType === 'summary' ? 300 : 2000;
      if (wordCount < minWords) return Math.max(20, (wordCount / minWords) * 100);
      if (wordCount > maxWords) return Math.max(40, 100 - ((wordCount - maxWords) / maxWords) * 30);
      return 85;
    },
  },
  {
    name: 'structure',
    weight: 0.20,
    evaluator: (output) => {
      let score = 50;
      if (output.includes('\n')) score += 10;
      if (/^#{1,3}\s/m.test(output)) score += 10; // Headers
      if (/^[-*]\s/m.test(output)) score += 10; // Lists
      if (/\d+\.\s/m.test(output)) score += 10; // Numbered lists
      if (output.includes('```')) score += 5; // Code blocks
      return Math.min(100, score);
    },
  },
  {
    name: 'specificity',
    weight: 0.20,
    evaluator: (output) => {
      let score = 50;
      // Check for specific data points
      if (/\d+%/.test(output)) score += 10;
      if (/\$[\d,]+/.test(output)) score += 10;
      if (/https?:\/\//.test(output)) score += 10; // URLs/sources
      if (/\b(because|therefore|since|due to)\b/i.test(output)) score += 10; // Reasoning
      if (/\b(however|although|while|but)\b/i.test(output)) score += 5; // Nuance
      return Math.min(100, score);
    },
  },
  {
    name: 'actionability',
    weight: 0.15,
    evaluator: (output) => {
      let score = 40;
      if (/\b(step \d|first|second|third|next)\b/i.test(output)) score += 20;
      if (/\b(should|recommend|suggest|consider|try)\b/i.test(output)) score += 15;
      if (/\b(action item|todo|next step|takeaway)\b/i.test(output)) score += 15;
      return Math.min(100, score);
    },
  },
  {
    name: 'tone_consistency',
    weight: 0.10,
    evaluator: (output) => {
      let score = 70;
      // Penalize mixed tones
      const hasInformal = /\b(gonna|wanna|kinda|sorta|lol|omg)\b/i.test(output);
      const hasFormal = /\b(furthermore|notwithstanding|herein|pursuant)\b/i.test(output);
      if (hasInformal && hasFormal) score -= 30;
      // Penalize filler
      const fillerCount = (output.match(/\b(basically|actually|literally|just|really)\b/gi) ?? []).length;
      score -= Math.min(20, fillerCount * 5);
      return Math.max(20, score);
    },
  },
  {
    name: 'safety',
    weight: 0.10,
    evaluator: (output) => {
      let score = 100;
      // Check for potentially leaked internals
      if (/\b(rubric|internal score|confidence calculation|RUBRIC)\b/i.test(output)) score -= 40;
      if (/\b(system prompt|you are a|your instructions)\b/i.test(output)) score -= 30;
      if (/sk[-_]|api[-_]key|secret[-_]/i.test(output)) score -= 50;
      return Math.max(0, score);
    },
  },
];

/** Score an output against quality dimensions */
export function scoreOutput(output: string, context: QualityContext): QualityScore {
  if (!isFeatureAvailable('quality_scoring')) {
    return { overall: 75, dimensions: {}, pass: true, internalNotes: [] };
  }

  const dimensions: Record<string, number> = {};
  const internalNotes: string[] = [];
  let weightedTotal = 0;

  for (const dim of BASE_DIMENSIONS) {
    const score = dim.evaluator(output, context);
    dimensions[dim.name] = Math.round(score);
    weightedTotal += score * dim.weight;

    if (score < 50) {
      internalNotes.push(`Low ${dim.name}: ${Math.round(score)}/100`);
    }
  }

  const overall = Math.round(weightedTotal);
  const pass = overall >= QUALITY_THRESHOLD;

  if (!pass) {
    internalNotes.unshift(`BELOW THRESHOLD: ${overall}/${QUALITY_THRESHOLD}`);
  }

  return { overall, dimensions, pass, internalNotes };
}

/** Check if output passes quality gate */
export function passesQualityGate(output: string, context: QualityContext): boolean {
  const score = scoreOutput(output, context);
  return score.pass;
}

/** Get quality improvement suggestions (internal only) */
export function getSuggestions(score: QualityScore): string[] {
  const suggestions: string[] = [];
  const dims = score.dimensions;

  if ((dims.completeness ?? 100) < 60) suggestions.push('Add more detail and coverage');
  if ((dims.structure ?? 100) < 60) suggestions.push('Use headers, lists, and structured formatting');
  if ((dims.specificity ?? 100) < 60) suggestions.push('Include specific data points and examples');
  if ((dims.actionability ?? 100) < 60) suggestions.push('Add actionable steps and recommendations');
  if ((dims.tone_consistency ?? 100) < 60) suggestions.push('Maintain consistent tone throughout');
  if ((dims.safety ?? 100) < 80) suggestions.push('Review for potential information leakage');

  return suggestions;
}
