/**
 * PFV Port → Defense Learning Feedback Loop (Hardened)
 * AI-driven analysis of security events to auto-adjust thresholds
 * Benefits: DEFENSE, IMMUNITY
 * Source: PromptFluid-Vision defense/learning.ts
 *
 * HARDENING (anti-jailbreak):
 *  - Hard min/max clamps per threshold rule
 *  - Max delta-per-day limit (prevents sudden swings)
 *  - 2-consecutive-window consensus before promotion
 *  - "Proposed" stage → policy engine promotion
 */

import { supabase } from '@/integrations/supabase/client';
import { clampNumber } from '@/lib/system/hardening';

// ── Threshold safety bounds ──────────────────────────────────────────

/** Hard min/max for every known threshold key */
const THRESHOLD_BOUNDS: Record<string, { min: number; max: number }> = {
  rate_limit:       { min: 5,    max: 1000 },
  risk_score:       { min: 0,    max: 100 },
  block_threshold:  { min: 50,   max: 95 },
  challenge_threshold: { min: 20, max: 80 },
  anomaly_z_score:  { min: 1,    max: 10 },
  entropy_threshold:{ min: 1,    max: 8 },
  velocity_max:     { min: 1,    max: 500 },
};

/** Maximum absolute change any threshold can move in a single day */
const MAX_DELTA_PER_DAY = 15;

/** Number of consecutive analysis windows that must agree before promotion */
const CONSENSUS_WINDOWS_REQUIRED = 2;

// In-memory consensus tracker (resets on cold start — intentional)
const proposalHistory: Map<string, { value: number; window: number }[]> = new Map();
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

/**
 * Generate learning summary from defense events in a time window
 * Uses NEXUS router for AI analysis (never direct external gateway)
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
    const rawThresholds = extractThresholds(content);

    // ── Stage 1: Clamp to hard bounds ──
    const proposed = clampThresholds(rawThresholds);

    // ── Stage 2: Enforce max-delta-per-day ──
    const deltaLimited = applyDeltaLimits(proposed);

    // ── Stage 3: Consensus check (2 consecutive windows must agree) ──
    currentWindow++;
    const promoted = checkConsensus(deltaLimited);

    const insights: DefenseLearningInsights = {
      attack_patterns: extractSection(content, /attack patterns?:?\s*([^\n]+)/i),
      ip_clusters: extractSection(content, /IP.*clusters?:?\s*([^\n]+)/i),
      false_positive_indicators: extractSection(content, /false positive.*:?\s*([^\n]+)/i),
      recommended_thresholds: rawThresholds,
      proposed_thresholds: deltaLimited,
      promoted_thresholds: promoted,
      emerging_threats: extractSection(content, /emerging threats?:?\s*([^\n]+)/i),
    };

    // Persist as proposed (NOT applied) — policy engine promotes
    await supabase.from('brain_events').insert({
      module: 'defense',
      event_type: 'defense_learning_summary',
      data: {
        summary: { total_events: events.length, period: { start: periodStart, end: periodEnd } },
        insights,
        events_analyzed: events.length,
        hardening: {
          raw_thresholds: rawThresholds,
          clamped: proposed,
          delta_limited: deltaLimited,
          promoted,
          consensus_window: currentWindow,
        },
      } as any,
      outcome: Object.keys(promoted).length > 0 ? 'promoted' : 'proposed',
    });

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
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const insights = await generateDefenseLearningSummary(dayAgo, now);
    if (!insights) return false;

    // Only log promoted thresholds as "applied"
    const hasPromotions = Object.keys(insights.promoted_thresholds).length > 0;

    await supabase.from('brain_events').insert({
      module: 'defense',
      event_type: 'threshold_update',
      data: {
        proposed: insights.proposed_thresholds,
        promoted: insights.promoted_thresholds,
        consensus_window: currentWindow,
      } as any,
      outcome: hasPromotions ? 'applied' : 'pending_consensus',
    });

    return hasPromotions;
  } catch {
    return false;
  }
}

// ── Hardening helpers ────────────────────────────────────────────────

/** Clamp every threshold to its hard bounds */
function clampThresholds(raw: Record<string, number>): Record<string, number> {
  const clamped: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const bounds = THRESHOLD_BOUNDS[key];
    if (bounds) {
      clamped[key] = clampNumber(value, bounds.min, bounds.max, value);
    } else {
      // Unknown keys from AI output are dropped entirely (anti-injection)
      console.warn(`[DEFENSE-LEARNING] Dropping unknown threshold key: ${key}`);
    }
  }
  return clamped;
}

/** Limit how much any threshold can change from its last promoted value */
function applyDeltaLimits(proposed: Record<string, number>): Record<string, number> {
  const limited: Record<string, number> = {};
  for (const [key, value] of Object.entries(proposed)) {
    const history = proposalHistory.get(key);
    const lastPromoted = history?.find(h => h.window < currentWindow)?.value;

    if (lastPromoted !== undefined) {
      const delta = value - lastPromoted;
      const clampedDelta = Math.max(-MAX_DELTA_PER_DAY, Math.min(MAX_DELTA_PER_DAY, delta));
      limited[key] = lastPromoted + clampedDelta;
    } else {
      limited[key] = value;
    }
  }
  return limited;
}

/** Require N consecutive windows to agree (within ±2) before promoting */
function checkConsensus(proposed: Record<string, number>): Record<string, number> {
  const promoted: Record<string, number> = {};

  for (const [key, value] of Object.entries(proposed)) {
    if (!proposalHistory.has(key)) proposalHistory.set(key, []);
    const history = proposalHistory.get(key)!;
    history.push({ value, window: currentWindow });

    // Keep only recent windows
    while (history.length > CONSENSUS_WINDOWS_REQUIRED + 2) history.shift();

    // Check if last N windows agree (within tolerance of ±2)
    const recent = history.slice(-CONSENSUS_WINDOWS_REQUIRED);
    if (recent.length >= CONSENSUS_WINDOWS_REQUIRED) {
      const allAgree = recent.every(h => Math.abs(h.value - value) <= 2);
      if (allAgree) {
        promoted[key] = value;
      }
    }
  }

  return promoted;
}

// ── Parsing helpers ──────────────────────────────────────────────────

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
