/**
 * Module Boot Health Gates — v1.0.0
 * Verified health thresholds before cascading module activation.
 * Prevents unhealthy modules from joining the boot graph and
 * contaminating downstream dependents.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ModuleName =
  | 'core' | 'ripple' | 'access'
  | 'brain' | 'decode' | 'dream'
  | 'defense' | 'nexus' | 'vision' | 'encode'
  | 'system' | 'modernizer' | 'integration' | 'inclusive'
  | 'cortex' | 'atlas' | 'medic'
  | 'memory' | 'relay' | 'audit' | 'identity' | 'economy' | 'sandbox'
  | 'nerve'   // OCG — inter-node signaling
  | 'shadow'  // CSZ — shadow mesh operations
  // Expansion Modules (38-Node Architecture)
  | 'sovereign' | 'oracle' | 'conscience' | 'phantom' | 'forge'
  | 'lingua' | 'compass' | 'echo' | 'treaty' | 'harvest' | 'reflex';

export type GateVerdict = 'pass' | 'warn' | 'block';

export interface BootGateCheck {
  module: ModuleName;
  checks: GateCheckResult[];
  verdict: GateVerdict;
  reason?: string;
  checked_at: string;
}

export interface GateCheckResult {
  name: string;
  passed: boolean;
  detail?: string;
}

// ═══════════════════════════════════════════════════════════════
// BOOT ORDER & DEPENDENCIES
// ═══════════════════════════════════════════════════════════════

export const BOOT_ORDER: Array<{ module: ModuleName; order: number; deps: ModuleName[] }> = [
  // Phase 1: Kernel
  { module: 'core',        order: 1,  deps: [] },
  // Phase 2: CCR Zones
  { module: 'memory',      order: 2,  deps: ['core'] },
  { module: 'brain',       order: 3,  deps: ['core'] },
  // Phase 3: OCG — Operational Compliance Grid (6 nodes)
  { module: 'ripple',      order: 4,  deps: ['core'] },
  { module: 'access',      order: 5,  deps: ['core'] },
  { module: 'identity',    order: 6,  deps: ['core', 'access'] },
  { module: 'relay',       order: 7,  deps: ['core', 'ripple'] },
  { module: 'audit',       order: 8,  deps: ['core'] },
  { module: 'nerve',       order: 9,  deps: ['core', 'ripple'] },
  // Phase 4: Execution Modules (10 nodes)
  { module: 'nexus',       order: 10, deps: ['core'] },
  { module: 'decode',      order: 11, deps: ['core', 'nexus'] },
  { module: 'dream',       order: 12, deps: ['core', 'nexus'] },
  { module: 'encode',      order: 13, deps: ['core', 'nexus'] },
  { module: 'defense',     order: 14, deps: ['core', 'ripple'] },
  { module: 'vision',      order: 15, deps: ['core', 'ripple'] },
  { module: 'economy',     order: 16, deps: ['core', 'access'] },
  { module: 'sandbox',     order: 17, deps: ['core'] },
  { module: 'integration', order: 18, deps: ['core', 'ripple', 'access'] },
  { module: 'medic',       order: 19, deps: ['core', 'vision'] },
  // Phase 5: System + Orchestration
  { module: 'system',      order: 20, deps: ['core', 'vision'] },
  { module: 'modernizer',  order: 21, deps: ['core', 'system', 'vision'] },
  { module: 'inclusive',    order: 22, deps: ['core', 'system'] },
  { module: 'cortex',      order: 23, deps: ['core', 'nexus', 'system', 'vision'] },
  { module: 'atlas',       order: 24, deps: ['core', 'system'] },
  // Phase 6: ESZ — Expansion Sovereignty Zone (4 nodes)
  { module: 'sovereign',   order: 25, deps: ['core', 'defense', 'access'] },
  { module: 'oracle',      order: 26, deps: ['core', 'brain', 'vision'] },
  { module: 'conscience',  order: 27, deps: ['core', 'defense'] },
  { module: 'treaty',      order: 28, deps: ['core', 'sovereign', 'access'] },
  // Phase 7: EPZ — Expansion Perception Zone (3 nodes)
  { module: 'compass',     order: 29, deps: ['core', 'vision', 'brain'] },
  { module: 'echo',        order: 30, deps: ['core', 'memory'] },
  { module: 'reflex',      order: 31, deps: ['core', 'nexus', 'vision'] },
  // Phase 8: EMZ — Expansion Manufacturing Zone (3 nodes)
  { module: 'forge',       order: 32, deps: ['core', 'encode'] },
  { module: 'lingua',      order: 33, deps: ['core', 'decode', 'nexus'] },
  { module: 'harvest',     order: 34, deps: ['core', 'memory', 'economy'] },
  // Phase 9: CSZ — Covert Systems Zone (3 nodes)
  { module: 'phantom',     order: 35, deps: ['core', 'defense', 'identity'] },
  { module: 'shadow',      order: 36, deps: ['core', 'defense'] },
  // Note: EVOLUTION boots via Fields phase but is organizationally in CSZ
];

// ═══════════════════════════════════════════════════════════════
// GATE CHECKS
// ═══════════════════════════════════════════════════════════════

/**
 * Run boot gate checks for a single module
 */
export async function checkBootGate(module: ModuleName): Promise<BootGateCheck> {
  const checks: GateCheckResult[] = [];
  const entry = BOOT_ORDER.find(b => b.module === module);
  
  if (!entry) {
    return {
      module,
      checks: [{ name: 'module_exists', passed: false, detail: 'Module not in boot order' }],
      verdict: 'block',
      reason: 'Unknown module',
      checked_at: new Date().toISOString(),
    };
  }

  // Check 1: Dependencies booted
  for (const dep of entry.deps) {
    const { data: depEvents } = await supabase
      .from('brain_events')
      .select('outcome')
      .eq('module', dep)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // last hour
      .order('created_at', { ascending: false })
      .limit(5);

    const hasActivity = depEvents && depEvents.length > 0;
    const hasFailures = depEvents?.some(e => e.outcome === 'failure');

    checks.push({
      name: `dep_${dep}_active`,
      passed: hasActivity === true,
      detail: hasActivity ? `${depEvents?.length} events in last hour` : `No recent activity from ${dep}`,
    });

    if (hasFailures) {
      checks.push({
        name: `dep_${dep}_healthy`,
        passed: false,
        detail: `${dep} has recent failures`,
      });
    }
  }

  // Check 2: Module's own recent health
  const { data: ownEvents } = await supabase
    .from('brain_events')
    .select('outcome')
    .eq('module', module)
    .gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  if (ownEvents && ownEvents.length > 0) {
    const failures = ownEvents.filter(e => e.outcome === 'failure').length;
    const successRate = (ownEvents.length - failures) / ownEvents.length;
    
    checks.push({
      name: 'own_success_rate',
      passed: successRate >= 0.5,
      detail: `${(successRate * 100).toFixed(0)}% success rate (${ownEvents.length} events)`,
    });
  } else {
    checks.push({
      name: 'own_success_rate',
      passed: true, // No events = first boot, allow it
      detail: 'No prior events (first boot assumed)',
    });
  }

  // Check 3: Database connectivity (critical tables)
  const criticalTableCheck = await checkCriticalTables();
  checks.push(criticalTableCheck);

  // Determine verdict
  const failedChecks = checks.filter(c => !c.passed);
  const depFailures = failedChecks.filter(c => c.name.startsWith('dep_'));

  let verdict: GateVerdict = 'pass';
  let reason: string | undefined;

  if (depFailures.length > 0) {
    verdict = 'block';
    reason = `Dependencies unhealthy: ${depFailures.map(c => c.detail).join('; ')}`;
  } else if (failedChecks.length > 0) {
    verdict = 'warn';
    reason = `Non-critical issues: ${failedChecks.map(c => c.detail).join('; ')}`;
  }

  const result: BootGateCheck = {
    module,
    checks,
    verdict,
    reason,
    checked_at: new Date().toISOString(),
  };

  // Log gate check
  await supabase.from('brain_events').insert({
    module: 'system',
    event_type: 'boot_gate_check',
    data: {
      module,
      verdict,
      checks_passed: checks.filter(c => c.passed).length,
      checks_failed: failedChecks.length,
      reason,
    } as any,
    outcome: verdict === 'block' ? 'failure' : 'success',
  });

  return result;
}

/** Check critical database tables are accessible */
async function checkCriticalTables(): Promise<GateCheckResult> {
  try {
    const [hot, events] = await Promise.all([
      supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
      supabase.from('brain_events').select('id', { count: 'exact', head: true }),
    ]);

    const ok = !hot.error && !events.error;
    return {
      name: 'critical_tables',
      passed: ok,
      detail: ok ? 'All critical tables accessible' : `Table errors: ${hot.error?.message || events.error?.message}`,
    };
  } catch (e: any) {
    return { name: 'critical_tables', passed: false, detail: e.message };
  }
}

/**
 * Run boot gates for ALL modules in boot order.
 * Returns which modules can safely boot.
 */
export async function runFullBootSequence(): Promise<{
  modules: BootGateCheck[];
  bootable: ModuleName[];
  blocked: ModuleName[];
  warnings: ModuleName[];
}> {
  const results: BootGateCheck[] = [];
  const bootable: ModuleName[] = [];
  const blocked: ModuleName[] = [];
  const warnings: ModuleName[] = [];
  const booted = new Set<ModuleName>();

  for (const entry of BOOT_ORDER) {
    // Check if all deps are booted
    const depsBooted = entry.deps.every(d => booted.has(d));

    if (!depsBooted) {
      const result: BootGateCheck = {
        module: entry.module,
        checks: [{ name: 'deps_booted', passed: false, detail: 'Required dependencies not yet booted' }],
        verdict: 'block',
        reason: 'Dependencies not booted',
        checked_at: new Date().toISOString(),
      };
      results.push(result);
      blocked.push(entry.module);
      continue;
    }

    const result = await checkBootGate(entry.module);
    results.push(result);

    if (result.verdict === 'pass' || result.verdict === 'warn') {
      bootable.push(entry.module);
      booted.add(entry.module);
      if (result.verdict === 'warn') warnings.push(entry.module);
    } else {
      blocked.push(entry.module);
    }
  }

  return { modules: results, bootable, blocked, warnings };
}
