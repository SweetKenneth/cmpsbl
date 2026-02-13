/**
 * Atlas Test Runner Adapter
 * v9.1.0 — ARCHITECT Epoch System testing for Atlas control plane
 */

import { supabase } from '@/integrations/supabase/client';
import { getRegistry, getModule } from '../registry';
import { checkOpAllowed } from '../capabilities';
import { writeAuditEntry, generateTraceId } from '../audit';
import type { TestCmd, TestDepth, TestResult, TestDetail } from '../types';

export interface TestAdapterResult {
  ok: boolean;
  cmd: TestCmd;
  result?: TestResult;
  error?: string;
  trace_id: string;
  execution_ms: number;
}

/**
 * Execute a test command through Atlas
 */
export async function executeTestCommand(
  cmd: TestCmd,
  options?: { target?: string; depth?: TestDepth },
  actor?: string,
  actor_role?: string
): Promise<TestAdapterResult> {
  const startTime = performance.now();
  const trace_id = generateTraceId();
  const depth = options?.depth ?? 'quick';
  
  // Check capability
  const allowed = await checkOpAllowed('tests');
  if (!allowed.allowed) {
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'tests',
      target: cmd,
      payload: options,
      result_summary: allowed.reason,
      status: 'blocked',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: false,
      cmd,
      error: allowed.reason,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
  
  try {
    let result: TestResult;
    
    switch (cmd) {
      case 'smoke':
        result = await runSmokeTests(depth);
        break;
        
      case 'module':
        if (!options?.target) {
          return {
            ok: false,
            cmd,
            error: 'Module target required for module tests',
            trace_id,
            execution_ms: performance.now() - startTime,
          };
        }
        result = await runModuleTests(options.target, depth);
        break;
        
      case 'full':
        result = await runFullTests(depth);
        break;
        
      default:
        return {
          ok: false,
          cmd,
          error: `Unknown test command: ${cmd}`,
          trace_id,
          execution_ms: performance.now() - startTime,
        };
    }
    
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'tests',
      target: `${cmd}${options?.target ? `:${options.target}` : ''}`,
      payload: { depth },
      result_summary: result.summary,
      status: result.failed > 0 ? 'fail' : 'success',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: result.failed === 0,
      cmd,
      result,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'tests',
      target: cmd,
      payload: options,
      result_summary: errorMessage,
      status: 'fail',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: false,
      cmd,
      error: errorMessage,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
}

/**
 * Smoke tests - basic health checks
 */
async function runSmokeTests(depth: TestDepth): Promise<TestResult> {
  const startTime = performance.now();
  const details: TestDetail[] = [];
  
  // Test 1: Registry loads
  const registryStart = performance.now();
  try {
    const registry = getRegistry();
    details.push({
      name: 'Registry Load',
      status: registry.length === 14 ? 'pass' : 'fail',
      message: `Loaded ${registry.length} modules`,
      duration_ms: performance.now() - registryStart,
    });
  } catch (e) {
    details.push({
      name: 'Registry Load',
      status: 'fail',
      message: e instanceof Error ? e.message : 'Failed',
      duration_ms: performance.now() - registryStart,
    });
  }
  
  // Test 2: Supabase connection
  const supabaseStart = performance.now();
  try {
    const { error } = await supabase.from('substrate_capabilities').select('key').limit(1);
    details.push({
      name: 'Database Connection',
      status: error ? 'fail' : 'pass',
      message: error ? error.message : 'Connected',
      duration_ms: performance.now() - supabaseStart,
    });
  } catch (e) {
    details.push({
      name: 'Database Connection',
      status: 'fail',
      message: e instanceof Error ? e.message : 'Failed',
      duration_ms: performance.now() - supabaseStart,
    });
  }
  
  // Test 3: Core module ping
  const coreStart = performance.now();
  try {
    const { data, error } = await supabase.functions.invoke('pf-substrate', {
      body: { module: 'core', action: 'health' },
    });
    details.push({
      name: 'Core Module Ping',
      status: error ? 'fail' : 'pass',
      message: error ? error.message : 'Healthy',
      duration_ms: performance.now() - coreStart,
    });
  } catch (e) {
    details.push({
      name: 'Core Module Ping',
      status: 'fail',
      message: e instanceof Error ? e.message : 'Failed',
      duration_ms: performance.now() - coreStart,
    });
  }
  
  const passed = details.filter(d => d.status === 'pass').length;
  const failed = details.filter(d => d.status === 'fail').length;
  const skipped = details.filter(d => d.status === 'skip').length;
  
  return {
    cmd: 'smoke',
    depth,
    passed,
    failed,
    skipped,
    duration_ms: performance.now() - startTime,
    summary: `Smoke tests: ${passed}/${details.length} passed`,
    details,
  };
}

/**
 * Module-specific tests
 */
async function runModuleTests(target: string, depth: TestDepth): Promise<TestResult> {
  const startTime = performance.now();
  const details: TestDetail[] = [];
  
  const module = getModule(target);
  if (!module) {
    return {
      cmd: 'module',
      target,
      depth,
      passed: 0,
      failed: 1,
      skipped: 0,
      duration_ms: performance.now() - startTime,
      summary: `Unknown module: ${target}`,
      details: [{ name: 'Module Lookup', status: 'fail', message: 'Not found', duration_ms: 0 }],
    };
  }
  
  // Test module ping
  const pingStart = performance.now();
  try {
    const { data, error } = await supabase.functions.invoke('pf-substrate', {
      body: { module: target, action: 'health' },
    });
    details.push({
      name: `${module.name} Ping`,
      status: error ? 'fail' : 'pass',
      message: error ? error.message : 'Responsive',
      duration_ms: performance.now() - pingStart,
    });
  } catch (e) {
    details.push({
      name: `${module.name} Ping`,
      status: 'fail',
      message: e instanceof Error ? e.message : 'Failed',
      duration_ms: performance.now() - pingStart,
    });
  }
  
  // Test lightweight action if depth is standard or deep
  if (depth !== 'quick' && module.actions.length > 0) {
    const safeAction = module.actions.find(a => a.risk === 'low');
    if (safeAction) {
      const actionStart = performance.now();
      try {
        const { data, error } = await supabase.functions.invoke('pf-substrate', {
          body: { module: target, action: safeAction.id },
        });
        details.push({
          name: `${module.name}.${safeAction.name}`,
          status: error ? 'fail' : 'pass',
          message: error ? error.message : 'Executed',
          duration_ms: performance.now() - actionStart,
        });
      } catch (e) {
        details.push({
          name: `${module.name}.${safeAction.name}`,
          status: 'fail',
          message: e instanceof Error ? e.message : 'Failed',
          duration_ms: performance.now() - actionStart,
        });
      }
    }
  }
  
  const passed = details.filter(d => d.status === 'pass').length;
  const failed = details.filter(d => d.status === 'fail').length;
  const skipped = details.filter(d => d.status === 'skip').length;
  
  return {
    cmd: 'module',
    target,
    depth,
    passed,
    failed,
    skipped,
    duration_ms: performance.now() - startTime,
    summary: `${module.name} tests: ${passed}/${details.length} passed`,
    details,
  };
}

/**
 * Full system tests
 */
async function runFullTests(depth: TestDepth): Promise<TestResult> {
  const startTime = performance.now();
  const details: TestDetail[] = [];
  
  // Run smoke tests first
  const smokeResult = await runSmokeTests(depth);
  details.push(...smokeResult.details.map(d => ({ ...d, name: `[Smoke] ${d.name}` })));
  
  // Run module tests for each module
  const registry = getRegistry();
  for (const module of registry) {
    const moduleResult = await runModuleTests(module.id, 'quick');
    details.push(...moduleResult.details.map(d => ({ ...d, name: `[${module.id}] ${d.name}` })));
  }
  
  const passed = details.filter(d => d.status === 'pass').length;
  const failed = details.filter(d => d.status === 'fail').length;
  const skipped = details.filter(d => d.status === 'skip').length;
  
  return {
    cmd: 'full',
    depth,
    passed,
    failed,
    skipped,
    duration_ms: performance.now() - startTime,
    summary: `Full tests: ${passed}/${details.length} passed across ${registry.length} modules`,
    details,
  };
}
