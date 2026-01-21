/**
 * Agency Economy Types
 * Economic tracking for cognitive labor
 */

export interface TaskEconomics {
  task_value_cents: number;
  task_cost_cents: number;
  compute_time_ms: number;
  learning_gain: number;
  roi: number;
}

export interface AgentEconomics {
  agent_id: string;
  skill_level: SkillLevel;
  success_rate: number;
  task_count: number;
  reflection_quality: number;
  total_learning_gain: number;
  competency_score: number;
}

export interface AgencyDailyEconomics {
  agency_id: string;
  period_date: string;
  tasks_completed: number;
  total_value_cents: number;
  total_cost_cents: number;
  total_compute_time_ms: number;
  total_learning_gain: number;
  avg_roi: number;
  success_rate: number;
  improvement_rate: number;
  convergence_speed: number;
}

export type SkillLevel = 'novice' | 'intermediate' | 'specialist' | 'expert' | 'strategist';

export interface SkillThresholds {
  success_rate: number;
  task_count: number;
  reflection_quality: number;
}

export const SKILL_THRESHOLDS: Record<SkillLevel, SkillThresholds> = {
  novice: { success_rate: 0, task_count: 0, reflection_quality: 0 },
  intermediate: { success_rate: 0.6, task_count: 10, reflection_quality: 0 },
  specialist: { success_rate: 0.75, task_count: 25, reflection_quality: 0.6 },
  expert: { success_rate: 0.85, task_count: 50, reflection_quality: 0.75 },
  strategist: { success_rate: 0.95, task_count: 100, reflection_quality: 0.9 },
};

export interface EconomicTelemetry {
  tasks_completed: number;
  economic_output_cents: number;
  roi_vs_baseline: number;
  learning_gain: number;
  improvement_rate: number;
  convergence_speed: number;
}
