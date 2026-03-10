/**
 * Automated Regression Testing — v1.0.0
 * Post-evolution smoke tests to catch regressions from EVOLUTION/SEBA changes.
 * Runs health checks, memory integrity tests, and module response validation.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'error';

export interface RegressionTest {
  id: string;
  name: string;
  category: 'health' | 'memory' | 'module' | 'api' | 'data_integrity';
  run: () => Promise<TestResult>;
}

export interface TestResult {
  test_id: string;
  test_name: string;
  status: TestStatus;
  duration_ms: number;
  details?: string;
  expected?: string;
  actual?: string;
}

export interface RegressionSuiteResult {
  suite_id: string;
  trigger: string; // What triggered the suite (e.g., 'seba_execution', 'evolution_deploy')
  started_at: string;
  completed_at: string;
  duration_ms: number;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  results: TestResult[];
  verdict: 'clean' | 'regression_detected' | 'unstable';
}

// ═══════════════════════════════════════════════════════════════
// SMOKE TESTS
// ═══════════════════════════════════════════════════════════════

const SMOKE_TESTS: RegressionTest[] = [
  {
    id: 'mem_hot_readable',
    name: 'Hot memory tier is readable',
    category: 'memory',
    run: async () => {
      const start = Date.now();
      try {
        const { data, error } = await supabase
          .from('brain_memory_hot')
          .select('id')
          .limit(1);
        return {
          test_id: 'mem_hot_readable',
          test_name: 'Hot memory tier is readable',
          status: error ? 'failed' : 'passed',
          duration_ms: Date.now() - start,
          details: error?.message,
        };
      } catch (e: any) {
        return { test_id: 'mem_hot_readable', test_name: 'Hot memory tier is readable', status: 'error', duration_ms: Date.now() - start, details: e.message };
      }
    },
  },
  {
    id: 'mem_warm_readable',
    name: 'Warm memory tier is readable',
    category: 'memory',
    run: async () => {
      const start = Date.now();
      try {
        const { data, error } = await supabase
          .from('brain_memory_warm')
          .select('id')
          .limit(1);
        return {
          test_id: 'mem_warm_readable',
          test_name: 'Warm memory tier is readable',
          status: error ? 'failed' : 'passed',
          duration_ms: Date.now() - start,
          details: error?.message,
        };
      } catch (e: any) {
        return { test_id: 'mem_warm_readable', test_name: 'Warm memory tier is readable', status: 'error', duration_ms: Date.now() - start, details: e.message };
      }
    },
  },
  {
    id: 'mem_cold_readable',
    name: 'Cold memory tier is readable',
    category: 'memory',
    run: async () => {
      const start = Date.now();
      try {
        const { error } = await supabase
          .from('brain_memory_cold')
          .select('id')
          .limit(1);
        return {
          test_id: 'mem_cold_readable',
          test_name: 'Cold memory tier is readable',
          status: error ? 'failed' : 'passed',
          duration_ms: Date.now() - start,
          details: error?.message,
        };
      } catch (e: any) {
        return { test_id: 'mem_cold_readable', test_name: 'Cold memory tier is readable', status: 'error', duration_ms: Date.now() - start, details: e.message };
      }
    },
  },
  {
    id: 'events_writable',
    name: 'Brain events stream is writable',
    category: 'data_integrity',
    run: async () => {
      const start = Date.now();
      try {
        const { error } = await supabase.from('brain_events').insert({
          module: 'system',
          event_type: 'regression_test_probe',
          data: { probe: true, timestamp: new Date().toISOString() } as any,
          outcome: 'success',
        });
        return {
          test_id: 'events_writable',
          test_name: 'Brain events stream is writable',
          status: error ? 'failed' : 'passed',
          duration_ms: Date.now() - start,
          details: error?.message,
        };
      } catch (e: any) {
        return { test_id: 'events_writable', test_name: 'Brain events stream is writable', status: 'error', duration_ms: Date.now() - start, details: e.message };
      }
    },
  },
  {
    id: 'evolution_proposals_readable',
    name: 'Evolution proposals table accessible',
    category: 'module',
    run: async () => {
      const start = Date.now();
      try {
        const { error } = await supabase
          .from('evolution_proposals')
          .select('id')
          .limit(1);
        return {
          test_id: 'evolution_proposals_readable',
          test_name: 'Evolution proposals table accessible',
          status: error ? 'failed' : 'passed',
          duration_ms: Date.now() - start,
          details: error?.message,
        };
      } catch (e: any) {
        return { test_id: 'evolution_proposals_readable', test_name: 'Evolution proposals table accessible', status: 'error', duration_ms: Date.now() - start, details: e.message };
      }
    },
  },
  {
    id: 'modules_health_events',
    name: 'Recent module health events exist',
    category: 'health',
    run: async () => {
      const start = Date.now();
      try {
        const { data, error } = await supabase
          .from('brain_events')
          .select('id')
          .gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
          .limit(1);
        const hasEvents = data && data.length > 0;
        return {
          test_id: 'modules_health_events',
          test_name: 'Recent module health events exist',
          status: error ? 'failed' : hasEvents ? 'passed' : 'failed',
          duration_ms: Date.now() - start,
          details: error?.message || (!hasEvents ? 'No events in last 24h — modules may be inactive' : undefined),
        };
      } catch (e: any) {
        return { test_id: 'modules_health_events', test_name: 'Recent module health events exist', status: 'error', duration_ms: Date.now() - start, details: e.message };
      }
    },
  },
  {
    id: 'graph_nodes_accessible',
    name: 'Knowledge graph nodes accessible',
    category: 'data_integrity',
    run: async () => {
      const start = Date.now();
      try {
        const { error } = await supabase
          .from('brain_graph_nodes')
          .select('id')
          .limit(1);
        return {
          test_id: 'graph_nodes_accessible',
          test_name: 'Knowledge graph nodes accessible',
          status: error ? 'failed' : 'passed',
          duration_ms: Date.now() - start,
          details: error?.message,
        };
      } catch (e: any) {
        return { test_id: 'graph_nodes_accessible', test_name: 'Knowledge graph nodes accessible', status: 'error', duration_ms: Date.now() - start, details: e.message };
      }
    },
  },
  {
    id: 'memories_table_accessible',
    name: 'Brain memories table accessible',
    category: 'memory',
    run: async () => {
      const start = Date.now();
      try {
        const { error } = await supabase
          .from('brain_memories')
          .select('id')
          .limit(1);
        return {
          test_id: 'memories_table_accessible',
          test_name: 'Brain memories table accessible',
          status: error ? 'failed' : 'passed',
          duration_ms: Date.now() - start,
          details: error?.message,
        };
      } catch (e: any) {
        return { test_id: 'memories_table_accessible', test_name: 'Brain memories table accessible', status: 'error', duration_ms: Date.now() - start, details: e.message };
      }
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// SUITE RUNNER
// ═══════════════════════════════════════════════════════════════

/**
 * Run the full regression test suite
 */
export async function runRegressionSuite(
  trigger: string,
  options?: { categories?: RegressionTest['category'][] }
): Promise<RegressionSuiteResult> {
  const suiteId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const start = Date.now();

  const testsToRun = options?.categories
    ? SMOKE_TESTS.filter(t => options.categories!.includes(t.category))
    : SMOKE_TESTS;

  const results: TestResult[] = [];

  for (const test of testsToRun) {
    try {
      const result = await test.run();
      results.push(result);
    } catch (e: any) {
      results.push({
        test_id: test.id,
        test_name: test.name,
        status: 'error',
        duration_ms: 0,
        details: `Unhandled: ${e.message}`,
      });
    }
  }

  const completedAt = new Date().toISOString();
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const errors = results.filter(r => r.status === 'error').length;
  const skipped = results.filter(r => r.status === 'skipped').length;

  const verdict: RegressionSuiteResult['verdict'] =
    failed === 0 && errors === 0 ? 'clean' :
    failed > 0 ? 'regression_detected' : 'unstable';

  const suiteResult: RegressionSuiteResult = {
    suite_id: suiteId,
    trigger,
    started_at: startedAt,
    completed_at: completedAt,
    duration_ms: Date.now() - start,
    total: results.length,
    passed,
    failed,
    skipped,
    errors,
    results,
    verdict,
  };

  // Persist suite result
  await supabase.from('brain_events').insert({
    module: 'system',
    event_type: 'regression_suite',
    data: {
      suite_id: suiteId,
      trigger,
      total: results.length,
      passed,
      failed,
      errors,
      verdict,
      duration_ms: suiteResult.duration_ms,
    } as any,
    outcome: verdict === 'clean' ? 'success' : 'failure',
  });

  return suiteResult;
}

/**
 * Quick health smoke test (just critical checks)
 */
export async function quickSmokeTest(): Promise<{ ok: boolean; failures: string[] }> {
  const criticalTests = SMOKE_TESTS.filter(t =>
    ['mem_hot_readable', 'events_writable', 'memories_table_accessible'].includes(t.id)
  );

  const failures: string[] = [];
  for (const test of criticalTests) {
    const result = await test.run();
    if (result.status !== 'passed') {
      failures.push(`${test.name}: ${result.details || result.status}`);
    }
  }

  return { ok: failures.length === 0, failures };
}

/** Get registered test count */
export function getTestCount(): number {
  return SMOKE_TESTS.length;
}

/** List all test IDs and names */
export function listTests(): Array<{ id: string; name: string; category: string }> {
  return SMOKE_TESTS.map(t => ({ id: t.id, name: t.name, category: t.category }));
}
