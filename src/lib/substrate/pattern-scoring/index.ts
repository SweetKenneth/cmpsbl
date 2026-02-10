/**
 * Pattern Effectiveness Scoring v1.0.0
 * Tracks which transferred brain patterns actually improve module performance
 * Closed-loop ROI measurement for knowledge transfer
 */

import { supabase } from '@/integrations/supabase/client';

export interface PatternScore {
  patternId: string;
  module: string;
  content: string;
  timesApplied: number;
  positiveOutcomes: number;
  negativeOutcomes: number;
  effectivenessScore: number; // 0-1
  roi: number; // positive = net beneficial
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Record a pattern application outcome
 */
export async function recordPatternOutcome(
  patternId: string,
  module: string,
  wasEffective: boolean,
  context?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('brain_events').insert({
      module,
      event_type: 'pattern_outcome',
      data: {
        pattern_id: patternId,
        effective: wasEffective,
        context,
        recorded_at: new Date().toISOString(),
      } as any,
      outcome: wasEffective ? 'success' : 'failure',
    });
  } catch (err) {
    console.error('[Pattern-Scoring] Failed to record outcome:', err);
  }
}

/**
 * Calculate effectiveness scores for all patterns in a module
 */
export async function getPatternScores(module?: string): Promise<PatternScore[]> {
  try {
    let query = supabase
      .from('brain_events')
      .select('*')
      .eq('event_type', 'pattern_outcome')
      .order('created_at', { ascending: false })
      .limit(500);
    
    if (module) {
      query = query.eq('module', module);
    }
    
    const { data: events } = await query;
    if (!events?.length) return [];
    
    // Group by pattern_id
    const grouped: Record<string, { module: string; positive: number; negative: number; total: number; recent: boolean[] }> = {};
    
    for (const event of events) {
      const d = event.data as any;
      const pid = d?.pattern_id;
      if (!pid) continue;
      
      if (!grouped[pid]) {
        grouped[pid] = { module: event.module, positive: 0, negative: 0, total: 0, recent: [] };
      }
      
      grouped[pid].total++;
      if (d.effective) {
        grouped[pid].positive++;
      } else {
        grouped[pid].negative++;
      }
      grouped[pid].recent.push(d.effective);
    }
    
    // Calculate scores
    return Object.entries(grouped).map(([patternId, stats]) => {
      const effectivenessScore = stats.total > 0 ? stats.positive / stats.total : 0;
      const roi = stats.positive - stats.negative;
      
      // Trend from last 5 outcomes
      const last5 = stats.recent.slice(0, 5);
      const prev5 = stats.recent.slice(5, 10);
      const recentRate = last5.filter(Boolean).length / Math.max(last5.length, 1);
      const prevRate = prev5.length > 0 ? prev5.filter(Boolean).length / prev5.length : recentRate;
      
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentRate > prevRate + 0.15) trend = 'improving';
      else if (recentRate < prevRate - 0.15) trend = 'declining';
      
      return {
        patternId,
        module: stats.module,
        content: '',
        timesApplied: stats.total,
        positiveOutcomes: stats.positive,
        negativeOutcomes: stats.negative,
        effectivenessScore,
        roi,
        trend,
      };
    }).sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  } catch (err) {
    console.error('[Pattern-Scoring] Error:', err);
    return [];
  }
}

/**
 * Get top-performing patterns for a module
 */
export async function getTopPatterns(module: string, limit = 5): Promise<PatternScore[]> {
  const all = await getPatternScores(module);
  return all.filter(p => p.timesApplied >= 2).slice(0, limit);
}

/**
 * Get underperforming patterns that should be pruned
 */
export async function getUnderperformingPatterns(threshold = 0.3): Promise<PatternScore[]> {
  const all = await getPatternScores();
  return all.filter(p => p.timesApplied >= 3 && p.effectivenessScore < threshold);
}
