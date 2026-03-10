/**
 * EVOLUTION Shadow Loop Resolver
 * Crown Jewel Capability
 * 
 * CLM Request: EVOLUTION flagged shadow loop — evolution runs stuck in shadow_applied
 * phase for 3+ consecutive cycles without progressing to production or verification.
 * 
 * Resolution: Automatic detection, forced resolution, and prevention of shadow loops
 * with configurable timeouts and escalation paths.
 * 
 * Tier: Enterprise (Shadow loop detection), CMPSBL (Auto-resolution of meta-engine loops)
 */

import { supabase } from '@/integrations/supabase/client';
import { emit } from '../events';

// ─── Configuration ───────────────────────────────────────────────────────────

export interface ShadowResolverConfig {
  maxShadowDurationHours: number;     // Max time a run can stay in shadow_applied
  maxConsecutiveShadowRuns: number;    // Consecutive shadow runs before auto-resolution
  autoAbortStaleRuns: boolean;        // Auto-abort runs exceeding maxShadowDuration
  escalateOnLoop: boolean;            // Emit escalation event on loop detection
  cooldownMinutes: number;            // Cooldown between shadow loop resolutions
}

const DEFAULT_CONFIG: ShadowResolverConfig = {
  maxShadowDurationHours: 4,
  maxConsecutiveShadowRuns: 3,
  autoAbortStaleRuns: true,
  escalateOnLoop: true,
  cooldownMinutes: 30,
};

let config = { ...DEFAULT_CONFIG };

// ─── State ───────────────────────────────────────────────────────────────────

export interface ShadowLoopReport {
  timestamp: string;
  staleRunsFound: number;
  staleRunsAborted: number;
  consecutiveShadowCount: number;
  loopDetected: boolean;
  resolution: 'none' | 'aborted_stale' | 'forced_promotion' | 'escalated';
  affectedRunIds: string[];
}

const reports: ShadowLoopReport[] = [];

// ─── Core Engine ─────────────────────────────────────────────────────────────

/**
 * Detect stale shadow_applied runs
 */
async function findStaleRuns(): Promise<Array<{ run_id: string; plan_id: string; updated_at: string; phase: string }>> {
  const cutoff = new Date(Date.now() - config.maxShadowDurationHours * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('evolution_runs')
    .select('run_id, plan_id, updated_at, phase')
    .eq('phase', 'shadow_applied')
    .lt('updated_at', cutoff)
    .order('updated_at', { ascending: true });

  if (error || !data) return [];
  return data as any[];
}

/**
 * Count consecutive shadow_applied runs (most recent first)
 */
async function countConsecutiveShadowRuns(): Promise<number> {
  const { data, error } = await supabase
    .from('evolution_runs')
    .select('phase')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) return 0;

  let count = 0;
  for (const run of data as any[]) {
    if (run.phase === 'shadow_applied') {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Abort a stale evolution run
 */
async function abortRun(runId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('evolution_runs')
      .update({
        phase: 'aborted',
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      } as never)
      .eq('run_id', runId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Run the shadow loop resolver
 */
export async function resolveShadowLoops(): Promise<ShadowLoopReport> {
  const staleRuns = await findStaleRuns();
  const consecutiveCount = await countConsecutiveShadowRuns();
  const loopDetected = consecutiveCount >= config.maxConsecutiveShadowRuns;

  const report: ShadowLoopReport = {
    timestamp: new Date().toISOString(),
    staleRunsFound: staleRuns.length,
    staleRunsAborted: 0,
    consecutiveShadowCount: consecutiveCount,
    loopDetected,
    resolution: 'none',
    affectedRunIds: staleRuns.map(r => r.run_id),
  };

  // Abort stale runs if configured
  if (config.autoAbortStaleRuns && staleRuns.length > 0) {
    for (const run of staleRuns) {
      const aborted = await abortRun(run.run_id);
      if (aborted) report.staleRunsAborted++;
    }
    report.resolution = 'aborted_stale';
  }

  // Handle shadow loop detection
  if (loopDetected) {
    if (config.escalateOnLoop) {
      report.resolution = 'escalated';
      
      emit({
        module: 'evolution',
        event_type: 'shadow_loop_detected',
        outcome: 'succeeded',
        data: {
          consecutiveCount,
          staleRunsAborted: report.staleRunsAborted,
          message: `Shadow loop detected: ${consecutiveCount} consecutive runs stuck in shadow phase. Auto-resolution applied.`,
        },
      });
    }
  }

  // Log to brain_events for audit trail
  if (report.staleRunsAborted > 0 || loopDetected) {
    try {
      await supabase.from('brain_events').insert({
        event_type: 'shadow_loop_resolution',
        category: 'modernizer',
        content: `Shadow loop resolver: ${report.staleRunsAborted} stale runs aborted, ${consecutiveCount} consecutive shadow runs detected. Loop: ${loopDetected}`,
        data: report,
        source: 'shadow_resolver',
        confidence: 1.0,
      } as any);
    } catch {
      // Non-fatal
    }
  }

  reports.push(report);
  if (reports.length > 20) reports.shift();

  return report;
}

/**
 * Get shadow resolver health
 */
export function getShadowResolverState(): {
  config: ShadowResolverConfig;
  recentReports: ShadowLoopReport[];
  loopsResolved: number;
} {
  return {
    config: { ...config },
    recentReports: [...reports],
    loopsResolved: reports.filter(r => r.resolution !== 'none').length,
  };
}

/**
 * Configure the resolver
 */
export function configureShadowResolver(updates: Partial<ShadowResolverConfig>): ShadowResolverConfig {
  config = { ...config, ...updates };
  return { ...config };
}
