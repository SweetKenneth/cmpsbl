/**
 * CMPSBL® DEFENSE Learning Module
 * Integrates defense data with Nexus Brain for adaptive improvement
 */

import { supabase } from '@/integrations/supabase/client';

export interface LearningInsights {
  attack_patterns: string[];
  ip_clusters: string[];
  false_positive_indicators: string[];
  recommended_thresholds: Record<string, number>;
  emerging_threats: string[];
}

/**
 * Generate learning summary from defense events
 */
export async function generateLearningSummary(
  periodStart: Date,
  periodEnd: Date
): Promise<LearningInsights | null> {
  try {
    // Fetch only needed columns instead of *
    const { data: events } = await supabase
      .from('defense_events')
      .select('ip, action')
      .gte('detected_at', periodStart.toISOString())
      .lte('detected_at', periodEnd.toISOString());

    if (!events || events.length === 0) return null;

    // Basic pattern analysis (no AI for now)
    const ipCounts: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};
    
    events.forEach(e => {
      ipCounts[e.ip] = (ipCounts[e.ip] || 0) + 1;
      actionCounts[e.action] = (actionCounts[e.action] || 0) + 1;
    });
    
    const insights: LearningInsights = {
      attack_patterns: Object.entries(actionCounts).map(([action, count]) => `${action}: ${count}`),
      ip_clusters: Object.entries(ipCounts).filter(([_, count]) => count > 5).map(([ip]) => ip),
      false_positive_indicators: [],
      recommended_thresholds: {},
      emerging_threats: [],
    };

    // Log to brain_events
    await supabase.from('brain_events').insert([{
      event_type: 'defense_learning',
      module: 'defense',
      outcome: 'success',
      data: {
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        events_analyzed: events.length,
        insights: insights as any
      } as any
    }]);

    return insights;
  } catch (error) {
    console.error('Failed to generate learning summary:', error);
    return null;
  }
}

/**
 * Sync defense data with Brain
 */
export async function syncWithBrain(): Promise<boolean> {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const insights = await generateLearningSummary(dayAgo, now);

    return insights !== null;
  } catch (error) {
    console.error('Brain sync failed:', error);
    return false;
  }
}
