/**
 * AutoBlog Quality Pipeline — Autonomous Content Production Engine
 * 
 * Pipeline: topic_seed → generate_content → confidence_engine → contradiction_engine
 *           → split_brain_evaluation → review_or_publish
 * 
 * Confidence factors: factual accuracy, writing quality, topic relevance, novelty, SEO alignment
 * Split brain: reader clarity vs skeptic credibility
 * Autonomous publish gated by token-bucket governor
 */

import { supabase } from '@/integrations/supabase/client';
import { emit } from '../events/emit';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AutoBlogTopic {
  seed: string;
  category: string;
  source: 'scanner' | 'scheduled' | 'manual' | 'clm';
  priority: number;
}

export interface ConfidenceScore {
  overall: number;
  factors: {
    factual_accuracy: number;
    writing_quality: number;
    topic_relevance: number;
    novelty: number;
    seo_alignment: number;
  };
  weights: {
    factual_accuracy: number;
    writing_quality: number;
    topic_relevance: number;
    novelty: number;
    seo_alignment: number;
  };
}

export interface ContradictionResult {
  score: number; // 0 = no contradictions, 1 = severe
  contradictions: { existing_post_slug: string; description: string; severity: number }[];
  credibility: number;
  outcome: 'pass' | 'block' | 'caveat';
}

export interface SplitBrainResult {
  reader_score: number;  // 0–1, clarity & engagement
  skeptic_score: number; // 0–1, credibility & rigor
  decision: 'publish' | 'block' | 'caveat';
  reasoning: string;
}

export interface PipelineResult {
  topic: AutoBlogTopic;
  confidence: ConfidenceScore;
  contradiction: ContradictionResult;
  splitBrain: SplitBrainResult;
  publishable: boolean;
  slug?: string;
  blockedReason?: string;
}

// ═══════════════════════════════════════════════════════════════
// PUBLISH GOVERNOR (Token Bucket)
// ═══════════════════════════════════════════════════════════════

const PUBLISH_BUCKET = {
  maxTokens: 3.0,
  tokens: 3.0,
  refillRate: 1.0 / (24 * 60 * 60 * 1000), // 1 token per day in ms
  lastRefill: Date.now(),
  readinessThreshold: 0.55,
};

function refillBucket(): void {
  const now = Date.now();
  const elapsed = now - PUBLISH_BUCKET.lastRefill;
  PUBLISH_BUCKET.tokens = Math.min(
    PUBLISH_BUCKET.maxTokens,
    PUBLISH_BUCKET.tokens + elapsed * PUBLISH_BUCKET.refillRate
  );
  PUBLISH_BUCKET.lastRefill = now;
}

function consumeToken(): boolean {
  refillBucket();
  if (PUBLISH_BUCKET.tokens >= 1.0) {
    PUBLISH_BUCKET.tokens -= 1.0;
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
// WORD LENGTH CADENCE
// ═══════════════════════════════════════════════════════════════

let cadenceIndex = 0;
const WORD_CADENCE = [850, 850, 1200];

export function getTargetWordCount(): number {
  const count = WORD_CADENCE[cadenceIndex % WORD_CADENCE.length];
  cadenceIndex++;
  return count;
}

// ═══════════════════════════════════════════════════════════════
// CONFIDENCE ENGINE
// ═══════════════════════════════════════════════════════════════

const DEFAULT_WEIGHTS = {
  factual_accuracy: 0.30,
  writing_quality: 0.20,
  topic_relevance: 0.20,
  novelty: 0.15,
  seo_alignment: 0.15,
};

export function computeConfidence(factors: ConfidenceScore['factors']): ConfidenceScore {
  const weights = { ...DEFAULT_WEIGHTS };
  const overall =
    factors.factual_accuracy * weights.factual_accuracy +
    factors.writing_quality * weights.writing_quality +
    factors.topic_relevance * weights.topic_relevance +
    factors.novelty * weights.novelty +
    factors.seo_alignment * weights.seo_alignment;

  return { overall: Math.round(overall * 1000) / 1000, factors, weights };
}

// ═══════════════════════════════════════════════════════════════
// CONTRADICTION ENGINE
// ═══════════════════════════════════════════════════════════════

export async function runContradictionScan(
  content: string,
  category: string
): Promise<ContradictionResult> {
  // Fetch recent posts in the same category for comparison
  const { data: recentPosts } = await supabase
    .from('auto_blog_posts')
    .select('slug, title, content, category')
    .eq('category', category)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  const contradictions: ContradictionResult['contradictions'] = [];

  if (recentPosts) {
    for (const post of recentPosts) {
      // Simple overlap detection — in production this would use semantic similarity
      const overlap = computeTextOverlap(content, post.content || '');
      if (overlap > 0.6) {
        contradictions.push({
          existing_post_slug: post.slug,
          description: `High content overlap (${(overlap * 100).toFixed(0)}%) with "${post.title}"`,
          severity: overlap,
        });
      }
    }
  }

  const avgSeverity = contradictions.length > 0
    ? contradictions.reduce((s, c) => s + c.severity, 0) / contradictions.length
    : 0;

  const credibility = Math.max(0, 1 - avgSeverity);
  let outcome: ContradictionResult['outcome'] = 'pass';
  if (credibility < 0.35) outcome = 'block';
  else if (credibility < 0.5) outcome = 'caveat';

  return { score: avgSeverity, contradictions, credibility, outcome };
}

// ═══════════════════════════════════════════════════════════════
// SPLIT BRAIN EVALUATION
// ═══════════════════════════════════════════════════════════════

export function evaluateSplitBrain(
  confidence: ConfidenceScore,
  contradiction: ContradictionResult
): SplitBrainResult {
  // Reader: cares about clarity, engagement, relevance
  const reader_score =
    confidence.factors.writing_quality * 0.4 +
    confidence.factors.topic_relevance * 0.35 +
    confidence.factors.seo_alignment * 0.25;

  // Skeptic: cares about accuracy, credibility, novelty
  const skeptic_score =
    confidence.factors.factual_accuracy * 0.4 +
    contradiction.credibility * 0.35 +
    confidence.factors.novelty * 0.25;

  let decision: SplitBrainResult['decision'] = 'publish';
  let reasoning = 'Both reader and skeptic thresholds met';

  if (skeptic_score < 0.35) {
    decision = 'block';
    reasoning = `Skeptic credibility too low (${(skeptic_score * 100).toFixed(0)}%)`;
  } else if (skeptic_score < 0.5) {
    decision = 'caveat';
    reasoning = `Skeptic credibility marginal (${(skeptic_score * 100).toFixed(0)}%) — adding caveats`;
  } else if (reader_score < 0.4) {
    decision = 'caveat';
    reasoning = `Reader clarity low (${(reader_score * 100).toFixed(0)}%) — needs revision`;
  }

  return {
    reader_score: Math.round(reader_score * 1000) / 1000,
    skeptic_score: Math.round(skeptic_score * 1000) / 1000,
    decision,
    reasoning,
  };
}

// ═══════════════════════════════════════════════════════════════
// FULL PIPELINE
// ═══════════════════════════════════════════════════════════════

export async function runAutoBlogPipeline(
  topic: AutoBlogTopic,
  generatedContent: string
): Promise<PipelineResult> {
  emit({
    module: 'autoblog',
    event_type: 'pipeline.started',
    outcome: 'started',
    data: { topic: topic.seed, category: topic.category },
  });

  // 1. Confidence scoring
  const factors: ConfidenceScore['factors'] = {
    factual_accuracy: 0.8, // Would be computed by AI in production
    writing_quality: 0.75,
    topic_relevance: 0.85,
    novelty: 0.7,
    seo_alignment: 0.8,
  };
  const confidence = computeConfidence(factors);

  // 2. Contradiction scan
  const contradiction = await runContradictionScan(generatedContent, topic.category);

  // 3. Split brain evaluation
  const splitBrain = evaluateSplitBrain(confidence, contradiction);

  // 4. Publish decision
  let publishable = false;
  let blockedReason: string | undefined;

  if (splitBrain.decision === 'block') {
    blockedReason = splitBrain.reasoning;
  } else if (contradiction.outcome === 'block') {
    blockedReason = `Contradiction engine blocked: credibility ${(contradiction.credibility * 100).toFixed(0)}%`;
  } else if (confidence.overall < PUBLISH_BUCKET.readinessThreshold) {
    blockedReason = `Confidence ${confidence.overall.toFixed(2)} below readiness threshold ${PUBLISH_BUCKET.readinessThreshold}`;
  } else if (!consumeToken()) {
    blockedReason = 'Publish rate limit reached — token bucket empty';
  } else {
    publishable = true;
  }

  emit({
    module: 'autoblog',
    event_type: publishable ? 'pipeline.publish_ready' : 'pipeline.blocked',
    outcome: publishable ? 'succeeded' : 'failed',
    data: {
      topic: topic.seed,
      confidence: confidence.overall,
      reader: splitBrain.reader_score,
      skeptic: splitBrain.skeptic_score,
      publishable,
      blockedReason,
    },
  });

  return {
    topic,
    confidence,
    contradiction,
    splitBrain,
    publishable,
    blockedReason,
  };
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════

function computeTextOverlap(a: string, b: string): number {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 4));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 4));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap / Math.max(wordsA.size, wordsB.size);
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

export function getPublishBucketState() {
  refillBucket();
  return {
    tokens: Math.round(PUBLISH_BUCKET.tokens * 100) / 100,
    maxTokens: PUBLISH_BUCKET.maxTokens,
    readinessThreshold: PUBLISH_BUCKET.readinessThreshold,
  };
}
