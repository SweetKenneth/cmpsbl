/**
 * PFV Port → Defense Learning Feedback Loop v2.0.0 (Hardened)
 * AI-driven analysis of security events to auto-adjust thresholds
 * Benefits: DEFENSE, IMMUNITY
 *
 * v2 optimizations:
 *  - Select only needed columns from defense_events
 *  - Pre-compute event stats before AI call (reduce prompt size)
 *  - Parallel persist + return
 *  - Bounded proposal history with Map size cap
 *  - Single-pass threshold extraction via compiled regex
 */

import { supabase } from '@/integrations/supabase/client';
import { clampNumber } from '@/lib/system/hardening';

// ── Threshold safety bounds ──────────────────────────────────────────

const THRESHOLD_BOUNDS: Record<string, { min: number; max: number }> = {
  rate_limit:          { min: 5,    max: 1000 },
  risk_score:          { min: 0,    max: 100 },
  block_threshold:     { min: 50,   max: 95 },
  challenge_threshold: { min: 20,   max: 80 },
  anomaly_z_score:     { min: 1,    max: 10 },
  entropy_threshold:   { min: 1,    max: 8 },
  velocity_max:        { min: 1,    max: 500 },
};

// Pre-build Set for O(1) key validation
const VALID_THRESHOLD_KEYS = new Set(Object.keys(THRESHOLD_BOUNDS));

const MAX_DELTA_PER_DAY = 15;
const CONSENSUS_WINDOWS_REQUIRED = 2;
const MAX_PROPOSAL_HISTORY = 10; // cap per key

const proposalHistory = new Map<string, { value: number; window: number }[]>();
let currentWindow = 0;

export interface DefenseLearningInsights {
  attack_patterns: string[];
  ip_clusters: string[];
  false_positive_indicators: string[];
  recommended_thresholds: Record<string, number>;
  proposed_thresholds: Record<string, number>;
  promoted_thresholds: Record<string, number>;
  emerging_threats: string[];
}

// Compiled regex for section extraction
const SECTION_PATTERNS = {
  attack: /attack patterns?:?\s*([^\n]+)/i,
  ip: /IP.*clusters?:?\s*([^\n]+)/i,
  falsePos: /false positive.*:?\s*([^\n]+)/i,
  emerging: /emerging threats?:?\s*([^\n]+)/i,
} as const;

const THRESHOLD_REGEX = /(\w+):\s*(\d+)/g;

/**
 * Generate learning summary from defense events in a time window
 */
export async function generateDefenseLearningSummary(
  periodStart: Date,
  periodEnd: Date,
): Promise<DefenseLearningInsights | null> {
  try {
    // Select only needed columns
    const { data: events } = await supabase
      .from('defense_events')
      .select('action, risk_score, ip, reason, detected_at')
      .gte('detected_at', periodStart.toISOString())
      .lte('detected_at', periodEnd.toISOString())
      .limit(500);

    if (!events?.length) return null;

    // Pre-compute stats to shrink AI prompt
    let blocked = 0, challenged = 0;
    const actionCounts = new Map<string, number>();
    const reasonCounts = new Map<string, number>();

    for (const e of events) {
      if (e.action === 'block') blocked++;
      else if (e.action === 'challenge') challenged++;
      actionCounts.set(e.action, (actionCounts.get(e.action) || 0) + 1);
      if (e.reason) {
        reasonCounts.set(e.reason, (reasonCounts.get(e.reason) || 0) + 1);
      }
    }

    // Compact summary for AI — avoids sending raw events
    const statsSummary = {
      total: events.length,
      blocked,
      challenged,
      actions: Object.fromEntries(actionCounts),
      reasons: Object.fromEntries(reasonCounts),
      sampleEvents: events.slice(0, 5),
    };

    const { data: aiResult, error } = await supabase.functions.invoke('nexus-router', {
      body: {
        prompt: `Analyze ${events.length} security events: ${JSON.stringify(statsSummary)}. Provide: 1) Attack patterns 2) IP clusters 3) False positive indicators 4) Threshold adjustments (key: value format) 5) Emerging threats`,
        type: 'reasoning',
        source: 'defense_learning',
      },
    });

    if (error || !aiResult?.content) {
      console.error('[DEFENSE-LEARNING] NEXUS analysis failed:', error);
      return null;
    }

    const content = aiResult.content;
    const rawThresholds = extractThresholds(content);
    const proposed = clampThresholds(rawThresholds);
    const deltaLimited = applyDeltaLimits(proposed);

    currentWindow++;
    const promoted = checkConsensus(deltaLimited);

    const insights: DefenseLearningInsights = {
      attack_patterns: extractSection(content, SECTION_PATTERNS.attack),
      ip_clusters: extractSection(content, SECTION_PATTERNS.ip),
      false_positive_indicators: extractSection(content, SECTION_PATTERNS.falsePos),
      recommended_thresholds: rawThresholds,
      proposed_thresholds: deltaLimited,
      promoted_thresholds: promoted,
      emerging_threats: extractSection(content, SECTION_PATTERNS.emerging),
    };

    // Non-blocking persistence
    supabase.from('brain_events').insert({
      module: 'defense',
      event_type: 'defense_learning_summary',
      data: {
        summary: { total_events: events.length, period: { start: periodStart, end: periodEnd } },
        insights,
        events_analyzed: events.length,
        hardening: { raw: rawThresholds, clamped: proposed, delta: deltaLimited, promoted, window: currentWindow },
      } as any,
      outcome: Object.keys(promoted).length > 0 ? 'promoted' : 'proposed',
    }).then(null, () => {});

    return insights;
  } catch (err) {
    console.error('[DEFENSE-LEARNING] Summary generation failed:', err);
    return null;
  }
}

/**
 * Sync defense learnings — write proposed thresholds, only promote with consensus
 */
export async function syncDefenseWithBrain(): Promise<boolean> {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 86_400_000);

    const insights = await generateDefenseLearningSummary(dayAgo, now);
    if (!insights) return false;

    const hasPromotions = Object.keys(insights.promoted_thresholds).length > 0;

    // Non-blocking persistence
    supabase.from('brain_events').insert({
      module: 'defense',
      event_type: 'threshold_update',
      data: {
        proposed: insights.proposed_thresholds,
        promoted: insights.promoted_thresholds,
        consensus_window: currentWindow,
      } as any,
      outcome: hasPromotions ? 'applied' : 'pending_consensus',
    }).then(null, () => {});

    return hasPromotions;
  } catch {
    return false;
  }
}

// ── Hardening helpers ────────────────────────────────────────────────

function clampThresholds(raw: Record<string, number>): Record<string, number> {
  const clamped: Record<string, number> = {};
  for (const key in raw) {
    if (!VALID_THRESHOLD_KEYS.has(key)) continue; // Drop unknown keys (anti-injection)
    const bounds = THRESHOLD_BOUNDS[key];
    clamped[key] = clampNumber(raw[key], bounds.min, bounds.max, raw[key]);
  }
  return clamped;
}

function applyDeltaLimits(proposed: Record<string, number>): Record<string, number> {
  const limited: Record<string, number> = {};
  for (const key in proposed) {
    const history = proposalHistory.get(key);
    const lastPromoted = history?.find(h => h.window < currentWindow)?.value;
    if (lastPromoted !== undefined) {
      const delta = Math.max(-MAX_DELTA_PER_DAY, Math.min(MAX_DELTA_PER_DAY, proposed[key] - lastPromoted));
      limited[key] = lastPromoted + delta;
    } else {
      limited[key] = proposed[key];
    }
  }
  return limited;
}

function checkConsensus(proposed: Record<string, number>): Record<string, number> {
  const promoted: Record<string, number> = {};
  for (const key in proposed) {
    const value = proposed[key];
    let history = proposalHistory.get(key);
    if (!history) { history = []; proposalHistory.set(key, history); }
    history.push({ value, window: currentWindow });

    // Cap history size
    if (history.length > MAX_PROPOSAL_HISTORY) history.splice(0, history.length - MAX_PROPOSAL_HISTORY);

    const recent = history.slice(-CONSENSUS_WINDOWS_REQUIRED);
    if (recent.length >= CONSENSUS_WINDOWS_REQUIRED && recent.every(h => Math.abs(h.value - value) <= 2)) {
      promoted[key] = value;
    }
  }
  return promoted;
}

// ── Parsing helpers ──────────────────────────────────────────────────

function extractSection(content: string, pattern: RegExp): string[] {
  const match = content.match(pattern);
  if (!match) return [];
  const items: string[] = [];
  for (const part of match[1].split(',')) {
    const trimmed = part.trim();
    if (trimmed) items.push(trimmed);
  }
  return items;
}

function extractThresholds(content: string): Record<string, number> {
  const thresholds: Record<string, number> = {};
  let m: RegExpExecArray | null;
  THRESHOLD_REGEX.lastIndex = 0;
  while ((m = THRESHOLD_REGEX.exec(content)) !== null) {
    thresholds[m[1]] = parseInt(m[2]);
  }
  return thresholds;
}
