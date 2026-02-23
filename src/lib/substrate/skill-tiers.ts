/**
 * Skill Tier System — Novice to Mastery
 * Replaces raw 0-100% with meaningful progression tiers
 * that describe what capabilities unlock at each level.
 */

export type SkillTier = 'novice' | 'apprentice' | 'journeyman' | 'specialist' | 'expert' | 'master';

export interface SkillTierInfo {
  tier: SkillTier;
  label: string;
  emoji: string;
  color: string;           // tailwind text color class token
  bgColor: string;         // tailwind bg color class token  
  borderColor: string;     // tailwind border color class token
  minScore: number;        // 0-1 scale
  description: string;     // what this tier means in practice
  capabilities: string[];  // what they can do at this level
}

export const SKILL_TIERS: SkillTierInfo[] = [
  {
    tier: 'novice',
    label: 'Novice',
    emoji: '🌱',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
    borderColor: 'border-muted-foreground/20',
    minScore: 0,
    description: 'Recognizes basic patterns but frequently fails on edge cases',
    capabilities: [
      'Handles well-formed standard inputs',
      'Fails on missing fields or unexpected types',
      'No repair capability — relies on safe-fail',
    ],
  },
  {
    tier: 'apprentice',
    label: 'Apprentice',
    emoji: '📘',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    minScore: 0.2,
    description: 'Handles common cases; beginning to learn from failures',
    capabilities: [
      'Processes standard inputs reliably',
      'Recognizes common failure signatures',
      'Beginning to apply basic repair rules',
    ],
  },
  {
    tier: 'journeyman',
    label: 'Journeyman',
    emoji: '⚒️',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    minScore: 0.4,
    description: 'Reliable on standard work; handles moderate complexity',
    capabilities: [
      'Handles most input variations correctly',
      'Applies deterministic repair patches',
      'Contributes to shared rule registry',
    ],
  },
  {
    tier: 'specialist',
    label: 'Specialist',
    emoji: '🎯',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    minScore: 0.6,
    description: 'Deep domain knowledge; rarely fails in their specialty',
    capabilities: [
      'Handles complex edge cases in domain',
      'Self-repairs most failures without escalation',
      'Rules propagated to other executors',
    ],
  },
  {
    tier: 'expert',
    label: 'Expert',
    emoji: '⭐',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    minScore: 0.8,
    description: 'High autonomy; generates novel repair strategies',
    capabilities: [
      'Near-zero failure rate in domain tasks',
      'Generates novel repair strategies for other executors',
      'Can handle cross-domain tasks with good accuracy',
    ],
  },
  {
    tier: 'master',
    label: 'Master',
    emoji: '👑',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    minScore: 0.95,
    description: 'Autonomous domain authority; zero ENCODE escalations',
    capabilities: [
      'Zero ENCODE escalation rate in domain',
      'Generates universally adopted repair rules',
      'Trusted for unsupervised production mutations',
    ],
  },
];

/**
 * Get the skill tier for a given proficiency score (0-1).
 */
export function getSkillTier(score: number): SkillTierInfo {
  for (let i = SKILL_TIERS.length - 1; i >= 0; i--) {
    if (score >= SKILL_TIERS[i].minScore) return SKILL_TIERS[i];
  }
  return SKILL_TIERS[0];
}

/**
 * Get progress within the current tier (0-100%).
 */
export function getTierProgress(score: number): number {
  const tier = getSkillTier(score);
  const tierIdx = SKILL_TIERS.indexOf(tier);
  const nextTier = SKILL_TIERS[tierIdx + 1];
  if (!nextTier) return 100;
  const range = nextTier.minScore - tier.minScore;
  return Math.min(100, Math.round(((score - tier.minScore) / range) * 100));
}

/**
 * Format a score as a tier badge string.
 */
export function formatTierLabel(score: number): string {
  const tier = getSkillTier(score);
  return `${tier.emoji} ${tier.label}`;
}
