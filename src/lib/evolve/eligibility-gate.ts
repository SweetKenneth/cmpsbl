/**
 * Eligibility Gate — Pure System Readiness Check
 * v1.0.0 — Plan-independent verification
 * 
 * Answers ONLY:
 * - Dependencies healthy?
 * - Locks present?
 * - Panic/freeze flags?
 * - Env/resources available?
 * 
 * NEVER mutates state. Works at any phase.
 */

import { supabase } from '@/integrations/supabase/client';
import { circuitBreaker } from './circuit-breaker';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EligibilityResult {
  eligible: boolean;
  blocking_reasons: string[];
  warnings: string[];
  baseline_health: HealthBaseline | null;
  timestamp: string;
}

export interface HealthBaseline {
  overall_score: number;
  module_health: Record<string, number>;
  error_count: number;
  warning_count: number;
}

interface DependencyCheck {
  name: string;
  healthy: boolean;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// ELIGIBILITY GATE
// ═══════════════════════════════════════════════════════════════

/**
 * Check system eligibility for evolution
 * PURE READ-ONLY — never mutates state
 */
export async function checkEligibility(): Promise<EligibilityResult> {
  const result: EligibilityResult = {
    eligible: true,
    blocking_reasons: [],
    warnings: [],
    baseline_health: null,
    timestamp: new Date().toISOString(),
  };

  // Check 1: Circuit breaker state (async)
  try {
    const circuitStatus = await circuitBreaker.getStatus();
    if (circuitStatus.state === 'open') {
      result.eligible = false;
      result.blocking_reasons.push(`Circuit breaker OPEN: ${circuitStatus.trip_reason || 'unknown reason'}`);
    }
  } catch {
    result.warnings.push('Could not check circuit breaker state');
  }

  // Check 2: Active evolution lock
  const lockCheck = await checkActiveLock();
  if (lockCheck.locked) {
    result.eligible = false;
    result.blocking_reasons.push(`Active evolution lock: ${lockCheck.run_id}`);
  }

  // Check 3: System panic/freeze flags
  const panicCheck = await checkPanicFlags();
  if (panicCheck.panic) {
    result.eligible = false;
    result.blocking_reasons.push(`System panic active: ${panicCheck.reason}`);
  }
  if (panicCheck.freeze) {
    result.warnings.push('System freeze flag detected — proceed with caution');
  }

  // Check 4: Dependencies health
  const depsCheck = await checkDependencies();
  for (const dep of depsCheck) {
    if (!dep.healthy) {
      result.warnings.push(`Dependency unhealthy: ${dep.name} — ${dep.message}`);
    }
  }
  const criticalDeps = depsCheck.filter(d => !d.healthy && isCriticalDependency(d.name));
  if (criticalDeps.length > 0) {
    result.eligible = false;
    result.blocking_reasons.push(`Critical dependencies unhealthy: ${criticalDeps.map(d => d.name).join(', ')}`);
  }

  // Check 5: Resource availability
  const resourceCheck = await checkResources();
  if (!resourceCheck.available) {
    result.eligible = false;
    result.blocking_reasons.push(`Insufficient resources: ${resourceCheck.reason}`);
  }

  // Capture baseline health (read-only)
  result.baseline_health = await captureBaselineHealth();

  return result;
}

// ═══════════════════════════════════════════════════════════════
// HELPER CHECKS
// ═══════════════════════════════════════════════════════════════

async function checkActiveLock(): Promise<{ locked: boolean; run_id?: string }> {
  try {
    const { data } = await supabase
      .from('evolution_runs')
      .select('run_id')
      .not('phase', 'in', '("verified","aborted","failed")')
      .limit(1)
      .maybeSingle();

    if (data) {
      return { locked: true, run_id: (data as { run_id: string }).run_id };
    }
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

async function checkPanicFlags(): Promise<{ panic: boolean; freeze: boolean; reason?: string }> {
  try {
    // Check brain_events for recent panic/freeze signals
    const { data } = await supabase
      .from('brain_events')
      .select('data')
      .eq('event_type', 'system_flag')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { panic: false, freeze: false };

    const eventData = (data as { data: Record<string, unknown> }).data || {};
    return {
      panic: eventData.panic === true,
      freeze: eventData.freeze === true,
      reason: eventData.panic_reason as string | undefined,
    };
  } catch {
    return { panic: false, freeze: false };
  }
}

async function checkDependencies(): Promise<DependencyCheck[]> {
  const checks: DependencyCheck[] = [];

  // Check database connectivity
  try {
    const { error } = await supabase.from('brain_events').select('id').limit(1);
    checks.push({
      name: 'database',
      healthy: !error,
      message: error ? error.message : 'Connected',
    });
  } catch (e) {
    checks.push({
      name: 'database',
      healthy: false,
      message: e instanceof Error ? e.message : 'Connection failed',
    });
  }

  // Check brain module via brain_events
  try {
    const { data } = await supabase
      .from('brain_events')
      .select('id')
      .eq('module', 'brain')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    checks.push({
      name: 'brain',
      healthy: !!data,
      message: data ? 'Available' : 'No recent brain activity',
    });
  } catch {
    checks.push({
      name: 'brain',
      healthy: true, // Non-critical fallback
      message: 'Brain check skipped',
    });
  }

  return checks;
}

function isCriticalDependency(name: string): boolean {
  const critical = ['database'];
  return critical.includes(name);
}

async function checkResources(): Promise<{ available: boolean; reason?: string }> {
  // In a real implementation, check memory, CPU, etc.
  // For now, always available
  return { available: true };
}

async function captureBaselineHealth(): Promise<HealthBaseline | null> {
  try {
    // Get system health from brain_events
    const { data } = await supabase
      .from('brain_events')
      .select('data')
      .eq('event_type', 'health_check')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      return {
        overall_score: 1.0,
        module_health: {},
        error_count: 0,
        warning_count: 0,
      };
    }

    const eventData = (data as { data: Record<string, unknown> }).data || {};
    return {
      overall_score: (eventData.overall_score as number) || 1.0,
      module_health: (eventData.module_health as Record<string, number>) || {},
      error_count: (eventData.error_count as number) || 0,
      warning_count: (eventData.warning_count as number) || 0,
    };
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// FORMATTED OUTPUT
// ═══════════════════════════════════════════════════════════════

export function formatEligibility(result: EligibilityResult): string {
  const lines = ['╔══════════════════════════════════════════════════════════════╗'];
  lines.push('║  ELIGIBILITY GATE — CAN CHANGE?                              ║');
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  
  const status = result.eligible ? '✅ ELIGIBLE' : '❌ BLOCKED';
  lines.push(`║  Status: ${status.padEnd(50)} ║`);
  lines.push(`║  Time:   ${result.timestamp.padEnd(50)} ║`);

  if (result.blocking_reasons.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  BLOCKING REASONS:                                           ║');
    for (const reason of result.blocking_reasons) {
      const truncated = reason.substring(0, 56);
      lines.push(`║    ⛔ ${truncated.padEnd(54)} ║`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  WARNINGS:                                                   ║');
    for (const warning of result.warnings) {
      const truncated = warning.substring(0, 56);
      lines.push(`║    ⚠️  ${truncated.padEnd(53)} ║`);
    }
  }

  if (result.baseline_health) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  BASELINE HEALTH:                                            ║');
    lines.push(`║    Score:    ${(result.baseline_health.overall_score * 100).toFixed(1)}%                                       ║`);
    lines.push(`║    Errors:   ${String(result.baseline_health.error_count).padEnd(48)} ║`);
    lines.push(`║    Warnings: ${String(result.baseline_health.warning_count).padEnd(48)} ║`);
  }

  lines.push('╚══════════════════════════════════════════════════════════════╝');
  return lines.join('\n');
}
