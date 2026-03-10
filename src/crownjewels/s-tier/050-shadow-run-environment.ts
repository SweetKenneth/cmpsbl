/**
 * S-Tier 050 — Shadow Run Environment
 * CJPI: 93 | Node: EVOLUTION | ID: S-124
 *
 * Creates isolated sandbox environments for testing mutations
 * before they're applied to the live substrate.
 */

export interface ShadowRun {
  id: string;
  mutationId: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'cancelled';
  startedAt: number | null;
  completedAt: number | null;
  assertions: ShadowAssertion[];
  logs: string[];
}

export interface ShadowAssertion {
  label: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

const runs = new Map<string, ShadowRun>();
let runSeq = 0;

export function createShadowRun(mutationId: string): ShadowRun {
  const run: ShadowRun = {
    id: `shadow-${++runSeq}-${Date.now().toString(36)}`,
    mutationId,
    status: 'pending',
    startedAt: null,
    completedAt: null,
    assertions: [],
    logs: [],
  };
  runs.set(run.id, run);
  return run;
}

export function startRun(runId: string): void {
  const run = runs.get(runId);
  if (!run) throw new Error(`Shadow run ${runId} not found`);
  run.status = 'running';
  run.startedAt = Date.now();
}

export function addAssertion(runId: string, label: string, expected: unknown, actual: unknown): void {
  const run = runs.get(runId);
  if (!run) throw new Error(`Shadow run ${runId} not found`);
  run.assertions.push({ label, passed: JSON.stringify(expected) === JSON.stringify(actual), expected, actual });
}

export function addLog(runId: string, message: string): void {
  const run = runs.get(runId);
  if (run) run.logs.push(`[${new Date().toISOString()}] ${message}`);
}

export function completeRun(runId: string): ShadowRun {
  const run = runs.get(runId);
  if (!run) throw new Error(`Shadow run ${runId} not found`);
  run.completedAt = Date.now();
  run.status = run.assertions.every(a => a.passed) ? 'passed' : 'failed';
  return run;
}

export function getRun(runId: string): ShadowRun | null {
  return runs.get(runId) ?? null;
}

export function listRuns(status?: ShadowRun['status']): ShadowRun[] {
  const all = [...runs.values()];
  return status ? all.filter(r => r.status === status) : all;
}
