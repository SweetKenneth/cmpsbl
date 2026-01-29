/**
 * Evolution Autonomy — Governed Self-Evolution
 * v0.7.6 — Safe autonomous evolution with strict guardrails
 */

import { supabase } from '@/integrations/supabase/client';
import { getCircuitStatus, isEvolutionAllowed } from './circuit-breaker';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type AutonomyMode = 'off' | 'advisory' | 'governed';

export interface AutonomyConfig {
  config_id: string;
  autonomy_mode: AutonomyMode;
  max_auto_runs_per_day: number;
  require_confidence_threshold: boolean;
  min_confidence_prod: number;
}

export interface AutonomyStatus {
  mode: AutonomyMode;
  can_auto_evolve: boolean;
  blocking_reasons: string[];
  runs_today: number;
  max_runs_today: number;
  confidence_threshold: number;
}

export interface AutonomyCheckResult {
  allowed: boolean;
  reasons: string[];
  mode: AutonomyMode;
}

// ═══════════════════════════════════════════════════════════════
// CONFIG MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * Get current autonomy configuration
 */
export async function getAutonomyConfig(): Promise<AutonomyConfig> {
  const { data, error } = await supabase
    .from('evolution_autonomy_config')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    // Default safe config
    return {
      config_id: 'default',
      autonomy_mode: 'off',
      max_auto_runs_per_day: 1,
      require_confidence_threshold: true,
      min_confidence_prod: 0.80,
    };
  }

  return {
    config_id: data.config_id,
    autonomy_mode: data.autonomy_mode as AutonomyMode,
    max_auto_runs_per_day: data.max_auto_runs_per_day,
    require_confidence_threshold: data.require_confidence_threshold,
    min_confidence_prod: Number(data.min_confidence_prod),
  };
}

/**
 * Set autonomy mode
 */
export async function setAutonomyMode(mode: AutonomyMode): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('evolution_autonomy_config')
    .update({ autonomy_mode: mode })
    .neq('config_id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    return { success: false, message: `Failed to update: ${error.message}` };
  }

  emitEvolveEvent('autonomy_mode_changed', { mode });
  return { success: true, message: `Autonomy mode set to: ${mode}` };
}

// ═══════════════════════════════════════════════════════════════
// AUTONOMY CHECKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get count of auto-initiated runs today
 */
async function getAutoRunsToday(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('evolution_runs')
    .select('*', { count: 'exact', head: true })
    .eq('auto_initiated', true)
    .gte('created_at', today.toISOString());

  return count || 0;
}

/**
 * Check if there's an active evolution run
 */
async function hasActiveRun(): Promise<boolean> {
  const { data } = await supabase
    .from('evolution_runs')
    .select('run_id')
    .not('phase', 'in', '("verified","aborted","failed")')
    .limit(1);

  return (data?.length || 0) > 0;
}

/**
 * Check if last run was successful
 */
async function lastRunSuccessful(): Promise<boolean> {
  const { data } = await supabase
    .from('evolution_runs')
    .select('phase')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) return true; // No runs yet = OK
  return data.phase === 'verified';
}

/**
 * Full autonomy check for governed evolution
 */
export async function checkAutonomyPermission(
  confidenceScore: number,
  riskLevel: 'low' | 'medium' | 'high',
  isFallback: boolean
): Promise<AutonomyCheckResult> {
  const config = await getAutonomyConfig();
  const reasons: string[] = [];

  // Mode check
  if (config.autonomy_mode === 'off') {
    return { allowed: false, reasons: ['Autonomy mode is OFF'], mode: config.autonomy_mode };
  }

  // Circuit breaker check
  const circuitCheck = await isEvolutionAllowed();
  if (!circuitCheck.allowed) {
    reasons.push(circuitCheck.reason);
  }

  // Confidence threshold check
  if (config.require_confidence_threshold && confidenceScore < config.min_confidence_prod) {
    reasons.push(`Confidence ${(confidenceScore * 100).toFixed(0)}% below threshold ${(config.min_confidence_prod * 100).toFixed(0)}%`);
  }

  // Risk level check (governed mode only allows low risk)
  if (config.autonomy_mode === 'governed' && riskLevel !== 'low') {
    reasons.push(`Risk level '${riskLevel}' too high for governed mode`);
  }

  // Fallback check
  if (isFallback) {
    reasons.push('Fallback proposals require human approval');
  }

  // Active run check
  if (await hasActiveRun()) {
    reasons.push('Another evolution run is active');
  }

  // Last run check
  if (!(await lastRunSuccessful())) {
    reasons.push('Last evolution run was not successful');
  }

  // Daily limit check
  const runsToday = await getAutoRunsToday();
  if (runsToday >= config.max_auto_runs_per_day) {
    reasons.push(`Daily auto-run limit reached (${runsToday}/${config.max_auto_runs_per_day})`);
  }

  const allowed = reasons.length === 0;

  emitEvolveEvent('autonomy_check_completed', {
    allowed,
    reasons,
    mode: config.autonomy_mode,
    confidence: confidenceScore,
    risk: riskLevel,
  });

  return { allowed, reasons, mode: config.autonomy_mode };
}

/**
 * Get full autonomy status
 */
export async function getAutonomyStatus(): Promise<AutonomyStatus> {
  const config = await getAutonomyConfig();
  const runsToday = await getAutoRunsToday();
  
  const checkResult = await checkAutonomyPermission(1.0, 'low', false);

  return {
    mode: config.autonomy_mode,
    can_auto_evolve: checkResult.allowed,
    blocking_reasons: checkResult.reasons,
    runs_today: runsToday,
    max_runs_today: config.max_auto_runs_per_day,
    confidence_threshold: config.min_confidence_prod,
  };
}
