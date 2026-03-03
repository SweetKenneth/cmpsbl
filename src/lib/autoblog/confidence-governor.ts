/**
 * AutoBlog Confidence Governor v1.0
 * Dynamic weight tuning for the confidence engine.
 * Weights are persisted in autoblog_confidence_weights and can be
 * adjusted by memory compression cycles.
 */

import { supabase } from '@/integrations/supabase/client';

export interface ConfidenceWeights {
  sourceStability: number;
  recentSuccessRate: number;
  topicFamiliarity: number;
  contentDensity: number;
  uniqueness: number;
}

const DEFAULT_WEIGHTS: ConfidenceWeights = {
  sourceStability: 0.20,
  recentSuccessRate: 0.20,
  topicFamiliarity: 0.10,
  contentDensity: 0.25,
  uniqueness: 0.25,
};

const MAX_DELTA = 0.1;

/**
 * Get the currently active confidence weights.
 * Falls back to defaults if none exist.
 */
export async function getEffectiveWeights(): Promise<ConfidenceWeights> {
  try {
    const { data } = await supabase
      .from('autoblog_confidence_weights' as any)
      .select('weights')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { ...DEFAULT_WEIGHTS };

    const stored = (data as any).weights as Partial<ConfidenceWeights>;
    return normalizeWeights({
      sourceStability: stored.sourceStability ?? DEFAULT_WEIGHTS.sourceStability,
      recentSuccessRate: stored.recentSuccessRate ?? DEFAULT_WEIGHTS.recentSuccessRate,
      topicFamiliarity: stored.topicFamiliarity ?? DEFAULT_WEIGHTS.topicFamiliarity,
      contentDensity: stored.contentDensity ?? DEFAULT_WEIGHTS.contentDensity,
      uniqueness: stored.uniqueness ?? DEFAULT_WEIGHTS.uniqueness,
    });
  } catch {
    return { ...DEFAULT_WEIGHTS };
  }
}

/**
 * Clamp each weight delta to ±MAX_DELTA from defaults, then normalize to sum=1.
 */
function normalizeWeights(raw: ConfidenceWeights): ConfidenceWeights {
  const clamped: ConfidenceWeights = {
    sourceStability: clampDelta(raw.sourceStability, DEFAULT_WEIGHTS.sourceStability),
    recentSuccessRate: clampDelta(raw.recentSuccessRate, DEFAULT_WEIGHTS.recentSuccessRate),
    topicFamiliarity: clampDelta(raw.topicFamiliarity, DEFAULT_WEIGHTS.topicFamiliarity),
    contentDensity: clampDelta(raw.contentDensity, DEFAULT_WEIGHTS.contentDensity),
    uniqueness: clampDelta(raw.uniqueness, DEFAULT_WEIGHTS.uniqueness),
  };

  const total = Object.values(clamped).reduce((s, v) => s + v, 0);
  if (total === 0) return { ...DEFAULT_WEIGHTS };

  return {
    sourceStability: clamped.sourceStability / total,
    recentSuccessRate: clamped.recentSuccessRate / total,
    topicFamiliarity: clamped.topicFamiliarity / total,
    contentDensity: clamped.contentDensity / total,
    uniqueness: clamped.uniqueness / total,
  };
}

function clampDelta(value: number, base: number): number {
  return Math.max(base - MAX_DELTA, Math.min(base + MAX_DELTA, value));
}

/**
 * Insert a new weight row and deactivate previous ones.
 */
export async function updateWeights(
  weights: ConfidenceWeights,
  reason: string,
): Promise<void> {
  const normalized = normalizeWeights(weights);

  // Deactivate existing
  await supabase
    .from('autoblog_confidence_weights' as any)
    .update({ is_active: false })
    .eq('is_active', true);

  // Insert new
  await supabase
    .from('autoblog_confidence_weights' as any)
    .insert({
      weights: normalized,
      is_active: true,
      reason,
    });

  console.log('[AutoBlog ConfidenceGov] Updated weights:', normalized, 'reason:', reason);
}

export { DEFAULT_WEIGHTS };
