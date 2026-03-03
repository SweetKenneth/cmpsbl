/**
 * AutoBlog Semantic Drift Detection v1.0
 * Calibration-only: never blocks publishing.
 * Compares new draft against recent posts to detect topic drift.
 */

import { supabase } from '@/integrations/supabase/client';

export type DriftDirection = 'aligned' | 'diverging' | 'reversing';

export interface SemanticDriftResult {
  driftScore: number;         // 0.0–1.0
  driftDirection: DriftDirection;
  confidencePenalty: number;  // 0 to -0.1
  tokenOverlap: number;      // 0.0–1.0
  comparedAgainst: number;    // how many posts compared
}

/**
 * Tokenize text into meaningful word stems (simple approach).
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );
}

/**
 * Compute Jaccard similarity between two token sets.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Evaluate semantic drift of a new draft against the last N published posts.
 * This is calibration-only and NEVER blocks publishing.
 */
export async function evaluateSemanticDrift(
  draft: { title: string; body: string },
  lookback: number = 20,
): Promise<SemanticDriftResult> {
  const defaultResult: SemanticDriftResult = {
    driftScore: 0,
    driftDirection: 'aligned',
    confidencePenalty: 0,
    tokenOverlap: 1,
    comparedAgainst: 0,
  };

  try {
    const { data: recentPosts } = await supabase
      .from('auto_blog_posts')
      .select('title, content')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(lookback);

    if (!recentPosts || recentPosts.length === 0) {
      return defaultResult;
    }

    const draftTokens = tokenize(`${draft.title} ${draft.body}`);

    // Compute similarity against each recent post
    const similarities = recentPosts.map(post => {
      const postTokens = tokenize(`${post.title} ${post.content}`);
      return jaccardSimilarity(draftTokens, postTokens);
    });

    // Average similarity
    const avgSimilarity = similarities.reduce((s, v) => s + v, 0) / similarities.length;

    // Drift score is inverse of similarity (more different = more drift)
    const driftScore = Math.min(1, Math.max(0, 1 - avgSimilarity));

    // Check trend: compare similarity to first half vs second half of posts
    const halfIdx = Math.floor(similarities.length / 2);
    const recentHalf = similarities.slice(0, halfIdx);
    const olderHalf = similarities.slice(halfIdx);

    const recentAvg = recentHalf.length > 0
      ? recentHalf.reduce((s, v) => s + v, 0) / recentHalf.length
      : avgSimilarity;
    const olderAvg = olderHalf.length > 0
      ? olderHalf.reduce((s, v) => s + v, 0) / olderHalf.length
      : avgSimilarity;

    let driftDirection: DriftDirection = 'aligned';
    if (recentAvg < olderAvg - 0.1) {
      driftDirection = 'diverging';
    } else if (recentAvg > olderAvg + 0.1) {
      driftDirection = 'reversing';
    }

    // Confidence penalty: only applies if drift is high
    const confidencePenalty = driftScore > 0.6 ? Math.min(0, -(driftScore - 0.6) * 0.25) : 0;

    // Log drift event
    await supabase.from('brain_events').insert({
      module: 'autoblog',
      event_type: 'semantic_drift_detected',
      data: {
        driftScore: parseFloat(driftScore.toFixed(3)),
        driftDirection,
        tokenOverlap: parseFloat(avgSimilarity.toFixed(3)),
        comparedAgainst: recentPosts.length,
        confidencePenalty: parseFloat(confidencePenalty.toFixed(3)),
      },
      outcome: driftScore > 0.6 ? 'warning' : 'completed',
    });

    return {
      driftScore: parseFloat(driftScore.toFixed(3)),
      driftDirection,
      confidencePenalty: parseFloat(confidencePenalty.toFixed(3)),
      tokenOverlap: parseFloat(avgSimilarity.toFixed(3)),
      comparedAgainst: recentPosts.length,
    };
  } catch (err) {
    console.warn('[AutoBlog Drift] Evaluation failed, defaulting to aligned:', err);
    return defaultResult;
  }
}
