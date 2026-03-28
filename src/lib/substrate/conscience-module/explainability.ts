/**
 * CONSCIENCE — Explainability Layer
 * Generates structured, multi-step reasoning chains showing
 * exactly how each ethical framework influenced the final verdict.
 *
 * Replaces the one-liner generateRationale() with a full
 * chain-of-reasoning trace.
 */

import type { EthicalFramework, EthicalEvaluation } from './index';

export interface ReasoningStep {
  framework: EthicalFramework;
  score: number;
  weight: number;
  contribution: number;       // weighted contribution to composite
  verdict: 'supports' | 'neutral' | 'opposes';
  explanation: string;
}

export interface ExplainabilityChain {
  evaluationId: string;
  action: string;
  steps: ReasoningStep[];
  compositeScore: number;
  finalVerdict: 'proceed' | 'caution' | 'block';
  dominantFramework: EthicalFramework;
  weakestFramework: EthicalFramework;
  confidenceLevel: 'high' | 'medium' | 'low';
  summary: string;
  generatedAt: number;
}

const FRAMEWORK_WEIGHTS: Record<EthicalFramework, number> = {
  utilitarian: 0.20,
  deontological: 0.20,
  virtue_ethics: 0.15,
  care_ethics: 0.15,
  rights_based: 0.15,
  justice_theory: 0.15,
};

const FRAMEWORK_LABELS: Record<EthicalFramework, string> = {
  utilitarian: 'Utilitarian Analysis (greatest good for greatest number)',
  deontological: 'Deontological Review (duty and rule adherence)',
  virtue_ethics: 'Virtue Ethics Assessment (character and excellence)',
  care_ethics: 'Care Ethics Evaluation (protection of vulnerable parties)',
  rights_based: 'Rights-Based Analysis (individual rights preservation)',
  justice_theory: 'Justice Theory Check (equitable distribution of outcomes)',
};

function getStepVerdict(score: number): 'supports' | 'neutral' | 'opposes' {
  if (score >= 0.7) return 'supports';
  if (score >= 0.4) return 'neutral';
  return 'opposes';
}

function getStepExplanation(framework: EthicalFramework, score: number): string {
  const label = FRAMEWORK_LABELS[framework];
  if (score >= 0.8) return `${label}: Strongly supports — no concerns identified.`;
  if (score >= 0.6) return `${label}: Generally supportive with minor considerations.`;
  if (score >= 0.4) return `${label}: Ambiguous — action requires careful review.`;
  if (score >= 0.2) return `${label}: Significant concerns — framework conditions not fully met.`;
  return `${label}: Opposes — fundamental ethical conditions violated.`;
}

/** Generate a full explainability chain from an evaluation */
export function generateExplainabilityChain(evaluation: EthicalEvaluation): ExplainabilityChain {
  const steps: ReasoningStep[] = [];
  const frameworks = Object.keys(FRAMEWORK_WEIGHTS) as EthicalFramework[];

  let dominantFramework: EthicalFramework = 'utilitarian';
  let weakestFramework: EthicalFramework = 'utilitarian';
  let highestScore = -1;
  let lowestScore = 2;

  for (const framework of frameworks) {
    const score = evaluation.frameworkScores[framework] ?? 0;
    const weight = FRAMEWORK_WEIGHTS[framework];
    const contribution = score * weight;

    steps.push({
      framework,
      score,
      weight,
      contribution,
      verdict: getStepVerdict(score),
      explanation: getStepExplanation(framework, score),
    });

    if (score > highestScore) { highestScore = score; dominantFramework = framework; }
    if (score < lowestScore) { lowestScore = score; weakestFramework = framework; }
  }

  // Sort steps by contribution (highest first)
  steps.sort((a, b) => b.contribution - a.contribution);

  // Confidence based on score spread
  const spread = highestScore - lowestScore;
  const confidenceLevel = spread < 0.2 ? 'high' : spread < 0.4 ? 'medium' : 'low';

  const supporting = steps.filter(s => s.verdict === 'supports').length;
  const opposing = steps.filter(s => s.verdict === 'opposes').length;

  const summary = [
    `Action "${evaluation.action.slice(0, 80)}" evaluated across ${frameworks.length} ethical frameworks.`,
    `Composite score: ${evaluation.compositeScore}%. Verdict: ${evaluation.recommendation.toUpperCase()}.`,
    `${supporting} framework(s) support, ${opposing} oppose.`,
    `Strongest: ${dominantFramework} (${(highestScore * 100).toFixed(0)}%).`,
    `Weakest: ${weakestFramework} (${(lowestScore * 100).toFixed(0)}%).`,
    confidenceLevel === 'low' ? 'Low confidence — significant disagreement between frameworks.' : '',
  ].filter(Boolean).join(' ');

  return {
    evaluationId: evaluation.id,
    action: evaluation.action,
    steps,
    compositeScore: evaluation.compositeScore,
    finalVerdict: evaluation.recommendation,
    dominantFramework,
    weakestFramework,
    confidenceLevel,
    summary,
    generatedAt: Date.now(),
  };
}
