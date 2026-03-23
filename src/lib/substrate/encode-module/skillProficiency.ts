/**
 * ENCODE Skill Proficiency Tracker — v1.0.0
 * Tracks success/failure rates per skill across the 71-skill registry.
 * Dynamically adjusts confidence weights and surfaces skill gaps.
 * 
 * Feeds BRAIN with proficiency data for learning optimization.
 */

// ═══ Types ════════════════════════════════════════════════════════

export interface SkillProfile {
  skillId: string;
  category: string;
  totalAttempts: number;
  successes: number;
  failures: number;
  successRate: number;
  confidenceWeight: number; // 0-1, dynamically adjusted
  avgQualityScore: number;
  streak: number; // positive = success streak, negative = failure streak
  lastAttemptAt: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SkillGap {
  skillId: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  successRate: number;
  attempts: number;
  recommendation: string;
}

export interface ProficiencySummary {
  totalSkills: number;
  activeSkills: number; // skills with attempts
  avgProficiency: number;
  topSkills: SkillProfile[];
  weakestSkills: SkillProfile[];
  gaps: SkillGap[];
  overallTrend: 'improving' | 'stable' | 'declining';
}

// ═══ State ═════════════════════════════════════════════════════════

const profiles = new Map<string, SkillProfile>();

// EMA decay factor for confidence weight adjustment
const EMA_ALPHA = 0.3;

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Record a skill execution outcome
 */
export function recordSkillOutcome(
  skillId: string,
  category: string,
  success: boolean,
  qualityScore?: number,
): SkillProfile {
  let profile = profiles.get(skillId);

  if (!profile) {
    profile = {
      skillId,
      category,
      totalAttempts: 0,
      successes: 0,
      failures: 0,
      successRate: 0,
      confidenceWeight: 0.5, // start neutral
      avgQualityScore: 70,
      streak: 0,
      lastAttemptAt: '',
      trend: 'stable',
    };
    profiles.set(skillId, profile);
  }

  // Update counts
  profile.totalAttempts++;
  if (success) {
    profile.successes++;
    profile.streak = profile.streak >= 0 ? profile.streak + 1 : 1;
  } else {
    profile.failures++;
    profile.streak = profile.streak <= 0 ? profile.streak - 1 : -1;
  }

  // Recalculate success rate
  profile.successRate = profile.successes / profile.totalAttempts;

  // EMA confidence adjustment
  const signal = success ? 1 : 0;
  profile.confidenceWeight = profile.confidenceWeight * (1 - EMA_ALPHA) + signal * EMA_ALPHA;

  // Quality score EMA
  if (qualityScore !== undefined) {
    profile.avgQualityScore = profile.avgQualityScore * (1 - EMA_ALPHA) + qualityScore * EMA_ALPHA;
  }

  // Trend detection (compare last 5 vs previous 5)
  profile.trend = detectTrend(profile);

  profile.lastAttemptAt = new Date().toISOString();
  return profile;
}

/**
 * Get proficiency for a specific skill
 */
export function getSkillProfile(skillId: string): SkillProfile | undefined {
  return profiles.get(skillId);
}

/**
 * Get all skill profiles
 */
export function getAllProfiles(): SkillProfile[] {
  return [...profiles.values()].sort((a, b) => b.confidenceWeight - a.confidenceWeight);
}

/**
 * Get skill profiles by category
 */
export function getProfilesByCategory(category: string): SkillProfile[] {
  return [...profiles.values()]
    .filter(p => p.category === category)
    .sort((a, b) => b.successRate - a.successRate);
}

/**
 * Identify skill gaps
 */
export function identifyGaps(minAttempts: number = 3): SkillGap[] {
  const gaps: SkillGap[] = [];

  for (const profile of profiles.values()) {
    if (profile.totalAttempts < minAttempts) continue;

    if (profile.successRate < 0.6) {
      const severity: SkillGap['severity'] =
        profile.successRate < 0.2 ? 'critical' :
        profile.successRate < 0.4 ? 'high' :
        profile.successRate < 0.5 ? 'medium' : 'low';

      gaps.push({
        skillId: profile.skillId,
        category: profile.category,
        severity,
        successRate: Math.round(profile.successRate * 100),
        attempts: profile.totalAttempts,
        recommendation: generateRecommendation(profile),
      });
    }
  }

  return gaps.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Get full proficiency summary
 */
export function getProficiencySummary(): ProficiencySummary {
  const all = [...profiles.values()];
  const active = all.filter(p => p.totalAttempts > 0);

  const avgProficiency = active.length > 0
    ? active.reduce((s, p) => s + p.confidenceWeight, 0) / active.length
    : 0;

  const sorted = [...active].sort((a, b) => b.confidenceWeight - a.confidenceWeight);

  // Overall trend
  const improving = active.filter(p => p.trend === 'improving').length;
  const declining = active.filter(p => p.trend === 'declining').length;
  const overallTrend: ProficiencySummary['overallTrend'] =
    improving > declining * 1.5 ? 'improving' :
    declining > improving * 1.5 ? 'declining' : 'stable';

  return {
    totalSkills: profiles.size,
    activeSkills: active.length,
    avgProficiency: Math.round(avgProficiency * 100) / 100,
    topSkills: sorted.slice(0, 5),
    weakestSkills: sorted.slice(-5).reverse(),
    gaps: identifyGaps(),
    overallTrend,
  };
}

/**
 * Get confidence weight for task routing decisions
 */
export function getConfidenceWeight(skillId: string): number {
  return profiles.get(skillId)?.confidenceWeight ?? 0.5;
}

/**
 * Reset a skill's profile (for recalibration)
 */
export function resetProfile(skillId: string): boolean {
  return profiles.delete(skillId);
}

// ═══ Helpers ══════════════════════════════════════════════════════

function detectTrend(profile: SkillProfile): 'improving' | 'stable' | 'declining' {
  if (profile.totalAttempts < 5) return 'stable';
  if (profile.streak >= 3) return 'improving';
  if (profile.streak <= -3) return 'declining';
  return 'stable';
}

function generateRecommendation(profile: SkillProfile): string {
  if (profile.successRate < 0.2) {
    return `Critical gap in ${profile.skillId} — consider SHADOW practice drills or template refinement`;
  }
  if (profile.successRate < 0.4) {
    return `Weak proficiency in ${profile.skillId} — increase test coverage and use conservative strategy`;
  }
  if (profile.trend === 'declining') {
    return `${profile.skillId} is declining — review recent failures for pattern regression`;
  }
  return `${profile.skillId} needs improvement — monitor next ${5 - profile.totalAttempts} attempts`;
}
