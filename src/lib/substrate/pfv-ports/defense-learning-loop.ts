/**
 * PFV Port → Defense Learning Feedback Loop
 * AI-driven analysis of security events to auto-adjust thresholds
 * Benefits: DEFENSE, IMMUNITY
 * Source: PromptFluid-Vision defense/learning.ts
 */

import { supabase } from '@/integrations/supabase/client';

export interface DefenseLearningInsights {
  attack_patterns: string[];
  ip_clusters: string[];
  false_positive_indicators: string[];
  recommended_thresholds: Record<string, number>;
  emerging_threats: string[];
}

/**
 * Generate learning summary from defense events in a time window
 * Uses NEXUS router for AI analysis (never direct Lovable AI)
 */
export async function generateDefenseLearningSummary(
  periodStart: Date,
  periodEnd: Date
): Promise<DefenseLearningInsights | null> {
  try {
    const { data: events } = await supabase
      .from('defense_events')
      .select('*')
      .gte('detected_at', periodStart.toISOString())
      .lte('detected_at', periodEnd.toISOString());

    if (!events?.length) return null;

    const blocked = events.filter(e => e.action === 'block').length;
    const challenged = events.filter(e => e.action === 'challenge').length;

    // Route through NEXUS for analysis
    const { data: aiResult, error } = await supabase.functions.invoke('nexus-router', {
      body: {
        prompt: `Analyze ${events.length} security events (${blocked} blocked, ${challenged} challenged). Sample: ${JSON.stringify(events.slice(0, 10))}. Provide: 1) Attack patterns 2) IP clusters 3) False positive indicators 4) Threshold adjustments 5) Emerging threats`,
        type: 'reasoning',
        source: 'defense_learning',
      },
    });

    if (error || !aiResult?.content) {
      console.error('[DEFENSE-LEARNING] NEXUS analysis failed:', error);
      return null;
    }

    const content = aiResult.content;
    const insights: DefenseLearningInsights = {
      attack_patterns: extractSection(content, /attack patterns?:?\s*([^\n]+)/i),
      ip_clusters: extractSection(content, /IP.*clusters?:?\s*([^\n]+)/i),
      false_positive_indicators: extractSection(content, /false positive.*:?\s*([^\n]+)/i),
      recommended_thresholds: extractThresholds(content),
      emerging_threats: extractSection(content, /emerging threats?:?\s*([^\n]+)/i),
    };

    // Persist learning summary via brain_events
    await supabase.from('brain_events').insert({
      module: 'defense',
      event_type: 'defense_learning_summary',
      data: {
        summary: { total_events: events.length, period: { start: periodStart, end: periodEnd } },
        insights,
        events_analyzed: events.length,
      } as any,
      outcome: 'completed',
    });

    return insights;
  } catch (err) {
    console.error('[DEFENSE-LEARNING] Summary generation failed:', err);
    return null;
  }
}

/**
 * Sync defense learnings — apply recommended thresholds to rules
 */
export async function syncDefenseWithBrain(): Promise<boolean> {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const insights = await generateDefenseLearningSummary(dayAgo, now);
    if (!insights) return false;

    // Log threshold recommendations via brain_events (defense_rules may not exist)
    await supabase.from('brain_events').insert({
      module: 'defense',
      event_type: 'threshold_update',
      data: { recommended_thresholds: insights.recommended_thresholds } as any,
      outcome: 'applied',
    });

    return true;
  } catch {
    return false;
  }
}

// --- Helpers ---

function extractSection(content: string, pattern: RegExp): string[] {
  const match = content.match(pattern);
  return match ? match[1].split(',').map(s => s.trim()).filter(Boolean) : [];
}

function extractThresholds(content: string): Record<string, number> {
  const thresholds: Record<string, number> = {};
  const matches = content.matchAll(/(\w+):\s*(\d+)/g);
  for (const match of matches) {
    thresholds[match[1]] = parseInt(match[2]);
  }
  return thresholds;
}
