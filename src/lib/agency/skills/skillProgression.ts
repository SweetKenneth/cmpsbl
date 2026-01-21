/**
 * Skill Progression System
 * Manages agent skill levels and progression
 */

import { supabase } from '@/integrations/supabase/client';
import { SkillLevel, SKILL_THRESHOLDS } from '../economy/types';

export interface AgentSkillProfile {
  id: string;
  role: string;
  specialization: string;
  skill_level: SkillLevel;
  success_rate: number;
  task_count: number;
  reflection_quality: number;
  competency_score: number;
  total_learning_gain: number;
}

export interface SkillProgressionResult {
  previous_level: SkillLevel;
  new_level: SkillLevel;
  promoted: boolean;
  next_level_requirements: {
    success_rate_needed: number;
    tasks_needed: number;
    reflection_quality_needed: number;
  } | null;
}

/**
 * Calculate what skill level an agent should have
 */
export function calculateSkillLevel(
  successRate: number,
  taskCount: number,
  reflectionQuality: number
): SkillLevel {
  if (
    successRate >= SKILL_THRESHOLDS.strategist.success_rate &&
    taskCount >= SKILL_THRESHOLDS.strategist.task_count &&
    reflectionQuality >= SKILL_THRESHOLDS.strategist.reflection_quality
  ) {
    return 'strategist';
  }
  if (
    successRate >= SKILL_THRESHOLDS.expert.success_rate &&
    taskCount >= SKILL_THRESHOLDS.expert.task_count &&
    reflectionQuality >= SKILL_THRESHOLDS.expert.reflection_quality
  ) {
    return 'expert';
  }
  if (
    successRate >= SKILL_THRESHOLDS.specialist.success_rate &&
    taskCount >= SKILL_THRESHOLDS.specialist.task_count &&
    reflectionQuality >= SKILL_THRESHOLDS.specialist.reflection_quality
  ) {
    return 'specialist';
  }
  if (
    successRate >= SKILL_THRESHOLDS.intermediate.success_rate &&
    taskCount >= SKILL_THRESHOLDS.intermediate.task_count
  ) {
    return 'intermediate';
  }
  return 'novice';
}

/**
 * Get the next level requirements for an agent
 */
export function getNextLevelRequirements(
  currentLevel: SkillLevel,
  currentStats: { success_rate: number; task_count: number; reflection_quality: number }
): { success_rate_needed: number; tasks_needed: number; reflection_quality_needed: number } | null {
  const levelOrder: SkillLevel[] = ['novice', 'intermediate', 'specialist', 'expert', 'strategist'];
  const currentIndex = levelOrder.indexOf(currentLevel);

  if (currentIndex === levelOrder.length - 1) {
    return null; // Already at max level
  }

  const nextLevel = levelOrder[currentIndex + 1];
  const requirements = SKILL_THRESHOLDS[nextLevel];

  return {
    success_rate_needed: Math.max(0, requirements.success_rate - currentStats.success_rate),
    tasks_needed: Math.max(0, requirements.task_count - currentStats.task_count),
    reflection_quality_needed: Math.max(0, requirements.reflection_quality - currentStats.reflection_quality),
  };
}

/**
 * Get skill profiles for all agents in an agency
 */
export async function getAgencySkillProfiles(agencyId: string): Promise<AgentSkillProfile[]> {
  const { data, error } = await supabase
    .from('agency_members')
    .select('id, role, specialization, skill_level, success_rate, task_count, reflection_quality, competency_score, total_learning_gain')
    .eq('agency_id', agencyId)
    .order('competency_score', { ascending: false });

  if (error) {
    console.error('Failed to fetch skill profiles:', error);
    return [];
  }

  return (data || []).map(member => ({
    ...member,
    skill_level: (member.skill_level as SkillLevel) || 'novice',
    success_rate: member.success_rate || 0.5,
    task_count: member.task_count || 0,
    reflection_quality: member.reflection_quality || 0.5,
    competency_score: member.competency_score || 50,
    total_learning_gain: member.total_learning_gain || 0,
  }));
}

/**
 * Update agent stats after task completion
 */
export async function updateAgentStatsAfterTask(
  memberId: string,
  taskSuccess: boolean,
  reflectionQuality: number,
  learningGain: number
): Promise<SkillProgressionResult | null> {
  // First get current stats
  const { data: current, error: fetchError } = await supabase
    .from('agency_members')
    .select('skill_level, success_rate, task_count, reflection_quality, total_learning_gain')
    .eq('id', memberId)
    .single();

  if (fetchError || !current) {
    console.error('Failed to fetch agent stats:', fetchError);
    return null;
  }

  const previousLevel = (current.skill_level as SkillLevel) || 'novice';
  const currentTaskCount = current.task_count || 0;
  const currentSuccessRate = current.success_rate || 0.5;
  const currentReflectionQuality = current.reflection_quality || 0.5;

  // Calculate new stats
  const newTaskCount = currentTaskCount + 1;
  const newSuccessRate =
    (currentSuccessRate * currentTaskCount + (taskSuccess ? 1 : 0)) / newTaskCount;
  const newReflectionQuality =
    (currentReflectionQuality * 0.9) + (reflectionQuality * 0.1); // Weighted average
  const newLearningGain = (current.total_learning_gain || 0) + learningGain;

  // Update in database
  const { error: updateError } = await supabase
    .from('agency_members')
    .update({
      task_count: newTaskCount,
      success_rate: newSuccessRate,
      reflection_quality: newReflectionQuality,
      total_learning_gain: newLearningGain,
    })
    .eq('id', memberId);

  if (updateError) {
    console.error('Failed to update agent stats:', updateError);
    return null;
  }

  // Calculate new skill level (trigger will also do this)
  const newLevel = calculateSkillLevel(newSuccessRate, newTaskCount, newReflectionQuality);

  return {
    previous_level: previousLevel,
    new_level: newLevel,
    promoted: newLevel !== previousLevel && 
      ['intermediate', 'specialist', 'expert', 'strategist'].indexOf(newLevel) >
      ['novice', 'intermediate', 'specialist', 'expert'].indexOf(previousLevel),
    next_level_requirements: getNextLevelRequirements(newLevel, {
      success_rate: newSuccessRate,
      task_count: newTaskCount,
      reflection_quality: newReflectionQuality,
    }),
  };
}

/**
 * Get skill level display info
 */
export function getSkillLevelInfo(level: SkillLevel): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  const info: Record<SkillLevel, { label: string; color: string; icon: string; description: string }> = {
    novice: {
      label: 'Novice',
      color: 'text-muted-foreground',
      icon: '🌱',
      description: 'Learning the basics',
    },
    intermediate: {
      label: 'Intermediate',
      color: 'text-blue-500',
      icon: '📘',
      description: 'Solid foundational skills',
    },
    specialist: {
      label: 'Specialist',
      color: 'text-purple-500',
      icon: '🎯',
      description: 'Domain expertise emerging',
    },
    expert: {
      label: 'Expert',
      color: 'text-amber-500',
      icon: '⭐',
      description: 'High reliability and insight',
    },
    strategist: {
      label: 'Strategist',
      color: 'text-emerald-500',
      icon: '🧠',
      description: 'Peak cognitive performance',
    },
  };

  return info[level];
}
