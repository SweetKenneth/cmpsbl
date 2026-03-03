/**
 * AutoBlog Quality Pipeline v1.0
 * Ported & adapted from RCRDBL's reader-aware intelligence system.
 *
 * Pipeline stages:
 *  1. Confidence Engine — multi-factor scoring → tone/length/style modifiers
 *  2. Contradiction Engine — adversarial counter-draft, merge valid objections
 *  3. Split Brain Evaluation — dual Reader/Skeptic review + caveat injection
 *  4. Assumption Labeler — extract implicit assumptions, detect breakage
 *
 * All AI calls go through the NEXUS router — never use Lovable AI.
 */

import { supabase } from '@/integrations/supabase/client';
import { getEffectiveWeights } from './confidence-governor';
import { evaluateSemanticDrift, type SemanticDriftResult } from './semantic-drift';
import { getTopicSeedAlignment } from './site-scanner';

// ---------------------------------------------------------------------------
// 1. CONFIDENCE ENGINE
// ---------------------------------------------------------------------------

export interface ConfidenceFactors {
  sourceStability: number;   // 0–1: Is the topic core to the substrate?
  recentSuccessRate: number; // 0–1: Recent publish success ratio
  topicFamiliarity: number;  // 0–1: How many similar posts exist
  contentDensity: number;    // 0–1: Structural richness of draft
  uniqueness: number;        // 0–1: Dissimilarity to recent posts
}

export type ToneModifier = 'speculative' | 'balanced' | 'assertive';
export type LengthModifier = 'abbreviated' | 'standard' | 'extended';

export interface ConfidenceResult {
  score: number;
  factors: ConfidenceFactors;
  toneModifier: ToneModifier;
  lengthModifier: LengthModifier;
}

const CORE_TOPICS = [
  'evolution', 'memory', 'cognitive', 'substrate', 'defense',
  'brain', 'agent', 'nexus', 'governance', 'security',
  'tiering', 'prompt', 'autonomous', 'self-improvement',
];

export async function computeConfidence(
  draft: { title: string; body: string },
  channel: string,
): Promise<ConfidenceResult> {
  const titleLower = (draft.title || '').toLowerCase();
  const bodyLower = (draft.body || '').toLowerCase();
  const combined = `${titleLower} ${bodyLower}`;

  // Source stability — is this a core substrate topic?
  const coreHits = CORE_TOPICS.filter(t => combined.includes(t)).length;
  const sourceStability = Math.min(1, coreHits * 0.15 + (channel === 'changelog' ? 0.2 : 0));

  // Recent success rate
  const { data: recentRuns } = await supabase
    .from('autoblog_runs')
    .select('outcome')
    .order('created_at', { ascending: false })
    .limit(10);
  const successes = (recentRuns || []).filter((r: any) => r.outcome === 'success').length;
  const recentSuccessRate = (recentRuns?.length || 0) > 0 ? successes / recentRuns!.length : 0.5;

  // Topic familiarity — similar posts recently
  const titleWords = draft.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const { data: recentPosts } = await supabase
    .from('auto_blog_posts')
    .select('title')
    .order('published_at', { ascending: false })
    .limit(15);
  const recentTitles = (recentPosts || []).map((p: any) => p.title.toLowerCase());
  const familiarCount = recentTitles.filter(t =>
    titleWords.some(w => t.includes(w))
  ).length;
  const topicFamiliarity = Math.min(1, familiarCount / 5);

  // Content density — structure signals
  const hasHeaders = /^#{2,}/m.test(draft.body);
  const hasCode = draft.body.includes('```');
  const hasList = /^[\-\*] /m.test(draft.body);
  const wordCount = draft.body.split(/\s+/).length;
  const contentDensity = Math.min(1,
    (hasHeaders ? 0.2 : 0) +
    (hasCode ? 0.15 : 0) +
    (hasList ? 0.1 : 0) +
    Math.min(0.55, wordCount / 1000),
  );

  // Uniqueness — inverse of familiarity overlap
  const uniqueness = Math.max(0, 1 - (familiarCount * 0.2));

  const factors: ConfidenceFactors = {
    sourceStability,
    recentSuccessRate,
    topicFamiliarity,
    contentDensity,
    uniqueness,
  };

  // Use adaptive weights from governance
  const weights = await getEffectiveWeights();

  // Apply topic seed alignment bonus
  const draftKeywords = combined.split(/\s+/).filter(w => w.length > 4);
  const seedBonus = await getTopicSeedAlignment(draftKeywords);
  const adjustedSourceStability = Math.min(1, sourceStability + seedBonus);

  const score = Math.min(1, Math.max(0,
    adjustedSourceStability * weights.sourceStability +
    recentSuccessRate * weights.recentSuccessRate +
    topicFamiliarity * weights.topicFamiliarity +
    contentDensity * weights.contentDensity +
    uniqueness * weights.uniqueness,
  ));

  let toneModifier: ToneModifier;
  let lengthModifier: LengthModifier;

  if (score < 0.4) {
    toneModifier = 'speculative';
    lengthModifier = 'abbreviated';
  } else if (score < 0.7) {
    toneModifier = 'balanced';
    lengthModifier = 'standard';
  } else {
    toneModifier = 'assertive';
    lengthModifier = 'extended';
  }

  return { score, factors, toneModifier, lengthModifier };
}

// ---------------------------------------------------------------------------
// 2. CONTRADICTION ENGINE
// ---------------------------------------------------------------------------

export interface ContradictionResult {
  primaryScore: number;
  counterScore: number;
  winner: 'primary' | 'counter' | 'merged';
  objectionsMerged: string[];
  confidenceAdjustment: number;
  blocked: boolean;
  blockReason?: string;
}

const MIN_CREDIBILITY_THRESHOLD = 0.35;

/**
 * Score a draft based on structural quality signals (no AI call needed).
 */
function scoreDraft(draft: { title: string; body: string }, confidence: ConfidenceResult): number {
  let score = confidence.score;

  // Structure bonus
  const hasStructure = draft.body.includes('##') || draft.body.includes('###');
  if (hasStructure) score += 0.1;

  // Code example bonus
  if (draft.body.includes('```')) score += 0.05;

  // Length penalty / bonus
  const wordCount = draft.body.split(/\s+/).length;
  if (wordCount < 100) score -= 0.15;
  else if (wordCount > 400) score += 0.05;

  return Math.min(1, Math.max(0, score));
}

/**
 * Generate a counter-argument via NEXUS.
 * Falls back to a heuristic score if NEXUS is unavailable.
 */
async function generateContradiction(
  draft: { title: string; body: string },
): Promise<{ counterScore: number; objections: string[] }> {
  try {
    const { substrate } = await import('../substrate');

    if (!substrate.nexus?.text) {
      return heuristicContradiction(draft);
    }

    const prompt = `You are a critical analyst. Challenge this blog draft.

TITLE: ${draft.title}
CONTENT (first 600 chars): ${draft.body.substring(0, 600)}...

Generate 2-3 main objections and rate the strength of the counter-argument 0.0-1.0.

Respond ONLY in JSON:
{
  "mainObjections": ["objection 1", "objection 2"],
  "strengthScore": 0.0-1.0
}`;

    const response = await substrate.nexus.text(prompt);
    const text = typeof response === 'string' ? response : (response as any)?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return heuristicContradiction(draft);

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      counterScore: Math.min(1, Math.max(0, parsed.strengthScore || 0.4)),
      objections: (parsed.mainObjections || []).slice(0, 3),
    };
  } catch {
    return heuristicContradiction(draft);
  }
}

function heuristicContradiction(draft: { title: string; body: string }): {
  counterScore: number;
  objections: string[];
} {
  const body = draft.body.toLowerCase();
  const objections: string[] = [];
  let counterScore = 0.3;

  // Check for unsupported claims
  const absoluteWords = ['always', 'never', 'every', 'impossible', 'guaranteed'];
  const absoluteCount = absoluteWords.filter(w => body.includes(w)).length;
  if (absoluteCount > 0) {
    counterScore += absoluteCount * 0.1;
    objections.push('Contains absolute claims that may not hold in all cases');
  }

  // Check for missing evidence
  if (!body.includes('data') && !body.includes('example') && !body.includes('evidence')) {
    counterScore += 0.1;
    objections.push('Claims lack supporting evidence or examples');
  }

  // Check for one-sided framing
  if (!body.includes('however') && !body.includes('although') && !body.includes('limitation')) {
    counterScore += 0.05;
    objections.push('Framing appears one-sided without acknowledging limitations');
  }

  return { counterScore: Math.min(1, counterScore), objections };
}

export async function runContradictionEngine(
  draft: { title: string; body: string },
  confidence: ConfidenceResult,
): Promise<ContradictionResult> {
  const primaryScore = scoreDraft(draft, confidence);
  const { counterScore, objections } = await generateContradiction(draft);

  const result: ContradictionResult = {
    primaryScore,
    counterScore,
    winner: 'primary',
    objectionsMerged: [],
    confidenceAdjustment: 0,
    blocked: false,
  };

  // Both below threshold → block
  if (primaryScore < MIN_CREDIBILITY_THRESHOLD && counterScore < MIN_CREDIBILITY_THRESHOLD) {
    result.blocked = true;
    result.blockReason = 'Neither draft achieved minimum credibility threshold';
    return result;
  }

  // Counter wins → merge objections into primary
  if (counterScore > primaryScore && objections.length > 0) {
    result.winner = 'merged';
    result.objectionsMerged = objections.slice(0, 2);
    result.confidenceAdjustment = -0.15;
  } else {
    result.winner = 'primary';
    result.confidenceAdjustment = 0.1;
  }

  return result;
}

// ---------------------------------------------------------------------------
// 3. SPLIT BRAIN EVALUATION
// ---------------------------------------------------------------------------

export interface SplitBrainResult {
  readerBrainScore: number;
  skepticBrainScore: number;
  caveatsToInject: string[];
  finalDecision: 'publish' | 'publish_with_caveats' | 'block';
}

export async function runSplitBrain(
  draft: { title: string; body: string },
  confidence: ConfidenceResult,
): Promise<SplitBrainResult> {
  try {
    const { substrate } = await import('../substrate');

    if (!substrate.nexus?.text) {
      return heuristicSplitBrain(draft, confidence);
    }

    const prompt = `Perform a DUAL EVALUATION of this blog post.

TITLE: ${draft.title}
CONTENT (first 800 chars): ${draft.body.substring(0, 800)}...

READER BRAIN (Clarity): Score 0.0-1.0. Is it easy to understand? Logical structure? Terms explained?
SKEPTIC BRAIN (Credibility): Score 0.0-1.0. Claims supported? Sources credible? Any logical fallacies?

If Skeptic score < 0.5, generate 1-3 caveats to inject.

Respond ONLY in JSON:
{
  "readerBrainScore": 0.0-1.0,
  "skepticBrainScore": 0.0-1.0,
  "caveats": ["caveat if needed"]
}`;

    const response = await substrate.nexus.text(prompt);
    const text = typeof response === 'string' ? response : (response as any)?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return heuristicSplitBrain(draft, confidence);

    const parsed = JSON.parse(jsonMatch[0]);
    const caveats = parsed.caveats || [];

    let finalDecision: SplitBrainResult['finalDecision'] = 'publish';
    if ((parsed.skepticBrainScore || 0) < 0.3) {
      finalDecision = 'block';
    } else if ((parsed.skepticBrainScore || 0) < 0.5 && caveats.length > 0) {
      finalDecision = 'publish_with_caveats';
    }

    return {
      readerBrainScore: parsed.readerBrainScore || confidence.score,
      skepticBrainScore: parsed.skepticBrainScore || confidence.score * 0.9,
      caveatsToInject: caveats,
      finalDecision,
    };
  } catch {
    return heuristicSplitBrain(draft, confidence);
  }
}

function heuristicSplitBrain(
  draft: { title: string; body: string },
  confidence: ConfidenceResult,
): SplitBrainResult {
  const body = draft.body;

  // Reader Brain heuristic: structure + readability
  const hasHeaders = /^#{2,}/m.test(body);
  const hasList = /^[\-\*] /m.test(body);
  const wordCount = body.split(/\s+/).length;
  const avgSentenceLen = body.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const readability = Math.min(1,
    (hasHeaders ? 0.3 : 0) +
    (hasList ? 0.2 : 0) +
    (wordCount > 100 && wordCount < 2000 ? 0.3 : 0.1) +
    (avgSentenceLen > 3 ? 0.2 : 0.1),
  );

  // Skeptic Brain heuristic: evidence signals
  const bodyLower = body.toLowerCase();
  const evidenceWords = ['data', 'evidence', 'research', 'study', 'example', 'measured', 'observed'];
  const evidenceCount = evidenceWords.filter(w => bodyLower.includes(w)).length;
  const credibility = Math.min(1, 0.3 + evidenceCount * 0.1);

  const caveats: string[] = [];
  if (credibility < 0.5) {
    caveats.push('This analysis is based on system observations and may not apply universally.');
  }

  let finalDecision: SplitBrainResult['finalDecision'] = 'publish';
  if (credibility < 0.3) finalDecision = 'block';
  else if (credibility < 0.5) finalDecision = 'publish_with_caveats';

  return {
    readerBrainScore: readability,
    skepticBrainScore: credibility,
    caveatsToInject: caveats,
    finalDecision,
  };
}

export async function logSplitBrainAudit(
  postId: string | null,
  queueId: string | null,
  result: SplitBrainResult,
): Promise<void> {
  await supabase.from('autoblog_split_brain_audits' as any).insert({
    post_id: postId,
    queue_id: queueId,
    reader_brain_score: result.readerBrainScore,
    skeptic_brain_score: result.skepticBrainScore,
    caveats_injected: result.caveatsToInject,
    caveat_count: result.caveatsToInject.length,
    final_decision: result.finalDecision,
  });
}

// ---------------------------------------------------------------------------
// 4. ASSUMPTION LABELER
// ---------------------------------------------------------------------------

export interface ExtractedAssumption {
  text: string;
  type: 'implicit' | 'explicit' | 'inferred';
  confidence: number;
}

export async function extractAssumptions(
  draft: { title: string; body: string },
): Promise<ExtractedAssumption[]> {
  try {
    const { substrate } = await import('../substrate');

    if (!substrate.nexus?.text) {
      return heuristicAssumptions(draft);
    }

    const prompt = `Analyze this blog post and extract 3-5 IMPLICIT ASSUMPTIONS the author makes.

TITLE: ${draft.title}
CONTENT: ${draft.body.substring(0, 1500)}...

Extract assumptions about: reader knowledge level, technology capabilities, industry trends, causation vs correlation.

Respond ONLY in JSON:
{
  "assumptions": [
    {"text": "assumption statement", "type": "implicit|explicit|inferred", "confidence": 0.0-1.0}
  ]
}`;

    const response = await substrate.nexus.text(prompt);
    const text = typeof response === 'string' ? response : (response as any)?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return heuristicAssumptions(draft);

    const parsed = JSON.parse(jsonMatch[0]);
    return (parsed.assumptions || []).slice(0, 5);
  } catch {
    return heuristicAssumptions(draft);
  }
}

function heuristicAssumptions(draft: { title: string; body: string }): ExtractedAssumption[] {
  const assumptions: ExtractedAssumption[] = [];
  const bodyLower = draft.body.toLowerCase();

  if (bodyLower.includes('developer') || bodyLower.includes('engineer')) {
    assumptions.push({
      text: 'Assumes readers have a technical software engineering background',
      type: 'implicit',
      confidence: 0.7,
    });
  }

  if (bodyLower.includes('production') || bodyLower.includes('deploy')) {
    assumptions.push({
      text: 'Assumes readers are deploying to production environments',
      type: 'implicit',
      confidence: 0.6,
    });
  }

  if (bodyLower.includes('scale') || bodyLower.includes('distributed')) {
    assumptions.push({
      text: 'Assumes relevance of distributed systems at scale',
      type: 'inferred',
      confidence: 0.5,
    });
  }

  return assumptions;
}

export async function storeAssumptions(
  postId: string,
  assumptions: ExtractedAssumption[],
): Promise<void> {
  if (assumptions.length === 0) return;

  const records = assumptions.map(a => ({
    post_id: postId,
    assumption_text: a.text,
    assumption_type: a.type,
    confidence_level: a.confidence,
  }));

  await supabase.from('autoblog_assumptions' as any).insert(records);
}

/**
 * Check if new content breaks any stored assumptions.
 */
export async function checkAssumptionBreaks(
  newContent: { title: string; body: string },
): Promise<string[]> {
  const { data: assumptions } = await supabase
    .from('autoblog_assumptions' as any)
    .select('id, assumption_text')
    .eq('is_broken', false)
    .limit(50);

  if (!assumptions || assumptions.length === 0) return [];

  const contentLower = newContent.body.toLowerCase();
  const contradictionIndicators = ['however', 'contrary to', 'no longer', 'incorrect', 'false', 'outdated', 'deprecated'];
  const brokenIds: string[] = [];

  for (const assumption of assumptions as any[]) {
    const words = assumption.assumption_text.toLowerCase().split(' ').filter((w: string) => w.length > 4);
    const hasRelated = words.some((w: string) => contentLower.includes(w));
    const hasContradiction = contradictionIndicators.some(ind => contentLower.includes(ind));

    if (hasRelated && hasContradiction) {
      brokenIds.push(assumption.id);
      await supabase.from('autoblog_assumptions' as any).update({
        is_broken: true,
        broken_at: new Date().toISOString(),
      }).eq('id', assumption.id);
    }
  }

  return brokenIds;
}

// ---------------------------------------------------------------------------
// 5. FULL PIPELINE ORCHESTRATION
// ---------------------------------------------------------------------------

export interface QualityPipelineResult {
  passed: boolean;
  confidence: ConfidenceResult;
  contradiction: ContradictionResult;
  splitBrain: SplitBrainResult;
  assumptions: ExtractedAssumption[];
  brokenAssumptions: string[];
  semanticDrift: SemanticDriftResult;
  modifiedBody?: string;
  blockReason?: string;
}

/**
 * Run the complete quality pipeline on a draft before publishing.
 *
 * Pipeline order:
 *  1. Confidence Engine
 *  2. Contradiction Engine
 *  3. Split Brain Evaluation
 *  4. Assumption Labeler
 */
export async function runQualityPipeline(
  draft: { title: string; body: string },
  channel: string,
): Promise<QualityPipelineResult> {
  const defaultDrift: SemanticDriftResult = {
    driftScore: 0, driftDirection: 'aligned', confidencePenalty: 0, tokenOverlap: 1, comparedAgainst: 0,
  };

  // Step 1: Confidence
  const confidence = await computeConfidence(draft, channel);

  // Step 1b: Semantic Drift (calibration only, never blocks)
  let semanticDrift = defaultDrift;
  try {
    semanticDrift = await evaluateSemanticDrift(draft);
    // Apply drift penalty to confidence (max -0.1)
    if (semanticDrift.confidencePenalty < 0) {
      confidence.score = Math.max(0, confidence.score + semanticDrift.confidencePenalty);
    }
  } catch {
    console.warn('[AutoBlog QP] Semantic drift evaluation failed, continuing');
  }

  // Step 2: Contradiction
  const contradiction = await runContradictionEngine(draft, confidence);

  if (contradiction.blocked) {
    return {
      passed: false,
      confidence,
      contradiction,
      splitBrain: { readerBrainScore: 0, skepticBrainScore: 0, caveatsToInject: [], finalDecision: 'block' },
      assumptions: [],
      brokenAssumptions: [],
      semanticDrift,
      blockReason: contradiction.blockReason,
    };
  }

  // Adjust confidence based on contradiction outcome
  confidence.score = Math.max(0, Math.min(1, confidence.score + contradiction.confidenceAdjustment));

  // Build modified body if objections were merged
  let modifiedBody = draft.body;
  if (contradiction.objectionsMerged.length > 0) {
    const objectionsNote = `\n\n---\n*Considerations integrated during review:*\n${contradiction.objectionsMerged.map(o => `- ${o}`).join('\n')}`;
    modifiedBody += objectionsNote;
  }

  // Step 3: Split Brain
  const splitBrain = await runSplitBrain(
    { title: draft.title, body: modifiedBody },
    confidence,
  );

  if (splitBrain.finalDecision === 'block') {
    return {
      passed: false,
      confidence,
      contradiction,
      splitBrain,
      assumptions: [],
      brokenAssumptions: [],
      semanticDrift,
      modifiedBody,
      blockReason: 'Split Brain evaluation blocked: skeptic credibility too low',
    };
  }

  // Inject caveats if needed
  if (splitBrain.finalDecision === 'publish_with_caveats' && splitBrain.caveatsToInject.length > 0) {
    const caveatNote = `\n\n---\n*Considerations:*\n${splitBrain.caveatsToInject.map(c => `- ${c}`).join('\n')}`;
    modifiedBody += caveatNote;
  }

  // Step 4: Assumptions
  const assumptions = await extractAssumptions({ title: draft.title, body: modifiedBody });
  const brokenAssumptions = await checkAssumptionBreaks({ title: draft.title, body: modifiedBody });

  return {
    passed: true,
    confidence,
    contradiction,
    splitBrain,
    assumptions,
    brokenAssumptions,
    semanticDrift,
    modifiedBody,
  };
}
