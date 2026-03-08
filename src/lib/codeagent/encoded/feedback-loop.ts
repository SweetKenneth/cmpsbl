/**
 * Encoded Feedback Loop
 * 
 * Tracks pattern outcomes, records guard rejections as learning events,
 * and implements graduated autonomy based on mastery scores.
 * 
 * This closes the loop: ENCODE writes code → Guard validates → Outcome feeds back → Patterns strengthen or weaken
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PatternOutcome {
  pattern_id: string;
  pattern_type: string;
  outcome: 'success' | 'blocked' | 'error' | 'partial';
  guard_result?: {
    changeClass: string;
    risk: string;
    reasons: string[];
    warnings: string[];
  };
  mastery_category?: string;
  execution_time_ms?: number;
  timestamp: string;
}

export interface MasteryScore {
  category: string;
  score: number; // 0-100
  total_attempts: number;
  successful_attempts: number;
  last_updated: string;
}

export interface GraduatedThresholds {
  destructiveMaxRemovedLines: number;
  destructiveMaxChangedPercent: number;
  canAutoApproveLocalized: boolean;
  canAutoApproveAdditive: boolean;
  masteryLevel: 'novice' | 'intermediate' | 'advanced' | 'expert' | 'master';
}

// ═══════════════════════════════════════════════════════════════
// MASTERY TRACKING
// ═══════════════════════════════════════════════════════════════

const MASTERY_STORE_KEY = 'encoded_mastery_scores';

/** In-memory mastery cache */
let masteryCache: Map<string, MasteryScore> = new Map();

/**
 * Record an execution outcome and update mastery scores
 */
export async function recordOutcome(outcome: PatternOutcome): Promise<void> {
  try {
    // 1. Persist to brain_events for audit trail
    await supabase.from('brain_events').insert({
      module: 'encoded',
      event_type: `pattern_${outcome.outcome}`,
      data: {
        pattern_id: outcome.pattern_id,
        pattern_type: outcome.pattern_type,
        guard_result: outcome.guard_result,
        execution_time_ms: outcome.execution_time_ms,
      },
      outcome: outcome.outcome === 'success' ? 'success' : 'failure',
    });

    // 2. Update mastery score for the category
    const category = outcome.mastery_category || outcome.pattern_type;
    await updateMasteryScore(category, outcome.outcome === 'success');

    // 3. If blocked by guard, create a learning event from the rejection
    if (outcome.outcome === 'blocked' && outcome.guard_result) {
      await learnFromRejection(outcome);
    }

    // 4. If successful, boost the pattern's confidence in brain memory
    if (outcome.outcome === 'success') {
      await boostPatternConfidence(outcome.pattern_id);
    }
  } catch (err) {
    console.error('[Encoded:FeedbackLoop] Failed to record outcome:', err);
  }
}

/**
 * Update mastery score for a category
 */
async function updateMasteryScore(category: string, success: boolean): Promise<void> {
  let score = masteryCache.get(category) || {
    category,
    score: 50, // Start at baseline
    total_attempts: 0,
    successful_attempts: 0,
    last_updated: new Date().toISOString(),
  };

  score.total_attempts++;
  if (success) score.successful_attempts++;

  // ELO-inspired score update
  const expected = score.score / 100;
  const actual = success ? 1 : 0;
  const k = Math.max(10, 40 - score.total_attempts); // K-factor decreases with experience
  score.score = Math.max(0, Math.min(100, score.score + k * (actual - expected)));
  score.last_updated = new Date().toISOString();

  masteryCache.set(category, score);

  // Persist every 5 attempts
  if (score.total_attempts % 5 === 0) {
    await persistMasteryScores();
  }
}

/**
 * Get current mastery scores
 */
export function getMasteryScores(): MasteryScore[] {
  return Array.from(masteryCache.values());
}

/**
 * Get overall mastery level (0-100)
 */
export function getOverallMastery(): number {
  const scores = getMasteryScores();
  if (scores.length === 0) return 50;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}

/**
 * Persist mastery scores to database
 */
async function persistMasteryScores(): Promise<void> {
  const scores = Object.fromEntries(masteryCache.entries());
  const content = `[ENCODED_MASTERY] ${JSON.stringify(scores)}`;
  
  // Check if we already have a mastery record to avoid duplicates
  const { data: existing } = await supabase
    .from('brain_memories')
    .select('id')
    .eq('source', 'encoded_feedback_loop')
    .eq('memory_type', 'state')
    .limit(1);

  if (existing?.[0]) {
    // Update existing record
    await supabase.from('brain_memories').update({
      content,
      confidence: 1.0,
      metadata: {
        type: MASTERY_STORE_KEY,
        updated_at: new Date().toISOString(),
        overall_mastery: getOverallMastery(),
      },
    }).eq('id', existing[0].id);
  } else {
    // Create new record
    await supabase.from('brain_memories').insert({
      content,
      memory_type: 'state',
      source: 'encoded_feedback_loop',
      confidence: 1.0,
      metadata: {
        type: MASTERY_STORE_KEY,
        updated_at: new Date().toISOString(),
        overall_mastery: getOverallMastery(),
      },
    });
  }
}

/**
 * Load mastery scores from database on init
 */
export async function loadMasteryScores(): Promise<void> {
  try {
    const { data } = await supabase
      .from('brain_memories')
      .select('content')
      .eq('source', 'encoded_feedback_loop')
      .eq('memory_type', 'state')
      .order('created_at', { ascending: false })
      .limit(1);

    if (data?.[0]?.content) {
      const match = data[0].content.match(/\[ENCODED_MASTERY\]\s*(.+)/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        for (const [key, value] of Object.entries(parsed)) {
          masteryCache.set(key, value as MasteryScore);
        }
      }
    }
  } catch {
    // Start fresh
  }
}

// ═══════════════════════════════════════════════════════════════
// REJECTION LEARNING
// ═══════════════════════════════════════════════════════════════

/**
 * Learn from a guard rejection — turn the failure into training data
 */
async function learnFromRejection(outcome: PatternOutcome): Promise<void> {
  if (!outcome.guard_result) return;

  const reasons = outcome.guard_result.reasons;
  const learningContent = [
    `[ENCODED_REJECTION_LEARNING]`,
    `Pattern: ${outcome.pattern_type}`,
    `Blocked because: ${reasons.join('; ')}`,
    `Change class: ${outcome.guard_result.changeClass}`,
    `Risk: ${outcome.guard_result.risk}`,
    `Lesson: Avoid ${reasons.map(r => extractLesson(r)).join('. ')}`,
  ].join('\n');

  // Store as a high-priority learning memory
  await supabase.from('brain_memory_hot').insert({
    content: learningContent,
    category: 'encoded_rejection_learning',
    priority: 90, // High priority — learning from mistakes
    access_count: 0,
    metadata: {
      pattern_id: outcome.pattern_id,
      reasons,
      learned_at: new Date().toISOString(),
    },
  });

  // Also store in long-term memory
  await supabase.from('brain_memories').insert({
    content: learningContent,
    memory_type: 'learned',
    source: 'encoded_rejection',
    confidence: 0.9,
    metadata: {
      pattern_type: outcome.pattern_type,
      guard_reasons: reasons,
    },
  });
}

/**
 * Extract a concise lesson from a guard rejection reason
 */
function extractLesson(reason: string): string {
  if (reason.includes('Anchor violation')) return 'modifying structural anchors (exports, handlers, entrypoints)';
  if (reason.includes('Narrative code')) return 'including personality/narrative language in code';
  if (reason.includes('Protected file')) return 'modifying protected configuration files';
  if (reason.includes('Destructive')) return 'large-scale removals without approval';
  return `the pattern that caused: ${reason.slice(0, 80)}`;
}

/**
 * Boost a successful pattern's confidence in brain memory
 */
async function boostPatternConfidence(patternId: string): Promise<void> {
  // Find and boost in brain_memory_hot
  const { data } = await supabase
    .from('brain_memory_hot')
    .select('id, access_count, priority')
    .or(`metadata->>pattern_id.eq.${patternId},content.ilike.%${patternId.slice(0, 20)}%`)
    .limit(1);

  if (data?.[0]) {
    await supabase.from('brain_memory_hot').update({
      access_count: (data[0].access_count || 0) + 1,
      priority: Math.min(100, (data[0].priority || 50) + 2),
      last_accessed_at: new Date().toISOString(),
    }).eq('id', data[0].id);
  }
}

// ═══════════════════════════════════════════════════════════════
// GRADUATED AUTONOMY
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate dynamic guard thresholds based on mastery
 * Higher mastery = more relaxed thresholds (earned trust)
 */
export function getGraduatedThresholds(): GraduatedThresholds {
  const mastery = getOverallMastery();
  
  // Mastery levels
  let masteryLevel: GraduatedThresholds['masteryLevel'];
  if (mastery < 30) masteryLevel = 'novice';
  else if (mastery < 50) masteryLevel = 'intermediate';
  else if (mastery < 70) masteryLevel = 'advanced';
  else if (mastery < 90) masteryLevel = 'expert';
  else masteryLevel = 'master';

  // Graduated thresholds — higher mastery = more freedom
  const thresholds: Record<GraduatedThresholds['masteryLevel'], Omit<GraduatedThresholds, 'masteryLevel'>> = {
    novice: {
      destructiveMaxRemovedLines: 5,
      destructiveMaxChangedPercent: 0.10,
      canAutoApproveLocalized: false,
      canAutoApproveAdditive: true,
    },
    intermediate: {
      destructiveMaxRemovedLines: 8,
      destructiveMaxChangedPercent: 0.15,
      canAutoApproveLocalized: false,
      canAutoApproveAdditive: true,
    },
    advanced: {
      destructiveMaxRemovedLines: 15,
      destructiveMaxChangedPercent: 0.20,
      canAutoApproveLocalized: true,
      canAutoApproveAdditive: true,
    },
    expert: {
      destructiveMaxRemovedLines: 25,
      destructiveMaxChangedPercent: 0.30,
      canAutoApproveLocalized: true,
      canAutoApproveAdditive: true,
    },
    master: {
      destructiveMaxRemovedLines: 40,
      destructiveMaxChangedPercent: 0.40,
      canAutoApproveLocalized: true,
      canAutoApproveAdditive: true,
    },
  };

  return {
    ...thresholds[masteryLevel],
    masteryLevel,
  };
}

/**
 * Get mastery summary for display
 */
export function getMasterySummary(): string {
  const scores = getMasteryScores();
  const overall = getOverallMastery();
  const thresholds = getGraduatedThresholds();
  
  const lines = [
    `🎯 Overall Mastery: ${overall.toFixed(1)}/100 (${thresholds.masteryLevel})`,
    `📊 Categories: ${scores.length}`,
    `🔓 Max Removable Lines: ${thresholds.destructiveMaxRemovedLines}`,
    `🔓 Max Change %: ${(thresholds.destructiveMaxChangedPercent * 100).toFixed(0)}%`,
    `🔓 Auto-approve Localized: ${thresholds.canAutoApproveLocalized ? '✅' : '❌'}`,
    '',
    ...scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => `  ${s.category}: ${s.score.toFixed(0)}/100 (${s.successful_attempts}/${s.total_attempts})`),
  ];

  return lines.join('\n');
}
