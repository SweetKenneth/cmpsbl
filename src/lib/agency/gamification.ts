/**
 * Gamification System
 * XP, levels, achievements, and agency reputation scores
 */

// ============================================================================
// XP & LEVELS
// ============================================================================
export interface AgentLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  badge: string;
  perks: string[];
}

export const AGENT_LEVELS: AgentLevel[] = [
  { level: 1, title: 'Novice', minXP: 0, maxXP: 100, badge: '🌱', perks: ['Basic tasks'] },
  { level: 2, title: 'Apprentice', minXP: 100, maxXP: 300, badge: '🌿', perks: ['Faster processing'] },
  { level: 3, title: 'Journeyman', minXP: 300, maxXP: 600, badge: '🌲', perks: ['Priority queue'] },
  { level: 4, title: 'Expert', minXP: 600, maxXP: 1000, badge: '⭐', perks: ['Multi-tasking'] },
  { level: 5, title: 'Master', minXP: 1000, maxXP: 1500, badge: '🌟', perks: ['Team coordination'] },
  { level: 6, title: 'Grandmaster', minXP: 1500, maxXP: 2200, badge: '💫', perks: ['Advanced insights'] },
  { level: 7, title: 'Sage', minXP: 2200, maxXP: 3000, badge: '🔮', perks: ['Predictive analysis'] },
  { level: 8, title: 'Virtuoso', minXP: 3000, maxXP: 4000, badge: '👑', perks: ['Dream learning'] },
  { level: 9, title: 'Legend', minXP: 4000, maxXP: 5500, badge: '🏆', perks: ['Cross-domain mastery'] },
  { level: 10, title: 'Transcendent', minXP: 5500, maxXP: Infinity, badge: '✨', perks: ['Ultimate efficiency'] },
];

// ============================================================================
// ACHIEVEMENTS
// ============================================================================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'tasks' | 'speed' | 'quality' | 'streak' | 'collaboration' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: 'count' | 'streak' | 'percentage' | 'time' | 'custom';
    metric: string;
    threshold: number;
  };
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Task completion achievements
  { id: 'first_task', name: 'First Steps', description: 'Complete your first task', icon: '🎯', category: 'tasks', rarity: 'common', requirement: { type: 'count', metric: 'tasks_completed', threshold: 1 }, xpReward: 10 },
  { id: 'ten_tasks', name: 'Getting Warmed Up', description: 'Complete 10 tasks', icon: '🔥', category: 'tasks', rarity: 'common', requirement: { type: 'count', metric: 'tasks_completed', threshold: 10 }, xpReward: 25 },
  { id: 'fifty_tasks', name: 'Workhorse', description: 'Complete 50 tasks', icon: '🐴', category: 'tasks', rarity: 'uncommon', requirement: { type: 'count', metric: 'tasks_completed', threshold: 50 }, xpReward: 100 },
  { id: 'hundred_tasks', name: 'Century Club', description: 'Complete 100 tasks', icon: '💯', category: 'tasks', rarity: 'rare', requirement: { type: 'count', metric: 'tasks_completed', threshold: 100 }, xpReward: 250 },
  { id: 'five_hundred_tasks', name: 'Task Titan', description: 'Complete 500 tasks', icon: '🦾', category: 'tasks', rarity: 'epic', requirement: { type: 'count', metric: 'tasks_completed', threshold: 500 }, xpReward: 500 },
  
  // Streak achievements
  { id: 'streak_3', name: 'On a Roll', description: 'Complete 3 tasks in a row without errors', icon: '🎲', category: 'streak', rarity: 'common', requirement: { type: 'streak', metric: 'success_streak', threshold: 3 }, xpReward: 15 },
  { id: 'streak_7', name: 'Hot Streak', description: 'Complete 7 tasks in a row without errors', icon: '🔥', category: 'streak', rarity: 'uncommon', requirement: { type: 'streak', metric: 'success_streak', threshold: 7 }, xpReward: 50 },
  { id: 'streak_15', name: 'Unstoppable', description: 'Complete 15 tasks in a row without errors', icon: '💪', category: 'streak', rarity: 'rare', requirement: { type: 'streak', metric: 'success_streak', threshold: 15 }, xpReward: 150 },
  { id: 'streak_30', name: 'Perfect Machine', description: 'Complete 30 tasks in a row without errors', icon: '🤖', category: 'streak', rarity: 'epic', requirement: { type: 'streak', metric: 'success_streak', threshold: 30 }, xpReward: 300 },
  
  // Quality achievements
  { id: 'quality_90', name: 'Quality First', description: 'Maintain 90% success rate over 20+ tasks', icon: '✅', category: 'quality', rarity: 'uncommon', requirement: { type: 'percentage', metric: 'success_rate', threshold: 90 }, xpReward: 75 },
  { id: 'quality_95', name: 'Near Perfect', description: 'Maintain 95% success rate over 50+ tasks', icon: '🎖️', category: 'quality', rarity: 'rare', requirement: { type: 'percentage', metric: 'success_rate', threshold: 95 }, xpReward: 200 },
  { id: 'quality_99', name: 'Flawless', description: 'Maintain 99% success rate over 100+ tasks', icon: '💎', category: 'quality', rarity: 'legendary', requirement: { type: 'percentage', metric: 'success_rate', threshold: 99 }, xpReward: 500 },
  
  // Speed achievements
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a task in under 30 seconds', icon: '⚡', category: 'speed', rarity: 'uncommon', requirement: { type: 'time', metric: 'fastest_task_ms', threshold: 30000 }, xpReward: 30 },
  { id: 'lightning', name: 'Lightning Fast', description: 'Complete 10 tasks in under 1 minute each', icon: '🌩️', category: 'speed', rarity: 'rare', requirement: { type: 'count', metric: 'fast_tasks', threshold: 10 }, xpReward: 100 },
  
  // Collaboration achievements
  { id: 'team_player', name: 'Team Player', description: 'Contribute to 5 team tasks', icon: '🤝', category: 'collaboration', rarity: 'common', requirement: { type: 'count', metric: 'team_tasks', threshold: 5 }, xpReward: 40 },
  { id: 'synergy', name: 'Perfect Synergy', description: 'Complete a task with 3+ agents', icon: '🔗', category: 'collaboration', rarity: 'uncommon', requirement: { type: 'count', metric: 'multi_agent_tasks', threshold: 1 }, xpReward: 60 },
  
  // Special achievements
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a task between midnight and 5 AM', icon: '🦉', category: 'special', rarity: 'uncommon', requirement: { type: 'custom', metric: 'night_task', threshold: 1 }, xpReward: 25 },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a task before 6 AM', icon: '🐦', category: 'special', rarity: 'uncommon', requirement: { type: 'custom', metric: 'morning_task', threshold: 1 }, xpReward: 25 },
  { id: 'researcher', name: 'Master Researcher', description: 'Complete 25 research tasks', icon: '🔬', category: 'special', rarity: 'rare', requirement: { type: 'count', metric: 'research_tasks', threshold: 25 }, xpReward: 150 },
  { id: 'dreamer', name: 'Dream Walker', description: 'Participate in 10 dream learning cycles', icon: '🌙', category: 'special', rarity: 'epic', requirement: { type: 'count', metric: 'dream_cycles', threshold: 10 }, xpReward: 200 },
];

// ============================================================================
// AGENCY REPUTATION
// ============================================================================
export interface AgencyReputation {
  score: number;           // 0-1000
  tier: ReputationTier;
  streak: number;          // Days of consistent activity
  badges: string[];        // Earned reputation badges
}

export type ReputationTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'obsidian';

export const REPUTATION_TIERS: Record<ReputationTier, { minScore: number; badge: string; color: string; benefits: string[] }> = {
  bronze: { minScore: 0, badge: '🥉', color: 'orange', benefits: ['Basic features'] },
  silver: { minScore: 100, badge: '🥈', color: 'slate', benefits: ['Priority support', 'Extended logs'] },
  gold: { minScore: 300, badge: '🥇', color: 'yellow', benefits: ['Advanced analytics', 'API access'] },
  platinum: { minScore: 600, badge: '💎', color: 'cyan', benefits: ['Custom integrations', 'White-label'] },
  diamond: { minScore: 850, badge: '👑', color: 'purple', benefits: ['Dedicated support', 'Early features'] },
  obsidian: { minScore: 950, badge: '🔮', color: 'fuchsia', benefits: ['Unlimited everything', 'VIP access'] },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate level from XP
 */
export function getLevelFromXP(xp: number): AgentLevel {
  for (let i = AGENT_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= AGENT_LEVELS[i].minXP) {
      return AGENT_LEVELS[i];
    }
  }
  return AGENT_LEVELS[0];
}

/**
 * Calculate XP progress within current level
 */
export function getXPProgress(xp: number): { current: number; required: number; percentage: number } {
  const level = getLevelFromXP(xp);
  const current = xp - level.minXP;
  const required = level.maxXP === Infinity ? level.minXP : level.maxXP - level.minXP;
  const percentage = level.maxXP === Infinity ? 100 : (current / required) * 100;
  
  return { current, required, percentage };
}

/**
 * Calculate XP reward for a task
 */
export function calculateTaskXP(options: {
  taskType: string;
  duration: number;
  success: boolean;
  streakBonus: number;
  qualityScore?: number;
}): number {
  const { taskType, duration, success, streakBonus, qualityScore = 1 } = options;
  
  if (!success) return 0;
  
  // Base XP by task type
  const baseXP: Record<string, number> = {
    research: 15,
    seo_scan: 12,
    code_study: 20,
    company_research: 18,
    content_creation: 25,
    analysis: 15,
    audit: 20,
    idle_learning: 5,
  };
  
  let xp = baseXP[taskType] || 10;
  
  // Speed bonus (faster = more XP, up to 50% bonus)
  const speedBonus = Math.max(0, 1 - (duration / 300000)); // 5 min baseline
  xp += xp * speedBonus * 0.5;
  
  // Streak bonus (up to 100% bonus at 10 streak)
  xp += xp * Math.min(streakBonus / 10, 1);
  
  // Quality bonus
  xp *= qualityScore;
  
  return Math.round(xp);
}

/**
 * Get reputation tier from score
 */
export function getReputationTier(score: number): ReputationTier {
  const tiers = Object.entries(REPUTATION_TIERS).sort((a, b) => b[1].minScore - a[1].minScore);
  for (const [tier, config] of tiers) {
    if (score >= config.minScore) {
      return tier as ReputationTier;
    }
  }
  return 'bronze';
}

/**
 * Calculate reputation score change based on activity
 */
export function calculateReputationChange(options: {
  tasksCompleted: number;
  successRate: number;
  activeAgents: number;
  dreamLearningActive: boolean;
  dailyActive: boolean;
}): number {
  const { tasksCompleted, successRate, activeAgents, dreamLearningActive, dailyActive } = options;
  
  let change = 0;
  
  // Base points for activity
  change += Math.min(tasksCompleted * 0.5, 5);
  
  // Quality bonus
  if (successRate > 0.9) change += 2;
  if (successRate > 0.95) change += 3;
  
  // Team utilization bonus
  change += Math.min(activeAgents * 0.5, 2);
  
  // Dream learning bonus
  if (dreamLearningActive) change += 1;
  
  // Daily streak bonus
  if (dailyActive) change += 0.5;
  
  return Math.round(change * 10) / 10;
}

/**
 * Check if achievement is unlocked
 */
export function checkAchievement(achievement: Achievement, metrics: Record<string, number>): boolean {
  const { type, metric, threshold } = achievement.requirement;
  const value = metrics[metric] || 0;
  
  switch (type) {
    case 'count':
    case 'streak':
      return value >= threshold;
    case 'percentage':
      return value >= threshold && (metrics.tasks_completed || 0) >= 20;
    case 'time':
      return value > 0 && value <= threshold;
    case 'custom':
      return value >= threshold;
    default:
      return false;
  }
}

/**
 * Get all unlocked achievements
 */
export function getUnlockedAchievements(metrics: Record<string, number>): Achievement[] {
  return ACHIEVEMENTS.filter(a => checkAchievement(a, metrics));
}

/**
 * Get next achievements to unlock
 */
export function getNextAchievements(metrics: Record<string, number>, limit: number = 3): Achievement[] {
  const unlocked = new Set(getUnlockedAchievements(metrics).map(a => a.id));
  
  return ACHIEVEMENTS
    .filter(a => !unlocked.has(a.id))
    .sort((a, b) => {
      // Sort by how close they are to being unlocked
      const aProgress = (metrics[a.requirement.metric] || 0) / a.requirement.threshold;
      const bProgress = (metrics[b.requirement.metric] || 0) / b.requirement.threshold;
      return bProgress - aProgress;
    })
    .slice(0, limit);
}
