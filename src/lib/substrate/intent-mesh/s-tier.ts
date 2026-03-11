/**
 * INTENT — S-Tier Primitives
 * Disambiguation, goal tracking, chaining, compilation, predictive preloading
 */

export * from '@/crownjewels/s-tier/038-intent-disambiguation';
// goal-tracking has Goal collision with cortex/175
export {
  createGoal,
  completeMilestone,
  getGoal,
  listGoals,
  type Goal as IntentGoal,
} from '@/crownjewels/s-tier/051-goal-tracking';
export * from '@/crownjewels/s-tier/065-intent-chaining';
export * from '@/crownjewels/s-tier/177-intent-compiler';
export * from '@/crownjewels/s-tier/219-predictive-intent-preloader';
