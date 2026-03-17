/**
 * CMPSBL® Primitive Quality Gate
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Scores, filters, and ranks extracted primitives before persistence.
 * Ensures only high-quality primitives feed into BRAIN learning.
 *
 * Quality scoring considers:
 *   - extraction confidence
 *   - complexity
 *   - keyword richness
 *   - name quality (penalizes generic names)
 *   - duplication risk
 *   - snippet usefulness
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  ExtractedPrimitive,
  QualityReport,
  RejectedPrimitive,
  QualitySummary,
  PrimitiveCategory,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface QualityGateConfig {
  /** Minimum quality score to accept (0–1). Default: 0.35 */
  minQualityScore: number;
  /** Minimum confidence threshold. Default: 0.5 */
  minConfidence: number;
  /** Minimum complexity threshold. Default: 1 */
  minComplexity: number;
  /** Maximum primitives to keep per node (top-N by quality). Default: 80 */
  maxPrimitivesPerNode: number;
  /** Weight for confidence in quality score. Default: 0.30 */
  weightConfidence: number;
  /** Weight for complexity. Default: 0.20 */
  weightComplexity: number;
  /** Weight for keyword richness. Default: 0.15 */
  weightKeywords: number;
  /** Weight for name quality. Default: 0.20 */
  weightNameQuality: number;
  /** Weight for snippet usefulness. Default: 0.15 */
  weightSnippet: number;
}

export const DEFAULT_QUALITY_CONFIG: QualityGateConfig = {
  minQualityScore: 0.35,
  minConfidence: 0.5,
  minComplexity: 1,
  maxPrimitivesPerNode: 80,
  weightConfidence: 0.30,
  weightComplexity: 0.20,
  weightKeywords: 0.15,
  weightNameQuality: 0.20,
  weightSnippet: 0.15,
};

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — GENERIC NAME DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Names that are generic on their own but may be valuable with rich signals */
const GENERIC_NAMES = new Set([
  'init', 'run', 'test', 'main', 'helper', 'temp', 'foo', 'bar', 'baz',
  'processdata', 'handlerequest', 'handle', 'process', 'execute', 'start',
  'stop', 'setup', 'teardown', 'utils', 'index', 'app', 'module',
  'constructor', 'destructor', 'dispose', 'tostring', 'clone',
  'get', 'set', 'update', 'create', 'delete', 'new', 'make',
  'callback', 'handler', 'wrapper', 'factory', 'builder',
  'dowork', 'doit', 'go', 'begin', 'end', 'next', 'prev',
]);

/** Framework boilerplate names that are almost never useful */
const BOILERPLATE_NAMES = new Set([
  'ngonit', 'ngoninit', 'ngondestroy', 'componentdidmount',
  'componentwillunmount', 'render', 'getstaticprops', 'getserversideprops',
  'useeffect', 'usestate', 'usememo', 'usecallback',
  'beforeeach', 'aftereach', 'beforeall', 'afterall',
  'describe', 'it', 'expect', 'should',
  'migration', 'seeder', 'seed',
]);

function isGenericName(name: string): boolean {
  return GENERIC_NAMES.has(name.toLowerCase().replace(/[_\\-]/g, ''));
}

function isBoilerplateName(name: string): boolean {
  return BOILERPLATE_NAMES.has(name.toLowerCase().replace(/[_\\-]/g, ''));
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — QUALITY SCORING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute a quality score (0–1) for a primitive using weighted factors.
 */
export function scorePrimitive(
  primitive: ExtractedPrimitive,
  config: QualityGateConfig = DEFAULT_QUALITY_CONFIG
): number {
  // Factor 1: Confidence (0–1)
  const confidenceFactor = primitive.confidence;

  // Factor 2: Complexity (normalized 0–1 from range 1–10)
  const complexityFactor = Math.min(1, (primitive.complexity - 1) / 9);

  // Factor 3: Keyword richness (0–1)
  const keywordFactor = Math.min(1, primitive.keywords.length / 5);

  // Factor 4: Name quality (0–1)
  let nameQuality = 0.5; // baseline
  const nameParts = primitive.name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .split(/[_\\-]+/)
    .filter(w => w.length > 1);

  // Reward descriptive multi-word names
  if (nameParts.length >= 2) nameQuality += 0.2;
  if (nameParts.length >= 3) nameQuality += 0.1;

  // Reward domain-specific naming
  if (primitive.category !== 'unknown') nameQuality += 0.15;

  // Penalize generic names (but not fatally if other signals are strong)
  if (isGenericName(primitive.name)) {
    nameQuality -= 0.3;
  }

  // Heavy penalty for boilerplate
  if (isBoilerplateName(primitive.name)) {
    nameQuality -= 0.5;
  }

  // Penalize very short names
  if (primitive.name.length <= 3) {
    nameQuality -= 0.2;
  }

  nameQuality = Math.max(0, Math.min(1, nameQuality));

  // Factor 5: Snippet usefulness (0–1)
  let snippetFactor = 0.3; // baseline
  if (primitive.sourceSnippet.length > 50) snippetFactor += 0.2;
  if (primitive.sourceSnippet.length > 150) snippetFactor += 0.2;
  if (primitive.inputs.length > 0) snippetFactor += 0.15;
  if (primitive.outputs.length > 0 && primitive.outputs[0] !== 'output') snippetFactor += 0.15;
  snippetFactor = Math.min(1, snippetFactor);

  // Weighted sum
  const score =
    confidenceFactor * config.weightConfidence +
    complexityFactor * config.weightComplexity +
    keywordFactor * config.weightKeywords +
    nameQuality * config.weightNameQuality +
    snippetFactor * config.weightSnippet;

  return Math.round(score * 1000) / 1000;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — QUALITY GATE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run the quality gate on extracted primitives.
 * Returns accepted (ranked) and rejected primitives with reasons.
 */
export function runQualityGate(
  primitives: ExtractedPrimitive[],
  config: QualityGateConfig = DEFAULT_QUALITY_CONFIG
): QualityReport {
  const accepted: ExtractedPrimitive[] = [];
  const rejected: RejectedPrimitive[] = [];

  for (const primitive of primitives) {
    const score = scorePrimitive(primitive, config);
    const scored = { ...primitive, qualityScore: score };

    // Check hard rejection thresholds
    if (score < config.minQualityScore) {
      rejected.push({ primitive: scored, reason: `Quality score ${score.toFixed(3)} below threshold ${config.minQualityScore}`, score });
      continue;
    }
    if (primitive.confidence < config.minConfidence) {
      rejected.push({ primitive: scored, reason: `Confidence ${primitive.confidence} below threshold ${config.minConfidence}`, score });
      continue;
    }
    if (isBoilerplateName(primitive.name) && primitive.keywords.length < 3) {
      rejected.push({ primitive: scored, reason: `Boilerplate name \"${primitive.name}\" with insufficient signals`, score });
      continue;
    }

    accepted.push(scored);
  }

  // Sort by quality score descending, keep top N
  accepted.sort((a, b) => b.qualityScore - a.qualityScore);
  const overflow = accepted.splice(config.maxPrimitivesPerNode);
  for (const p of overflow) {
    rejected.push({ primitive: p, reason: `Exceeded max primitives cap (${config.maxPrimitivesPerNode})`, score: p.qualityScore });
  }

  // Build summary
  const categoryMap = new Map<PrimitiveCategory, number>();
  const trustMap: Record<string, number> = {};
  let totalQuality = 0;
  let totalConfidence = 0;

  for (const p of accepted) {
    categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    trustMap[p.extractionTrust] = (trustMap[p.extractionTrust] || 0) + 1;
    totalQuality += p.qualityScore;
    totalConfidence += p.confidence;
  }

  const summary: QualitySummary = {
    totalExtracted: primitives.length,
    totalAccepted: accepted.length,
    totalRejected: rejected.length,
    avgQualityScore: accepted.length > 0 ? Math.round((totalQuality / accepted.length) * 1000) / 1000 : 0,
    avgConfidence: accepted.length > 0 ? Math.round((totalConfidence / accepted.length) * 1000) / 1000 : 0,
    topCategories: Array.from(categoryMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count })),
    extractionTrustBreakdown: trustMap,
  };

  return { accepted, rejected, summary };
}
