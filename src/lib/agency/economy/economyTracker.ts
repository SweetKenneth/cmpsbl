/**
 * Economy Tracker
 * Tracks and calculates economic metrics for agency tasks
 */

import { supabase } from '@/integrations/supabase/client';
import type { TaskEconomics, AgencyDailyEconomics, EconomicTelemetry } from './types';

// Base cost per minute of compute (in cents)
const BASE_COST_PER_MINUTE = 2;

// Value multipliers by preset category
const VALUE_MULTIPLIERS: Record<string, number> = {
  competitive: 1.5,
  seo: 1.2,
  research: 1.8,
  content: 1.0,
  advertising: 1.4,
  marketing: 1.1,
  operations: 1.0,
  compliance: 2.0,
};

/**
 * Calculate task economics based on preset and execution
 */
export function calculateTaskEconomics(
  presetId: string | null,
  computeTimeMs: number,
  success: boolean,
  learningSignals: { newHeuristics: number; templateUpdates: number }
): TaskEconomics {
  // Base cost from compute time
  const computeMinutes = computeTimeMs / 60000;
  const baseCost = Math.ceil(computeMinutes * BASE_COST_PER_MINUTE);

  // Get preset value if available (would be fetched in real implementation)
  let taskValue = success ? 500 : 0; // Default $5 value for successful tasks
  
  // Learning gain from successful execution
  const learningGain = success
    ? 0.1 + (learningSignals.newHeuristics * 0.05) + (learningSignals.templateUpdates * 0.03)
    : Math.max(0.02, learningSignals.newHeuristics * 0.01); // Small learning from failures

  // ROI calculation
  const roi = baseCost > 0 ? (taskValue - baseCost) / baseCost : 0;

  return {
    task_value_cents: taskValue,
    task_cost_cents: baseCost,
    compute_time_ms: computeTimeMs,
    learning_gain: Math.min(1, learningGain),
    roi: Math.round(roi * 100) / 100,
  };
}

/**
 * Get economic telemetry for an agency
 */
export async function getAgencyEconomicTelemetry(
  agencyId: string,
  days: number = 30
): Promise<EconomicTelemetry | null> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('agency_economics')
    .select('*')
    .eq('agency_id', agencyId)
    .gte('period_date', startDate.toISOString().split('T')[0])
    .order('period_date', { ascending: true });

  if (error || !data?.length) {
    return null;
  }

  // Aggregate metrics
  const totals = data.reduce(
    (acc, day) => ({
      tasks: acc.tasks + (day.tasks_completed || 0),
      value: acc.value + (day.total_value_cents || 0),
      cost: acc.cost + (day.total_cost_cents || 0),
      learning: acc.learning + (day.total_learning_gain || 0),
      successRates: [...acc.successRates, day.success_rate || 0],
    }),
    { tasks: 0, value: 0, cost: 0, learning: 0, successRates: [] as number[] }
  );

  // Calculate improvement rate (success rate trend)
  const improvementRate =
    totals.successRates.length >= 2
      ? (totals.successRates[totals.successRates.length - 1] - totals.successRates[0]) /
        totals.successRates.length
      : 0;

  // Baseline ROI is 0 (break-even)
  const actualRoi = totals.cost > 0 ? (totals.value - totals.cost) / totals.cost : 0;

  return {
    tasks_completed: totals.tasks,
    economic_output_cents: totals.value,
    roi_vs_baseline: actualRoi,
    learning_gain: totals.learning,
    improvement_rate: improvementRate,
    convergence_speed: Math.min(1, totals.learning / (days * 0.1)), // Normalized
  };
}

/**
 * Get daily economics for charting
 */
export async function getDailyEconomics(
  agencyId: string,
  days: number = 30
): Promise<AgencyDailyEconomics[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('agency_economics')
    .select('*')
    .eq('agency_id', agencyId)
    .gte('period_date', startDate.toISOString().split('T')[0])
    .order('period_date', { ascending: true });

  if (error) {
    console.error('Failed to fetch daily economics:', error);
    return [];
  }

  return (data || []) as AgencyDailyEconomics[];
}

/**
 * Update task with economic data
 */
export async function updateTaskEconomics(
  taskId: string,
  economics: TaskEconomics,
  presetId?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('agency_tasks')
    .update({
      task_value_cents: economics.task_value_cents,
      task_cost_cents: economics.task_cost_cents,
      compute_time_ms: economics.compute_time_ms,
      learning_gain: economics.learning_gain,
      roi: economics.roi,
      preset_id: presetId,
    })
    .eq('id', taskId);

  if (error) {
    console.error('Failed to update task economics:', error);
    return false;
  }

  return true;
}
